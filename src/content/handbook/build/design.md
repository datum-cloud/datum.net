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

We keep design lightweight and proportional to blast radius. Not every enhancement needs a formal document — a comment thread on the GitHub issue is often enough. A design doc earns its keep when a change:

- Touches more than one [component](/handbook/build/components) (infrastructure, platform, backend, or software)
- Introduces a new API, resource type, or external dependency
- Has a [service tier](/handbook/build/service-tiers) of Tier 1 or higher
- Is hard to reverse once shipped

When a design doc is warranted, it lives as a comment or linked document on the GitHub issue from planning — not a separate system. At minimum it should cover the problem being solved, the approach, alternatives considered and why they were rejected, and the operational cost (what it takes to run and monitor once shipped — see [production readiness](/handbook/build/production-readiness)).

Get eyes on the design before writing code. It's much cheaper to argue about an approach on paper than to unwind it after a PR is half-merged.

## API design

Datum's [backend](/handbook/build/components) and control plane are built around a declarative, resource-oriented model — closer to the Kubernetes API style than a traditional CRUD REST API. That shapes how we think about any new API surface, whether it's exposed by [Milo](/handbook/product/milo) or the broader platform:

- **Resources, not actions** - Model the thing being managed (a connection, a quota, a domain) as a resource with a desired state, rather than a collection of imperative endpoints
- **Backward compatibility by default** - Existing fields and behavior shouldn't break for existing customers; new capabilities are additive or versioned
- **Consistent with what's already there** - A new resource type should look and feel like the ones customers already use, not introduce a one-off convention
- **AX and DX before UX** - Per our [product values](/handbook/product/index#product-values), design the agent and developer surface (API, SDK, `datumctl`) first; the portal UI is a consumer of the same API, not a special case

As with system design, the level of rigor should match the size of the surface. A small internal endpoint doesn't need the same scrutiny as a customer-facing resource type that we'll be supporting for years.
