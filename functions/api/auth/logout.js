import { deleteSession } from '../../_shared/auth.js';
import { error, isSameOrigin, json } from '../../_shared/http.js';

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return error('Cross-origin request rejected.', 403);
  if (!env.DB) return error('Authentication service is not configured.', 503);
  const cookie = await deleteSession(request, env);
  return json({ signedOut: true }, 200, { 'Set-Cookie': cookie });
}