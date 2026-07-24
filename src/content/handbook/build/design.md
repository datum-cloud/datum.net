---
title: "Design"
sidebar:
  label: Design
  order: 1.5
updatedDate: Jul 24, 2026
authors: jacob
meta:
  title: "System & API Design at Datum - Datum Handbook"
  description: "How Datum approaches system design and API design once an enhancement is planned — lightweight design docs, and a declarative, control-plane-first approach to APIs."
  og:
    title: "Design"
---

Design is the second phase of our SDLC, sitting between [planning](/handbook/product/roadmap) and [implementation](/handbook/build/standards). An enhancement that's ready to be built still needs someone to work out *how* — what changes, what the interfaces look like, and what it costs us to run.

## System design

We keep design lightweight and proportional to blast radius. Not every enhancement needs a formal document — a discussion on the GitHub issue from planning is often enough. A design doc earns its keep when a change:

- Touches more than one [component](/handbook/build/components) (infrastructure, platform, backend, or software)
- Introduces a new API, resource type, or external dependency
- Has a [service tier](/handbook/build/service-tiers) of Tier 1 or higher
- Is hard to reverse once shipped

When a design doc is warranted, it's a committed document — not a GitHub issue comment — so it stays reviewable, linkable, and versioned alongside the code it describes (see [where designs actually live](#where-designs-actually-live) below). The issue from planning just links to it. At minimum it should cover the problem being solved, the approach, alternatives considered and why they were rejected, and the operational cost (what it takes to run and monitor once shipped — see [production readiness](/handbook/build/production-readiness)).

Get eyes on the design before writing code. It's much cheaper to argue about an approach on paper than to unwind it after a PR is half-merged.

### Where designs actually live

In practice we use two mechanisms, depending on scope:

- **Cross-cutting concerns** — anything spanning multiple services or systems (a shared auth model, a new cross-cutting API convention, an infra-wide change) — go through [`datum-cloud/enhancements`](https://github.com/datum-cloud/enhancements). It uses a single, Kubernetes-KEP-inspired template (Summary, Motivation with Goals/Non-Goals, Proposal, Design Details, a Production Readiness Review questionnaire, Alternatives) for everything, from a scoped product feature up to an org-wide architectural pattern — the rigor and which sections get filled out scale with how far-reaching the change is, not a different template.
- **Service-specific design** lives in that service's own repo, typically under a `docs/` directory, so it stays next to the code it describes and is versioned alongside it.

For a concrete model of what a strong in-repo `docs/` looks like, `milo-os/search` and `milo-os/activity` are worth studying. `search`'s `docs/enhancements/` folder is a lightweight local version of the KEP pattern above, and `docs/components/resource-indexer.md` is a genuinely thorough component design (sequence diagrams for every event path, a decision table, an explicit error-handling taxonomy). `activity`'s `docs/architecture/` is the stronger model for the broader documentation *program*: a single `README.md` hub that cross-links every sub-doc, a `data-model.md` with real schema and rationale, and — notably for the [monitoring phase](/handbook/build/production-readiness#monitoring--observability) — dated incident write-ups under `docs/investigations/` and alert-driven runbooks under `docs/runbooks/` (see [incidents](/handbook/build/incidents)). Neither repo is "the" template to copy verbatim, but between them they show what good looks like: rigorous decision records from `search`, and a mature, cross-linked documentation program from `activity`.

## API design

Datum's [backend](/handbook/build/components) and control plane are built around a declarative, resource-oriented model — closer to the Kubernetes API style than a traditional CRUD REST API. That shapes how we think about any new API surface, whether it's exposed by [Milo](/handbook/product/milo) or the broader platform:

- **Resources, not actions** - Model the thing being managed (a connection, a quota, a domain) as a resource with a desired state, rather than a collection of imperative endpoints
- **Design for intent, not mechanism** - A resource should capture *what* the consumer wants to achieve, not the specific steps we currently take to get there. "Give me a database with these characteristics" is an intent; "create this exact set of low-level primitives" is a mechanism leaking through the API. Intent-based resources are what let us change how something is implemented underneath without breaking everyone who built against it
- **Backward compatibility by default** - Existing fields and behavior shouldn't break for existing customers; new capabilities are additive or versioned (see [deprecation policy](#deprecation-policy) below for what this means in practice)
- **Consistent with what's already there** - A new resource type should look and feel like the ones customers already use, not introduce a one-off convention
- **AX and DX before UX** - Per our [product values](/handbook/product/index#product-values), design the agent and developer surface (API, SDK, `datumctl`) first; the portal UI is a consumer of the same API, not a special case

A good test for intent vs. mechanism: if the implementation underneath a resource changed completely, would consumers need to change anything about how they use it? If yes, some mechanism has leaked into the API and it's worth another look before it ships.

### Status conventions

Every resource's status should be reportable in a shape a consumer (or another service) can act on programmatically, not just read:

- **A standard condition shape** - each condition carries a `type`, `status`, `reason`, `message`, and `lastTransitionTime`, so any consumer can parse any resource's health the same way instead of learning a bespoke status format per resource type
- **`observedGeneration`** - status should report which version of the spec it was computed against, so a consumer can tell "the controller has processed my latest change" apart from "the controller just hasn't gotten to it yet" — without guessing from timestamps

### Deprecation policy

"Backward compatible by default" needs a concrete rule to actually hold up:

- A field or API version being removed is marked deprecated first, with a clear replacement documented, before it's ever removed
- Deprecated fields keep working for a stated minimum number of releases, not "eventually"
- Callers still using a deprecated field or version get a visible warning back from the API, not just a line in a changelog they may never read

As with system design, the level of rigor should match the size of the surface. A small internal endpoint doesn't need the same scrutiny as a customer-facing resource type that we'll be supporting for years.
