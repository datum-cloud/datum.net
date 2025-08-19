import type { ImageMetadata } from 'astro';

export interface LayoutProps {
  title: string;
  description?: string;
  image?: string;
  article?: boolean;
  publishDate?: Date;
  author?: string;
  noindex?: boolean;
  canonical?: string;
  fluid?: boolean;
  dataTheme: string;
  bodyClass?: string;
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
}

export interface ArticleProps {
  articleId?: string;
  showSidebar?: boolean;
  class?: string;
}

export interface SidebarProps {
  currentArticleId?: string;
  class?: string;
}
