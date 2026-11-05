import { requireRole } from '../../_shared/auth.js';
import { error, isSameOrigin, json, safeString, uuid } from '../../_shared/http.js';

export async function onRequestDelete({ request, env, params }) {
  if (!isSameOrigin(request)) return error('Cross-origin request rejected.', 403);
  if (!env.DB) return error('Services database is not configured.', 503);
  const access = await requireRole(request, env, ['admin']);
  if (access.response) return access.response;
  const id = safeString(params.id, 80);
  const result = await env.DB.prepare("UPDATE services SET status = 'paused' WHERE id = ?").bind(id).run();
  if (!result.meta?.changes) return error('Service not found.', 404);
  await env.DB.prepare('INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)')
    .bind(uuid(), access.user.id, 'service_paused', 'service', id).run();
  return json({ id, status: 'paused' });
}