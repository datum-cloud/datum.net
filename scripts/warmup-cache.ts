#!/usr/bin/env tsx

/**
 * Cache warmup script — pre-populates .cache/*.json before build.
 *
 * Fetches from GitHub (stargazer/roadmaps/changelogs, Projects backlog), and Strapi,
 * then writes to .cache/ so the build can use cached data instead of hitting APIs.
 *
 * Run: npm run build:cache (or tsx scripts/warmup-cache.ts)
 * Env: STRAPI_URL, STRAPI_TOKEN, APP_ID, APP_PRIVATE_KEY, APP_INSTALLATION_ID,
 *      DATUM_SA_CLIENT_ID, DATUM_SA_PRIVATE_KEY_ID, DATUM_SA_PRIVATE_KEY, DATUM_SA_SCOPE, DATUM_PROJECT_ID
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

  // GitHub Projects backlog (roadmap/backlog page)
  try {
    const { forceRegenerateGitHubBacklog } = await import('../src/libs/githubBacklog');
    const backlogItems = await forceRegenerateGitHubBacklog();
    console.log(`[warmup-cache] GitHub backlog: ${backlogItems.length} items`);
  } catch (err) {
    console.warn('[warmup-cache] GitHub backlog failed:', err instanceof Error ? err.message : err);
  }

  // Strapi: articles, authors, team
  try {
    const {
      fetchStrapiArticles,
      fetchStrapiArticleBySlug,
      fetchStrapiAuthors,
      getStrapiTeamMembers,
    } = await import('../src/libs/strapi/index');

    const articles = await fetchStrapiArticles();
    console.log(`[warmup-cache] Strapi: ${articles.length} articles`);

    for (const a of articles) {
      await fetchStrapiArticleBySlug(a.slug);
    }
    console.log(`[warmup-cache] Strapi: cached ${articles.length} article details`);

    await fetchStrapiAuthors();
    await getStrapiTeamMembers();
    console.log(`[warmup-cache] Strapi: authors, team`);
  } catch (err) {
    console.warn('[warmup-cache] Strapi failed:', err instanceof Error ? err.message : err);
  }

  // GitHub: roadmap milestones (datum-cloud/enhancements)
  try {
    const { fetchGitHubRoadmaps } = await import('../src/libs/githubRoadmap');
    const githubRoadmaps = await fetchGitHubRoadmaps();
    console.log(`[warmup-cache] GitHub: ${githubRoadmaps.length} roadmap milestones`);
  } catch (err) {
    console.warn(
      '[warmup-cache] GitHub roadmaps failed:',
      err instanceof Error ? err.message : err
    );
  }

  // Datum Cloud Locations API (src/libs/locations.ts). getLocations() already
  // falls back to static locations.json internally and never throws, but this
  // stays wrapped like every other step here for consistency and defense in
  // depth (e.g. an import-time error, which getLocations()'s own try/catch
  // can't cover).
  try {
    const { getLocations } = await import('../src/libs/locations');
    const locations = await getLocations();
    console.log(`[warmup-cache] Locations: ${locations.length} entries`);
  } catch (err) {
    console.warn('[warmup-cache] Locations failed:', err instanceof Error ? err.message : err);
  }

  console.log('\n[warmup-cache] Done.');
}

warmup().catch((err) => {
  console.error('[warmup-cache] Fatal:', err);
  process.exit(1);
});
