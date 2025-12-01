import type { AnnouncementConfig } from './libs/integration/announcement';

declare global {
  var __ANNOUNCEMENT_CONFIG__: AnnouncementConfig | undefined;
}

export {};
