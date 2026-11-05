import { createSession, hashPassword, sha256, verifyPassword } from '../../_shared/auth.js';
import { error, isSameOrigin, json, readJson, safeString, uuid } from '../../_shared/http.js';

const roles = ['student', 'tutor', 'admissions', 'principal', 'admin'];

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return error('Cross-origin request rejected.', 403);
  if (!env.DB) return error('Authentication service is not configured.', 503);

  let body;
  try { body = await readJson(request, 4096); } catch { return error('Invalid request body.'); }
  const email = safeString(body.email, 254).toLowerCase();
  const password = String(body.password ?? '');
  const requestedRole = safeString(body.role, 24);
  if (!email.includes('@') || password.length < 10 || password.length > 200 || !roles.includes(requestedRole)) {
    return error('Invalid email, password, or portal.', 400);
  }

  const emailHash = await sha256(email);
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const ipHash = await sha256(ip);
  const attempt = await env.DB.prepare(`
    SELECT COUNT(*) AS count FROM login_attempts
    WHERE email_hash = ? AND ip_hash = ? AND datetime(created_at) > datetime('now', '-15 minutes')
  `).bind(emailHash, ipHash).first();
  if (Number(attempt?.count ?? 0) >= 8) return error('Too many sign-in attempts. Try again later.', 429);

  const user = await env.DB.prepare('SELECT id, name, email, role, password_hash, password_salt, must_change_password FROM users WHERE email = ? AND status = ?')
    .bind(email, 'active').first();
  const valid = user && user.role === requestedRole && await verifyPassword(password, user.password_salt, user.password_hash);
  if (!valid) {
    await env.DB.prepare('INSERT INTO login_attempts (id, email_hash, ip_hash) VALUES (?, ?, ?)').bind(uuid(), emailHash, ipHash).run();
    return error('Email, password, or portal is incorrect.', 401);
  }

  await env.DB.prepare('DELETE FROM login_attempts WHERE email_hash = ? AND ip_hash = ?').bind(emailHash, ipHash).run();
  const cookie = await createSession(env, user.id);
  return json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, mustChangePassword: Boolean(user.must_change_password) } }, 200, { 'Set-Cookie': cookie });
}