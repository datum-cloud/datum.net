---
title: Change management policy
sidebar:
  label: Change management policy
  order: 10
updatedDate: Nov 13, 2025
authors: jacob
meta:
  title: ""
  description: ""
---

To avoid potential security incidents, Datum requires change management controls to ensure only authorized changes are made to its environment and processes.

## Code changes
Changes to code in Datum’s environment made by an employee or contractor must be tested and approved by another employee prior to being merged and rolled out.
Datum uses branch protection rules on GitHub to require changes be made through a pull request with a second review prior to merging code.
Exceptionally, employees can push changes without a second review where they are required to mitigate an incident. Changes pushed without prior approval to customer facing environments are audited based on manual and automated reporting after the fact, within 2 business days.
Changes to update dependencies, publish documentation, changes to the marketing website or related marketing assets, or non-substantive code changes are exempt from this policy.

## Dependencies
Dependencies can be updated without requiring a separate reviewer. Datum reviews the release notes for a dependency prior to merging the changes.

## Documentation
Documentation can be updated without requiring a separate reviewer.

## Infrastructure changes
Where infrastructure is codified and uses a deployment tool, infrastructure changes should be approved by another employee prior to being deployed.

## Customer accounts
Datum does not make changes to customer networks and accounts in Datum on behalf of a customer - these actions must be performed by the customer. However, Datum may make changes to customer environments without the customer initiating the request, such as when required by law or due to an urgent security issue.

## Security policies
Security policies must have a change log to allow auditing of past changes, including when and by whom these changes were made. Datum stores these security policies in GitHub and uses git to track changes.

Datum will review and evaluate its security policies, adapt them as needed due to changing risks, and validate if the implemented information security continuity controls are sufficient on an annual basis.
