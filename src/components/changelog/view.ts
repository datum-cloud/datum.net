// Client-side filters, sorting and paging for /changelog. Every entry is server-rendered into the
// list (so search, deep links and no-JS readers still see all of them); this module only decides
// which ones are visible and keeps that choice in the URL (?page=&tag=&product=&sort=).
import {
  ALL,
  PAGE_SIZE,
  DEFAULT_VIEW_STATE,
  facetCounts,
  filterIndexes,
  indexToPage,
  pageCount,
  pageItems,
  parseViewState,
  toQueryString,
  type EntryMeta,
  type ViewState,
} from '@libs/changelogView';

const SORT_LABELS = { recent: 'Recent', oldest: 'Oldest' } as const;

let view: ViewState = { ...DEFAULT_VIEW_STATE };

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector);

function list(): HTMLElement | null {
  return $('[data-changelog-list]');
}

function entries(): HTMLElement[] {
  return Array.from(list()?.querySelectorAll<HTMLElement>(':scope > .changelog-entry') ?? []);
}

function metaOf(entry: HTMLElement): EntryMeta {
  return {
    product: entry.dataset.product ?? '',
    tags: JSON.parse(entry.dataset.tags ?? '[]') as string[],
  };
}

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function hrefFor(state: ViewState): string {
  return `${location.pathname}${toQueryString(state)}`;
}

// Writes the view into the URL. A deep-link hash is kept only when `keepHash` is set, because any
// other state change leaves the hashed entry behind.
function commit(mode: 'push' | 'replace', keepHash = false) {
  const url = hrefFor(view) + (keepHash ? location.hash : '');
  if (url === `${location.pathname}${location.search}${location.hash}`) return;
  history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', url);
}

// ---- rendering ---------------------------------------------------------------------------

function renderPager(total: number) {
  const nav = $('[data-changelog-pager]');
  if (!nav) return;
  nav.textContent = '';
  nav.hidden = total <= 1;
  if (total <= 1) return;

  const link = (label: string, page: number, className: string, aria?: string) => {
    const a = document.createElement('a');
    a.className = className;
    a.href = hrefFor({ ...view, page });
    a.dataset.page = String(page);
    a.textContent = label;
    if (aria) a.setAttribute('aria-label', aria);
    return a;
  };
  const disabled = (label: string) => {
    const span = document.createElement('span');
    span.className = 'changelog-pager-link changelog-pager-step';
    span.setAttribute('aria-disabled', 'true');
    span.textContent = label;
    return span;
  };

  nav.append(
    view.page > 1
      ? link('← Previous', view.page - 1, 'changelog-pager-link changelog-pager-step')
      : disabled('← Previous')
  );

  const pages = document.createElement('div');
  pages.className = 'changelog-pager-pages';
  for (const item of pageItems(view.page, total)) {
    if (item === 'gap') {
      const gap = document.createElement('span');
      gap.className = 'changelog-pager-gap';
      gap.setAttribute('aria-hidden', 'true');
      gap.textContent = '…';
      pages.append(gap);
      continue;
    }
    const a = link(String(item), item, 'changelog-pager-link', `Page ${item}`);
    if (item === view.page) a.setAttribute('aria-current', 'page');
    pages.append(a);
  }
  nav.append(pages);

  nav.append(
    view.page < total
      ? link('Next →', view.page + 1, 'changelog-pager-link changelog-pager-step')
      : disabled('Next →')
  );
}

function renderControls(matchCount: number, metas: EntryMeta[]) {
  const filtered = view.tag !== ALL || view.product !== ALL;

  const counts = facetCounts(metas, view);
  const selects: Array<[string, string, Record<string, number>]> = [
    ['[data-changelog-tag]', view.tag, counts.tags],
    ['[data-changelog-product]', view.product, counts.products],
  ];
  for (const [selector, value, facet] of selects) {
    const select = $<HTMLSelectElement>(selector);
    if (!select) continue;
    // Options show what picking them would give right now; ones that would give nothing are
    // disabled (the current pick stays enabled so the control never lies about its own value).
    for (const option of select.options) {
      if (option.value === ALL) continue;
      const count = facet[option.value] ?? 0;
      option.textContent = `${option.value} (${count})`;
      option.disabled = count === 0 && option.value !== value;
    }
    select.value = value;
    select.dataset.active = String(value !== ALL);
  }

  const sort = $<HTMLElement>('[data-changelog-sort]');
  if (sort) sort.dataset.order = view.sort;
  const sortLabel = $<HTMLElement>('[data-changelog-sort-label]');
  if (sortLabel) sortLabel.textContent = SORT_LABELS[view.sort];

  const summary = $<HTMLElement>('[data-changelog-summary-text]');
  if (summary) {
    const noun = matchCount === 1 ? 'update' : 'updates';
    summary.textContent = matchCount === 0 ? 'No matching updates' : `${matchCount} ${noun}`;
  }
  const clear = $<HTMLElement>('[data-changelog-clear]');
  if (clear) clear.hidden = !filtered;
  const empty = $<HTMLElement>('[data-changelog-empty]');
  if (empty) empty.hidden = matchCount > 0;
}

function render() {
  const container = list();
  if (!container) return;

  // Sorting reorders the DOM once per change; filtering and paging only toggle `hidden`.
  if ((container.dataset.order ?? 'recent') !== view.sort) {
    container.append(...Array.from(container.children).reverse());
    container.dataset.order = view.sort;
  }

  const all = entries();
  const metas = all.map(metaOf);
  const matches = filterIndexes(metas, view);
  const total = pageCount(matches.length);
  view = { ...view, page: Math.min(view.page, total) };

  const start = (view.page - 1) * PAGE_SIZE;
  const visible = new Set(matches.slice(start, start + PAGE_SIZE));
  all.forEach((entry, index) => {
    entry.hidden = !visible.has(index);
    entry.classList.remove('changelog-entry--last');
  });
  const shown = all.filter((entry) => !entry.hidden);
  shown.at(-1)?.classList.add('changelog-entry--last');

  renderControls(matches.length, metas);
  renderPager(total);
}

// ---- state changes -----------------------------------------------------------------------

function toolbarTop(): HTMLElement | null {
  return $('.changelog-toolbar');
}

function jumpToTop() {
  toolbarTop()?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  $<HTMLElement>('[data-changelog-summary]')?.focus({ preventScroll: true });
}

function update(next: Partial<ViewState>, { scroll = false } = {}) {
  const resetsPage = 'tag' in next || 'product' in next || 'sort' in next;
  view = { ...view, page: resetsPage ? 1 : view.page, ...next };
  render();
  commit('push');
  if (scroll) jumpToTop();
}

// Makes sure `entry` is on the visible page, widening the filters if it is filtered out.
export function revealEntry(entry: HTMLElement) {
  if (!entry.hidden) return;
  const all = entries();
  let position = filterIndexes(all.map(metaOf), view).indexOf(all.indexOf(entry));
  if (position < 0) {
    view = { ...view, tag: ALL, product: ALL };
    position = all.indexOf(entry);
  }
  view = { ...view, page: indexToPage(position) };
  render();
  commit('replace', true);
}

// ---- events ------------------------------------------------------------------------------

function onClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  const page = target.closest<HTMLAnchorElement>('a[data-page]');
  if (page && !event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) {
    event.preventDefault();
    update({ page: Number(page.dataset.page) }, { scroll: true });
    return;
  }

  // Tags on an entry are filters too: click to narrow, click again to widen.
  const entryTag = target.closest<HTMLElement>('[data-changelog-filter]');
  if (entryTag) {
    const key = entryTag.dataset.changelogFilter === 'product' ? 'product' : 'tag';
    const value = entryTag.dataset.value ?? ALL;
    update({ [key]: view[key] === value ? ALL : value }, { scroll: true });
    return;
  }

  if (target.closest('[data-changelog-clear]')) {
    update({ tag: ALL, product: ALL }, { scroll: true });
    return;
  }

  if (target.closest('[data-changelog-sort]')) {
    update({ sort: view.sort === 'recent' ? 'oldest' : 'recent' });
  }
}

function onChange(event: Event) {
  const select = event.target as HTMLSelectElement | null;
  if (select?.matches?.('[data-changelog-product]')) update({ product: select.value });
  if (select?.matches?.('[data-changelog-tag]')) update({ tag: select.value });
}

function onPopState() {
  if (!list()) return;
  view = parseViewState(location.search);
  render();
}

const hook = globalThis as typeof globalThis & { __changelogView?: boolean };

// The list arrives after load through server:defer, so this is safe to call repeatedly: handlers
// bind once, and the view is (re)initialised from the URL whenever a fresh list is in the DOM.
export function initChangelogView() {
  const container = list();
  if (!container) return false;
  if (!hook.__changelogView) {
    hook.__changelogView = true;
    document.addEventListener('click', onClick);
    document.addEventListener('change', onChange);
    window.addEventListener('popstate', onPopState);
  }
  if (container.dataset.viewReady !== 'true') {
    container.dataset.viewReady = 'true';
    view = parseViewState(location.search);
    render();
    commit('replace', true); // normalise bad params without dropping a #changelog-… deep link
  }
  return true;
}
