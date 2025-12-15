---
title: "Information classification policy"
sidebar:
  label: Information classification policy
  order: 3
updatedDate: Nov 13, 2025
authors: jacob
meta:
  title: "Datum Information Classification Policy"
  description: "Read Datum's Information Classification Policy. Definitions of data sensitivity levels—Public, Internal, and Confidential—and standards for data protection."
---

To understand its potential exposure from a security risk, issue or incident, Datum regularly catalogues and classifies its data and other in-scope assets, in order to apply risk-based controls.
Assets are anything that has value to the organization, including but not limited to, customer data, production data, financial data, intellectual property, and any material non-public information.

## Asset cataloging
Datum catalogues assets with several pieces of information, to help identify the potential risk of the asset. Information collected is as follows:
* **Description**, i.e. what is the asset?
* **Risk**, i.e. what is the asset risk classification?
* **Use**, i.e. how is this asset used?
* **Location**, i.e. where is it stored, used, and backed up?
* **Sharing**, i.e. is it shared with any third parties, such as vendors? Which specific third parties?

If new data is catalogued, or data use changes, it should be specifically reviewed to verify that its collection and use is in line with [Datum's Privacy Policy](https://www.datum.net/legal/privacy/).

## Asset risk classification
Datum classifies assets into three risk categories: Low Risk, Medium Risk, and High Risk. The definitions are as follows:

| Risk Category | Definition |
| :--- | :--- |
| High Risk | **Data**: protection is mandated by confidentiality agreements, labor codes, specific laws and regulations (e.g. PCI DSS, HIPAA, GDPR), or data is subject to breach reporting requirements, or disclosure would have a significant adverse impact on Datum (e.g., user accounts database). |
| | **Hardware and software system**s: compromise would have a significant adverse impact on Datum (e.g. the cloud.datum.net control plane service). |
| Medium Risk | **Data**: not generally available to the public, and disclosure would have some adverse impact on Datum (e.g. internal engineering documentation). |
| | **Hardware and software system**s: compromise would have some adverse impact on Datum (e.g. infrastructure running production monitoring system). |
| Low Risk | **Data**: publicly available, or disclosure would have no adverse operational or financial impact on Datum. May still have some limited reputational impact. |
| | **Hardware and software system**s: compromise would have no adverse impact on Datum (e.g. dev environment with no user data or privileged access). |

When multiple classifications may apply, the highest applicable classification is used. For example, if a machine is low-risk by itself, but can be used to access high-risk data, its overall classification is also high-risk.

## Schedule
Datum reviews the data it collects and processes, and updates the data register, quarterly.