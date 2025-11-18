---
title: Incidents
sidebar:
  label: Incidents
  order: 3
updatedDate: Nov 13, 2025
authors: jacob
meta:
  title: ""
  description: ""
---

We define incidents as unplanned events which require intervention of humans to reduce or eliminate a negative impact to customers, internal or external. Those impacts can include:
* **Harm to reputation**: Eg, a critical network link doesn't generate traffic for several minutes and customers question the ability of the company to maintain service.
* **Loss of revenue**: Usually a downstream impact of the impact to reputation, it can also be a literal loss where components of a system fail and customers aren't able to transact or buy something.
* **Loss of productivity**: Business grinds to a halt because of an internal system failure.
* **Meaningful increase in costs**: Team discovers errant automation which is exploding the usage of infrastructure resources and burning money.

We design our response to incidents in this order:
1. Mitigate the negative impact, and
2. Prevent the impact from ever happening again, either in severity, duration, or both

Incidents are an anchor of real-world learning for the team. Every engineer needs to be familiar with every step of the procedure and how to operate our infrastructure. More concretely:
* Own an incident end-to-end at least once within the first few weeks of joining the team.
* Read at least the last 20 incident reports.
* Review an incident report PR at least once a month, adding your feedback.
* Write an incident report at least once a quarter.
* Read, or at least skim, design docs for major components of the system.

There are two things happening during every incident. One is the synchronous, somewhat chaotic problem-solving to restore service or otherwise mitigate the customer impact. This usually looks like a Slack channel and, for the bigger impact incidents, an accompanying Zoom.

The other component is asynchronous: capturing knowledge. Like any investigation, there is evidence collection that will be used for weaving together a narrative to make sense of what created the chain of events that needed the expensive process of humans rallying together to fix the robots.

The analysis of an incident is just as important as mitigating the customer impact. Without good post-incident hygiene, a team is doomed to (a) repeat handling the incident in perpetuity and (b) continue to design systems with yesterday's understanding instead of today's.

By doing incidents well, a lot of good habits will form naturally around the team, which will lead to a stronger team, working on more interesting and business-critical problems, and having a better time working together.