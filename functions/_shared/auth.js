import { error } from './http.js';

const cookieName = '__Host-navstar_session';
const sessionSeconds = 60 * 60 * 8;

function toBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sha256(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password, salt = toBase64Url(crypto.getRandomValues(new Uint8Array(16)))) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const base64Salt = salt.replace(/-/g, '+').replace(/_/g, '/');
  const paddedSalt = base64Salt + '='.repeat((4 - base64Salt.length % 4) % 4);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: Uint8Array.from(atob(paddedSalt), (char) => char.charCodeAt(0)), iterations: 210000, hash: 'SHA-256' }, key, 256);
  return { salt, hash: toBase64Url(new Uint8Array(bits)) };
}

export async function verifyPassword(password, salt, expected) {
  const result = await hashPassword(password, salt);
  return result.hash === expected;
}

export async function createSession(env, userId) {
  const token = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + sessionSeconds * 1000).toISOString();
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').bind(tokenHash, userId, expiresAt).run();
  return `${cookieName}=${token}; Path=/; Max-Age=${sessionSeconds}; HttpOnly; Secure; SameSite=Strict`;
}

function getCookie(request, name) {
  const value = request.headers.get('Cookie') ?? '';
  for (const item of value.split(';')) {
    const [key, ...parts] = item.trim().split('=');
    if (key === name) return parts.join('=');
  }
  return '';
}

export async function getSession(request, env) {
  const token = getCookie(request, cookieName);
  if (!token || !env.DB) return null;
  const tokenHash = await sha256(token);
  return env.DB.prepare(`
    SELECT users.id, users.name, users.email, users.role, users.must_change_password AS mustChangePassword
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ? AND users.status = 'active'
  `).bind(tokenHash, new Date().toISOString()).first();
}

export async function requireRole(request, env, allowedRoles) {
  const user = await getSession(request, env);
  if (!user) return { response: error('Sign in required.', 401) };
  if (user.mustChangePassword) return { response: error('Change your temporary password before using this portal.', 403) };
  if (!allowedRoles.includes(user.role)) return { response: error('Insufficient permissions.', 403) };
  return { user };
}

export async function deleteSession(request, env) {
  const token = getCookie(request, cookieName);
  if (token && env.DB) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  return `${cookieName}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

export function cookieNameForSession() {
  return cookieName;
}