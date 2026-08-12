# Unused Code Audit (Manual Review)

Generated: 2026-08-12

Static heuristic scan of **datum.net** for unused CSS classes and unused JS/TS (modules, exports, Astro components, client scripts).

**Do not delete from these lists blindly.** Confirm with `rg` / typecheck / page smoke tests.

## Reports

| Report      | Path                                         | Focus                                                                 |
| ----------- | -------------------------------------------- | --------------------------------------------------------------------- |
| CSS classes | [UNUSED_CSS_AUDIT.md](./UNUSED_CSS_AUDIT.md) | Custom selectors in `src/static/styles/` with no markup/TS hit        |
| JS / TS     | [UNUSED_JS_AUDIT.md](./UNUSED_JS_AUDIT.md)   | Modules, Astro components, named exports, inline `<script>` inventory |

## Snapshot

| Area                               | Candidates |
| ---------------------------------- | ---------: |
| Unused CSS classes                 |        128 |
| Likely-dynamic CSS (probably keep) |         20 |
| Orphan CSS files                   |          0 |
| Unused modules                     |          0 |
| Unused Astro components            |          0 |
| Unused value exports               |         28 |
| Unused type/interface exports      |         41 |

## How this was produced

Scanner: `scripts/audit/scan-unused.mjs`

```bash
node scripts/audit/scan-unused.mjs
```

## Suggested review order

1. **CSS skeletons / old variants** in [UNUSED_CSS_AUDIT.md](./UNUSED_CSS_AUDIT.md) (blog/events skeletons, unused button variants) — highest chance of real dead CSS.
2. **Value exports** in [UNUSED_JS_AUDIT.md](./UNUSED_JS_AUDIT.md) (`getUnique*`, `clearSession`, `stripTags`, etc.) — run `rg` then `npm run typecheck` after removals.
3. **Type exports** last — many are intentional public types / inference-only.
4. Skip or keep items under **Likely dynamic classes** unless you remove the corresponding template literal builders.
5. Client scripts under `src/static/scripts/` are all wired (Layouts / 404); use the inline `<script>` inventory only as a map of JS surfaces.

## Limits

- Does not execute the site or analyze the built CSS bundle / Tailwind purge.
- Misses Alpine/`class:list` concatenation that never contains a full literal class name.
- Import detection can miss string-built dynamic `import()`.
- Astro framework convention files (e.g. `src/actions/index.ts`) are excluded when known.
