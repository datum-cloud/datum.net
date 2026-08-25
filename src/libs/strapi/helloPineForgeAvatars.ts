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

const PINE_FORGE_AVATAR_MAP_CACHE_KEY = 'strapi-hello-pine-forge-avatars';
const PINE_FORGE_SUFFIX = '-pine-forge';

interface StrapiUploadFileRow {
  name: string;
  url: string;
}

/** `"jacob-smith-pine-forge.png"` → `"jacob-smith"`; `null` if it's not a pine-forge file. */
function slugFromFileName(fileName: string): string | null {
  const base = fileName.replace(/\.[^./]+$/, '').toLowerCase();
  if (!base.endsWith(PINE_FORGE_SUFFIX)) return null;
  return base.slice(0, -PINE_FORGE_SUFFIX.length);
}

/** Fetch every "-pine-forge" media file once and index by author slug. */
async function fetchPineForgeAvatarMap(): Promise<Record<string, string> | null> {
  if (!config.token) return null;

  try {
    const response = await fetch(
      `${config.url}/api/upload/files?filters[name][$containsi]=${PINE_FORGE_SUFFIX}&pagination[pageSize]=200`,
      { headers: { Authorization: `Bearer ${config.token}` } }
    );
    if (!response.ok) return null;

    const files: StrapiUploadFileRow[] = await response.json();
    const map: Record<string, string> = {};
    for (const file of files) {
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
