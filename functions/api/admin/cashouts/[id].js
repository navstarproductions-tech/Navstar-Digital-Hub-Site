import { requireRole } from '../../../_shared/auth.js';
import { error, isSameOrigin, json, readJson, safeString, uuid } from '../../../_shared/http.js';

export async function onRequestPatch({ request, env, params }) {
  if (!isSameOrigin(request)) return error('Cross-origin request rejected.', 403);
  if (!env.DB) return error('Cashout requests are not configured.', 503);
  const access = await requireRole(request, env, ['admin', 'principal']);
  if (access.response) return access.response;
  let body;
  try { body = await readJson(request, 4096); } catch { return error('Invalid request body.'); }
  const status = safeString(body.status, 20);
  if (!['approved', 'rejected'].includes(status)) return error('Cashout can only be approved or rejected.');
  const result = await env.DB.prepare(`
    UPDATE cashout_requests SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'pending_approval'
  `).bind(status, access.user.id, params.id).run();
  if (!result.meta?.changes) return error('Pending cashout request not found.', 404);
  await env.DB.prepare('INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)')
    .bind(uuid(), access.user.id, `cashout_${status}`, 'cashout', params.id).run();
  return json({ id: params.id, status });
}