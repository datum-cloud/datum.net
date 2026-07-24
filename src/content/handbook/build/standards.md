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

## Continuous integration

Changes that alter product functionality are tested by CI before merging, not locally and not in production — see the [testing policy](/handbook/policy/testing) for the full policy, including the incident-response exception. At minimum, CI should run type checking, linting, and the relevant automated test suite before a PR is mergeable.

## Control-plane services

Building a controller or an aggregated API server for a control-plane service (`milo`, `search`, `activity`, and similar) has its own set of recurring conventions — reconciler shape, finalizers, when to reach for an aggregated API server instead of a CRD. See [control plane implementation](/handbook/build/control-plane) for the details.

## Operational readiness

Implementation isn't done when the code merges — see [production readiness](/handbook/build/production-readiness). Monitoring, secrets, and rollback procedures should be designed in during implementation, not bolted on afterward. If a change has a large enough blast radius, coordinate it as a [calendar event](/handbook/build/change), not just a merged PR.
