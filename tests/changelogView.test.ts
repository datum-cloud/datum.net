// Pure view logic behind the /changelog filters and paging: URL state, filtering and the
// page-number window. The DOM wiring in Card.astro is a thin layer over these.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PAGE_SIZE,
  DEFAULT_VIEW_STATE,
  parseViewState,
  toQueryString,
  filterIndexes,
  facetCounts,
  pageCount,
  pageItems,
  indexToPage,
  rangeStart,
} from '../src/libs/changelogView.ts';

const NOW = Date.parse('2026-11-15T08:00:00Z');
const at = (iso: string) => Date.parse(`${iso}T12:00:00Z`);

const METAS = [
  { product: 'datumctl', tags: ['Fix'], date: at('2026-11-12') },
  { product: 'Private DNS', tags: ['Fix', 'Early access'], date: at('2026-11-05') },
  { product: 'datumctl', tags: ['AX/DX/UX'], date: at('2026-10-13') },
  { product: 'Billing', tags: ['GA'], date: at('2025-12-30') },
];

test('parses defaults from an empty query string', () => {
  assert.deepEqual(parseViewState(''), DEFAULT_VIEW_STATE);
});

test('parses page, tag, product, range and sort', () => {
  assert.deepEqual(parseViewState('?page=3&tag=Fix&product=datumctl&range=month&sort=oldest'), {
    page: 3,
    tag: 'Fix',
    product: 'datumctl',
    range: 'month',
    sort: 'oldest',
  });
});

test('ignores garbage values instead of throwing', () => {
  assert.deepEqual(parseViewState('?page=-4&sort=sideways&range=decade'), DEFAULT_VIEW_STATE);
  assert.equal(parseViewState('?page=abc').page, 1);
  assert.equal(parseViewState('?page=2.7').page, 1);
});

test('omits default values when serialising', () => {
  assert.equal(toQueryString(DEFAULT_VIEW_STATE), '');
  assert.equal(toQueryString({ ...DEFAULT_VIEW_STATE, page: 2 }), '?page=2');
  assert.equal(
    toQueryString({
      page: 1,
      tag: 'AX/DX/UX',
      product: 'Private DNS',
      range: 'ytd',
      sort: 'oldest',
    }),
    '?tag=AX%2FDX%2FUX&product=Private+DNS&range=ytd&sort=oldest'
  );
});

test('round-trips through the query string', () => {
  const state = {
    page: 2,
    tag: 'Early access',
    product: 'Private DNS',
    range: 'week',
    sort: 'oldest',
  } as const;
  assert.deepEqual(parseViewState(toQueryString(state)), state);
});

test('filters by tag, product, and both together (AND)', () => {
  assert.deepEqual(filterIndexes(METAS, { ...DEFAULT_VIEW_STATE }), [0, 1, 2, 3]);
  assert.deepEqual(filterIndexes(METAS, { ...DEFAULT_VIEW_STATE, tag: 'Fix' }), [0, 1]);
  assert.deepEqual(filterIndexes(METAS, { ...DEFAULT_VIEW_STATE, product: 'datumctl' }), [0, 2]);
  assert.deepEqual(
    filterIndexes(METAS, { ...DEFAULT_VIEW_STATE, tag: 'Fix', product: 'datumctl' }),
    [0]
  );
  assert.deepEqual(filterIndexes(METAS, { ...DEFAULT_VIEW_STATE, tag: 'Nope' }), []);
});

test('filters by time range relative to now', () => {
  const inRange = (range: 'all' | 'week' | 'month' | 'ytd') =>
    filterIndexes(METAS, { ...DEFAULT_VIEW_STATE, range }, NOW);
  assert.deepEqual(inRange('all'), [0, 1, 2, 3]);
  assert.deepEqual(inRange('week'), [0]);
  assert.deepEqual(inRange('month'), [0, 1]);
  assert.deepEqual(inRange('ytd'), [0, 1, 2], 'ytd starts on 1 January UTC');
  assert.deepEqual(
    filterIndexes(METAS, { ...DEFAULT_VIEW_STATE, range: 'ytd', product: 'datumctl' }, NOW),
    [0, 2]
  );
});

test('range start: week and month count back from now, ytd from 1 January UTC', () => {
  const day = 24 * 60 * 60 * 1000;
  assert.equal(rangeStart('all', NOW), -Infinity);
  assert.equal(rangeStart('week', NOW), NOW - 7 * day);
  assert.equal(rangeStart('month', NOW), NOW - 30 * day);
  assert.equal(rangeStart('ytd', NOW), Date.parse('2026-01-01T00:00:00Z'));
});

test('computes page counts, never fewer than one page', () => {
  assert.equal(pageCount(0), 1);
  assert.equal(pageCount(PAGE_SIZE), 1);
  assert.equal(pageCount(PAGE_SIZE + 1), 2);
  assert.equal(pageCount(28, 8), 4);
});

test('maps an entry position to its page', () => {
  assert.equal(indexToPage(0, 8), 1);
  assert.equal(indexToPage(7, 8), 1);
  assert.equal(indexToPage(8, 8), 2);
});

test('shows every page number when there are few pages', () => {
  assert.deepEqual(pageItems(1, 4), [1, 2, 3, 4]);
  assert.deepEqual(pageItems(1, 1), [1]);
});

test('collapses long ranges with gaps and keeps first, last and neighbours', () => {
  assert.deepEqual(pageItems(1, 10), [1, 2, 3, 4, 5, 'gap', 10]);
  assert.deepEqual(pageItems(5, 10), [1, 'gap', 4, 5, 6, 'gap', 10]);
  assert.deepEqual(pageItems(10, 10), [1, 'gap', 6, 7, 8, 9, 10]);
});

test('counts each facet against the other filter only', () => {
  assert.deepEqual(facetCounts(METAS, DEFAULT_VIEW_STATE), {
    tags: { Fix: 2, 'Early access': 1, 'AX/DX/UX': 1, GA: 1 },
    products: { datumctl: 2, 'Private DNS': 1, Billing: 1 },
  });
  // Narrowed to datumctl: type counts shrink; product counts ignore the product filter itself.
  assert.deepEqual(facetCounts(METAS, { ...DEFAULT_VIEW_STATE, product: 'datumctl' }).tags, {
    Fix: 1,
    'AX/DX/UX': 1,
  });
  assert.deepEqual(facetCounts(METAS, { ...DEFAULT_VIEW_STATE, tag: 'Fix' }).products, {
    datumctl: 1,
    'Private DNS': 1,
  });
});

test('counts only entries inside the time range', () => {
  assert.deepEqual(facetCounts(METAS, { ...DEFAULT_VIEW_STATE, range: 'week' }, NOW), {
    tags: { Fix: 1 },
    products: { datumctl: 1 },
  });
});
