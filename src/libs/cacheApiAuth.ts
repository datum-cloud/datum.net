// src/libs/cacheApiAuth.ts

import crypto from 'node:crypto';

/**
 * Verifies X-Webhook-Secret against STRAPI_WEBHOOK_SECRET for cache API routes.
 */
export function verifyCacheApiSecret(request: Request): boolean {
  const webhookSecret = process.env.STRAPI_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return false;
  }

  const receivedSecret = request.headers.get('X-Webhook-Secret');

  if (!receivedSecret) {
    return false;
  }

  const expected = Buffer.from(webhookSecret);
  const received = Buffer.from(receivedSecret);

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}
