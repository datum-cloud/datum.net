---
title: "datumctl activity feed"
sidebar:
  hidden: true
---

Query human-readable activity summaries

### Synopsis

Query human-readable activity summaries from the control plane.

Activities are translated from audit logs and events using ActivityPolicy rules,
providing human-friendly descriptions of what changed in your cluster.

Time Formats:
  Relative: "now-7d", "now-2h", "now-30m" (units: s, m, h, d, w)
  Absolute: "2024-01-01T00:00:00Z" (RFC3339 with timezone)

Output Formats:
  table (default): Structured view with timestamp, actor, source, and summary
  summary: Just the summaries, one per line
  json/yaml: Full activity objects

CEL Filters:
  spec.changeSource       - "human" or "system"
  spec.actor.name         - Actor display name
  spec.actor.type         - "user", "serviceaccount", "controller"
  spec.resource.kind      - Resource kind (Deployment, Pod, etc.)
  spec.resource.namespace - Resource namespace
  spec.resource.apiGroup  - API group
  spec.summary            - Activity summary text

Examples:
  ### Recent human activity
  kubectl activity feed --change-source human

  ### Activities for a specific actor
  kubectl activity feed --actor alice@example.com

  ### Deployment changes
  kubectl activity feed --kind Deployment

  ### Search for specific text
  kubectl activity feed --search "created HTTPProxy"

  ### Live feed of human changes
  kubectl activity feed --change-source human --watch

  ### Production namespace activity
  kubectl activity feed -n production

  ### Filter with CEL for complex queries
  kubectl activity feed --filter "spec.resource.kind in ['Deployment', 'StatefulSet']"

  ### Discover active users
  kubectl activity feed --suggest spec.actor.name


```
datumctl activity feed [flags]
```

### Options

```
      --actor string                  Filter by actor name
      --all-pages                     Fetch all pages of results
      --allow-missing-template-keys   If true, ignore any errors in templates when a field or map key is missing in the template. Only applies to golang and jsonpath output formats. (default true)
      --api-group string              Filter by API group
      --change-source string          Filter by change source: human, system
      --continue-after string         Pagination cursor from previous query
      --debug                         Show debug information
      --end-time string               End time (relative: 'now' or absolute: RFC3339) (default "now")
      --filter string                 CEL filter expression
  -h, --help                          help for feed
      --kind string                   Filter by resource kind (Deployment, Pod, etc.)
      --limit int32                   Maximum number of results per page (1-1000) (default 25)
  -n, --namespace string              Filter by resource namespace
      --no-headers                    Omit table headers
  -o, --output string                 Output format. One of: (json, yaml, kyaml, name, go-template, go-template-file, template, templatefile, jsonpath, jsonpath-as-json, jsonpath-file).
      --resource-uid string           Get history of specific resource by UID
      --search string                 Full-text search in summaries
      --show-managed-fields           If true, keep the managedFields when printing objects in JSON or YAML format.
      --start-time string             Start time (relative: 'now-7d' or absolute: RFC3339) (default "now-24h")
      --suggest string                Show distinct values for a field (facet query)
      --template string               Template string or path to template file to use when -o=go-template, -o=go-template-file. The template format is golang templates [http://golang.org/pkg/text/template/#pkg-overview].
  -w, --watch                         Watch for new activities
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
