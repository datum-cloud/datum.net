#!/usr/bin/env node
/**
 * Extracts SEO/meta data from built HTML files using Cheerio,
 * sends a compact report to Claude for review, and writes a
 * markdown comment to stdout (or to $GITHUB_OUTPUT comment file).
 *
 * Env:
 *   ANTHROPIC_API_KEY   required to call Claude
 *   SCAN_MODE           'changed-only' (default, PR runs) | 'full' (weekly scheduled run;
 *                       adds broken-link + redirect-chain audits over all built pages)
 *   CHANGED_FILES       newline list of changed src/pages|src/content files (changed-only mode)
 *   DIST_DIR            default: dist/client
 *   MAX_PAGES           default: 25
 *   OUTPUT_FILE         default: .tmp/seo-review.md
 *   SITE_URL            default: https://www.datum.net (host used to recognise internal links)
 */

import { readFile, writeFile, readdir, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const DIST_DIR = process.env.DIST_DIR || 'dist/client';
const MAX_PAGES = parseInt(process.env.MAX_PAGES || '25', 10);
const OUTPUT_FILE = process.env.OUTPUT_FILE || '.tmp/seo-review.md';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'; // or 'claude-2' for faster, cheaper reviews with less insight
// Claude input limit is 200K tokens (~800K chars at 4 chars/token).
// Cap user content at ~160K tokens worth of chars to leave headroom for system + output.
const MAX_INPUT_CHARS = parseInt(process.env.MAX_INPUT_CHARS || '640000', 10);
// Single switch driving page-selection behaviour.
//   changed-only (default): scan only pages affected by CHANGED_FILES; skip
//     review when there is nothing to scan. No broken-link / redirect-chain
//     checks (kept off the PR hot path).
//   full: scan every built page AND run broken-link + redirect-chain audits.
//     Intended for the weekly schedule.
const RAW_SCAN_MODE = (process.env.SCAN_MODE || 'changed-only').toLowerCase();
const SCAN_MODE = RAW_SCAN_MODE === 'full' ? 'full' : 'changed-only';
const SITE_URL = process.env.SITE_URL || 'https://www.datum.net';
const CONFIG_FILE =
  process.env.SEO_CONFIG ||
  path.join(path.dirname(new URL(import.meta.url).pathname), '/seo-review.config.json');

async function loadConfig() {
  try {
    const raw = await readFile(CONFIG_FILE, 'utf8');
    const cfg = JSON.parse(raw);
    return {
      excludePaths: cfg.excludePaths || [],
      excludeFiles: new Set(cfg.excludeFiles || []),
      excludeFilePatterns: (cfg.excludeFilePatterns || []).map((p) => new RegExp(p, 'i')),
    };
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    return { excludePaths: [], excludeFiles: new Set(), excludeFilePatterns: [] };
  }
}

function isExcluded(file, root, cfg) {
  const base = path.basename(file);
  if (cfg.excludeFiles.has(base)) return true;
  if (cfg.excludeFilePatterns.some((re) => re.test(base))) return true;
  const url = toUrlPath(file, root);
  return cfg.excludePaths.some((p) => url === p || url.startsWith(p.endsWith('/') ? p : p + '/'));
}

async function walk(dir, root, cfg) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(p, root, cfg)));
    } else if (entry.isFile() && p.endsWith('.html') && !isExcluded(p, root, cfg)) {
      out.push(p);
    }
  }
  return out;
}

function extractMeta(html, urlPath) {
  const $ = load(html);
  const get = (sel, attr = 'content') => $(sel).attr(attr)?.trim() || null;

  const h1s = $('h1')
    .map((_, el) => $(el).text().trim())
    .get();
  const imgs = $('img').toArray();
  const imgsMissingAlt = imgs.filter((el) => !($(el).attr('alt') || '').trim()).length;

  return {
    url: urlPath,
    title: $('title').first().text().trim() || null,
    titleLen: ($('title').first().text().trim() || '').length,
    description: get('meta[name="description"]'),
    descriptionLen: (get('meta[name="description"]') || '').length,
    canonical: get('link[rel="canonical"]', 'href'),
    robots: get('meta[name="robots"]'),
    lang: $('html').attr('lang') || null,
    ogTitle: get('meta[property="og:title"]'),
    ogDescription: get('meta[property="og:description"]'),
    ogImage: get('meta[property="og:image"]'),
    ogType: get('meta[property="og:type"]'),
    twitterCard: get('meta[name="twitter:card"]'),
    twitterImage: get('meta[name="twitter:image"]'),
    h1Count: h1s.length,
    h1First: h1s[0] || null,
    imgCount: imgs.length,
    imgsMissingAlt,
    hasJsonLd: $('script[type="application/ld+json"]').length > 0,
    jsonLdTypes: $('script[type="application/ld+json"]')
      .map((_, el) => {
        try {
          const j = JSON.parse($(el).contents().text());
          return Array.isArray(j) ? j.map((x) => x['@type']).join(',') : j['@type'];
        } catch {
          return 'invalid';
        }
      })
      .get(),
  };
}

function extractLinksAndRefresh($, urlPath /* , siteHost */) {
  const refs = [];
  $('a[href]').each((_, el) => {
    const href = ($(el).attr('href') || '').trim();
    if (!href) return;
    if (/^(#|mailto:|tel:|javascript:|data:)/i.test(href)) return;
    if (href.startsWith('//')) return; // protocol-relative external
    if (/^https?:\/\//i.test(href)) return; // absolute — treat as external, don't validate against dist
    let pathname = null;
    if (href.startsWith('/')) {
      pathname = href.split('#')[0].split('?')[0];
    } else {
      try {
        const u = new URL(href, `https://placeholder${urlPath}`);
        pathname = u.pathname;
      } catch {
        return;
      }
    }
    if (pathname) refs.push(pathname);
  });

  let refresh = null;
  const tag = $('meta[http-equiv="refresh"]').attr('content');
  if (tag) {
    const m = tag.match(/url=([^;]+)/i);
    if (m) refresh = m[1].trim();
  }
  return { refs, refresh };
}

function normalizeUrlPath(p) {
  if (!p) return '/';
  let out = p.split('#')[0].split('?')[0];
  if (!out.startsWith('/')) out = '/' + out;
  if (out.length > 1 && !out.endsWith('/') && !/\.[a-z0-9]+$/i.test(out)) out += '/';
  return out;
}

function buildBuiltSet(files, root) {
  const set = new Set();
  for (const f of files) set.add(normalizeUrlPath(toUrlPath(f, root)));
  return set;
}

async function buildSourceRouteSet(pagesDir = 'src/pages') {
  const set = new Set();
  async function walkSrc(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walkSrc(p);
      } else if (e.isFile() && /\.(astro|md|mdx|html)$/i.test(e.name)) {
        let rel = path.relative(pagesDir, p).replace(/\\/g, '/');
        rel = rel.replace(/\.(astro|md|mdx|html)$/i, '');
        rel = rel.replace(/\/index$/, '').replace(/^index$/, '');
        const url = rel ? '/' + rel : '/';
        // Skip dynamic segments — they can't be validated by exact path.
        if (/\[.*?\]/.test(url)) {
          // record the parent prefix so anything under it is considered "may exist"
          const prefix =
            '/' +
            url
              .split('/')
              .filter((s) => !/\[.*?\]/.test(s))
              .join('/');
          set.add(normalizeUrlPath(prefix.replace(/\/+/g, '/')) + '*');
        } else {
          set.add(normalizeUrlPath(url));
        }
      }
    }
  }
  await walkSrc(pagesDir);
  return set;
}

function isInSourceRoutes(target, srcSet) {
  if (srcSet.has(target)) return true;
  // Match against dynamic-route wildcards.
  for (const entry of srcSet) {
    if (entry.endsWith('*')) {
      const prefix = entry.slice(0, -1);
      if (target.startsWith(prefix)) return true;
    }
  }
  return false;
}

function findBrokenLinks(linkMap, builtSet, srcSet) {
  const broken = [];
  for (const [page, refs] of linkMap) {
    const seen = new Set();
    for (const ref of refs) {
      const norm = normalizeUrlPath(ref);
      if (seen.has(norm)) continue;
      seen.add(norm);
      if (builtSet.has(norm)) continue;
      if (srcSet && isInSourceRoutes(norm, srcSet)) continue;
      broken.push({ page, target: ref });
    }
  }
  return broken;
}

function findRedirectChains(refreshMap) {
  const chains = [];
  for (const start of refreshMap.keys()) {
    const path = [start];
    const seen = new Set(path);
    let cur = start;
    while (refreshMap.has(cur)) {
      const next = normalizeUrlPath(refreshMap.get(cur));
      if (seen.has(next)) {
        path.push(next + ' (loop)');
        break;
      }
      path.push(next);
      seen.add(next);
      cur = next;
    }
    if (path.length > 2) chains.push(path); // >=2 hops = chain
  }
  return chains;
}

function toUrlPath(file, root) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  if (rel === 'index.html') return '/';
  return '/' + rel;
}

const BROAD_CHANGE_RE =
  /^(src\/(layouts|components|styles|middleware)\/|astro\.config|tailwind\.config|src\/consts|package\.json|package-lock\.json)/;

function mapChangedToSlugs(changed) {
  const fromPages = changed
    .map((f) => f.match(/^src\/pages\/(.+?)\.(astro|md|mdx|html)$/)?.[1])
    .filter(Boolean);
  const fromContent = changed
    .map((f) => f.match(/^src\/content\/(.+?)\.(md|mdx)$/)?.[1])
    .filter(Boolean);
  return [...fromPages, ...fromContent]
    .map((s) => s.replace(/\/index$/, '').replace(/^index$/, ''))
    .filter(Boolean);
}

function hasBroadChange(changed) {
  return changed.some((f) => BROAD_CHANGE_RE.test(f));
}

function filterByChanged(files, root, slugs) {
  return files.filter((f) => {
    const url = toUrlPath(f, root).replace(/\/$/, '');
    return slugs.some((s) => {
      const slug = '/' + s.replace(/^\/+/, '');
      return url === slug || url.startsWith(slug + '/');
    });
  });
}

function buildUserContent(payload, total) {
  const header = (count) => `Pages analyzed: ${count} of ${total}\n\nData:\n\n`;
  // Use compact JSON (no indent) — fits more pages within MAX_INPUT_CHARS.
  const render = (obj) => `${header(obj.pages.length)}\`\`\`json\n${JSON.stringify(obj)}\n\`\`\``;
  let content = render(payload);
  if (content.length <= MAX_INPUT_CHARS) {
    return { content, sent: payload.pages.length, dropped: 0 };
  }

  // Trim pages from the tail (lower priority); keep brokenLinks/redirectChains.
  const trimmed = { ...payload, pages: [...payload.pages] };
  while (trimmed.pages.length > 1 && content.length > MAX_INPUT_CHARS) {
    trimmed.pages.pop();
    content = render(trimmed);
  }
  return {
    content,
    sent: trimmed.pages.length,
    dropped: payload.pages.length - trimmed.pages.length,
  };
}

async function callClaude(report, extras = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const extrasSection =
    extras.brokenLinks || extras.redirectChains
      ? `

Additionally, you'll receive:
- \`brokenLinks\`: internal anchor hrefs whose target URL does not exist as a built page. Call these out as critical.
- \`redirectChains\`: redirect hops (2+) discovered via \`<meta http-equiv="refresh">\`. Recommend collapsing to a single hop.`
      : '';

  const system = `You are an SEO and meta-data reviewer for an Astro static site.
You will receive a JSON array of pages with extracted SEO signals.
Return a concise markdown review for a GitHub PR comment.

Structure:
1. **Summary** (2-3 lines: overall verdict + worst issues count)
2. **Critical issues** (missing/duplicated title, description, canonical, h1; noindex on prod pages; >70-char titles; >160-char or <70-char descriptions; missing og:image; broken JSON-LD${extras.brokenLinks ? '; broken internal links' : ''}${extras.redirectChains ? '; redirect chains' : ''})
3. **Improvements** (alt text gaps, JSON-LD coverage, social tags)
4. **Per-page notes** — only include pages with issues, bulleted with the URL path.${extrasSection}

Be terse and actionable. Don't restate compliant pages. Don't invent metrics.`;

  const payload = { pages: report };
  if (extras.brokenLinks) payload.brokenLinks = extras.brokenLinks;
  if (extras.redirectChains) payload.redirectChains = extras.redirectChains;
  const { content: userContent, sent, dropped } = buildUserContent(payload, report.length);
  if (dropped > 0) {
    console.log(
      `User content trimmed: dropped ${dropped} page(s) to stay under ${MAX_INPUT_CHARS} chars (~${Math.round(
        MAX_INPUT_CHARS / 4
      )} tokens). Sent ${sent}.`
    );
  } else {
    console.log(
      `User content size: ${userContent.length} chars (~${Math.round(
        userContent.length / 4
      )} tokens), under cap ${MAX_INPUT_CHARS}.`
    );
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Claude API ${res.status}: ${txt}`);
  }
  const data = await res.json();
  return data.content?.map((b) => b.text).join('\n') || '_No content returned._';
}

async function main() {
  try {
    await stat(DIST_DIR);
  } catch {
    throw new Error(`Build dir not found: ${DIST_DIR}. Run \`npm run build\` first.`);
  }

  const cfg = await loadConfig();
  const all = await walk(DIST_DIR, DIST_DIR, cfg);
  const changed = (process.env.CHANGED_FILES || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  const slugs = mapChangedToSlugs(changed);
  const broad = hasBroadChange(changed);
  const siteHost = (() => {
    try {
      return new URL(SITE_URL).host;
    } catch {
      return 'www.datum.net';
    }
  })();

  let candidates = [];
  let mode = SCAN_MODE === 'full' ? 'full' : 'skipped-no-changes';
  let skipReason = null;

  if (SCAN_MODE === 'full') {
    candidates = all;
  } else if (changed.length) {
    if (broad) {
      mode = 'skipped-broad-change';
      skipReason =
        'Broad change detected (layout/component/style/config). PR scan skips full-site review.';
    } else if (!slugs.length) {
      mode = 'skipped-no-pages';
      skipReason = 'Changed files do not include any `src/pages` or `src/content` entries.';
    } else {
      const matched = filterByChanged(all, DIST_DIR, slugs);
      if (matched.length) {
        candidates = matched;
        mode = 'changed-only';
      } else {
        mode = 'skipped-no-match';
        skipReason = 'No built pages matched the changed slugs.';
      }
    }
  } else {
    skipReason = 'No `CHANGED_FILES` provided in `changed-only` mode.';
  }

  const picked = candidates.slice(0, MAX_PAGES);
  console.log(
    `SCAN_MODE=${SCAN_MODE} → mode: ${mode} — ${candidates.length} candidate(s), analyzing ${picked.length}.${
      skipReason ? ` Reason: ${skipReason}` : ''
    }`
  );

  const isFull = SCAN_MODE === 'full';
  const heading = isFull ? '## 🗓️ Weekly SEO Audit' : '## 🔎 SEO & Meta Review';

  let body;
  if (picked.length === 0) {
    body = [
      '<!-- seo-review-bot -->',
      heading,
      '',
      `_Skipped (mode: \`${mode}\`)._`,
      '',
      skipReason || 'No pages to review.',
      '',
    ].join('\n');
  } else {
    const report = [];
    const linkMap = new Map();
    const refreshMap = new Map();

    for (const file of picked) {
      const html = await readFile(file, 'utf8');
      const url = toUrlPath(file, DIST_DIR);
      report.push(extractMeta(html, url));
      if (SCAN_MODE === 'full') {
        const $ = load(html);
        const { refs, refresh } = extractLinksAndRefresh($, url, siteHost);
        if (refs.length) linkMap.set(url, refs);
        if (refresh) refreshMap.set(normalizeUrlPath(url), normalizeUrlPath(refresh));
      }
    }

    let brokenLinks = null;
    let redirectChains = null;
    if (SCAN_MODE === 'full') {
      const builtSet = buildBuiltSet(all, DIST_DIR);
      const srcSet = await buildSourceRouteSet();
      brokenLinks = findBrokenLinks(linkMap, builtSet, srcSet);
      redirectChains = findRedirectChains(refreshMap);
      console.log(
        `Audits — broken internal links: ${brokenLinks.length}, redirect chains: ${redirectChains.length}.`
      );
    }

    const review = await callClaude(report, {
      brokenLinks: brokenLinks?.length ? brokenLinks : undefined,
      redirectChains: redirectChains?.length ? redirectChains : undefined,
    });

    const auditLine =
      SCAN_MODE === 'full'
        ? `\n_Audits: ${brokenLinks.length} broken internal link(s), ${redirectChains.length} redirect chain(s)._`
        : '';

    body = [
      '<!-- seo-review-bot -->',
      heading,
      '',
      `_Analyzed ${report.length} of ${all.length} built HTML pages (mode: \`${mode}\`)._${auditLine}`,
      '',
      review,
    ].join('\n');
  }

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, body, 'utf8');
  console.log(`Wrote ${OUTPUT_FILE} (${body.length} bytes, ${picked.length} pages).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
