// src/libs/server/announcement.ts
import type { AstroIntegration } from 'astro';

export interface AnnouncementConfig {
  show?: boolean;
  label?: string;
  text?: string;
  href?: string;
  icon?: {
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  };
}

export default function announcement(config: AnnouncementConfig): AstroIntegration {
  return {
    name: 'announcement',
    hooks: {
      'astro:config:setup': ({ injectScript }) => {
        // Make announcement config available globally during SSR
        injectScript('page-ssr', `globalThis.__ANNOUNCEMENT_CONFIG__ = ${JSON.stringify(config)};`);
      },
    },
  };
}
