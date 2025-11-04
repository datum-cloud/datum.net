/**
 * Example usage of the K8sClient wrapper
 *
 * This file demonstrates how to use the K8sClient to interact with
 * a Kubernetes API server using client certificate authentication.
 */

import { K8sClient } from '@libs/k8s-client';
import { createContact, type ContactSpec } from '@/src/types/k8s-resources';

/**
 * Example 1: Using default kubeconfig location
 */
async function exampleDefaultKubeconfig() {
  // Loads from ~/.kube/config or $KUBECONFIG environment variable
  const client = new K8sClient();

  console.log('Current context:', client.getCurrentContext());
  console.log('Current namespace:', client.getNamespace());
}

/**
 * Example 2: Using custom kubeconfig path
 */
async function exampleCustomKubeconfig() {
  const client = new K8sClient({
    kubeconfigPath: './my-kubeconfig.yaml',
    context: 'datum-cluster',
    namespace: 'milo-system',
  });

  console.log('Connected to:', client.getCurrentContext());
}

/**
 * Example 3: List custom resources
 */
async function exampleListContacts() {
  const client = new K8sClient({
    kubeconfigPath: process.env.KUBECONFIG,
  });

  try {
    const contacts = await client.listClusterCustomResources<ContactSpec>(
      'notification.miloapis.com',
      'v1alpha1',
      'contacts'
    );

    if (!contacts || !contacts.items || contacts.items.length === 0) {
      console.log('No contacts found');
      return;
    }

    console.log(`Found ${contacts.items.length} contacts across all namespaces:`);
    contacts.items.forEach((contact) => {
      const ns = contact.metadata.namespace || 'default';
      console.log(`- [${ns}] ${contact.metadata.name}: ${contact.spec.email}`);
    });
  } catch (error) {
    console.error('Error listing contacts:', error);
  }
}

/**
 * Example 4: Create a custom resource
 */
async function exampleCreateContact() {
  const client = new K8sClient({
    kubeconfigPath: process.env.KUBECONFIG,
    namespace: process.env.K8S_NAMESPACE || 'milo-system',
  });

  // Using the helper function
  const contactResource = createContact('john-doe', {
    email: 'john.doe@example.com',
    givenName: 'John',
    familyName: 'Doe',
    company: 'Datum',
    tags: ['newsletter', 'customer'],
  });

  try {
    const created = await client.createCustomResource<ContactSpec>(
      'notification.miloapis.com',
      'v1alpha1',
      'contacts',
      contactResource
    );

    console.log('Contact created:', created.metadata.name);
  } catch (error) {
    console.error('Error creating contact:', error);
  }
}

/**
 * Example 5: Get a specific resource
 */
async function exampleGetContact() {
  const client = new K8sClient({
    kubeconfigPath: process.env.KUBECONFIG,
  });

  try {
    const contact = await client.getCustomResource<ContactSpec>(
      'notification.miloapis.com',
      'v1alpha1',
      'contacts',
      'john-doe',
      'milo-system'
    );

    console.log('Contact details:');
    console.log('Name:', contact.metadata.name);
    console.log('Email:', contact.spec.email);
    console.log('Full name:', `${contact.spec.givenName} ${contact.spec.familyName}`);
  } catch (error) {
    console.error('Error getting contact:', error);
  }
}

/**
 * Example 6: Update a resource
 */
async function exampleUpdateContact() {
  const client = new K8sClient({
    kubeconfigPath: process.env.KUBECONFIG,
  });

  try {
    // First, get the existing resource
    const contact = await client.getCustomResource<ContactSpec>(
      'notification.miloapis.com',
      'v1alpha1',
      'contacts',
      'john-doe',
      'milo-system'
    );

    // Update the spec
    contact.spec.company = 'Updated Company';
    contact.spec.tags = [...(contact.spec.tags || []), 'vip'];

    // Save the update
    const updated = await client.updateCustomResource<ContactSpec>(
      'notification.miloapis.com',
      'v1alpha1',
      'contacts',
      'john-doe',
      contact,
      'milo-system'
    );

    console.log('Contact updated:', updated.metadata.name);
  } catch (error) {
    console.error('Error updating contact:', error);
  }
}

/**
 * Example 7: Delete a resource
 */
async function exampleDeleteContact() {
  const client = new K8sClient({
    kubeconfigPath: process.env.KUBECONFIG,
  });

  try {
    await client.deleteCustomResource(
      'notification.miloapis.com',
      'v1alpha1',
      'contacts',
      'john-doe',
      'milo-system'
    );

    console.log('Contact deleted');
  } catch (error) {
    console.error('Error deleting contact:', error);
  }
}

/**
 * Example 8: Using with existing miloapi pattern
 * This shows how to migrate from the existing fetch-based approach
 */
async function exampleMigrateFromMiloApi() {
  const client = new K8sClient({
    kubeconfigPath: process.env.KUBECONFIG || './kubeconfig.yaml',
    namespace: 'milo-system',
  });

  // Old approach (from miloapi.ts):
  // const response = await fetch(
  //   'https://api.staging.env.datum.net/apis/notification.miloapis.com/v1alpha1/namespaces/milo-system/contacts',
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: JSON.stringify(contactBody),
  //   }
  // );

  // New approach with K8sClient (uses client certificates from kubeconfig):
  const contact = createContact(`contact-${Date.now()}`, {
    email: 'user@example.com',
    givenName: 'Jane',
    familyName: 'Smith',
  });

  try {
    const created = await client.createCustomResource<ContactSpec>(
      'notification.miloapis.com',
      'v1alpha1',
      'contacts',
      contact
    );

    console.log('Contact created:', created.metadata.name);
    return true;
  } catch (error) {
    console.error('Error creating contact:', error);
    return false;
  }
}

/**
 * Example 9: Error handling and retry logic
 */
async function exampleWithRetry() {
  const client = new K8sClient({
    kubeconfigPath: process.env.KUBECONFIG,
  });

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const contacts = await client.listCustomResources<ContactSpec>(
        'notification.miloapis.com',
        'v1alpha1',
        'contacts'
      );

      console.log('Successfully retrieved contacts:', contacts.items.length);
      return contacts;
    } catch (error) {
      attempt++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Attempt ${attempt} failed:`, errorMessage);

      if (attempt >= maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${errorMessage}`);
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

/**
 * Example 10: Using environment variables for configuration
 */
async function exampleWithEnvConfig() {
  const client = new K8sClient({
    kubeconfigPath: process.env.KUBECONFIG,
    context: process.env.K8S_CONTEXT,
    namespace: process.env.K8S_NAMESPACE || 'milo-system',
  });

  console.log('Client configured from environment');
  return client;
}

// Export all examples
export {
  exampleDefaultKubeconfig,
  exampleCustomKubeconfig,
  exampleListContacts,
  exampleCreateContact,
  exampleGetContact,
  exampleUpdateContact,
  exampleDeleteContact,
  exampleMigrateFromMiloApi,
  exampleWithRetry,
  exampleWithEnvConfig,
};
