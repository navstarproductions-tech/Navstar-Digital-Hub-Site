import { requireRole } from '../../_shared/auth.js';
import { error, isSameOrigin, json, readJson, safeString } from '../../_shared/http.js';

const defaults = {
  schoolName: 'NAVSTAR DIGITAL HUB',
  contactEmail: '',
  contactPhone: '',
  address: '',
  logoAssetId: '',
};

export async function onRequestGet({ request, env }) {
  if (!env.DB) return error('Settings database is not configured.', 503);
  const access = await requireRole(request, env, ['admin', 'principal']);
  if (access.response) return access.response;
  const row = await env.DB.prepare("SELECT value FROM system_state WHERE key = 'site-settings'").first();
  let settings = defaults;
  if (row?.value) {
    try { settings = { ...defaults, ...JSON.parse(row.value) }; } catch { settings = defaults; }
  }
  return json({ settings });
}

export async function onRequestPut({ request, env }) {
  if (!isSameOrigin(request)) return error('Cross-origin request rejected.', 403);
  if (!env.DB) return error('Settings database is not configured.', 503);
  const access = await requireRole(request, env, ['admin']);
  if (access.response) return access.response;
  let body;
  try { body = await readJson(request, 8192); } catch { return error('Invalid request body.'); }
  const settings = {
    schoolName: safeString(body.schoolName, 100) || defaults.schoolName,
    contactEmail: safeString(body.contactEmail, 254).toLowerCase(),
    contactPhone: safeString(body.contactPhone, 32),
    address: safeString(body.address, 240),
    logoAssetId: safeString(body.logoAssetId, 80),
  };
  if (settings.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contactEmail)) return error('Enter a valid contact email.');
  await env.DB.prepare(`INSERT INTO system_state (key, value) VALUES ('site-settings', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value`).bind(JSON.stringify(settings)).run();
  return json({ settings });
}