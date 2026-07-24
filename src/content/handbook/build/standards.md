---
title: "Implementation standards"
sidebar:
  label: Implementation standards
  order: 2.5
updatedDate: Jul 24, 2026
authors: jacob
meta:
  title: "Engineering Implementation Standards - Datum Handbook"
  description: "Common standards Datum engineers follow while building — version control, code review, CI, and testing — once a design is ready to become code."
  og:
    title: "Implementation standards"
---

Implementation is the third phase of our SDLC — turning an agreed [design](/handbook/build/design) into shipped code. These are the standards that hold across our repositories, regardless of which component you're working in.

## Version control

- Work happens in a feature branch off the default branch; the [GitHub issue](/handbook/operate/using-github) it implements should already exist from planning
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, etc.) so history and changelogs stay generatable
- Keep pull requests focused on one feature or fix — a bug fix doesn't need a drive-by refactor riding along with it

## Code review

Every change to production code goes through a pull request and requires review before merging. A good review checks for:

- Does the code match the design that was agreed on, and flag it in the PR if it diverges
- Does it follow the [API design](/handbook/build/design#api-design) conventions for anything customer-facing
- Is it tested per our [testing policy](/handbook/policy/testing)
- Does documentation need to change alongside the code (this handbook, docs, or inline comments)

Reviewers are expected to respond promptly — an async, distributed team lives or dies on how quickly a PR gets unstuck.

## Continuous integration & testing

Changes that alter product functionality are tested by CI before merging, not locally and not in production — see the [testing policy](/handbook/policy/testing) for the full policy, including the incident-response exception. At minimum, CI should run type checking, linting, and the relevant automated test suite before a PR is mergeable.

A few guidelines on how we test in practice:

- **Prefer a fake over a real dependency for unit-level tests** - test controller and API server logic against an in-memory fake client rather than spinning up a live cluster. It's faster, more hermetic, and keeps the unit-test stage fast enough to run on every push.
- **Save real integration/end-to-end testing for the stage that needs it** - standing up an ephemeral cluster, deploying the built image, and running a true end-to-end suite is valuable, but it's a heavier, slower CI stage. Reserve it for the services where a fake client genuinely can't give you confidence, not as the default for every PR.
- **A skip needs a reason, and the reason should be an environment gate, not flakiness** - it's fine to skip a test that needs a prerequisite the current environment doesn't have (a missing credential, a local-only tool). It's not fine to skip a test because it's unreliable — a flaky test gets fixed or deleted, not silenced.
- **CI failures block merge, without exception carved out for "it's probably fine"** - if a check is unreliable enough that people routinely ignore it, that's a signal to fix or remove the check, not to develop a habit of overriding it.

## Control-plane services

Building a controller or an aggregated API server for a control-plane service (`milo`, `search`, `activity`, and similar) has its own set of recurring conventions — reconciler shape, finalizers, when to reach for an aggregated API server instead of a CRD. See [control plane implementation](/handbook/build/control-plane) for the details.

## Operational readiness

Implementation isn't done when the code merges — see [production readiness](/handbook/build/production-readiness). Monitoring, secrets, and rollback procedures should be designed in during implementation, not bolted on afterward. If a change has a large enough blast radius, coordinate it as a [calendar event](/handbook/build/change), not just a merged PR.
