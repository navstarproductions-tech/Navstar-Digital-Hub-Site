import { getSession, hashPassword, verifyPassword } from '../../_shared/auth.js';
import { error, isSameOrigin, json, readJson } from '../../_shared/http.js';

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return error('Cross-origin request rejected.', 403);
  if (!env.DB) return error('Authentication service is not configured.', 503);
  const user = await getSession(request, env);
  if (!user) return error('Sign in required.', 401);
  let body;
  try { body = await readJson(request, 4096); } catch { return error('Invalid request body.'); }
  const currentPassword = String(body.currentPassword ?? '');
  const newPassword = String(body.newPassword ?? '');
  if (newPassword.length < 14 || newPassword.length > 200) return error('New password must be at least 14 characters.');
  const record = await env.DB.prepare('SELECT password_hash, password_salt FROM users WHERE id = ?').bind(user.id).first();
  if (!record || !await verifyPassword(currentPassword, record.password_salt, record.password_hash)) return error('Current password is incorrect.', 401);
  const password = await hashPassword(newPassword);
  await env.DB.prepare('UPDATE users SET password_hash = ?, password_salt = ?, must_change_password = 0 WHERE id = ?').bind(password.hash, password.salt, user.id).run();
  await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id).run();
  return json({ changed: true, message: 'Password changed. Sign in again on your devices.' }, 200, { 'Set-Cookie': '__Host-navstar_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict' });
}