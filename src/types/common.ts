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
