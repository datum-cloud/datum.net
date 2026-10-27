# Branch previews

A branch preview runs one branch of this site on Datum Compute at its own URL,
behind a shared password, so you can review a change before it is merged. This
page explains how to use one. The design, the setup and the security notes are
in [datum-compute-previews.md](./datum-compute-previews.md).

You need write access to this repository. Previews do not run in forks.

## Start a preview

1. Push your branch to GitHub. The preview builds what is on GitHub, not what
   is on your machine.
2. Open **Actions** and select **Preview Datum Compute**.
3. Select **Run workflow** and fill in the form:

   | Field                 | Value                                            |
   | --------------------- | ------------------------------------------------ |
   | **Use workflow from** | `main`                                           |
   | **Branch to preview** | your branch, for example `feat/1806-web-updates` |
   | **project**           | leave empty                                      |
   | **location**          | leave `us-central-1`                             |

   If you leave **Branch to preview** empty, the branch selected in **Use
   workflow from** is previewed, and the workflow file of that branch runs.
   Choose `main` there so the reviewed version of the workflow runs.

4. Select **Run workflow**.

From a terminal:

```bash
gh workflow run preview-datum.yml --ref main -f branch=feat/1806-web-updates
gh run watch
```

A run takes about 5 minutes: 4 for the image build and 1 for the deploy and the
checks. It can take up to 7 minutes longer while the edge catches up with a new
instance.

## Open the preview

When the run is green, open its **Summary**. It shows the URL, for example
`https://stool-soldier-qnfjz.datumproxy.net`. The same URL appears under the
`datum-compute-preview` environment on the repository page.

The browser asks for a user name and password. Ask a maintainer for them. They
are stored in the `PREVIEW_BASIC_AUTH` secret of the `datum-compute-preview`
environment, and they are the same for every preview. Do not paste them in
issues, pull requests or chat channels that people outside the team can read.

Forms, sign-in and content in a preview use the staging services (Strapi,
reCAPTCHA, HelpScout). Do not submit real customer data.

## Update a preview

Push new commits to your branch and run the workflow again with the same
values. The workflow builds the new commit and replaces the running instance.
The URL stays the same.

- During the replacement, the preview can answer `503` for a short time.
- A run for a commit that is already deployed changes nothing.

## Remove a preview

A preview runs, and costs money, until it is removed. It is removed:

- **When you delete the branch**, for example after the pull request is merged.
  This happens automatically. Closing a pull request without deleting its
  branch keeps the preview.
- **By hand:** run **Preview Datum Compute cleanup** with **action** `destroy`
  and **branch** set to your branch.

To see which previews exist, run **Preview Datum Compute cleanup** with
**action** `list`. The table in the run summary shows each preview, when it was
created and which image it runs.

Remove previews you no longer need. The project allows 25 HTTP proxies in
total, every preview takes one, and the staging and production sites and other
workloads share the same limit.

## When a run fails

A run that fails after the deploy step **removes the preview**, so a preview is
never left online without a password. Fix the cause and run the workflow again.
A preview that is created again gets a **new URL**.

| What the run shows                                    | What to do                                                                                                        |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| The build step fails                                  | The branch does not build. Run `docker build --target production .` locally and fix the error                     |
| `PREVIEW_BASIC_AUTH must be set`                      | The password secret is missing on the `datum-compute-preview` environment. Ask a maintainer                       |
| `Secret has a bad value` or `could not read Secret`   | The `datum-net-preview-secrets` Secret in Datum Cloud is missing or has a bad value. Ask a maintainer             |
| `You've reached your quota for this resource type`    | The project is out of HTTP proxies. Remove old previews with the cleanup workflow, then run again                 |
| `expected 401 without credentials` after 2 minutes    | The password did not take effect. Run again; if it repeats, report it with a link to the run                      |
| `expected 200 with credentials` (many `503` attempts) | The site did not start or the edge has no backend. Check the instance logs, then report it with a link to the run |

To read the site's logs while a preview runs:

```bash
datumctl compute logs datum-net-<slug> --project datum-cloud --tail 100
```

The workload name is in the run summary.

## Good to know

- **One preview per branch.** The workload name comes from the branch name:
  `datum-net-`, the first 15 characters of the branch name, and a 6 character
  hash. Two branches never share a preview.
- **Logs are public.** This repository is public, so anyone can read the run
  logs and see the preview URL. The password protects the page itself.
- **Images are public.** The preview image is pushed to the public
  `ghcr.io/datum-cloud/datum-net` package. Do not preview a branch whose content
  must stay private until release.
- **Not for search engines or webhooks.** Every path, including `/livez`,
  `/readyz` and webhook endpoints, asks for the password. Never register a
  preview URL as a webhook target.
- **Canonical URLs point at the main site.** Links in the sitemap and canonical
  tags use the production host, not the preview URL.
