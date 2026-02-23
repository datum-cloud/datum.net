---
title: "Product vision, values, and rituals"
sidebar:
  label: Overview
  order: 0
updatedDate: Feb 15, 2026
authors: jacob
meta:
  title: "Datum's Product Strategy - Vision, Values, and Rituals"
  description: "The nuts and bolts about how Datum is working to unlock internet superpowers for every agent, builder, and developer."
---

Datum is working to unlock 'internet superpowers' for every agent, builder, and developer. 

Essentially, we want to reimagine the foundational capabilities that all the big guys use to interact at scale for the AI era. We think these superpowers are increasingly valuable ([read why in our blog](https://www.datum.net/blog/every-agent-needs-an-edge/)), but also ridiculously hard to use. The interfaces are wrong for what's next, and we aim to fix that!

Humble pie note: even though we’re excited about our product vision, what we’re doing isn’t revolutionary under the hood. Most big companies have built amazing global networks over the years. The large clouds and CDN’s have pushed the envelope to create scalable services on top of their networks, abstracting users from the complexity and mess of global connectivity. What we’re trying to do is make it possible for every agent, builder, startup, and cloud-native engineer to tap into these capabilities. 

No network team required.  :-)

## Core product strategy
In addition to building our underlying platform and network, we're focused on releasing a self-service cloud product (e.g. Datum Cloud) that is more opinionated than we ultimately believe customers will require. These "house brand" services are designed to deliver real, low-friction value to users while building our operational muscle. Datum Cloud is backed by an AGPv3 license and we try hard to avoid weird sales gates or marketing fluff.

* AI Edge – Protect apps, endpoints, and API’s with an intelligent global proxy and built in WAF (powered by Envoy)
* Connectors – Orchestate a diverse portfolio of connections, starting with QUIC tunnels (powered by Iroh)
* Galactic VPC - Virtual private backbones for improving performance, security, and reliability with an internet fast lane

Some other core capabilities on our roadmap include a virtual "meet me room" and edge runtime.

## Ways to interact
Just as important as these features are the ways to interact with them. We're focused on:

* AX - Datum MCP 
* DX - datumctl and SDK's 
* UX - Customer portal and desktop appls

## Platform accoutrements
We're aggressively maturing various platform features that help users adopt best practices. Our approach here is make everything programmatic and available to all users, not just larger accounts.

* DNS and domains
* Export OTel metrics to Grafana Cloud
* Machine accounts, SSO, RBAC, and secrets
* Activity & audit logs

Finally, we're investing ahead of our own needs [with Milo](https://www.datum.net/handbook/build/milo/), a "system of action" purpose built to help modern cloud providers grow. Our hope and expectation is that we will collectively see thousands of new specialized providers take shape, and we'd like to collaborate on reducing the amount of undifferentiated investment folks have to do to show up, and scale up.

## Product values
It's hard to translate high level company values directly into daily work, so we've created a short list of product values to primarily help engineers move faster and with more confidence:

* AX, then DX, then UX
* Build for 1M backbones, 1B tunnels
* Make it fast, sturdy, and ergonomic (function over fancy)
* Be humble, curious, and helpful (we're operators at heart)
* No weird sales gates, lock-in, or marketing crap

You can read more about our product values [on our blog](https://www.datum.net/blog/finding-our-footing-product-values/).

## Product rituals
You can read more about our overall company rhythms [here](https://www.datum.net/handbook/operate/rhythms/), but when it comes to building products we focus on a monthly cycle.  

* [Monthly milestones](https://github.com/datum-cloud/enhancements/milestones) are the basis of our planning, as well as our marketing
* We name our monthly milestones after little known innovators. Fun is encouraged! 
* Our core meetings include a weekly team kickoff on Mondays and an engineering huddle on Tuesdays
* We organize into product teams for key initiatives, partnerships, and design win projects
* A big part of our value is operational. As such, [incident culture](https://www.datum.net/handbook/build/incidents/) is pretty important.
