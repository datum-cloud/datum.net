import { defineAction } from 'astro:actions';
import { z } from 'zod';

import { K8sClient } from '@libs/k8s-client';
import { createContact, type Contact, type ContactSpec } from '@/src/types/k8s-resources';
import { generateRandomString } from '@libs/string';
import {
  createTokenSource,
  parseCredentials,
  type ServiceAccountCredentials,
} from '@libs/datumServiceAccount';

interface ServiceAccount {
  creds: ServiceAccountCredentials;
  getToken: () => Promise<string>;
}

let serviceAccount: ServiceAccount | undefined;

// Datum Compute has no kubeconfig, so there the form signs in as a service account
// (NEWSLETTER_SA_CREDENTIALS holds the credentials JSON from the Datum portal). Without
// it, fall back to the kubeconfig the Kubernetes deployment mounts.
function getServiceAccount(): ServiceAccount | undefined {
  const raw = process.env.NEWSLETTER_SA_CREDENTIALS || import.meta.env.NEWSLETTER_SA_CREDENTIALS;
  if (!raw) return undefined;
  if (!serviceAccount) {
    const creds = parseCredentials(raw);
    serviceAccount = { creds, getToken: createTokenSource(creds) };
  }
  return serviceAccount;
}

async function createContactViaApi(sa: ServiceAccount, contact: Contact): Promise<number> {
  const namespace = encodeURIComponent(contact.metadata.namespace ?? 'milo-system');
  const url = `${sa.creds.api_endpoint.replace(/\/$/, '')}/apis/notification.miloapis.com/v1alpha1/namespaces/${namespace}/contacts`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await sa.getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contact),
  });

  if (!response.ok) {
    console.error(
      `Newsletter signup: creating the Contact failed (status ${response.status}):`,
      await response.text()
    );
    return response.status;
  }
  console.log(`Contact "${contact.metadata.name}" created through the Datum API.`);
  // The API answers 201 Created; the form only treats 200 as success.
  return 200;
}

// Turn a caught error into the numeric status this action returns. The
// Kubernetes client throws ApiException with a numeric HTTP code; anything else
// (a missing kubeconfig is ENOENT, a refused connection is ECONNREFUSED) has a
// string code or none, and the client compares the result with 200.
function statusFromError(error: unknown): number {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  return typeof code === 'number' ? code : 500;
}

interface SignupInput {
  email: string;
  givenName: string;
  familyName: string;
}

const NewsletterSignup = defineAction({
  input: z.object({
    email: z.string(),
    givenName: z.string(),
    familyName: z.string(),
  }),
  handler: async (input: SignupInput): Promise<number> => {
    const emailName = input.email.split('@')[0].toLowerCase().replace(/\./g, '-');
    const uniqueId = `newsletter-${emailName}-${generateRandomString(6)}`;

    const namespace = import.meta.env.K8S_NAMESPACE || process.env.K8S_NAMESPACE || 'milo-system';
    const contactResource = createContact(
      uniqueId,
      {
        email: input.email,
        givenName: input.givenName,
        familyName: input.familyName,
      },
      namespace
    );

    try {
      const sa = getServiceAccount();
      if (sa) return await createContactViaApi(sa, contactResource);
    } catch (error) {
      console.error('Newsletter signup: service account request failed (status 500):', error);
      return 500;
    }

    const kubeconfigPath =
      import.meta.env.KUBECONFIG || process.env.KUBECONFIG || '.kube/config.yaml';

    try {
      const client = new K8sClient({ kubeconfigPath, namespace });

      try {
        const created = await client.createCustomResource<ContactSpec>(
          'notification.miloapis.com',
          'v1alpha1',
          'contacts',
          contactResource
        );

        if (created.metadata) {
          console.log(
            `Contact ${input.email} with name "${created.metadata.name}" created successfully.`
          );
          return 200;
        }
      } catch (error) {
        const status = statusFromError(error);
        console.error(`Newsletter signup: creating the Contact failed (status ${status}):`, error);
        return status;
      }
    } catch (error) {
      const status = statusFromError(error);
      console.error(
        `Newsletter signup: could not load kubeconfig "${kubeconfigPath}" (status ${status}):`,
        error
      );
      return status;
    }

    console.log('Unknown error during newsletter signup');
    return 500;
  },
});

export { NewsletterSignup };
