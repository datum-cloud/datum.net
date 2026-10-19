# Deploy datum.net to Datum Compute (manual test)

This guide records the manual test deploy of `datum.net` to Datum Cloud Compute
on the **general-purpose** runtime. It covers the steps, the problems we hit, and
how we fixed them. The CI deploy (manual, and automatic on release) is
described in [Deploy from GitHub Actions](#deploy-from-github-actions).

**Audience:** engineers new to Datum Compute.
**Status:** manual test only. Production still runs on the Kubernetes setup in
`config/` (see `publish.yml`).
**Project:** the workload moved from the shared test project `project-9htv9` to
`datum-cloud`. The Secret, the Basic Authentication policy and the CI service
account were recreated there. DNS was not changed, and the public URL changed
with the move.

## What was deployed

| Item          | Value                                                            |
| ------------- | ---------------------------------------------------------------- |
| Project       | `datum-cloud`                                                    |
| Workload      | `datum-net-gp` (namespace `default`)                             |
| Runtime       | `general-purpose`, instance type `datumcloud/d1-standard-2`      |
| Location      | `us-central-1`, 1 replica                                        |
| Image         | `ghcr.io/datum-cloud/datum-net:v2.21.5` (public, from CI)        |
| Port          | `4321` (HTTP; the edge terminates TLS)                           |
| Secret        | `datum-net-secrets`, imported with `--env-from-secret`           |
| Access        | Basic authentication on the whole ALB (set in the console)       |
| URL (current) | `https://haze-niche-fkn7r.datumproxy.net` (changes on `destroy`) |

The test used the image that `publish.yml` already pushes, so nothing was built
locally.

## Why general-purpose

The unikernel runtime was unstable for `twins-in-the-loop` on the shared
project (11 of 20 requests answered, against 20 of 20 on `general-purpose`).
`datum.net` is a Node SSR server (`server.mjs`) with a plain container image, so
`general-purpose` needs no special build step. A unikernel image would need
`datumctl compute build` instead of `docker build`.

## Prerequisites

- `datumctl` with the `compute` plugin, logged in to `api.datum.net`
  (`datumctl auth list`).
- A Datum project. Compute must be enabled on it.
- The image is public on GHCR. Check with
  `gh api /orgs/datum-cloud/packages/container/datum-net --jq .visibility`.

## Step 1: Enable Compute

A new project has Compute off.

```bash
datumctl compute access --project datum-cloud      # Status: Not requested
datumctl services enable compute.datumapis.com --project datum-cloud
```

Compute turns on at once, but the project's **locations** appear a few minutes
later. Until then a deploy fails with
`Unsupported value: "us-central-1"`. Wait until this lists locations:

```bash
datumctl get locations --project datum-cloud
```

## Step 2: Create the Secret

The workload reads the same keys as the production `datum-net` Secret. Create
`datum-net-secrets` in the `default` namespace of the project with these keys:

| Group     | Keys                                                                                                                                                                                                              |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Strapi    | `STRAPI_URL`, `STRAPI_TOKEN`, `STRAPI_WEBHOOK_SECRET`, `STRAPI_CACHE_TTL`, `STRAPI_DEBUG`                                                                                                                         |
| GitHub    | `APP_ID`, `APP_INSTALLATION_ID`, `APP_PRIVATE_KEY`, `GITHUB_PAT`                                                                                                                                                  |
| HelpScout | `HELPSCOUT_DEMO_CLIENT_ID`, `HELPSCOUT_DEMO_CLIENT_SECRET`, `HELPSCOUT_DEMO_MAILBOX_ID`, `HELPSCOUT_DEDICATED_CLOUD_CLIENT_ID`, `HELPSCOUT_DEDICATED_CLOUD_CLIENT_SECRET`, `HELPSCOUT_DEDICATED_CLOUD_MAILBOX_ID` |
| Other     | `API_URL`, `MODE`, `PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`                                                                                                                                            |

`REDIS_URL` is not set. The app uses Redis only when `REDIS_URL` exists and
falls back to a local cache otherwise. `LUMA_API_KEY` and `ANTHROPIC_API_KEY`
are not in the Secret.

### Do not create the Secret with the console form

The console form can store values as raw bytes instead of text. In our test six
keys (`STRAPI_TOKEN`, `STRAPI_WEBHOOK_SECRET`, and four HelpScout keys) held
control characters, and `APP_INSTALLATION_ID` held non-ASCII bytes. The instance
then fails with `ConfigurationError` and never starts. The error message says
only "configuration error", so the cause is easy to miss.

Create or fix the Secret from the CLI. Read values from a local file outside the
repo, and never print them or paste them in chat:

```bash
datumctl get secret datum-net-secrets -n default --project datum-cloud -o json \
  | python3 -I -c '<set data[KEY] = base64(value) from your env file>' \
  > secret.json
datumctl apply -f secret.json --project datum-cloud --dry-run=server
datumctl apply -f secret.json --project datum-cloud
rm secret.json
```

`datumctl apply` warns about a missing `last-applied-configuration` annotation.
That warning is harmless.

### Validate the Secret strictly

Run this check after every change. Do **not** decode with `errors="ignore"`: it
drops the bad bytes, so a corrupt value looks clean. We hid the
`APP_INSTALLATION_ID` problem that way at first.

```bash
datumctl get secret datum-net-secrets -n default --project datum-cloud -o json \
  | python3 -I -c '
import sys, json, base64
bad = []
for k, v in json.load(sys.stdin)["data"].items():
    b = base64.b64decode(v)
    # PEM keys contain newlines; every other value must be single-line text.
    if not b.isascii() or not all(c.isprintable() or c == "\n" for c in b.decode()):
        bad.append(k)
print("invalid keys:", bad or "none")'
```

Values like `APP_PRIVATE_KEY` are multi-line PEM, so newlines are allowed there.
Compare against your `.env` if a key looks wrong, but expect `MODE`,
`STRAPI_DEBUG` and the reCAPTCHA keys to differ on purpose.

## Step 3: Deploy

Run this from a folder outside the repo. The command writes `workload.yaml`
into the current folder, and it must not be committed.

```bash
datumctl compute deploy datum-net-gp \
  --project datum-cloud \
  --image=ghcr.io/datum-cloud/datum-net:v2.21.5 \
  --location=us-central-1 \
  --http-port=4321 \
  --instance-type=datumcloud/d1-standard-2 \
  --runtime-class=general-purpose \
  --env="HOST=::" \
  --env-from-secret=datum-net-secrets \
  --yes
```

- If it says `Network "default" does not exist`, the deploy creates it.
- **`HOST=::` is required.** Datum networks are IPv6-only. The Dockerfile
  default `HOST=0.0.0.0` opens an IPv4-only socket, so the app starts but never
  answers. `server.mjs` reads `HOST` at runtime, so no rebuild is needed.
- The last line prints the public URL.

## Step 4: Verify

```bash
datumctl get workload datum-net-gp -n default --project datum-cloud   # AVAILABLE True
datumctl compute logs datum-net-gp --project datum-cloud
```

Then request the site. With a new hostname your local resolver may not know the
name yet (`Could not resolve host`). Look the address up through 1.1.1.1 and pin
it:

```bash
H=<hostname>.datumproxy.net
IP=$(dig +short A $H @1.1.1.1 | head -1)
curl -s -o /dev/null -w "%{http_code}\n" --resolve "$H:443:$IP" https://$H/livez
```

What we saw on the test deploy (before basic auth was turned on):

- `/livez`, `/readyz`, `/`, `/about`, `/blog`, `/pricing` and `/changelog`
  returned 200 in 0.8 to 2.9 seconds.
- `/blog` listed 14 article links and `/changelog` had content, so Strapi worked.
- `rss.xml` had 1 item. We did not compare this with production.

## Basic authentication

The console dialog **Edit Basic Authentication** protects the whole ALB. It
creates an Envoy `SecurityPolicy` named after the workload, targeting the
`Gateway`, with the users stored in a Secret `<workload>-basic-auth`.

- The dialog has no path exceptions. `/livez` and `/readyz` also return `401`
  from the public URL. This does **not** make the backend unhealthy: the
  platform checks health internally, and the workload stayed `Available`.
- Webhooks that call this URL (for example `/api/strapi-webhook`) get `401`.
  Do not point a webhook at it while auth is on.
- Anything that requests the public URL, such as a CI smoke test, needs the
  credentials.
- `compute destroy` removes the URL, so you must set up basic auth again after
  a redeploy under a new URL. Roll the workload in place (below) instead.

## Redeploying and rolling the workload

- **Instances read the Secret only at start.** After you change the Secret, roll
  the workload. A redeploy with the same image and settings does nothing, so
  change something in the template. We add a marker env var and raise it each
  time:

  ```bash
  datumctl compute deploy datum-net-gp --project datum-cloud \
    --image=ghcr.io/datum-cloud/datum-net:v2.21.5 \
    --location=us-central-1 --env="SECRETS_REV=<next number>" --yes
  ```

  A new image tag also rolls the workload. When you pass `--image`, also pass
  `--location`.

- **A failed instance blocks the rollout.** The placement uses `OrderedReady`,
  so a new instance waits for the old one to become ready. If the old instance is
  stuck in `ConfigurationError`, the rollout stays `Pending`. You cannot delete
  the instance yourself (`Forbidden`). Fix the Secret, then
  `datumctl compute destroy datum-net-gp --yes` and deploy again. This changes
  the URL and removes basic auth.

- A workload keeps its runtime class. To change it, deploy under a new name and
  destroy the old one.

## Troubleshooting

| Symptom                                                | Cause                                                       | Fix                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------- |
| `Unsupported value: "us-central-1"` on deploy          | The project's locations are not provisioned yet             | Wait; `datumctl get locations` must list them                    |
| `ConfigurationError` on the instance                   | A Secret value is not valid text                            | Run the strict check, fix the key, destroy and redeploy          |
| Rollout stays `Pending` after a fix                    | `OrderedReady` waits for the failed instance                | Destroy and redeploy                                             |
| `Forbidden` when deleting an instance                  | Users cannot delete instances                               | Destroy the workload instead                                     |
| App starts, never answers                              | `HOST=0.0.0.0` instead of `HOST=::`                         | Redeploy with `--env="HOST=::"`                                  |
| `Could not resolve host` for a new `*.datumproxy.net`  | Local resolver cache                                        | Resolve through 1.1.1.1 and use `--resolve`                      |
| `401` on every URL                                     | Basic authentication is on                                  | Send credentials, or turn it off in the console                  |
| Secret change has no effect                            | Instances read the Secret only at start                     | Roll the workload (see above)                                    |
| `ConfigurationError` log only shows `Strapi FORBIDDEN` | Old instance started without the Secret or with a bad token | Check the log timestamp against the newest `new generation` line |

## Known gaps

- Not tested after login: the reCAPTCHA and HelpScout forms, and the pages that
  read the GitHub App (roadmap and backlog).
- The image is built with the production CI defaults, so the canonical URL and
  sitemap do not match the Compute hostname.
- No Redis and a single replica.
- `GITHUB_PAT` in the Secret comes from a personal token. Replace it with a
  token that has minimal scope before any real use.
- There is no way yet to preview a feature branch. A design for per-branch
  preview URLs is in [datum-compute-previews.md](./datum-compute-previews.md).

## Deploy from GitHub Actions

`.github/workflows/deploy-datum.yml` (Actions → Deploy Datum Compute → Run
workflow) rolls an image to the `datum-net-gp` workload. It follows the
`twins-in-the-loop` workflow. It runs manually, and it also runs on its own when
a **release** is published (the same `release: published` event as
`publish.yml`; pushes to `main` do not deploy). Production still ships from the
Kubernetes setup in `config/`.

On a release run:

- The image is the release tag with a leading `v` (`publish-docker` tags
  releases as `v{{version}}`), and the inputs below use their defaults.
- The run waits up to 20 minutes for `publish.yml` to push that image. If
  `publish.yml` fails, the tag never appears and the deploy fails.
- A `guard` job deploys only when the tag is the repo's latest release
  (GitHub's "latest" skips pre-releases). An older tag or a pre-release is
  skipped, so it cannot replace a newer deploy.
- After the deploy, the workload must report the same image the run meant to
  deploy.

It does **not** build an image. It deploys the one `publish.yml` already pushed
to `ghcr.io/datum-cloud/datum-net`.

Inputs:

| Input           | Default              | Meaning                                                                             |
| --------------- | -------------------- | ----------------------------------------------------------------------------------- |
| `project`       | `datum-cloud`        | Datum project; falls back to the `DATUM_PROJECT` repo variable                      |
| `location`      | `us-central-1`       | Compute location                                                                    |
| `image_tag`     | `v0.0.0-<short sha>` | Tag to deploy. The default is the build of the commit you run the workflow on       |
| `force_rollout` | off                  | Adds `DEPLOY_REV=<run id>` so the instance is replaced even if nothing else changed |

Use `force_rollout` after you change the Secret: instances read it only at
start, and a deploy of the same image otherwise does nothing.

What the job does, in order:

1. Names the image and waits for the tag to exist (up to 20 minutes on a
   release run; a manual run checks once). If `publish.yml` has not pushed it,
   it stops with a clear message.
2. Installs `datumctl` 0.21.0 and the `compute` plugin v0.12.4, then logs in as a
   service account.
3. **Checks the Secret strictly** before deploying: the required keys exist
   (`API_URL`, `APP_ID`, `APP_INSTALLATION_ID`, `APP_PRIVATE_KEY`, `STRAPI_URL`,
   `STRAPI_TOKEN`, `STRAPI_WEBHOOK_SECRET`), and every value is non-empty ASCII
   text. Only `APP_PRIVATE_KEY` may contain newlines. It prints key names only,
   never values. This catches the corrupt values that cause `ConfigurationError`.
4. Deploys with `HOST=::` and `--env-from-secret datum-net-secrets`.
5. Checks the rollout status from the deploy output (rollout complete, backend
   healthy, edge programmed, certificate issued) and that the workload is
   `Available`.
6. Optionally requests the site through Basic Authentication.

The job does not request the public URL by default, because basic auth answers
`401`. It judges the deploy by the platform status instead. To also check a
page, add the environment secret `DATUM_BASIC_AUTH` (`user:password`).

The deploy keeps the existing workload, so the URL and basic authentication are
not affected. It never runs `destroy`.

### Roll back

Run the workflow manually and set `image_tag` to the last good release, for
example `v2.21.4`. That image is already in GHCR, so nothing is rebuilt and the
rollback takes minutes. A manual run skips the `guard` job, and the final check
still confirms the workload runs that tag. Leave `force_rollout` off: the tag
differs, so the instance is replaced anyway.

Do not re-tag or cherry-pick to roll back:

- Datum does not replace an instance when the image tag is unchanged, so a moved
  or reused tag silently does nothing. Treat release tags as immutable.
- A new release cut from an old commit becomes the "latest" release and starts
  an automatic deploy again.

To fix the bug for good, `git revert` the bad change and publish a new, higher
version (for example `v2.21.6`).

Things to know:

- This only rolls back Datum Compute. Production on Kubernetes (`config/`) has
  its own rollback and is not touched.
- The next release deploys forward again on its own. Fix the cause first.
- Every version shares one Secret. If the bad version added a key or changed a
  format, check that the older image still works with the current Secret.
- If a release run is still queued, it can replace your rollback when it gets its
  turn. Wait for it or cancel it first.

One-time setup:

1. Create a GitHub environment named `datum-compute`.
2. Create a Datum service account with edit access to the project and save its
   credentials JSON as the environment secret `DATUM_SA_CREDENTIALS`. Do not
   commit the file.
3. Make sure the Secret `datum-net-secrets` exists in the project and passes the
   check in Step 2.
4. Optional: set the `DATUM_PROJECT` repo variable and the `DATUM_BASIC_AUTH`
   environment secret.

The image package is public, so the job needs no registry login and no
`packages` permission. The workflow only has `contents: read`.

The tag check, the strict Secret check and the status check were tested against
`datum-cloud`. The full workflow has not run on GitHub yet, because the
service account does not exist.

## Cleanup

```bash
datumctl compute destroy datum-net-gp --project datum-cloud --yes   # instances and URL; the Secret stays
rm workload.yaml                                                       # generated file, never commit it
```
