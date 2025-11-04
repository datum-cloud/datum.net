# K8s Client Examples - Testing Guide

This directory contains examples and a test runner for the Kubernetes client wrapper.

## Quick Start

### 1. Set up your kubeconfig

Create a kubeconfig file with your client certificates. You can place it in one of these locations:

- `~/.kube/config` (default)
- Custom path (e.g., `./config/kubeconfig.yaml`)

Example kubeconfig structure:

```yaml
apiVersion: v1
kind: Config
clusters:
- cluster:
    certificate-authority-data: <base64-ca-cert>
    server: https://api.staging.env.datum.net
  name: milo-cluster
contexts:
- context:
    cluster: milo-cluster
    user: milo-user
    namespace: milo-system
  name: milo-context
current-context: milo-context
users:
- name: milo-user
  user:
    client-certificate-data: <base64-client-cert>
    client-key-data: <base64-client-key>
```

### 2. Set environment variables (optional)

```bash
export KUBECONFIG=./config/kubeconfig.yaml
export K8S_CONTEXT=milo-context
export K8S_NAMESPACE=milo-system
```

### 3. Run the examples

```bash
# Using the datumcfg file (recommended for Datum Cloud staff)
KUBECONFIG=datumcfg npm run example:k8s -- list

# Or set it as an environment variable
export KUBECONFIG=datumcfg

# Show help and available commands
npm run example:k8s -- help

# Show cluster information
npm run example:k8s -- info

# List all contacts
npm run example:k8s -- list

# Create a new contact
npm run example:k8s -- create

# Get a specific contact
npm run example:k8s -- get john-doe

# Update a contact
npm run example:k8s -- update john-doe

# Delete a contact
npm run example:k8s -- delete john-doe

# Run multiple examples
npm run example:k8s -- all
```

## Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `help` | Show all available commands | `npm run example:k8s -- help` |
| `info` | Display cluster and context information | `npm run example:k8s -- info` |
| `config` | Test custom kubeconfig loading | `npm run example:k8s -- config` |
| `list` | List all Contact resources | `npm run example:k8s -- list` |
| `create` | Create a new Contact | `npm run example:k8s -- create` |
| `get <name>` | Get a specific Contact by name | `npm run example:k8s -- get john-doe` |
| `update <name>` | Update an existing Contact | `npm run example:k8s -- update john-doe` |
| `delete <name>` | Delete a Contact | `npm run example:k8s -- delete john-doe` |
| `retry` | Test retry logic with error handling | `npm run example:k8s -- retry` |
| `env` | Test environment variable configuration | `npm run example:k8s -- env` |
| `all` | Run multiple examples sequentially | `npm run example:k8s -- all` |

## Testing Workflow

### Complete test cycle

```bash
# 1. Check cluster connectivity
npm run example:k8s -- info

# 2. List existing contacts
npm run example:k8s -- list

# 3. Create a test contact
npm run example:k8s -- create

# 4. Get the created contact
npm run example:k8s -- get john-doe

# 5. Update the contact
npm run example:k8s -- update john-doe

# 6. Clean up - delete the contact
npm run example:k8s -- delete john-doe
```

## Using Custom Kubeconfig

If your kubeconfig is in a custom location:

```bash
# Set the environment variable
export KUBECONFIG=./my-custom-kubeconfig.yaml

# Or pass it inline
KUBECONFIG=./config/test-kubeconfig.yaml npm run example:k8s -- list
```

## Troubleshooting

### Authentication Errors

If you see authentication errors:

1. Verify your kubeconfig file exists and has correct permissions:
   ```bash
   ls -la ~/.kube/config
   chmod 600 ~/.kube/config
   ```

2. Check if certificates are expired:
   ```bash
   # Extract cert data from kubeconfig and check expiration
   kubectl config view --raw -o jsonpath='{.users[0].user.client-certificate-data}' | base64 -d | openssl x509 -noout -dates
   ```

3. Test connectivity to the API server:
   ```bash
   curl -k https://api.staging.env.datum.net/healthz
   ```

### Connection Errors

If you can't connect to the API server:

1. Check your network connection
2. Verify the server URL in your kubeconfig
3. Ensure the API server is running

### Resource Not Found

If resources aren't found:

1. Verify you're using the correct namespace
2. Check the resource exists:
   ```bash
   kubectl get contacts -n milo-system
   ```
3. Confirm you have permission to access the resource

## Development

### Running individual example functions

You can import and run example functions directly in your code:

```typescript
import { exampleListContacts } from './k8s-client-example';

async function myFunction() {
  await exampleListContacts();
}
```

### Creating custom examples

Add new example functions to `k8s-client-example.ts`:

```typescript
export async function myCustomExample() {
  const client = new K8sClient({
    kubeconfigPath: process.env.KUBECONFIG,
  });

  // Your custom logic here
}
```

Then add the command to `test-k8s-client.ts`:

```typescript
case 'mycustom':
  console.log('Running my custom example...');
  await myCustomExample();
  break;
```

## Files

- `k8s-client-example.ts` - Example functions for all K8s client operations
- `test-k8s-client.ts` - CLI test runner
- `README.md` - This file

## Related Documentation

- [Integration Guide](../content/docs/docs/guides/integration-with-milo.mdx)
- [K8s Client API](../libs/k8s-client.ts)
- [Type Definitions](../types/k8s-resources.ts)
