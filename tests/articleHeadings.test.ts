import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addHeadingIds } from '../src/utils/articleHeadings.ts';

test('adds ids to h2 headings and lists them in order', () => {
  const { html, headings } = addHeadingIds('<p>a</p><h2>One network</h2><h2>Two</h2>');
  assert.equal(html, '<p>a</p><h2 id="one-network">One network</h2><h2 id="two">Two</h2>');
  assert.deepEqual(headings, [
    { id: 'one-network', text: 'One network' },
    { id: 'two', text: 'Two' },
  ]);
});

test('strips inline markup and quotes from the label and slug', () => {
  const { headings } = addHeadingIds(
    '<h2>1. "IPv6-native" meant <code>auditing</code> my cruft</h2>'
  );
  assert.deepEqual(headings, [
    {
      id: '1-ipv6-native-meant-auditing-my-cruft',
      text: '1. "IPv6-native" meant auditing my cruft',
    },
  ]);
});

test('keeps an existing id and de-duplicates repeats, across blocks too', () => {
  const first = addHeadingIds('<h2 id="keep">Keep</h2><h2>Same</h2><h2>Same</h2>');
  assert.deepEqual(
    first.headings.map((h) => h.id),
    ['keep', 'same', 'same-2']
  );
  const second = addHeadingIds(
    '<h2>Same</h2>',
    first.headings.map((h) => h.id)
  );
  assert.equal(second.headings[0].id, 'same-3');
});

test('ignores empty headings and other levels', () => {
  const { html, headings } = addHeadingIds('<h2></h2><h3>Sub</h3>');
  assert.equal(html, '<h2></h2><h3>Sub</h3>');
  assert.deepEqual(headings, []);
});
