/// <reference types="astro/client" />

declare module '@alpinejs/collapse';

interface Window {
  Alpine: import('alpinejs').Alpine;
}

declare namespace App {
  interface Locals {
    starCount: () => string;
  }
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'local';
    MODE: 'development' | 'production' | 'local';
  }
}
