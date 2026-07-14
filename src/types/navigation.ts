/**
 * Type definitions for navigation data structure
 */

import type { SecondaryTabNavItem } from '@/src/types/common';

export interface NavItem {
  text: string;
  desc?: string;
  href: string;
  icon?: string;
  image?: string;
  isExternal?: boolean;
  label?: string;
}

export interface NavSection {
  title?: string;
  isCardLayout?: boolean;
  items: NavItem[];
}

export interface NavMainItem {
  text: string;
  title?: string;
  desc?: string;
  href: string;
  isExternal?: boolean;
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
