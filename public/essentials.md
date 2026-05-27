# Datum Essentials

Batteries included. We think core cloud features are essential, not optional.

Enterprise-grade networking primitives like Authoritative DNS, Domains, Metrics Export, RBAC, SSO and audit logs - for free.

## Datum is currently in a closed beta

Our pricing is designed to create millions of connections between modern providers, their partners, and their customers. In other words, we're focused on making connections, not pushing bits.

Here's what you can expect:

- A generous hobby tier for personal use and experimentation
- A robust self-service platform for production use cases
- A curated full-service experience for a more intimate experience

If you're interested in our work and want to learn more or participate in our closed beta, we'd love to chat.

## Core Essentials (Free Forever on Builder)

- **Authoritative DNS** - Run your zones on Datum's global anycast DNS.
- **Domains** - Buy, transfer, and manage domains with API control.
- **OTel Metrics Export** - Stream platform metrics into your observability stack via OpenTelemetry.
- **Secrets** - Encrypted secret storage tied to projects and workloads.
- **Teams and RBAC** - Fine-grained access control for humans.
- **SSO** - Single sign-on for org-wide login.
- **Machine Accounts** - First-class identity for agents and automation.
- **Audit Logs** - Tamper-evident record of who did what, when.

## Why "essentials" matter

Most cloud providers gate the basics - DNS, RBAC, SSO, audit logs - behind enterprise tiers. Datum treats them as table stakes. If you can't observe, secure, and govern your infrastructure on day one, you can't ship on day two.

## Get started

- [Pricing](/pricing/) - Builder ($0), Scaler ($20/mo + usage), Provider (custom)
- [Features](/features/) - The full feature set
- [Documentation](/docs/) - Quickstart and API reference

## Frequently asked questions

### How mature is Datum Cloud?

Datum is an early stage company, and our product is evolving steadily to include more core features (additional Connectors, Galactic VPC, Compute, etc.) as well as platform features that support enterprise readiness and operational scale.

### Why is Datum currently free?

Offering a "forever free" service tier is super important to us. As we mature our product, we plan to enable all possible features in the free tier and provide reasonable usage limits. Through this coming year we will introduce a paid plan with an SLA, as well as other deployment models.

### What are Datum's planned deployment models?

We currently offer a public cloud model (multi-tenant at the control plane and network level) as well as open source. This year, pending demand from design partners, we plan to introduce a managed cloud offering (single tenant control plane) and a BYOC model.

### How does Datum Cloud compare?

We've positioned our product as an open, AI-native network cloud. Practically speaking, we offer features that mirror aspects of the large public clouds and CDNs: an edge proxy, a reverse tunnel, DNS, global reach, a high performance backbone. Aside from being built fresh in 2025, what sets us apart is our target customer (we're solely focused on modern alt cloud providers) and our open, neutral strategy.

### What are the "internet superpowers" Datum talks about?

The world's biggest companies and clouds take advantage of traditional internet networking capabilities like peering, interconnection, and deterministic routing. By building out a global physical network and backbone, they understand and control the flow of their traffic, improve performance, lower costs, comply with regulation, and participate with an ecosystem of networks. Our mission is to make these superpowers available to every agent, developer and builder.

### What is Datum's relationship with Kubernetes?

Datum's control plane is built on Kubernetes Custom Resource Definitions (CRDs). You don't have to use k8s to use Datum Cloud, but it will feel natural if you do. An important benefit is the deep familiarity LLMs already have with the Kubernetes codebase, which makes the agent and CLI experience more seamless and accurate.

### How is Datum's infrastructure structured?

Datum deploys infrastructure in the top internet aggregation points globally. These points of presence (PoPs) are packaged into Regions and Availability Zones (AZs). Each Region represents a specific geographic and network boundary, while each AZ provides independent capacity within that Region. Region naming follows a country-anchored format: two-letter ISO country code, a cardinal direction (north/south/east/west/central), and a region index. AZs are identified by a, b, c, etc.

---

Source: <https://www.datum.net/essentials/>
