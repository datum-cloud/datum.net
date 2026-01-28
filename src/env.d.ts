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
    AUTH_OIDC_ISSUER?: string;
    AUTH_OIDC_CLIENT_ID?: string;
    AUTH_OIDC_CLIENT_SECRET?: string;
    AUTH_OIDC_REDIRECT_URI?: string;
    API_URL?: string;
  }
}

interface ImportMetaEnv {
  readonly AUTH_OIDC_ISSUER?: string;
  readonly AUTH_OIDC_CLIENT_ID?: string;
  readonly AUTH_OIDC_CLIENT_SECRET?: string;
  readonly AUTH_OIDC_REDIRECT_URI?: string;
  readonly API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
