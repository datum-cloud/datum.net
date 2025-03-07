---
title: "It’s the network, stupid"
date: 2025-02-19
slug: the-network-stupid
description: "The last venture I started with my brother Zac was a cloud infrastructure company called Packet."
thumbnail: ../../assets/images/blog/post-2-thumb.png
featuredImage: ../../assets/images/blog/post-2.png
---

The last venture I started with my brother Zac was a cloud infrastructure company called Packet. 

Aside from being an easily understood English-language word, Packet’s name spoke to the core service you need from a cloud provider to do anything interesting: networking. We often joked that Packet was an awesome global network with mildly interesting bare metal servers attached. This was further reinforced when Equinix — the global interconnection giant disguised as a colocation provider — acquired Packet in 2020.

After integrating the Packet team and platform into Equinix, we took some time off to recharge and look for new ways to make an impact. It didn’t take long for us to circle back around the lowest layers of [the OSI model](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/) and how they might unlock advantages for the companies playing to win. Since then we’ve developed a hunch into a thesis, and started to build the team, community and technology to move it forward.

Here’s what led us back into the game. Or to badly paraphrase the [political strategist James Carville](https://en.wikipedia.org/wiki/It%27s_the_economy,_stupid): it’s the network, stupid!

## Network and data intensive workloads are on the rise

We believe that a new crop of workloads — mainly driven by an explosion in the volume and value of data, intelligence, and AI — will shine a spotlight on how the biggest businesses connect with their customers, partners, and other providers. To be successful, we think these customers need a full range of network superpowers that can run anywhere, and a global platform where they can programmatically interact with their unique ecosystem.  

Historically, if you cared a lot about network workloads (trading, banking, payments, telecom, cloud services, gaming, media, data heavy SaaS) you built your own network. In addition to hooking up your private datacenters, factories, and offices, you’d create points of presence in strategic exchange hubs to connect with the internet at large, as well as other private networks, clouds and partners. 

While it comes with a fair bit of complexity, controlling your network destiny at these lower layers helps you tune a bunch of knobs around performance, cost, privacy, compliance, etc. For example, you can keep much of traffic off the public internet, be opinionated about how things are routed, and dial in your price vs performance ratios to match business requirements. 

Of course, with great power comes great responsibility, and this kind of work is the domain of a shrinking group of experts that are hard to hire and retain. Unlike cloud computing, where access to programmatic infrastructure created a universe of tooling to operate efficiently at scale, most software-minded people don’t have access to the lowest layers of networking for the reasons outlined above.

That’s why in a world where you can create thousands of [disposable dev environments](https://openhands.daytona.io/) for AI agents or [millions of SQLite databases](https://turso.tech/blog/a-deep-look-into-our-new-massive-multitenant-architecture) for each user session, it still takes an hour to boot up and configure a router and weeks to privately connect with a partner. 

Despite huge potential advantages, it’s no wonder that even the most network-sensitive companies born in the last decade (globally distributed data platforms, looking at you!) don’t dare to build their own.

## It’s a crazy world, we just scale in it!

With the gravity around public clouds, -aaS everything, global customer experiences, and a localized / fragmented regulatory environment, things are getting exponentially more complex. 

If you’re a fast-growing, tech-enabled business, tell us if this sounds about right:

*   You’ve got workload on basically every cloud, plus private
*   You’ve got a ton of data, its growing fast, and creating gravity
*   You’re working with a lot of technology partners, from Anthropic to Cisco
*   You’re tied into a sprawling range of online SaaS ecosystems
*   You’re looking at more regulation and localized control in your future, not less

Even with public and private cloud solutions from the best providers and a killer team, you’re on track to be a service provider to yourself and your customers, balancing all of the predictable competing priorities around performance, cost, security, and control. And a bunch of the levers you might want to pull on live in the networking stack. 

## Why create something new?

Okay - say you agree that a network and data centric world is coming, and that there are real advantages available with low level superpowers. Why create something new? Why not just lean into existing services and make the best of it? 

Leveraging existing solutions is a reasonable argument for most companies, but we think the top few thousand technology producers, providers, and consumers need something that isn't currently available or on the horizon. 

The most obvious answer is to turn to CDN’s like Akamai, Fastly, and Cloudflare. Their networks were designed to cache content and deliver traffic at truly massive scale, with a clear value proposition: put their distributed multi-tenant network in front of your stuff, and it will get better / faster / cheaper and also more resilient. 

This benefit holds true for most users with common use cases — like fronting the API for a popular SaaS app, accelerating a news website with millions of views while protecting it from DDoS attacks, and serving up content close to global users. But if you’re in the business of delivering experiences at market-leading scale (Netflix in streaming, Apple with Relay, Facebook with ads, Roblox with game server matching, VISA with payments, Amazon with eCommerce) you build a lot of this yourself in order to balance factors like control, cost, performance, security, etc. 

In response to demand, both Cloudflare (with Workers, R2, and containers) and Akamai (with Linode) have invited more workloads to sit alongside their networks. This is the right idea for many customers, but for market leaders, we see challenges that are at odds with their needs: 

1.  You can’t take the Cloudflare, Akamai, Fastly experience and plop it in another cloud, let alone your own datacenter, warehouse, or wind farm.  
    
2.  You can’t run a Cisco 8kv router (or Palo Alto firewall) let alone tap into the complex Cisco ELA you worked so hard to negotiate.  
    
3.  While Cloudflare has a solid cloud onramp product, there isn’t a button or API call to help you connect directly with Snowflake in Sao Paulo, Deutsche Telekom in Frankfurt, or Nasdaq in Secaucus. 

To leverage these ingredients you’ll still need to grab racks at a dozen Equinix, Digital Realty, or DataBank datacenters, roll your own gear, and build a network the old fashioned way.

And this is exactly where Datum wants to innovate, by providing a network cloud that is optimized to run network workloads anywhere; that supports the commercial and technical experience of partner technologies from the start; and that reimagines how folks can privately connect with their customers, partners and providers.

## What does a network cloud look like?

Despite our opinions about control, even power users don’t want to build and run everything themselves. Instead, they want a global cloud service designed around their needs that also works wherever they gosh-darn need it to. This is the promise of a modern cloud experience. 

To make it happen, we are building an experience for connectivity infrastructure that prioritizes the following ingredients: 

*   **Open Source Stack** - Building in the open with an appropriately [permissive AGPL license](/blog/open-source-strategy) helps us gain trust more quickly for a foundational layer of the stack, invites collaboration and enables liberal use of the stack outside of a 3rd party operator. Importantly, it also provides long-term protection for customers. If we fold or have divergent interests, you can always fork it.  
    
*   **Software is the User** - It’s true that many tasks related to networks are physical and take time, but so does shipping a MacBook from Shenzhen to Des Moines. We think it’s a good moment to imagine and create new ways to access that value, and it starts with making everything programmatic.**‍**
*   **Federation** **from the Start** - We think you should be able to run network cloud workloads wherever you need to, including on our scaled, shared infrastructure but also on other clouds and in your private environments. That’s why we’re baking in federation as a core concept, so you can get a lot of the creature comforts of a cloud service even when you need to run the workloads somewhere else. **‍**
*   **Partner Focused** - If we’re going to invite customers to pursue their unique advantage, we need an ecosystem of providers to succeed. That’s why we can’t margin stack and fight with partners and their channels. We want to help them succeed with an aligned commercial and operational model from the start.
*   ‍**Ecosystem all the Way** - Instead of making money by pushing more traffic, we aim to thrive by helping the biggest businesses gain advantage by connecting with their customers, partners, and providers more efficiently.

As you can probably tell, we’re passionate about connecting others. If you’re interested to learn more, please [reach out](/get-involved) or get involved on [GitHub](https://github.com/datum-cloud).