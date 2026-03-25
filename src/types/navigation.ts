/**
 * Type definitions for navigation data structure
 */

import type { TabInfo } from '@mintlify/astro/helpers';

export interface TabInfoWithIcon extends TabInfo {
  icon?: string;
  hidden?: boolean;
}

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
  children?: NavSection[];
}

export interface NavFooterSection {
  title: string;
  items: NavItem[];
}

export interface NavFooterDocsSection {
  title: string;
  items: NavItem[];
}

export interface NavData {
  main: NavMainItem[];
  right?: NavItem[];
  footer: NavFooterSection[];
  footerDocs: NavFooterDocsSection[];
  social: NavItem[];
  brand?: NavFooterSection[];
}
