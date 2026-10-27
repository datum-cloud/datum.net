// src/libs/strapi/teamAvatarVariants.ts
/**
 * Per-position avatar variant resolution for the /about/team grid.
 *
 * Each person is uploaded in three pre-rendered variants (`<slug>-glacier-mist`,
 * `-canyon-clay`, `-pine-forge`) whose hair/beard tones are tuned to one of the
 * three card backdrops. `Author.avatar` pins a single variant, so the backdrop
 * sequence only stays right while the roster order never changes — every hire
 * or departure shifts everyone after them out of rhythm.
 *
 * This resolves all variants per slug straight from the media library, so the
 * grid can pick the variant that matches each card's position instead.
 */
import { cache, config } from './_runtime';

const VARIANT_AVATAR_MAP_CACHE_KEY = 'strapi-team-avatar-variants-v1';

/** Variants in backdrop order: card 0 → glacier, 1 → canyon, 2 → pine, repeating. */
export const TEAM_AVATAR_VARIANTS = ['glacier-mist', 'canyon-clay', 'pine-forge'] as const;
export type TeamAvatarVariant = (typeof TEAM_AVATAR_VARIANTS)[number];

/** Backdrop colour baked to each variant's tones. */
export const TEAM_AVATAR_VARIANT_BG: Record<TeamAvatarVariant, string> = {
  'glacier-mist': '#D1CDC0',
  'canyon-clay': '#BF9595',
  'pine-forge': '#5F735E',
};

export type TeamAvatarVariantMap = Record<string, Partial<Record<TeamAvatarVariant, string>>>;

interface StrapiUploadFileRow {
  name: string;
  url: string;
}

/**
 * `"jacob-smith-pine-forge.png"` or Strapi's
 * `"jacob_smith_pine_forge_<hash>.png"` → `{ slug: "jacob-smith", variant: "pine-forge" }`.
 */
function parseFileName(fileName: string): { slug: string; variant: TeamAvatarVariant } | null {
  const base = fileName
    .replace(/\.[^./]+$/, '')
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/-[a-f0-9]{8,}$/, '');
  for (const variant of TEAM_AVATAR_VARIANTS) {
    if (base.endsWith(`-${variant}`)) {
      return { slug: base.slice(0, -(variant.length + 1)), variant };
    }
  }
  return null;
}

/** Fetch every variant media file once and index by author slug. */
async function fetchVariantAvatarMap(): Promise<TeamAvatarVariantMap | null> {
  if (!config.token) return null;

  try {
    const params = new URLSearchParams();
    TEAM_AVATAR_VARIANTS.forEach((variant, index) => {
      params.set(`filters[$or][${index * 2}][name][$containsi]`, variant);
      params.set(`filters[$or][${index * 2 + 1}][name][$containsi]`, variant.replace('-', '_'));
    });
    params.set('pagination[pageSize]', '200');

    const response = await fetch(`${config.url}/api/upload/files?${params}`, {
      headers: { Authorization: `Bearer ${config.token}` },
    });
    if (!response.ok) return null;

    const files: unknown = await response.json();
    if (!Array.isArray(files)) return null;

    const map: TeamAvatarVariantMap = {};
    for (const file of files as StrapiUploadFileRow[]) {
      const parsed = parseFileName(file.name);
      if (!parsed) continue;
      map[parsed.slug] = { ...map[parsed.slug], [parsed.variant]: file.url };
    }
    return map;
  } catch {
    return null;
  }
}

/** slug → { variant → URL } for every uploaded team avatar variant (cached). */
export async function getTeamAvatarVariantMap(): Promise<TeamAvatarVariantMap> {
  const map = await cache.getWithFallback(VARIANT_AVATAR_MAP_CACHE_KEY, fetchVariantAvatarMap, {
    tags: ['authors'],
  });
  return map ?? {};
}
