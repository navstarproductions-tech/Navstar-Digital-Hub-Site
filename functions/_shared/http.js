export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

export function error(message, status = 400) {
  return json({ error: message }, status);
}

export function isSameOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function readJson(request, maxBytes = 32768) {
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > maxBytes) throw new Error('Request is too large.');
  const value = await request.json();
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid request body.');
  return value;
}

export function normalizePhone(value) {
  const compact = String(value ?? '').replace(/[\s()-]/g, '');
  if (/^0[17]\d{8}$/.test(compact)) return `254${compact.slice(1)}`;
  if (/^\+?254[17]\d{8}$/.test(compact)) return compact.replace(/^\+/, '');
  return '';
}

export function safeString(value, maxLength = 200) {
  return String(value ?? '').trim().slice(0, maxLength);
}

export function constantTimeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}

export function uuid() {
  return crypto.randomUUID();
}