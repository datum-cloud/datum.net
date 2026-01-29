---
title: "Incident response policy"
sidebar:
  label: Incident response policy
  order: 6
updatedDate: Nov 13, 2025
authors: jacob
meta:
  title: "Datum Incident Response Policy - Detection & Recovery"
  description: "Read Datum's Incident Response Policy. Our framework for detecting, containing, and recovering from security incidents to maintain platform resilience."
---

Datum’s customers are dependent on our services operating as expected. Proper detection and response to incidents that may impact the integrity, confidentiality or availability of services and data is [critical to Datum’s business in many ways](/handbook/technical/incidents/).

The following minimum standards apply to Datum’s assets as managed by employees, contractors and vendors. These recommendations represent the recommended minimum efforts necessary for incident detection and response.

## Incident Detection

An incident could be detected internally by an employee in their course of work, by an employee or vendor doing a review of Datum’s security posture, or an external third party reporting a potential vulnerability to us.

If you see something, say something. All Datum employees should immediately report suspected security incidents or suspicious activity that occurs at Datum, including but not limited to security incidents, physical injury, theft, property damage, denial of service attacks, threats, harassment, abuse of individual user accounts, forgery and misrepresentation.

Suspicious activity can be reported to the Slack channel #incidents, or, for potentially sensitive incidents, to the Security Team or to the Head of Finance & Operations. 

All employees should watch for potentially suspicious activities, including:
* Warnings from antivirus tools
* Unexpected system reboots and/or sudden degradation of system performance
* Password reset notifications
* Modification or defacement of websites
* New open network ports on a system

Datum regularly reviews logs to detect and track attempted intrusions and other suspicious activity. These include git, cloud, networking, SaaS tools, and other infrastructure logs.

### The Security Team:
* Ensures that a very high level of logging is enabled
* Checks logs regularly for suspicious activities and entries
* Looks for missing time spans in logs
* Checks for repeated login failures or account lockouts
* Investigates unexpected system reboots

## Incident Response
Datum’s Security Team reviews and responds to potential third-party reports of security issues sent to security@datum.net promptly. If a suspected incident is detected, it should be reported immediately. We respond to reported incidents, and resolve and determine impact as soon as possible. We aim to remediate incidents as soon as possible.

Confirmed incidents may be disclosed publicly per our [disclosure policy](/handbook/policy/incident-disclosure/).
