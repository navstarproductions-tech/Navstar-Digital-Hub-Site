import { hashPassword, requireRole } from '../../_shared/auth.js';
import { error, isSameOrigin, json, readJson, safeString, uuid } from '../../_shared/http.js';

const roles = ['student', 'tutor', 'admissions', 'principal', 'admin'];

function temporaryPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function onRequestGet({ request, env }) {
  if (!env.DB) return error('User service is not configured.', 503);
  const access = await requireRole(request, env, ['admin', 'principal']);
  if (access.response) return access.response;
  const users = await env.DB.prepare('SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC LIMIT 200').all();
  return json({ users: users.results ?? [] });
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return error('Cross-origin request rejected.', 403);
  if (!env.DB) return error('User service is not configured.', 503);
  const access = await requireRole(request, env, ['admin']);
  if (access.response) return access.response;
  let body;
  try { body = await readJson(request, 4096); } catch { return error('Invalid request body.'); }
  const name = safeString(body.name, 120);
  const email = safeString(body.email, 254).toLowerCase();
  const role = safeString(body.role, 24);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !roles.includes(role)) return error('Valid name, email, and portal role are required.');

  const id = uuid();
  const password = temporaryPassword();
  const hashed = await hashPassword(password);
  try {
    await env.DB.prepare('INSERT INTO users (id, name, email, role, password_hash, password_salt, must_change_password) VALUES (?, ?, ?, ?, ?, ?, 1)')
      .bind(id, name, email, role, hashed.hash, hashed.salt).run();
  } catch {
    return error('An account with this email already exists.', 409);
  }
  await env.DB.prepare('INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)')
    .bind(uuid(), access.user.id, 'user_created', 'user', id).run();
  return json({ user: { id, name, email, role, status: 'active' }, temporaryPassword: password, mustChangePassword: true }, 201);
}