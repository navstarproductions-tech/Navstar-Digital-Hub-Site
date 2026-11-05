import { requireRole } from '../../_shared/auth.js';
import { error, isSameOrigin, json, safeString, uuid } from '../../_shared/http.js';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const maxBytes = 5 * 1024 * 1024;

export async function onRequestGet({ request, env }) {
  if (!env.DB) return error('Media database is not configured.', 503);
  const access = await requireRole(request, env, ['admin', 'principal']);
  if (access.response) return access.response;
  const rows = await env.DB.prepare('SELECT id, mime_type AS mimeType, size_bytes AS sizeBytes, alt_text AS altText, created_at AS createdAt FROM media_assets ORDER BY created_at DESC LIMIT 100').all();
  return json({ media: (rows.results ?? []).map((item) => ({ ...item, url: `/api/media/${item.id}` })) });
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return error('Cross-origin request rejected.', 403);
  if (!env.DB || !env.MEDIA) return error('Media storage is not configured. Bind an R2 bucket as MEDIA.', 503);
  const access = await requireRole(request, env, ['admin']);
  if (access.response) return access.response;
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size < 1 || file.size > maxBytes) return error('Upload a PNG, JPEG, WebP, or AVIF image up to 5 MB.');
  const id = uuid();
  const objectKey = `public-media/${id}`;
  await env.MEDIA.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=3600' } });
  const altText = safeString(form.get('altText'), 160);
  await env.DB.prepare('INSERT INTO media_assets (id, object_key, mime_type, size_bytes, alt_text, created_by) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, objectKey, file.type, file.size, altText, access.user.id).run();
  await env.DB.prepare('INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)')
    .bind(uuid(), access.user.id, 'media_uploaded', 'media_asset', id).run();
  return json({ id, url: `/api/media/${id}`, altText, mimeType: file.type }, 201);
}