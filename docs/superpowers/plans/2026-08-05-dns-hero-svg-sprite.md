# DNS Hero SVG Sprite — Phase 1 Implementation Plan

> **For agentic workers:** Execute task-by-task. Steps use checkbox syntax.

**Goal:** Generate `dns-hero-sprite.svg` with namespaced symbols, stage frames, and #1571 hit-target wrappers — without modifying the seven source SVGs.

**Architecture:** One Node ESM build script reads each step SVG, rewrites colliding ids, wraps known Figma layers with stable hit ids, emits `<symbol>` + `#dns-hero-stage` composition.

**Tech Stack:** Node.js (no new deps), SVG string transform, Astro static assets path.

**Spec:** `docs/superpowers/specs/2026-08-05-dns-hero-svg-sprite-design.md`  
**Issue:** https://github.com/datum-cloud/datum.net/issues/1571

## Global Constraints

- Do not delete or overwrite files in `src/static/assets/features/dns-hero/{dashboard,panel-*}.svg`
- Output only: `src/static/assets/features/dns-hero/dns-hero-sprite.svg`
- Symbol ids: `dns-hero-step-{1..7}`
- Frame ids: `dns-hero-frame-{1..7}`; also `dns-hero-stage`, `dns-hero-chrome`, `dns-hero-cards`
- Internal def ids prefixed `dns-hero-s{N}-`
- Hit wrappers per spec map (`dns-hero-s{N}-hit-*`)
- No HeroAnimation.astro / CSS changes in phase 1
- No commit unless user asks

## File map

| File                                                      | Role                                      |
| --------------------------------------------------------- | ----------------------------------------- |
| `scripts/build-dns-hero-sprite.mjs`                       | Create — merge + namespace + hit wrappers |
| `src/static/assets/features/dns-hero/dns-hero-sprite.svg` | Create — generated output                 |
| Seven existing `*.svg`                                    | Read-only sources                         |

---

### Task 1: Build script + generate sprite

**Files:**

- Create: `scripts/build-dns-hero-sprite.mjs`
- Create: `src/static/assets/features/dns-hero/dns-hero-sprite.svg`

- [x] **Step 1: Add merge script** that:
  1. Loads the seven sources in step order (dashboard → import → finder → preview → selected → created → success)
  2. Extracts inner SVG markup + viewBox
  3. Collects all `id="…"` values; rewrites each id and every `url(#…)`, `href="#…"`, `xlink:href="#…"` to `dns-hero-s{N}-{original}`
  4. Wraps (or aliases) known Figma layers with hit ids from the spec
  5. Emits root SVG with `<defs>` symbols + stage groups

- [x] **Step 2: Run** `node scripts/build-dns-hero-sprite.mjs`

- [x] **Step 3: Verify**
  - Originals unchanged (`git status` / checksums)
  - Sprite contains `dns-hero-step-1`…`7`, `dns-hero-frame-1`…`7`, `dns-hero-stage`, `dns-hero-chrome`, `dns-hero-cards`
  - Hit ids present where source layers exist
  - No bare duplicate `id="clip0_14648_15328"` across the sprite (all prefixed)

- [x] **Step 4: Report gaps** (e.g. missing step-6 spinner layers) in the script stdout

**Done when:** sprite file exists, verification passes, originals intact.
