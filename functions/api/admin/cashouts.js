import { requireRole } from '../../_shared/auth.js';
import { error, isSameOrigin, json, readJson, uuid } from '../../_shared/http.js';

export async function onRequestGet({ request, env }) {
  if (!env.DB) return error('Cashout requests are not configured.', 503);
  const access = await requireRole(request, env, ['admin', 'principal']);
  if (access.response) return access.response;
  const rows = await env.DB.prepare(`
    SELECT cashout_requests.id, cashout_requests.amount, cashout_requests.status,
      cashout_requests.created_at, users.name AS requested_by
    FROM cashout_requests JOIN users ON users.id = cashout_requests.requested_by
    ORDER BY cashout_requests.created_at DESC LIMIT 100
  `).all();
  return json({ requests: rows.results ?? [] });
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return error('Cross-origin request rejected.', 403);
  if (!env.DB) return error('Cashout requests are not configured.', 503);
  const access = await requireRole(request, env, ['admin', 'principal']);
  if (access.response) return access.response;
  let body;
  try { body = await readJson(request, 4096); } catch { return error('Invalid request body.'); }
  const amount = Number(body.amount);
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1000000) return error('Enter a valid cashout amount.');
  const id = uuid();
  await env.DB.prepare('INSERT INTO cashout_requests (id, requested_by, amount) VALUES (?, ?, ?)').bind(id, access.user.id, amount).run();
  await env.DB.prepare('INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)')
    .bind(uuid(), access.user.id, 'cashout_requested', 'cashout', id).run();
  return json({ id, status: 'pending_approval', amount }, 201);
}