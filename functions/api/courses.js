import { requireRole } from '../_shared/auth.js';
import { error, isSameOrigin, json, readJson, safeString, uuid } from '../_shared/http.js';

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ courses: [] });
  const rows = await env.DB.prepare("SELECT id, title, description, duration, image_url AS image, category, price, status FROM courses WHERE status = 'active' ORDER BY title").all();
  return json({ courses: rows.results ?? [] });
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return error('Cross-origin request rejected.', 403);
  if (!env.DB) return error('Course database is not configured.', 503);
  const access = await requireRole(request, env, ['admin']);
  if (access.response) return access.response;
  let body;
  try { body = await readJson(request, 4096); } catch { return error('Invalid request body.'); }
  const title = safeString(body.title, 120);
  const description = safeString(body.description, 1000);
  const duration = safeString(body.duration, 80);
  const image = safeString(body.image, 500);
  const category = safeString(body.category, 60) || 'Professional';
  const price = Number(body.price);
  if (title.length < 2 || !Number.isSafeInteger(price) || price < 0 || price > 1000000) return error('Valid course title and fee are required.');
  const id = uuid();
  await env.DB.prepare("INSERT INTO courses (id, title, description, duration, image_url, category, price, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')")
    .bind(id, title, description, duration, image, category, price).run();
  await env.DB.prepare('INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)')
    .bind(uuid(), access.user.id, 'course_created', 'course', id).run();
  return json({ id, title, description, duration, image, category, price, status: 'active' }, 201);
}