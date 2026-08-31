# Unused JavaScript / TypeScript Audit

Generated: 2026-08-12T03:30:38.853Z

## How to read this

Static import/reference scan. **Review before deleting.**

- Modules/components need an `import` / `from` / `import()` path hit (or Astro/MDX tag usage).
- Pages under `src/pages` are routes and excluded from unused-module checks.
- Type-only exports often look unused when only inferred — verify with `rg`.
- Barrel-only Astro components (`@components/content`) are listed separately.

## Summary

| Metric                        | Count |
| ----------------------------- | ----: |
| Module candidates             |    65 |
| Astro components              |   112 |
| **Unused modules/scripts**    | **0** |
| **Unused Astro components**   | **0** |
| Barrel-only Astro             |     0 |
| Unused value exports          |    28 |
| Unused type/interface exports |    41 |
| Unreferenced root scripts     |     0 |
| Astro files with `<script>`   |    33 |

## Candidate unused modules / client scripts

_None detected._

## Candidate unused Astro components

_None detected._

## Barrel-only Astro components

Imported via folder `index` barrel (likely used from MDX). Confirm before removing.

_None._

## Candidate unused value exports (functions/const/class)

| Export                              | File                                        | Review |
| ----------------------------------- | ------------------------------------------- | ------ |
| `getUniqueDepartments`              | `src/libs/ashby.ts`                         | [ ]    |
| `getUniqueEmploymentTypes`          | `src/libs/ashby.ts`                         | [ ]    |
| `getUniqueLocations`                | `src/libs/ashby.ts`                         | [ ]    |
| `clearSession`                      | `src/libs/auth.ts`                          | [ ]    |
| `getSession`                        | `src/libs/auth.ts`                          | [ ]    |
| `filterEventsInNextUtcMonth`        | `src/libs/events.ts`                        | [ ]    |
| `getEventSlug`                      | `src/libs/events.ts`                        | [ ]    |
| `clearGitHubBacklogCache`           | `src/libs/githubBacklog.ts`                 | [ ]    |
| `INCLUDED_BACKLOG_STATUSES`         | `src/libs/githubBacklog.ts`                 | [ ]    |
| `clearGitHubRoadmapsCache`          | `src/libs/githubRoadmap.ts`                 | [ ]    |
| `deletePrimaryCacheByPrefix`        | `src/libs/strapi/_runtime.ts`               | [ ]    |
| `STRAPI_GRAPHQL_PAGE_SIZE`          | `src/libs/strapi/graphqlPagination.ts`      | [ ]    |
| `STRAPI_FORCE_REGENERATE_KEYS`      | `src/libs/strapi/regenerateCache.ts`        | [ ]    |
| `validateStrapiForceRegenerateName` | `src/libs/strapi/regenerateCache.ts`        | [ ]    |
| `ResilientGraphQLStrapiClient`      | `src/libs/strapi/resilientGraphqlClient.ts` | [ ]    |
| `removeHeaderTags`                  | `src/libs/string.ts`                        | [ ]    |
| `stripTags`                         | `src/libs/string.ts`                        | [ ]    |
| `getAuthorBgColor`                  | `src/utils/authorUtils.ts`                  | [ ]    |
| `getStrapiTeamBgColor`              | `src/utils/authorUtils.ts`                  | [ ]    |
| `getTeamMembers`                    | `src/utils/authorUtils.ts`                  | [ ]    |
| `BLOG_LISTING_BASE`                 | `src/utils/blogPagination.ts`               | [ ]    |
| `getBlogListingPagePath`            | `src/utils/blogPagination.ts`               | [ ]    |
| `formatRelativeTime`                | `src/utils/dateUtils.ts`                    | [ ]    |
| `extractFrontmatter`                | `src/utils/llmsUtils.ts`                    | [ ]    |
| `containsFigureSyntax`              | `src/utils/markdownFigure.ts`               | [ ]    |
| `makeEntryMarkdownRoute`            | `src/utils/pageMarkdown.ts`                 | [ ]    |
| `findUrls`                          | `src/utils/string.ts`                       | [ ]    |
| `hasUrl`                            | `src/utils/string.ts`                       | [ ]    |

## Candidate unused type / interface exports

Higher false-positive rate — types may only be used via inference or `import type` in ways the scanner missed.

| Export                        | File                                   | Review |
| ----------------------------- | -------------------------------------- | ------ |
| `MeterBar`                    | `src/data/compute.ts`                  | [ ]    |
| `TerminalBlock`               | `src/data/compute.ts`                  | [ ]    |
| `TerminalContent`             | `src/data/compute.ts`                  | [ ]    |
| `BuiltForYouItem`             | `src/data/dedicatedCloud.ts`           | [ ]    |
| `ChecklistItem`               | `src/data/dedicatedCloud.ts`           | [ ]    |
| `Operator`                    | `src/data/dedicatedCloud.ts`           | [ ]    |
| `ComparisonRow`               | `src/data/dns.ts`                      | [ ]    |
| `DomainStep`                  | `src/data/dns.ts`                      | [ ]    |
| `IconItem`                    | `src/data/dns.ts`                      | [ ]    |
| `AshbyCompensation`           | `src/libs/ashby.ts`                    | [ ]    |
| `AshbyFetchResult`            | `src/libs/ashby.ts`                    | [ ]    |
| `AshbyJobBoardResponse`       | `src/libs/ashby.ts`                    | [ ]    |
| `AshbyLocation`               | `src/libs/ashby.ts`                    | [ ]    |
| `GroupedJobs`                 | `src/libs/ashby.ts`                    | [ ]    |
| `CacheEntry`                  | `src/libs/cacheViewer.ts`              | [ ]    |
| `CacheEntryByName`            | `src/libs/cacheViewer.ts`              | [ ]    |
| `CacheViewerData`             | `src/libs/cacheViewer.ts`              | [ ]    |
| `GetCacheEntryResult`         | `src/libs/cacheViewer.ts`              | [ ]    |
| `RoadmapProps`                | `src/libs/datum.ts`                    | [ ]    |
| `EventHostsGuests`            | `src/libs/events.ts`                   | [ ]    |
| `GeoAddress`                  | `src/libs/events.ts`                   | [ ]    |
| `GroupedRoadmaps`             | `src/libs/githubRoadmap.ts`            | [ ]    |
| `K8sClientConfig`             | `src/libs/k8s-client.ts`               | [ ]    |
| `K8sMetadata`                 | `src/libs/k8s-client.ts`               | [ ]    |
| `ResilientCacheDriverOptions` | `src/libs/strapi/drivers/resilient.ts` | [ ]    |
| `RegenerateResult`            | `src/libs/strapi/regenerateCache.ts`   | [ ]    |
| `ArticleProps`                | `src/types/common.ts`                  | [ ]    |
| `AsideProps`                  | `src/types/common.ts`                  | [ ]    |
| `BreadcrumbItem`              | `src/types/common.ts`                  | [ ]    |
| `ContentProps`                | `src/types/common.ts`                  | [ ]    |
| `HandbookProps`               | `src/types/common.ts`                  | [ ]    |
| `NotFoundProps`               | `src/types/common.ts`                  | [ ]    |
| `PaginationProps`             | `src/types/common.ts`                  | [ ]    |
| `NotificationSpec`            | `src/types/k8s-resources.ts`           | [ ]    |
| `NavFooterDocsSection`        | `src/types/navigation.ts`              | [ ]    |
| `NavSection`                  | `src/types/navigation.ts`              | [ ]    |
| `StrapiImageFormat`           | `src/types/strapi.ts`                  | [ ]    |
| `StrapiSeo`                   | `src/types/strapi.ts`                  | [ ]    |
| `NormalizedTeamMember`        | `src/utils/authorUtils.ts`             | [ ]    |
| `MarkdownSource`              | `src/utils/markdownRegistry.ts`        | [ ]    |
| `ToYouTubeEmbedUrlOptions`    | `src/utils/youtube.ts`                 | [ ]    |

## Root `scripts/` not referenced

_None detected._

## Client scripts (known wiring)

| Script                                 | Expected entry                        | Review |
| -------------------------------------- | ------------------------------------- | ------ |
| `src/static/scripts/scroll-effects.js` | Layout / LayoutMinimal / LayoutSimple | [ ]    |
| `src/static/scripts/module-animate.js` | Layout.astro                          | [ ]    |
| `src/static/scripts/error-tracker.js`  | 404.astro                             | [ ]    |

## Astro files containing `<script>` (manual review of inline JS)

Not “unused” — inventory of client/inline JS surfaces.

| File                                                   | `<script>` tags | Review |
| ------------------------------------------------------ | --------------: | ------ |
| `src/components/about/PeopleStrapi.astro`              |               1 | [ ]    |
| `src/components/about/ProfileModal.astro`              |               1 | [ ]    |
| `src/components/content/Tabs.astro`                    |               1 | [ ]    |
| `src/components/events/CommunityHuddlePastModal.astro` |               1 | [ ]    |
| `src/components/events/EventCalendarSection.astro`     |               1 | [ ]    |
| `src/components/Footer.astro`                          |               1 | [ ]    |
| `src/components/forms/BookDemo.astro`                  |               1 | [ ]    |
| `src/components/forms/DedicatedCloudForm.astro`        |               1 | [ ]    |
| `src/components/forms/NewsletterModal.astro`           |               1 | [ ]    |
| `src/components/handbook/Article.astro`                |               1 | [ ]    |
| `src/components/hello/HelloHero.astro`                 |               1 | [ ]    |
| `src/components/hello/HelloModal.astro`                |               1 | [ ]    |
| `src/components/hello/HelloPeople.astro`               |               2 | [ ]    |
| `src/components/JsonLd.astro`                          |               1 | [ ]    |
| `src/components/LayoutEmbedScripts.astro`              |               5 | [ ]    |
| `src/components/locations/LocationsList.astro`         |               1 | [ ]    |
| `src/components/LogoDropdown.astro`                    |               1 | [ ]    |
| `src/components/MarkdownLightbox.astro`                |               1 | [ ]    |
| `src/components/MediaLightbox.astro`                   |               1 | [ ]    |
| `src/components/Nav.astro`                             |               2 | [ ]    |
| `src/components/roadmap/RoadmapViewFilter.astro`       |               1 | [ ]    |
| `src/components/SecondaryTabNav.astro`                 |               1 | [ ]    |
| `src/components/TableOfContents.astro`                 |               1 | [ ]    |
| `src/layouts/Layout.astro`                             |               3 | [ ]    |
| `src/layouts/LayoutMinimal.astro`                      |               4 | [ ]    |
| `src/layouts/LayoutSimple.astro`                       |               3 | [ ]    |
| `src/pages/_features-legacy.astro`                     |               2 | [ ]    |
| `src/pages/404.astro`                                  |               1 | [ ]    |
| `src/pages/careers.astro`                              |               3 | [ ]    |
| `src/pages/essentials.astro`                           |               1 | [ ]    |
| `src/pages/locations.astro`                            |               1 | [ ]    |
| `src/pages/shop/index.astro`                           |               2 | [ ]    |

## Review checklist

- [ ] Confirm no dynamic `import()` / string path
- [ ] Check `server.mjs` and API routes
- [ ] For Astro, search MDX content + relative `./X.astro` imports
- [ ] For types, try removing and run `npm run typecheck`
