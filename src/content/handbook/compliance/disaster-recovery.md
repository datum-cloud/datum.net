---
title: Disaster recovery policy
sidebar:
  label: Disaster recovery policy
  order: 7
updatedDate: Nov 13, 2025
authors: jacob
meta:
  title: ""
  description: ""
---

Datum’s customers are dependent on our services operating as expected. Proper planning, monitoring, and recovery steps are critical to address incidents that may impact the integrity or availability of services and data is critical to the operation of Datum. Disaster Recovery is a set of processes and techniques used to help an organization like ours recover from a disaster and resume routine business operations.

**Scope**
The following minimum standards apply to Datum’s assets as managed by employees, contractors and vendors. These include but are not limited to: cloud service providers, cloud regions, major components within cloud regions, key vendors (those included in our [vendor assessment](vendors/)), key open-source components

**Schedule**
Datum reviews its backups, and any Disaster Recovery plans annually with a walkthrough exercise. Datum tests its ability to restore production data at least annually.

**Backups**
Datum regularly reviews backups and service redundancy to ensure they can be used in the event of an outage. The Security Team:
* Ensures backups for key services are in place
* Tests backups and restore procedures
* Reviews proposed and existing architecture plans for resiliency
* Implements monitoring tools to detect potential continuity issues for key services

**Outage detection**
An incident could be detected internally by monitoring tools, by an employee in their course of work, or reported by a third party including customers.

**Outage response and remediation**
If a suspected outage or other business continuity incident is detected, it should be responded to following the [Incident response process](incident-response/).