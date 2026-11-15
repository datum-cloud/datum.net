// RSS feed of /changelog, from the same Mintlify changelog that Card.astro renders. SSR so new
// docs entries reach subscribers without a site rebuild.
export const prerender = false;

import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { changelogs } from '@libs/datum';

const SITE_URL = 'https://www.datum.net';
const CHANGELOG_URL = `${SITE_URL}/changelog`;

// Feed readers resolve nothing against the page, so site-relative links must be absolute.
const absoluteLinks = (markdown: string) => markdown.replace(/\]\(\/(?!\/)/g, `](${SITE_URL}/`);

// @astrojs/rss emits one line and escapes HTML, so a rendered body becomes a wall of `&lt;p&gt;`.
// The description stays Markdown; this only breaks the surrounding tags onto their own lines.
function prettyRss(xml: string): string {
  const lines = xml.replace(/></g, '>\n<').split('\n');
  let depth = 0;
  return lines
    .map((line) => {
      const tag = line.trimStart();
      if (!tag.startsWith('<')) return line;
      if (tag.startsWith('</')) depth = Math.max(0, depth - 1);
      const indented = `${'  '.repeat(depth)}${tag}`;
      const opens =
        !tag.startsWith('</') &&
        !tag.startsWith('<?') &&
        !tag.endsWith('/>') &&
        !/<\/[^>]+>\s*$/.test(tag);
      if (opens) depth += 1;
      return indented;
    })
    .join('\n');
}

export const GET: APIRoute = async () => {
  try {
    const entries = await changelogs();
    const feed = await rss({
      title: 'Datum Changelog',
      description: 'New features, improvements, and releases across Datum Cloud, newest first.',
      site: CHANGELOG_URL,
      trailingSlash: false,
      items: entries.map((entry) => ({
        title: entry.product ? `${entry.product}: ${entry.title}` : entry.title,
        link: `${CHANGELOG_URL}#changelog-${entry.id}`,
        pubDate: new Date(entry.createdAt),
        description: absoluteLinks(entry.body),
        categories: [
          ...(entry.product ? [entry.product] : []),
          ...(entry.labels?.nodes.map((label) => label.name) ?? []),
        ],
      })),
      customData: `<language>en-us</language>`,
    });
    return new Response(prettyRss(await feed.text()), {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('Failed to serve /changelog.xml:', error);
    return new Response('Error generating changelog feed', { status: 500 });
  }
};
