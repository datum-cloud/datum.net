# Integrate with Milo API for Local Development

This guide shows you how to connect to the Milo API server from your local development environment. You'll authenticate using `datumctl` with your Datum Cloud staff account.

## Prerequisites

Before you begin, verify that you have:

- Node.js 18.20.8 or later installed
- Go installed (to install `datumctl`)
- A Datum Cloud staff account
- Access to the Milo API server endpoint (`https://api.staging.env.datum.net`)

## Install datumctl

Install the `datumctl` command-line tool:

```bash
go install go.datum.net/datumctl@latest
```

Verify the installation:

```bash
datumctl version
```

## Authenticate with Datum Cloud

Log in to your Datum Cloud staff account:

```bash
datumctl auth login --hostname auth.staging.env.datum.net
```

This command opens your browser and prompts you to authenticate. After successful authentication, `datumctl` stores your credentials locally.

## Set up your project

This project includes a Kubernetes client wrapper that handles authentication with the Milo API server.

### Install dependencies

If you haven't already, install the project dependencies:

```bash
npm install
```

The `@kubernetes/client-node` package is already included in the dependencies.

## Configure authentication

The Kubernetes client uses a kubeconfig file for authentication. The kubeconfig uses an **exec plugin** that calls `datumctl` to retrieve authentication tokens dynamically.

### Create your kubeconfig file

Create a kubeconfig file with the following structure:

```yaml
apiVersion: v1
clusters:
- cluster:
    server: https://api.staging.env.datum.net
  name: datum-organization-scots-real-org
contexts:
- context:
    cluster: datum-organization-scots-real-org
    user: datum-user
  name: datum-organization-scots-real-org
current-context: datum-organization-scots-real-org
kind: Config
preferences: {}
users:
- name: datum-user
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1
      args:
      - auth
      - get-token
      - --output=client.authentication.k8s.io/v1
      command: datumctl
      env: null
      interactiveMode: IfAvailable
      provideClusterInfo: false
```

### Store your kubeconfig file

Save your kubeconfig file to one of these locations:

1. **Project directory**: `./datumcfg` (recommended for local development)
3. **Custom location**: Any path you specify

### How authentication works

When you use the Kubernetes client:

1. The client reads your kubeconfig file
2. The kubeconfig specifies an **exec plugin** that runs `datumctl auth get-token`
3. `datumctl` retrieves a valid authentication token from your logged-in session
4. The token is used to authenticate API requests to the Milo API server

This approach provides:
- **Dynamic tokens**: Tokens are generated on-demand and automatically refreshed
- **No stored credentials**: No client certificates or keys to manage
- **SSO integration**: Uses your Datum Cloud staff account

## Use the Kubernetes client

The project includes a pre-built client wrapper at `src/libs/k8s-client.ts`. This section shows you how to use it.

### Create a client instance

Import and initialize the client:

```typescript
import { K8sClient } from '@libs/k8s-client';

// Use the datumcfg file from your project directory
const client = new K8sClient({
  kubeconfigPath: process.env.KUBECONFIG || './datumcfg',
  namespace: 'milo-system'
});
```

The client automatically uses the exec plugin to call `datumctl` for authentication.

### List resources

List all Contact resources in the `milo-system` namespace:

```typescript
import { K8sClient } from '@libs/k8s-client';
import type { ContactSpec } from '@/src/types/k8s-resources';

const client = new K8sClient({
  kubeconfigPath: './config/kubeconfig.yaml',
});

async function listContacts() {
  try {
    const contacts = await client.listCustomResources<ContactSpec>(
      'notification.miloapis.com',
      'v1alpha1',
      'contacts',
      'milo-system'
    );

    console.log(`Found ${contacts.items.length} contacts`);
    contacts.items.forEach((contact) => {
      console.log(`- ${contact.metadata.name}: ${contact.spec.email}`);
    });
  } catch (error) {
    console.error('Failed to list contacts:', error);
  }
}
```

### Create a resource

Create a new Contact resource:

```typescript
import { K8sClient } from '@libs/k8s-client';
import { createContact, type ContactSpec } from '@/src/types/k8s-resources';

const client = new K8sClient({
  kubeconfigPath: './config/kubeconfig.yaml',
  namespace: 'milo-system',
});

async function createNewContact() {
  const contact = createContact('john-doe', {
    email: 'john.doe@example.com',
    givenName: 'John',
    familyName: 'Doe',
    company: 'Example Corp',
  });

  try {
    const created = await client.createCustomResource<ContactSpec>(
      'notification.miloapis.com',
      'v1alpha1',
      'contacts',
      contact
    );

    console.log('Contact created:', created.metadata.name);
  } catch (error) {
    console.error('Failed to create contact:', error);
  }
}
```

### Get a specific resource

Retrieve a single Contact by name:

```typescript
async function getContact(name: string) {
  try {
    const contact = await client.getCustomResource<ContactSpec>(
      'notification.miloapis.com',
      'v1alpha1',
      'contacts',
      name,
      'milo-system'
    );

    console.log('Contact details:');
    console.log('Email:', contact.spec.email);
    console.log('Name:', `${contact.spec.givenName} ${contact.spec.familyName}`);
  } catch (error) {
    console.error('Failed to get contact:', error);
  }
}
```

### Update a resource

Modify an existing Contact resource:

```typescript
async function updateContact(name: string) {
  try {
    // Get the current resource
    const contact = await client.getCustomResource<ContactSpec>(
      'notification.miloapis.com',
      'v1alpha1',
      'contacts',
      name,
      'milo-system'
    );

    // Modify the spec
    contact.spec.company = 'Updated Company Name';

    // Save the changes
    const updated = await client.updateCustomResource<ContactSpec>(
      'notification.miloapis.com',
      'v1alpha1',
      'contacts',
      name,
      contact,
      'milo-system'
    );

    console.log('Contact updated:', updated.metadata.name);
  } catch (error) {
    console.error('Failed to update contact:', error);
  }
}
```

### Delete a resource

Remove a Contact resource:

```typescript
async function deleteContact(name: string) {
  try {
    await client.deleteCustomResource(
      'notification.miloapis.com',
      'v1alpha1',
      'contacts',
      name,
      'milo-system'
    );

    console.log('Contact deleted:', name);
  } catch (error) {
    console.error('Failed to delete contact:', error);
  }
}
```

## Use environment variables

Configure the client using environment variables for flexibility across environments:

```typescript
const client = new K8sClient({
  kubeconfigPath: process.env.KUBECONFIG,
  context: process.env.K8S_CONTEXT,
  namespace: process.env.K8S_NAMESPACE || 'milo-system',
});
```

Create a `.env` file in your project root:

```bash
KUBECONFIG=./config/kubeconfig.yaml
K8S_CONTEXT=milo-context
K8S_NAMESPACE=milo-system
```

## Troubleshoot common issues

### Authentication fails

If you see authentication errors:

1. Verify that your kubeconfig file contains valid certificates
2. Check that the certificates haven't expired
3. Confirm that your client certificate is trusted by the API server's CA

To check certificate expiration:

```bash
# Extract and check client certificate
echo "<base64-cert-data>" | base64 -d | openssl x509 -noout -dates
```

### Connection refused

If the client cannot connect to the API server:

1. Verify the server URL in your kubeconfig matches the API server endpoint
2. Check that your network can reach the API server
3. Confirm that the API server is running

Test connectivity:

```bash
curl -k https://api.staging.env.datum.net/healthz
```

### Resource not found

If you receive "resource not found" errors:

1. Verify the resource exists in the specified namespace
2. Check that you're using the correct API group, version, and plural name
3. Confirm that your user has permission to access the resource

## Additional resources

For more examples, see:

- [src/examples/k8s-client-example.ts](../../examples/k8s-client-example.ts) - Comprehensive usage examples
- [src/libs/k8s-client.ts](../../libs/k8s-client.ts) - Full API documentation
- [src/types/k8s-resources.ts](../../types/k8s-resources.ts) - Type definitions

## Next steps

Now that you can authenticate with the Milo API server:

1. Explore the available custom resource types in your cluster
2. Create integration tests for your application
3. Build features that interact with Milo resources
