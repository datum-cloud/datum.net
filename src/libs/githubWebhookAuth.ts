// src/libs/githubWebhookAuth.ts

import crypto from 'node:crypto';

/**
 * Verifies the `X-Hub-Signature-256` header GitHub sends on webhook deliveries.
 * GitHub signs the raw request body with HMAC-SHA256 using the configured
 * webhook secret — unlike the plain shared-secret check in `cacheApiAuth.ts`,
 * so it needs its own verifier.
 */
export function verifyGitHubWebhookSignature(request: Request, rawBody: string): boolean {
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!webhookSecret) return false;

  const signatureHeader = request.headers.get('X-Hub-Signature-256');
  if (!signatureHeader) return false;

  const expectedSignature =
    'sha256=' + crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(signatureHeader);

  if (expected.length !== received.length) return false;

  return crypto.timingSafeEqual(expected, received);
}
