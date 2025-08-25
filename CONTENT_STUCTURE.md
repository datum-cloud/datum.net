## Content Structure

```
content/
├── about/ (/about)
│   ├── images
│   │   ├── amplify.png
│   │   ├── cervin.png
│   │   ├── encoded.png
│   │   ├── highwinds.png
│   │   ├── packet.png
│   │   ├── sf.png
│   │   ├── softlayer.png
│   │   ├── stackpath.png
│   │   ├── vine.png
│   │   ├── voxel.png
│   │   └── zscaler.png
│   ├── index.mdx (main page)
│   ├── our-purpose.mdx
│   ├── team.mdx
│   └── we-value.mdx
├── authors/
│   ├── alex.mdx
│   ├── assets/
│   │   └── images
│   │       ├── alex.png
│   │       ├── chris.png
│   │       ├── felix.png
│   │       ├── jacob.png
│   │       ├── jose.png
│   │       ├── joshua.webp
│   │       ├── scot.webp
│   │       ├── steve.webp
│   │       ├── yahya.png
│   │       └── zac.png
│   ├── chris.mdx
│   ├── fwidjaja.mdx
│   ├── groupTeam.json
│   ├── jacob.mdx
│   ├── jose.mdx
│   ├── josh.mdx
│   ├── scot.mdx
│   ├── steve.mdx
│   ├── yahya.mdx
│   └── zac.mdx
│
├── blog (/blog)
│   ├── assets
│   │   └── images
│   │       ├── blog-1-thumb.png
│   │       ├── blog-1.png
│   │       ├── blog-2-thumb.png
│   │       ├── blog-2.png
│   │       ├── blog-3-thumb.png
│   │       └── blog-3.png
│   ├── learning-from-dying-networks.mdx
│   ├── open-source-strategy.mdx
│   ├── scalable-network-architecture.mdx
│   ├── the-network-stupid.mdx
│   └── zero-trust-network-security.mdx
│
├── categories
│   ├── business-strategy.mdx
│   ├── cloud-infrastructure.mdx
│   ├── network-architecture.mdx
│   ├── network-security.mdx
│   └── open-source.mdx
│
├── changelog (/resources/changelog)
│   ├── 0.48.md
│   ├── 0.49.md
│   ├── 0.50.md
│   └── index.md (main page)
│
├── docs
│   └── docs
│   ├── about
│   │   ├── architecture.md
│   │   ├── comparison.md
│   │   ├── index.md
│   │   ├── overview.md
│   │   └── use-cases.md
│   ├── api
│   │   ├── authenticating.md
│   │   ├── connecting-to-the-api.md
│   │   ├── index.md
│   │   ├── locations.md
│   │   ├── networks.md
│   │   ├── resources.mdx
│   │   └── workloads.md
│   ├── get-started
│   │   ├── components.md
│   │   ├── gateway.md
│   │   ├── guides-demos.md
│   │   ├── index.md
│   │   └── infra-provider-gcp.md
│   ├── index.mdx
│   ├── resources
│   │   ├── changelog.md
│   │   ├── community.md
│   │   ├── contributing.md
│   │   ├── faq.md
│   │   ├── glossary.md
│   │   ├── index.md
│   │   └── roadmap.md
│   └── tasks
│
├── features (/features)
│   ├── agpl-license.md
│   ├── apps.md
│   ├── aws-gcp-byoc.md
│   ├── bring-your-ip-space.md
│   ├── built-with-zero-trust.md
│   ├── connections.md
│   ├── enterprise-ready.md
│   ├── index.mdx (main page)
│   ├── internet-edge.md
│   ├── kubernetes-friendly.md
│   ├── machine-accounts.md
│   ├── metrics.md
│   ├── network.md
│   ├── role-based-access-control.md
│   └── sso-support.md
│
├── handbook (/about/handbook)
│   ├── assets
│   │   └── sample.png
│   ├── company
│   │   ├── deciding-what-products-to-build.md
│   │   ├── how-we-got-here.md
│   │   ├── how-we-make-money.md
│   │   ├── how-we-talk-to-each-other.md
│   │   ├── how-you-can-help.md
│   │   ├── our-ai-strategy.md
│   │   ├── our-neutral-strategy.md
│   │   ├── our-open-source-strategy.md
│   │   ├── our-values.md
│   │   ├── what-are-our-rituals.md
│   │   ├── what-inspires-us.md
│   │   ├── what-we-believe.md
│   │   ├── where-are-we-now.md
│   │   ├── who-are-we-building-for.md
│   │   └── why-we-exist.md
│   ├── engineering
│   │   ├── ci-cd.md
│   │   ├── plan-cycles.md
│   │   ├── review-pull-requests.md
│   │   ├── rfc.md
│   │   ├── ship-new-features.md
│   │   └── tech-stack.md
│   ├── go-to-market
│   │   ├── approach-gtm.md
│   │   ├── brand-voice-tone.md
│   │   ├── common-use-cases.md
│   │   ├── design-language.md
│   │   ├── design-principles.md
│   │   ├── keep-momentum.md
│   │   ├── our-website.md
│   │   └── swag.md
│   ├── index.md (main page)
│   └── people
│       ├── benefits.md
│       ├── give-feedback.md
│       ├── how-we-work.md
│       ├── recognize-peers.md
│       ├── remote-work.md
│       ├── spend-money.md
│       ├── titles.md
│       └── travel-policy.md
│
├── pages
├── assets
│   └── home
│       ├── anthropic.webp
│       ├── aws.webp
│       ├── databricks.webp
│       ├── mistralai.webp
│       ├── openai.webp
│       └── stabilityai.webp
├── blog.mdx
├── docs.mdx
├── global-section.md
├── home
│   ├── images
│   │   ├── AWS.png
│   │   ├── Antrhopic.png
│   │   ├── Cockroach.png
│   │   ├── Coreweave.png
│   │   ├── Crosby.png
│   │   ├── Databricks.png
│   │   ├── Domo.png
│   │   ├── Google-Cloud.png
│   │   ├── Grafana.png
│   │   ├── Harvey.png
│   │   ├── Loveable.png
│   │   ├── OpenAI.png
│   │   ├── Perplexity.png
│   │   ├── Robovision.png
│   │   ├── Snowflakes.png
│   │   ├── Together.png
│   │   ├── Vercel.png
│   │   └── Wasmer.png
│   ├── what-does-good-look-like.md
│   └── why-evolve.md
├── home.mdx (main page)
├── open-source
│   ├── groot.mdx
│   ├── index.mdx
│   ├── internetworker.mdx
│   ├── maintainers.mdx
│   └── patch.mdx
├── product
└── vpc.mdx
```
