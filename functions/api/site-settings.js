import { error, json } from '../_shared/http.js';

const defaults = { schoolName: 'NAVSTAR DIGITAL HUB', contactEmail: '', contactPhone: '', address: '', logoAssetId: '' };

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ settings: defaults });
  const row = await env.DB.prepare("SELECT value FROM system_state WHERE key = 'site-settings'").first();
  if (!row?.value) return json({ settings: defaults });
  try {
    return json({ settings: { ...defaults, ...JSON.parse(row.value) } });
  } catch {
    return error('Site settings could not be loaded.', 500);
  }
}