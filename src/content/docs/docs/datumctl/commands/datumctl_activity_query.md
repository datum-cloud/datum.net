---
title: "datumctl activity query"
---
## datumctl activity query

Query control plane audit logs

### Synopsis

Query control plane audit logs from the activity API server.

This command allows you to search audit logs using time ranges and CEL filters.
Results can be displayed in various formats using standard kubectl output options.

Examples:
  # Query events from the last 24 hours (default)
  activity query

  # Query events from the last hour
  activity query --start-time "now-1h" --end-time "now"

  # Query deletions in the production namespace
  activity query --start-time "now-7d" --end-time "now" \
    --filter "verb == 'delete' && objectRef.namespace == 'production'"

  # Query with absolute timestamps
  activity query --start-time "2024-01-01T00:00:00Z" --end-time "2024-01-02T00:00:00Z"

  # Get all results across multiple pages
  activity query --start-time "now-7d" --end-time "now" --all-pages

  # Output as JSON or YAML
  activity query -o json
  activity query -o yaml

  # Use JSONPath to extract specific fields
  activity query -o jsonpath='{.items[*].verb}'

  # Use Go templates for custom output
  activity query -o go-template='{{range .items}}{{.verb}} {{.user.username}}{{"\n"}}{{end}}'

Time Formats:
  Relative: "now-7d", "now-2h", "now-30m" (units: s, m, h, d, w)
  Absolute: "2024-01-01T00:00:00Z" (RFC3339 with timezone)

Common Filters:
  verb == 'delete'                                    - All deletions
  objectRef.namespace == 'production'                 - Events in production
  verb in ['create', 'update', 'delete', 'patch']     - Write operations
  responseStatus.code >= 400                          - Failed requests
  user.username.startsWith('system:serviceaccount:')  - Service account activity
  objectRef.resource == 'secrets'                     - Secret access


```
datumctl activity query [flags]
```

### Options

```
      --all-pages                     Fetch all pages of results (ignores --continue-after)
      --allow-missing-template-keys   If true, ignore any errors in templates when a field or map key is missing in the template. Only applies to golang and jsonpath output formats. (default true)
      --continue-after string         Pagination cursor from previous query
      --end-time string               End time for the query (default: now, e.g., 'now' or '2024-01-02T00:00:00Z') (default "now")
      --filter string                 CEL filter expression to narrow results
  -h, --help                          help for query
      --limit int32                   Maximum number of results per page (1-1000) (default 25)
  -o, --output string                 Output format. One of: (json, yaml, kyaml, name, go-template, go-template-file, template, templatefile, jsonpath, jsonpath-as-json, jsonpath-file).
      --show-managed-fields           If true, keep the managedFields when printing objects in JSON or YAML format.
      --start-time string             Start time for the query (default: now-24h, e.g., 'now-7d' or '2024-01-01T00:00:00Z') (default "now-24h")
      --template string               Template string or path to template file to use when -o=go-template, -o=go-template-file. The template format is golang templates [http://golang.org/pkg/text/template/#pkg-overview].
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
  -n, --namespace string               If present, the namespace scope for this CLI request
      --organization string            organization name
      --project string                 project name
      --request-timeout string         The length of time to wait before giving up on a single server request. Non-zero values should contain a corresponding time unit (e.g. 1s, 2m, 3h). A value of zero means don't timeout requests. (default "0")
  -s, --server string                  The address and port of the Kubernetes API server
      --tls-server-name string         Server name to use for server certificate validation. If it is not provided, the hostname used to contact the server is used
      --token string                   Bearer token for authentication to the API server
      --user string                    The name of the kubeconfig user to use
```

### SEE ALSO

* [datumctl activity](/docs/datumctl/commands/datumctl_activity/)	 - Query control plane audit logs

###### Auto generated by spf13/cobra on 20-Jan-2026
