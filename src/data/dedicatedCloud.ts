// Shared copy for /dedicated-cloud — imported by both src/pages/dedicated-cloud.astro
// (page render) and src/pages/dedicated-cloud.md.ts (markdown export) so the
// two can never drift out of sync.

export const title = 'Talk to our team';

export const description =
  "Tell us what you're trying to do, and the challenges you have. We'll do the work to align the datacenter, compute, network, and operational assets you need to move with confidence.";

export interface ChecklistItem {
  title: string;
  description: string;
}

export const checklist: ChecklistItem[] = [
  {
    title: 'Built for your stack',
    description:
      'Dedicated hardware, custom locations, and defined economics. From a single availability zone to an edge network in 40 global metros.',
  },
  {
    title: 'Connected from day one',
    description:
      'Anycast, VPC, zero trust, and L7 routing attach the moment hardware is live — no separate vendor, no integration project.',
  },
  {
    title: "Operated by people who've done it",
    description:
      "We've built and run bare-metal and networks at scale. Our deep relationships across datacenters, networking, and silicon mean we can move when others can't.",
  },
];
