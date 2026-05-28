# Strapi filesystem cache APIs

Operational reference for inspecting and rebuilding the Strapi-backed JSON cache files under `.cache/` (and `.cache/strapi-fallback/` for article-related fallbacks).

## Prerequisites

| Variable                | Purpose                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| `STRAPI_WEBHOOK_SECRET` | Shared secret checked on every cache API request (`X-Webhook-Secret` header). If unset or mismatched → **401**. |
| `STRAPI_URL`            | Strapi GraphQL origin (defaults exist in code; set in production).                                              |
| `STRAPI_TOKEN`          | Bearer token for Strapi GraphQL when required.                                                                  |

Optional Strapi caching behavior for **written** TTL files (reads still run through the fetch helpers):

| Variable               | Purpose                                                |
| ---------------------- | ------------------------------------------------------ |
| `STRAPI_CACHE_ENABLED` | `"true"` or `"1"` to persist TTL JSON under `.cache/`. |
| `STRAPI_CACHE_TTL`     | TTL in **seconds** for Strapi-backed cache entries.    |

Authentication uses the **`X-Webhook-Secret`** HTTP header whose value must match `STRAPI_WEBHOOK_SECRET` **exactly** (byte length-sensitive). Prefer the same tooling you use for `POST /api/webhooks/strapi-content`.

---

## Inspect cache inventory

### `GET /api/cache`

Returns a JSON overview of filesystem cache entries (size, TTL expiry when present), grouped loosely by origin.

**Authentication:** Same as below — header `X-Webhook-Secret: <secret>`.

**Implementation:** [`src/pages/api/cache/index.ts`](../src/pages/api/cache/index.ts), [`src/libs/cacheViewer.ts`](../src/libs/cacheViewer.ts).

**Example:**

```bash
curl -sS "${ORIGIN}/api/cache" -H "X-Webhook-Secret: ${STRAPI_WEBHOOK_SECRET}"
```

Response is pretty-printed JSON with top-level `entries` and `bySource` (`strapi`, `strapi-fallback`, etc.).

---

## Get cache entry by name

### `GET /api/cache/:name`

Returns the **full parsed JSON** for a single cache key (for example `strapi-authors`, `strapi-card-members`, `article-my-slug`).

**Authentication:** Header `X-Webhook-Secret: <secret>` (same as other cache APIs).

**Implementation:** [`src/pages/api/cache/[name].ts`](../src/pages/api/cache/[name].ts), [`src/libs/cacheViewer.ts`](../src/libs/cacheViewer.ts), [`src/libs/cacheApiAuth.ts`](../src/libs/cacheApiAuth.ts).

**Query parameters:**

| Parameter | Values                     | Default | Meaning                           |
| --------- | -------------------------- | ------- | --------------------------------- |
| `source`  | `main`, `fallback`, `auto` | `auto`  | Main `.cache/`, fallback, or both |

**Examples:**

```bash
curl -sS "${ORIGIN}/api/cache/strapi-authors" \
  -H "X-Webhook-Secret: ${STRAPI_WEBHOOK_SECRET}"

curl -sS "${ORIGIN}/api/cache/article-my-post?source=fallback" \
  -H "X-Webhook-Secret: ${STRAPI_WEBHOOK_SECRET}"
```

**Success response (200):**

```json
{
  "success": true,
  "key": "strapi-authors",
  "source": "strapi",
  "expiresAt": "May 28, 2026, 3:45 PM",
  "expired": false,
  "size": "12.4 KB",
  "data": []
}
```

**HTTP status codes:**

| Status  | When                                                     |
| ------- | -------------------------------------------------------- |
| **200** | Entry found and JSON parsed                              |
| **400** | Invalid cache name or invalid `source` query             |
| **401** | Missing or wrong `X-Webhook-Secret`                      |
| **404** | No `.json` file for that key in the searched location(s) |
| **405** | Method other than GET                                    |
| **500** | File exists but JSON is corrupt                          |

**Notes:**

- Reads **raw filesystem** files. Expired TTL entries are returned with `"expired": true` and are **not** deleted (unlike `Cache.get()` used at runtime).
- Cache names must match safe key rules (alphanumeric start; letters, digits, `.`, `_`, `-` only; no path segments).

---

## Regenerate Strapi cache (`POST /api/cache/strapi`)

Rebuilds cache entries using the same Strapi GraphQL helpers as the site (`fetchStrapiArticles`, `fetchStrapiAuthors`, `getStrapiTeamMembers`, `getStrapiCardMembers`, `fetchStrapiArticleBySlug`).

**Implementation:** [`src/pages/api/cache/strapi.ts`](../src/pages/api/cache/strapi.ts), [`src/libs/strapi/regenerateCache.ts`](../src/libs/strapi/regenerateCache.ts).

### Authentication

| Header             | Value                                  |
| ------------------ | -------------------------------------- |
| `X-Webhook-Secret` | Exact value of `STRAPI_WEBHOOK_SECRET` |

**401 Unauthorized** — secret missing, wrong length, mismatch, or `STRAPI_WEBHOOK_SECRET` not configured on the server.

### Request parsing

JSON is read only when `Content-Type` includes `application/json`. If you send JSON without that header, the body is ignored.

### Mode A — Fill missing entries (default)

Use when you want **idempotent warmup**: populate Strapi-derived keys **only if** the corresponding `.cache/<key>.json` file does not exist (same behavior as before named force regeneration existed).

**Request:** `POST /api/cache/strapi`  
Body: omit entirely, omit JSON, or JSON **without** a `names` property (see edge cases).

**Behavior (summary):**

1. **`strapi-articles`** — if missing → `fetchStrapiArticles()`
2. **`strapi-authors`** — if missing → `fetchStrapiAuthors()`
3. **`strapi-roadmaps`** — if missing → `fetchStrapiRoadmaps()`
4. **`strapi-team-members`** — if missing → `getStrapiTeamMembers()` (derived from cached/fetched authors + article list semantics in code paths)
5. **`strapi-article-{slug}`** — for each article in the list, if missing → `fetchStrapiArticleBySlug(slug)`
6. **`strapi-author-slug-{slug}`** — for eligible authors with articles, if missing → `fetchStrapiAuthorBySlug(slug)`

**Important:** **`strapi-roadmaps`** and **`strapi-author-slug-*`** participate in fill-missing but are **not** valid targets for named force regeneration (force list is fixed below + per-article keys only).

### Mode B — Force regeneration by cache name

**Request:** `POST /api/cache/strapi`

**Headers:**

- `Content-Type: application/json`
- `X-Webhook-Secret: <secret>`

**Body:**

```json
{
  "names": [
    "strapi-articles",
    "strapi-authors",
    "strapi-team-members",
    "strapi-card-members",
    "strapi-article-your-blog-post-slug"
  ]
}
```

For each supplied name:

1. The main cache entry **`{name}`** under **`.cache/`** is **cleared** (`.json` + optional `.expires` via `Cache.clear`).
2. The appropriate fetch runs to repopulate (when caching is enabled for Strapi TTL files; article helpers also refresh article fallbacks inside `.cache/strapi-fallback/` on successful API responses — see caveat below).

**De-duplication:** Duplicate strings (after trim) are processed once. Non-string entries in `names` are ignored (validation can still fail if no valid strings remain).

#### Allowed `names`

| Pattern                 | Meaning                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `strapi-articles`       | Article list slice used across the site; calls `fetchStrapiArticles()`                    |
| `strapi-authors`        | Full author list; calls `fetchStrapiAuthors()`                                            |
| `strapi-team-members`   | Derived list (`isTeam`); calls `getStrapiTeamMembers()`                                   |
| `strapi-card-members`   | Derived list (`isCard`); calls `getStrapiCardMembers()`                                   |
| `strapi-article-{slug}` | Single article payload; `{slug}` is the blog slug. Calls `fetchStrapiArticleBySlug(slug)` |

The literal key `strapi-article-{slug}` is **not** a real key — substitute your post slug (for example `strapi-article-announcing-datum-platform`).

**Slug validation** (for article keys):

- Prefix must be **`strapi-article-`**.
- The slug segment must be non-empty (trimmed).
- Must not contain `/` or `\`, and must not be `.` or `..`.

#### Derived caches (`strapi-team-members`, `strapi-card-members`)

Team and card caches are rebuilt from **`fetchStrapiAuthors()`** (after their own TTL file is cleared). If you need those lists to reflect **author** schema changes (`isTeam` / `isCard`), regenerate **`strapi-authors`** in the **same** or an earlier request. Depending on CMS shape, **`strapi-articles`** author flags may matter too — regenerate both when in doubt.

#### Main cache vs fallback (articles)

[`POST /api/webhooks/strapi-content`](../src/pages/api/webhooks/strapi-content.ts) invalidates matching keys in **both** `.cache/` and `.cache/strapi-fallback/` for article-related patterns.

Named **force regeneration** clears only entries under **`.cache/`** for each key (`Cache` instance rooted at `.cache`). It does **not** delete **`strapi-fallback`** snapshots for article keys before refetch.

- On a **successful** Strapi response, article helpers overwrite the relevant fallback snapshot.
- If Strapi is **unreachable**, `fetchStrapiArticleBySlug` may still serve from an existing stale fallback entry (see [`src/libs/strapi/articles.ts`](../src/libs/strapi/articles.ts)).

Operators who must drop stale fallback data should rely on **`/api/webhooks/strapi-content`**, filesystem cleanup, or a future enhancement — not assumed by this endpoint.

---

## Response payloads

Responses are **`Content-Type: application/json`**.

### Success — fill missing (Mode A)

`success` is always **true** in the happy path handler (individual Strapi failures are reported under `details.errors`).

```json
{
  "success": true,
  "message": "Strapi cache regeneration completed",
  "details": {
    "regenerated": ["strapi-articles"],
    "skipped": ["strapi-authors", "strapi-roadmaps"],
    "errors": [],
    "regeneratedCount": 1,
    "skippedCount": 2
  }
}
```

(`regenerated` / `skipped` entries are cache key names matching `.cache/<key>.json` filenames without the extension.)

### Success — force (Mode B)

HTTP **200**. `success` is **false** when one or more names failed refetch (`details.errors` non-empty).

```json
{
  "success": true,
  "message": "Strapi cache force regeneration completed",
  "details": {
    "mode": "force",
    "regenerated": ["strapi-articles", "strapi-article-acme-announcement"],
    "skipped": [],
    "errors": [],
    "regeneratedCount": 2,
    "skippedCount": 0
  }
}
```

`details.skipped` is currently unused for force regeneration (reserved / always empty arrays).

Partial failure example:

```json
{
  "success": false,
  "message": "Strapi cache force regeneration completed",
  "details": {
    "mode": "force",
    "regenerated": ["strapi-articles"],
    "skipped": [],
    "errors": ["strapi-article-missing-post: Article not found or Strapi unavailable"],
    "regeneratedCount": 1,
    "skippedCount": 0
  }
}
```

### Errors

| Status  | When                                                                                                                                                  |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **400** | Invalid JSON body; `names` present but not an array; validation failed (unknown key, invalid article slug rules, empty `names` array after trimming). |
| **401** | Webhook secret check failed.                                                                                                                          |
| **405** | Non-POST (middleware may still normalize).                                                                                                            |
| **500** | Unhandled exception in the handler.                                                                                                                   |

**400 validation** bodies look like:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["strapi-roadmaps: Unknown cache name \"strapi-roadmaps\". Expected ..."]
}
```

---

## Curl examples

**Fill missing (no JSON body):**

```bash
curl -sS -X POST "${ORIGIN}/api/cache/strapi" \
  -H "X-Webhook-Secret: ${STRAPI_WEBHOOK_SECRET}"
```

**Force fixed keys + one article:**

```bash
curl -sS -X POST "${ORIGIN}/api/cache/strapi" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: ${STRAPI_WEBHOOK_SECRET}" \
  -d '{
    "names": [
      "strapi-articles",
      "strapi-authors",
      "strapi-team-members",
      "strapi-card-members",
      "strapi-article-my-post-slug"
    ]
  }'
```

---

## Programmatic reuse (same repo)

If you invoke this logic from tooling or scripts **inside this codebase**:

| Export                                 | Module                         |
| -------------------------------------- | ------------------------------ |
| `regenerateStrapiCacheIfMissing`       | `@libs/strapi/regenerateCache` |
| `forceRegenerateStrapiCache`           | `@libs/strapi/regenerateCache` |
| `validateStrapiForceRegenerateRequest` | `@libs/strapi/regenerateCache` |
| `validateStrapiForceRegenerateName`    | `@libs/strapi/regenerateCache` |
| `STRAPI_FORCE_REGENERATE_KEYS`         | `@libs/strapi/regenerateCache` |
| `ARTICLE_CACHE_PREFIX`                 | `@libs/strapi/regenerateCache` |

---

## Related routes

| Route                               | Role                                                                                                                         |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/webhooks/strapi-content` | Strapi CMS webhook: deletes cache slices (including fallbacks where applicable) and selectively warms article-related caches |
| `GET /api/cache`                    | Inspect cache filenames and TTL metadata                                                                                     |
| `GET /api/cache/:name`              | Full JSON for one cache key (`source` query: main, fallback, auto)                                                           |
