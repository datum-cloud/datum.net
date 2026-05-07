---
title: "How we ship"
sidebar:
  label: How we ship
  order: 1
updatedDate: May 7, 2026
authors: drew
meta:
  title: "How We Ship - Datum Handbook"
  description: "The arc from idea to production — how work moves through our SDLC and what questions humans need to answer at each stage."
  og:
    title: "How we ship"
---

We ship software continuously, but deliberately. Agents handle a lot of the throughput — writing, reviewing, scanning. What the process below is designed for is the human judgment at each stage: is this the right problem? Are the assumptions sound? Does everyone who needs to know, know? Those questions don't answer themselves, and no amount of velocity compensates for skipping them.

## From idea to issue

Work starts as a hypothesis. Before an issue becomes a task, it should be able to answer: what problem are we solving, for whom, and why now? The discussion that happens in an issue before a line of code is written is often the most valuable part of the project. It's where assumptions get challenged, connections get made, and the scope gets honest.

An agent can draft the issue, research prior art, and find related work. The human job is to pressure-test the framing. See [GitHub workflow](/handbook/build/github-workflow/).

## From issue to pull request

Once scope is clear, implementation begins on a branch. A pull request is the proposal that implementation makes to the team — not just the code, but the reasoning behind it. A good PR description makes the author's assumptions legible so a reviewer has something real to engage with, not just a diff to skim.

Review is where humans add what agents can't: the cross-functional connection, the surfaced assumption, the decision hiding inside an implementation detail. See [GitHub workflow](/handbook/build/github-workflow/).

## The definition of done

Before work is considered finished, the team should be able to say yes to a specific set of questions: Is the problem statement clear? Is it deployed with no manual steps remaining? Has someone tested it from the user's perspective? Is it documented well enough that a user could discover and use it without asking anyone?

These aren't gates — they're a shared picture of what "finished" means. Not every item applies to every project, but every item should be explicitly considered, not skipped by accident. See [Definition of done](/handbook/operate/project-management/).

## The monthly release

We ship to production continuously, but we bundle work into monthly releases that culminate on the last Friday of each month. That rhythm creates the forcing functions that pure continuous delivery skips: milestone grooming, documentation, demos, communications, and changelog entries. It's when the work gets announced — not just deployed.

Milestones are how we organize the bundle. If work slips out of a milestone, move it explicitly rather than letting the milestone quietly drift. See [Rhythms](/handbook/operate/rhythms/).

## Into production

Substantial changes — anything with real blast radius — are [calendar events](/handbook/build/change/), not chat messages. The team knows a change is coming before it arrives. That shared awareness is itself a diagnostic tool: when something breaks, the first question is always "what changed?" and a calendar entry shortens that conversation to zero.

For new services or significant capability expansions, a [production readiness review](/handbook/build/production-readiness/) is the checkpoint that validates the operational foundations are in place before customers depend on them.

## Engineering cadence

The sections above describe how individual pieces of work move from idea to production. This section is about the recurring habits that keep things moving — what to do every day, week, and month regardless of what you're building.

These aren't all-or-nothing. When you're [on call](/handbook/build/oncall/), the daily and weekly habits shift toward triage and responsiveness. When you're heads-down on a complex piece of work, they shrink to the minimum needed to stay connected. The goal is sustainable rhythm, not a checklist to feel guilty about.

### Daily

- **Process notifications.** GitHub mentions, PR review requests, and discussion replies are your primary async input. Clear them once a day so nothing waits more than 24 hours.
- **Move your current work forward.** At least one meaningful commit or decision on your active milestone issue. It keeps momentum and makes the weekly status update honest.
- **Check your open PRs.** If a PR is waiting on you — or waiting on someone else and going stale — take an action: respond, ping, merge, or close.

### Weekly

- **Write a status update** on any in-flight issues. Two things: when it's expected to ship, and what's in the way. See [Status updates](/handbook/operate/status/).
- **Review your issue assignments.** Are they still accurate? Still the right priority? Close what's resolved, update what's changed, flag what's blocked.
- **Scan the PR review queue.** Ask your agent: _"Find all open PRs across datum-cloud and milo-os that need a reviewer — what are the 3 highest value ones for me right now?"_ A couple of focused hours on reviews is one of the highest-leverage things you can do for the team.
- **Connect one dot.** What did you learn this week — in a PR, a customer issue, a Slack thread — that someone else should know about? Put it where they'll find it: a comment on the relevant issue, a note in a PR description, a mention in the Monday all-hands.

### Monthly

- **Close out the milestone.** Before the last-Friday release, confirm that everything that shipped has a changelog entry, is documented, and has been socialized in some form. Work that shipped but isn't discoverable isn't done. See [Definition of done](/handbook/operate/project-management/).
- **Read the on-call summary.** Review the end-of-shift notes from the cycle. What issues came in? What got deferred? Anything that bounced around the queue without resolution usually points at a gap worth fixing.
- **Tend the backlog.** A monthly pass through your open issues: close what's stale, reprioritize what's shifted, and break down anything that's been sitting in a vague state for more than a cycle.
- **Attend the community huddle.** It's where engineering work meets the public. If you shipped something worth showing, bring it.
