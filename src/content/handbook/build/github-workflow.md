---
title: "GitHub workflow"
sidebar:
  label: GitHub workflow
  order: 7
updatedDate: May 7, 2026
authors: drew
meta:
  title: "GitHub Workflow - Datum Handbook"
  description: "How we use GitHub at Datum — standards and procedures for issues, branches, pull requests, and code review so engineers spend their energy on the work, not the process."
  og:
    title: "GitHub workflow"
---

This page covers how we use GitHub day-to-day — not what GitHub is, but how we work in it. Having shared standards means engineers spend less time deciding how to do something and more time doing it. It also means our work is legible to teammates who pick it up mid-stream, and to our future selves.

One principle that runs through all of it: [ABCD — Always Be Connecting Dots](https://www.threestacksfull.com/thinking/abcd-always-be-connecting-dots). GitHub is where work gets recorded, but the people doing the recording are in a position to make connections that no agent can — between this PR and that customer conversation, between this architecture decision and something the platform team is quietly changing. The practices below are designed to make space for that.

## Issues

Every piece of work starts with a GitHub issue — including small changes. The issue is the trail: the reasoning, the constraints, the decisions made and discarded. Without it, someone (probably you, six months from now) has to reconstruct context from git blame and Slack history.

**Writing a good issue:**
- State the problem before proposing the solution
- Note the constraints and assumptions you're working with
- Link to related issues, prior discussions, or relevant context
- Explicitly note non-goals if scope is likely to creep

Before you start implementing, ask: *who else would have an opinion if they knew about this?* If the answer is anyone outside your immediate work, loop them into the issue before the PR. That's the cheapest time to surface a conflict.

Agents are useful here for drafting, researching prior art, and finding related work across the org. Use them freely for that. The judgment call — whether the framing is right, whether the right people know about it — is yours.

## Branches

Branch from `main`. Name branches in the format `type/short-description`, using the same types as [Conventional Commits](https://www.conventionalcommits.org/):

- `feat/` — new functionality
- `fix/` — bug fixes
- `docs/` — documentation only
- `chore/` — maintenance, dependency bumps, config changes
- `refactor/` — code changes with no behavior change

Keep branch names lowercase and hyphenated. Short is better than complete: `feat/oauth-pkce` not `feat/add-pkce-support-to-oauth-login-flow`.

## Commits

Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard for commit messages: `type(scope): description`. The same types apply as above. Scope is optional but helpful when the repo covers multiple areas.

```
feat(auth): add PKCE support to OAuth login flow
fix(billing): correct proration calculation on mid-cycle upgrades
docs(api): add rate limiting section to reference
```

A good commit message completes the sentence "if applied, this commit will…" Keep the description under 72 characters. Use the commit body for the *why* if it isn't obvious from the diff.

## Pull requests

A PR is a proposal, not just a delivery. The description is how you make your reasoning legible to reviewers — what changed, why, and what you assumed when you made those choices. A description that only restates the diff is a tax on everyone who reads it.

**What a PR description should include:**
- What problem this solves (link the issue — don't restate it)
- Why you approached it this way, especially if alternatives exist
- What a reviewer should pay close attention to
- Any assumptions that haven't been validated yet

Keep PRs small and focused. If you find yourself writing "also" more than once in a description, consider whether it's two PRs. Smaller PRs get faster, better reviews and are easier to revert if something goes wrong.

Use [draft PRs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests#draft-pull-requests) when you want early feedback or are working something out in the open. Mark ready for review only when you'd be comfortable merging it.

Agents are effective at drafting PR descriptions from a diff and a linked issue. Use them to get past the blank page, then edit for anything the description doesn't capture about your actual reasoning.

## Code review

Require at least one approval before merging. For changes with a large blast radius — anything touching auth, billing, public APIs, or shared infrastructure — get two.

**As an author:**
- Don't assign reviewers until the PR is genuinely ready
- Respond to all comments before merging, even if just to acknowledge and defer
- If a review conversation is going in circles, move it to a call and summarize the outcome in the PR

**As a reviewer:**
- Mark comments clearly: blocking (must be addressed before merge) or non-blocking (suggestion, take it or leave it)
- Approval means you've actually read it — not a social courtesy
- If you need more than a day to review, say so; don't leave a PR waiting silently

The code will likely be fine — agents can check correctness and catch edge cases faster than a human skimming a diff. What you're looking for as a human reviewer is what the author couldn't have seen alone: a connection to work happening elsewhere, an assumption that conflicts with a recent decision, a scope question that should involve someone outside engineering. Those are the comments worth writing. Ask your agent to surface the queue: *"Find all open PRs across datum-cloud and milo-os that need a reviewer — what are the 3 highest value ones for me right now?"* Then spend your time on the conversation.

## Merging

The PR author merges, once approved. Don't merge someone else's PR unless they've asked you to.

Squash merge by default for feature branches to keep `main` history readable. Merge commits are fine for long-running branches where the individual commit history is meaningful.

Delete the branch after merging. If the work is incomplete and the branch needs to live, leave a comment explaining why.

## Milestones

We ship on a [monthly release cadence](/handbook/operate/rhythms/) — everything bundles to the last Friday of the month. If work is scoped for the current release, it should be on the milestone. If it slips, move it explicitly; don't let milestones quietly go incomplete.

When closing out a milestone, check whether anything that merged needs a changelog entry, a demo, or a heads-up to someone outside engineering. That last step is the one most likely to get skipped — and it's the one that makes shipped work actually land.
