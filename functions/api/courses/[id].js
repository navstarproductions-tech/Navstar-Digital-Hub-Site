import { requireRole } from '../../_shared/auth.js';
import { error, isSameOrigin, json, safeString, uuid } from '../../_shared/http.js';

export async function onRequestDelete({ request, env, params }) {
  if (!isSameOrigin(request)) return error('Cross-origin request rejected.', 403);
  if (!env.DB) return error('Course database is not configured.', 503);
  const access = await requireRole(request, env, ['admin']);
  if (access.response) return access.response;
  const id = safeString(params.id, 80);
  const result = await env.DB.prepare("UPDATE courses SET status = 'archived' WHERE id = ? AND status = 'active'").bind(id).run();
  if (!result.meta?.changes) return error('Active course not found.', 404);
  await env.DB.prepare('INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)')
    .bind(uuid(), access.user.id, 'course_archived', 'course', id).run();
  return json({ id, status: 'archived' });
}