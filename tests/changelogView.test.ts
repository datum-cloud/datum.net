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
} from '../src/libs/changelogView.ts';

const METAS = [
  { product: 'datumctl', tags: ['Fix'] },
  { product: 'Private DNS', tags: ['Fix', 'Early access'] },
  { product: 'datumctl', tags: ['AX/DX/UX'] },
  { product: 'Billing', tags: ['GA'] },
];

test('parses defaults from an empty query string', () => {
  assert.deepEqual(parseViewState(''), DEFAULT_VIEW_STATE);
});

test('parses page, tag, product and sort', () => {
  assert.deepEqual(parseViewState('?page=3&tag=Fix&product=datumctl&sort=oldest'), {
    page: 3,
    tag: 'Fix',
    product: 'datumctl',
    sort: 'oldest',
  });
});

test('ignores garbage values instead of throwing', () => {
  assert.deepEqual(parseViewState('?page=-4&sort=sideways'), DEFAULT_VIEW_STATE);
  assert.equal(parseViewState('?page=abc').page, 1);
  assert.equal(parseViewState('?page=2.7').page, 1);
});

test('omits default values when serialising', () => {
  assert.equal(toQueryString(DEFAULT_VIEW_STATE), '');
  assert.equal(toQueryString({ ...DEFAULT_VIEW_STATE, page: 2 }), '?page=2');
  assert.equal(
    toQueryString({ page: 1, tag: 'AX/DX/UX', product: 'Private DNS', sort: 'oldest' }),
    '?tag=AX%2FDX%2FUX&product=Private+DNS&sort=oldest'
  );
});

test('round-trips through the query string', () => {
  const state = { page: 2, tag: 'Early access', product: 'Private DNS', sort: 'oldest' } as const;
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
