---
title: "How we work"
sidebar:
  label: SDLC
  order: 7
updatedDate: Aug 26, 2026
authors: Kevin
meta:
  title: "Our Software Development Lifecycle - Datum Handbook"
  description: "How Datum plans, designs, builds, tests, releases, and learns from software - a continuous sprint cycle fed by a shared backlog."
  og:
    title: "How we work"
---

Everything we build starts in one place and flows through the same cycle, whether it's a customer-facing feature or an internal tool.

**Backlog** - PRDs, user feedback, and prioritization all feed a single, prioritized backlog. This is the only place work should originate from before it enters a sprint.

- **Owner:** PM

The backlog isn't a one-time intake, it's continuously groomed. Learnings from stage 6 below feed straight back into it, and the PM keeps it re-prioritized as new PRDs and feedback arrive.

That backlog feeds a **sprint cycle** that repeats continuously on a two-week cadence. Each pass through the cycle has six stages, each with its own artifacts, an owner, and a clear definition of "done" so the next stage can start with confidence.

## 1. Plan (lightweight)

Turn backlog items into a sprint's worth of scoped, actionable work.

- **Owner:** Engineering
- **Artifacts:** sprint goal, user stories/tickets, acceptance criteria
- **Done when:** the team agrees on scope and acceptance criteria

We tend to keep this lightweight. The goal is shared understanding of what "done" looks like, not a heavyweight planning ritual.

Right-sizing the commitment matters more than the planning process itself. We'd rather scope a sprint conservatively and deliver everything we said we would than commit to a full backlog and land halfway through it. Under-promising and over-delivering builds trust, with each other and with anyone waiting on the outcome, and it keeps the next sprint's planning honest instead of compounding a backlog of half-finished carryover work. If you're unsure whether something fits, size it smaller.

## 2. Design (just enough)

Work out the shape of a solution before code gets written, in proportion to how much uncertainty or risk the change carries.

- **Owner:** Design
- **Artifacts:** quick mockups/Figma sketches, API contract notes, tech spike notes
- **Done when:** design and engineering agree on an approach before coding starts

"Just enough" is deliberate, most work doesn't need a formal design doc. Use judgment about how much rigor a given change deserves.

Match the rigor to the risk, not the size of the ticket. A small change touching a shared API deserves more scrutiny than a large but isolated one. Spending a day derisking a spike here is cheaper than discovering the same problem mid-Build.

## 3. Build

Implement the change.

- **Owner:** Engineering
- **Artifacts:** feature branches, code + PRs, unit tests, a passing CI build
- **Done when:** the PR is merged and CI acceptance checks pass

Keep PRs small and scoped to what Plan and Design already agreed on. A small, focused PR is easier to review well, easier to revert if it's wrong, and keeps scope from quietly creeping back in after it was already decided.

## 4. Test / review

Verify the change is correct and safe before it ships, with a second set of eyes.

- **Owner:** Engineering
- **Artifacts:** code review comments, test results, staging sign-off
- **Done when:** the change has been reviewed, tested, and signed off by someone other than the author

That last-mile independence matters, the author is the person least likely to catch their own blind spots. Treat this stage as a real checkpoint, not a formality to clear, catching a problem here is far cheaper than catching it in production.

## 5. Release (continuous)

Ship the change to production.

- **Owner:** Engineering
- **Artifacts:** release notes, feature flag configuration
- **Done when:** the change is deployed and verified in production

Release is continuous, not a scheduled event, see [change management](/handbook/build/change) for when a release needs the added coordination of a calendar entry. Feature flags let us decouple deploying from releasing, so shipping code to production and turning it on for users don't have to happen at the same moment or carry the same risk.

## 6. Learn & iterate

Close the loop: find out what actually happened once real users touched the change.

- **Artifacts:** usage/analytics, retro notes, demos, an updated backlog
- **Done when:** learnings are captured, tested, and fed back into the backlog

This is what makes the cycle a cycle rather than a line. What we learn here feeds straight back into the backlog, new PRDs, new feedback, re-prioritization, closing the loop the PM keeps groomed ...and the sprint starts again.

Be honest here about what didn't go well, not just what shipped. A retro that only reports success teaches us nothing that changes the next sprint's Plan. We should be able to talk about all the things that made us feel good, helped us move towards our goals, slowed us down, and any risks we see ahead in our retro.
