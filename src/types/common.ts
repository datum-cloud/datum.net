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
  subtitle?: string;
  description?: string;
  class?: string;
  imagePath?: ImageMetadata;
  hideContent?: boolean;
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
  text: string;
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

export interface FooterProps {
  showCTA?: boolean;
  showBackground?: boolean;
  showIllustration?: boolean;
  showSignup?: boolean;
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

// TOC interfaces removed - now using Astro's built-in MarkdownHeading type
