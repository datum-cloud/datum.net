#!/usr/bin/env node
/**
 * Static audit: unused CSS classes + unused JS/TS modules / exports / Astro components.
 * Heuristic — false positives expected. Output: docs/UNUSED_*.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SRC = path.join(ROOT, 'src');

const IGNORE_DIRS = new Set([
  'node_modules', 'dist', '.git', '.astro', '.cache',
  'playwright-report', 'test-results', '.persistent',
]);

const TEXT_EXT = new Set([
  '.astro', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.jsx',
  '.md', '.mdx', '.html', '.css', '.scss', '.json',
]);

function walk(dir, filterExt) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try { entries = fs.readdirSync(cur, { withFileTypes: true }); } catch { continue; }
    for (const ent of entries) {
      if (IGNORE_DIRS.has(ent.name)) continue;
      const full = path.join(cur, ent.name);
      if (ent.isDirectory()) stack.push(full);
      else if (!filterExt || filterExt.has(path.extname(ent.name))) out.push(full);
    }
  }
  return out;
}

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function loadCorpus() {
  const corpus = new Map();
  for (const root of [SRC, path.join(ROOT, 'public'), path.join(ROOT, 'scripts'), path.join(ROOT, 'tests')]) {
    for (const file of walk(root, TEXT_EXT)) {
      try { corpus.set(file, read(file)); } catch { /* */ }
    }
  }
  for (const f of ['server.mjs', 'astro.config.mjs', 'playwright.config.ts', 'eslint.config.mjs', 'package.json']) {
    const full = path.join(ROOT, f);
    if (fs.existsSync(full)) corpus.set(full, read(full));
  }
  return corpus;
}

/** Extract class names that appear as CSS selectors (not @apply utilities). */
function extractCssClasses(css) {
  const cleaned = stripCssComments(css);
  // Remove @apply contents so utilities aren't treated as definitions
  const noApply = cleaned.replace(/@apply[\s\S]*?;/g, ';');
  const map = new Map(); // name -> lines[]
  const lines = noApply.split('\n');
  const re = /(^|[{},;\s>+~])\.([a-zA-Z_][a-zA-Z0-9_-]*)/g;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // skip pure property lines roughly
    if (/^\s*(--|@apply|@import|@layer|@theme|@media|@keyframes|font-|color:|background|margin|padding|width|height|display|content:)/.test(line) && !line.includes('{') && !/^\s*\./.test(line)) {
      continue;
    }
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(line)) !== null) {
      const name = m[2];
      if (name.length < 2) continue;
      if (!map.has(name)) map.set(name, []);
      if (!map.get(name).includes(i + 1)) map.get(name).push(i + 1);
    }
  }
  return map;
}

const TAILWIND_EXACT = new Set([
  'container', 'flex', 'grid', 'hidden', 'block', 'inline', 'absolute',
  'relative', 'fixed', 'sticky', 'static', 'sr-only', 'not-sr-only',
]);

function looksLikeCustomClass(name) {
  if (TAILWIND_EXACT.has(name)) return false;
  if (/^(sm|md|lg|xl|2xl|hover|focus|active|disabled|group|peer):/.test(name)) return false;
  return true;
}

/** Find dynamic class construction patterns in non-CSS sources */
function findDynamicPrefixes(corpus) {
  const prefixes = new Set();
  // `foo--${`, 'foo--' + , "foo--" +
  // Prefer BEM modifier prefixes ending in `--` (avoids greedy `changelog-` matches).
  const patterns = [
    /(?:[`'"\s])([a-zA-Z_][a-zA-Z0-9_-]*--)\$\{/g,
    /(?:[`'"\s])([a-zA-Z_][a-zA-Z0-9_-]*--)['"]\s*\+/g,
  ];
  for (const [file, content] of corpus) {
    if (file.includes(`${path.sep}static${path.sep}styles${path.sep}`)) continue;
    for (const re of patterns) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(content)) !== null) {
        prefixes.add(m[1]);
      }
    }
  }
  return prefixes;
}

function classMatchesDynamic(name, prefixes) {
  for (const p of prefixes) {
    if (name.startsWith(p)) return p;
  }
  return null;
}

function countNonCssUsages(corpus, className, defineFile) {
  const token = new RegExp(`(?:^|[^a-zA-Z0-9_-])${escapeRe(className)}(?:[^a-zA-Z0-9_-]|$)`);
  const hits = [];
  for (const [file, content] of corpus) {
    if (file === defineFile) continue;
    if (file.includes(`${path.sep}static${path.sep}styles${path.sep}`)) continue;
    if (token.test(content)) hits.push(rel(file));
  }
  return hits;
}

function analyzeCss(corpus) {
  const cssFiles = walk(path.join(SRC, 'static', 'styles'), new Set(['.css']));
  const dynamicPrefixes = findDynamicPrefixes(corpus);

  const unused = [];
  const dynamicLikely = [];
  const orphanCssFiles = [];
  let classCount = 0;
  let usedCount = 0;

  for (const file of cssFiles) {
    const base = path.basename(file);
    const content = read(file);
    const isEntry = [
      'global.css', 'base.css', 'theme.css', 'variables.css', 'fonts.css',
      'utilities.css', 'components.css', 'color-theme.css',
      'variables-breakpoints.css', 'fonts-dejavu.css',
    ].includes(base);

    let imported = isEntry;
    if (!imported) {
      for (const [, c] of corpus) {
        if (c.includes(base) || c.includes(`styles/${base}`)) { imported = true; break; }
      }
    }
    if (!imported) {
      orphanCssFiles.push({ file: rel(file), reason: 'No import/reference found' });
    }

    const classes = extractCssClasses(content);
    for (const [name, lines] of classes) {
      if (!looksLikeCustomClass(name)) continue;
      classCount++;
      const dyn = classMatchesDynamic(name, dynamicPrefixes);
      const hits = countNonCssUsages(corpus, name, file);
      const entry = {
        className: name,
        definedIn: rel(file),
        lines: lines.slice(0, 8),
        sampleUsages: hits.slice(0, 5),
        dynamicPrefix: dyn,
      };
      if (hits.length === 0) {
        if (dyn) dynamicLikely.push(entry);
        else unused.push(entry);
      } else {
        usedCount++;
      }
    }
  }

  const dedupe = (arr) => {
    const seen = new Set();
    return arr.filter((x) => {
      const k = `${x.className}|${x.definedIn}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  return {
    cssFileCount: cssFiles.length,
    classCount,
    usedCount,
    unusedClasses: dedupe(unused).sort((a, b) => a.definedIn.localeCompare(b.definedIn) || a.className.localeCompare(b.className)),
    dynamicLikely: dedupe(dynamicLikely).sort((a, b) => a.className.localeCompare(b.className)),
    orphanCssFiles,
    dynamicPrefixes: [...dynamicPrefixes].sort(),
  };
}

/**
 * Resolve whether moduleA is imported by looking for import/from path fragments.
 */
function modulePathAliases(modulePath) {
  const r = rel(modulePath);
  const noExt = r.replace(/\.(ts|js|mjs|astro)$/, '');
  const base = path.basename(noExt);
  const aliases = new Set([
    noExt,
    `${noExt}.ts`,
    `${noExt}.js`,
    `${noExt}.mjs`,
    `${noExt}.astro`,
    `@/${noExt}`,
    `@/src/${noExt.replace(/^src\//, '')}`,
  ]);
  // Directory barrels: src/foo/index.ts is imported as src/foo or @components/foo
  if (/\/index$/.test(noExt)) {
    const dir = noExt.replace(/\/index$/, '');
    aliases.add(dir);
    aliases.add(`@/${dir}`);
    aliases.add(`@/src/${dir.replace(/^src\//, '')}`);
  }

  const replacements = [
    [/^src\/utils\//, '@utils/'],
    [/^src\/libs\//, '@libs/'],
    [/^src\/types\//, '@types/'],
    [/^src\/components\//, '@components/'],
    [/^src\/layouts\//, '@layouts/'],
    [/^src\/data\//, '@data/'],
    [/^src\/actions\//, '@actions/'],
    [/^src\/v1\//, '@v1/'],
    [/^src\/content\//, '@content/'],
    [/^src\/static\//, '@/src/static/'],
    [/^src\/plugins\//, '../plugins/'],
  ];
  for (const [re, prefix] of replacements) {
    if (re.test(noExt)) {
      const rest = noExt.replace(re, '');
      aliases.add(prefix + rest);
      aliases.add(prefix + rest + '.ts');
      aliases.add(prefix + rest + '.js');
      aliases.add(prefix + rest + '.astro');
      aliases.add(prefix + rest + '.mjs');
      if (rest.endsWith('/index') || rest === 'index') {
        const dirRest = rest.replace(/\/?index$/, '');
        aliases.add(prefix + dirRest);
      }
    }
  }

  // relative basename forms commonly used
  aliases.add(`./${base}`);
  aliases.add(`./${base}.ts`);
  aliases.add(`./${base}.js`);
  aliases.add(`./${base}.astro`);
  aliases.add(`../${base}`);
  aliases.add(`../${base}.astro`);
  aliases.add(`/${base}.astro`);
  aliases.add(`${base}.astro`);

  // Nested relative imports: ./drivers/redis from sibling folders
  const parts = noExt.split('/');
  for (let i = 1; i < parts.length; i++) {
    const suffix = parts.slice(i).join('/');
    aliases.add(suffix);
    aliases.add(`./${suffix}`);
    aliases.add(`../${suffix}`);
  }

  return { aliases: [...aliases], base, noExt, r };
}

function findImportRefs(modulePath, corpus) {
  const { aliases } = modulePathAliases(modulePath);
  const refs = [];
  for (const [file, content] of corpus) {
    if (file === modulePath) continue;
    // Prefer import/from/export-from / dynamic import
    for (const a of aliases) {
      if (a.length < 3) continue;
      if (!content.includes(a)) continue;
      // Require it appears in an import-like context OR as component tag for .astro
      const escaped = escapeRe(a);
      const importCtx = new RegExp(
        `(?:import|export)\\s+[\\s\\S]{0,120}?from\\s*['"][^'"]*${escaped}['"]|import\\s*\\(\\s*['"][^'"]*${escaped}['"]|import\\s+['"][^'"]*${escaped}['"]`
      );
      if (importCtx.test(content)) {
        refs.push(rel(file));
        break;
      }
      // Astro/MDX component usage by import name (basename)
      if (modulePath.endsWith('.astro')) {
        const base = path.basename(modulePath, '.astro');
        if (
          new RegExp(`import\\s+\\{?[^;]*\\b${escapeRe(base)}\\b`).test(content) ||
          new RegExp(`<${escapeRe(base)}[\\s/>]`).test(content)
        ) {
          refs.push(rel(file));
          break;
        }
      }
    }
  }
  return [...new Set(refs)];
}

function analyzeJs(corpus) {
  const moduleCandidates = walk(SRC, new Set(['.ts', '.js', '.mjs'])).filter((f) => {
    const r = rel(f);
    if (r.startsWith('src/pages/')) return false;
    if (r.endsWith('.d.ts')) return false;
    if (r === 'src/middleware.ts' || r === 'src/content.config.ts' || r === 'src/entrypoint.ts') return false;
    return true;
  });
  const staticScripts = walk(path.join(SRC, 'static', 'scripts'), new Set(['.js']));
  const astroComponents = walk(path.join(SRC, 'components'), new Set(['.astro']));

  const FRAMEWORK_ENTRIES = new Set([
    'src/actions/index.ts', // Astro actions entry (convention)
  ]);
  const STUB_NOTES = new Map([
    ['src/libs/strapi/drivers/redis.ts', 'Likely stub / future Redis driver — confirm before delete'],
    ['src/libs/strapi/drivers/resilient.ts', 'May be wired only from runtime factory — confirm'],
  ]);

  const unusedModules = [];
  for (const mod of [...moduleCandidates, ...staticScripts]) {
    const r = rel(mod);
    if (FRAMEWORK_ENTRIES.has(r)) continue;
    const refs = findImportRefs(mod, corpus);
    if (refs.length === 0) {
      unusedModules.push({
        file: r,
        referenceCount: 0,
        sampleRefs: [],
        note: STUB_NOTES.get(r) || '',
      });
    }
  }

  const unusedAstro = [];
  const maybeAstro = [];
  for (const comp of astroComponents) {
    const refs = findImportRefs(comp, corpus);
    // Also: barrel re-export in same folder index.ts
    const dir = path.dirname(comp);
    const indexFile = ['.ts', '.js'].map((e) => path.join(dir, `index${e}`)).find((p) => fs.existsSync(p));
    let barrelRefs = [];
    if (indexFile) {
      const idx = read(indexFile);
      const base = path.basename(comp, '.astro');
      if (idx.includes(`./${base}`) || idx.includes(`'./${base}.astro'`) || idx.includes(`"./${base}.astro"`)) {
        barrelRefs = findImportRefs(indexFile, corpus);
      }
    }
    if (refs.length === 0 && barrelRefs.length === 0) {
      unusedAstro.push({ file: rel(comp), referenceCount: 0, sampleRefs: [] });
    } else if (refs.length === 0 && barrelRefs.length > 0) {
      maybeAstro.push({
        file: rel(comp),
        note: `Only via barrel ${rel(indexFile)}`,
        sampleRefs: barrelRefs.slice(0, 5),
      });
    }
  }

  // Named exports — split type vs value
  const unusedValueExports = [];
  const unusedTypeExports = [];
  for (const mod of moduleCandidates) {
    const content = corpus.get(mod) || read(mod);
    const valueNames = new Set();
    const typeNames = new Set();

    let m;
    const valRe = /export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)|export\s+const\s+([A-Za-z0-9_]+)|export\s+class\s+([A-Za-z0-9_]+)|export\s+enum\s+([A-Za-z0-9_]+)/g;
    while ((m = valRe.exec(content)) !== null) {
      valueNames.add(m[1] || m[2] || m[3] || m[4]);
    }
    const typeRe = /export\s+type\s+([A-Za-z0-9_]+)|export\s+interface\s+([A-Za-z0-9_]+)/g;
    while ((m = typeRe.exec(content)) !== null) {
      typeNames.add(m[1] || m[2]);
    }
    // export { X } — treat as value unless type-only export { type X }
    const braceRe = /export\s+\{([^}]+)\}/g;
    while ((m = braceRe.exec(content)) !== null) {
      for (const part of m[1].split(',')) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const isType = /^type\s+/.test(trimmed);
        const id = trimmed.replace(/^type\s+/, '').split(/\s+as\s+/).pop()?.trim();
        if (id && /^[A-Za-z_][A-Za-z0-9_]*$/.test(id)) {
          (isType ? typeNames : valueNames).add(id);
        }
      }
    }

    for (const name of valueNames) {
      let found = 0;
      const sample = [];
      const re = new RegExp(`\\b${escapeRe(name)}\\b`);
      for (const [file, c] of corpus) {
        if (file === mod) continue;
        if (re.test(c)) {
          found++;
          if (sample.length < 4) sample.push(rel(file));
        }
      }
      if (found === 0) {
        unusedValueExports.push({ name, file: rel(mod), sample });
      }
    }
    for (const name of typeNames) {
      let found = 0;
      const sample = [];
      const re = new RegExp(`\\b${escapeRe(name)}\\b`);
      for (const [file, c] of corpus) {
        if (file === mod) continue;
        if (re.test(c)) {
          found++;
          if (sample.length < 4) sample.push(rel(file));
        }
      }
      if (found === 0) {
        unusedTypeExports.push({ name, file: rel(mod), sample });
      }
    }
  }

  // Root scripts
  const pkg = read(path.join(ROOT, 'package.json'));
  const unusedRootScripts = [];
  for (const s of walk(path.join(ROOT, 'scripts'), new Set(['.ts', '.js', '.mjs']))) {
    if (rel(s).startsWith('scripts/audit/')) continue;
    const base = path.basename(s);
    let mentioned = pkg.includes(base);
    if (!mentioned) {
      for (const [, c] of corpus) {
        if (c.includes(base)) { mentioned = true; break; }
      }
    }
    // docs
    if (!mentioned) {
      for (const d of walk(path.join(ROOT, 'docs'), new Set(['.md']))) {
        if (read(d).includes(base)) { mentioned = true; break; }
      }
    }
    if (!mentioned) unusedRootScripts.push({ file: rel(s), note: 'Not referenced in package.json or codebase' });
  }

  // Inline <script> blocks in Astro — list files with client JS for manual review
  const inlineScriptFiles = [];
  for (const [file, content] of corpus) {
    if (!file.endsWith('.astro')) continue;
    if (/<script[\s>]/.test(content)) {
      const count = (content.match(/<script[\s>]/g) || []).length;
      inlineScriptFiles.push({ file: rel(file), scriptTags: count });
    }
  }

  return {
    moduleCandidateCount: moduleCandidates.length + staticScripts.length,
    astroComponentCount: astroComponents.length,
    unusedModules: unusedModules.sort((a, b) => a.file.localeCompare(b.file)),
    unusedAstro: unusedAstro.sort((a, b) => a.file.localeCompare(b.file)),
    barrelOnlyAstro: maybeAstro.sort((a, b) => a.file.localeCompare(b.file)),
    unusedValueExports: unusedValueExports.sort((a, b) => a.file.localeCompare(b.file) || a.name.localeCompare(b.name)),
    unusedTypeExports: unusedTypeExports.sort((a, b) => a.file.localeCompare(b.file) || a.name.localeCompare(b.name)),
    unusedRootScripts,
    inlineScriptFiles: inlineScriptFiles.sort((a, b) => a.file.localeCompare(b.file)),
  };
}

function mdEsc(s) { return String(s).replace(/\|/g, '\\|'); }

function writeCssReport(css) {
  const out = [];
  out.push('# Unused CSS Classes Audit');
  out.push('');
  out.push(`Generated: ${new Date().toISOString()}`);
  out.push('');
  out.push('## How to read this');
  out.push('');
  out.push('Static heuristic scan of `src/static/styles/**/*.css`. **Review before deleting.**');
  out.push('');
  out.push('- A class is “unused” if its name never appears outside CSS (Astro/TS/JS/MD/MDX/HTML).');
  out.push('- Dynamically built classes (`compute-meter-fill--${tone}`) are listed separately.');
  out.push('- Animation-step / CSS-orchestrated modifiers may still be live even if unused in markup.');
  out.push('- False positives: Alpine `x-bind:class`, server-injected HTML, content not in repo.');
  out.push('');
  out.push('## Summary');
  out.push('');
  out.push('| Metric | Count |');
  out.push('| --- | ---: |');
  out.push(`| CSS files scanned | ${css.cssFileCount} |`);
  out.push(`| Custom class selectors | ${css.classCount} |`);
  out.push(`| With non-CSS usage | ${css.usedCount} |`);
  out.push(`| **Candidate unused** | **${css.unusedClasses.length}** |`);
  out.push(`| Likely dynamic (keep) | ${css.dynamicLikely.length} |`);
  out.push(`| Orphan CSS files | ${css.orphanCssFiles.length} |`);
  out.push('');

  out.push('## Detected dynamic class prefixes');
  out.push('');
  out.push('Found template/string patterns like `` `prefix${...}` `` in non-CSS sources:');
  out.push('');
  if (!css.dynamicPrefixes.length) out.push('_None._');
  else for (const p of css.dynamicPrefixes) out.push(`- \`${p}\``);
  out.push('');

  out.push('## Possibly orphan CSS files');
  out.push('');
  if (!css.orphanCssFiles.length) out.push('_None detected._');
  else {
    out.push('| File | Reason | Review |');
    out.push('| --- | --- | --- |');
    for (const f of css.orphanCssFiles) out.push(`| \`${mdEsc(f.file)}\` | ${mdEsc(f.reason)} | [ ] |`);
  }
  out.push('');

  out.push('## Likely dynamic classes (probably keep)');
  out.push('');
  out.push('No literal usage, but matches a dynamic prefix — usually still live.');
  out.push('');
  out.push('| Class | Defined in | Dynamic prefix | Review |');
  out.push('| --- | --- | --- | --- |');
  for (const c of css.dynamicLikely) {
    out.push(`| \`.${mdEsc(c.className)}\` | \`${mdEsc(c.definedIn)}\` | \`${mdEsc(c.dynamicPrefix)}\` | [ ] |`);
  }
  out.push('');

  // Group unused by file for easier review
  out.push('## Candidate unused classes (by file)');
  out.push('');
  let current = '';
  for (const c of css.unusedClasses) {
    if (c.definedIn !== current) {
      current = c.definedIn;
      out.push(`### \`${current}\``);
      out.push('');
      out.push('| Class | Lines | Review | Notes |');
      out.push('| --- | --- | --- | --- |');
    }
    out.push(`| \`.${mdEsc(c.className)}\` | ${c.lines.join(', ')} | [ ] | |`);
  }
  out.push('');
  out.push('## Review checklist');
  out.push('');
  out.push('- [ ] `rg` the class name across `src/`');
  out.push('- [ ] Check Alpine / `class:list` / string concatenation');
  out.push('- [ ] Confirm parent CSS file is imported on live pages');
  out.push('- [ ] Remove CSS + dead markup together');
  out.push('');

  const dest = path.join(ROOT, 'docs', 'UNUSED_CSS_AUDIT.md');
  fs.writeFileSync(dest, out.join('\n'));
  return dest;
}

function writeJsReport(js) {
  const out = [];
  out.push('# Unused JavaScript / TypeScript Audit');
  out.push('');
  out.push(`Generated: ${new Date().toISOString()}`);
  out.push('');
  out.push('## How to read this');
  out.push('');
  out.push('Static import/reference scan. **Review before deleting.**');
  out.push('');
  out.push('- Modules/components need an `import` / `from` / `import()` path hit (or Astro/MDX tag usage).');
  out.push('- Pages under `src/pages` are routes and excluded from unused-module checks.');
  out.push('- Type-only exports often look unused when only inferred — verify with `rg`.');
  out.push('- Barrel-only Astro components (`@components/content`) are listed separately.');
  out.push('');
  out.push('## Summary');
  out.push('');
  out.push('| Metric | Count |');
  out.push('| --- | ---: |');
  out.push(`| Module candidates | ${js.moduleCandidateCount} |`);
  out.push(`| Astro components | ${js.astroComponentCount} |`);
  out.push(`| **Unused modules/scripts** | **${js.unusedModules.length}** |`);
  out.push(`| **Unused Astro components** | **${js.unusedAstro.length}** |`);
  out.push(`| Barrel-only Astro | ${js.barrelOnlyAstro.length} |`);
  out.push(`| Unused value exports | ${js.unusedValueExports.length} |`);
  out.push(`| Unused type/interface exports | ${js.unusedTypeExports.length} |`);
  out.push(`| Unreferenced root scripts | ${js.unusedRootScripts.length} |`);
  out.push(`| Astro files with \`<script>\` | ${js.inlineScriptFiles.length} |`);
  out.push('');

  out.push('## Candidate unused modules / client scripts');
  out.push('');
  if (!js.unusedModules.length) out.push('_None detected._');
  else {
    out.push('| File | Review | Notes |');
    out.push('| --- | --- | --- |');
    for (const m of js.unusedModules) out.push(`| \`${mdEsc(m.file)}\` | [ ] | ${mdEsc(m.note || '')} |`);
  }
  out.push('');

  out.push('## Candidate unused Astro components');
  out.push('');
  if (!js.unusedAstro.length) out.push('_None detected._');
  else {
    out.push('| File | Review | Notes |');
    out.push('| --- | --- | --- |');
    for (const m of js.unusedAstro) out.push(`| \`${mdEsc(m.file)}\` | [ ] | |`);
  }
  out.push('');

  out.push('## Barrel-only Astro components');
  out.push('');
  out.push('Imported via folder `index` barrel (likely used from MDX). Confirm before removing.');
  out.push('');
  if (!js.barrelOnlyAstro.length) out.push('_None._');
  else {
    out.push('| File | Via | Sample refs | Review |');
    out.push('| --- | --- | --- | --- |');
    for (const m of js.barrelOnlyAstro) {
      out.push(`| \`${mdEsc(m.file)}\` | ${mdEsc(m.note)} | ${m.sampleRefs.map((x) => `\`${x}\``).join(', ')} | [ ] |`);
    }
  }
  out.push('');

  out.push('## Candidate unused value exports (functions/const/class)');
  out.push('');
  out.push('| Export | File | Review |');
  out.push('| --- | --- | --- |');
  for (const e of js.unusedValueExports) {
    out.push(`| \`${mdEsc(e.name)}\` | \`${mdEsc(e.file)}\` | [ ] |`);
  }
  out.push('');

  out.push('## Candidate unused type / interface exports');
  out.push('');
  out.push('Higher false-positive rate — types may only be used via inference or `import type` in ways the scanner missed.');
  out.push('');
  out.push('| Export | File | Review |');
  out.push('| --- | --- | --- |');
  for (const e of js.unusedTypeExports) {
    out.push(`| \`${mdEsc(e.name)}\` | \`${mdEsc(e.file)}\` | [ ] |`);
  }
  out.push('');

  out.push('## Root `scripts/` not referenced');
  out.push('');
  if (!js.unusedRootScripts.length) out.push('_None detected._');
  else {
    out.push('| File | Note | Review |');
    out.push('| --- | --- | --- |');
    for (const s of js.unusedRootScripts) out.push(`| \`${mdEsc(s.file)}\` | ${mdEsc(s.note)} | [ ] |`);
  }
  out.push('');

  out.push('## Client scripts (known wiring)');
  out.push('');
  out.push('| Script | Expected entry | Review |');
  out.push('| --- | --- | --- |');
  out.push('| `src/static/scripts/scroll-effects.js` | Layout / LayoutMinimal / LayoutSimple | [ ] |');
  out.push('| `src/static/scripts/module-animate.js` | Layout.astro | [ ] |');
  out.push('| `src/static/scripts/error-tracker.js` | 404.astro | [ ] |');
  out.push('');

  out.push('## Astro files containing `<script>` (manual review of inline JS)');
  out.push('');
  out.push('Not “unused” — inventory of client/inline JS surfaces.');
  out.push('');
  out.push('| File | `<script>` tags | Review |');
  out.push('| --- | ---: | --- |');
  for (const f of js.inlineScriptFiles) {
    out.push(`| \`${mdEsc(f.file)}\` | ${f.scriptTags} | [ ] |`);
  }
  out.push('');

  out.push('## Review checklist');
  out.push('');
  out.push('- [ ] Confirm no dynamic `import()` / string path');
  out.push('- [ ] Check `server.mjs` and API routes');
  out.push('- [ ] For Astro, search MDX content + relative `./X.astro` imports');
  out.push('- [ ] For types, try removing and run `npm run typecheck`');
  out.push('');

  const dest = path.join(ROOT, 'docs', 'UNUSED_JS_AUDIT.md');
  fs.writeFileSync(dest, out.join('\n'));
  return dest;
}

console.log('Loading corpus...');
const corpus = loadCorpus();
console.log(`Corpus files: ${corpus.size}`);
console.log('Analyzing CSS...');
const css = analyzeCss(corpus);
console.log('Analyzing JS/TS...');
const js = analyzeJs(corpus);
const cssPath = writeCssReport(css);
const jsPath = writeJsReport(js);
console.log('Wrote', cssPath);
console.log('Wrote', jsPath);
console.log(JSON.stringify({
  unusedCss: css.unusedClasses.length,
  dynamicCss: css.dynamicLikely.length,
  orphanCss: css.orphanCssFiles.length,
  unusedModules: js.unusedModules.length,
  unusedAstro: js.unusedAstro.length,
  barrelAstro: js.barrelOnlyAstro.length,
  unusedValues: js.unusedValueExports.length,
  unusedTypes: js.unusedTypeExports.length,
  inlineScripts: js.inlineScriptFiles.length,
}, null, 2));
