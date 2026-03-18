---
title: "datumctl activity events"
sidebar:
  hidden: true
---

Query Kubernetes events with extended retention

### Synopsis

Query Kubernetes events with 60-day retention (vs. 24 hours in native Events API).

This command provides access to historical Kubernetes events stored in ClickHouse,
allowing you to investigate past issues and track event patterns over time.

Time Formats:
  Relative: "now-7d", "now-2h", "now-30m" (units: s, m, h, d, w)
  Absolute: "2024-01-01T00:00:00Z" (RFC3339 with timezone)

Field Selectors:
  Use standard Kubernetes field selector syntax (e.g., "type=Warning").
  Multiple conditions are comma-separated (all must match).

  Supported fields:
    - type: Normal or Warning
    - reason: Event reason (FailedMount, Pulled, etc.)
    - regarding.kind: Pod, Deployment, etc.
    - regarding.name: Specific object name
    - regarding.namespace: Namespace of regarding object

Examples:
  ### Recent events (last 24 hours)
  kubectl activity events

  ### Warning events in the last week
  kubectl activity events --start-time "now-7d" --type Warning

  ### Events for a specific pod
  kubectl activity events --regarding-name my-pod --regarding-kind Pod

  ### Mount failures
  kubectl activity events --reason FailedMount

  ### Events in production namespace
  kubectl activity events -n production

  ### Use standard field selector
  kubectl activity events --field-selector "regarding.kind=Pod,type=Warning"

  ### Discover what reasons exist
  kubectl activity events --suggest reason


```
datumctl activity events [flags]
```

### Options

```
      --all-pages                     Fetch all pages of results
      --allow-missing-template-keys   If true, ignore any errors in templates when a field or map key is missing in the template. Only applies to golang and jsonpath output formats. (default true)
      --continue-after string         Pagination cursor from previous query
      --debug                         Show debug information
      --end-time string               End time (relative: 'now' or absolute: RFC3339) (default "now")
      --field-selector string         Standard Kubernetes field selector
  -h, --help                          help for events
      --limit int32                   Maximum number of results per page (1-1000) (default 25)
  -n, --namespace string              Filter by namespace
      --no-headers                    Omit table headers
  -o, --output string                 Output format. One of: (json, yaml, kyaml, name, go-template, go-template-file, template, templatefile, jsonpath, jsonpath-as-json, jsonpath-file).
      --reason string                 Filter by event reason (e.g., FailedMount, Pulled)
      --regarding-kind string         Filter by regarding object kind (Pod, Deployment)
      --regarding-name string         Filter by regarding object name
      --show-managed-fields           If true, keep the managedFields when printing objects in JSON or YAML format.
      --start-time string             Start time (relative: 'now-7d' or absolute: RFC3339) (default "now-24h")
      --suggest string                Show distinct values for a field (facet query)
      --template string               Template string or path to template file to use when -o=go-template, -o=go-template-file. The template format is golang templates [http://golang.org/pkg/text/template/#pkg-overview].
      --type string                   Filter by event type: Normal, Warning
```

### Options inherited from parent commands

```
      --as string                      Username to impersonate for the operation. User could be a regular user or a service account in a namespace.
      --as-group stringArray           Group to impersonate for the operation, this flag can be repeated to specify multiple groups.
      --as-uid string                  UID to impersonate for the operation.
      --as-user-extra stringArray      User extras to impersonate for the operation, this flag can be repeated to specify multiple values for the same key.
      --certificate-authority string   Path to a cert file for the certificate authority
      --disable-compression            If true, opt-out of response compression for all requests to the server
      --insecure-skip-tls-verify       If true, the server's certificate will not be checked for validity. This will make your HTTPS connections insecure
      --log-flush-frequency duration   Maximum number of seconds between log flushes (default 5s)
      --organization string            organization name
      --platform-wide                  access the platform root instead of a project or organization control plane
      --project string                 project name
      --request-timeout string         The length of time to wait before giving up on a single server request. Non-zero values should contain a corresponding time unit (e.g. 1s, 2m, 3h). A value of zero means don't timeout requests. (default "0")
  -s, --server string                  The address and port of the Kubernetes API server
      --tls-server-name string         Server name to use for server certificate validation. If it is not provided, the hostname used to contact the server is used
      --token string                   Bearer token for authentication to the API server
      --user string                    The name of the kubeconfig user to use
  -v, --v Level                        number for the log level verbosity
      --vmodule moduleSpec             comma-separated list of pattern=N settings for file-filtered logging (only works for the default text log format)
      --warnings-as-errors             Treat warnings as errors
```

### See also

* [datumctl activity](/docs/datumctl/command/datumctl_activity/)	 - Query audit logs, events, and activity feeds

###### Auto generated by spf13/cobra on 13-Mar-2026
