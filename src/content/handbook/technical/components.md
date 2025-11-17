---
title: Components
sidebar:
  label: Components
  order: 1
updatedDate: Nov 13, 2025
authors: jacob
meta:
  title: ""
  description: ""
---

There are four main components that we assemble to make Datum work for customers: infrastructure, platform, backend, cloud.

**Infrastructure** - As a self-described “open network cloud” the network and related physical infrastructure underneath our cloud this is a foundation of the value we provide. By operating a large, global multi-tenant network and associated compute infrastructure, we’re able to effectively interact with the broader internet, broker connections, and deliver packets. To match our current stage of development, we’ve decided to rent much of this capacity from global hosting providers including NetActuate, GCP and Vultr.

**Platform** - Transforming our physical infrastructure into a robust and secure platform for delivering software is the next step in the game. We use Talos Linux and a customized Kubernetes stack to orchestrate each of our PoPs across various providers. 

**Backend** - Everyone has to build a backend to store customer data, apply logic, run workflows, and stitch together services. Due to our focus on helping the next 1k thrive, we’ve decided to build our backend (Milo) in the open and share it with others. This is the brains behind our cloud, keeping track of all system of record data, enforcing permissions and quotas, brokering integrations with 3rd party services, and providing a portal interface where our entire team can collaborate. 

**Software** - Finally we get to the good stuff! This is the collection of software that allows us (and others, when using a BYOC model) to orchestrate and deliver network-focused applications, discover and broker connections, route telemetry, etc.