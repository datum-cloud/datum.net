// src/data/about.ts
// Section copy for /about, /about/team, and /about/in-the-wild — imported by
// the page components and the markdown exports so they can't drift apart.
// Page-level SEO metadata and the logo lists stay in src/content/about/*.mdx.
//
// Figma: node 17489:71378 (/about), node 17529:74750 (/about/team),
// node 17529:87624 (/about/in-the-wild),
// section 17534:89125 (collage scroll transition).

import type { IconName } from '@utils/iconMap';
import type { StrapiAuthorTeam } from '../types/strapi';

export const hero = {
  eyebrow: 'Why Datum?',
  /** The clay-coloured, highlighted fragment sits between `before` and `after`. */
  title: { before: 'We’re a ', highlight: 'different', after: ' kind of cloud...' },
  /** Bold words inside the lead paragraph are wrapped in `{{…}}`. */
  lead: [
    'We believe any {{app}}, any {{company}}, or any {{agent}}',
    'should be able to interact privately and deterministically',
    'with whatever (or whoever) it needs.',
  ],
} as const;

export const foundingInsight = {
  eyebrow: 'The founding insight',
  paragraphs: [
    'The concepts that underpin the modern internet are powerful. But even the most ambitious cloud and AI-native teams lack the ability to compete at scale. It’s too obscure, too analog, too cost-prohibitive. We’re here to change that.',
    'We exist to upgrade the internet with an open, neutral, global network cloud. Built for AI and 100% focused on providers.',
  ],
} as const;

export interface ExploreCard {
  id: string;
  tabLabel: string;
  tabIcon: IconName;
  eyebrow: string;
  title: string;
  description: string;
  cta: { text: string; href: string };
  /** Eyebrow / accent colour of the card, matching the panel artwork. */
  tone: 'slate' | 'pine' | 'canyon';
}

/** Two lines on the in-the-wild page; joined for the About explore card. */
const wildIntroTitle = ['We don’t just build differently,', 'we show up differently.'] as const;

const wildIntro =
  'Networking is in our DNA. But beyond the racks, switches and pipes, there’s a whole lot more to building a network than just the plumbing. We believe real connectivity happens outside of the hardware. This is the team behind your infrastructure.';

export const explore: ExploreCard[] = [
  {
    id: 'team',
    tabLabel: 'Meet the team',
    tabIcon: 'users',
    eyebrow: 'Meet the team',
    title: 'Get to know the humans behind Datum',
    description:
      'We are infrastructure, open source software, and design nerds who love building for the future.',
    cta: { text: 'Explore team', href: '/about/team' },
    tone: 'slate',
  },
  {
    id: 'work',
    tabLabel: 'Work with us',
    tabIcon: 'briefcase-business',
    eyebrow: 'Work with us',
    title: 'Working at Datum',
    description:
      'We’re assembling a team of thoughtful, creative, experienced humans: operators, engineers, artists, communicators, and builders.',
    cta: { text: 'View open roles', href: '/careers' },
    tone: 'pine',
  },
  {
    id: 'wild',
    tabLabel: 'In the wild',
    tabIcon: 'globe',
    eyebrow: 'In the wild',
    title: wildIntroTitle.join(' '),
    description: wildIntro,
    cta: { text: 'Go wild', href: '/about/in-the-wild' },
    tone: 'canyon',
  },
];

export interface WildStory {
  id: string;
  title: string;
  description: string;
  /** Portrait 2:3 or landscape 3:2. */
  aspect: 'tall' | 'short';
}

/**
 * Photo grid for /about/in-the-wild. Column-major, matching Figma 17529:87624.
 * Captions are the frame copy, including ones that do not describe the photo.
 */
export const inTheWild = {
  title: 'in the wild',
  crumb: 'In the Wild',
  introTitle: wildIntroTitle,
  intro: wildIntro,
  columns: [
    [
      {
        id: 'match-day',
        title: 'Match day',
        description:
          'Green flags filled the stands as supporters gathered before the afternoon kickoff.',
        aspect: 'tall',
      },
      {
        id: 'monaco',
        title: 'Morning in Monaco',
        description:
          'A quiet view across Port Hercules before the harbor filled with boats and visitors.',
        aspect: 'short',
      },
      {
        id: 'landmark',
        title: 'A landmark in progress',
        description:
          'The original entrance marker, photographed during the building’s final phase of construction.',
        aspect: 'short',
      },
      {
        id: 'halloween',
        title: 'Halloween parade',
        description:
          'Hand-painted masks and bright costumes lined the street during the annual neighborhood celebration.',
        aspect: 'tall',
      },
    ],
    [
      {
        id: 'meet-me',
        title: 'Meet-me room tour',
        description:
          'A quick photo with the operations team after a walkthrough of the new network facility.',
        aspect: 'short',
      },
      {
        id: 'auzzie',
        title: 'Auzzie burgers',
        description:
          'Dozens of balloons lifted over the valley just after sunrise on a clear autumn morning.',
        aspect: 'tall',
      },
      {
        id: 'sunday-run',
        title: 'Sunday run',
        description:
          'Fresh pastries and coffee from a small bakery we found around the corner from the hotel.',
        aspect: 'short',
      },
      {
        id: 'sound-check',
        title: 'Sound check',
        description: 'The stage crew tested the bass rig before doors opened for the evening show.',
        aspect: 'short',
      },
    ],
    [
      {
        id: 'training',
        title: 'Training on the ice',
        description:
          'A Danish speed skater takes a final practice lap ahead of the national championships.',
        aspect: 'tall',
      },
      {
        id: 'lab',
        title: 'From the lab',
        description:
          'A close look at the latest Arm-based processor board during an early hardware evaluation.',
        aspect: 'tall',
      },
      {
        id: 'coffee',
        title: 'First coffee of the day',
        description:
          'A strong morning brew, served in the studio kitchen before the team’s weekly planning session.',
        aspect: 'short',
      },
    ],
  ],
} as const satisfies {
  title: string;
  crumb: string;
  introTitle: readonly string[];
  intro: string;
  columns: WildStory[][];
};

export const twinsInTheLoop = {
  eyebrow: 'Twins in the loop',
  title: 'Founders thinking out loud',
  description:
    'Entrepreneurship means learning something new every day. Twins in the Loop is where we share the lessons worth talking about and use writing to question, clarify and sharpen our thinking.',
  cta: { text: 'View all articles' },
} as const;

/**
 * Where "Twins in the Loop" lives. Posts are managed in Strapi (`twins-post`),
 * but the blog itself is a separate site — a post links to its `canonical` (or
 * `embedUrl`) when Strapi has one, otherwise to `${TWINS_BASE_URL}/${slug}`.
 */
export const TWINS_BASE_URL = 'https://twins-in-the-loop.com';

/**
 * Strapi stores a twins post's author as a short key, not a relation to the
 * `authors` collection (which has two "Zach Smith" entries, so it can't be
 * resolved by name). Unknown keys fall back to the capitalised key.
 */
const TWINS_AUTHORS: Record<string, string> = {
  zac: 'Zac Smith',
  jacob: 'Jacob Smith',
};

export const twinsAuthorName = (key: string | null | undefined): string => {
  const trimmed = key?.trim();
  if (!trimmed) return '';
  return TWINS_AUTHORS[trimmed.toLowerCase()] ?? trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export const team = {
  eyebrow: 'The team',
  title: 'Meet the people behind Datum',
  /** Two lines, as designed; joined with a space for metadata and markdown. */
  descriptionLines: [
    'We are infrastructure, open source software,',
    'and design nerds who love building for the future.',
  ],
  cta: {
    text: 'Interested in joining the Datum team?',
    button: { text: 'Get in touch', href: '/contact' },
  },
} as const;

export interface TeamFilter {
  /** `all` shows everyone; the rest match the Strapi author `team` enum. */
  id: 'all' | Exclude<StrapiAuthorTeam, 'founders' | 'team'>;
  label: string;
}

/** `team.descriptionLines` as one sentence. */
export const teamDescription = team.descriptionLines.join(' ');

export const teamFilters: TeamFilter[] = [
  { id: 'all', label: 'Everyone' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'operations', label: 'Operations' },
];
