---
title: "Service tiers"
sidebar:
  label: Service tiers
  order: 6
updatedDate: May 4, 2026
authors: jacob
meta:
  title: "Service Tiers - Datum Handbook"
  description: "How Datum classifies services by criticality — and why that shared language matters for reliability, incident response, and engineering decisions."
  og:
    title: "Service tiers"
---

Not all services carry the same weight. A utility tool used by a handful of engineers is a different thing from the network data plane that every customer depends on. We make that difference explicit.

A **service tier** is a label we attach to a service that indicates how critical it is to our business and to the support we owe our customers. This simple framework creates a shared language for business risk — one that lets engineers, operators, product, and leadership all reason from the same map when deciding where to direct attention.

## The tiers

- **Tier 0** — The most critical. Existential business risk. Every product depends on it in some way, and more than 99% of customers are affected by an outage. Examples: network data plane, authorization, storage.
- **Tier 1** — Almost as critical as Tier 0, but some services can keep functioning without it. Most customers are still meaningfully affected. Examples: authentication, control plane, APIs, monitoring.
- **Tier 2** — Extremely important for operations, but limited direct customer impact. Examples: support tooling, most CI/CD infrastructure.
- **Tier 3** — Important, but won't meaningfully impact the business if it's down for a day. Examples: internal developer utilities, experimental services, anything not yet through a formal readiness review.

## Why it matters

The tier tells you how much weight an incident carries before you even look at the alert. It shapes how we respond, how urgently, and at what hour. A Tier 0 outage means everyone's focused; a Tier 3 issue can wait until morning.

Tiers also shape engineering standards. Tier 0 services carry the highest bar: documented and tested disaster recovery procedures, clear stakeholder ownership, and contingency plans for any of their own dependencies. As tiers decrease, so do the requirements — deliberately. Applying Tier 0 standards everywhere is how teams burn out maintaining things that don't need it.

## Dependencies

It's expected that lower-tier services depend on higher-tier ones — and that they go down when those higher-tier services do. We don't require contingency plans in that direction.

The reverse, however, is different. If a Tier 0 service depends on something in a lower tier, it needs a contingency plan — or that dependency effectively becomes Tier 0 by necessity. This discipline keeps our list of Tier 0 services small, which is the goal. The smaller that list, the more focused our operational attention and the more resilient our systems become.
