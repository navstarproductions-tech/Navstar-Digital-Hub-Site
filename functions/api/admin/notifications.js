import { getSession } from '../../_shared/auth.js';
import { error, isSameOrigin, json, readJson } from '../../_shared/http.js';

export async function onRequestGet({ request, env }) {
  if (!env.DB) return error('Notifications are not configured.', 503);
  const user = await getSession(request, env);
  if (!user) return error('Sign in required.', 401);
  const rows = await env.DB.prepare('SELECT id, title, message, read_at, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').bind(user.id).all();
  return json({ notifications: rows.results ?? [] });
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return error('Cross-origin request rejected.', 403);
  if (!env.DB) return error('Notifications are not configured.', 503);
  const user = await getSession(request, env);
  if (!user) return error('Sign in required.', 401);
  let body;
  try { body = await readJson(request, 4096); } catch { return error('Invalid request body.'); }
  const ids = Array.isArray(body.ids) ? body.ids.filter((id) => typeof id === 'string').slice(0, 50) : [];
  if (!ids.length) return error('Notification IDs are required.');
  await env.DB.batch(ids.map((id) => env.DB.prepare('UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?').bind(id, user.id)));
  return json({ updated: ids.length });
}