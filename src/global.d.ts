import type { AnnouncementConfig } from './plugins/announcement';

declare global {
  var __ANNOUNCEMENT_CONFIG__: AnnouncementConfig | undefined;
}

export {};
