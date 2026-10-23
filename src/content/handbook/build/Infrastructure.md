---
title: Infrastructure
sidebar:
  label: Infrastructure
  order: 2
updatedDate: Nov 13, 2025
authors: jacob
meta:
  title: "Global Infrastructure Footprint - Datum Handbook"
  description: "Datum is available in 17+ global locations. This article is focused on how we think about our global infrastructure footprint."
  og:
    title: "Infrastructure"
---

Right now we’re deploying in what we call the “football cities of the internet” — the two dozen or so locations where the vast majority of internet traffic terminates, where private networks (such as financials, entertainment, enterprises) exchange traffic, and where you get onramp or offramp to the major cloud.

Note: this article is focused on how we think about our infrastructure footprint from a location and naming perspective.

In hyperscale clouds there is a strong sense of design around physical locations or collections of those locations into availability zones (AZs), which define redundancy and latency boundaries and inform technical design considerations. AZs are then grouped into Regions, typically organized by geography or legal jurisdiction — essentially where and how to do business.

Serverless platforms often take the opposite approach, abstracting location entirely behind a “one big global region” model. While this simplifies operations, it removes choice and control from customers who need to manage data sovereignty, latency, meet specific providers or enact choice in diversity of deployment.

Most customers select regions based on proximity, data sovereignty, and legal requirements, then design for high availability and fault tolerance by deploying workloads across multiple AZs within a region. More sophisticated users extend this strategy further, using multi cloud or multi region architectures to achieve resilience and compliance. Datum builds on these principles while mapping to physical and regulatory realities.

In short: every region represents a tangible place, governed by measurable latency and real world policy — not an abstraction.

For the naming convention, the current list of regions, and how to check what's available to your project, see [Locations](https://www.datum.net/docs/platform/locations) in the docs.