// src/data/pricing.ts
// Section content for /pricing — imported by both src/pages/pricing.astro (page
// render) and src/pages/pricing.md.ts (markdown export) so the two can never
// drift out of sync. Page-level SEO/OG metadata lives in
// src/content/pages/pricing.mdx, and the FAQ copy in src/content/faq/*.mdx
// (category: "pricing"), matching the split every other content-collection-backed
// page uses. Figma node 18493:88208.

import type { IconName } from '@utils/iconMap';

/** Both "talk to us" affordances land on the Dedicated Cloud form's contact
 *  section rather than /contact — see issue #1636. */
const TALK_TO_US_HREF = '/dedicated-cloud#contact';

export const hero = {
  title: 'Pricing',
  description: 'Start with Galactic VPC, add resources, pay for what you use',
  highlights: ['No feature gates', 'No seat limits', 'No hidden fees'],
  primaryCta: { text: 'Start building', href: 'https://auth.datum.net/id/signup' },
};

export const banner = {
  icon: 'party-popper' as IconName,
  emphasis: 'Free to use until billing begins on February 1st, 2027.',
  text: 'We’ll notify you before any charges!',
};

/** One monospace price line. Rendered as a regular `$`, a bold `amount`, then
 *  `suffix` appended verbatim — a separate word carries its own leading space
 *  ('` per million`'). `note` renders on a second line. */
export interface PriceLine {
  amount: string;
  suffix?: string;
  note?: string;
}

export interface RateRow {
  /** Value in the "Unit of measure" column; empty where the design leaves it blank. */
  unit: string;
  lines?: PriceLine[];
  /** Renders the bold monospace label (e.g. "Free", "Always Free") instead of a figure. */
  free?: string;
  /** Renders an underlined link instead of a figure (the 500 TB+ tier). */
  link?: { text: string; href: string };
}

export interface RateFeature {
  name: string;
  /** Small uppercase availability badge beside the feature name. */
  badge?: string;
  /** Tooltip behind the info affordance beside the feature name. */
  info?: string;
  rows: RateRow[];
}

/** A card description is plain text with optional inline links. */
export type RateCardDescription = Array<string | { text: string; href: string }>;

export interface RateCard {
  id: string;
  title: string;
  description: RateCardDescription;
  features: RateFeature[];
}

export const rates = {
  columns: ['Feature', 'Unit of measure', 'Price per unit'],
  cards: [
    {
      id: 'galactic-vpc',
      title: 'Galactic VPC',
      description: [
        'gVPC is a virtual backbone that spans providers. Create as many as you want. Pay only for data transfer fees.',
      ],
      features: [
        {
          name: 'Egress data',
          info: 'This is all traffic that egresses our network to the public internet.',
          rows: [
            { unit: '0 – 200 GB', free: 'Free' },
            { unit: '200 GB – 10 TB', lines: [{ amount: '0.05', suffix: ' per GB' }] },
            { unit: '10 – 150 TB', lines: [{ amount: '0.04', suffix: ' per GB' }] },
            { unit: '150 – 500 TB', lines: [{ amount: '0.03', suffix: ' per GB' }] },
            { unit: '500 TB+', link: { text: 'Contact us', href: TALK_TO_US_HREF } },
          ],
        },
        {
          name: 'Internal data',
          info: 'Traffic within the Datum network',
          rows: [
            { unit: 'Same region', free: 'Free' },
            { unit: 'Cross-region', lines: [{ amount: '0.03', suffix: ' per GB' }] },
          ],
        },
        {
          name: 'Ingress data',
          rows: [{ unit: '', free: 'Always Free' }],
        },
      ],
    },
    {
      id: 'hosted-resources',
      title: 'Hosted Resources',
      description: [
        'Datum Cloud provides a growing list of infrastructure primitives on-demand. For our full roadmap, ',
        { text: 'click here', href: '/roadmap' },
        '.',
      ],
      features: [
        {
          name: 'DNS',
          rows: [
            {
              unit: 'Requests',
              lines: [{ amount: '0.60', suffix: ' per million', note: 'after the first 500K' }],
            },
          ],
        },
        {
          name: 'ALB',
          rows: [{ unit: 'Requests', lines: [{ amount: '1.00', suffix: ' per million' }] }],
        },
        {
          name: 'GSLB',
          badge: 'Soon',
          rows: [{ unit: 'Requests', lines: [{ amount: '0.60', suffix: ' per million' }] }],
        },
        {
          name: 'Compute',
          rows: [
            {
              unit: 'vCPU',
              lines: [
                { amount: '0.00001400', suffix: ' per second' },
                { amount: '0.0504', suffix: ' per hour' },
              ],
            },
            {
              unit: 'GiB of Memory',
              lines: [
                { amount: '0.00000450', suffix: ' per second' },
                { amount: '0.0162', suffix: ' per hour' },
              ],
            },
          ],
        },
        {
          name: 'Object Storage',
          badge: 'Soon',
          rows: [
            {
              unit: 'Standard tier',
              lines: [{ amount: '0.0085', suffix: ' per GB per month' }],
            },
            {
              unit: 'Performance tier',
              lines: [{ amount: '0.024', suffix: ' per GB per month' }],
            },
          ],
        },
        {
          name: 'Tunnels',
          rows: [{ unit: 'Endpoint', lines: [{ amount: '0.01', suffix: ' per hour' }] }],
        },
      ],
    },
  ] satisfies RateCard[],
};

export interface BatteryItem {
  name: string;
  /** Docs page the item links out to. */
  href: string;
  /** Short explainer shown in the info tooltip. */
  info: string;
}

export const batteries = {
  title: 'Batteries included!',
  description:
    "Unlike many platforms, we don't charge for teammates, robust logs, or appropriate access controls. Use 'em!",
  label: 'Always Free',
  columns: [
    [
      {
        name: 'datumctl (CLI)',
        href: '/docs/datumctl/overview',
        info: 'One command-line tool for every Datum Cloud resource, built for people, scripts, CI, and AI agents.',
      },
      {
        name: 'Coarse-Grained Permissions',
        href: '/docs/organizations/team-management',
        info: 'Invite teammates to your organization and assign them roles, with no seat fees.',
      },
      {
        name: 'Secrets',
        href: '/docs/operations/secrets',
        info: 'Create and manage secret resources in a project, from the Cloud Portal or datumctl.',
      },
    ],
    [
      {
        name: 'Metrics Export',
        href: '/docs/operations/metrics-export',
        info: 'Export the metrics Datum publishes for your project to Grafana Cloud or any Prometheus remote-write endpoint.',
      },
      {
        name: 'Audit & Activity Logs',
        href: '/docs/operations/activity-logs',
        info: 'Query and filter audit logs to track changes across your organizations and projects.',
      },
      {
        name: 'SSO',
        href: '/docs/account/sign-in',
        info: 'Sign in with a passkey, or with your Google or GitHub account.',
      },
    ],
    [
      {
        name: 'Service Accounts',
        href: '/docs/projects/service-accounts',
        info: 'Non-human identities for applications, CI/CD pipelines, and services to authenticate with Datum APIs.',
      },
      {
        name: 'Datum MCP',
        href: '/docs/agents/datum-mcp',
        info: 'Connect Claude, Cursor, and other AI tools to your projects with Datum’s official MCP server.',
      },
      {
        name: 'AI Assistant',
        href: '/docs/operations/datum-assistant',
        info: 'Ask Patch, the Datum Cloud assistant, about your resources in natural language and let it diagnose problems.',
      },
    ],
    [
      {
        name: 'Domains',
        href: '/docs/domain-dns/domains',
        info: 'Track and verify your domains in one place, wherever they are registered.',
      },
      {
        name: 'Desktop Apps',
        href: '/docs/desktop-apps',
        info: 'Native apps for macOS, Linux, and Windows that expose local environments to the internet through a secure tunnel.',
      },
    ],
  ] satisfies BatteryItem[][],
};

export const faqTitle = 'Commonly Asked Questions';

/** Prefooter copy override for this page — Figma node 18493:88927. */
export const prefooter = {
  titleAccent: 'Free',
  title: 'during public beta.',
  description:
    'Datum Cloud is currently free. Billable usage starts February 1st, 2027. Feedback welcome!',
  buttons: [
    {
      text: 'Start for free',
      href: 'https://auth.datum.net/id/signup',
      class: 'btn btn--midnight-fjord btn--glow-aurora',
      icon: { name: 'arrow-right' as IconName, size: 'md' as const },
      target: '_blank' as const,
      event: 'Pre-footer: Start for free',
    },
    {
      text: 'Talk to us',
      href: TALK_TO_US_HREF,
      class: 'btn btn--alpha',
      event: 'Pre-footer: Talk to us',
    },
  ],
};
