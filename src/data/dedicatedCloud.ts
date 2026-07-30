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
  title: 'GPU clusters, built and operated by folks you can trust',
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
  title: 'Like wealth managers, but for AI companies',
  intro: [
    'It’s no easy task to assemble all the pieces of the digital infrastructure puzzle, and each situation at scale is unique.',
    "That's why we show up with a simple promise: put the work in, be honest and transparent, and do our best to help you win.",
  ],
  items: [
    {
      title: 'Architecture & design',
      description: 'Cluster topology, rack layout, and system design matched to your requirements.',
      icon: 'waypoints',
    },
    {
      title: 'Supply chain',
      description: 'Sourcing GPUs, servers, and networking gear from vetted hardware partners.',
      icon: 'package',
    },
    {
      title: 'Data center and power',
      description: 'Facility capacity that fits your power, cooling, and location requirements.',
      icon: 'server',
    },
    {
      title: 'Beyond bare metal',
      description:
        'We deliver fully managed bare metal as well as the right connectivity and orchestration.',
      icon: 'wallet-minimal',
    },
    {
      title: 'Cluster Networking',
      description:
        'We follow best practices and can deliver either InfiniBand or Ethernet based deployments.',
      icon: 'network',
    },
    {
      title: 'Operations',
      description:
        'Day-to-day management, monitoring, and incident response once the cluster is live.',
      icon: 'zap',
    },
  ] satisfies BuiltForYouItem[],
};

export const whyDatum = {
  eyebrow: 'Why Datum',
  title: '25 years in the trenches',
  items: [
    {
      title: "Built by people who've done this before",
      description:
        "Our core team has been in the hosting, bare metal, global networks, and datacenter game since the early 2000's. We love this stuff!",
    },
    {
      title: 'Transparent and honest',
      description:
        'Foundational infrastructure is all about trust, and we earn it by being upfront, showing the details behind the numbers, and showing up with integrity.',
    },
    {
      title: 'Hardware and datacenter relationships',
      description:
        "Securing the supply chain for advanced GPU clusters involves agility and iteration. We orchestrate hardware, power and facility stakeholders so you don't have to.",
    },
    {
      title: 'Enabled by technology, driven by operations',
      description:
        "AI infrastructure requires advanced networking, platform automation, and operational muscle. That's where we earn our keep, and where we shine.",
    },
  ] satisfies ChecklistItem[],
  tagline: 'Our datacenter roots run deep',
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
      bio: 'Twenty years building bare metal and interconnected infrastructure for demanding customers.',
      slug: 'zachary-smith',
    },
    {
      name: 'Shelby Lindsey',
      role: 'Lead Network Engineer',
      bio: 'A physical networking guru who oversees our backbone, peering, and edge fabrics.',
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
      bio: 'Leads the platform and orchestration layers that provide the reliability and creature comforts of our cloud.',
      slug: 'scot-wells',
      linkedin: 'https://www.linkedin.com/in/scot-wells/',
    },
  ] satisfies Operator[],
};

export const contact = {
  eyebrow: 'Contact',
  title: 'Talk to our team',
  description:
    "Let us know what you're building. We'll come back within 1-2 business days, arrange a scoping call, and bring the right folks to the table.",
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
