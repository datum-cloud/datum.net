/// <reference types="astro/client" />

declare module '@alpinejs/collapse';

interface Window {
  Alpine: import('alpinejs').Alpine;
  rybbit?: {
    event: (name: string) => void;
  };
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
    DATUM_SA_CLIENT_ID?: string;
    DATUM_SA_PRIVATE_KEY_ID?: string;
    DATUM_SA_PRIVATE_KEY?: string;
    DATUM_SA_SCOPE?: string;
    DATUM_SA_AUTH_HOSTNAME?: string;
    DATUM_PROJECT_ID?: string;
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASSWORD?: string;
    SMTP_FROM?: string;
  }
}

interface ImportMetaEnv {
  readonly AUTH_OIDC_ISSUER?: string;
  readonly AUTH_OIDC_CLIENT_ID?: string;
  readonly AUTH_OIDC_CLIENT_SECRET?: string;
  readonly AUTH_OIDC_REDIRECT_URI?: string;
  readonly API_URL?: string;
  readonly SMTP_HOST?: string;
  readonly SMTP_PORT?: string;
  readonly SMTP_USER?: string;
  readonly SMTP_PASSWORD?: string;
  readonly SMTP_FROM?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
