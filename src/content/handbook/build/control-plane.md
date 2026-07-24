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

Every controller we build follows the same reconciler shape: one handler per resource that gets called whenever that resource (or something it watches) changes, rather than a service polling in a loop. A few conventions hold consistently across our control-plane services:

- **Finalizers for cleanup** - cleanup-before-delete logic is registered as a finalizer, not handled as a special case inline
- **Status via conditions** - resources report state through a set of conditions (a `Ready` condition plus resource-specific ones), not a single status enum
- **Idempotent, requeue-driven reconciliation** - check current state, then create/update as needed, and requeue transient failures rather than hand-rolling retry loops
- **Watch dependencies directly** - when a resource depends on state in another cluster or service, wire a watch against it instead of polling

One pattern worth calling out: when the "real work" behind a resource is high-throughput (e.g. indexing, streaming), it's common to split it in two — a lightweight reconciler that only manages the resource's lifecycle and policy, plus a separate event-driven worker that does the actual work. Don't cram high-throughput processing into a reconcile loop.

## Aggregated API servers

A CRD registered against the existing API server is the default — reach for it first. A custom, aggregated API server is worth the extra machinery specifically when a resource **can't be modeled as etcd-backed CRUD** — for example, a resource that represents a live query against another data store and returns a computed, non-persisted result rather than something we create and store.

Within an aggregated API server, only the resources that actually need custom behavior should get hand-written storage — anything that persists normally can still use conventional storage underneath. Going the aggregated route doesn't mean every resource inside it has to be special-cased.

If you're standing up a new control-plane service and think you need this, talk to the team first — it's a bigger commitment than a CRD, and there's precedent to build from rather than starting from scratch.
