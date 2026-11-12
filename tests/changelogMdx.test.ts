// The Mintlify changelog (datum-cloud/docs changelog.mdx) is the single source
// of truth for /changelog. These tests pin the contract between that file's
// format and the marketing page, so a format change in the docs repo fails
// loudly here instead of silently dropping or mangling entries on the site.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDocsChangelog, CHANGELOG_DISCUSSIONS_URL } from '../src/libs/changelogMdx.ts';

const FIXTURE = `---
title: "Changelog"
rss: true
---

Intro text with a [roadmap](/platform/roadmap) link that is not an entry.

<Update label="November 10, 2026" description="Application Load Balancer" tags={["Fix"]}>
  ## New load balancers serve traffic sooner

  - **Fixed:** a new ALB no longer returns \`503\`.

  See [ALB troubleshooting](/alb/troubleshooting) or the [portal](https://cloud.datum.net).
</Update>

<Update label="October 13, 2026" description="datumctl" tags={["AX/DX/UX", "Early access"]}>
  ## New datumctl plugins

  Install plugins.

  [Read the announcement](https://github.com/orgs/datum-cloud/discussions/306)
</Update>
`;

test('parses every <Update> block in source order (newest first, as authored in docs)', () => {
  const entries = parseDocsChangelog(FIXTURE);
  assert.equal(entries.length, 2);
  assert.deepEqual(
    entries.map((e) => e.title),
    ['New load balancers serve traffic sooner', 'New datumctl plugins']
  );
});

test('uses the ## heading as title and removes it from the body so the card does not repeat it', () => {
  const [entry] = parseDocsChangelog(FIXTURE);
  assert.ok(!entry.body.includes('## New load balancers'));
  assert.ok(entry.body.startsWith('- **Fixed:**'), 'body must be dedented, not indented code');
});

test('rewrites docs-relative links to /docs so they resolve from www.datum.net/changelog', () => {
  const [entry] = parseDocsChangelog(FIXTURE);
  assert.ok(entry.body.includes('](/docs/alb/troubleshooting)'));
  assert.ok(entry.body.includes('](https://cloud.datum.net)'), 'absolute links are untouched');
});

test('links to the entry discussion when present, otherwise to the changelog discussions category', () => {
  const [withoutAnnouncement, withAnnouncement] = parseDocsChangelog(FIXTURE);
  assert.equal(withAnnouncement.url, 'https://github.com/orgs/datum-cloud/discussions/306');
  assert.equal(withoutAnnouncement.url, CHANGELOG_DISCUSSIONS_URL);
});

test('maps docs tags to labels and the label date to a timezone-safe createdAt', () => {
  const [, entry] = parseDocsChangelog(FIXTURE);
  assert.deepEqual(
    entry.labels.nodes.map((l) => l.name),
    ['AX/DX/UX', 'Early access']
  );
  // Noon UTC renders as the same calendar day in every server timezone (UTC-11..UTC+11).
  assert.equal(new Date(entry.createdAt).toISOString(), '2026-10-13T12:00:00.000Z');
  assert.equal(entry.id, '2026-10-13-new-datumctl-plugins');
});

test('keeps the <Update> description as the product name shown on the card', () => {
  const [alb, cli] = parseDocsChangelog(FIXTURE);
  assert.equal(alb.product, 'Application Load Balancer');
  assert.equal(cli.product, 'datumctl');

  const withoutDescription = FIXTURE.replace(' description="datumctl"', '');
  assert.equal(parseDocsChangelog(withoutDescription)[1].product, undefined);
});

test('fails loudly when an <Update> block cannot be parsed instead of dropping it', () => {
  const broken = FIXTURE.replace('label="October 13, 2026"', 'label="sometime soon"');
  assert.throws(() => parseDocsChangelog(broken), /Invalid changelog date "sometime soon"/);

  const noHeading = FIXTURE.replace('## New datumctl plugins', 'New datumctl plugins');
  assert.throws(() => parseDocsChangelog(noHeading), /missing a "## " heading/);

  const unclosed = FIXTURE.replace(/<\/Update>\s*$/, '');
  assert.throws(() => parseDocsChangelog(unclosed), /Parsed 1 of 2 <Update> blocks/);
});

test('fails loudly when the source has no entries (e.g. an error page was fetched)', () => {
  assert.throws(() => parseDocsChangelog('<html>404</html>'), /No <Update> entries/);
});
