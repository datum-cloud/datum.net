/**
 * Type definitions for navigation data structure
 */

export interface NavItem {
  text: string;
  href: string;
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

export interface NavData {
  main: NavMainItem[];
  footer: NavMainItem[];
  social: NavItem[];
}
