---
title: Testing policy
sidebar:
  label: Testing policy
  order: 11
updatedDate: Nov 13, 2025
authors: jacob
meta:
  title: ""
  description: ""
---

To avoid potential security incidents, Datum requires testing of its software to ensure that it functions as expected.

## Scope
This policy applies to code developed by Datum for its clients or run on its production servers.

## Code Changes
Changes to production code which alter Datum’s product functionality should be tested by Datum’s continuous integration (CI) system prior to being merged. Testing should not be conducted locally in a development environment or in production.
Exceptionally, changes to production code may be merged without first testing them, such as to resolve an incident. See the Change management policy.
Changes to production code which do not alter product functionality, e.g., changes to documentation, may be but do not need to be tested.

## Client Releases
When a new version of the Datum desktop client is built, it should be tested prior to being released. 
New functionality should be released as part of an unstable track prior to being incorporated in stable client releases. New functionality may be released directly to a stable client to address an incident, such as a security issue.

## Infrastructure Changes
Changes to Datum’s production infrastructure should be tested where possible.
Where possible, infrastructure should be implemented ‘as code’, so that it can be reviewed, approved, and tested as other code changes are.