// src/data/pricing.ts
// Section content for /pricing — imported by both src/pages/pricing.astro (page
// render) and src/pages/pricing.md.ts (markdown export) so the two can never
// drift out of sync. Page-level SEO/OG metadata lives in
// src/content/pages/pricing.mdx, and the FAQ copy in src/content/faq/*.mdx
// (category: "pricing"), matching the split every other content-collection-backed
// page uses. Figma node 16187:92970.

import type { IconName } from '@utils/iconMap';

/** Both "talk to us" affordances land on the Dedicated Cloud form's contact
 *  section rather than /contact — see issue #1636. */
const TALK_TO_US_HREF = '/dedicated-cloud#contact';

export const hero = {
  title: 'Pricing',
  description: 'Usage-based and transparent, the way pricing should be.',
  primaryCta: { text: 'Start for free', href: 'https://auth.datum.net/id/signup' },
};

export const callout = {
  title: 'Why is pricing so complicated?',
  description: "Here's how we make it simple",
  items: ['No feature gates', 'No seat limits', 'No hidden fees'],
  // Points at the blog index until the pricing-rationale post publishes, then
  // should be swapped for that post's permalink.
  cta: { text: 'Learn more', href: '/blog' },
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
  /** Value in the "Unit of measure" column; an em dash where the design shows one. */
  unit: string;
  lines?: PriceLine[];
  /** Renders the bold monospace FREE treatment instead of a figure. */
  free?: boolean;
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

export interface RateGroup {
  /** Drives the `pricing-rate-category--{id}` tint modifier. */
  id: 'deliver' | 'build' | 'connect' | 'transfer';
  name: string;
  icon: IconName;
  /** Optional callout pinned under the category label (data transfer only). */
  note?: { text: string; icon: IconName };
  features: RateFeature[];
}

export const rates = {
  columns: ['Category', 'Feature', 'Unit of measure', 'Price per unit'],
  groups: [
    {
      id: 'deliver',
      name: 'Deliver',
      icon: 'send',
      features: [
        {
          name: 'DNS',
          badge: 'Coming soon',
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
          rows: [{ unit: 'Requests', lines: [{ amount: '0.60', suffix: ' per million' }] }],
        },
      ],
    },
    {
      id: 'build',
      name: 'Build',
      icon: 'construction',
      features: [
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
      ],
    },
    {
      id: 'connect',
      name: 'Connect',
      icon: 'network',
      features: [
        {
          name: 'Gateways',
          badge: 'Coming Q3 2026',
          rows: [{ unit: '—', lines: [{ amount: '0.045', suffix: ' per hour' }] }],
        },
        {
          name: 'Tunnels',
          rows: [{ unit: 'Endpoint', lines: [{ amount: '0.01', suffix: ' per hour' }] }],
        },
        {
          name: 'Public IPv4',
          rows: [{ unit: '—', lines: [{ amount: '0.005', suffix: '/IP-hr' }] }],
        },
      ],
    },
    {
      id: 'transfer',
      name: 'Data transfer',
      icon: 'arrow-left-right',
      note: { text: 'Ingress to our network is always free', icon: 'party-popper' },
      features: [
        {
          name: 'Egress',
          info: "Traffic leaving Datum's network for the public internet.",
          rows: [
            { unit: '0 – 200 GB', free: true },
            { unit: '200 GB – 10 TB', lines: [{ amount: '0.05', suffix: ' per GB' }] },
            { unit: '10 – 150 TB', lines: [{ amount: '0.04', suffix: ' per GB' }] },
            { unit: '150 – 500 TB', lines: [{ amount: '0.03', suffix: ' per GB' }] },
            { unit: '500 TB+', link: { text: 'Contact sales', href: TALK_TO_US_HREF } },
          ],
        },
        {
          name: 'Internal',
          info: 'Traffic between Datum regions and services.',
          rows: [
            { unit: 'Same region', free: true },
            { unit: 'Cross-region', lines: [{ amount: '0.03', suffix: ' per GB' }] },
          ],
        },
      ],
    },
  ] satisfies RateGroup[],
};

export const faqTitle = 'Frequently Asked Questions';

/** Prefooter copy override for this page — Figma node 16187:93826. */
export const prefooter = {
  titleAccent: 'Build now.',
  title: 'Pay nothing.',
  description:
    "The complete networking cloud, free while we're in public beta — with advance notice before anything changes.",
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
