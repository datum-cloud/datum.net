---
title: "GitHub workflow"
sidebar:
  label: GitHub workflow
  order: 7
updatedDate: May 7, 2026
authors: drew
meta:
  title: "GitHub Workflow - Datum Handbook"
  description: "We don't have a code writing problem. The bottleneck is human judgment — connecting work to business context, surfacing assumptions, and making decisions that agents can't make for us."
  og:
    title: "GitHub workflow"
---

We don't have a code writing velocity problem. Agents can write and review code. Technical excellence, in that sense, can be replicated. What can't be replicated is connection.

At Datum we operate by a principle called [ABCD — Always Be Connecting Dots](https://www.threestacksfull.com/thinking/abcd-always-be-connecting-dots). It's a customer experience idea at its origin, but it describes exactly the highest-value thing a human brings to an engineering workflow: the ability to notice that a PR's underlying assumption conflicts with something a customer said last week, or that an architecture decision touches a compliance requirement coming down the pipe, or that two separate pieces of work are unknowingly solving the same problem from opposite directions. Those connections don't happen by accident. They happen because someone was paying attention to more than just the code.

GitHub is where those connections should be recorded. Not as an audit trail, but as the actual medium of the work. An agent can scan the queue, draft the boilerplate, surface the context, and check the implementation. Your job is to find the dots worth connecting.

<h3>Issues</h3>

An issue is a hypothesis before it's a task. The most valuable thing you can do before implementation starts is ask: *What is this assuming? Who else would have an opinion if they knew about it?*

Those questions are dot-connecting in practice. An issue that captures a technical spec but misses a business constraint that three other people on the team already know about is a dot sitting uncollected. Write what you know. Ask for what you don't. The discussion in an issue is often more valuable than the implementation that follows it.

Agents are good at drafting issues, researching prior art, and surfacing related work. What they can't do is know that the framing proposed here conflicts with a conversation that happened last week in a customer call, or that the assumption embedded in the design is something the platform team has already decided to move away from. That connection is yours to make.

<h3>Pull requests</h3>

A PR is a decision surface. The description is how you make your assumptions legible — not just what changed, but what you believed to be true when you made those choices. That's the raw material for dot-connecting by the reviewer.

Use your agent to draft the boilerplate and summarize the diff. Then ask yourself: *What am I assuming here that someone else might challenge? What does this touch outside of this codebase?* Say it in the description. That's the invitation for the conversation worth having.

<h3>Code review</h3>

The code is probably fine. An agent can verify correctness, flag edge cases, and check conventions faster and more thoroughly than a human skimming a diff. That's not where your time belongs in a review.

What you're looking for is the connection the author couldn't have made alone: Does this approach conflict with something happening in another part of the business? Does it make a decision that should involve someone else? Is there an assumption here that hasn't been validated against the real world? Is this solving the stated problem, or a proxy for a different one?

This is ABCD applied to engineering: you're not just reviewing code, you're asking whether the dots the author collected have been connected to everything else you know. Often the most valuable comment in a PR isn't about the implementation at all — it's *"This assumes X — is that still where we're headed?"* or *"This touches the billing path — has the finance team seen this?"*

To keep the review queue from becoming invisible, take a couple of hours in your week and hand the scanning to your agent: *"Find all the open PRs across datum-cloud and milo-os that need a reviewer — tell me the 3 highest value ones for me to look at right now."* Then spend your time on the conversation, not the queue management.

<h3>Raising the signal</h3>

The failure mode isn't bad code. It's dots collected but never connected — decisions made by default inside implementation choices that looked routine. An assumption baked into a data model. A dependency added without a conversation. Scope that quietly expanded because nobody connected it to the roadmap.

When you find those in a review, surface them. Not as a blocking code comment, but as a question that opens the conversation. That's the output that only a human reviewer produces, and it's worth more than any number of style suggestions.

An agent can help you find where the signal has gone quiet: *"Are there open PRs or issues in this repo where discussion has stalled, or where there are unresolved questions that nobody has answered?"* Stale discussions are usually decisions that got deferred. They're worth a nudge.

<h3>Milestones and releases</h3>

We ship on a [monthly release cadence](/handbook/operate/rhythms/). The interesting question at each milestone review isn't "what's done?" but "what did we assume going into this that turned out to be wrong, and who should know about it?"

After a release, ask your agent for a summary of what merged — not to audit the code, but to ask: *"Is there anything in here that should have triggered a conversation with someone outside engineering?"* Sometimes the answer is no. When it's yes, that's the dot worth connecting before the next cycle starts.
