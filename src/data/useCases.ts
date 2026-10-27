// src/data/useCases.ts
// Shared copy for /use-cases — imported by both src/pages/use-cases.astro (page
// render) and src/pages/use-cases.md.ts (markdown export) so the two can never
// drift out of sync. Figma node 18434:82823.

import type { IconName } from '@utils/iconMap';

export const meta = {
  title: 'Use Cases - Datum',
  description:
    "We're solving problems for the next 1k clouds: hyperscale-style networking, private-by-default connectivity, edge workloads, and GPU or CPU capacity.",
};

export interface UseCaseCard {
  icon: IconName;
  /** Small uppercase label beside the icon (obstacles only). */
  label?: string;
  title: string;
  description: string;
}

/** Figma nodes 18434:82910 / 18442:84073. */
export const hero = {
  eyebrow: 'Use cases',
  /** Rendered with `titleHighlight` appended in the accent treatment. */
  title: "We're solving problems for the next",
  titleHighlight: '1k clouds',
  items: [
    {
      icon: 'network',
      title: 'Add hyperscale style networking to your platform',
      description:
        'Give agents, devs, and enterprises the observability, connectivity, and network controls they enjoy at big public clouds.',
    },
    {
      icon: 'shield-check',
      title: 'Go "private by default" and sleep better at night',
      description:
        'Reduce attack surface areas and accelerate performance by taking agentic workloads off the public internet.',
    },
    {
      icon: 'map-pin-check-inside',
      title: 'Push workloads to the edge of a network you control',
      description:
        'From inference and sandboxes to routers and gateways, push key workloads to sit in between all of the clouds.',
    },
    {
      icon: 'cpu',
      title: 'Unblock growth with GPU or CPU capacity',
      description:
        'Leverage our experience, industry relationships, platform, and operational muscle to deliver capacity in the way you need it.',
    },
  ] satisfies UseCaseCard[],
};

/** Figma node 18451:84236. */
export const agents = {
  caption:
    "Humans are great, but we've optimized our platform for agents first and developers next.",
  // https://www.youtube.com/watch?v=FWE1LNmE3Fo — same autoplay/mute params as
  // HOMEPAGE_FEATURE_VIDEO_EMBED_URL.
  videoEmbedUrl: 'https://www.youtube.com/embed/FWE1LNmE3Fo?autoplay=1&mute=1',
  videoLabel: 'Play agent-first platform video',
};

/** Figma node 18434:83456. */
export const obstacles = {
  eyebrow: 'Obstacles',
  title: "What's holding you back?",
  items: [
    {
      icon: 'brain-circuit',
      label: 'Inference Clouds',
      title: 'Users want answers now, but your capacity says “hold the line.”',
      description:
        'Datum puts GPU and CPU capacity closer to users, cloud on ramps, and enterprise networks. Already have the gear? We can wire it into a global backbone you control.',
    },
    {
      icon: 'container',
      label: 'Sandboxes',
      title: 'Your biggest customers love you, but now they want more control.',
      description:
        'Datum gives you public cloud control anywhere with stable IPs, a virtual backbone across all of your infrastructure, and connectors for zero-trust customer access.',
    },
    {
      icon: 'flask-round',
      label: 'Frontier Labs',
      title: 'You’re here to build what’s next, not everything under the hood.',
      description:
        'Datum can accelerate your vision with a combination of datacenter forward engineering, site selection, procurement, and a flexible platform backed by open source.',
    },
  ] satisfies UseCaseCard[],
};

/** Figma node 18436:83609. */
export const help = {
  title: "Honestly, we're here to help.",
  description:
    "If your value sits on top of infrastructure, we've built a platform and a team that can help you connect the dots and move faster.",
  primaryCta: {
    text: 'Chat with a founder',
    href: '/contact',
    icon: 'message-square' as IconName,
  },
  secondaryCta: { text: 'Start building for free', href: 'https://auth.datum.net/id/signup' },
};
