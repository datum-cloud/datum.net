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

const LUMA_API_BASE_URL = 'https://public-api.luma.com/v1/';

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
  return import.meta.env.LUMA_API_KEY || process.env.LUMA_API_KEY || null;
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

  if (cache.has(cacheKey)) {
    const cached = cache.get<{ upcoming: LumaEvent[]; past: LumaEvent[] }>(cacheKey);
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
    const allEvents = (data.entries || []).map((entry) => entry.event);

    // Split into upcoming and past events
    const upcoming = allEvents
      .filter((event) => new Date(event.start_at) >= now)
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

    const past = allEvents
      .filter((event) => new Date(event.start_at) < now)
      .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime())
      .slice(0, 10); // Get only 8 most recent past events

    const result = { upcoming, past };

    // Cache the result for 5 minutes (300000 ms)
    cache.set(cacheKey, result, 300000);

    return result;
  } catch (error) {
    console.error('Error fetching Luma events:', error);
    // Return empty arrays instead of throwing to allow build to continue
    return { upcoming: [], past: [] };
  }
}
