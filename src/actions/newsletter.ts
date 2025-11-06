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
  handler: async (input: SignupInput): Promise<{ success: boolean; message?: string }> => {
    const emailName = input.email.split('@')[0].toLowerCase().replace(/\./g, '-');
    const uniqueId = `newsletter-${emailName}-${generateRandomString(6)}`;

    try {
      const client = new K8sClient({
        kubeconfigPath: import.meta.env.KUBECONFIG || process.env.KUBECONFIG || '.kube/config.yaml',
        namespace: import.meta.env.K8S_NAMESPACE || process.env.K8S_NAMESPACE || 'milo-system',
      });

      const contactResource = createContact(uniqueId, {
        email: input.email,
        givenName: emailName,
        familyName: '',
      });

      try {
        const created = await client.createCustomResource<ContactSpec>(
          'notification.miloapis.com',
          'v1alpha1',
          'contacts',
          contactResource
        );

        if (created.metadata) {
          return {
            success: true,
            message: `Contact ${created.metadata.name} created successfully.`,
          };
        }
      } catch (error) {
        return { success: false, message: error?.toString() };
      }
    } catch (error) {
      return { success: false, message: error?.toString() };
    }

    return { success: false, message: 'Unknown error' };
  },
});

export { signup };
