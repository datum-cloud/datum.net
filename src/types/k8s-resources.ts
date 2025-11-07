/**
 * TypeScript type definitions for Datum custom Kubernetes resources
 */

import type { K8sCustomResource } from '@libs/k8s-client';

/**
 * Contact resource spec for notification.miloapis.com/v1alpha1
 */
export interface ContactSpec {
  email: string;
  givenName?: string;
  familyName?: string;
  phoneNumber?: string;
  company?: string;
  tags?: string[];
}

/**
 * Contact Custom Resource
 */
export type Contact = K8sCustomResource<ContactSpec>;

/**
 * Helper function to create a Contact resource
 */
export function createContact(
  name: string,
  spec: ContactSpec,
  namespace: string = 'milo-system'
): Contact {
  return {
    apiVersion: 'notification.miloapis.com/v1alpha1',
    kind: 'Contact',
    metadata: {
      name,
      namespace,
    },
    spec,
  };
}

/**
 * Example of other custom resource types you might define
 */

// Add additional resource types as needed
// export interface NotificationSpec { ... }
// export type Notification = K8sCustomResource<NotificationSpec>;
