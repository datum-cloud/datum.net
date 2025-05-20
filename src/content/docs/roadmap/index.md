---
title: Roadmap
description: Roadmap for Datum.
weight: 1
---

In the near future we plan to launch an interactive roadmap that allows users to
suggest ideas, comment on existing ones, and better understand OSS vs platform
features. In the meantime, here is a run down of what we're working on, and
what's on deck.

## Recently Completed
- Add UI screens for Secrets Management, Edge Envoy Gateways, Authoritatie DNS, and Telemetry Export
- Edge Envoy Gateways and DNS supports custom domain names (please contact us in Slack to have your domain added to allowlists)
- Integrate Vultr as a 2nd Anycast Provider


## In Progress
- Ship Organization setup workflow:
  - Create new organizations and invite team members
  - Manage user access to organizations and projects through IAM policies
  - Support service accounts for machine-to-machine authentication
- Audit logs available for all platform operations
- Define and refine Galactic VPC Networks
  - Proof of Concepts built around Segment Routing SRv6
- Mature our "Bring Your Own Cloud" (BYOC) [infrastructure provider](https://link.datum.net/gcp-provider)
  - Define requirements for BYOC Providers
  - Integrate a conformance testing suite
  - Baseline documentation requirements
  - Work with community to deliver AWS provider
- Integration of HickoryDNS (a Rust-based DNS server) as an diverse service daemon to KnotDNS
- Service Metering and Quota Management

## On Deck
- Define and refine Edge Compute Containers
