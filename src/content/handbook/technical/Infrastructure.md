---
title: Infrastructure
sidebar:
  label: Infrastructure
  order: 2
updatedDate: Nov 13, 2025
authors: jacob
meta:
  title: ""
  description: ""
---

Right now we’re deploying in what we call the “football cities of the internet” — the two dozen or so locations where the vast majority of internet traffic terminates, where private networks (such as financials, entertainment, enterprises) exchange traffic, and where you get onramp or offramp to the major cloud. 
Note: this article is focused on how we think about our infrastructure footprint from a location and naming perspective.

In hyperscale clouds there is a strong sense of design around physical locations or collections of those locations into availability zones (AZs), which define redundancy and latency boundaries and inform technical design considerations. AZs are then grouped into Regions, typically organized by geography or legal jurisdiction — essentially where and how to do business.
Serverless platforms often take the opposite approach, abstracting location entirely behind a “one big global region” model. While this simplifies operations, it removes choice and control from customers who need to manage data sovereignty, latency, meet specific providers or enact choice in diversity of deployment.
Most customers select regions based on proximity, data sovereignty, and legal requirements, then design for high availability and fault tolerance by deploying workloads across multiple AZs within a region. More sophisticated users extend this strategy further, using multi cloud or multi region architectures to achieve resilience and compliance. Datum builds on these principles while mapping to physical and regulatory realities. 

Our naming model takes cues from hyperscale clouds (such as Google Cloud) while removing the ambiguity that comes from mixing continents and countries. Our goal is to create a predictable mapping between the physical network and how regions are surfaced through the control plane.
As an example, by grounding every geography in its ISO-3166 two letter country code, we avoid the confusion found in other taxonomies that bounce between continents and nations (for example North America versus US for United States and Canadian regions). This makes export controls and data sovereignty easier to interpret and manage.

In the following example, “us-east-1a” represents the first region (1) and first availability zone (a) in the eastern United States.
* Example: us-east–1a
* Formula: <Geography>-<Location>-<Number><Count>

Conceptually, great circle distance defines the edge of our global coverage map. When Points of Presence (PoPs) are separated by more than roughly 5ms round-trip time, a new region is created. In practice, boundaries are determined by Anycast announcements (defining reach and convergence domains) and country or regional controls (defining where data and workloads can legally operate). This model ensures:
* Predictable, compact naming across geographies
* Transparent correspondence between regions, facilities, and networks
* Easier automation and compliance enforcement
* Alignment with Datum’s core philosophy to expose the real network, not an abstraction

In short: every region represents a tangible place, governed by measurable latency and real world policy.