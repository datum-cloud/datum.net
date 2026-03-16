---
title: "datumctl activity audit"
sidebar:
  hidden: true
---

Query audit logs from the control plane

### Synopsis

Query audit logs from the control plane with time ranges and filters.

This command allows you to search audit logs using time ranges, CEL filters,
and convenient shorthand flags for common patterns.

Time Formats:
  Relative: "now-7d", "now-2h", "now-30m" (units: s, m, h, d, w)
  Absolute: "2024-01-01T00:00:00Z" (RFC3339 with timezone)

Shorthand Filters:
  --namespace, --resource, --verb, --user flags are combined with AND logic.
  The --filter flag is applied after shorthand filters.

Common Filters:
  verb == 'delete'                                    # All deletions
  objectRef.namespace == 'production'                 # Events in production
  verb in ['create', 'update', 'delete', 'patch']     # Write operations
  responseStatus.code >= 400                          # Failed requests
  user.username.startsWith('system:serviceaccount:')  # Service account activity
  objectRef.resource == 'secrets'                     # Secret access

Examples:
  ### Recent activity (last 24 hours)
  kubectl activity audit

  ### Deletions in the last week
  kubectl activity audit --start-time "now-7d" --verb delete

  ### Production namespace activity
  kubectl activity audit --namespace production

  ### Failed operations
  kubectl activity audit --filter "responseStatus.code >= 400"

  ### Secret access by a specific user
  kubectl activity audit --resource secrets --user alice@example.com

  ### Export to JSON for processing
  kubectl activity audit --start-time "now-30d" --all-pages -o json > audit.json

  ### Discover what users have activity
  kubectl activity audit --suggest user.username

  ### Custom output format
  kubectl activity audit -o jsonpath='{.items[*].objectRef.name}'


```
datumctl activity audit [flags]
```

### Options

```
      --all-pages                     Fetch all pages of results
      --allow-missing-template-keys   If true, ignore any errors in templates when a field or map key is missing in the template. Only applies to golang and jsonpath output formats. (default true)
      --continue-after string         Pagination cursor from previous query
      --debug                         Show debug information
      --end-time string               End time (relative: 'now' or absolute: RFC3339) (default "now")
      --filter string                 CEL filter expression to narrow results
  -h, --help                          help for audit
      --limit int32                   Maximum number of results per page (1-1000) (default 25)
  -n, --namespace string              Filter by target namespace
      --no-headers                    Omit table headers
  -o, --output string                 Output format. One of: (json, yaml, kyaml, name, go-template, go-template-file, template, templatefile, jsonpath, jsonpath-as-json, jsonpath-file).
      --resource string               Filter by resource type (e.g., secrets, pods)
      --show-managed-fields           If true, keep the managedFields when printing objects in JSON or YAML format.
      --start-time string             Start time (relative: 'now-7d' or absolute: RFC3339) (default "now-24h")
      --suggest string                Show distinct values for a field (facet query)
      --template string               Template string or path to template file to use when -o=go-template, -o=go-template-file. The template format is golang templates [http://golang.org/pkg/text/template/#pkg-overview].
      --user string                   Filter by username
      --verb string                   Filter by API verb (create, update, delete, patch, get, list, watch)
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
  -v, --v Level                        number for the log level verbosity
      --vmodule moduleSpec             comma-separated list of pattern=N settings for file-filtered logging (only works for the default text log format)
      --warnings-as-errors             Treat warnings as errors
```

### See also

* [datumctl activity](/docs/datumctl/command/datumctl_activity/)	 - Query audit logs, events, and activity feeds

###### Auto generated by spf13/cobra on 13-Mar-2026
