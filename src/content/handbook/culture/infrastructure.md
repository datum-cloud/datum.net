---
title: Infrastructure
sidebar:
  label: Infrastructure
  order: 4
updatedDate: Nov 13, 2025
authors: jacob
meta:
  title: ""
  description: ""
---

## Our approach
In hyperscale clouds there is a strong sense of design around physical locations or collections of those locations into availability zones (AZs), which define redundancy and latency boundaries that inform technical design considerations. AZs are then grouped into Regions, typically organized by geography or legal jurisdiction — essentially where and how to do business.
Serverless platforms often take the opposite approach, abstracting location entirely behind a one big global region model. While this simplifies operations, it removes choice and control from customers who need to manage data sovereignty, latency, or diversity of deployment.
Most customers select regions based on proximity, data sovereignty, and legal requirements, then design for high availability and fault tolerance by deploying workloads across multiple AZs within a region. More sophisticated users extend this strategy further, using multi cloud or multi region architectures to achieve resilience and compliance.
Datum builds on these established principles while focusing on transparency, physical realism, and regulatory clarity.

## Naming design rationale
Datum’s naming model takes cues from hyperscale clouds (such as Google Cloud) while removing the ambiguity that comes from mixing continents and countries. Our goal is to create a predictable mapping between the physical network and how regions are surfaced through the control plane.
As an example, by grounding every geography in its ISO country code, we avoid the confusion found in other taxonomies that bounce between continents and nations (for example North America versus US for United States and Canadian regions). This makes export controls and data sovereignty easier to interpret and manage.
In the following example, “us-east-1a” represents the first region (1) and first availability zone (a) in the eastern United States.
<Geography>-<Location>-<Number><Count>
Example: us-east–1a

| Field | Description |
| :--- | :--- |
| Geography | Always a two letter ISO country code (for example US, DE, IN). This anchors each region to its sovereign geography, simplifying export control and compliance mapping. |
| Location | A directional indicator within the country — north, south, east, west, or central — giving coarse geographic placement for regional distribution. |
| Number | A numeric index (1, 2, 3, …) used to distinguish separate regions within the same country and location boundary when distance or latency requires. |
| Count | A lowercase letter (a, b, c, …) representing individual availability zones or independent Points of Presence (PoPs) within that region. |

## Distance and policy
Conceptually, great circle distance defines the edge of our global coverage map. When Points of Presence (PoPs) are separated by more than roughly 5ms round-trip time, a new region is created. In practice, boundaries are determined by:
* Anycast announcements, defining reach and convergence domains
* Country and regional controls, defining where data and workloads can legally operate

This model ensures:
* Predictable, compact naming across geographies
* Transparent correspondence between regions, facilities, and networks
* Easier automation and compliance enforcement
* Alignment with Datum’s core philosophy to expose the real network, not an abstraction

In short: every region represents a tangible place, governed by measurable latency and real world policy.