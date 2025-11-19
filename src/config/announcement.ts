// src/config/announcement.ts
// Re-export announcement config from astro.config.mjs
// Edit values in astro.config.mjs

// Access from globalThis which is injected by the announcement integration
export const announcementConfig = (typeof globalThis !== 'undefined' &&
  globalThis.__ANNOUNCEMENT_CONFIG__) || {
  show: true,
  label: "We've Launched!",
  text: 'Introducing our company, $13.6M in funding, and core features',
  href: '',
  icon: {
    name: 'arrow-right',
    size: 'md' as const,
  },
};
