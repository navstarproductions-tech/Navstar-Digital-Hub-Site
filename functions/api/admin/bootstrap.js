import { hashPassword } from '../../_shared/auth.js';
import { constantTimeEqual, error, isSameOrigin, json, readJson, safeString, uuid } from '../../_shared/http.js';
import { rateLimited } from '../../_shared/rate-limit.js';

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return error('Cross-origin request rejected.', 403);
  if (!env.DB || !env.BOOTSTRAP_TOKEN) return error('Admin bootstrap is not configured.', 503);
  if (await rateLimited(env.DB, request, 'admin-bootstrap', { maximum: 3, minutes: 60 })) return error('Setup limit reached. Try again later.', 429);
  const provided = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (provided.length < 32 || !constantTimeEqual(provided, env.BOOTSTRAP_TOKEN)) return error('Not found.', 404);

  let body;
  try { body = await readJson(request, 4096); } catch { return error('Invalid request body.'); }
  const name = safeString(body.name, 120);
  const email = safeString(body.email, 254).toLowerCase();
  const password = String(body.password ?? '');
  if (name.length < 2 || !email.includes('@') || password.length < 14 || password.length > 200) {
    return error('Name, valid email, and a password of at least 14 characters are required.');
  }

  const existing = await env.DB.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'").first();
  if (Number(existing?.count ?? 0) > 0) return error('An administrator already exists.', 409);
  const lock = await env.DB.prepare("INSERT INTO system_state (key, value) VALUES ('admin-bootstrap-used', '1') ON CONFLICT(key) DO NOTHING").run();
  if (!lock.meta?.changes) return error('Admin setup has already been used.', 409);
  const passwordRecord = await hashPassword(password);
  const id = uuid();
  await env.DB.prepare(`
    INSERT INTO users (id, name, email, role, password_hash, password_salt)
    VALUES (?, ?, ?, 'admin', ?, ?)
  `).bind(id, name, email, passwordRecord.hash, passwordRecord.salt).run();
  await env.DB.prepare('INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)')
    .bind(uuid(), id, 'bootstrap_admin_created', 'user', id).run();
  return json({ created: true, userId: id }, 201);
}