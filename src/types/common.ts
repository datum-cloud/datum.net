import type { ImageMetadata } from 'astro';

export interface LayoutProps {
  title: string;
  description?: string;
  image?: ImageMetadata;
  article?: boolean;
  publishDate?: Date;
  author?: string;
  noindex?: boolean;
  canonical?: string;
  fluid?: boolean;
  dataTheme: string;
  bodyClass?: string;
  jsonLd?: Record<string, unknown>;
  meta?: {
    title?: string;
    description?: string;
    image?: string;
    keywords?: string[];
    og?: {
      title?: string;
      description?: string;
      image?: ImageMetadata;
      url?: string;
    };
  };
}

export interface NotFoundProps {
  title?: string;
  message?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  prevUrl?: string;
  nextUrl?: string;
}

export interface HeroProps {
  iconName?: string;
  title?: string;
  titleTag?: 'h1' | 'h2';
  subtitle?: string;
  description?: string;
  class?: string;
  imagePath?: ImageMetadata;
  hideContent?: boolean;
  /** Hides the hero content container (tabs, title, section lines) */
  hideHero?: boolean;
  /** Renders decorative corner grid lines inside the hero container */
  showSectionLines?: boolean;
  /** Which corners to draw when showSectionLines is true. Defaults to all four. */
  sectionLines?: Pick<SectionLineProps, 'left' | 'right' | 'top' | 'bottom'>;
  /** Extra class(es) applied to the nav bar itself (e.g. to match a page's background) */
  navClass?: string;
  /** Colors the trailing word(s) of the title with a platform accent, so copy edits keep the highlight without hand-authored markup */
  titleHighlightVariant?: 'pine' | 'canyon' | 'connect';
  /** Number of trailing words to highlight when titleHighlightVariant is set (default 1) */
  titleHighlightWords?: number;
}

export interface NavProps {
  /** Extra class(es) applied to the nav bar container (e.g. to match a page's background) */
  class?: string;
}

export interface HomeHeroProps {
  title?: string;
  description?: string;
}

export interface ArticleProps {
  articleId?: string;
  showSidebar?: boolean;
  class?: string;
}

export interface SidebarItems {
  slug: string;
  label: string;
  childs?: { slug: string; label: string; title?: string; order: number }[];
}

export interface SidebarProps {
  selectedId: string;
  items: SidebarItems[];
}

export interface LegalNavItem {
  id: string;
  title: string;
}

export interface LegalSidebarProps {
  items: LegalNavItem[];
  currentId: string;
}

export interface ContentProps {
  content: {
    id: string;
    data: {
      title: string;
      items?: string[];
      images?: Array<{
        img: ImageMetadata;
        alt?: string;
      }>;
      link?: {
        url: string;
        label: string;
      };
      companies?: Array<{
        img: ImageMetadata;
        alt?: string;
      }>;
      investors?: Array<{
        img: ImageMetadata;
        alt?: string;
      }>;
    };
    body: string;
    filePath: string;
    collection?: string;
  };
}

export interface HandbookProps {
  handbooks: Array<{
    id: string;
    data: {
      title: string;
      draft: boolean;
      sidebar: {
        order?: number;
        label?: string;
        badge?: { text: string; variant?: 'info' | 'caution' | 'danger' };
      };
    };
  }>;
}

export interface ButtonProps {
  class?: string;
  /** Button label text. When omitted, slot content is used instead. */
  text?: string;
  title?: string;
  icon?: {
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  };
  iconPosition?: 'left' | 'right';
  iconClass?: string;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  [key: `data-${string}`]: string | undefined;
}

/** One prefooter CTA button. Mirrors the props Button.astro takes. */
export interface FooterCtaButton {
  text: string;
  href: string;
  class?: string;
  icon?: { name: string; size?: string };
  target?: '_blank' | '_self' | '_parent' | '_top';
  /** Value passed through as `data-rybbit-event`. */
  event?: string;
}

export interface FooterProps {
  class?: string;
  showCTA?: boolean;
  showBackground?: boolean;
  showIllustration?: boolean;
  showSignup?: boolean;
  /** Illustration only — no tint/padding (demo, dedicated-cloud) */
  plainIllustration?: boolean;
  /** Background utility class for the illustration strip when `showCTA` is false. Defaults to `bg-glacier-mist-700`; brand pages pass `bg-platinum` to match their page background. */
  illustrationBgClass?: string;
  /** Prefooter copy overrides. Omit for the site-wide default. */
  ctaTitle?: string;
  /** Leading fragment of the prefooter headline, tinted pine-forge. */
  ctaTitleAccent?: string;
  ctaDescription?: string;
  ctaButtons?: FooterCtaButton[];
}

export interface ContainerProps {
  class?: string;
  tag?: 'div' | 'section' | 'article' | 'main' | 'aside';
}

export interface CardProps {
  title: string;
  description: string;
  imageSrc: ImageMetadata;
  imageAlt?: string;
  url?: string;
  icon?: string;
}

export interface AsideProps {
  type?: 'note' | 'caution' | 'tip';
  icon?: string;
  title: string;
  class?: string;
}

export interface FigureProps {
  title?: string;
  align?: 'left' | 'center' | 'right';
  class?: string;
}

export interface AnnouncementProps {
  show?: boolean;
  label?: string;
  text?: string;
  href?: string;
  icon?: {
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  };
}

export interface SecondaryTabNavItem {
  label: string;
  href: string;
  /** When true, active only on this path (normalized), not on deeper URL segments */
  exact?: boolean;
  /** Shown on the active tab only (desktop segmented control) */
  icon?: {
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  };
}

export interface SecondaryTabNavProps {
  items: SecondaryTabNavItem[];
  ariaLabel: string;
  mobileLabel: string;
  idPrefix?: string;
  /** Active tab color theme. Defaults to pine (Deliver). */
  variant?: 'pine' | 'canyon' | 'connect' | 'essentials' | 'locations';
}

export interface SectionEyebrowProps {
  class?: string;
  /** Text colour + cursor colour. Defaults to canyon-clay. */
  variant?: 'pine' | 'midnight-fjord' | 'connect' | 'iris' | 'aurora-moss' | 'app';
  /** Absolute positioning against the nearest `relative` ancestor. */
  position?: 'left-top' | 'left-top-keyline';
}

export interface SectionLineProps {
  left?: boolean;
  right?: boolean;
  top?: boolean;
  bottom?: boolean;
  /** Renders corner overlap lines (vertical + horizontal) instead of standard section lines */
  overlap?: boolean;
  /** Renders extended corner lines (vertical + horizontal) visible from md breakpoint */
  extended?: boolean;
  /** Renders bottom-right overlap lines (vertical + horizontal) visible from md breakpoint */
  bottomOverlap?: boolean;
  class?: string;
}
// TOC interfaces removed - now using Astro's built-in MarkdownHeading type

export interface BreadcrumbItem {
  text: string;
  href: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  class?: string;
}

export interface TerminalProps {
  /** Window title, centred in the title bar. */
  title: string;
  /** Shows the "● live" badge on the right of the title bar. */
  live?: boolean;
  /**
   * Output blocks. Each inner array is a run of consecutive lines; blocks are
   * separated by a blank line.
   */
  blocks: string[][];
  /** Draws a blinking block cursor after the final line. */
  cursor?: boolean;
  class?: string;
}
