import { sha256 } from './auth.js';
import { uuid } from './http.js';

export async function rateLimited(db, request, scope, { maximum = 10, minutes = 10 } = {}) {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const keyHash = await sha256(ip);
  const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();
  const recent = await db.prepare('SELECT COUNT(*) AS count FROM api_rate_limits WHERE scope = ? AND key_hash = ? AND datetime(created_at) > datetime(?)')
    .bind(scope, keyHash, cutoff).first();
  if (Number(recent?.count ?? 0) >= maximum) return true;
  await db.prepare('INSERT INTO api_rate_limits (id, scope, key_hash) VALUES (?, ?, ?)').bind(uuid(), scope, keyHash).run();
  await db.prepare('DELETE FROM api_rate_limits WHERE datetime(created_at) < datetime(?)').bind(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).run();
  return false;
}