---
title: Roadmap
sidebar:
  order: 1
---

In the near future we plan to launch an interactive roadmap that allows users to
suggest ideas, comment on existing ones, and better understand OSS vs platform
features. In the meantime, here is a run down of what we're working on, and
what's on deck.

## Recently Completed
- Integration of HickoryDNS (a Rust-based DNS server) as an diverse service daemon to KnotDNS

## In Progress
- Ship Organization setup workflow:
  - Create new organizations and invite team members
  - Manage user access to organizations and projects through IAM policies
  - Support service accounts for machine-to-machine authentication
  - Simplify `datumctl` authentication workflows with a `datumctl auth login` experience
- Audit logs available for all platform operations
- Define and refine Galactic VPC Networks
  - Proof of Concepts built around Segment Routing SRv6
  - Define methodology for landing a Galactic VPC into Compute Containers
- Mature our "Bring Your Own Cloud" (BYOC) [infrastructure provider](https://link.datum.net/gcp-provider)
  - Define requirements for BYOC Providers
  - Integrate a conformance testing suite
  - Baseline documentation requirements
  - Work with community to deliver AWS provider
- Service Metering and Quota Management
- Domain Name and DNS Inventory Management

## On Deck
- Define and refine Edge Compute Containers
- Implementation of `datumctl serve` - a reverse tunneling reverse proxy service
- Definition of `datumctl connect` - a secure client to pair with `datumctl serve`

