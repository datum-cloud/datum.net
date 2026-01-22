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
    if (cached) {
      return cached;
    }
  }

  const apiKey = import.meta.env.LUMA_API_KEY || process.env.LUMA_API_KEY;

  if (!apiKey) {
    throw new Error('LUMA_API_KEY is not configured');
  }

  try {
    const response = await fetch(`${LUMA_API_BASE_URL}calendar/list-events`, {
      method: 'GET',
      headers: {
        'x-luma-api-key': apiKey,
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
    throw error;
  }
}
