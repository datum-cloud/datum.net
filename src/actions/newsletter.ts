import { defineAction } from 'astro:actions';
import { z } from 'astro:content';

import { K8sClient } from '@libs/k8s-client';
import { createContact, type ContactSpec } from '@/src/types/k8s-resources';
import { generateRandomString } from '@libs/string';

interface SignupInput {
  email: string;
}

const signup = defineAction({
  input: z.object({
    email: z.string(),
  }),
  handler: async (input: SignupInput): Promise<boolean> => {
    const emailName = input.email.split('@')[0].toLowerCase().replace(/\./g, '-');
    const uniqueId = `newsletter-${emailName}-${generateRandomString(6)}`;

    try {
      const client = new K8sClient({
        kubeconfigPath: import.meta.env.KUBECONFIG || process.env.KUBECONFIG || '.kube/config.yaml',
        namespace: import.meta.env.K8S_NAMESPACE || process.env.K8S_NAMESPACE || 'milo-system',
      });

      const contactResource = createContact(uniqueId, {
        email: input.email,
      });

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
          return true;
        }
      } catch (error) {
        console.log('Error creating contact resource:', error);
        return false;
      }
    } catch (error) {
      console.log('Error signing up for newsletter:', error);
      return false;
    }

    console.log('Unknown error during newsletter signup');
    return false;
  },
});

export { signup };
