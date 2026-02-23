---
title: "datumctl activity history"
---
## datumctl activity history

View the change history of a specific resource

### Synopsis

View the change history of a specific resource over time by querying audit logs.

This command shows you the history of changes to a resource, displaying each modification
in chronological order. Use --diff to see what changed between consecutive versions.

The command accepts the resource type and name as separate arguments:
  - RESOURCE_TYPE: The type of resource (e.g., domains, dnsrecordsets, configmaps, secrets)
  - NAME: The name of the specific resource instance

Use the -n/--namespace flag for namespaced resources.

Examples:
  # View change history of a domain
  activity history domains miloapis-com-0c8dxl -n default

  # View change history of a DNS record set
  activity history dnsrecordsets dns-record-www-example-com -n production

  # View history with diff to see what changed
  activity history configmaps app-config -n default --diff

  # View changes from the last 7 days
  activity history secrets api-credentials -n default --start-time "now-7d"

  # Get all changes (fetch all pages)
  activity history domains example-com -n default --all-pages

  # Use different output formats
  activity history configmaps app-settings -n default -o json
  activity history secrets db-password -n default -o yaml

Output Modes:
  Default (table): Shows a table with timestamp, verb, user, and status code
  --diff: Shows unified diff between consecutive resource versions
  -o json/yaml: Output raw audit events in JSON or YAML format


```
datumctl activity history RESOURCE_TYPE NAME [flags]
```

### Options

```
      --all-pages                     Fetch all pages of results
      --allow-missing-template-keys   If true, ignore any errors in templates when a field or map key is missing in the template. Only applies to golang and jsonpath output formats. (default true)
      --continue-after string         Pagination cursor from previous query
      --diff                          Show diff between consecutive resource versions
      --end-time string               End time for the query (default: now) (default "now")
  -h, --help                          help for history
      --limit int32                   Maximum number of results per page (1-1000) (default 100)
  -o, --output string                 Output format. One of: (json, yaml, kyaml, name, go-template, go-template-file, template, templatefile, jsonpath, jsonpath-as-json, jsonpath-file).
      --show-managed-fields           If true, keep the managedFields when printing objects in JSON or YAML format.
      --start-time string             Start time for the query (default: now-30d) (default "now-30d")
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
      --log-flush-frequency duration   Maximum number of seconds between log flushes (default 5s)
  -n, --namespace string               If present, the namespace scope for this CLI request
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
```

### SEE ALSO

* [datumctl activity](/docs/datumctl/commands/datumctl_activity/)	 - Query control plane audit logs

###### Auto generated by spf13/cobra on 4-Feb-2026
