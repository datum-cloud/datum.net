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

Every controller we build is a `controller-runtime` reconciler: one `Reconciler` struct per resource, with a `SetupWithManager(mgr ctrl.Manager) error` that wires it up via `ctrl.NewControllerManagedBy(mgr).For(&Type{}).Complete(r)`. The conventions that show up consistently across `milo`, `search`, and `activity`:

- **Finalizers for cleanup** - register cleanup logic with `controllerutil.AddFinalizer`/`RemoveFinalizer` (or the newer `controller-runtime` finalizer registry) rather than handling deletion as a special case inline
- **Status via conditions** - use `metav1.Condition` and `apimeta.SetStatusCondition` (a `Ready` condition plus resource-specific ones), not a single status enum
- **Idempotent, requeue-driven reconciliation** - Get → check → Create/Update, and requeue transient failures with `ctrl.Result{RequeueAfter: ...}` instead of hand-rolled retry loops
- **Cross-cluster watches when a resource depends on another cluster's state** - wire a `WatchesRawSource` against the other cluster's cache rather than polling

`milo/internal/controllers/resourcemanager/project_controller.go` is the clearest example of all four conventions together (finalizer, cross-cluster reconcile via `sigs.k8s.io/multicluster-runtime`, status conditions, `SetupWithManager`), with its design documented at `milo/docs/architecture/controllers/project-controller/README.md`. `search/internal/controllers/policy/policy_controller.go` shows the same shape applied to a lighter-weight case — a policy reconciler that only manages lifecycle, while the actual work (indexing) runs as a separate NATS-driven worker rather than inside the reconcile loop. That split — a `controller-runtime` reconciler for lifecycle/policy, plus an event-driven worker for the hot path — is worth copying whenever the "real work" is too high-throughput to live comfortably inside a reconcile loop.

Leader election is one place `milo` diverges from `search`/`activity`: `milo`'s controller-manager is a close fork of upstream `kube-controller-manager` and uses `client-go`'s leader election directly (`milo/cmd/milo/controller-manager/controllermanager.go`), while `search` and `activity` use the simpler `EnableLeaderElection` flag built into a plain `controller-runtime` manager. Default to the plain manager flag unless you have milo's reasons (multiple cooperating controller processes) to do otherwise.

## Aggregated API servers

A CRD registered against the existing API server is the default — reach for it first. An aggregated API server (`k8s.io/apiserver`'s `genericapiserver`) is worth the extra machinery specifically when a resource **can't be modeled as etcd-backed CRUD**: `activity`'s `AuditLogQuery` is the clearest real example — it executes a query against ClickHouse and returns a computed, non-persisted result, which a CRD's create-and-store model can't express.

When an aggregated API server is warranted, `search/internal/apiserver/apiserver.go` and `activity/internal/apiserver/apiserver.go` are the two reference implementations to copy from — both follow the standard `k8s.io/sample-apiserver` shape:

- A package-level `Scheme`/`Codecs`, with an `init()` that installs versioned and internal types
- An `ExtraConfig` struct for service-specific dependencies (search's Meilisearch client, activity's ClickHouse/NATS config)
- `Config{GenericConfig, ExtraConfig}` → `Complete()` → `CompletedConfig` (the "completed config" idiom, not a bare struct)
- `New()` calling `GenericConfig.New(...)`, building `map[string]rest.Storage` per API group/version, and `InstallAPIGroup(...)`
- Registration under a service-owned group (e.g. `search.miloapis.com/v1alpha1`), proxied in via an `APIService`

Storage within an aggregated API server can still be conventional etcd-backed REST storage for resources that do persist (`activity`'s `ActivityPolicy`, `search`'s `ResourceIndexPolicy`) — going the aggregated-API-server route doesn't mean every resource inside it has to be custom. Only hand-write storage for the resources that actually need it.

`milo` is the exception, not the model to start from: its API server chains `apiextensions-apiserver` (CRDs) → the vendored upstream `controlplane` apiserver → `kube-aggregator` (`milo/cmd/milo/apiserver/server.go`) — it's effectively a customized Kubernetes control-plane binary, built to host every other service's CRDs and aggregated APIs, not a pattern to re-derive for a new service.

There's no shared Milo scaffold or code generator behind any of this — `search` and `activity` don't depend on `milo` or on each other; each hand-wires the same upstream idiom independently. If you're standing up a new control-plane service, start from whichever of `search` or `activity`'s `apiserver.go` is closer to your resource shape (persisted-but-custom vs. computed-and-ephemeral) rather than starting from scratch.
