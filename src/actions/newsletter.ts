import { defineAction } from 'astro:actions';
import { z } from 'zod';

import { K8sClient } from '@libs/k8s-client';
import {
  createContact,
  createContactGroupMembership,
  type Contact,
  type ContactSpec,
  type ObjectRef,
} from '@/src/types/k8s-resources';
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
    const creds = parseCredentials(raw, {
      apiEndpoint: process.env.API_URL || import.meta.env.API_URL,
    });
    serviceAccount = { creds, getToken: createTokenSource(creds) };
  }
  return serviceAccount;
}

// The ContactGroup newsletter signups join. The email-newsletter enrollment policy only
// enrolls Contacts tied to a User, and signup Contacts have none, so the form adds them
// itself. Staging and production use different groups; unset means no group.
function getNewsletterGroup(): ObjectRef | undefined {
  const name =
    process.env.NEWSLETTER_CONTACT_GROUP_NAME || import.meta.env.NEWSLETTER_CONTACT_GROUP_NAME;
  if (!name) return undefined;
  const namespace =
    process.env.NEWSLETTER_CONTACT_GROUP_NAMESPACE ||
    import.meta.env.NEWSLETTER_CONTACT_GROUP_NAMESPACE ||
    'default';
  return { name, namespace };
}

// POST a notification.miloapis.com resource through the Datum API and return the HTTP status.
async function createViaApi(
  sa: ServiceAccount,
  plural: string,
  resource: { kind: string; metadata: { name: string; namespace?: string } }
): Promise<number> {
  const namespace = encodeURIComponent(resource.metadata.namespace ?? 'milo-system');
  const url = `${sa.creds.api_endpoint.replace(/\/$/, '')}/apis/notification.miloapis.com/v1alpha1/namespaces/${namespace}/${plural}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await sa.getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resource),
  });

  if (!response.ok) {
    console.error(
      `Newsletter signup: creating the ${resource.kind} failed (status ${response.status}):`,
      await response.text()
    );
    return response.status;
  }
  console.log(`${resource.kind} "${resource.metadata.name}" created through the Datum API.`);
  return response.status;
}

// Put the new Contact in the newsletter group. The Contact is already saved, so a failure
// here is logged but does not fail the signup: an error would make the visitor submit
// again and create a duplicate Contact. Staff can add a missed Contact from staff-portal.
async function joinNewsletterGroup(
  contact: Contact,
  create: (membership: ReturnType<typeof createContactGroupMembership>) => Promise<unknown>
): Promise<void> {
  const group = getNewsletterGroup();
  if (!group) return;
  try {
    await create(createContactGroupMembership(contact, group));
  } catch (error) {
    console.error(
      `Newsletter signup: adding Contact "${contact.metadata.name}" to group "${group.namespace}/${group.name}" failed:`,
      error
    );
  }
}

async function createContactViaApi(sa: ServiceAccount, contact: Contact): Promise<number> {
  const status = await createViaApi(sa, 'contacts', contact);
  if (status < 200 || status >= 300) return status;

  await joinNewsletterGroup(contact, async (membership) => {
    const membershipStatus = await createViaApi(sa, 'contactgroupmemberships', membership);
    if (membershipStatus < 200 || membershipStatus >= 300) {
      throw new Error(`Datum API answered ${membershipStatus}`);
    }
  });
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
          await joinNewsletterGroup(contactResource, (membership) =>
            client.createCustomResource(
              'notification.miloapis.com',
              'v1alpha1',
              'contactgroupmemberships',
              membership,
              membership.metadata.namespace
            )
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
