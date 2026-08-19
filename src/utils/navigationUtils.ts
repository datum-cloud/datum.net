import type {
  NavFooterCard,
  NavFooterSection,
  NavItem,
  NavMainItem,
  NavMode,
  NavSection,
} from '@/src/types/navigation';

/**
 * Resolves the site MODE the same way middleware does.
 * @returns Current `development` | `production` | `local` value
 */
export const getSiteMode = (): NavMode => (process.env.MODE || import.meta.env.MODE) as NavMode;

const isVisibleInMode = (mode: NavMode | undefined, current: NavMode): boolean =>
  !mode || mode === current;

const filterNavItems = (items: NavItem[], current: NavMode): NavItem[] =>
  items.filter((item) => isVisibleInMode(item.mode, current));

const filterNavSections = (sections: NavSection[], current: NavMode): NavSection[] =>
  sections
    .map((section) => ({ ...section, items: filterNavItems(section.items, current) }))
    .filter((section) => section.items.length > 0);

/**
 * Drops nav items whose `mode` does not match the current environment.
 * @param items - Top-level main-nav entries
 * @param current - Override for tests; defaults to `getSiteMode()`
 * @returns Items (and nested children / aside cards) visible in that mode
 */
export const filterNavMain = (
  items: NavMainItem[],
  current: NavMode = getSiteMode()
): NavMainItem[] =>
  items
    .filter((item) => isVisibleInMode(item.mode, current))
    .map((item) => ({
      ...item,
      children: item.children ? filterNavSections(item.children, current) : undefined,
      asideCards: item.asideCards ? filterNavItems(item.asideCards, current) : undefined,
    }));

/**
 * Drops footer cards whose `mode` does not match the current environment.
 */
export const filterNavFooterCards = (
  cards: NavFooterCard[],
  current: NavMode = getSiteMode()
): NavFooterCard[] => cards.filter((card) => isVisibleInMode(card.mode, current));

/**
 * Drops footer link sections whose items are all filtered out, and items whose
 * `mode` does not match the current environment.
 */
export const filterNavFooterSections = (
  sections: NavFooterSection[],
  current: NavMode = getSiteMode()
): NavFooterSection[] =>
  sections
    .map((section) => ({ ...section, items: filterNavItems(section.items, current) }))
    .filter((section) => section.items.length > 0);
