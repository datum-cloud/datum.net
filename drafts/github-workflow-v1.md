---
title: 'GitHub workflow'
sidebar:
  label: GitHub workflow
  order: 7
updatedDate: May 7, 2026
authors: drew
meta:
  title: 'GitHub Workflow - Datum Handbook'
  description: 'How we use GitHub as a team — issues, PRs, code review, and keeping up. With a good agent, the hygiene takes care of itself.'
  og:
    title: 'GitHub workflow'
---

GitHub is where the work happens and where it gets recorded. A good issue makes the work legible before a line of code is written. A good PR description makes the reviewer's job easier and the git log useful months later. A good code review makes the software better and the author stronger.

The overhead of doing all that well is real, and it compounds. An AI agent is a genuinely useful partner here — not for the thinking, but for the mechanics: finding what needs attention, drafting the boilerplate, surfacing the right context. Keep one close.

## Issues

Every piece of work starts with a GitHub issue. This is where intent lives. Even a quick configuration change or a one-line fix should have a trail — that trail is what lets someone else pick it up, or lets you reconstruct why it happened three months later.

A good issue states the problem before it proposes the solution. It links to related issues, prior discussions, or relevant context. It doesn't have to be long, but it should be complete enough that someone who didn't write it can act on it.

When the queue is long and ambiguous, ask your agent: _"Look at the open issues in datum-cloud that have no assignee and no recent activity — which 3 are clearest to pick up right now given [your current context]?"_ A few minutes of triage with an agent every week keeps the backlog from becoming opaque.

## Pull requests

A pull request is a proposal. The description is your chance to explain not just what changed, but why, and what the reviewer should pay attention to. A description that just says "fixes the bug" is a tax on the reviewer.

Keep PRs small and focused. A PR that does one thing is easier to review, easier to revert, and easier to understand in the future. If you find yourself writing "also" in a PR description more than once, consider splitting it.

Agents are good at drafting descriptions. Paste in your diff and the linked issue and ask: _"Write a PR description that explains what changed, why, and what a reviewer should look for."_ Edit it — don't just post the output — but the draft handles the blank-page problem and usually surfaces context you would have left out.

## Code review

Code review is where quality is made, not just checked. It's also where culture is expressed. A review that asks questions instead of just demanding changes, that explains reasoning instead of just asserting it, builds trust. A review that comes back quickly respects the author's momentum.

As an author: give your reviewer what they need. Link the issue. Explain the approach. Call out the parts you're uncertain about. The PR description is the brief; the review is the conversation.

As a reviewer: say what you mean. A comment that isn't blocking should say so. A comment that is blocking should say why. Approval means you've actually looked — it's not a social courtesy.

The review queue is easy to lose track of. Take a couple hours in your week, hand it to your agent, and ask: _"Find all the open PRs across datum-cloud and milo-os that need a reviewer — tell me the 3 highest value ones I can review right now."_ Your agent can weigh factors like staleness, author, blast radius, and how much is already in your head from related work. You'll often find you can make a real dent in an hour.

## Milestones and releases

We ship on a [monthly release cadence](/handbook/operate/rhythms/). Milestones are how we organize that. If work is scoped for the current release, it should be on the milestone. If it slips, move it or close it — a milestone that's 60% done at release time tells the team nothing.

After a release, a quick agent pass is useful: _"What merged PRs in datum-cloud since [last release date] don't have a linked issue or milestone? Give me a list."_ That usually catches the loose threads worth cleaning up before the next cycle.

## Keeping up

GitHub hygiene erodes silently. Issues go stale, PRs pile up, reviews get delayed by distraction rather than judgment. The fix isn't discipline — it's reducing the activation energy.

Build a habit of starting a few sessions per week by asking your agent to give you the lay of the land: what's open, what's blocked, what's been quiet too long. Let it do the scanning so you can do the deciding. The work doesn't pile up; it just needs a few minutes of triage to stay manageable.
