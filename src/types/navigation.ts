/**
 * Type definitions for navigation data structure
 */

import type { SecondaryTabNavItem } from '@/src/types/common';

/** Matches `process.env.MODE`. Omit to show the item in every environment. */
export type NavMode = 'development' | 'production' | 'local';

export interface NavItem {
  text: string;
  desc?: string;
  href: string;
  icon?: string;
  image?: string;
  isExternal?: boolean;
  label?: string;
  mode?: NavMode;
}

export interface NavSection {
  title?: string;
  /** When set, the section header in mega-menus links to this URL (e.g. Platform pillars). */
  href?: string;
  isCardLayout?: boolean;
  items: NavItem[];
}

export interface NavMainItem {
  text: string;
  title?: string;
  desc?: string;
  href: string;
  isExternal?: boolean;
  /** When set, the item is omitted unless `process.env.MODE` matches. */
  mode?: NavMode;
  isMegaDropdown?: boolean;
  /** Visual theme for the dropdown panel. 'dark' renders the midnight-fjord mega-menu. */
  theme?: 'dark';
  /** Feature cards shown alongside the dropdown's section columns (e.g. Locations, Essentials). */
  asideCards?: NavItem[];
  children?: NavSection[];
}

export interface NavFooterSection {
  title: string;
  items: NavItem[];
}

export interface NavFooterCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  isExternal?: boolean;
  mode?: NavMode;
}

export interface NavFooterDocsSection {
  title: string;
  items: NavItem[];
}

export interface NavData {
  productTabs: SecondaryTabNavItem[];
  main: NavMainItem[];
  right?: NavItem[];
  footerCards: NavFooterCard[];
  footer: NavFooterSection[];
  footerDocs: NavFooterDocsSection[];
  social: NavItem[];
  brand?: NavFooterSection[];
}
