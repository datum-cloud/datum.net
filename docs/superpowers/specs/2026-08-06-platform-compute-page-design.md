# /platform/compute — design

Date: 2026-08-06
Figma: [node 15991:8507](https://www.figma.com/design/bBEQ8YeTP4SngNl5EkkQdH/Datum---Master-Design-File?node-id=15991-8507)
(expanded use-case panels: node 15878:66123)

## Goal

Ship the Compute product detail page, following the structure `/platform/dns`
already establishes so the two pages stay maintainable as a pair.

## File layout

Mirrors the DNS page's split exactly.

| File                                        | Role                                             |
| ------------------------------------------- | ------------------------------------------------ |
| `src/pages/platform/compute.astro`          | route                                            |
| `src/pages/platform/compute.md.ts`          | `.md` twin, reads the same data module           |
| `src/content/pages/platform/compute.mdx`    | title / description / OG metadata                |
| `src/data/compute.ts`                       | all section copy — single source for both routes |
| `src/static/styles/page-compute.css`        | entry: base, buttons, dejavu, terminal, compute  |
| `src/static/styles/components-compute.css`  | page component styles                            |
| `src/static/styles/components-terminal.css` | shared terminal styles                           |
| `src/components/compute/*.astro`            | sections                                         |
| `src/components/Terminal.astro`             | **new shared** terminal window                   |

Keeping copy in `@data/compute.ts` rather than in the components is what lets
`compute.md.ts` serve a markdown twin that can't drift from the rendered page.

## Reuse

Taken as-is: `Layout`, `Announcement`, `Nav`, `Footer` (already carries the
"Start here, go anywhere" prefooter and the signup strip), `ModuleConnector`,
`Breadcrumbs`, `Button`, `Icon`, `SectionLine`, `SectionEyebrow`, and the
`section--block` / `max-width-nav` / `datum-text-*` utilities.

New and deliberately generic: `Terminal.astro` — used four times on this page
and applicable to any page that needs to show CLI output.

## Palette

The Canyon Clay family already exists in `theme.css`, so the page needs no new
surface tokens: `canyon-clay-pale` for the hero and feature diagram,
`canyon-clay---links` for accents, `blush-quartz/50` for the hero panel,
`app---dark---utility-1` for terminal chrome with an `aurora-moss` cursor.

Two tokens were added for the comparison meter, which needs saturation the pale
surface tones can't provide:

- `--color-aurora-moss-deep: #b3d56f`
- `--color-alert-red---light: #d25b5b` (Figma variable "Alert Red - Light")

`SectionEyebrow` needed no new variant — its default already renders in
`canyon-clay---links`. A `breadcrumbs--canyon` modifier was added in
`components.css` so the current crumb tints to the page accent instead of pine.

## Sections

1. **Hero** — breadcrumb, `COMPUTE` badge, cycling headline, two CTAs; on the
   right a blush panel with the committed grid texture behind a terminal.
2. **Performance** — boot-time meter card (microVM `<10ms`, container `~400ms`,
   traditional VM `30s+`) beside the heading, five checks and a CTA.
3. **Use Cases** — Alpine accordion, three panels, first open on load.
4. **Features** — Alpine tab strip, six panels, each a description beside a
   numbered stage diagram.

Then `ModuleConnector` and `Footer`.

## Decisions worth recording

**Cycling headline.** The Figma annotation on node 15991:8580 specifies that the
Canyon Clay fragment cycles through five phrases. Only `.compute-headline-phrase`
animates. An explicit break after it gives line one to "Build" plus the phrase
and nothing else, anchoring the rest of the headline to line two whichever phrase
is showing. Under `prefers-reduced-motion` the interval never starts.

The phrase is held on one line by `white-space: nowrap`, but only inside
`@container (min-width: 500px)`. The widest phrase measures 490px at the 54px
headline size while the copy column is ~326px on a phone, so an unconditional
`nowrap` overflowed and was silently clipped by the section's `overflow-hidden`.
The query is keyed to the column, not the viewport, because the two-column
layout narrows the column again at `lg`. Below that threshold the phrase wraps
normally — nothing is ever clipped, and at ≥1536px all five phrases sit beside
"Build" as designed.

**Asymmetric hero columns.** Figma splits the 1316px content row 638 / 80 / 598,
not evenly. An even split leaves the copy column 20px short — just enough to wrap
"Build ephemeral databases" and cost the headline its three-line shape — so
`.compute-hero-layout` sets explicit track sizes.

**Terminal scaling.** Sized in `em` off a single `cqw`-derived font-size (the
same technique as `.dns-hero-anim`) so the window keeps its proportions at any
container width instead of overflowing on narrow screens.

**Meter reveal.** The comparison rows fade up and their bars grow from zero when
the card scrolls into view, staggered in reading order so the story lands in
sequence. It hooks the shared reveal system rather than adding its own observer:
`[data-meter-reveal]` on the list, handled by `initMeterReveal()` in
`static/scripts/module-animate.js`, reversing on scroll-out like every other
reveal there.

Two states, deliberately: `.is-ready` holds the collapsed start, `.is-armed`
follows two frames later and is what enables the transitions. Collapsing to zero
_through_ a transition made a card already on screen at load visibly deflate from
full width before replaying.

Observation starts inside that same deferred callback, after arming. An
IntersectionObserver reports its first entry almost immediately, so observing up
front meant a card already in view on a tall screen received `.is-inview` while
transitions were still off — the bars snapped to full length and the reveal was
never seen at all. A generation counter, bumped by `initModuleAnimate()`, stops a
re-init (bfcache, popstate) from reviving an observer it has just disconnected.

Neither class is added without JS, or under `prefers-reduced-motion` where the
function returns early — so the fallback is the finished chart, never an empty
one.

**One component per repeated item.** `UseCaseItem`, `FeatureTab` and
`FeaturePanel` exist because Prettier cannot parse Alpine's `@` and `:`
attributes inside a `.map()` expression — the same reason `FAQ.astro` is its own
component.

**Drafted copy.** The design only specifies the Forking tab; the other five
(Templates, Checkpoints, Migration, Persistent Storage, Autoscale) were drafted
in the same voice and live in `@data/compute.ts` for review. All three use-case
panels come from the design.

## Testing

`tests/e2e/platform-compute.spec.ts` covers section rendering, single-open
accordion behaviour, tab panel switching, headline cycling with each phrase on
one line, the meter reveal (bars grow from zero to the designed proportions, and
skip the animation entirely under reduced motion), the `.md` route, and absence
of horizontal overflow at 390px.
