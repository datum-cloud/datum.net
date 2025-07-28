---
title: Architecture
weight: 2
description: Key concepts for working with the Datum Cloud.
---

## The Datum Control Plane

The Datum Operator is implemented upon Kubernetes Custom Resource Definitions
(CRDs) to provide abstracted, yet orchestrated, functionality across Hyperscale
Cloud Providers, Network as a Service Operators, Edge Clouds (including our
own), and infrastructure under your management and control.

By implementing an operator based on top of Kubernetes CRDs, we leverage common
patterns familiar to developers, SREs, and Platform Engineers. Using the Datum
Operator, you describe your desired system state through manifests, and the
Datum Operator will deploy and continuously validate global operational state
against that manifest.

Datum (will) supports bi-directional control plane federation, from the Datum
Cloud to 1st or 3rd party compute platforms so that you can bring Datum anywhere
you need it. At this point in time, Datum supports compute resources backed by
GCP and network resources from our own Edge Cloud.

## Key Components

### Datum Workloads

Datum Workloads are where the magic of Datum happens. Workloads are defined
using Kubernetes Manifests. Workloads can be Virtual Machines or Containers,
that are deployed as collections of instances across the Locations you define
with "Superpowers" delivered through Datum Cloud Networks (more on both topics
below). The Datum Operator is responsible for taking your workload manifest
definition, and ensuring its running state across Locations and Networks.

### Datum Locations

Datum Locations are used to define available resources from Hyperscale Cloud
Providers, Network as a Service Operators, Edge Clouds (including our own), and
infrastructure under your management and control. Use locations to define
available infrastructure for consumption by workloads.

### Datum Networks

Datum Networks are "galactic VPCs" that can span among Hyperscale Cloud
Providers, Network as a Service Operators, Edge Clouds (including our own), and
infrastructure under your management and control. Datum Cloud networks are
virtualized and can be created for your simple convenience, logical organization
needs, and operational security / segmentation concerns. Datum Cloud Networks
are programatically organized and applied throughout the system to reduce
operator cognitive load. Datum Networks are designed to provide rich
observability and telemetry capabilities.
