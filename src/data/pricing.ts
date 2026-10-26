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
  emphasis: 'Everything is free during beta.',
  text: 'Rates below apply once billing begins. We’ll notify you before any charges.',
};

/** One monospace price line. Rendered as a regular `$`, a bold `amount`, then
 *  `suffix` appended verbatim — so a suffix that reads as a separate word
 *  carries its own leading space ('` per million`'), while a unit that fuses to
 *  the figure does not ('`/IP-hr`'). `note` renders on a second line. */
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
        {
          name: 'Public IPv4',
          rows: [{ unit: '', lines: [{ amount: '0.005', suffix: '/IP-hr' }] }],
        },
      ],
    },
  ] satisfies RateCard[],
};

export const batteries = {
  title: 'Batteries included!',
  description:
    "Unlike many platforms, we don't charge for teammates, robust logs, or appropriate access controls. Use 'em!",
  label: 'Always Free',
  columns: [
    ['datumctl (CLI)', 'Coarse-Grained Permissions', 'Secrets'],
    ['Metrics Export,', 'Audit & Activity Logs', 'SSO'],
    ['Service Accounts', 'Datum MCP', 'AI Assistant'],
    ['Domains', 'Desktop Apps'],
  ],
};

export const faqTitle = 'Commonly Asked Questions';

/** Prefooter copy override for this page — Figma node 18493:88927. */
export const prefooter = {
  titleAccent: 'Free',
  title: 'during public beta.',
  description: 'Datum Cloud is ready for prime time, but free to use for now. Feedback welcome!',
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
