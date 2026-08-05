# DNS Hero SVG Sprite Design

**Date:** 2026-08-05  
**Status:** Phase 1–3 implemented (asset + wire + micro-anims)  
**Product source of truth:** [datum-cloud/datum.net#1571](https://github.com/datum-cloud/datum.net/issues/1571)  
**Figma:** [static frames 15907:15701](https://www.figma.com/design/bBEQ8YeTP4SngNl5EkkQdH/Datum---Master-Design-File?node-id=15907-15701), motion reference [15927:35069](https://www.figma.com/design/bBEQ8YeTP4SngNl5EkkQdH/Datum---Master-Design-File?node-id=15927-35069) / timeline node `15930:4131`  
**Motion reference:** [Miter HCM section](https://www.miter.com/#hcm)

## Goal

Merge the seven per-step DNS hero SVGs into one sprite with stable identifiers so we can implement the full #1571 storytelling loop (not just cross-fades):

- **B** — CSS/JS animation: static chrome, sliding cards (~80px), micro-interactions
- **C** — `<symbol>` / `<use href="#…">` reuse per step / sub-layer

Original step files stay untouched.

## Issue #1571 requirements (must track)

| Requirement                                                                                               | Implication for sprite / later wiring                                                                  |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| ~25–27s loop; each step holds ≥3s                                                                         | Keep `--dns-hero-loop` ≈ 28s; do not compress to ~8s                                                   |
| Transitions travel ~80px V/H + smooth easing                                                              | Animate **cards/panels**, not the whole stage; use `cqh` travel like current CSS (`21.74cqh` ≈ 80/368) |
| Background/frame chrome stays **static**                                                                  | Stage must separate `dns-hero-chrome` (dashboard shell) from `dns-hero-card-*` overlays                |
| Step 1: click Import/Export (shrink → grow) → step 2                                                      | Stable hit target id on that control                                                                   |
| Step 2: click “Select a file” → step 3                                                                    | Stable hit target id on that link/control                                                              |
| Step 3: file unselected → select → Open → step 4                                                          | Preserve file-row + Open button layers                                                                 |
| Steps 4→5: header checkbox, then staggered row ticks, then “import 7 records”                             | Separate checkbox / check-icon layers (not a blank→populate table wipe)                                |
| Step 6: all rows start spinner → cascade to Created → Done appears → click                                | Need spinner + Created state layers per row (or pair symbols); Done target id                          |
| Step 7: success message lingers → fades → loop to step 1                                                  | Frame/symbol for success toast; fade only this layer                                                   |
| Buttons/links shrink slightly before next step                                                            | All click targets must be addressable groups                                                           |
| Avoid Figma-AI pitfalls (dark fade between steps; blank-then-fill rows; missing working state; flat feel) | No full-stage dark scrim; checkbox state change only; keep spinner→Created                             |

**Current PNG stack** (`HeroAnimation.astro` + composited frames) is a timing/travel approximation. It does **not** yet meet chrome-static or micro-interaction bullets. The sprite is the asset path that can.

## Sources (keep)

| File                 | Step | ViewBox       | Role vs #1571                                         |
| -------------------- | ---- | ------------- | ----------------------------------------------------- |
| `dashboard.svg`      | 1    | `0 0 598 368` | Chrome + step-1 UI (Import/Export)                    |
| `panel-import.svg`   | 2    | `0 0 251 253` | Foreground card                                       |
| `panel-finder.svg`   | 3    | `0 0 520 302` | System file dialog card                               |
| `panel-preview.svg`  | 4    | `0 0 460 323` | Preview (unchecked)                                   |
| `panel-selected.svg` | 5    | `0 0 460 323` | Preview (checked) — prefer tick layers over wipe-only |
| `panel-created.svg`  | 6    | `0 0 460 323` | Created rows (+ Done)                                 |
| `panel-success.svg`  | 7    | `0 0 251 156` | Success toast                                         |

Path: `src/static/assets/features/dns-hero/`

Useful Figma layer names already present (normalize when merging):

- Step 1/2: `import/export`, `Import DNS Records`, `Select a file or drag it here…`
- Steps 4/5: `Checkbox_*`, `Icon / Check_*`
- Step 6: `Created_*`, `circle-check_*`
- Step 7: `Imported 7 DNS records`

## Output

**New file:** `src/static/assets/features/dns-hero/dns-hero-sprite.svg`

Do **not** delete or overwrite any of the seven source SVGs.

### Structure

```xml
<svg xmlns="http://www.w3.org/2000/svg"
     width="598" height="368"
     viewBox="0 0 598 368"
     fill="none"
     role="img"
     aria-label="DNS hero animation sprite">
  <defs>
    <!-- Full step symbols (C + fallback B) -->
    <symbol id="dns-hero-step-1" viewBox="0 0 598 368">…</symbol>
    <!-- dns-hero-step-2 … dns-hero-step-7 with each source viewBox -->

    <!-- Optional later: chrome-only / spinner-row symbols if exports allow -->
  </defs>

  <g id="dns-hero-stage">
    <!-- Phase 2+: chrome stays visible; cards slide over it -->
    <g id="dns-hero-chrome">
      <use href="#dns-hero-step-1" … />
    </g>
    <g id="dns-hero-cards">
      <use href="#dns-hero-step-2" id="dns-hero-frame-2" … />
      <!-- frames 3–7 -->
    </g>
  </g>
</svg>
```

Phase 1 may still emit stacked full-step `<use>` frames for a smoke-testable file; the **id contract** below is what later animation must rely on.

### Identifiers

| Purpose                 | ID pattern                      |
| ----------------------- | ------------------------------- |
| Symbol (C)              | `dns-hero-step-{1..7}`          |
| Stage root (B)          | `dns-hero-stage`                |
| Static chrome           | `dns-hero-chrome`               |
| Card stack              | `dns-hero-cards`                |
| Frame for CSS (B)       | `dns-hero-frame-{1..7}`         |
| Click / cascade targets | `dns-hero-s{N}-hit-*` (see map) |

### Interaction target map (#1571 → stable ids)

Normalize Figma names → kebab-case, prefixed. At minimum expose:

| Step | Hit / state layers                    | Target id (examples)                                                                  |
| ---- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| 1    | Import/Export control                 | `dns-hero-s1-hit-import-export`                                                       |
| 2    | Select a file                         | `dns-hero-s2-hit-select-file`                                                         |
| 3    | File row + Open                       | `dns-hero-s3-hit-file`, `dns-hero-s3-hit-open`                                        |
| 4→5  | Header checkbox, rows 1–7, import CTA | `dns-hero-s4-hit-check-all`, `dns-hero-s4-hit-check-{1..7}`, `dns-hero-s4-hit-import` |
| 5    | Check icons (visible state)           | `dns-hero-s5-check-{1..7}`                                                            |
| 6    | Per-row spinner → Created, Done       | `dns-hero-s6-status-{1..7}`, `dns-hero-s6-created-{1..7}`, `dns-hero-s6-hit-done`     |
| 7    | Success message                       | `dns-hero-s7-toast`                                                                   |

If a source SVG lacks a clean spinner layer for step 6, document the gap in the merge script output and keep `Created_*` addressable so phase 2 can add a small spinner symbol.

### ID namespacing

1. Prefix every internal `id` and matching `url(#…)` / `href="#…"` with `dns-hero-s{N}-`
2. Additionally alias known interaction groups to the **hit map** ids above (via wrapping `<g id="…">` — do not rely on raw Figma ids with spaces/slashes for CSS)
3. Preserve each symbol’s original `viewBox`
4. Strip redundant outer Figma wrappers only when safe

### Stage layout

- Stage viewBox = `0 0 598 368` (matches current hero aspect + Figma stage height used for 80px → `21.74cqh`)
- Cards keep native viewBoxes; phase 2 positions them with `transform` / `x`/`y` to match Figma overlays (dimmed chrome stays from step 1, cards travel ±80px)
- Phase 1: symbols + namespaced ids + hit wrappers; positioning can be approximate

## Phased delivery

| Phase    | Deliverable                                                               | #1571 coverage                                                |
| -------- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **1** ✅ | `dns-hero-sprite.svg` + originals kept                                    | Asset + id contract for B/C                                   |
| **2** ✅ | Inline sprite in `HeroAnimation.astro`; static chrome + card travel + 28s | Chrome static, ~80px travel, holds, easing; PNGs unused       |
| **3** ✅ | Click scale, checkbox cascade, Created cascade, Done appear               | Micro-interactions (spinner layers still missing from export) |

## Remaining polish

- Step 6 spinner working-state (not in Figma static export)
- Finer panel positioning vs Figma composites
- Visual QA against Miter reference / Ollie feedback
- Delete unused PNG frames when signed off

## Risks

| Risk                                   | Mitigation                                                 |
| -------------------------------------- | ---------------------------------------------------------- |
| ~1MB sprite                            | One inline load in phase 2; originals remain for re-export |
| Missed id rewrite → broken clips       | Scripted rewrite + visual smoke per step                   |
| External `<use href="file#id">` limits | Phase 2 inlines sprite into the Astro component            |
| Step 6 spinner missing in export       | Flag in script; add minimal spinner symbol in phase 3      |
| PNG path already ships approximation   | Keep PNGs until SVG phase 2 matches timing/feel            |

## Success criteria (phase 1)

1. `dns-hero-sprite.svg` exists beside originals
2. All seven originals unchanged
3. Seven symbols + frame/chrome/card ids present and unique
4. No duplicate raw Figma def ids across symbols (namespaced)
5. Hit-map wrapper ids present for targets that exist in source
6. Spec stays consistent with [#1571](https://github.com/datum-cloud/datum.net/issues/1571) for later phases
