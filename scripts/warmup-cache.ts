#!/usr/bin/env tsx

/**
 * Cache warmup script — pre-populates .cache/*.json before build.
 *
 * Fetches from GitHub (stargazer/roadmaps/changelogs), and Strapi,
 * then writes to .cache/ so the build can use cached data instead of hitting APIs.
 *
 * Run: npm run build:cache (or tsx scripts/warmup-cache.ts)
 * Env: STRAPI_URL, STRAPI_TOKEN, APP_ID, APP_PRIVATE_KEY, APP_INSTALLATION_ID
 */

import { loadEnv } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Load .env into process.env so libs can read it
const env = loadEnv(process.env.NODE_ENV || 'development', projectRoot, '');
Object.assign(process.env, env);

async function warmup(): Promise<void> {
  console.log('[warmup-cache] Starting cache warmup...\n');

  // Stargazer / GitHub (datum.ts)
  try {
    const { stargazerCount, roadmaps, changelogs } = await import('../src/libs/datum');
    const stars = await stargazerCount();
    const roadmapList = await roadmaps();
    const changelogList = await changelogs();
    console.log(
      `[warmup-cache] Stargazer: ${stars} stars, ${roadmapList.length} roadmaps, ${changelogList.length} changelogs`
    );
  } catch (err) {
    console.warn(
      '[warmup-cache] Stargazer/GitHub failed:',
      err instanceof Error ? err.message : err
    );
  }

  // Strapi: articles, authors, team, roadmaps
  try {
    const {
      fetchStrapiArticles,
      fetchStrapiArticleBySlug,
      fetchStrapiAuthors,
      getStrapiTeamMembers,
      fetchStrapiRoadmaps,
    } = await import('../src/libs/strapi/index');

    const articles = await fetchStrapiArticles();
    console.log(`[warmup-cache] Strapi: ${articles.length} articles`);

    const latest = [...articles]
      .sort((a, b) => {
        const da = a.originalPublishedAt ? new Date(a.originalPublishedAt).getTime() : 0;
        const db = b.originalPublishedAt ? new Date(b.originalPublishedAt).getTime() : 0;
        return db - da;
      })
      .slice(0, 5);
    for (const a of latest) {
      await fetchStrapiArticleBySlug(a.slug);
    }
    console.log(`[warmup-cache] Strapi: cached 5 latest article details`);

    await fetchStrapiAuthors();
    await getStrapiTeamMembers();
    const strapiRoadmaps = await fetchStrapiRoadmaps();
    console.log(`[warmup-cache] Strapi: authors, team, ${strapiRoadmaps.length} roadmaps`);
  } catch (err) {
    console.warn('[warmup-cache] Strapi failed:', err instanceof Error ? err.message : err);
  }

  console.log('\n[warmup-cache] Done.');
}

warmup().catch((err) => {
  console.error('[warmup-cache] Fatal:', err);
  process.exit(1);
});
