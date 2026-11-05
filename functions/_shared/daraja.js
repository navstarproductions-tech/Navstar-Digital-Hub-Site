import { normalizePhone } from './http.js';

export function darajaReady(env) {
  return Boolean(env.DARAJA_CONSUMER_KEY && env.DARAJA_CONSUMER_SECRET && env.DARAJA_PASSKEY && env.DARAJA_SHORTCODE && env.DARAJA_CALLBACK_TOKEN && env.APP_ORIGIN);
}

function darajaHost(env) {
  return env.DARAJA_ENVIRONMENT === 'production' ? 'api.safaricom.co.ke' : 'sandbox.safaricom.co.ke';
}

function formatTimestamp(date = new Date(Date.now() + 3 * 60 * 60 * 1000)) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`;
}

async function getAccessToken(env) {
  const authorization = btoa(`${env.DARAJA_CONSUMER_KEY}:${env.DARAJA_CONSUMER_SECRET}`);
  const response = await fetch(`https://${darajaHost(env)}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${authorization}` },
    signal: AbortSignal.timeout(10000),
  });
  const body = await response.json();
  if (!response.ok || !body.access_token) throw new Error('Payment provider authentication failed.');
  return body.access_token;
}

export async function startStkPush(env, { phone, amount, accountReference, description }) {
  if (!darajaReady(env)) throw new Error('Daraja is not configured on the backend.');
  const normalizedPhone = normalizePhone(phone);
  const value = Number(amount);
  if (!normalizedPhone || !Number.isInteger(value) || value < 1 || value > 150000) throw new Error('Invalid phone number or amount.');

  const timestamp = formatTimestamp();
  const shortcode = String(env.DARAJA_SHORTCODE);
  const password = btoa(`${shortcode}${env.DARAJA_PASSKEY}${timestamp}`);
  const callbackUrl = new URL('/api/payments/callback', env.APP_ORIGIN);
  callbackUrl.searchParams.set('token', env.DARAJA_CALLBACK_TOKEN);
  const accessToken = await getAccessToken(env);
  const response = await fetch(`https://${darajaHost(env)}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: env.DARAJA_TRANSACTION_TYPE || 'CustomerPayBillOnline',
      Amount: value,
      PartyA: normalizedPhone,
      PartyB: shortcode,
      PhoneNumber: normalizedPhone,
      CallBackURL: callbackUrl.toString(),
      AccountReference: String(accountReference).slice(0, 12),
      TransactionDesc: String(description).slice(0, 13),
    }),
    signal: AbortSignal.timeout(15000),
  });
  const body = await response.json();
  if (!response.ok || body.ResponseCode !== '0' || !body.CheckoutRequestID) {
    throw new Error('The payment provider did not accept the prompt request.');
  }
  return {
    merchantRequestId: body.MerchantRequestID,
    checkoutRequestId: body.CheckoutRequestID,
    customerMessage: body.CustomerMessage ?? 'Check your phone for the payment prompt.',
    phone: normalizedPhone,
    amount: value,
  };
}