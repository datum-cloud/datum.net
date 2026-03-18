// src/libs/luma/index.ts
// Luma API client for fetching events

import { Cache } from '@libs/cache';

const cache = new Cache('.cache');
export interface LumaGeoAddress {
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  city_state?: string;
  full_address?: string;
  description?: string;
}

export interface LumaEvent {
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
  geo_address_json?: LumaGeoAddress;
  geo_latitude?: string;
  geo_longitude?: string;
  visibility?: string;
  meeting_url?: string;
  zoom_meeting_url?: string;
  tags?: string[];
}

export interface LumaEventEntry {
  api_id: string;
  event: LumaEvent;
  tags: string[];
}

export interface LumaEventsResponse {
  entries: LumaEventEntry[];
  has_more: boolean;
  next_cursor?: string;
}

export interface LumaHost {
  api_id: string;
  name: string;
  avatar_url?: string;
}

const LUMA_API_BASE_URL = 'https://public-api.luma.com/v1/';
const LUMA_CACHE_TTL = 86400000; // 24 hours in ms

/**
 * Validates that an object is a valid LumaEvent
 * @param obj - The object to validate
 * @returns True if the object is a valid LumaEvent
 */
function isValidLumaEvent(obj: unknown): obj is LumaEvent {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const event = obj as Record<string, unknown>;
  return (
    typeof event.id === 'string' &&
    typeof event.api_id === 'string' &&
    typeof event.name === 'string' &&
    typeof event.start_at === 'string' &&
    typeof event.end_at === 'string' &&
    typeof event.timezone === 'string' &&
    typeof event.url === 'string'
  );
}

/**
 * Validates that cached data has the correct structure with LumaEvent objects
 * @param data - The cached data to validate
 * @returns True if the data structure is valid
 */
function isValidCachedData(data: unknown): data is { upcoming: LumaEvent[]; past: LumaEvent[] } {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const cached = data as Record<string, unknown>;
  if (!Array.isArray(cached.upcoming) || !Array.isArray(cached.past)) {
    return false;
  }

  return cached.upcoming.every(isValidLumaEvent) && cached.past.every(isValidLumaEvent);
}

/**
 * Retrieves the current Luma API key from environment variables.
 * Looks for `LUMA_API_KEY` in both Vite and Node.js process environments.
 * @returns The API key as a string if found, otherwise null.
 */
function getApiKey(): string | null {
  return import.meta.env?.LUMA_API_KEY || process.env.LUMA_API_KEY || null;
}

/**
 * Returns true if the event is a Community Huddle.
 * Checks Luma tags first, falls back to event name.
 */
export function isEventCommunityHuddle(event: LumaEvent): boolean {
  const tags = event.tags ?? [];
  if (tags.some((t) => t.toLowerCase().replace(/\s+/g, '-').includes('community-huddle'))) {
    return true;
  }
  return event.name.toLowerCase().includes('community huddle');
}

/**
 * Returns true if the event is an Alt Cloud Meetup.
 */
export function isEventAltCloudMeetup(event: LumaEvent): boolean {
  const tags = event.tags ?? [];
  if (tags.some((t) => t.toLowerCase().replace(/\s+/g, '-').includes('alt-cloud-meetup'))) {
    return true;
  }
  return event.name.toLowerCase().includes('alt cloud meetup');
}

/**
 * Returns true if Datum is merely attending this event (not hosting it).
 * These show "We'll be there" / "Come find us" badge and are NOT linkable to internal pages.
 */
export function isEventExternal(event: LumaEvent): boolean {
  const tags = event.tags ?? [];
  return tags.some((t) => {
    const normalized = t.toLowerCase().replace(/\s+/g, '-');
    return normalized.includes('external') || normalized.includes('we-will-be-there');
  });
}

/**
 * Returns true if this is a Datum-hosted event (not merely attending).
 */
export function isEventDatumHosted(event: LumaEvent): boolean {
  return !isEventExternal(event);
}

/**
 * Returns true if the event is part of a recurring series.
 */
export function isEventRecurringSeries(event: LumaEvent): boolean {
  const tags = event.tags ?? [];
  return tags.some((t) => t.toLowerCase().replace(/\s+/g, '-').includes('recurring-series'));
}

/**
 * Returns a URL-safe slug for the event (its api_id).
 */
export function getEventSlug(event: LumaEvent): string {
  return event.api_id;
}

/**
 * Fetch all events from Luma API
 * Uses the calendar/list-events endpoint as per Luma API documentation
 * @see https://docs.luma.com/reference/get_v1-calendar-list-events
 */
export async function fetchLumaEvents(): Promise<{
  upcoming: LumaEvent[];
  past: LumaEvent[];
}> {
  const cacheKey = 'luma-events';

  if (await cache.has(cacheKey)) {
    const cached = await cache.get<{ upcoming: LumaEvent[]; past: LumaEvent[] }>(cacheKey);
    if (cached && isValidCachedData(cached)) {
      return cached;
    }
    if (cached) {
      console.warn('Invalid cached Luma events data detected, fetching fresh data from API');
    }
  }

  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn('LUMA_API_KEY is not configured. Returning empty events list.');
    return { upcoming: [], past: [] };
  }

  try {
    const response = await fetch(`${LUMA_API_BASE_URL}calendar/list-events`, {
      method: 'GET',
      headers: {
        'x-luma-api-key': apiKey as string,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Luma API error: ${response.status} ${response.statusText}`);
    }

    const data: LumaEventsResponse = await response.json();
    const now = new Date();
    const allEvents = (data.entries || [])
      .map((entry) => ({
        ...entry.event,
        tags: entry.tags ?? [],
      }))
      .filter((event) => event.visibility?.toUpperCase() !== 'PRIVATE');

    // Split into upcoming and past events
    const upcoming = allEvents
      .filter((event) => new Date(event.start_at) >= now)
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

    const past = allEvents
      .filter((event) => new Date(event.start_at) < now)
      .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime())
      .slice(0, 10); // Get only 10 most recent past events

    const result = { upcoming, past };

    await cache.set(cacheKey, result, LUMA_CACHE_TTL);

    return result;
  } catch (error) {
    console.error('Error fetching Luma events:', error);
    // Return empty arrays instead of throwing to allow build to continue
    return { upcoming: [], past: [] };
  }
}

/**
 * Fetches hosts for a single event from the Luma get-event endpoint.
 * Results are cached per event for 5 minutes.
 */
export async function fetchEventHosts(eventApiId: string): Promise<LumaHost[]> {
  const cacheKey = `luma-hosts-${eventApiId}`;

  if (await cache.has(cacheKey)) {
    const cached = await cache.get<LumaHost[]>(cacheKey);
    if (cached && Array.isArray(cached)) {
      return cached;
    }
  }

  const apiKey = getApiKey();
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `${LUMA_API_BASE_URL}event/get?id=${encodeURIComponent(eventApiId)}`,
      {
        method: 'GET',
        headers: {
          'x-luma-api-key': apiKey as string,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const hosts: LumaHost[] = (data.hosts || []).map(
      (h: { api_id: string; name: string; avatar_url?: string }) => ({
        api_id: h.api_id,
        name: h.name,
        avatar_url: h.avatar_url,
      })
    );

    await cache.set(cacheKey, hosts, LUMA_CACHE_TTL);
    return hosts;
  } catch (error) {
    console.error(`Error fetching hosts for event ${eventApiId}:`, error);
    return [];
  }
}
