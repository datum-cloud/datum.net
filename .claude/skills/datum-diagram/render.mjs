// Render designed diagrams (examples/diagrams.mjs or your own module) to 2x PNG + SVG.
//   node .claude/skills/datum-diagram/render.mjs <out-dir> [module] [name ...]
// Needs playwright-core and a Chromium headless shell (`npx playwright install chromium-headless-shell`).
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const [outDir = 'diagram-out', modPath = path.join(here, 'examples/diagrams.mjs'), ...only] = process.argv.slice(2);
const mod = await import(pathToFileURL(path.resolve(modPath)).href);
const names = Object.keys(mod).filter((n) => typeof mod[n] === 'function' && (!only.length || only.includes(n)));

const fonts = path.resolve(here, '../../../public/fonts');
const css = `@font-face{font-family:'Alliance No.1';font-weight:400;src:url(file://${fonts}/datum/allianceno1-regular-webfont.woff2)}
@font-face{font-family:'Alliance No.1';font-weight:500;src:url(file://${fonts}/datum/allianceno1-medium-webfont.woff2)}
@font-face{font-family:'DejaVu Sans Mono';src:url(file://${fonts}/dejavu-sans-mono/DejaVuSansMono-webfont.ttf)}`;

const cache = path.join(os.homedir(), 'Library/Caches/ms-playwright');
const shellDir = fs.readdirSync(cache).filter((d) => d.startsWith('chromium_headless_shell')).sort().pop();
const exe = path.join(cache, shellDir, fs.readdirSync(path.join(cache, shellDir)).find((d) => d.startsWith('chrome-headless-shell')), 'chrome-headless-shell');

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: exe });
for (const n of names) {
  const svg = mod[n]();
  fs.writeFileSync(path.join(outDir, `${n}.svg`), svg);
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.setContent(`<style>${css}body{margin:0}</style>${svg}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await (await page.$('svg')).screenshot({ path: path.join(outDir, `${n}.png`) });
  await page.close();
  console.log('wrote', path.join(outDir, `${n}.png`));
}
await browser.close();
