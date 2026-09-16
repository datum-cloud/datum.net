// Shared copy for /dedicated-cloud — imported by both src/pages/dedicated-cloud.astro
// (page render) and src/pages/dedicated-cloud.md.ts (markdown export) so the
// two can never drift out of sync.

export const meta = {
  title: 'Dedicated GPU Clusters - Datum Dedicated Cloud',
  description:
    'Get white-glove support for enterprise networking needs – from architecture and design to fully managed connectivity and orchestration.',
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

export interface DedicatedServiceItem {
  /** Tab id — also the anchor Alpine tracks and the panel's `aria-labelledby` target. */
  id: string;
  /** Rail label */
  label: string;
  /** lucide icon name from src/utils/iconMap.ts */
  icon: string;
  /** Panel heading, one array entry per designed line break */
  titleLines: string[];
  description: string;
  /** Pricing-model copy behind the panel's info icon */
  tooltip: string;
}

export const dedicatedServices = {
  eyebrow: 'Our dedicated services',
  title: "Four solutions. What's right for you?",
  items: [
    {
      id: 'connected-metal',
      label: 'Connected Metal',
      icon: 'hard-drive',
      titleLines: ['GPU / CPU as a service'],
      description:
        'Delivered as fully operated bare metal, this is the best approach if you want Datum to carry the server, network and datacenter CAPEX.',
      tooltip:
        'a committed term contract with an effective hourly rate per GPU. Setup and usage fees apply (data transfer, interconnection, etc)',
    },
    {
      id: 'connected-colo',
      label: 'Connected Colo',
      icon: 'server',
      titleLines: ['Your CAPEX', 'meets our expertise'],
      description:
        'We designed this solution to combine the experience of bare metal with the economics of colocation and the ability to depreciate server CAPEX.',
      tooltip:
        'a committed term contract for non-server costs (network, colocation, power, operations) with a lease buy out option for server CAPEX.',
    },
    {
      id: 'ai-storage-fabric',
      label: 'AI Storage Fabric',
      icon: 'hard-drive-download',
      titleLines: ['Moving your data', 'to the compute'],
      description:
        'We help improve performance and lower costs with regional storage hubs and an optimized network backbone with smart caching. Et voila?',
      tooltip:
        'a committed term contract that includes managed colocation alongside network and data transfer fees.',
    },
    {
      id: 'advisory-services',
      label: 'Advisory Services',
      icon: 'message-square-quote',
      titleLines: ["We'll leave the light on"],
      description:
        'Sometimes you need a helping hand, preferable with a lot of experience and deep WhatsApp connections. Architecture, supply chain, procurement, and more.',
      tooltip: 'flat monthly retainer or traditional agent-based commissions.',
    },
  ] satisfies DedicatedServiceItem[],
};

export const whyDatum = {
  eyebrow: 'Why Datum',
  title: '25 years in the trenches',
  items: [
    {
      title: 'Not our first rodeo',
      description:
        "Our core team has been in the hosting, bare metal, global networks, and datacenter game since the early 2000's. We love this stuff!",
    },
    {
      title: 'Transparent & honest',
      description:
        'Foundational infrastructure is all about trust, and we earn it by being upfront, showing the details behind the numbers, and showing up with integrity.',
    },
    {
      title: 'Industry relationships',
      description:
        "Securing the supply chain for advanced GPU clusters involves agility and iteration. We orchestrate hardware, power and facility stakeholders so you don't have to.",
    },
    {
      title: 'Technology & operations',
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
  /** Strapi author slug — used to look up the pine-forge headshot; falls back to an initials tile if not found. */
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
      name: 'Megan O’Connor',
      role: 'Chief of Staff & Strategic Accounts',
      bio: 'Turns complex infrastructure into clear, human-led paths to what’s next for our biggest accounts.',
      slug: 'megan-oconnor',
      linkedin: 'https://www.linkedin.com/in/meganoconnorco/',
    },
    {
      name: 'Shelby Lindsey',
      role: 'Lead Network Engineer',
      bio: 'A physical networking guru who oversees our backbone, peering, and edge fabrics.',
      slug: 'shelby-lindsey',
      linkedin: 'https://www.linkedin.com/in/shelby-lindsey-0781b323/',
    },
    {
      name: 'Nicholas Schmidt',
      role: 'GPU Solutions',
      bio: 'Two-plus decades building internet infrastructure, now bringing that range to compute and capacity here at Datum.',
      slug: 'nicholas-schmidt',
      linkedin: 'https://www.linkedin.com/in/nicholas-schmidt-26983b1/',
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
