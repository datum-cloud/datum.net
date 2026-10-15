# Per-branch preview deployments on Datum Compute (design)

**Status:** design only. Nothing in this document is implemented yet, and the
parts marked **unverified** have not been tried. The experiments that settle
them are listed in [Verification plan](#verification-plan).

This document describes how to give each feature branch its own preview URL by
running a manual workflow that builds the branch and deploys it as a separate
Datum Compute workload. It builds on the manual deploy and the
`deploy-datum.yml` workflow described in
[datum-compute-walkthrough.md](./datum-compute-walkthrough.md).

## Why

`deploy-datum.yml` deploys the image that `publish.yml` pushed from `main`, to
one workload (`datum-net-gp`). That is enough to run the site on Compute, but it
cannot show a design or style change before it is merged:

- `publish.yml` only builds `main` and releases, so a feature branch has no
  image.
- There is one workload and one URL. Deploying a branch there replaces whatever
  runs, and reviewers cannot compare a branch with `main`.

A preview per branch fixes both. Each branch gets its own workload and its own
URL, and `datum-net-gp` stays on `main`.

## Goals and non-goals

Goals:

- Run **manually** from the Actions tab: pick a branch, get a URL.
- One workload and one URL per branch. Re-running for the same branch updates
  that workload and keeps its URL.
- Previews are **never public**. Access is protected by Basic Authentication that
  the workflow sets up itself, with no manual console step.
- A way to remove a preview, so workloads do not pile up.
- No change to `publish.yml`, the Kubernetes production setup in `config/`, or
  the existing `datum-net-gp` workflow behavior.

Non-goals (first version):

- Automatic deploys on every push or pull request.
- Previews for pull requests from forks.
- Custom domains for previews. They use the generated `*.datumproxy.net` URL.
- Posting the URL as a pull request comment.
- Acting as a staging or production environment.

## What we know

These facts come from the manual test on `datum/project-9htv9` and are the basis
of the design.

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

Quota is not a constraint. Running previews costs money for as long as they run,
so cleanup matters for cost, not for quota.

## Design

### Overview

```text
Run workflow (branch, optional inputs)
  1. Validate inputs, derive <slug> and names
  2. Build the branch image and push ghcr.io/datum-cloud/datum-net:preview-<slug>-<sha7>
  3. Log in to Datum Cloud, check the preview Secret strictly
  4. Create or update the basic-auth Secret and SecurityPolicy for the workload
  5. Deploy workload datum-net-<slug> from the new image
  6. Verify: no credentials -> 401, with credentials -> 200
  7. Write the URL to the job summary
     (if step 4 or 6 fails, destroy the workload: fail closed)

Run cleanup workflow (branch)
  destroy workload datum-net-<slug> and its basic-auth resources
```

### Naming

| Item              | Name                           |
| ----------------- | ------------------------------ |
| Workload          | `datum-net-<slug>`             |
| Image tag         | `preview-<slug>-<sha7>`        |
| Basic-auth Secret | `datum-net-<slug>-basic-auth`  |
| SecurityPolicy    | `datum-net-<slug>`             |
| Concurrency group | `datum-compute-preview-<slug>` |

`<slug>` is derived from the branch name:

1. Lowercase it and replace every character outside `a-z0-9` with `-`.
2. Collapse repeated `-` and trim `-` from both ends.
3. Truncate to a fixed length and append a short hash of the full branch name,
   so two long branches that share a prefix do not collide.

The result must be a valid Kubernetes resource name (lowercase letters, digits
and `-`, starting with a letter). Instance names are longer than the workload
name (`<workload>-default-<location>-0`), so keep the slug short. The exact
maximum length is **unverified**; read it from the API validation error with a
deliberately long name during the verification plan.

The reserved name `datum-net-gp` must never be produced, so a preview can never
overwrite the `main` workload. Keep the preview prefix (`datum-net-`) and
reserve it by checking that the final name is not `datum-net-gp`.

### Build

The preview workflow builds the selected ref, because `publish.yml` does not.

- Use the repository `Dockerfile`, target `production`, platform `linux/amd64`.
  The manual deploy already ran this image on Compute.
- Push to `ghcr.io/datum-cloud/datum-net` with the tag
  `preview-<slug>-<sha7>`. The package is already linked to this repository, so
  `permissions: packages: write` on the job should be enough. The GitHub package
  settings should list this repository under **Manage Actions access** with the
  **Write** role. **Unverified** until the first run.
- Use a tag per commit. Deploying the same tag again does not replace the
  instance.
- The `preview-` prefix keeps these tags apart from the `v0.0.0-<sha7>` tags that
  `publish.yml` creates and from release tags.

**Open question:** the `production` target runs `npm run build:cache` and builds
with `STRAPI_CACHE_ENABLED=true`. If those steps need Strapi at build time, the
build needs a read-only Strapi token as a build secret (`--secret`, never a
build argument that ends up in an image layer). Read `build:cache` and test a
local `docker build` first.

Build-time values such as the canonical site URL are baked into the image. The
`production` image uses the CI defaults, so canonical URLs and the sitemap in a
preview do not match the preview hostname. That is acceptable for design review.
Previews should also be kept out of search engines; see [Security](#security).

### Secrets

Secrets are per project, so previews running in `project-9htv9` could import
`datum-net-secrets`, the Secret used by `datum-net-gp`. Do not do that.

Create a second Secret, `datum-net-preview-secrets`, and deploy previews with
`--env-from-secret datum-net-preview-secrets`. Make it as small as the preview
needs:

- Leave out `GITHUB_PAT`, and anything else the preview does not need.
- Use a read-only Strapi token if Strapi can issue one.
- Use test reCAPTCHA keys and a non-production `MODE`.

The exact set of keys the site needs to boot is **unverified**. Find it by
starting a preview with a reduced Secret and reading the logs.

Apply the same strict validation as `deploy-datum.yml`: required keys exist, and
every value is non-empty ASCII text, with newlines allowed only for PEM keys.
Never decode with `errors="ignore"`. A corrupt value makes the instance fail with
`ConfigurationError` and block the rollout.

Create and edit the Secret from the CLI with `datumctl apply`, not with the
console form, which can store values as raw bytes.

**Alternative:** run previews in a separate Datum project, with its own Secret,
quota and service-account access. This isolates previews more strongly, but it
needs a new project, Compute enabled there, the Secret created again, and CI
access to two projects. Start with the same project and a separate Secret. Move
to a separate project if the number of previews grows or the isolation matters.

### Basic Authentication

Previews import real content and are reachable from the internet, so they must
be protected before they serve a request. The console dialog is not usable here:
the workflow has to do it. The console only creates two ordinary resources, which
can be applied from the CLI:

1. A `Secret` named `<workload>-basic-auth`, type `Opaque`, with one key
   `.htpasswd` whose value is a single line `user:{SHA}<base64 of the SHA-1 of the password>`.
2. An Envoy Gateway `SecurityPolicy` named after the workload, with
   `targetRefs` pointing at `Gateway/<workload>` and
   `spec.basicAuth.users` referencing the Secret above.

Plan:

- Store one shared credential as the environment secret `PREVIEW_BASIC_AUTH`
  (`user:password`). The workflow builds the `.htpasswd` line from it with
  `openssl`, so no hash or password is committed.
- Apply both resources with `datumctl apply -f -`, reading from a temporary file
  with mode `600` that the workflow removes. Mask the password in the logs.
- The Gateway exists only after the workload is created. Apply the policy right
  after the first `deploy`, and verify before announcing the URL.
- Auth must be confirmed, not assumed. See the fail-closed rule below.

**Unverified:** whether a Gateway created by a deploy enforces a policy built from
this manifest, how long that takes, and whether the `{SHA}` format is accepted
exactly as written. The first experiment in the verification plan settles it.

Known limits of Basic Authentication here, from the manual test:

- It covers the whole load balancer. `/livez`, `/readyz` and webhooks get `401`
  from the public URL. This does not make the backend unhealthy, because the
  platform checks health internally.
- Never register a preview URL as a webhook target.

### Fail closed

A preview must not stay reachable without authentication. The workflow:

1. Applies basic auth as part of the deploy.
2. Requests the URL without credentials and expects `401`.
3. Requests it with the credentials and expects `200` (retry for several
   minutes: DNS and the edge can lag a new or replaced instance).
4. If step 1, 2 or 3 fails, **destroys the workload** and fails the job.

If a job is cancelled between creating the workload and applying auth, the
workload could stay public. Mitigate it by applying auth in the same step as the
deploy, as early as possible, and by scheduling a periodic check that lists
preview workloads and reports any that answer `200` without credentials.

### Cleanup

Each preview is an instance that runs until removed.

- Manual cleanup workflow: input is the branch (or workload name); it runs
  `datumctl compute destroy datum-net-<slug> --yes` and removes the
  `<workload>-basic-auth` Secret and the `SecurityPolicy`.
- **Unverified:** whether `compute destroy` also deletes the Secret and the
  `SecurityPolicy`. The manual test showed that `destroy` leaves the app's Secret
  in place. Assume it does not delete them, delete them explicitly, and confirm
  during the verification plan.
- A `list` helper (for example a workflow summary that runs
  `datumctl get workloads`) shows which previews exist and how old they are.
- Later: destroy automatically when the pull request closes or the branch is
  deleted, and delete preview images from GHCR after a retention period.
- **Open question:** whether a workload can run with `min` replicas `0` to pause
  an idle preview (`datumctl compute scale`). If it can, previews could scale to
  zero instead of being destroyed. Check the flags before relying on it.

Never run cleanup against `datum-net-gp`. The cleanup workflow must refuse that
name and any name that does not start with the preview prefix.

### Workflows

Two new workflows, separate from `deploy-datum.yml`:

| Workflow              | Trigger             | Inputs                                                         |
| --------------------- | ------------------- | -------------------------------------------------------------- |
| `preview-datum.yml`   | `workflow_dispatch` | `branch` (default: the ref the run was started on), `location` |
| `preview-cleanup.yml` | `workflow_dispatch` | `branch`                                                       |

Both:

- Use the GitHub environment `datum-compute` (or a dedicated
  `datum-compute-preview` environment, so required reviewers can be added) and
  the same service account secret `DATUM_SA_CREDENTIALS`.
- Pin `datumctl` and the `compute` plugin to the versions used in
  `deploy-datum.yml`.
- Use `concurrency: group: datum-compute-preview-<slug>` with
  `cancel-in-progress: false`, so two runs for one branch do not race, and runs
  for different branches do not block each other.
- Declare minimal `permissions` (`contents: read`, plus `packages: write` for the
  build job only).
- Write the URL, image tag, workload name and branch to the job summary.

Run the workflow from the branch you want to preview. `workflow_dispatch` runs
the workflow file from the selected ref, so a branch can change the workflow
itself. Treat the workflow as trusted code: only people with write access can run
it, and the deploy credentials live in an environment.

## Security

- **Public by default, so auth first.** A new workload is reachable immediately.
  The fail-closed rule above is the main control.
- **Shared project credentials.** The service account can create and destroy any
  workload in the project, including `datum-net-gp`. The workflows protect it
  only with name checks. A separate preview project, with its own service
  account, removes that risk (see [Secrets](#secrets)).
- **Secrets.** Previews use a reduced Secret, not the Secret of the `main`
  workload. Never print values; print key names only.
- **Search engines.** A preview must not be indexed. Basic auth already blocks
  crawlers. Also check whether the site sends `X-Robots-Tag: noindex` or a
  `noindex` meta tag when `MODE` is not production, and add one if it does not.
- **Forks.** Do not run previews for forks. Secrets are not available to them,
  and they would run untrusted code with deploy credentials.
- **Credentials in the build.** If the build needs a Strapi token, pass it with
  `--secret`, not `--build-arg`.

## Cost and quota

Each preview runs one `d1-standard-2` instance (1 vCPU, 2048 MiB) until it is
removed. The project allows far more (1000 workloads, 100 instances), so quota is
not a limit, but unused previews are a cost. The cleanup workflow and the list
helper are part of the first version for that reason.

## Verification plan

Run these before writing the workflows. Use a temporary workload with a
throwaway name in `project-9htv9`, and do not touch `datum-net-gp`.

1. **Basic auth from the CLI.**
   Deploy a temporary workload. Create the `.htpasswd` Secret and the
   `SecurityPolicy` with `datumctl apply`. Request the URL without credentials
   (expect `401`) and with them (expect `200`). Measure how long enforcement
   takes after the policy is applied.
2. **Failure mode.** Apply a wrong hash and confirm the request is rejected, not
   open.
3. **Destroy behavior.** Destroy the workload and check whether the Secret and the
   `SecurityPolicy` remain.
4. **Name limits.** Deploy with a deliberately long name and record the maximum
   length the API accepts.
5. **Restart.** Change the preview Secret, run `datumctl compute restart`, and
   confirm the instance reads the new value. If it does, it replaces the
   marker-env-var trick in `deploy-datum.yml` (`DEPLOY_REV`).
6. **Scale to zero.** Check `datumctl compute scale --help`. If a minimum of `0`
   is allowed, test pausing and resuming a preview.
7. **Reduced Secret.** Start the image with the reduced preview Secret and note
   which keys the site needs to boot.
8. **Build.** Run a local `docker build --target production` and check whether
   `build:cache` needs Strapi. Decide how to pass any token.
9. **Package access.** Check that the repository has the **Write** role on the
   `datum-net` package and that a test push with the job token works.

## Rollout

1. Run the verification plan and update this document with the results.
2. Add `preview-datum.yml` with build, deploy, basic auth, the fail-closed check
   and the job summary.
3. Add `preview-cleanup.yml` and a list helper.
4. Try it on one real feature branch, then clean it up.
5. Later, optionally: automatic cleanup when a pull request closes, pull request
   comments with the URL, deletion of old preview images, and a periodic public
   exposure check.

## Open questions

- Does the `production` build need Strapi at build time, and how should a token
  be passed?
- What is the maximum workload name length?
- Does `compute destroy` remove the basic-auth Secret and the `SecurityPolicy`?
- Can a workload scale to zero for pausing?
- Should previews live in the same project as `datum-net-gp` or in a separate
  one?
- Which keys does the site need to boot, and can the Strapi token be read-only?
- Who may run the workflow: everyone with write access, or only people approved
  through a protected environment?
- Is one shared preview password enough, or does each preview need its own?
- Should the existing `DEPLOY_REV` marker in `deploy-datum.yml` be replaced by
  `datumctl compute restart` once step 5 of the verification plan passes?
