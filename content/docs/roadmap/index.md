---
title: Roadmap
description: "In the near future we plan to launch an interactive roadmap that allows users to"
weight: 1
---

In the near future we plan to launch an interactive roadmap that allows users to
suggest ideas, comment on existing ones, and better understand OSS vs platform
features. In the meantime, here is a run down of what we're working on, and
what's on deck.

## In Progress

- Mature the GCP "Bring Your Own Cloud" (BYOC) [infrastructure provider](https://link.datum.net/gcp-provider)
- Define requirements for additional BYOC Providers
- Baseline documentation improvements
- Expose UI for managing locations, networks, workloads, configs, and secrets
- Expose API and UI for creating L7 network proxy through the [Gateway API](https://gateway-api.sigs.k8s.io)

## On Deck

- Account setup and IAM:
  - Create new organizations and invite team members
  - Manage user access to organizations and projects through IAM policies
  - Support service accounts for machine-to-machine authentication
- Build a robust telemetry platform
  - Platform telemetry available for workloads
  - Platform telemetry available for networks
  - Export platform telemetry to third-parties using OpenTelemetry
  - Audit logs available for all platform operations
  - Hosted version of Grafana available for users
  - Prometheus compatible metrics endpoint
- Developer experience
  - AWS BYOC infrastructure provider
  - Integrated docs, guides, API reference, roadmap and changelog
  - Revised website structure and messaging
