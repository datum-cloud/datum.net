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

## When you can't check every box

Sometimes business needs require shipping before every box is checked. That's a real and acceptable decision. What matters is that the team has made it deliberately, documented the gaps, and committed to addressing them.

An incomplete review that's honest about its gaps is far more useful than no review at all. It tells the next engineer — or next on-call shift — exactly what they're working with, and why. That context is what prevents incidents from repeating.
