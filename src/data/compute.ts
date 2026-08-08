// src/data/compute.ts
// Section content for /platform/compute — imported by both
// src/pages/platform/compute.astro (page render) and
// src/pages/platform/compute.md.ts (markdown export) so the two can never drift
// out of sync. Page-level SEO/OG metadata lives in
// src/content/pages/platform/compute.mdx instead, per the same split every other
// content-collection-backed page uses (see platform/dns.astro).
//
// Figma: node 15991:8507 (page), node 15878:66123 (expanded use-case panels).

import type { IconName } from '@utils/iconMap';

export const breadcrumbs = [
  { text: 'Platform', href: '/platform' },
  { text: 'Build', href: '/platform/build' },
  { text: 'Compute', href: '/platform/compute' },
];

const SIGNUP_URL = 'https://auth.datum.net/id/signup';
const DOCS_URL = 'https://www.datum.net/docs/compute';

/** One block of terminal output — rendered with a blank line between blocks. */
export type TerminalBlock = string[];

export interface TerminalContent {
  /** Window title, centred in the title bar. */
  title: string;
  /** Shows the green "● live" badge on the right of the title bar. */
  live?: boolean;
  blocks: TerminalBlock[];
  /** Draws a blinking block cursor after the last line. */
  cursor?: boolean;
}

const titleLead = 'Build';

/**
 * The clay-coloured fragment of the headline cycles through these in the hero.
 * Per the Figma annotation on node 15991:8580 — the first entry is what renders
 * before Alpine hydrates and under `prefers-reduced-motion`.
 */
const titlePhrases = [
  'ephemeral databases',
  'AI agent sandboxes',
  'build & test runners',
  'game servers',
  'headless browsers',
] as const;

const titleTail = 'that cold-start in 10 milliseconds';

export const hero = {
  badge: 'Compute',
  badgeIcon: 'computer' as IconName,
  titleLead,
  titlePhrases,
  titleTail,
  /** Flat headline for SEO, JSON-LD and the markdown export. */
  title: `${titleLead} ${titlePhrases[0]} ${titleTail}`,
  description:
    "VM-grade isolation, a CLI experience that devs and agents love, with no weird sales gates; all backed by Datum's global network and cross-cloud galactic VPC private networking.",
  primaryCta: { text: 'Try Datum Compute', href: SIGNUP_URL },
  secondaryCta: { text: 'View documentation', href: DOCS_URL },
  terminal: {
    title: '~/sandbox — datum',
    live: true,
    cursor: true,
    blocks: [
      [
        '$ datum workload create sandbox \\',
        '    --image ghcr.io/acme/agent:latest \\',
        '    --metro DFW,AMS,SYD --min 0 --max 50',
        '✔ workload/sandbox created',
        '✔ 3 metros · scale-to-zero enabled',
      ],
      [
        '$ datum workload scale sandbox --to 25',
        '✔ 25 instances booted in 9ms (p50)',
        '✔ placement: DFW 9 · AMS 8 · SYD 8',
      ],
      [
        '$ datum vpc attach sandbox --network core',
        '✔ attached to Galactic VPC "core"',
        '✔ private egress only · no public ingress',
      ],
      [
        '$ datum workload logs sandbox --follow',
        'agent-01  ready  8ms',
        'agent-02  ready  7ms',
        'agent-03  ready  9ms',
        '$ ',
      ],
    ],
  } satisfies TerminalContent,
};

export interface MeterBar {
  label: string;
  /** Displayed on the right of the label, in the mono face. */
  value: string;
  /** Fill width as a percentage of the track. */
  fill: number;
  tone: 'moss' | 'alert';
  /** Bar grow duration in ms — scaled to the boot time so fast stacks snap and slow ones crawl. */
  durationMs: number;
}

export const performance = {
  eyebrow: 'Performance',
  title: 'Fast-booting VMs for any code',
  description: 'Datum Compute unlocks intelligence at the edge.',
  points: [
    'Lightweight VMs that start and stop in milliseconds',
    'Deploy any containerized application',
    'Private networking that spans clouds',
    'Autoscaling and pay-as-you-go pricing',
    'Automatic health checks and monitoring',
  ],
  cta: { text: 'Try Datum Compute', href: SIGNUP_URL },
  chart: {
    title: 'How we stack up:',
    // Fills mirror the Figma bar widths (24px / 150px / full of a 522px track).
    bars: [
      { label: 'microVM', value: '<10ms', fill: 5, tone: 'moss', durationMs: 150 },
      { label: 'Container cold start', value: '~400ms', fill: 29, tone: 'moss', durationMs: 800 },
      { label: 'Traditional VM', value: '30s+', fill: 100, tone: 'alert', durationMs: 3200 },
    ] satisfies MeterBar[],
    caption:
      'Instances boot on demand and scale back to zero when idle, so an idle sandbox costs nothing while staying instantly available.',
  },
};

export interface UseCase {
  /** Anchor id and Alpine panel key. */
  id: string;
  /** lucide icon name from src/utils/iconMap.ts */
  icon: IconName;
  title: string;
  description: string;
  points: string[];
  cta: { text: string; href: string };
  terminal: TerminalContent;
}

export const useCases = {
  eyebrow: 'Any workload',
  title: 'Use Cases',
  description: 'A sample of what Datum Compute can run for you.',
  items: [
    {
      id: 'sandboxes',
      icon: 'container',
      title: 'Sandboxes',
      description:
        'Run untrusted or agent-generated code inside a hardware-isolated VM instead of a shared container, with per-tenant boundaries you can actually defend.',
      points: [
        'Strong VM isolation per tenant',
        'Launch a sandbox in <10ms',
        'Fork sub-agents in milliseconds',
        'Checkpoint and restore on demand',
        '100K+ scale-to-zero instances per server',
      ],
      cta: { text: 'View docs', href: DOCS_URL },
      terminal: {
        title: 'sandboxes — quick sample',
        live: true,
        blocks: [
          [
            '$ datum sandbox run --image ghcr.io/acme/agent',
            '  --isolation vm --ttl 15m',
            '✔ sandbox-7f21 ready in 8ms',
            '✔ fork sandbox-7f21 → sandbox-7f22 (6ms)',
          ],
        ],
      },
    },
    {
      id: 'headless-browsers',
      icon: 'globe',
      title: 'Headless browsers',
      description:
        'Spin up a fresh browser per session in milliseconds, scrape or render at scale, then tear it down without paying for idle capacity.',
      points: [
        'One clean browser per session',
        'Cold start in single-digit milliseconds',
        'Burst to thousands of parallel pages',
        'Scale back to zero between jobs',
      ],
      cta: { text: 'View docs', href: DOCS_URL },
      terminal: {
        title: 'headless browsers — quick sample',
        live: true,
        blocks: [
          [
            '$ datum workload create browser',
            '  --image ghcr.io/datum/chromium',
            '  --min 0 --max 2000',
            '✔ 1,842 sessions live · 0 idle cost',
          ],
        ],
      },
    },
    {
      id: 'ai-agents',
      icon: 'bot',
      title: 'AI agents',
      description:
        'Give each agent run its own disposable machine with GPU attachment available when inference or training needs it.',
      points: [
        'A private machine per agent run',
        'Attach GPUs only for the steps that need them',
        'Snapshot mid-run and resume later',
        'Private egress through Galactic VPC',
      ],
      cta: { text: 'View docs', href: DOCS_URL },
      terminal: {
        title: 'ai agents — quick sample',
        live: true,
        blocks: [
          [
            '$ datum workload create agent-run',
            '  --gpu l40s:1 --metro DFW',
            '✔ agent-run booted · gpu attached',
            '✔ checkpoint saved (9ms)',
          ],
        ],
      },
    },
  ] satisfies UseCase[],
};

export interface Feature {
  /** Alpine panel key, also used for the tab's `aria-controls`. */
  id: string;
  /** Short label for the tab strip. */
  label: string;
  title: string;
  description: string;
  /** Numbered stages in the dashed diagram on the right of the panel. */
  steps: string[];
  /** Small print under the diagram — shared Unikraft attribution on every panel. */
  note?: string;
}

const UNIKRAFT_NOTE =
  'Being transparent: the millisecond snapshot, fork, and restore behaviour behind Datum Compute comes from Unikraft, the open source unikernel project. We build our Kubernetes-native control plane, metro placement, and Galactic VPC networking on top of it — and both layers stay open source.';

export const features = {
  eyebrow: "Features you'll love",
  titleLead: 'Virtual machines that are tiny',
  /** Rendered in Canyon Clay between the two halves of the headline. */
  titleAccent: 'and',
  titleTail: 'mighty',
  title: 'Virtual machines that are tiny and mighty',
  items: [
    {
      id: 'forking',
      label: 'Forking',
      title: 'Forking',
      description:
        'Fork a live instance in 10 milliseconds, irrespective of its workload (its children too). Fork databases, sub-agents, or parallel headless browsers to retrieve a page faster, run parallel debugging or build sessions, or whatever your use case demands.',
      steps: ['Parent VM', 'Children VMs', 'Grandchildren'],
      note: UNIKRAFT_NOTE,
    },
    {
      id: 'templates',
      label: 'Templates',
      title: 'Templates',
      description:
        'Bake a fully booted instance — dependencies installed, caches warm, services listening — into a reusable template, then start from that exact state instead of paying the setup cost on every run.',
      steps: ['Base image', 'Warm template', 'Instant boot'],
      note: UNIKRAFT_NOTE,
    },
    {
      id: 'checkpoints',
      label: 'Checkpoints',
      title: 'Checkpoints',
      description:
        'Capture full memory and disk state in under 10 milliseconds. Pause an agent mid-task, keep the snapshot for as long as you need, and resume exactly where it left off without replaying any work.',
      steps: ['Running', 'Checkpoint <10ms', 'Resume'],
      note: UNIKRAFT_NOTE,
    },
    {
      id: 'migration',
      label: 'Migration',
      title: 'Migration',
      description:
        'Move a running instance between hosts or metros with the same snapshot machinery. Drain a host for maintenance or follow demand across regions without dropping in-flight sessions.',
      steps: ['Metro DFW', 'Snapshot in flight', 'Metro AMS'],
      note: UNIKRAFT_NOTE,
    },
    {
      id: 'persistent-storage',
      label: 'Persistent Storage',
      title: 'Persistent storage',
      description:
        'Attach durable volumes that outlive any single instance. Stateful workloads such as databases and build caches keep their data while the compute around them scales up, down, and back to zero.',
      steps: ['Instance', 'Attached volume', 'Durable after exit'],
      note: UNIKRAFT_NOTE,
    },
    {
      id: 'autoscale',
      label: 'Autoscale',
      title: 'Autoscale',
      description:
        'Scale from zero to thousands of instances on request volume or your own metrics, then all the way back to zero when traffic stops. Because restore is measured in milliseconds, idle costs nothing and cold requests still feel warm.',
      steps: ['Zero', 'Burst', 'Zero again'],
      note: UNIKRAFT_NOTE,
    },
  ] satisfies Feature[],
};
