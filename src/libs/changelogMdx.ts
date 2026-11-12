// Parses the Mintlify changelog (datum-cloud/docs `changelog.mdx`), the single
// source of truth for both /docs/changelog and the marketing /changelog page.
// The parser throws on any block it cannot read: a format change in the docs
// repo must surface as an error, never as silently missing entries.
import type { ChangelogProps } from './datum';

export const DOCS_CHANGELOG_SOURCE_URL =
  'https://raw.githubusercontent.com/datum-cloud/docs/main/changelog.mdx';
export const CHANGELOG_DISCUSSIONS_URL =
  'https://github.com/orgs/datum-cloud/discussions/categories/changelog';

const DOCS_BASE_PATH = '/docs';
const UPDATE_OPEN_TAG = /<Update\b/g;
const UPDATE_BLOCK = /<Update\s+([^>]*?)>\r?\n([\s\S]*?)\r?\n\s*<\/Update>/g;
const DISCUSSION_LINK = /https:\/\/github\.com\/orgs\/datum-cloud\/discussions\/\d+/;

function readStringAttr(attrs: string, name: string): string | undefined {
  return attrs.match(new RegExp(`${name}="([^"]*)"`))?.[1];
}

function readTags(attrs: string): string[] {
  const raw = attrs.match(/tags=\{(\[[^\]]*\])\}/)?.[1];
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every((t) => typeof t === 'string')) {
    throw new Error(`Invalid changelog tags ${raw}`);
  }
  return parsed;
}

function dedent(text: string): string {
  const lines = text.split('\n');
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^ */)?.[0].length ?? 0);
  const minIndent = indents.length ? Math.min(...indents) : 0;
  return lines
    .map((line) => line.slice(minIndent))
    .join('\n')
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseLabelDate(label: string): Date {
  // Noon UTC keeps the same calendar day in every server timezone.
  const date = new Date(`${label} 12:00:00 UTC`);
  if (isNaN(date.getTime())) throw new Error(`Invalid changelog date "${label}"`);
  return date;
}

function parseBlock(attrs: string, content: string): ChangelogProps {
  const label = readStringAttr(attrs, 'label');
  if (!label) throw new Error(`Changelog <Update ${attrs}> is missing a label`);
  const createdAt = parseLabelDate(label);

  const body = dedent(content);
  const heading = body.match(/^## +(.+)$/m);
  if (!heading) throw new Error(`Changelog entry "${label}" is missing a "## " heading`);
  const title = heading[1].trim();

  const bodyWithoutTitle = body
    .replace(heading[0], '')
    .trim()
    .replace(/\]\(\/(?!\/)/g, `](${DOCS_BASE_PATH}/`);

  return {
    id: `${createdAt.toISOString().slice(0, 10)}-${slugify(title)}`,
    title,
    body: bodyWithoutTitle,
    url: body.match(DISCUSSION_LINK)?.[0] ?? CHANGELOG_DISCUSSIONS_URL,
    createdAt,
    product: readStringAttr(attrs, 'description'),
    labels: { nodes: readTags(attrs).map((name) => ({ name, color: '' })) },
  };
}

export function parseDocsChangelog(mdx: string): ChangelogProps[] {
  const expected = mdx.match(UPDATE_OPEN_TAG)?.length ?? 0;
  if (expected === 0) throw new Error('No <Update> entries found in docs changelog');

  const entries = [...mdx.matchAll(UPDATE_BLOCK)].map(([, attrs, content]) =>
    parseBlock(attrs, content)
  );
  if (entries.length !== expected) {
    throw new Error(`Parsed ${entries.length} of ${expected} <Update> blocks in docs changelog`);
  }
  return entries;
}
