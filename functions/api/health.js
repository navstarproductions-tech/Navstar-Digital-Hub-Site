import { json } from '../_shared/http.js';

export function onRequestGet({ env }) {
  return json({
    status: 'ok',
    databaseConfigured: Boolean(env.DB),
    darajaConfigured: Boolean(env.DARAJA_CONSUMER_KEY && env.DARAJA_CONSUMER_SECRET && env.DARAJA_PASSKEY && env.DARAJA_SHORTCODE && env.DARAJA_CALLBACK_TOKEN),
    environment: env.DARAJA_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
  });
}