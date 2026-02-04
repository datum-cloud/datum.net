---
title: "Releases"
---

This guide explains how to cut a `datumctl` release locally with GoReleaser and
how the GitHub Actions workflow publishes the official artifacts.

## Local workflow

1. **Prepare the repo**
   - Ensure `git status` is clean (GoReleaser refuses to run with dirty trees
     unless you explicitly use `--snapshot`).
   - Install the required tooling: supported Go version (see `go.mod`) and
     [GoReleaser v2](https://goreleaser.com/install/).
2. **Dry-run the release**
   - Run `goreleaser release --snapshot --clean`.  
     The `--snapshot` flag skips publishing and the `--clean` flag wipes `dist/`
     before starting.
   - The docs generation script (`scripts/generate-cli-docs.sh`) executes as part
     of the `before` hooks, producing `.generated/datumctl-cli-docs.tar.gz`. That
     tarball is registered as an extra release file, so the real release will
     upload it automatically.
3. **Tag and release**
   - Create a semver tag (e.g. `git tag v0.10.0 && git push origin v0.10.0`).
   - Run `goreleaser release --clean` if you need to publish from your machine.
     Otherwise, let CI handle publishing after you push the tag.

## CI/CD pipeline

- The workflow at `.github/workflows/release.yaml` triggers on every pushed tag.
- Steps executed on `ubuntu-latest`:
  1. Checkout the repository with full history.
  2. Install Syft (required for SBOMs) and set up the stable Go toolchain.
  3. Run `goreleaser release --clean` via `goreleaser/goreleaser-action@v6`.
- GoReleaser runs the same hooks as your local invocation, so the generated CLI
  docs tarball, archives, packages, SBOMs, and checksums are all attached to the
  GitHub release. The action uses `secrets/TAP_TOKEN` for `GITHUB_TOKEN`.

## Tips and troubleshooting

- If GoReleaser fails immediately with `dist is not empty`, remove the folder or
  keep using `--clean`.
- Network access is required for `go mod tidy` (first `before` hook); if you are
  offline use `--skip=before` for local experimentation, but re-run the full flow
  before tagging.
- After the release completes you can inspect `.generated/cli-docs/` or
  `.generated/datumctl-cli-docs.tar.gz` to verify the CLI documentation bundle.
