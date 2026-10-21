# Per-branch preview deployments on Datum Compute

**Status:** the first version is in the repo: `preview-datum.yml`,
`preview-cleanup.yml`, `preview-autoclean.yml` and `.github/scripts/preview.sh`.
Deploying a preview is manual only; removing one is manual, or automatic when
its branch is deleted. A throwaway workload, `datum-net-pvprobe`, was used on
2026-10-21 to check basic auth, cleanup, name limits and scale-to-zero. The
results are in [Verification results](#verification-results). The first real
preview, of `feat/1806-web-updates`, built and deployed but answered `503`
because its 38 character workload name was too long. Names are now capped at
32 characters.

This document describes how each feature branch gets its own preview URL by
running a manual workflow that builds the branch and deploys it as a separate
Datum Compute workload. It builds on the manual deploy and the
`deploy-datum.yml` workflow described in
[datum-compute-walkthrough.md](./datum-compute-walkthrough.md).

## Why

`deploy-datum.yml` deploys the image that `publish.yml` pushed from `main` or a
release, to `datum-net-gp-staging` or `datum-net-gp`. That is enough to run the
site on Compute, but it cannot show a design or style change before it is
merged:

- `publish.yml` only builds `main` and releases, so a feature branch has no
  image.
- Each target has one workload and one URL. Deploying a branch there replaces
  whatever runs, and reviewers cannot compare a branch with `main`.

A preview per branch fixes both. Each branch gets its own workload and its own
URL, and the staging and production workloads stay as they are.

## Goals and non-goals

Goals:

- Run **manually** from the Actions tab: pick a branch, get a URL.
- One workload and one URL per branch. Re-running for the same branch updates
  that workload and keeps its URL.
- Previews are **never public**. Access is protected by Basic Authentication that
  the workflow sets up itself, with no manual console step.
- A way to list and remove previews, so workloads do not pile up, including
  automatically when the branch is deleted.
- No change to `publish.yml`, `deploy-datum.yml`, or the Kubernetes production
  setup in `config/`.

Non-goals (first version):

- Automatic deploys on push or pull request. `preview-datum.yml` is
  `workflow_dispatch` only.
- Previews for pull requests from forks.
- Custom domains for previews. They use the generated `*.datumproxy.net` URL.
- Posting the URL as a pull request comment.
- Acting as a staging or production environment.

## What we know

These facts come from the manual test on `datum/project-9htv9` and the probe in
`datum-cloud`, and are the basis of the design.

| Fact                                                                                               | Source                                 |
| -------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Each workload gets its own generated `*.datumproxy.net` URL; the URL stays until `destroy`         | manual deploy                          |
| A workload is `datumctl compute deploy <name> ...`; `destroy` removes instances and the URL        | manual deploy                          |
| Secrets are per project (namespace `default`); any workload in the project can import them         | `--env-from-secret`                    |
| Basic Authentication is an Envoy `SecurityPolicy` on the workload's `Gateway` plus a Secret        | read from the project                  |
| That Secret is named `<workload>-basic-auth` with one key `.htpasswd`, one line `user:{SHA}<hash>` | read from the project (key names only) |
| `datumctl` has no auth flag on `compute deploy`                                                    | `datumctl compute deploy --help`       |
| `datumctl compute restart` does a rolling restart of a workload                                    | `datumctl compute --help`              |
| A failed instance blocks the rollout (`OrderedReady`); users cannot delete instances               | manual deploy                          |
| Instances read a Secret only at start                                                              | manual deploy                          |
| Project quota: 1000 workloads, 100 instances, 400 vCPUs, 819200 MiB                                | `datumctl compute quota`               |
| One workload on `d1-standard-2` uses 1 instance, 1 vCPU, 2048 MiB                                  | `datumctl compute quota`               |
| `compute destroy` leaves the basic-auth Secret and the `SecurityPolicy`                            | probe                                  |
| A workload cannot scale to zero (`min replicas must be at least 1`)                                | probe                                  |

Quota is not a constraint. Running previews costs money for as long as they run,
so cleanup matters for cost, not for quota.

## Design

### Overview

```text
Preview Datum Compute (branch, project, location)
  build job (contents: read, packages: write)
    1. Check the naming rules, derive <slug>, the workload and the image tag
    2. Build the branch image and push ghcr.io/datum-cloud/datum-net:preview-<slug>-<sha7>
  deploy job (environment datum-compute-preview, contents: read)
    3. Check that PREVIEW_BASIC_AUTH is set
    4. Log in to Datum Cloud, check datum-net-preview-secrets strictly
    5. Deploy workload datum-net-<slug>, then apply the basic-auth Secret and
       SecurityPolicy in the same step
    6. Check that the workload runs the new image
    7. Verify: no credentials -> 401, with credentials -> 200
    8. Write the URL to the job summary
       (if step 5, 6 or 7 fails or the run is cancelled, destroy the workload)

Preview Datum Compute cleanup (action, branch, project)
  list:    table of preview workloads, when they were created, and their image
  destroy: destroy datum-net-<slug>, its basic-auth Secret and SecurityPolicy

Preview Datum Compute autoclean (branch deleted)
  destroy the preview of that branch, as cleanup's destroy does
```

### Naming

| Item              | Name                             |
| ----------------- | -------------------------------- |
| Workload          | `datum-net-<slug>`               |
| Image tag         | `preview-<slug>-<sha7>`          |
| Basic-auth Secret | `datum-net-<slug>-basic-auth`    |
| SecurityPolicy    | `datum-net-<slug>`               |
| Concurrency group | `datum-compute-preview-<branch>` |

`<slug>` is derived from the branch name by `preview.sh`:

1. Strip `refs/heads/`, lowercase, and replace every run of characters outside
   `a-z0-9` with `-`. Trim `-` from both ends; a name with nothing left becomes
   `branch`.
2. Truncate it so the workload fits, and append `-` plus the first 6 hex
   characters of the SHA-256 of the full branch name, so two long branches that
   share a prefix do not collide.

The workload name is capped at 32 characters, which leaves 15 for the readable
part of the slug. Two limits apply:

- Instance names are `<workload>-default-<location>-0` and must fit a 63
  character DNS label, so the workload may be at most `63 - 11 - len(location)`
  characters: 40 for `us-central-1`. A 41 character workload fails with
  `ConfigurationError`.
- A workload of 38 characters deploys and runs, but its NetworkService reports
  `NoMatchingInterfaces`, so the edge has no backend and answers `503`.
  Workloads of 17 to 32 characters serve. The exact limit lies between 33 and
  37 and was not narrowed further.

The concurrency group uses the branch name because a workflow expression cannot
compute the slug. The slug is a pure function of the branch, so it is the same
queue.

Every command that changes or deletes a resource checks the name first. It
refuses `datum-net-gp`, `datum-net-gp-staging`, any name outside the
`datum-net-` prefix, and any name over the limit. A slug always ends in the
6-character hash, so no branch maps onto either protected name.
`preview.sh self-test` checks these rules at the start of every job.

### Build

The preview workflow builds the selected branch, because `publish.yml` does not.

- The repository `Dockerfile`, target `production`, platform `linux/amd64`,
  built with plain `docker build`. The manual deploy already ran this image on
  Compute.
- Pushed to `ghcr.io/datum-cloud/datum-net` with the tag `preview-<slug>-<sha7>`
  using the job token. Only the build job has `packages: write`. The GitHub
  package settings must list this repository under **Manage Actions access**
  with the **Write** role. **Unverified** until the first run.
- A tag per commit, because deploying the same tag again does not replace the
  instance. Re-running for an unchanged branch keeps the running instance.
- The `preview-` prefix keeps these tags apart from the `v0.0.0-<sha7>` tags of
  `publish.yml` and from release tags.
- The branch is checked out without persisted credentials. The script used by
  both jobs comes from the ref the run was started on, not from the branch
  being previewed.

The `production` target runs `npm run build:cache` with
`STRAPI_CACHE_ENABLED=true`, and no Strapi token is passed to the build. Whether
that build succeeds and what content the image then carries is **unverified**
until the first run. If it needs a token, pass a read-only one with `--secret`,
never `--build-arg`.

Build-time values such as the canonical site URL are baked into the image, so
canonical URLs and the sitemap in a preview do not match the preview hostname.
That is acceptable for design review.

### Secrets

Secrets are per project, so previews running in `datum-cloud` could import
`datum-net-secrets`, the Secret of `datum-net-gp`. They do not. Previews deploy
with `--env-from-secret datum-net-preview-secrets`. Make it as small as the
preview needs:

- Leave out `GITHUB_PAT`, and anything else the preview does not need.
- Use a read-only Strapi token if Strapi can issue one.
- Use test reCAPTCHA keys and a non-production `MODE`.

`preview.sh check-secret` applies the same strict validation as
`deploy-datum.yml` before every deploy: the required keys exist (`API_URL`,
`APP_ID`, `APP_INSTALLATION_ID`, `APP_PRIVATE_KEY`, `STRAPI_URL`,
`STRAPI_TOKEN`, `STRAPI_WEBHOOK_SECRET`), and every value is non-empty ASCII
text, with newlines allowed only in `APP_PRIVATE_KEY`. Values are never printed.
Whether the site boots with fewer keys is **unverified**; shrink the list once a
preview runs.

Create and edit the Secret from the CLI with `datumctl apply`, not with the
console form, which can store values as raw bytes.

**Alternative:** run previews in a separate Datum project, with its own Secret,
quota and service-account access. Set the `project` input or the
`DATUM_PROJECT` repo variable to use one. Start with the same project and a
separate Secret.

### Basic Authentication

Previews are reachable from the internet, so they must be protected before
anyone uses them. The console creates two ordinary resources, and
`preview.sh auth` applies the same two with `datumctl apply`:

1. A `Secret` named `<workload>-basic-auth`, type `Opaque`, with one key
   `.htpasswd` whose value is a single line
   `user:{SHA}<base64 of the SHA-1 of the password>`.
2. An Envoy Gateway `SecurityPolicy` named after the workload, with
   `targetRefs` pointing at `Gateway/<workload>` and `spec.basicAuth.users`
   referencing the Secret above.

- One shared credential is stored as the environment secret
  `PREVIEW_BASIC_AUTH` (`user:password`). There is **no default**: the deploy
  job fails before it builds anything if the secret is missing. No hash or
  password is committed.
- The manifest is written to a temporary file with mode `600` and removed after
  the apply. The password is masked in the logs.
- The Gateway exists only after the workload is created, so the auth is applied
  right after `compute deploy`, in the same step.

Known limits of Basic Authentication here, from the manual test:

- It covers the whole load balancer. `/livez`, `/readyz` and webhooks get `401`
  from the public URL. This does not make the backend unhealthy, because the
  platform checks health internally.
- Never register a preview URL as a webhook target.

### Fail closed

A preview must not stay reachable without authentication. The deploy job:

1. Applies basic auth in the deploy step.
2. Requests `/` without credentials and expects `401`. A `200` fails at once.
3. Requests `/` with the credentials and expects `200`, retrying for 5 minutes,
   because DNS and the edge can lag a new or replaced instance.
4. If the deploy, the image check, or either request fails, or the run is
   cancelled after the deploy started, **destroys the workload** and its auth
   resources and fails the job.

This also applies to a re-run: a re-run that cannot confirm auth removes the
preview it was updating. Run the workflow again to bring it back.

A first deploy is public while `compute deploy` waits for the rollout and until
the policy is applied. That window cannot be closed with `datumctl` 0.21,
because the Gateway does not exist before the deploy.

### Cleanup

Each preview is an instance that runs until it is removed. Scale-to-zero is
refused by the platform, so cleanup is the only way to stop the cost.

- `preview-cleanup.yml` with `action: destroy` and a branch runs
  `datumctl compute destroy datum-net-<slug> --yes`, then deletes the
  `<workload>-basic-auth` Secret and the `SecurityPolicy`, which `destroy`
  leaves behind. Each step skips a resource that is already gone, so it is safe
  to run twice.
- `action: list` (the default) writes a table of preview workloads, when they
  were created and which image they run, to the job summary. `destroy` also
  prints it afterwards.
- `preview-autoclean.yml` does the same destroy when a branch is deleted,
  including the automatic deletion after a merge. Closing a pull request
  without deleting its branch keeps the preview. It runs for every deleted
  branch, also one that never had a preview, and then only logs that the
  resources are already gone. It skips tags and `dependabot/` and `renovate/`
  branches. The `delete` event runs the workflow from the default branch, so it
  triggers only once the file is on `main`, and the script it runs is the one
  on `main`.
- Cleanup refuses the protected workloads and any name outside the prefix, as
  described in [Naming](#naming).

### Workflows

| Workflow                | Trigger             | Inputs                                                                     |
| ----------------------- | ------------------- | -------------------------------------------------------------------------- |
| `preview-datum.yml`     | `workflow_dispatch` | `branch` (empty = the ref the run was started on), `project`, `location`   |
| `preview-cleanup.yml`   | `workflow_dispatch` | `action` (`list` or `destroy`), `branch` (for `destroy`), `project`        |
| `preview-autoclean.yml` | `delete` (branch)   | none; the project is the `DATUM_PROJECT` repo variable, then `datum-cloud` |

All three:

- Use the GitHub environment `datum-compute-preview`, so required reviewers can
  be added without touching staging or production, with the secrets
  `DATUM_SA_CREDENTIALS` and `PREVIEW_BASIC_AUTH`.
- Pin `datumctl` and the `compute` plugin to the versions in `deploy-datum.yml`.
  Change all four files together.
- Run only in `datum-cloud/datum.net`, never in a fork.
- Use `concurrency: group: datum-compute-preview-<branch>` with
  `cancel-in-progress: false`, so a deploy and a cleanup for one branch never
  race, and different branches do not block each other.
- Declare minimal `permissions`: `contents: read`, plus `packages: write` for
  the build job only.
- Take `project` with no default, so an empty input falls back to the
  `DATUM_PROJECT` repo variable and then to `datum-cloud`. Autoclean has no
  input and always uses that fallback, so deploy with an empty `project` (or set
  the variable) for autoclean to find the preview. A preview deployed to
  another project has to be removed with `preview-cleanup.yml`.

`workflow_dispatch` runs the workflow file from the selected ref, so a branch
can change the workflow itself. Treat the workflow as trusted code: only people
with write access can run it, and the deploy credentials live in an environment.

## One-time setup

1. Create `datum-net-preview-secrets` in `datum-cloud` with `datumctl apply`,
   following [Secrets](#secrets).
2. Create the GitHub environment `datum-compute-preview` with the secrets
   `DATUM_SA_CREDENTIALS` (the same service account as `datum-compute`) and
   `PREVIEW_BASIC_AUTH` (`user:password`). Allow it on all branches, because
   previews run from feature branches. Add required reviewers if previews
   should be approved.
3. Check that the `datum-net` package lists this repository with the **Write**
   role under **Manage Actions access**.
4. Run `preview-datum.yml` on one feature branch, open the URL with the
   credentials, then remove it with `preview-cleanup.yml`.

## Security

- **Public by default, so auth first.** A new workload is reachable immediately.
  The fail-closed rule above is the main control.
- **Shared project credentials.** The service account can create and destroy any
  workload in the project, including `datum-net-gp`. The workflows protect it
  only with name checks. A separate preview project, with its own service
  account, removes that risk.
- **Secrets.** Previews use `datum-net-preview-secrets`, not the Secret of the
  staging or production workload. Values are never printed.
- **Public images.** The `datum-net` package is public, so Compute can pull it
  without credentials. Anyone can pull a `preview-*` image, including code that
  is not merged yet. Do not preview a branch whose content must stay private
  until release.
- **Search engines.** Basic auth blocks crawlers. Check whether the site sends
  `X-Robots-Tag: noindex` or a `noindex` meta tag when `MODE` is not
  production, and add one if it does not.
- **Forks.** Every job has `if: github.repository == 'datum-cloud/datum.net'`,
  so a copy of the workflow run in a fork is skipped. A fork cannot start a run
  in this repository, and its own runs never see this repository's secrets.
- **Credentials in the build.** No secret is passed to `docker build`. If the
  build needs a Strapi token, pass it with `--secret`, not `--build-arg`.

## Cost and quota

Each preview runs one `d1-standard-2` instance (1 vCPU, 2048 MiB) until it is
removed. The project allows far more (1000 workloads, 100 instances), so quota is
not a limit, but unused previews are a cost. Run `preview-cleanup.yml` with
`list` to find them.

## Verification results

Checked on 2026-10-21 in `datum-cloud` with `datum-net-pvprobe` and the public
image `ghcr.io/datum-labs/compute-hello:datum`. `datum-net-gp` was not changed.

| Check                                  | Result                                                                                                                  |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Basic auth via `datumctl apply`        | Enforced on the first request: `401` without credentials, `200` with them                                               |
| Wrong password                         | Replacing the hash made all requests `401` within 3 seconds. A malformed hash returned `500`. Neither response was open |
| `compute destroy`                      | Deletes the workload, HTTPProxy and managed DNS. Leaves the basic-auth Secret and the `SecurityPolicy`                  |
| Name length                            | 17 to 32 characters serve. 38 runs but answers `503` (`NoMatchingInterfaces`). 41 fails with `ConfigurationError`       |
| Scale to zero                          | Refused: `min replicas must be at least 1`                                                                              |
| Restart after a Secret change          | Not run                                                                                                                 |
| Preview Secret                         | A copy of `datum-net-staging-secrets` without `GITHUB_PAT` boots the site                                               |
| Image build and GHCR push from Actions | Work with the job token                                                                                                 |

The name length rows come from probes on 2026-10-21 that used the preview image
and Secret with names of 17, 21, 25, 29, 32, 38 and 41 characters. Six probes at
once hit the project's HTTPProxy quota, so run such probes one or two at a time.

## Rollout

1. Do the [one-time setup](#one-time-setup) and run one real branch.
2. Update [Verification results](#verification-results) with the build, push
   and reduced Secret results, and shrink the required keys if possible.
3. Later, optionally: pull request comments with the URL, deletion of old
   `preview-*` image tags, and a periodic check that reports any preview that
   answers `200` without credentials. Automatic deploys stay out of scope
   unless that decision changes.
4. After merging, delete a test branch that has a preview and confirm
   autoclean removed it.

## Open questions

- Does the `production` build succeed without a Strapi token, and what content
  does the image carry?
- Which keys does the site need to boot, and can the Strapi token be read-only?
- Should previews live in the same project as `datum-net-gp` or in a separate
  one?
- Is one shared preview password enough, or does each preview need its own?
- Should the `DEPLOY_REV` marker in `deploy-datum.yml` be replaced by
  `datumctl compute restart` once a restart after a Secret change is tested?
