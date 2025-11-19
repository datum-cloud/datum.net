import type { AnnouncementConfig } from './libs/integration/announcement';

declare global {
  // eslint-disable-next-line no-var
  var __ANNOUNCEMENT_CONFIG__: AnnouncementConfig | undefined;
}

export {};
