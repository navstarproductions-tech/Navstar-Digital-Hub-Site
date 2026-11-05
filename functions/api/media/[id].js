import { error } from '../../_shared/http.js';

export async function onRequestGet({ env, params }) {
  if (!env.DB || !env.MEDIA) return error('Media storage is not configured.', 503);
  const asset = await env.DB.prepare('SELECT object_key, mime_type FROM media_assets WHERE id = ?').bind(params.id).first();
  if (!asset || !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(asset.mime_type)) return error('Image not found.', 404);
  const object = await env.MEDIA.get(asset.object_key);
  if (!object) return error('Image not found.', 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Content-Type', asset.mime_type);
  headers.set('Cache-Control', 'public, max-age=3600');
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(object.body, { headers });
}