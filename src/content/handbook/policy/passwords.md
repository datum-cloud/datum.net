---
title: Password policy
sidebar:
  label: Password policy
  order: 9
updatedDate: Nov 13, 2025
authors: jacob
meta:
  title: ""
  description: ""
---

To avoid potential security incidents, Datum requires employees to follow password requirements.

## Scope
This policy applies to passwords for any application or server accessed by Datum employees, contractors, or vendors. It does not apply to the passwords customers of Datum use to access the Datum service.

## Password Strength
* Passwords must be unique for each use. 
* Passwords must be randomly generated.
* Default passwords on all systems are changed after installation. Initial passwords generated for new users must be changed after login.
* Passwords do not need to be regularly rotated. However, if a password is known or thought to be compromised, it must be rotated to a new password.

## Single Sign-On
Where a third-party application supports single sign-on (SSO), it must be used.

## Multi-Factor Authentication
* Where a third-party application supports multi-factor authentication (MFA), it must be used. Use of multi-factor is enforced where possible.
* Acceptable forms of multi-factor authentication include authentication apps or a WebAuthn token. Embedded tokens (e.g., TouchID) are permitted. 

## Password Manager
Where SSO is not used, and where possible, passwords should be stored in a password manager.

## Encryption at Rest
Passwords should be stored encrypted at rest.

## Logging
Passwords should not be logged.

## Requirements for Specific Use Cases
* Servers - Access to servers, for both production as well as development and testing infrastructure, must be with a password and MFA or with per-user public keys (e.g., SSH keys). Only Datum-based network authentication is permitted for services not exposed to the Internet.
* Automated processes - Automated processes, including deployment or CI/CD tools, should use passwords or API keys to access and communicate with other systems. Passwords used in scripts must be encrypted at rest.
* End user devices - End user devices must use passwords to encrypt their disks and unlock the device. These must be unique for each individual but may be reused across an individual’s devices. These do not need to be randomly generated.
* SaaS applications or other software - Access to third party applications must use SSO where possible, MFA where possible, and enforce MFA where possible. An individual’s password for their password management vault must be unique. These do not need to be randomly generated.