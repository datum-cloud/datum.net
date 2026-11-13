// View logic for /changelog: which entries match the filters, how they split into pages, and how
// that state round-trips through the URL. Kept free of DOM so it can be unit-tested.

export const PAGE_SIZE = 8;
export const ALL = '';

export type ChangelogSort = 'recent' | 'oldest';

export interface ViewState {
  page: number;
  tag: string;
  product: string;
  sort: ChangelogSort;
}

export interface EntryMeta {
  product: string;
  tags: string[];
}

export const DEFAULT_VIEW_STATE: Readonly<ViewState> = {
  page: 1,
  tag: ALL,
  product: ALL,
  sort: 'recent',
};

export function parseViewState(search: string): ViewState {
  const params = new URLSearchParams(search);
  const page = Number(params.get('page'));
  return {
    page: Number.isInteger(page) && page >= 1 ? page : DEFAULT_VIEW_STATE.page,
    tag: params.get('tag') ?? ALL,
    product: params.get('product') ?? ALL,
    sort: params.get('sort') === 'oldest' ? 'oldest' : 'recent',
  };
}

// Defaults are left out so the canonical /changelog URL stays clean.
export function toQueryString(state: ViewState): string {
  const params = new URLSearchParams();
  if (state.page > 1) params.set('page', String(state.page));
  if (state.tag !== ALL) params.set('tag', state.tag);
  if (state.product !== ALL) params.set('product', state.product);
  if (state.sort !== DEFAULT_VIEW_STATE.sort) params.set('sort', state.sort);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function filterIndexes(
  metas: readonly EntryMeta[],
  filters: Pick<ViewState, 'tag' | 'product'>
): number[] {
  const matches: number[] = [];
  metas.forEach((meta, index) => {
    const tagOk = filters.tag === ALL || meta.tags.includes(filters.tag);
    const productOk = filters.product === ALL || meta.product === filters.product;
    if (tagOk && productOk) matches.push(index);
  });
  return matches;
}

export interface FacetCounts {
  tags: Record<string, number>;
  products: Record<string, number>;
}

// Live counts for the dropdown options: each facet is counted against the *other* filter only, so
// every number is exactly how many updates choosing that option would show right now.
export function facetCounts(
  metas: readonly EntryMeta[],
  filters: Pick<ViewState, 'tag' | 'product'>
): FacetCounts {
  const tags: Record<string, number> = {};
  const products: Record<string, number> = {};
  for (const meta of metas) {
    if (filters.product === ALL || meta.product === filters.product) {
      for (const tag of new Set(meta.tags)) tags[tag] = (tags[tag] ?? 0) + 1;
    }
    if (filters.tag === ALL || meta.tags.includes(filters.tag)) {
      products[meta.product] = (products[meta.product] ?? 0) + 1;
    }
  }
  return { tags, products };
}

export function pageCount(total: number, size: number = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / size));
}

export function indexToPage(index: number, size: number = PAGE_SIZE): number {
  return Math.floor(index / size) + 1;
}

// Page numbers to render: always first, last and the current page's neighbours, with 'gap' for
// skipped runs. Near either end it keeps five numbers so the control does not jump in width.
export function pageItems(current: number, total: number): Array<number | 'gap'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);
  if (current <= 3) return [...range(1, 5), 'gap', total];
  if (current >= total - 2) return [1, 'gap', ...range(total - 4, total)];
  return [1, 'gap', current - 1, current, current + 1, 'gap', total];
}
