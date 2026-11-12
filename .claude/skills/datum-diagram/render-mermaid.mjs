// Render the Mermaid "text diagram" versions with the site theme (src/plugins/mermaidBrandTheme.mjs).
//   node .claude/skills/datum-diagram/render-mermaid.mjs <dir-of-.mmd> <out-dir>
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
import { mermaidBrandConfig } from '../../../src/plugins/mermaidBrandTheme.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const [src = path.join(here, 'examples/mermaid'), outDir = 'diagram-out'] = process.argv.slice(2);
const files = fs.readdirSync(src).filter((f) => f.endsWith('.mmd')).sort();
const mermaidJs = fs.readFileSync(path.resolve(here, '../../../node_modules/mermaid/dist/mermaid.min.js'), 'utf8');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fonts = path.resolve(here, '../../../public/fonts/dejavu-sans-mono/DejaVuSansMono-webfont.ttf');
const html = `<!doctype html><meta charset=utf-8><style>@font-face{font-family:'DejaVu Sans Mono';src:url(file://${fonts})}</style><body style="background:#fff;margin:20px;width:1100px">${files
  .map((f) => `<pre class="mermaid" id="${path.basename(f, '.mmd')}">${esc(fs.readFileSync(path.join(src, f), 'utf8'))}</pre>`)
  .join('')}<script>${mermaidJs}</script><script>mermaid.initialize({startOnLoad:false,theme:'base',...${JSON.stringify(mermaidBrandConfig)}});window.done=mermaid.run({querySelector:'pre.mermaid'}).then(()=>'ok').catch(e=>String(e&&e.message||e));</script>`;

const cache = path.join(os.homedir(), 'Library/Caches/ms-playwright');
const shellDir = fs.readdirSync(cache).filter((d) => d.startsWith('chromium_headless_shell')).sort().pop();
const exe = path.join(cache, shellDir, fs.readdirSync(path.join(cache, shellDir)).find((d) => d.startsWith('chrome-headless-shell')), 'chrome-headless-shell');

fs.mkdirSync(outDir, { recursive: true });
const htmlPath = path.resolve(outDir, '_mermaid.html');
fs.writeFileSync(htmlPath, html);
const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1140, height: 900 }, deviceScaleFactor: 2 });
await page.goto('file://' + htmlPath);
console.log('mermaid:', await page.evaluate(() => window.done));
for (const f of files) {
  const id = path.basename(f, '.mmd');
  await (await page.$('#' + id)).screenshot({ path: path.join(outDir, `${id}-mermaid.png`) });
}
await browser.close();
