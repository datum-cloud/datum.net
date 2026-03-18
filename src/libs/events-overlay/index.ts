// src/libs/events-overlay/index.ts
import overlayData from '@data/events-overlay.json';

export interface EventSpeaker {
  name: string;
  title: string;
  avatarUrl?: string;
}

export interface EventOverlay {
  youtubeUrl?: string;
  speakers?: EventSpeaker[];
}

type OverlayMap = Record<string, EventOverlay>;

const overlay = overlayData as OverlayMap;

export function getEventOverlay(apiId: string): EventOverlay | null {
  return overlay[apiId] ?? null;
}
