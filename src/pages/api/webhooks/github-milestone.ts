// src/pages/api/webhooks/github-milestone.ts
/**
 * GitHub → datum.net webhook endpoint.
 *
 * Listens for `milestone` events on datum-cloud/enhancements (configured as a
 * repo webhook there) and force-regenerates the roadmap cache so status
 * changes (e.g. closing a milestone) show up on /roadmap and /roadmap.md
 * without waiting for the 30-min TTL.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { verifyGitHubWebhookSignature } from '@libs/githubWebhookAuth';
import { forceRegenerateGitHubRoadmaps } from '@libs/githubRoadmap';

const EXPECTED_REPO = 'datum-cloud/enhancements';

/** Milestone actions that change what's shown on the roadmap. */
const RELEVANT_ACTIONS = new Set(['created', 'closed', 'opened', 'edited', 'deleted']);

interface MilestoneWebhookPayload {
  action?: string;
  repository?: { full_name?: string };
}

export const POST: APIRoute = async ({ request }) => {
  // Fail closed: reject if the secret isn't configured, rather than silently
  // skipping verification and leaving this cache-purge endpoint open.
  if (!process.env.GITHUB_WEBHOOK_SECRET) {
    console.error('[github-webhook] GITHUB_WEBHOOK_SECRET is not configured — rejecting request');
    return new Response(JSON.stringify({ ok: false, error: 'Webhook secret not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rawBody = await request.text();

  if (!verifyGitHubWebhookSignature(request, rawBody)) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (request.headers.get('X-GitHub-Event') !== 'milestone') {
    return new Response(JSON.stringify({ ok: true, skipped: 'not a milestone event' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: MilestoneWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as MilestoneWebhookPayload;
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (payload.repository?.full_name !== EXPECTED_REPO) {
    return new Response(JSON.stringify({ ok: true, skipped: 'unexpected repository' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!payload.action || !RELEVANT_ACTIONS.has(payload.action)) {
    return new Response(
      JSON.stringify({ ok: true, skipped: `ignored action "${payload.action}"` }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const items = await forceRegenerateGitHubRoadmaps();
    return new Response(JSON.stringify({ ok: true, regenerated: items.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[github-webhook] Failed to regenerate roadmap cache:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
