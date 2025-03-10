---
title: Connecting to the API
description: "The Datum Cloud platform is comprised of multiple control planes that users can
interact with to manage their organization's resources."
---

The Datum Cloud platform is comprised of multiple control planes that users can
interact with to manage their organization's resources.

## Control Planes

A control plane is the central component responsible for managing and
reconciling resources within the system. It continuously monitors the declared
state of customer-defined configurations and ensures that the actual system
state aligns with those definitions.

The Datum Cloud control plane acts as the authoritative source of truth,
processing API requests, validating configurations, and coordinating underlying
infrastructure changes. It maintains resource consistency by detecting
deviations and automatically applying corrective actions.

There are two primary control planes that users will interact with to manage the
resources deployed within their organization.

- **Organizational Control Plane** - Manages resources that are attached to the
  organizational resource (e.g. Projects)
- **Project Control Plane** - Manages resources that make up an Organization's
  project

Most users will interact with a project control plane to manage resources.

### Organization Control Plane

The following base URL can be used to access an organization's control plane:

```shell
https://api.datum.net/apis/resourcemanager.datumapis.com/v1alpha/organizations/{organization_id}/control-plane
```

### Project Control Plane

Projects created in an organization's control plane will have their own control
plane created to manage resources. Use the following base URL to access a
project's control plane:

```shell
https://api.datum.net/apis/resourcemanager.datumapis.com/v1alpha/projects/{project_id}/control-plane
```

## API Discovery

Every control plane exports the APIs available in the control plane by exporting
an OpenAPI for each service at the `/openapi/v3` URL. For example, here's an
example that demonstrates some services available in an organization's control
plane.

```shell
$ curl -sS 'https://api.datum.net/apis/resourcemanager.datumapis.com/v1alpha/organizations/{organization_id}/control-plane/openapi/v3' \
   -H "Authorization: Bearer $(datumctl auth get-token)"

{
  "paths": {
    "apis/resourcemanager.datumapis.com/v1alpha": {
      "serverRelativeURL": "/openapi/v3/apis/resourcemanager.datumapis.com/v1alpha?hash=D0A1DF465E973D5C8FC30D065B864272955A66C14609154E7EAECC0426C71E99F3982ECBA4D5C6C92EC3DF497E159F2129D0F8A20CDC8E5746583D1BFEA80A52"
    },
  ]
}
```

The above command expects you've [setup the Datum CLI](../tasks/tools.md)

The URL provided in the response can be used to retrieve the OpenAPI v3 spec for
the service.
