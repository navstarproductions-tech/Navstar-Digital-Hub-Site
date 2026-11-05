import { getSession, requireRole } from '../_shared/auth.js';
import { error, isSameOrigin, json, readJson, safeString, uuid } from '../_shared/http.js';

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ services: [] });
  const rows = await env.DB.prepare("SELECT id, name, category, price_label AS price, status FROM services WHERE status = 'active' ORDER BY name").all();
  return json({ services: rows.results ?? [] });
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return error('Cross-origin request rejected.', 403);
  if (!env.DB) return error('Services database is not configured.', 503);
  const access = await requireRole(request, env, ['admin']);
  if (access.response) return access.response;
  let body;
  try { body = await readJson(request, 4096); } catch { return error('Invalid request body.'); }
  const name = safeString(body.name, 120);
  const category = safeString(body.category, 60);
  const price = safeString(body.price, 80) || 'Contact us';
  if (name.length < 2 || !category) return error('Service name and category are required.');
  const id = uuid();
  await env.DB.prepare('INSERT INTO services (id, name, category, price_label) VALUES (?, ?, ?, ?)').bind(id, name, category, price).run();
  await env.DB.prepare('INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)')
    .bind(uuid(), access.user.id, 'service_created', 'service', id).run();
  return json({ id, name, category, price, status: 'active' }, 201);
}