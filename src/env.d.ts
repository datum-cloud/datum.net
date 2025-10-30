declare module '@alpinejs/collapse';

/// <reference types="astro/client" />

interface Window {
  Alpine: import('alpinejs').Alpine;
}

declare namespace App {
  interface Locals {
    starCount: () => string | number;
  }
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'local';
    MODE: 'development' | 'production' | 'local';
  }
}
