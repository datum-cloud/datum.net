#!/usr/bin/env node
/**
 * Merge dns-hero step SVGs into one sprite with namespaced ids + #1571 hit wrappers.
 *
 * Reads (unchanged):
 *   src/static/assets/features/dns-hero/{dashboard,panel-*}.svg
 * Writes:
 *   src/static/assets/features/dns-hero/dns-hero-sprite.svg
 *
 * Usage: node scripts/build-dns-hero-sprite.mjs
 */

import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'src/static/assets/features/dns-hero');
const OUT = path.join(DIR, 'dns-hero-sprite.svg');

/** @type {{ step: number; file: string; hitMap: Record<string, string>; extras?: Record<string, string> }[]} */
const STEPS = [
  {
    step: 1,
    file: 'dashboard.svg',
    hitMap: {
      import: 'dns-hero-s1-hit-import-export',
      // Filled “+ Add Record” CTA (Buttons_3 / plus icon)
      'Datum App UI/Buttons_3': 'dns-hero-s1-hit-add-record',
    },
  },
  {
    step: 2,
    file: 'panel-import.svg',
    hitMap: {
      'Select a file or drag it here (BIND format only)': 'dns-hero-s2-hit-select-file',
    },
  },
  {
    step: 3,
    file: 'panel-finder.svg',
    hitMap: {
      'Trailing Default Button': 'dns-hero-s3-hit-open',
      Item_6: 'dns-hero-s3-hit-file',
    },
  },
  {
    step: 4,
    file: 'panel-preview.svg',
    hitMap: {
      Checkbox: 'dns-hero-s4-hit-check-all',
      Checkbox_2: 'dns-hero-s4-hit-check-1',
      Checkbox_3: 'dns-hero-s4-hit-check-2',
      Checkbox_4: 'dns-hero-s4-hit-check-3',
      Checkbox_5: 'dns-hero-s4-hit-check-4',
      Checkbox_6: 'dns-hero-s4-hit-check-5',
      Checkbox_7: 'dns-hero-s4-hit-check-6',
      Checkbox_8: 'dns-hero-s4-hit-check-7',
      'Datum App UI/Buttons': 'dns-hero-s4-hit-import',
    },
  },
  {
    step: 5,
    file: 'panel-selected.svg',
    hitMap: {
      'Icon / Check': 'dns-hero-s5-check-1',
      'Icon / Check_2': 'dns-hero-s5-check-2',
      'Icon / Check_3': 'dns-hero-s5-check-3',
      'Icon / Check_4': 'dns-hero-s5-check-4',
      'Icon / Check_5': 'dns-hero-s5-check-5',
      'Icon / Check_6': 'dns-hero-s5-check-6',
      'Icon / Check_7': 'dns-hero-s5-check-7',
      'Datum App UI/Buttons': 'dns-hero-s5-hit-import',
    },
    // Icon / Check_8 is header check in selected state — keep as check-all visual
    extras: {
      'Icon / Check_8': 'dns-hero-s5-check-all',
    },
  },
  {
    step: 6,
    file: 'panel-created.svg',
    hitMap: {
      Created: 'dns-hero-s6-created-1',
      Created_2: 'dns-hero-s6-created-2',
      Created_3: 'dns-hero-s6-created-3',
      Created_4: 'dns-hero-s6-created-4',
      Created_5: 'dns-hero-s6-created-5',
      Created_6: 'dns-hero-s6-created-6',
      Created_7: 'dns-hero-s6-created-7',
      'circle-check': 'dns-hero-s6-status-1',
      'circle-check_2': 'dns-hero-s6-status-2',
      'circle-check_3': 'dns-hero-s6-status-3',
      'circle-check_4': 'dns-hero-s6-status-4',
      'circle-check_5': 'dns-hero-s6-status-5',
      'circle-check_6': 'dns-hero-s6-status-6',
      'circle-check_7': 'dns-hero-s6-status-7',
      'Datum App UI/Buttons': 'dns-hero-s6-hit-done',
    },
  },
  {
    step: 7,
    file: 'panel-success.svg',
    hitMap: {
      'Imported 7 DNS records': 'dns-hero-s7-toast',
    },
  },
];

/**
 * @param {string} id
 * @returns {string}
 */
function sanitizeId(id) {
  return id
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .toLowerCase();
}

/**
 * @param {string} svg
 * @returns {{ viewBox: string; width: string; height: string; inner: string }}
 */
function parseSvg(svg) {
  const open = svg.match(/<svg\b([^>]*)>/i);
  if (!open) {
    throw new Error('Missing <svg> root');
  }
  const attrs = open[1];
  const viewBox = attrs.match(/\bviewBox="([^"]+)"/i)?.[1] ?? '0 0 598 368';
  const width = attrs.match(/\bwidth="([^"]+)"/i)?.[1] ?? viewBox.split(/\s+/)[2] ?? '598';
  const height = attrs.match(/\bheight="([^"]+)"/i)?.[1] ?? viewBox.split(/\s+/)[3] ?? '368';
  const inner = svg
    .replace(/<\?xml[^>]*>/i, '')
    .replace(/<!DOCTYPE[^>]*>/i, '')
    .replace(/<svg\b[^>]*>/i, '')
    .replace(/<\/svg>\s*$/i, '')
    .trim();
  return { viewBox, width, height, inner };
}

/**
 * Rewrite all ids + url(#)/href="#"/xlink:href="#" refs with a step prefix.
 * Then apply hit-map aliases (original Figma id → stable hit id).
 *
 * @param {string} inner
 * @param {number} step
 * @param {Record<string, string>} hitMap
 * @returns {{ markup: string; foundHits: string[]; missingHits: string[]; idCount: number }}
 */
function namespaceAndAlias(inner, step, hitMap) {
  const prefix = `dns-hero-s${step}-`;
  const idAttrRe = /\bid="([^"]+)"/g;
  /** @type {Map<string, string>} */
  const idMap = new Map();
  let match;
  while ((match = idAttrRe.exec(inner)) !== null) {
    const original = match[1];
    if (!idMap.has(original)) {
      idMap.set(original, `${prefix}${sanitizeId(original)}`);
    }
  }

  // Apply hit aliases: preferred public id replaces the namespaced id for that layer.
  /** @type {string[]} */
  const foundHits = [];
  /** @type {string[]} */
  const missingHits = [];
  for (const [figmaId, hitId] of Object.entries(hitMap)) {
    if (idMap.has(figmaId)) {
      idMap.set(figmaId, hitId);
      foundHits.push(hitId);
    } else {
      missingHits.push(`${hitId} (missing Figma id "${figmaId}")`);
    }
  }

  let markup = inner;

  // Replace url(#id), href="#id", xlink:href="#id" using original ids first.
  markup = markup.replace(/url\(#([^)]+)\)/g, (full, refId) => {
    const mapped = idMap.get(refId);
    return mapped ? `url(#${mapped})` : full;
  });

  markup = markup.replace(/\b(href|xlink:href)="#([^"]+)"/g, (full, attr, refId) => {
    const mapped = idMap.get(refId);
    return mapped ? `${attr}="#${mapped}"` : full;
  });

  markup = markup.replace(/\bid="([^"]+)"/g, (_full, original) => {
    const mapped = idMap.get(original);
    return mapped ? `id="${mapped}"` : `id="${original}"`;
  });

  return { markup, foundHits, missingHits, idCount: idMap.size };
}

/**
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function sha256File(filePath) {
  const buf = await readFile(filePath);
  return createHash('sha256').update(buf).digest('hex');
}

async function main() {
  /** @type {string[]} */
  const gaps = [];
  /** @type {{ step: number; viewBox: string; w: string; h: string; markup: string }[]} */
  const meta = [];
  /** @type {Map<string, string>} */
  const sourceHashes = new Map();

  for (const entry of STEPS) {
    const filePath = path.join(DIR, entry.file);
    await access(filePath);
    sourceHashes.set(entry.file, await sha256File(filePath));

    const raw = await readFile(filePath, 'utf8');
    const { viewBox, width, height, inner } = parseSvg(raw);
    const hitMap = { ...entry.hitMap, ...(entry.extras ?? {}) };
    const { markup, foundHits, missingHits, idCount } = namespaceAndAlias(
      inner,
      entry.step,
      hitMap
    );

    for (const miss of missingHits) {
      gaps.push(`step ${entry.step}: ${miss}`);
    }

    console.log(
      `step ${entry.step} (${entry.file}): viewBox=${viewBox}, ids=${idCount}, hits=${foundHits.length}/${Object.keys(hitMap).length}`
    );
    if (foundHits.length) {
      console.log(`  hits: ${foundHits.join(', ')}`);
    }

    // Spinner working-state is called out in #1571 but not present in the static export.
    if (entry.step === 6) {
      gaps.push(
        'step 6: no spinner/loader layers in panel-created.svg — phase 3 must add dns-hero-s6-status-* spinner states'
      );
    }

    // Expanded light-DOM groups (not <use>) so CSS can target hit ids for #1571.
    // Nested <svg id="dns-hero-step-N"> remains usable as a <use> fragment for (C).
    meta.push({ step: entry.step, viewBox, w: width, h: height, markup });
  }

  const STAGE_W = 598;
  const STAGE_H = 368;

  /**
   * @param {{ step: number; viewBox: string; w: string; h: string; markup: string }} m
   * @param {{ center: boolean }} opts
   */
  function frameGroup(m, opts) {
    const w = Number(m.w);
    const h = Number(m.h);
    const x = opts.center ? (STAGE_W - w) / 2 : 0;
    const y = opts.center ? (STAGE_H - h) / 2 : 0;
    // Outer g is animated via CSS transform; inner g holds static stage position
    // so CSS does not clobber the centering translate.
    const innerTransform = x || y ? ` transform="translate(${x} ${y})"` : '';
    return `      <g id="dns-hero-frame-${m.step}" class="dns-hero-anim-frame dns-hero-anim-frame--${m.step}">
        <g${innerTransform}>
          <svg id="dns-hero-step-${m.step}"
               data-source="${STEPS[m.step - 1].file}"
               viewBox="${m.viewBox}"
               width="${m.w}"
               height="${m.h}"
               overflow="visible">
${m.markup}
          </svg>
        </g>
      </g>`;
  }

  const step1 = meta.find((m) => m.step === 1);
  const cards = meta.filter((m) => m.step > 1);
  if (!step1) {
    throw new Error('Missing step 1');
  }

  const chromeBlock = frameGroup(step1, { center: false });
  const cardBlocks = cards.map((m) => frameGroup(m, { center: true })).join('\n');

  // Combined sprite used by HeroAnimation (split into chrome/cards in the page
  // so blur can run on a real HTML wrapper — CSS filter on SVG <g> is unreliable).
  const out = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="598"
     height="368"
     viewBox="0 0 598 368"
     fill="none"
     class="dns-hero-anim-svg"
     role="img"
     aria-label="DNS hero animation sprite">
  <!-- Generated by scripts/build-dns-hero-sprite.mjs — do not edit by hand.
       Product brief: https://github.com/datum-cloud/datum.net/issues/1571 -->
  <!--dns-hero:chrome:start-->
  <g id="dns-hero-chrome">
${chromeBlock}
  </g>
  <!--dns-hero:chrome:end-->
  <!--dns-hero:cards:start-->
  <g id="dns-hero-cards">
${cardBlocks}
  </g>
  <!--dns-hero:cards:end-->
</svg>
`;

  await writeFile(OUT, out, 'utf8');

  // Verify originals unchanged
  for (const entry of STEPS) {
    const filePath = path.join(DIR, entry.file);
    const hash = await sha256File(filePath);
    if (hash !== sourceHashes.get(entry.file)) {
      throw new Error(`Source mutated during build: ${entry.file}`);
    }
  }

  // Verify required ids exist in output
  const required = [
    'dns-hero-chrome',
    'dns-hero-cards',
    'dns-hero:chrome:start',
    'dns-hero:cards:start',
    ...STEPS.map((s) => `dns-hero-step-${s.step}`),
    ...STEPS.map((s) => `dns-hero-frame-${s.step}`),
  ];
  const missingRequired = required.filter(
    (id) => !out.includes(id.includes(':') ? id : `id="${id}"`)
  );
  if (missingRequired.length) {
    throw new Error(`Missing required ids: ${missingRequired.join(', ')}`);
  }

  // Spot-check: bare Figma clip id should not appear unprefixed
  if (/\bid="clip0_14648_15328"/.test(out)) {
    throw new Error('Unnamespaced clip0_14648_15328 still present');
  }

  const sizeKb = Math.round(Buffer.byteLength(out, 'utf8') / 1024);
  console.log(`\nWrote ${path.relative(ROOT, OUT)} (${sizeKb} KB)`);
  console.log('Source SVGs unchanged (sha256 verified).');

  if (gaps.length) {
    console.log('\nGaps / notes for later phases:');
    for (const g of gaps) {
      console.log(`  - ${g}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
