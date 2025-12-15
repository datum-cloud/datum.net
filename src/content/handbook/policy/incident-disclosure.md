---
title: "Incident disclosure policy"
sidebar:
  label: Incident disclosure policy
  order: 5
updatedDate: Nov 13, 2025
authors: jacob
meta:
  title: "Datum Incident Disclosure Policy & Notifications"
  description: "We believe in radical transparency. Explore Datum's policy on disclosing security incidents and vulnerabilities to customers, partners, and the open source community."
---

This policy specifies when and how we notify users about security incidents.

Both client software and our managed infrastructure (i.e. Datum Cloud) are in scope for this policy.

For incidents that fall under any legal disclosure requirements (such as [California’s Data Security Breach Reporting](https://oag.ca.gov/privacy/databreach/reporting)), those requirements will take precedence over this policy.

By “notify” here we mean explicitly contacting users in addition to regular release notes in our [changelog](https://www.datum.net/resources/changelog/) and GitHub commit history. For example, you may read about minor vulnerability patches in release notes, but we may not notify users via a dedicated security bulletin.

## When We Notify Users
Generally, we aim to reduce noise and only notify users for actionable incidents. Datum does not notify users for routine security patching of dependencies. We also don't notify users for vulnerabilities in our software, if we confirm the vulnerability was not exploited and no users were affected.

We will disclose a security vulnerability when a fix is available and any of the following is true:
* User action is needed to fix the vulnerability, e.g. updating the client software, or applying another mitigation;
* We can confirm that Organization data was visible to an unauthorized party; or
* We cannot confirm that no users were affected by the vulnerability.

We will notify users directly about a security vulnerability when we can confirm that the Organization was affected, and any of the following is true:
* User action is needed to fix the vulnerability, and it is a critical or high impact vulnerability; or
* We can confirm that Organization metadata or data was visible to an unauthorized party.

## How We Notify Users
To disclose security vulnerabilities (broad audience), Datum publishes security bulletins publicly at https://www.datum.net/blog/. These can be consumed directly, via RSS readers or via social media bot accounts.

To notify users about security vulnerabilities (specific to the Organization), Datum will email affected Organization administrators, with information specific to the Organization, including specific users or nodes which are affected. These emails will be sent to the default owner of the Organization.

Occasionally, Datum may decide to notify users in additional ways about a security issue, such as with in-product notifications (such as by putting a warning banner in the admin console).
