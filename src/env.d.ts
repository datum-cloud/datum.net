declare module '@alpinejs/collapse';

/// <reference types="astro/client" />

declare module 'astro:db' {
  export const db: any;
  export const eq: any;
  export const Votes: any;
  export const Project: any;
}

interface Window {
  Alpine: import('alpinejs').Alpine;
}
