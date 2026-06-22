---
title: "Status updates"
sidebar:
  label: Status updates
  order: 9
updatedDate: May 4, 2026
authors: jacob
meta:
  title: "Async Status Updates: How Datum Keeps Teams Aligned"
  description: "How we communicate progress at Datum — asynchronous status updates that keep the whole team aligned without drowning anyone in noise."
  og:
    title: "Status updates"
---

Teamwork is 100% communication.

Soccer players communicate constantly — calling to get open for a pass, shouting where to break for the goal, adapting to conditions in real time. In business, it's even more complex. A company has several functions running at once: product, marketing, finance, engineering, ops. When we do need to sync, we want it to be for truly exceptional cases and real problems — not to ask "where are things?"

We keep the team scoring by giving each other **high-quality asynchronous status updates**.

## Where

Status updates live close to the work they describe. Since all of our work derives from a **GitHub issue**, a status update belongs as a comment on the relevant issue. GitHub is our source of truth — it's where our product lives, where changes happen, and where our community engages with us.

Slack is great for ephemeral communication: quick brainstorms, clarifications, the social fabric of a distributed team. But Slack messages age fast, have low discoverability, and are invisible to anyone not online at that moment. If something matters to the work, get it into GitHub.

## When

The closer a deadline, the more frequently to update:

| Time to deadline | Frequency             |
|------------------|-----------------------|
| ~1 day           | Every couple of hours |
| ~7 days          | Daily                 |
| ~7–14 days       | Every 2–3 days        |
| >14 days         | Weekly                |

These are guidelines, not rules. A critical architecture change might warrant more frequent updates to leadership because of its customer impact. A minor bugfix probably doesn't need a formal update at all.

When work is complete — or paused — say so. Celebrate a shipped feature. And if something fails, celebrate that too. What did we learn? What would we do differently? You devoted real time to this. Make it count either way.

## What makes a good update

Every goal has three parts:

1. An **outcome** — "We know this is done when ___________."
2. A **date** — When is it arriving? Alignment here is critical.
3. An **owner** — The person making sure the outcome arrives by the date and communicating status along the way.

A status update is a refinement of those three things over time. It answers: are we still on track?

Use a simple traffic-light framing for quick scanning:

- 🟢 **Green** — On track for the original date and scope.
- 🟡 **Yellow** — At risk. Either the date or scope is in jeopardy.
- 🔴 **Red** — Will not meet the original date.

For yellow or red, always include a **get-to-green plan**: what action, by when, from whom. If red, include why and a suggested revised date.

Link liberally. Don't reproduce content that lives elsewhere — link to the relevant issues, PRs, designs, and supporting context. The goal is to democratize knowledge, not to write an essay.

## Audience and length

A status update is for anyone who needs to know the state of the work without following it day-to-day. Open with the headline — on track or not — then add supporting detail for those who want it. The first sentence should be enough for a busy executive or a GTM teammate anxiously awaiting the feature.

Brevity is always better, but not at the expense of clarity.

Not helpful:
> We're facing challenges attempting to converge on a solution for the X requirement. We hope to try and reconcile this and have plans to do this by next week.

Much better:
> We don't know how to solve X yet, but will decide between options A and B by DATE. If neither works, we'll escalate. The cost of not having X is that we can't do A or B — we've reordered the checklist above to reflect that and notified the affected team.

High-quality status updates communicate when something will be done, or clearly state that the deadline isn't yet understood. Silence, in a team environment, is almost always read as bad news. Write the update.
