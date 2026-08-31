# Unused CSS Classes Audit

Generated: 2026-08-12T03:30:38.852Z

## How to read this

Static heuristic scan of `src/static/styles/**/*.css`. **Review before deleting.**

- A class is “unused” if its name never appears outside CSS (Astro/TS/JS/MD/MDX/HTML).
- Dynamically built classes (`compute-meter-fill--${tone}`) are listed separately.
- Animation-step / CSS-orchestrated modifiers may still be live even if unused in markup.
- False positives: Alpine `x-bind:class`, server-injected HTML, content not in repo.

## Summary

| Metric                 |   Count |
| ---------------------- | ------: |
| CSS files scanned      |      57 |
| Custom class selectors |    1084 |
| With non-CSS usage     |     936 |
| **Candidate unused**   | **128** |
| Likely dynamic (keep)  |      20 |
| Orphan CSS files       |       0 |

## Detected dynamic class prefixes

Found template/string patterns like `` `prefix${...}` `` in non-CSS sources:

- `changelog-entry-card-tag--`
- `compute-meter-fill--`
- `dns-anim-checkbox--`
- `dns-anim-status--`
- `figure--`
- `foo--`
- `nav-dropdown-parent--`
- `note--`
- `page-author--`
- `page-brand--`
- `page-handbook--`
- `page-legal--`

## Possibly orphan CSS files

_None detected._

## Likely dynamic classes (probably keep)

No literal usage, but matches a dynamic prefix — usually still live.

| Class                                | Defined in                                            | Dynamic prefix               | Review |
| ------------------------------------ | ----------------------------------------------------- | ---------------------------- | ------ |
| `.changelog-entry-card-tag--changed` | `src/static/styles/components-changelog.css`          | `changelog-entry-card-tag--` | [ ]    |
| `.changelog-entry-card-tag--fixed`   | `src/static/styles/components-changelog.css`          | `changelog-entry-card-tag--` | [ ]    |
| `.changelog-entry-card-tag--new`     | `src/static/styles/components-changelog.css`          | `changelog-entry-card-tag--` | [ ]    |
| `.compute-meter-fill--alert`         | `src/static/styles/components-compute.css`            | `compute-meter-fill--`       | [ ]    |
| `.compute-meter-fill--moss`          | `src/static/styles/components-compute.css`            | `compute-meter-fill--`       | [ ]    |
| `.dns-anim-checkbox--2`              | `src/static/styles/components-dns-hero-animation.css` | `dns-anim-checkbox--`        | [ ]    |
| `.dns-anim-checkbox--3`              | `src/static/styles/components-dns-hero-animation.css` | `dns-anim-checkbox--`        | [ ]    |
| `.dns-anim-checkbox--4`              | `src/static/styles/components-dns-hero-animation.css` | `dns-anim-checkbox--`        | [ ]    |
| `.dns-anim-checkbox--5`              | `src/static/styles/components-dns-hero-animation.css` | `dns-anim-checkbox--`        | [ ]    |
| `.dns-anim-checkbox--6`              | `src/static/styles/components-dns-hero-animation.css` | `dns-anim-checkbox--`        | [ ]    |
| `.dns-anim-checkbox--7`              | `src/static/styles/components-dns-hero-animation.css` | `dns-anim-checkbox--`        | [ ]    |
| `.dns-anim-status--1`                | `src/static/styles/components-dns-hero-animation.css` | `dns-anim-status--`          | [ ]    |
| `.dns-anim-status--2`                | `src/static/styles/components-dns-hero-animation.css` | `dns-anim-status--`          | [ ]    |
| `.dns-anim-status--4`                | `src/static/styles/components-dns-hero-animation.css` | `dns-anim-status--`          | [ ]    |
| `.dns-anim-status--5`                | `src/static/styles/components-dns-hero-animation.css` | `dns-anim-status--`          | [ ]    |
| `.dns-anim-status--6`                | `src/static/styles/components-dns-hero-animation.css` | `dns-anim-status--`          | [ ]    |
| `.dns-anim-status--7`                | `src/static/styles/components-dns-hero-animation.css` | `dns-anim-status--`          | [ ]    |

## Candidate unused classes (by file)

### `src/static/styles/components-blog.css`

| Class                      | Lines | Review | Notes |
| -------------------------- | ----- | ------ | ----- |
| `.blog-strapi-skeleton`    | 125   | [ ]    |       |
| `.skeleton-date`           | 147   | [ ]    |       |
| `.skeleton-excerpt`        | 139   | [ ]    |       |
| `.skeleton-excerpt--short` | 143   | [ ]    |       |
| `.skeleton-image`          | 131   | [ ]    |       |
| `.skeleton-list-date`      | 155   | [ ]    |       |
| `.skeleton-list-title`     | 151   | [ ]    |       |

### `src/static/styles/components-buttons.css`

| Class                        | Lines | Review | Notes |
| ---------------------------- | ----- | ------ | ----- |
| `.btn--midnight-fjord-alpha` | 54    | [ ]    |       |

### `src/static/styles/components-events.css`

| Class                                          | Lines | Review | Notes |
| ---------------------------------------------- | ----- | ------ | ----- |
| `.event-calendar-list__zoom-link`              | 432   | [ ]    |       |
| `.event-series-card__zoom-link`                | 528   | [ ]    |       |
| `.events-overview-skeleton`                    | 87    | [ ]    |       |
| `.events-overview-skeleton__calendar-day`      | 179   | [ ]    |       |
| `.events-overview-skeleton__calendar-dow`      | 167   | [ ]    |       |
| `.events-overview-skeleton__calendar-dow-cell` | 171   | [ ]    |       |
| `.events-overview-skeleton__calendar-grid`     | 175   | [ ]    |       |
| `.events-overview-skeleton__calendar-header`   | 147   | [ ]    |       |
| `.events-overview-skeleton__calendar-layout`   | 139   | [ ]    |       |
| `.events-overview-skeleton__calendar-month`    | 163   | [ ]    |       |
| `.events-overview-skeleton__calendar-nav`      | 151   | [ ]    |       |
| `.events-overview-skeleton__calendar-section`  | 135   | [ ]    |       |
| `.events-overview-skeleton__calendar-widget`   | 143   | [ ]    |       |
| `.events-overview-skeleton__category-arrow`    | 119   | [ ]    |       |
| `.events-overview-skeleton__category-badge`    | 115   | [ ]    |       |
| `.events-overview-skeleton__category-card`     | 99    | [ ]    |       |
| `.events-overview-skeleton__category-cards`    | 95    | [ ]    |       |
| `.events-overview-skeleton__category-content`  | 103   | [ ]    |       |
| `.events-overview-skeleton__category-image`    | 123   | [ ]    |       |
| `.events-overview-skeleton__category-text`     | 107   | [ ]    |       |
| `.events-overview-skeleton__category-title`    | 111   | [ ]    |       |
| `.events-overview-skeleton__heading`           | 131   | [ ]    |       |
| `.events-overview-skeleton__heading-wrap`      | 127   | [ ]    |       |
| `.events-overview-skeleton__list`              | 183   | [ ]    |       |
| `.events-overview-skeleton__list-badge`        | 203   | [ ]    |       |
| `.events-overview-skeleton__list-badges`       | 199   | [ ]    |       |
| `.events-overview-skeleton__list-header`       | 191   | [ ]    |       |
| `.events-overview-skeleton__list-item`         | 187   | [ ]    |       |
| `.events-overview-skeleton__list-meta`         | 211   | [ ]    |       |
| `.events-overview-skeleton__list-meta-chunk`   | 215   | [ ]    |       |
| `.events-overview-skeleton__list-title`        | 195   | [ ]    |       |
| `.events-overview-skeleton__pulse`             | 91    | [ ]    |       |
| `.featured-event__description`                 | 4     | [ ]    |       |

### `src/static/styles/components-features-hub.css`

| Class                          | Lines | Review | Notes |
| ------------------------------ | ----- | ------ | ----- |
| `.feature-sections`            | 2     | [ ]    |       |
| `.feature-sections-header`     | 7     | [ ]    |       |
| `.feature-sections-label`      | 11    | [ ]    |       |
| `.feature-sections-label-mark` | 16    | [ ]    |       |

### `src/static/styles/components-features.css`

| Class                               | Lines | Review | Notes |
| ----------------------------------- | ----- | ------ | ----- |
| `.features-cta-badge`               | 182   | [ ]    |       |
| `.features-section-description--sm` | 51    | [ ]    |       |

### `src/static/styles/components-form.css`

| Class                       | Lines | Review | Notes |
| --------------------------- | ----- | ------ | ----- |
| `.form--actions`            | 58    | [ ]    |       |
| `.form--checkbox`           | 46    | [ ]    |       |
| `.form--checkbox-container` | 38    | [ ]    |       |
| `.form--checkbox-label`     | 50    | [ ]    |       |
| `.form--checkbox-wrapper`   | 42    | [ ]    |       |
| `.form--content`            | 14    | [ ]    |       |
| `.form--field`              | 22    | [ ]    |       |
| `.form--fields`             | 18    | [ ]    |       |
| `.form--header`             | 6     | [ ]    |       |
| `.form--input`              | 30    | [ ]    |       |
| `.form--label`              | 26    | [ ]    |       |
| `.form--message`            | 54    | [ ]    |       |
| `.form--textarea`           | 34    | [ ]    |       |
| `.form--title`              | 10    | [ ]    |       |

### `src/static/styles/components-handbook.css`

| Class            | Lines | Review | Notes |
| ---------------- | ----- | ------ | ----- |
| `.article-aside` | 93    | [ ]    |       |

### `src/static/styles/components-hero.css`

| Class      | Lines | Review | Notes |
| ---------- | ----- | ------ | ----- |
| `.iconize` | 64    | [ ]    |       |

### `src/static/styles/components-home.css`

| Class                       | Lines | Review | Notes |
| --------------------------- | ----- | ------ | ----- |
| `.btn--home-hero-primary`   | 56    | [ ]    |       |
| `.btn--home-hero-secondary` | 64    | [ ]    |       |
| `.home-hero`                | 2     | [ ]    |       |
| `.home-hero-grid`           | 7     | [ ]    |       |
| `.home-hero-grid-lines`     | 15    | [ ]    |       |

### `src/static/styles/components-list.css`

| Class                         | Lines | Review | Notes |
| ----------------------------- | ----- | ------ | ----- |
| `.entry-list-item--meta-text` | 19    | [ ]    |       |

### `src/static/styles/components-locations.css`

| Class                         | Lines | Review | Notes |
| ----------------------------- | ----- | ------ | ----- |
| `.locations-map--description` | 25    | [ ]    |       |
| `.locations-map--section`     | 2     | [ ]    |       |

### `src/static/styles/components-mission.css`

| Class                        | Lines | Review | Notes |
| ---------------------------- | ----- | ------ | ----- |
| `.mission-body`              | 33    | [ ]    |       |
| `.mission-body-line`         | 38    | [ ]    |       |
| `.mission-grid`              | 2     | [ ]    |       |
| `.mission-paragraphs`        | 55    | [ ]    |       |
| `.mission-reasons`           | 72    | [ ]    |       |
| `.mission-reasons-item`      | 76    | [ ]    |       |
| `.mission-reasons-number`    | 92    | [ ]    |       |
| `.mission-reasons-text`      | 99    | [ ]    |       |
| `.mission-reasons-text-wrap` | 88    | [ ]    |       |
| `.mission-section`           | 7     | [ ]    |       |
| `.mission-vision-check`      | 121   | [ ]    |       |
| `.mission-vision-check-icon` | 134   | [ ]    |       |
| `.mission-vision-check-text` | 138   | [ ]    |       |
| `.mission-vision-checks`     | 117   | [ ]    |       |
| `.mission-vision-closing`    | 146   | [ ]    |       |
| `.mission-vision-cta-text`   | 151   | [ ]    |       |
| `.mission-wrapper`           | 49    | [ ]    |       |
| `.video-thumb`               | 160   | [ ]    |       |
| `.video-thumb-blend`         | 164   | [ ]    |       |

### `src/static/styles/components-roadmap.css`

| Class                           | Lines    | Review | Notes |
| ------------------------------- | -------- | ------ | ----- |
| `.roadmap-backlog-badge`        | 147, 173 | [ ]    |       |
| `.roadmap-backlog-labels`       | 143      | [ ]    |       |
| `.roadmap-container`            | 242      | [ ]    |       |
| `.roadmap-content`              | 279      | [ ]    |       |
| `.roadmap-content--description` | 299      | [ ]    |       |
| `.roadmap-content--summary`     | 303      | [ ]    |       |
| `.roadmap-content--text`        | 283      | [ ]    |       |
| `.roadmap-content--title`       | 287      | [ ]    |       |
| `.roadmap-detail--attribution`  | 110      | [ ]    |       |
| `.roadmap-detail--section`      | 85       | [ ]    |       |
| `.roadmap-link`                 | 333      | [ ]    |       |
| `.roadmap-link--icon`           | 345      | [ ]    |       |
| `.roadmap-month`                | 263      | [ ]    |       |
| `.roadmap-month--text`          | 275      | [ ]    |       |
| `.roadmap-row`                  | 258      | [ ]    |       |
| `.roadmap-section`              | 246      | [ ]    |       |
| `.roadmap-section--title`       | 250      | [ ]    |       |
| `.roadmap-strapi-skeleton`      | 349      | [ ]    |       |
| `.roadmap-table`                | 254      | [ ]    |       |
| `.skeleton-description`         | 369      | [ ]    |       |
| `.skeleton-link`                | 373      | [ ]    |       |
| `.skeleton-month`               | 361      | [ ]    |       |
| `.skeleton-section-title`       | 357      | [ ]    |       |

### `src/static/styles/components.css`

| Class                     | Lines    | Review | Notes |
| ------------------------- | -------- | ------ | ----- |
| `.article-aside`          | 427      | [ ]    |       |
| `.article-aside-close`    | 449, 458 | [ ]    |       |
| `.article-aside-content`  | 446, 471 | [ ]    |       |
| `.article-aside-header`   | 463      | [ ]    |       |
| `.article-aside-title`    | 445, 467 | [ ]    |       |
| `.footer-prefooter-label` | 261      | [ ]    |       |
| `.toc-item--level-1`      | 667      | [ ]    |       |
| `.toc-item--level-2`      | 671      | [ ]    |       |
| `.toc-item--level-3`      | 675      | [ ]    |       |
| `.toc-item--level-4`      | 679      | [ ]    |       |
| `.toc-item--level-5`      | 683      | [ ]    |       |
| `.toc-item--level-6`      | 687      | [ ]    |       |

### `src/static/styles/page-hello.css`

| Class                           | Lines | Review | Notes |
| ------------------------------- | ----- | ------ | ----- |
| `.hello-hero-newsletter-input`  | 46    | [ ]    |       |
| `.hello-hero-newsletter-submit` | 50    | [ ]    |       |

## Review checklist

- [ ] `rg` the class name across `src/`
- [ ] Check Alpine / `class:list` / string concatenation
- [ ] Confirm parent CSS file is imported on live pages
- [ ] Remove CSS + dead markup together
