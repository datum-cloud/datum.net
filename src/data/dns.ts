// src/data/dns.ts
// Section content for /platform/dns — imported by both src/pages/platform/dns.astro
// (page render) and src/pages/platform/dns.md.ts (markdown export) so the two
// can never drift out of sync. Page-level SEO/OG metadata lives in
// src/content/pages/platform/dns.mdx instead, per the same split every other
// content-collection-backed page uses (see platform/deliver.astro).

import type { IconName } from '@utils/iconMap';

export const breadcrumbs = [
  { text: 'Platform', href: '/platform' },
  { text: 'Deliver', href: '/platform/deliver' },
  { text: 'DNS', href: '/platform/dns' },
];

export const hero = {
  badge: 'DNS',
  badgeIcon: 'router' as IconName,
  title: 'Authoritative DNS without the upsell',
  description:
    'Fast and resilient DNS that is easily managed via our portal or CLI. The first 500k requests each month are free.',
  primaryCta: { text: 'Start for free', href: 'https://auth.datum.net/ui/v2/login/register' },
  secondaryCta: {
    text: 'View documentation',
    href: 'https://www.datum.net/docs/domain-dns/dns',
  },
  imageAlt: 'Datum portal showing a DNS zone with A, CNAME, MX and TXT records',
};

export interface IconItem {
  /** lucide icon name from src/utils/iconMap.ts */
  icon: IconName;
  title: string;
  description: string;
}

export const capabilities = {
  eyebrow: 'Core capabilities',
  title: 'Meet the internet in style',
  items: [
    {
      icon: 'layers',
      title: 'Zone management',
      description:
        "Add DNS zones for any domain or subdomain — whether it's hosted on Datum or externally — for visibility across everything you manage.",
    },
    {
      icon: 'globe',
      title: 'Global reach & resiliency',
      description:
        "Datum serves authoritative DNS through a globally distributed anycast network. Use Datum's nameservers to get performance and redundancy without extra configuration.",
    },
    {
      icon: 'arrow-down-up',
      title: 'Bulk import and export',
      description:
        "Bring in existing zone files (BIND format), import from a screenshot of another provider's DNS panel, or sync by querying existing records. Export your configuration any time.",
    },
    {
      icon: 'file-text',
      title: 'Full record support',
      description:
        'Add, edit, and delete every record type you actually use: A, AAAA, CAA, NS, SRV, TXT, CNAME, MX, SOA, TLSA, SVCB, and HTTPS.',
    },
    {
      icon: 'link-2',
      title: 'CNAME flattening',
      description:
        'Point your root domain (example.com, not just www) at another hostname the way a CNAME does, while still returning standard A/AAAA answers to clients.',
    },
  ] satisfies IconItem[],
};

export const operations = {
  eyebrow: 'Operations',
  title: 'Built for platform teams',
  items: [
    {
      icon: 'shield',
      title: 'Project-scoped access',
      description:
        'Manage zones within individual projects with role-based access control, instead of one flat account with no boundaries.',
    },
    {
      icon: 'file-search-corner',
      title: 'Audit logs',
      description:
        'Every zone and record change is tracked with user attribution and a timestamp, so you always know who changed what.',
    },
    {
      icon: 'terminal',
      title: 'CLI-first experience',
      description:
        'Manage zones with datumctl or the API — DNS is code, not a console-only side quest.',
    },
    {
      icon: 'bot',
      title: 'MCP support',
      description:
        'MCP support lets AI agents query and manage DNS zones under the same permissions as a human operator — not a bolted-on integration.',
    },
  ] satisfies IconItem[],
};

export interface ComparisonRow {
  label: string;
  datum: string;
  cloudflare: string;
}

export const comparison = {
  eyebrow: 'How we stack up',
  title: 'Why choose Datum?',
  description:
    "Datum offers many of the same capabilities as Cloudflare, but with a more curated experience and no feature gates. We're also completely backed by open source and offer white-glove, dedicated deployments for scaling companies.",
  datumLabel: 'Datum DNS',
  cloudflareLabel: 'Cloudflare DNS',
  rows: [
    {
      label: 'Pricing',
      datum:
        'Hyperscaler-style usage model with no feature gates — first 500k requests each month are free.',
      cloudflare: 'Tiered plans with feature gates that require interaction with sales to unlock.',
    },
    {
      label: 'Platform',
      datum: "Open source core, neutral network — not tied to a single vendor's proxy/CDN stack.",
      cloudflare: "Proprietary; DNS is one feature inside Cloudflare's broader platform.",
    },
    {
      label: 'Access',
      datum: 'Project-scoped, role-based access control shared with compute and networking.',
      cloudflare: 'Account and zone-level permissions inside the Cloudflare dashboard.',
    },
  ] satisfies ComparisonRow[],
};

export interface DomainStep {
  title: string;
  description: string;
}

export const domains = {
  eyebrow: 'Domains',
  title: 'Domains are infrastructure too',
  description:
    "At Datum, a domain is a resource like any other — trackable, verifiable, and programmatically accessible, regardless of where it's registered or where its DNS is hosted. No more spreadsheets to know what your team owns.",
  steps: [
    {
      title: 'Add a domain',
      description:
        'One at a time, in bulk via CSV/TXT import, or automatically when you attach a custom hostname to an AI Edge.',
    },
    {
      title: 'Verify ownership',
      description:
        'Confirm control of a domain by adding a DNS record, unlocking it for use across Datum services like Proxy and DNS zone hosting.',
    },
    {
      title: 'See details at a glance',
      description: 'Public registration data surfaces automatically once a domain is added.',
    },
  ] satisfies DomainStep[],
};
