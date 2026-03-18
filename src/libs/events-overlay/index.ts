// src/libs/events-overlay/index.ts
import type { LumaEvent } from '@libs/luma';
import legacyOverlayData from '@data/events-overlay.json';

const fileOverlays = import.meta.glob('@data/event-overlays/*.json', {
  eager: true,
  import: 'default',
});

export interface EventSpeaker {
  name: string;
  title: string;
  avatarUrl?: string;
}

export interface EventOverlay {
  /** Canonical Luma id when filename is a sanitized slug instead of api_id */
  lumaApiId?: string;
  /** Any public YouTube URL; normalized with {@link toYouTubeEmbedUrl} at use sites */
  youtubeUrl?: string;
  /** Optional display title for detail views (e.g. past huddle modal) */
  title?: string;
  /** Link to slide deck (e.g. PDF or Slides URL) */
  slidesUrl?: string;
  speakers?: EventSpeaker[];
  guests?: EventSpeaker[];
  /** Extra markdown below the title (rendered as HTML like the agenda); often synced from Luma. */
  description?: string;
}

type OverlayMap = Map<string, EventOverlay>;

function stripUnderscoreKeys<T extends Record<string, unknown>>(obj: T): EventOverlay {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('_')) continue;
    out[k] = v;
  }
  const overlay = out as EventOverlay & { youtube?: string };
  if (!overlay.youtubeUrl && typeof overlay.youtube === 'string' && overlay.youtube.trim()) {
    overlay.youtubeUrl = overlay.youtube.trim();
  }
  delete overlay.youtube;
  return overlay as EventOverlay;
}

function basenameApiId(path: string): string {
  const seg = path.split('/').pop() ?? '';
  return seg.replace(/\.json$/i, '');
}

function buildOverlayMap(): OverlayMap {
  const map: OverlayMap = new Map();

  const legacy = legacyOverlayData as Record<string, unknown>;
  for (const [k, v] of Object.entries(legacy)) {
    if (k.startsWith('_')) continue;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      map.set(k, stripUnderscoreKeys(v as Record<string, unknown>));
    }
  }

  for (const [path, mod] of Object.entries(fileOverlays)) {
    const raw = mod as Record<string, unknown>;
    const cleaned = stripUnderscoreKeys(raw);
    const key = cleaned.lumaApiId?.trim() || basenameApiId(path);
    map.set(key, cleaned);
  }

  return map;
}

const overlayByApiId = buildOverlayMap();

export function getEventOverlay(apiId: string): EventOverlay | null {
  const o = overlayByApiId.get(apiId);
  return o ?? null;
}

/**
 * Public event slug from a Luma page URL (e.g. `https://luma.com/or9xabm6` → `or9xabm6`).
 * @param eventUrl - {@link LumaEvent.url}
 */
export function extractLumaPublicUrlId(eventUrl: string | undefined): string | null {
  if (!eventUrl?.trim()) return null;
  try {
    const u = new URL(eventUrl.trim());
    const host = u.hostname.replace(/^www\./, '');
    if (host !== 'luma.com' && host !== 'lu.ma') return null;
    const first = u.pathname.split('/').filter(Boolean)[0];
    if (!first || !/^[a-z0-9]+$/i.test(first)) return null;
    return first;
  } catch {
    return null;
  }
}

/**
 * Resolve overlay by `api_id` first, then by public URL slug (filename-friendly for editors).
 */
export function getEventOverlayForEvent(event: LumaEvent): EventOverlay | null {
  const byApi = getEventOverlay(event.api_id);
  if (byApi) return byApi;
  const slug = extractLumaPublicUrlId(event.url);
  return slug ? getEventOverlay(slug) : null;
}
