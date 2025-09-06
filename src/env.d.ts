declare module '@alpinejs/collapse';

/// <reference types="astro/client" />

interface Window {
  Alpine: import('alpinejs').Alpine;
}

declare namespace App {
  interface Locals {
    starCount: () => number;
  }
}
