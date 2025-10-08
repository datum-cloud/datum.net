/**
 * Type definitions for navigation data structure
 */

export interface NavItem {
  text: string;
  href: string;
  icon?: string;
  isExternal?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export interface NavMainItem {
  text: string;
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
