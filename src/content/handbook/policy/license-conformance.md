---
title: "License conformance"
sidebar:
  label: License conformance
  order: 14
updatedDate: Oct 26, 2026
meta:
  title: "License Conformance - Datum Handbook"
  description: "How Datum reviews software licenses, preserves attribution, and meets license obligations when building, operating, and distributing software."
  og:
    title: "License conformance"
---

Our [open by default](/handbook/operate/open-by-default/) approach depends on respecting the terms under which others share their work. License conformance means understanding those terms and meeting the obligations that apply to how we use, modify, operate, and distribute software and other materials.

## Scope and responsibility

This policy applies to employees and contractors introducing third-party code, dependencies, container images, tools, documentation, fonts, images, or other licensed materials into Datum's work. It includes transitive dependencies and copied or vendored code, not just packages listed directly in a manifest.

The person introducing or updating a component is responsible for checking its license. The maintainers of the affected project are responsible for keeping license records and required notices current through deployment and release.

## Review before use

Before adopting a component or changing its version:

- Check the license text included with the exact version being used. Record its origin, version, and license in the repository or dependency inventory. Use an [SPDX identifier](https://spdx.org/licenses/) where one is available.
- Consider the intended use: internal tooling, a hosted service, a distributed binary or container, or material published on our website. Review compatibility with the project's license and any obligations triggered by modification or distribution.
- Identify required copyright notices, attribution, license copies, notices of changes, and any source code obligations. For commercial software, also check the purchased rights and usage limits.
- Recheck licensing when upgrading or changing how a component is used. A previous review does not cover a later license change.

Public availability alone is not permission to reuse material. If a license is missing, unclear, or incompatible with the intended use, resolve the question before incorporating the component. Do not assume that a package's metadata or an automated scan is a complete license review.

## Preserve notices and meet source obligations

Keep applicable license texts and copyright notices with copied or vendored material. Include required notices and attribution in released artifacts and published content, and retain a record of where the material came from.

Datum uses AGPLv3 for much of its platform, but each repository's license and any component-specific terms govern that work. Do not replace third-party license notices with Datum's license or assume all dependencies share the repository's license.

Where a license requires corresponding source, provide the source for the version actually distributed or operated, including required modifications and build materials. For modified AGPLv3 programs that support remote network interaction, section 13 requires a prominent offer of corresponding source to users interacting with that version over a network. See the [GNU AGPLv3 license](https://www.gnu.org/licenses/agpl-3.0.html#section13) for the applicable terms.

## Release and deployment checks

Before release or deployment, project maintainers should verify that:

- The dependency inventory reflects the components and versions in the artifact, including bundled and transitive dependencies.
- Required license texts, notices, and attribution are present and accessible.
- Any required source distribution or source offer matches the released or deployed version and is accessible to its intended recipients.
- Unresolved licensing questions have been addressed and the review is recorded in the relevant pull request or issue.

Dependency updates remain subject to these checks even when they are exempt from a separate code review under the [change management policy](/handbook/policy/change-management/).

## Questions and remediation

Raise uncertain terms or compatibility questions with the project maintainer and the Head of Finance and Operations, who can coordinate legal review when needed. Record the decision, its scope, and any conditions alongside the affected work. Internal approval cannot waive a third party's license obligations.

If a conformance gap is discovered, document the affected components and versions, assign an owner, and agree on a correction. This may require restoring notices, providing source, obtaining appropriate rights, or replacing the component. Verify the correction in the affected artifacts and keep the resolution in the project's change history.
