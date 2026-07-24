---
title: "Control plane implementation"
sidebar:
  label: Control plane implementation
  order: 2.6
updatedDate: Jul 24, 2026
authors: jacob
meta:
  title: "Controller & Aggregated API Server Patterns - Datum Handbook"
  description: "How Datum's control-plane services implement controllers and aggregated API servers — conventions for reconcilers, finalizers, and when to reach for a custom API server."
  og:
    title: "Control plane implementation"
---

This is a detail page under [implementation standards](/handbook/build/standards) — the general standards there (version control, code review, CI) apply here too. This page is specifically about how our control-plane services (`milo`, `search`, `activity`, and similar) implement two recurring building blocks: controllers and aggregated API servers.

## Controllers

Reach for a controller when something needs to continuously enforce a desired state rather than just respond to a single request — the resource can drift, depends on other resources changing over time, or needs cleanup logic that has to run reliably before it's deleted. If a request comes in, you do the work, and you return a result, that's a normal API handler — it doesn't need a controller. The signal for "this needs a controller" is ongoing reconciliation, not a one-off action.

Every controller we build follows the same reconciler shape: one handler per resource that gets called whenever that resource (or something it watches) changes, rather than a service polling in a loop. A few conventions hold consistently across our control-plane services:

- **Finalizers for cleanup** - cleanup-before-delete logic is registered as a finalizer, not handled as a special case inline
- **Status via conditions** - resources report state through a set of conditions (a `Ready` condition plus resource-specific ones), not a single status enum
- **Idempotent, requeue-driven reconciliation** - check current state, then create/update as needed, and requeue transient failures rather than hand-rolling retry loops
- **Watch dependencies directly** - when a resource depends on state in another cluster or service, wire a watch against it instead of polling

One pattern worth calling out: when the "real work" behind a resource is high-throughput (e.g. indexing, streaming), it's common to split it in two — a lightweight reconciler that only manages the resource's lifecycle and policy, plus a separate event-driven worker that does the actual work. Don't cram high-throughput processing into a reconcile loop.

## Aggregated API servers

A CRD registered against the existing API server is the default — reach for it first. A custom, aggregated API server is worth the extra machinery specifically when a resource **can't be modeled as etcd-backed CRUD** — for example, a resource that represents a live query against another data store and returns a computed, non-persisted result rather than something we create and store.

Within an aggregated API server, only the resources that actually need custom behavior should get hand-written storage — anything that persists normally can still use conventional storage underneath. Going the aggregated route doesn't mean every resource inside it has to be special-cased.

## What to expect once you build one

These carry different bars, because they aren't the same kind of commitment:

- **An aggregated API server is a new API almost by definition**, which means it automatically meets the [design](/handbook/build/design) page's bar for a written design — and because customers or other services will build against its shape, get the [API design](/handbook/build/design#api-design) right before it ships, since changing it later is a breaking change.
- **A controller isn't automatically a new API** - it's often reconciling a resource that already exists. Whether it needs a written design follows the ordinary rule: does it touch more than one component, is it hard to reverse, is the service Tier 1 or higher. Plenty of controllers are small and don't clear that bar.
- **Both need a [service tier](/handbook/build/service-tiers) and matching [production readiness](/handbook/build/production-readiness) once they're running against production** - a controller that misbehaves can silently drift or delete customer resources just as easily as a bad API response, so "it's just a controller, not an API" isn't a reason to skip monitoring and alerting.
- **Both need an owner on the hook long-term** - someone needs to be on the [on-call](/handbook/build/oncall) rotation for it and keep maintaining it as the platform evolves, whichever one it is.

If you're standing up a new control-plane service and think you need one of these, talk to the team first — it's a bigger commitment than a CRD, and there's precedent to build from rather than starting from scratch.
