---
title: "Production readiness"
sidebar:
  label: Production readiness
  order: 4
updatedDate: May 4, 2026
authors: jacob
meta:
  title: "Production Readiness - Datum Handbook"
  description: "How Datum thinks about getting services production-ready — a graduated approach that values shipping and learning over checklists and gates."
  og:
    title: "Production readiness"
---

Production is where code meets reality. No pre-production environment fully replicates it, and no amount of upfront design eliminates its surprises. Getting a service in front of real conditions — with a limited blast radius — is often the only way to learn what actually matters.

Production readiness is not a gate. It's a shared, honest picture of where a service stands, so the team can make informed decisions about risk, prioritize the right improvements, and avoid being blindsided during an incident.

## A graduated scale

Services are always imperfect. What we ask of them should reflect where they are in their lifecycle and how critical they are to customers. We use three levels:

- **Minimum** — The baseline for any service in production. Things like basic alerting, troubleshooting documentation, access for on-call engineers, and a deployment runbook. These aren't optional: if something is missing here, it's a blocker.
- **Moderate** — Highly recommended but not strictly required to launch. Automated testing, disaster recovery documentation, health checks, load testing, and structured logging. Most production services should reach this level over time.
- **High** — The bar for our most critical services. Autoscaling, full non-production test environments, formal SLIs, and a public status page. [Tier 0 and Tier 1 services](/handbook/build/service-tiers) should aim here.

The right level for a service follows from its [tier](/handbook/build/service-tiers). Don't apply Tier 0 standards to an internal utility that a handful of engineers use. Do apply them to anything that touches every customer.

## Start early

It's tempting to treat operational concerns as the last 10% of a project — something to sort out after the "real" engineering is done. In practice, that last 10% often takes longer than the first 90%. Monitoring, secrets management, access controls, and rollback procedures are much easier to design in than bolt on.

Start a readiness review at the beginning of a project, not the end. Use it to surface constraints early, identify missing data, and make sure the team has considered the full lifecycle of the service — not just the happy path.

## Monitoring & observability

This is the operational half of the monitoring phase — the other half is [listening to customers](/handbook/product/customers#listening-to-customers). Both close the loop back into [planning](/handbook/product/roadmap).

We think about observability as five pillars, roughly in order of how early you need them:

- **Metrics** - Services export [OpenTelemetry](https://opentelemetry.io/) metrics to Grafana Cloud. This is the baseline: request rates, error rates, latency, and resource usage for anything running in production.
- **Logs** - Structured, not free text, so they're queryable and correlate cleanly with the request or resource that produced them. Structured logging is a Moderate-tier expectation above.
- **Traces** - Exported alongside metrics via OTel, giving us a request's path across services. Most valuable for anything that crosses the control plane / backend (Milo) boundary, where a single customer action touches multiple components.
- **Alerts** - Defined against the metrics that matter for a service's tier, routed through PagerDuty. An alert without an on-call owner isn't an alert, it's noise — see [on-call](/handbook/build/oncall).
- **Dashboards** - Built in Grafana from the same metrics and traces. A dashboard's job is to answer "is this healthy right now?" at a glance, not to be an archive of every number we could possibly graph.

The same graduated scale applies here as everywhere else in this page: Minimum means basic alerting and no dashboard is required; Moderate adds structured logging and a working dashboard; High means full tracing and a public status page. Don't build out all five pillars for an internal tool nobody's paging on.

### Dashboards are code

Dashboards are generated from committed source (Jsonnet/Grafonnet), never hand-built by clicking around in the Grafana UI. That means:

- A dashboard change is a pull request, reviewed like any other change, not a silent edit that only lives in Grafana's own history
- CI regenerates dashboards from source and fails the build if the generated output has drifted from what's committed — the UI is a rendering of the source, not the source of truth
- A dashboard is owned by the same team that owns the service it covers, and gets updated as part of any change that adds, removes, or renames what it monitors — a dashboard that still graphs a metric that no longer exists is worse than no dashboard, because it looks like signal

We don't yet have a shared, reusable "golden signals" dashboard template — most dashboards today assemble their own latency/traffic/error panels from scratch. Building one and having every new service start from it, rather than writing its panels from first principles, would remove a lot of duplicated effort and inconsistency; that's an open gap worth closing rather than a solved problem.

### Monitoring a rollout

Shipping a change and watching a dashboard *afterward* is too late to catch most regressions cheaply. For anything that follows the [calendar event](/handbook/build/change) process, plan to actively watch the relevant dashboard during and immediately after the change — not just rely on alerts to page you if something goes wrong:

- Know which panel you'd expect to move, and by roughly how much, before you make the change — "we'll watch p99 latency and error rate on this dashboard for the next 30 minutes" is a plan; "we'll keep an eye on things" is not
- Prefer rolling a change out gradually (a canary, a percentage of traffic, one region first) over an all-at-once deploy whenever the blast radius justifies it, so a regression shows up against a small slice of traffic instead of all of it at once
- Decide the rollback trigger *before* the rollout, not while it's happening — a specific threshold or condition that means "stop and roll back," agreed on ahead of time, is much easier to act on under pressure than a judgment call made live incident-style

## When you can't check every box

Sometimes business needs require shipping before every box is checked. That's a real and acceptable decision. What matters is that the team has made it deliberately, documented the gaps, and committed to addressing them.

An incomplete review that's honest about its gaps is far more useful than no review at all. It tells the next engineer — or next on-call shift — exactly what they're working with, and why. That context is what prevents incidents from repeating.
