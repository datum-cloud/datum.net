---
title: "Activity"
sidebar:
  order: 3
---

The `datumctl activity` command is available for interacting with the [activity
service] we've made available to Datum Cloud consumers. The activity service
allows users to query for audit logs that are collected for all interactions
with the platform.

You can see the full list of commands and CLI options by using the `--help`
flag.

```
$ datumctl activity --help
```

This document will guide you through how to query the system using some of the
most frequently used commands.

[activity service]: https://github.com/datum-cloud/activity
[milo]: https://github.com/datum-cloud/milo

## Querying audit logs

The `datumctl activity query` command is available to query the system for audit
logs to understand what's happening within your organization and projects.

### Project and organization audit logs

Use the `--project` and `--organization` flag to control which context audit
logs are retrieved from.

```
$ datumctl activity query --project datum-cloud
TIMESTAMP             VERB     USER               NAMESPACE   RESOURCE          NAME       STATUS
2026-01-14 09:52:43   create   swells@datum.net               auditlogqueries              201
2026-01-14 09:44:09   get      swells@datum.net               dnszones                     201
2026-01-14 09:44:29   update   swells@datum.net               dnszones          datum.net  201
2026-01-14 09:50:22   delete   swells@datum.net               dnszones          datum.net  201
```

### Filtering

The `--filter` command is available to filter the audit logs returned in the
query. The filter option accepts a [CEL expression][cel] to select which audit
logs should be returned.

```
$ datumctl activity query --project datum-cloud --limit 10 --filter='user.username == "swells@datum.net" && objectRef.apiGroup == "networking.datumapis.com"'
TIMESTAMP             VERB   USER               NAMESPACE   RESOURCE   NAME        STATUS
2026-01-14 10:08:33   get    swells@datum.net   default     domains    datum.net   200
2026-01-14 10:08:40   get    swells@datum.net   default     domains    datum.net   200
2026-01-14 10:08:27   get    swells@datum.net   default     domains    datum.net   200
2026-01-14 10:08:40   get    swells@datum.net   default     domains    datum.net   200

No more results.
```

[cel]: https://cel.dev

### Pagination

The `--continue` option is available to paginate requests when additional
results are available. The CLI will provide the continue option to use for the
next page of requests.

```
$ datumctl activity query --project datum-cloud --limit 10 --filter='user.username == "swells@datum.net" && objectRef.apiGroup == "networking.datumapis.com"' --limit 3
TIMESTAMP             VERB   USER               NAMESPACE   RESOURCE   NAME        STATUS
2026-01-14 10:08:33   get    swells@datum.net   default     domains    datum.net   200
2026-01-14 10:08:40   get    swells@datum.net   default     domains    datum.net   200
2026-01-14 10:19:48   get    swells@datum.net   default     domains    datum.net   200

More results available. Use --continue-after '{continue-token}' to get the next page.
Or use --all-pages to fetch all results automatically.
```

You can also use the `--all-pages` option to retrieve all pages.

### Output

The `--output` or `-o` option is available to control the format that's
returned. By default the query command will output a table with common fields
that are helpful to users to understand the activity. You can also output the
results as `yaml` or `json` to see the full audit logs that were retrieved by
the query.

```
$ datumctl activity query --project datum-cloud -o yaml
apiVersion: audit.k8s.io/v1
items:
- annotations:
    authorization.k8s.io/decision: allow
    authorization.k8s.io/reason: ""
    platform.miloapis.com/scope.name: datum-cloud
    platform.miloapis.com/scope.type: project
  auditID: 5b842c5a-001f-45c3-97af-d76a4114e9ee
  level: Request
  objectRef:
    apiGroup: networking.datumapis.com
    apiVersion: v1alpha
    name: datum.net
    namespace: default
    resource: domains
  requestReceivedTimestamp: "2026-01-14T16:08:33.274159Z"
  requestURI: /apis/networking.datumapis.com/v1alpha/namespaces/default/domains/datum.net
  responseStatus:
    code: 200
    metadata: {}
  stage: ResponseComplete
  stageTimestamp: "2026-01-14T16:08:33.278787Z"
  user:
    extra:
      iam.miloapis.com/parent-api-group:
      - resourcemanager.miloapis.com
      iam.miloapis.com/parent-name:
      - datum-cloud
      iam.miloapis.com/parent-type:
      - Project
      iam.miloapis.com/registrationApproval:
      - Approved
    groups:
    - system:authenticated
    uid: "328747448287632651"
    username: swells@datum.net
  userAgent: axios/1.13.2
  verb: get
  ...
kind: EventList
metadata: {}
```
