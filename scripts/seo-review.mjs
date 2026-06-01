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
 *   MAX_PAGES           default: unlimited (set to a positive integer to cap; 0/unset = no cap).
 *                       Note: AI review payload is still capped by MAX_INPUT_CHARS — extra
 *                       pages may be dropped from the Claude prompt but always count in the
 *                       deterministic score table and broken-link audit.
 *   OUTPUT_FILE         default: .tmp/seo-review.md
 *   SITE_URL            default: https://www.datum.net (host used to recognise internal links)
 */

import { readFile, writeFile, readdir, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const DIST_DIR = process.env.DIST_DIR || 'dist/client';
// 0 / unset / non-positive = unlimited. Cap exists only as an escape hatch.
const MAX_PAGES_RAW = parseInt(process.env.MAX_PAGES || '0', 10);
const MAX_PAGES = Number.isFinite(MAX_PAGES_RAW) && MAX_PAGES_RAW > 0 ? MAX_PAGES_RAW : Infinity;
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
let SITE_ORIGIN;
try {
  SITE_ORIGIN = new URL(SITE_URL).origin;
} catch {
  SITE_ORIGIN = 'https://www.datum.net';
}
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

function extractMeta($, urlPath) {
  const get = (sel, attr = 'content') => $(sel).attr(attr)?.trim() || null;
  const title = $('title').first().text().trim() || null;
  const description = get('meta[name="description"]');

  const h1s = $('h1')
    .map((_, el) => $(el).text().trim())
    .get();
  const imgs = $('img').toArray();
  // An image is "missing alt" only if it has no `alt` attribute and is not marked decorative.
  // `alt=""` is the canonical way to mark decorative images; aria-hidden="true" and role=presentation/none
  // also explicitly exempt an image from needing alt text.
  const imgsMissingAlt = imgs.filter((el) => {
    const $el = $(el);
    if ($el.attr('alt') !== undefined) return false; // empty or non-empty alt: not missing
    const ariaHidden = ($el.attr('aria-hidden') || '').toLowerCase() === 'true';
    const role = ($el.attr('role') || '').toLowerCase();
    if (ariaHidden || role === 'presentation' || role === 'none') return false;
    return true;
  }).length;

  const jsonLdNodes = $('script[type="application/ld+json"]');
  const jsonLdTypes = jsonLdNodes
    .map((_, el) => {
      try {
        const j = JSON.parse($(el).contents().text());
        return Array.isArray(j) ? j.map((x) => x['@type']).join(',') : j['@type'];
      } catch {
        return 'invalid';
      }
    })
    .get();

  return {
    url: urlPath,
    title,
    titleLen: title?.length ?? 0,
    description,
    descriptionLen: description?.length ?? 0,
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
    hasJsonLd: jsonLdNodes.length > 0,
    jsonLdTypes,
  };
}

function parsePreviousScores(body) {
  if (!body) return null;
  const m = body.match(/<!--\s*seo-scores:\s*(\{[\s\S]*?\})\s*-->/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

// For "issues" metrics, lower is better — arrow flips accordingly.
function trendArrow(current, previous, { higherIsBetter }) {
  if (previous == null || Number.isNaN(previous)) return '';
  const delta = current - previous;
  if (delta === 0) return ' ▬ 0';
  const sign = delta > 0 ? '+' : '';
  const improved = higherIsBetter ? delta > 0 : delta < 0;
  const arrow = improved ? '▲' : '▼';
  return ` ${arrow} ${sign}${delta}`;
}

function computeScoreSummary(report, brokenLinks, redirectChains, previous) {
  const total = report.length;
  const tally = {
    titleIssues: 0,
    descIssues: 0,
    canonicalMissing: 0,
    h1Issues: 0,
    noindex: 0,
    ogImageMissing: 0,
    jsonLdBroken: 0,
    altMissing: 0,
  };
  for (const p of report) {
    if (!p.title || p.titleLen > 70) tally.titleIssues++;
    if (!p.description || p.descriptionLen < 70 || p.descriptionLen > 160) tally.descIssues++;
    if (!p.canonical) tally.canonicalMissing++;
    if (p.h1Count !== 1) tally.h1Issues++;
    if ((p.robots || '').toLowerCase().includes('noindex')) tally.noindex++;
    if (!p.ogImage) tally.ogImageMissing++;
    if ((p.jsonLdTypes || []).includes('invalid')) tally.jsonLdBroken++;
    if (p.imgsMissingAlt > 0) tally.altMissing++;
  }

  const brokenCount = brokenLinks?.length ?? 0;
  const chainCount = redirectChains?.length ?? 0;

  // Score: 100 - weighted penalty. Per-page checks normalize by total pages.
  const pageIssueRate =
    (tally.titleIssues +
      tally.descIssues +
      tally.canonicalMissing +
      tally.h1Issues +
      tally.noindex +
      tally.ogImageMissing +
      tally.jsonLdBroken +
      tally.altMissing) /
    Math.max(total * 8, 1);
  const penalty = Math.min(100, pageIssueRate * 80 + brokenCount * 2 + chainCount * 1);
  const score = Math.max(0, Math.round(100 - penalty));
  const grade = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';

  const status = (n) => (n === 0 ? '✅' : n <= 2 ? '🟡' : '🔴');
  const prev = previous || {};
  const prevTally = prev.tally || {};
  const tr = (key, current, higherIsBetter = false) =>
    trendArrow(current, key === 'score' ? prev.score : prevTally[key], { higherIsBetter });

  const rows = [
    ['Overall score', `${grade} **${score} / 100**${tr('score', score, true)}`],
    ['Pages analyzed', String(total)],
    [
      'Title issues (missing or >70 chars)',
      `${status(tally.titleIssues)} ${tally.titleIssues}${tr('titleIssues', tally.titleIssues)}`,
    ],
    [
      'Description issues (length out of 70–160)',
      `${status(tally.descIssues)} ${tally.descIssues}${tr('descIssues', tally.descIssues)}`,
    ],
    [
      'Canonical missing',
      `${status(tally.canonicalMissing)} ${tally.canonicalMissing}${tr('canonicalMissing', tally.canonicalMissing)}`,
    ],
    [
      'H1 issues (0 or >1)',
      `${status(tally.h1Issues)} ${tally.h1Issues}${tr('h1Issues', tally.h1Issues)}`,
    ],
    [
      'Noindex on built pages',
      `${status(tally.noindex)} ${tally.noindex}${tr('noindex', tally.noindex)}`,
    ],
    [
      'og:image missing',
      `${status(tally.ogImageMissing)} ${tally.ogImageMissing}${tr('ogImageMissing', tally.ogImageMissing)}`,
    ],
    [
      'JSON-LD invalid',
      `${status(tally.jsonLdBroken)} ${tally.jsonLdBroken}${tr('jsonLdBroken', tally.jsonLdBroken)}`,
    ],
    [
      'Pages with missing alt text',
      `${status(tally.altMissing)} ${tally.altMissing}${tr('altMissing', tally.altMissing)}`,
    ],
    [
      'Broken internal links',
      `${status(brokenCount)} ${brokenCount}${trendArrow(brokenCount, prev.brokenCount, { higherIsBetter: false })}`,
    ],
    [
      'Redirect chains',
      `${status(chainCount)} ${chainCount}${trendArrow(chainCount, prev.chainCount, { higherIsBetter: false })}`,
    ],
  ];
  const header = '| Metric | Value |\n| --- | --- |';
  const body = rows.map(([k, v]) => `| ${k} | ${v} |`).join('\n');

  const capturedAt = new Date().toISOString().slice(0, 10);
  const machine = `<!-- seo-scores: ${JSON.stringify({ score, tally, brokenCount, chainCount, capturedAt })} -->`;
  const legend = previous
    ? `_Trend vs previous audit (${prev.capturedAt || 'last run'}): ▲ improved · ▼ worsened · ▬ unchanged._`
    : '_No previous audit found — trend will appear next run._';

  return { table: `${header}\n${body}`, machine, legend };
}

function normalizePath(p) {
  if (!p) return p;
  if (p === '/') return '/';
  return p.replace(/\/+$/, '');
}

function extractLinksAndRefresh($, urlPath) {
  const refs = [];
  $('a[href]').each((_, el) => {
    const href = ($(el).attr('href') || '').trim();
    if (!href) return;
    if (/^(#|mailto:|tel:|javascript:|data:)/i.test(href)) return;
    if (href.startsWith('//')) return; // protocol-relative external
    if (/^https?:\/\//i.test(href)) {
      try {
        const u = new URL(href);
        if (u.origin === SITE_ORIGIN) {
          refs.push(normalizePath(u.pathname));
        }
      } catch {
        /* ignore malformed absolute URLs */
      }
      return;
    }
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
    if (pathname) refs.push(normalizePath(pathname));
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
    const chain = [start];
    const seen = new Set(chain);
    let cur = start;
    while (refreshMap.has(cur)) {
      const next = normalizeUrlPath(refreshMap.get(cur));
      if (seen.has(next)) {
        chain.push(next + ' (loop)');
        break;
      }
      chain.push(next);
      seen.add(next);
      cur = next;
    }
    if (chain.length > 2) chains.push(chain); // >=2 hops = chain
  }
  return chains;
}

function toUrlPath(file, root) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length);
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

// Greedy pack: split pages into batches where each batch's serialized JSON
// fits under `budget` chars (with safety margin for prompt scaffolding).
function chunkPagesByCharBudget(pages, budget) {
  const OVERHEAD = 4000; // header + JSON wrapper + safety margin
  const effective = Math.max(budget - OVERHEAD, 10000);
  const batches = [];
  let cur = [];
  let curSize = 0;
  for (const page of pages) {
    const size = JSON.stringify(page).length + 1; // +1 for separating comma
    if (cur.length > 0 && curSize + size > effective) {
      batches.push(cur);
      cur = [];
      curSize = 0;
    }
    cur.push(page);
    curSize += size;
  }
  if (cur.length) batches.push(cur);
  return batches;
}

// Aggregates token usage across all Claude calls within a single run.
const tokenTotals = { input: 0, output: 0, cacheRead: 0, cacheCreate: 0, calls: 0 };

async function postClaude({ system, userContent }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096, //8192,
      system,
      messages: [{ role: 'user', content: userContent }],
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Claude API ${res.status}: ${txt}`);
  }
  const data = await res.json();
  const u = data.usage || {};
  const inTok = u.input_tokens || 0;
  const outTok = u.output_tokens || 0;
  const cacheR = u.cache_read_input_tokens || 0;
  const cacheC = u.cache_creation_input_tokens || 0;
  tokenTotals.input += inTok;
  tokenTotals.output += outTok;
  tokenTotals.cacheRead += cacheR;
  tokenTotals.cacheCreate += cacheC;
  tokenTotals.calls += 1;
  console.log(
    `Tokens — call #${tokenTotals.calls}: in=${inTok} out=${outTok}` +
      (cacheR || cacheC ? ` (cache read=${cacheR} create=${cacheC})` : '')
  );
  return data.content?.map((b) => b.text).join('\n') || '_No content returned._';
}

function buildFullSystemPrompt(extras) {
  const extrasSection =
    extras.brokenLinks || extras.redirectChains
      ? `

Additionally, you'll receive:
- \`brokenLinks\`: internal anchor hrefs whose target URL does not exist as a built page. Call these out as critical.
- \`redirectChains\`: redirect hops (2+) discovered via \`<meta http-equiv="refresh">\`. Recommend collapsing to a single hop.`
      : '';
  return `You are an SEO and meta-data reviewer for an Astro static site.
You will receive a JSON array of pages with extracted SEO signals.
Return a concise markdown review for a GitHub PR comment.

Structure:
1. **Summary** (2-3 lines: overall verdict + worst issues count)
2. **Critical issues** (missing/duplicated title, description, canonical, h1; noindex on prod pages; >70-char titles; >160-char or <70-char descriptions; missing og:image; broken JSON-LD${extras.brokenLinks ? '; broken internal links' : ''}${extras.redirectChains ? '; redirect chains' : ''})
3. **Improvements** (alt text gaps, JSON-LD coverage, social tags)
4. **Per-page notes** — only include pages with issues, bulleted with the URL path.${extrasSection}

When referencing a page URL path (e.g. \`/about\`, \`/blog/post\`), render it as a markdown link: \`[/about](${SITE_URL}/about)\`. Apply this to every path in Critical issues, Improvements, Per-page notes, brokenLinks, and redirectChains sections. The root path \`/\` links to \`${SITE_URL}/\`.

For EVERY issue listed (Critical, Improvements, and Per-page notes) you MUST include a concrete fix.
Format each issue as:
  - <description of issue, citing data from the JSON>
    - 💡 *Fix:* <specific actionable suggestion — what to change, where, and how>

Examples of good fixes:
  - "Trim title to ≤60 chars; suggested: \`Datum — Decentralized Network Cloud\` (37 chars)."
  - "Rewrite description to 130–155 chars including primary keyword 'private connectivity'."
  - "Set og:image to absolute URL: \`https://www.datum.net/_astro/handbook.X.png\`."
  - "Fix shared layout in \`src/layouts/Handbook.astro\` so only one \`<h1>\` is rendered (currently emits both sidebar title and article title)."

When the same fix applies to many pages, group them and propose a single template-level fix instead of repeating per page.
Be terse and actionable. Don't restate compliant pages. Don't invent metrics or speculate beyond the data.`;
}

async function callClaudeSingle(pages, extras, totalPages) {
  const payload = { pages };
  if (extras.brokenLinks) payload.brokenLinks = extras.brokenLinks;
  if (extras.redirectChains) payload.redirectChains = extras.redirectChains;
  const userContent = `Pages analyzed: ${pages.length} of ${totalPages}\n\nData:\n\n\`\`\`json\n${JSON.stringify(payload)}\n\`\`\``;
  console.log(
    `Single-call: ${userContent.length} chars (~${Math.round(userContent.length / 4)} tokens).`
  );
  return postClaude({ system: buildFullSystemPrompt(extras), userContent });
}

async function callClaudeBatch(pages, batchIndex, batchCount, totalPages) {
  const system = `You are an SEO reviewer auditing batch ${batchIndex} of ${batchCount} for an Astro static site.
You will receive a JSON array of pages with extracted SEO signals.

Output ONLY per-page issue bullets — no summary, no headings, no preamble.
For EACH page with issues, output the URL path as a markdown link to \`${SITE_URL}<path>\` (root \`/\` → \`${SITE_URL}/\`):
- [<url>](${SITE_URL}<url>) — comma-separated issues (missing title/description/canonical/h1, length out of range, noindex, missing og:image, broken JSON-LD, missing alt text)
  - 💡 *Fix:* <specific actionable suggestion citing the exact data point>

Skip pages with no issues. Be terse. Don't invent metrics. Don't restate compliant pages.`;
  const userContent = `Batch ${batchIndex}/${batchCount} — ${pages.length} of ${totalPages} pages.\n\nData:\n\n\`\`\`json\n${JSON.stringify({ pages })}\n\`\`\``;
  console.log(
    `Batch ${batchIndex}/${batchCount}: ${pages.length} pages, ${userContent.length} chars (~${Math.round(userContent.length / 4)} tokens).`
  );
  return postClaude({ system, userContent });
}

async function callClaudeSynthesis(batchNotes, extras, totalPages) {
  const system = `You are an SEO reviewer synthesizing a final report for an Astro static site.
You will receive per-page issue bullets (each with a Fix line) collected from multiple batches, plus optional global audit data.

Produce a concise markdown review for a GitHub PR comment with this structure:
1. **Summary** (2-3 lines: overall verdict + worst issues count across all batches)
2. **Critical issues** (group recurring issues; cite counts; flag broken JSON-LD${extras.brokenLinks ? ', broken internal links' : ''}${extras.redirectChains ? ', redirect chains' : ''})
3. **Improvements** (alt text gaps, JSON-LD coverage, social tags)
4. **Per-page notes** — deduplicated, bulleted with the URL path. Keep this section if useful; collapse to "see batch notes above" only if the list would exceed ~50 entries.

Render every URL path as a markdown link: \`[/path](${SITE_URL}/path)\` (root \`/\` → \`${SITE_URL}/\`). Preserve any existing links from the batch notes.

For EVERY issue in Critical/Improvements/Per-page sections you MUST include a fix line:
  - <issue>
    - 💡 *Fix:* <specific actionable suggestion>

When many pages share the same issue, propose ONE template/layout-level fix (cite the suspected source file) instead of repeating per page.
Be terse and actionable. Don't invent metrics. Preserve fix suggestions from the batch notes where possible.`;

  const parts = [`Total pages: ${totalPages} across ${batchNotes.length} batches.`];
  parts.push('\nBatch notes:\n');
  batchNotes.forEach((notes, i) => {
    parts.push(`### Batch ${i + 1}\n${notes.trim()}\n`);
  });
  if (extras.brokenLinks) {
    parts.push(
      `\nbrokenLinks (${extras.brokenLinks.length}):\n\`\`\`json\n${JSON.stringify(extras.brokenLinks)}\n\`\`\``
    );
  }
  if (extras.redirectChains) {
    parts.push(
      `\nredirectChains (${extras.redirectChains.length}):\n\`\`\`json\n${JSON.stringify(extras.redirectChains)}\n\`\`\``
    );
  }
  const userContent = parts.join('\n');
  console.log(
    `Synthesis: ${userContent.length} chars (~${Math.round(userContent.length / 4)} tokens).`
  );
  return postClaude({ system, userContent });
}

async function callClaude(report, extras = {}) {
  const batches = chunkPagesByCharBudget(report, MAX_INPUT_CHARS);
  if (batches.length <= 1) {
    return callClaudeSingle(report, extras, report.length);
  }
  console.log(`Splitting ${report.length} pages into ${batches.length} batches.`);
  const batchNotes = [];
  for (let i = 0; i < batches.length; i++) {
    const notes = await callClaudeBatch(batches[i], i + 1, batches.length, report.length);
    batchNotes.push(notes);
  }
  // If synthesis would itself exceed the cap, fall back to deterministic concat.
  const totalNoteChars = batchNotes.reduce((n, s) => n + s.length, 0);
  if (totalNoteChars > MAX_INPUT_CHARS - 8000) {
    console.log(
      `Skipping synthesis call (combined notes ${totalNoteChars} chars near cap); concatenating batches.`
    );
    return batchNotes
      .map((notes, i) => `### Batch ${i + 1}/${batches.length}\n\n${notes.trim()}`)
      .join('\n\n');
  }
  return callClaudeSynthesis(batchNotes, extras, report.length);
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
    // Read + parse in parallel. Page count is capped by MAX_PAGES,
    // so an unbounded Promise.all is fine here — no need for a concurrency pool.
    const perPage = await Promise.all(
      picked.map(async (file) => {
        const html = await readFile(file, 'utf8');
        const $ = load(html);
        const url = toUrlPath(file, DIST_DIR);
        const meta = extractMeta($, url);
        const links = isFull ? extractLinksAndRefresh($, url) : null;
        return { url, meta, links };
      })
    );

    const report = [];
    const linkMap = new Map();
    const refreshMap = new Map();
    for (const { url, meta, links } of perPage) {
      report.push(meta);
      if (links) {
        if (links.refs.length) linkMap.set(url, links.refs);
        if (links.refresh) refreshMap.set(normalizeUrlPath(url), normalizeUrlPath(links.refresh));
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

    const previousScores = parsePreviousScores(process.env.PREVIOUS_AUDIT_BODY);
    const {
      table: scoreTable,
      machine: scoreMachine,
      legend: trendLegend,
    } = computeScoreSummary(report, brokenLinks, redirectChains, previousScores);

    body = [
      '<!-- seo-review-bot -->',
      scoreMachine,
      heading,
      '',
      `_Analyzed ${report.length} of ${all.length} built HTML pages (mode: \`${mode}\`)._${auditLine}`,
      '',
      '### 📊 Score summary',
      '',
      scoreTable,
      '',
      trendLegend,
      '',
      '---',
      '',
      review,
    ].join('\n');
  }

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, body, 'utf8');
  console.log(`Wrote ${OUTPUT_FILE} (${body.length} bytes, ${picked.length} pages).`);

  if (tokenTotals.calls > 0) {
    const totalIn = tokenTotals.input + tokenTotals.cacheRead + tokenTotals.cacheCreate;
    const totalOut = tokenTotals.output;
    console.log(
      `Token usage — ${tokenTotals.calls} call(s): ` +
        `input=${totalIn} (uncached=${tokenTotals.input}, cache_read=${tokenTotals.cacheRead}, cache_create=${tokenTotals.cacheCreate}), ` +
        `output=${totalOut}, total=${totalIn + totalOut}.`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
