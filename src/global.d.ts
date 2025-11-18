import type { AnnouncementConfig } from './libs/server/announcement';

declare global {
  // eslint-disable-next-line no-var
  var __ANNOUNCEMENT_CONFIG__: AnnouncementConfig | undefined;
}

export {};
