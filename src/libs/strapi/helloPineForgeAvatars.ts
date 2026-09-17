// src/libs/strapi/helloPineForgeAvatars.ts
/**
 * /hello-only avatar resolution.
 *
 * `Author.avatar` is shared with the /about team grid, whose cards rotate
 * through a fixed background-color sequence (`getTeamBgColor`) — each
 * person's `avatar` has to stay pinned to whichever media-library variant
 * (pine-forge / canyon-clay / glacier-mist) has a backdrop matching their
 * position there. /hello wants every card on the pine-forge variant
 * regardless of that rotation, so mutating the shared `avatar` field to
 * satisfy one page breaks the other's color match.
 *
 * This resolves each person's pine-forge variant independently, straight
 * from the media library by slug, so /hello never touches `Author.avatar`.
 */
import { cache, config } from './_runtime';

const PINE_FORGE_AVATAR_MAP_CACHE_KEY = 'strapi-hello-pine-forge-avatars-v2';
const PINE_FORGE_SUFFIX = '-pine-forge';

interface StrapiUploadFileRow {
  name: string;
  url: string;
}

/**
 * `"jacob-smith-pine-forge.png"` or Strapi's
 * `"jacob_smith_pine_forge_<hash>.png"` → `"jacob-smith"`.
 */
function slugFromFileName(fileName: string): string | null {
  const base = fileName
    .replace(/\.[^./]+$/, '')
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/-[a-f0-9]{8,}$/, '');
  if (!base.endsWith(PINE_FORGE_SUFFIX)) return null;
  return base.slice(0, -PINE_FORGE_SUFFIX.length);
}

/** Fetch every pine-forge media file once and index by author slug. */
async function fetchPineForgeAvatarMap(): Promise<Record<string, string> | null> {
  if (!config.token) return null;

  try {
    const params = new URLSearchParams();
    params.set('filters[$or][0][name][$containsi]', 'pine_forge');
    params.set('filters[$or][1][name][$containsi]', 'pine-forge');
    params.set('pagination[pageSize]', '200');

    const response = await fetch(`${config.url}/api/upload/files?${params}`, {
      headers: { Authorization: `Bearer ${config.token}` },
    });
    if (!response.ok) return null;

    const files: unknown = await response.json();
    if (!Array.isArray(files)) return null;

    const map: Record<string, string> = {};
    for (const file of files as StrapiUploadFileRow[]) {
      const slug = slugFromFileName(file.name);
      if (slug) map[slug] = file.url;
    }
    return map;
  } catch {
    return null;
  }
}

/** Pine-forge avatar URL for an author slug, or `undefined` if none was uploaded. */
export async function getHelloPineForgeAvatarUrl(slug: string): Promise<string | undefined> {
  const map = await cache.getWithFallback(
    PINE_FORGE_AVATAR_MAP_CACHE_KEY,
    fetchPineForgeAvatarMap,
    {
      tags: ['authors'],
    }
  );
  return map?.[slug.toLowerCase()];
}
