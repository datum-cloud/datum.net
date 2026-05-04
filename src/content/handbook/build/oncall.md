---
title: "On-call"
sidebar:
  label: On-call
  order: 5
updatedDate: May 4, 2026
authors: jacob
meta:
  title: "On-Call Rotations - Datum Handbook"
  description: "How Datum runs on-call rotations to serve customers, improve our services, and protect engineers from burnout."
  og:
    title: "On-call"
---

Running reliable infrastructure means someone is always reachable. Our on-call rotation is how we organize that responsibility — fairly, sustainably, and in a way that makes the whole team stronger over time.

## What we're trying to do

Our rotation serves three goals:

1. **Serve the user.** Services need to perform well. Engineers need to be unblocked. The team needs to be responsive.
2. **Improve our services.** Every engineer who cycles through on-call gets broader exposure to what we own and how it behaves in production. That firsthand experience builds empathy that makes everything we design more maintainable.
3. **Protect long-term focus.** When you're not on call, you shouldn't feel confined. The on-call engineer exists precisely so the rest of the team can go heads-down on longer-term work.

## What on-call is not

On-call is an entry point for new interrupts — not a replacement for the whole team. The on-call engineer handles incoming situations and decides when and how to involve others. A shift shouldn't turn into days of cleanup. When you need the team, you call the team.

We also don't expect the on-call engineer to work on longer-term projects during their shift. The job is to handle the things that would otherwise distract everyone else.

## During your shift

At the start of each shift: check for open incidents, review any handoff notes from the previous engineer, and scan for new issues in GitHub and our community channels.

When things are quiet, there's plenty of useful work:
- Review teammates' pull requests
- Fix documentation, especially around incident response
- Triage alerts or pick up a small open issue that can be resolved in a few hours
- Scope an open issue that feels unclear, adding questions or options to push the discussion forward

At the end of your shift, write a brief summary in the engineering repo — a few bullets linking to anything you created or touched. It shouldn't take more than a couple of minutes, and it's invaluable for the next person.

## Escalation

We rely on our escalation chain — not Slack — to reach engineers during urgent situations. Slack is a work-hours tool that engineers need to be able to mute. Our on-call tooling respects each engineer's preferred contact method during their shift.

## The bigger picture

On-call is one of the most important contributors to a strong engineering culture. It builds shared ownership, broadens knowledge of our systems, and ensures no single person carries the operational weight alone. Engineers who rotate through regularly become better designers — they've seen firsthand how things fail and what it costs when they do.
