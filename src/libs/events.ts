// src/libs/events.ts
// Events library backed by Astro content collections.
// Drop-in replacement for @libs/luma + @libs/events-overlay.

import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';

// ---------------------------------------------------------------------------
// Hosts / Guests
// ---------------------------------------------------------------------------

export interface EventHost {
  name: string;
  /** Remote or site-absolute URL (e.g. `/images/...`); omit when `avatarImage` is set. */
  avatarUrl?: string;
  /** Local avatar from `src/content/events/images/hosts` for `<Image src={...}>`. */
  avatarImage?: ImageMetadata;
}

export interface EventGuest {
  name: string;
  title?: string;
  /**
   * After `getEventHostsGuests()`: resolved Astro asset for `<Image>`. Raw JSON uses a **basename**
   * only (e.g. `tony-perez.jpg`) matching a file in `src/content/events/images/guests` (`@guests/*`).
   * Guest avatars are not loaded from Luma.
   */
  avatarImage?: ImageMetadata;
  /**
   * Fallback for `http(s)://` or site paths when no file exists under `images/guests` (use `<img>`).
   * In `hosts-guests.json`, prefer basename keys that match `@guests` files.
   */
  avatarUrl?: string;
}

export interface EventHostsGuests {
  hosts: EventHost[];
  guests: EventGuest[];
}

// Eagerly load all hosts-guests.json files at build time
const hostsGuestsFiles = import.meta.glob<{ hosts: EventHost[]; guests: EventGuest[] }>(
  '/src/content/events/**/hosts-guests.json',
  { eager: true, import: 'default' }
);

// Local host avatars live in src/content/events/images/hosts (see @hosts/*)
const hostAvatarModules = import.meta.glob<ImageMetadata>(
  '../content/events/images/hosts/*.{jpg,jpeg,png,gif,webp}',
  {
    eager: true,
    import: 'default',
  }
);

const hostAvatarImageByFilename: Record<string, ImageMetadata> = {};
for (const [modPath, meta] of Object.entries(hostAvatarModules)) {
  const base = modPath.replace(/^.*\//, '');
  if (meta && typeof meta === 'object' && 'width' in meta && 'height' in meta) {
    hostAvatarImageByFilename[base] = meta as ImageMetadata;
  }
}

/**
 * Normalizes raw JSON host rows: basenames under `images/hosts` become `avatarImage` for Astro
 * `<Image>`; http(s) and root-relative paths stay as `avatarUrl` (use `<img>`).
 */
function normalizeHostFromJson(h: { name: string; avatarUrl?: string }): EventHost {
  const ref = h.avatarUrl?.trim();
  if (!ref) return { name: h.name };
  if (/^https?:\/\//i.test(ref)) return { name: h.name, avatarUrl: ref };
  if (ref.startsWith('/')) return { name: h.name, avatarUrl: ref };
  const base = ref.includes('/') ? ref.replace(/^.*\//, '') : ref;
  const avatarImage = hostAvatarImageByFilename[base];
  if (avatarImage) return { name: h.name, avatarImage };
  return { name: h.name, avatarUrl: ref };
}

// Local guest avatars (see @guests/*)
const guestAvatarModules = import.meta.glob<ImageMetadata>(
  '../content/events/images/guests/*.{jpg,jpeg,png,gif,webp}',
  {
    eager: true,
    import: 'default',
  }
);

const guestAvatarImageByFilename: Record<string, ImageMetadata> = {};
for (const [modPath, meta] of Object.entries(guestAvatarModules)) {
  const base = modPath.replace(/^.*\//, '');
  if (meta && typeof meta === 'object' && 'width' in meta && 'height' in meta) {
    guestAvatarImageByFilename[base] = meta as ImageMetadata;
  }
}

/**
 * Maps raw `hosts-guests.json` guest rows: basename → `avatarImage` from `images/guests` only
 * (Vite glob). JSON field stays `avatarUrl` for the filename (e.g. `tony-perez.jpg`), not a Luma URL.
 */
function normalizeGuestFromJson(g: {
  name: string;
  title?: string;
  avatarUrl?: string;
}): EventGuest {
  const ref = g.avatarUrl?.trim();
  const baseEntry = { name: g.name, title: g.title };
  if (!ref) return baseEntry;
  if (/^https?:\/\//i.test(ref)) return { ...baseEntry, avatarUrl: ref };
  const basename = ref.startsWith('/') ? ref.replace(/^.*\//, '') : (ref.split('/').pop() ?? ref);
  const avatarImage = guestAvatarImageByFilename[basename];
  if (avatarImage) return { ...baseEntry, avatarImage };
  if (ref.startsWith('/')) return { ...baseEntry, avatarUrl: ref };
  return { ...baseEntry, avatarUrl: ref };
}

// ---------------------------------------------------------------------------
// GeoAddress (matches the old LumaGeoAddress shape for component compat)
// ---------------------------------------------------------------------------

export interface GeoAddress {
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  city_state?: string;
  full_address?: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// ContentEvent – backwards-compatible with LumaEvent field names
// ---------------------------------------------------------------------------

export interface ContentEvent {
  id: string;
  api_id: string;
  name: string;
  description?: string;
  description_md?: string;
  start_at: string;
  end_at: string;
  timezone: string;
  url: string;
  cover_url?: string;
  /** Full Astro ImageMetadata for use with <Image> component */
  coverImage?: ImageMetadata;
  geo_address_json?: GeoAddress;
  geo_latitude?: string;
  geo_longitude?: string;
  visibility?: string;
  meeting_url?: string;
  zoom_meeting_url?: string;
  tags?: string[];
  // Extensions beyond old LumaEvent
  eventType: string;
  theme?: string;
  youtubeUrl?: string;
  slidesUrl?: string;
  /** Content collection entry id (directory slug) */
  collectionId: string;
}

// ---------------------------------------------------------------------------
// Fetch events from content collection
// ---------------------------------------------------------------------------

export async function fetchEvents(): Promise<{
  upcoming: ContentEvent[];
  past: ContentEvent[];
}> {
  const entries = await getCollection('events');

  const now = new Date();
  const allEvents: ContentEvent[] = [];

  for (const entry of entries) {
    const d = entry.data;

    // Map content collection camelCase back to snake_case for component compat
    const geoAddress: GeoAddress | undefined = d.geoAddress
      ? {
          address: d.geoAddress.address,
          city: d.geoAddress.city,
          region: d.geoAddress.region,
          country: d.geoAddress.country,
          city_state: d.geoAddress.cityState,
          full_address: d.geoAddress.fullAddress,
          description: d.geoAddress.description,
        }
      : undefined;

    allEvents.push({
      id: d.apiId,
      api_id: d.apiId,
      name: d.name,
      description_md: entry.body?.trim() || undefined,
      start_at: d.startAt,
      end_at: d.endAt,
      timezone: d.timezone,
      url: d.url,
      cover_url: d.coverImage?.src,
      coverImage: d.coverImage,
      geo_address_json: geoAddress,
      geo_latitude: d.geoLatitude != null ? String(d.geoLatitude) : undefined,
      geo_longitude: d.geoLongitude != null ? String(d.geoLongitude) : undefined,
      meeting_url: d.meetingUrl,
      zoom_meeting_url: d.zoomMeetingUrl,
      tags: d.tags ?? [],
      eventType: d.eventType,
      theme: d.theme,
      youtubeUrl: d.youtubeUrl,
      slidesUrl: d.slidesUrl,
      collectionId: entry.id,
    });
  }

  const upcoming = allEvents
    .filter((event) => new Date(event.start_at) >= now)
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

  const past = allEvents
    .filter((event) => new Date(event.start_at) < now)
    .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());

  return { upcoming, past };
}

// ---------------------------------------------------------------------------
// Hosts / guests lookup
// ---------------------------------------------------------------------------

export function getEventHostsGuests(event: ContentEvent): EventHostsGuests {
  // Find matching hosts-guests.json by collection id
  for (const [path, data] of Object.entries(hostsGuestsFiles)) {
    // path like /src/content/events/04-2026-boston-alt-cloud-meetup-april-2026/hosts-guests.json
    if (path.includes(event.collectionId.replace(/\/index$/, ''))) {
      const hosts = (data.hosts ?? []).map((h) => normalizeHostFromJson(h));
      const guests = (data.guests ?? []).map((g) => normalizeGuestFromJson(g));
      return {
        hosts,
        guests,
      };
    }
  }
  return { hosts: [], guests: [] };
}

// ---------------------------------------------------------------------------
// Classification helpers (backwards-compatible with @libs/luma)
// ---------------------------------------------------------------------------

export function isEventCommunityHuddle(event: ContentEvent): boolean {
  return event.eventType === 'community-huddle';
}

export function isEventAltCloudMeetup(event: ContentEvent): boolean {
  return event.eventType === 'alt-cloud-meetup';
}

export function isEventExternal(event: ContentEvent): boolean {
  return event.eventType === 'external';
}

export function isEventDatumHosted(event: ContentEvent): boolean {
  return event.eventType !== 'external';
}

export function isEventRecurringSeries(event: ContentEvent): boolean {
  if (isEventCommunityHuddle(event)) return true;
  const tags = event.tags ?? [];
  return tags.some((t) => t.toLowerCase().replace(/\s+/g, '-').includes('recurring-series'));
}

export function getEventDisplayName(event: ContentEvent): string {
  // Name already has month prefix for community huddles (set during migration)
  return event.name;
}

export function getEventSlug(event: ContentEvent): string {
  return event.api_id;
}

export function filterEventsInNextUtcMonth(
  events: ContentEvent[],
  ref: Date = new Date()
): ContentEvent[] {
  const y = ref.getUTCFullYear();
  const m = ref.getUTCMonth();
  const targetM = (m + 1) % 12;
  const targetY = m === 11 ? y + 1 : y;
  const startMs = Date.UTC(targetY, targetM, 1, 0, 0, 0, 0);
  const endMs = Date.UTC(targetY, targetM + 1, 0, 23, 59, 59, 999);

  return events
    .filter((e) => {
      const t = new Date(e.start_at).getTime();
      return t >= startMs && t <= endMs;
    })
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
}
