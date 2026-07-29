// Shared copy for /dedicated-cloud — imported by both src/pages/dedicated-cloud.astro
// (page render) and src/pages/dedicated-cloud.md.ts (markdown export) so the
// two can never drift out of sync.

export const meta = {
  title: 'Dedicated Cloud — GPU clusters built and operated by Datum',
  description:
    'Leverage our decades of experience, deep industry relationships, flexible platform, and operational muscle to accelerate your business.',
};

export const hero = {
  eyebrow: 'Dedicated cloud',
  title: 'GPU clusters, built and operated by folks you can trust.',
  description:
    'Leverage our decades of experience, deep industry relationships, flexible platform, and operational muscle to accelerate your business.',
  ctaText: 'Schedule a conversation',
  ctaHref: '#contact',
};

export interface ChecklistItem {
  title: string;
  description: string;
}

export interface BuiltForYouItem extends ChecklistItem {
  /** lucide icon name from src/utils/iconMap.ts */
  icon: string;
}

export const builtForYou = {
  eyebrow: 'Built for you',
  title: "We're like wealth managers, but for AI companies.",
  intro: [
    "It can be frustrating to assemble all the pieces of the digital infrastructure puzzle, and every client is unique. That's why we don't try to pretend it's easy.",
    "Instead, we show up with a simple promise: we'll put the work in, we'll be honest with you, and we'll do our best to help you win.",
  ],
  items: [
    {
      title: 'Architecture & design',
      description: 'Cluster topology, rack layout, and system design matched to your workload.',
      icon: 'waypoints',
    },
    {
      title: 'Supply chain management',
      description: 'Sourcing GPUs, servers, and networking gear from vetted hardware partners.',
      icon: 'package',
    },
    {
      title: 'Data center sourcing',
      description: 'Facility capacity that fits your power, cooling, and location requirements.',
      icon: 'server',
    },
    {
      title: 'Financing options',
      description: "Flexible commercial structures so capex isn't the blocker.",
      icon: 'wallet-minimal',
    },
    {
      title: 'Operations',
      description:
        'Day-to-day management, monitoring, and incident response once the cluster is live.',
      icon: 'settings',
    },
    {
      title: 'Software',
      description: 'The orchestration and platform layer needed to run workloads on the hardware.',
      icon: 'code',
    },
    {
      title: 'Networking',
      description: 'Cluster fabric design and implementation — InfiniBand or Ethernet.',
      icon: 'network',
    },
    {
      title: 'Automation',
      description:
        "Provisioning, scaling, and lifecycle tooling so the cluster doesn't need a large ops team.",
      icon: 'zap',
    },
  ] satisfies BuiltForYouItem[],
};

export const whyDatum = {
  eyebrow: 'Why Datum',
  title: '25 years in bare metal, global networks, and datacenters.',
  items: [
    {
      title: "Built by people who've done this before",
      description:
        'Our team has designed, built, and operated infrastructure at scale since founding Datum.',
    },
    {
      title: 'Transparent by default',
      description: 'We work in the open with every partner in the stack — not around them.',
    },
    {
      title: 'Real hardware partner relationships',
      description:
        'Named categories, not vague categories: hardware Dell, Supermicro, Cisco, data center operators, and network providers. One point of contact instead of five vendor relationships.',
    },
    {
      title: 'Independent, not locked in',
      description:
        'We work across hardware and DC partners rather than owning the stack, so the cluster is designed around your requirements — not our inventory.',
    },
  ] satisfies ChecklistItem[],
  tagline: 'Our datacenter roots run deep.',
};

export interface Operator {
  name: string;
  role: string;
  bio: string;
  /** Strapi author slug — used to look up a real headshot; falls back to an initials tile if not found. */
  slug: string;
  /** Override when the Strapi author record doesn't have `social.linkedin` set. */
  linkedin?: string;
}

export const operators = {
  eyebrow: "We're operators at heart",
  items: [
    {
      name: 'Zac Smith',
      role: 'Co-Founder, CEO',
      bio: "Founded Packet (acquired by Equinix) and led Equinix Metal. Twenty years building bare metal and interconnected infrastructure for the world's most demanding operators.",
      slug: 'zachary-smith',
    },
    {
      name: 'Shelby Lindsey',
      role: 'Lead Network Engineer',
      bio: "Designs and operates the fabric — backbone, peering, and cluster networking — that ties Datum's footprint together.",
      slug: 'shelby-lindsey',
      linkedin: 'https://www.linkedin.com/in/shelby-lindsey-0781b323/',
    },
    {
      name: 'Evan Vetere',
      role: 'Infrastructure Lead',
      bio: "Runs data center sourcing, deployment, and day-two operations across Datum's dedicated GPU footprint.",
      slug: 'evan-vetere',
      linkedin: 'https://www.linkedin.com/in/vetere/',
    },
    {
      name: 'Scot Schuchert-Wells',
      role: 'Software Lead',
      bio: 'Leads the platform and orchestration layer — the software that turns racks of GPUs into a cluster teams can actually use.',
      slug: 'scot-wells',
      linkedin: 'https://www.linkedin.com/in/scot-wells/',
    },
  ] satisfies Operator[],
};

export const contact = {
  eyebrow: 'Contact',
  title: 'Talk to our team.',
  description:
    "Tell us what you're building. We'll come back within one business day with a scoping call and the specialists relevant to your workload.",
  reassurance: [
    'No sales-qualification gauntlet.',
    'Engineering in the first meeting.',
    'Written scope before commercials.',
  ],
};

export const formOptions = {
  gpuGeneration: [
    'Nvidia Hopper (H100)',
    'Nvidia Hopper (H200)',
    'Nvidia Blackwell (B300)',
    'Nvidia Blackwell Ultra (GB300)',
    'AMD Helios',
    'AMD Instinct MI400',
    'AMD Instinct MI350',
  ],
  networking: ['Ethernet', 'InfiniBand'],
  cooling: ['Liquid', 'Air'],
  storage: ['NFS', 'Object', 'Block'],
  fleetManagement: ['Kubernetes', 'Slurm', 'Observability', 'Security', 'Traffic Management'],
  sizingMin: 16,
  sizingMax: 4096,
  sizingDefault: 512,
};

// FAQ content lives in src/content/faq/ (category: "dedicated-cloud"), rendered
// via the shared FAQ.astro component — not duplicated here.
