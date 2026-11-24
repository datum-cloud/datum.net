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

export interface ObjectRef {
  name: string;
  namespace: string;
}

/**
 * ContactGroupMembership resource spec for notification.miloapis.com/v1alpha1
 */
export interface ContactGroupMembershipSpec {
  contactRef: ObjectRef;
  contactGroupRef: ObjectRef;
}

export type ContactGroupMembership = K8sCustomResource<ContactGroupMembershipSpec>;

/**
 * Builds the membership that puts a Contact in a ContactGroup. It lives in the group's
 * namespace, as the ones staff-portal creates do, and takes the Contact's name: each
 * signup Contact gets one newsletter membership, and that name is already unique.
 */
export function createContactGroupMembership(
  contact: Contact,
  group: ObjectRef
): ContactGroupMembership {
  return {
    apiVersion: 'notification.miloapis.com/v1alpha1',
    kind: 'ContactGroupMembership',
    metadata: {
      name: contact.metadata.name,
      namespace: group.namespace,
    },
    spec: {
      contactRef: {
        name: contact.metadata.name,
        namespace: contact.metadata.namespace ?? 'milo-system',
      },
      contactGroupRef: group,
    },
  };
}

/**
 * Example of other custom resource types you might define
 */

// Add additional resource types as needed
// export interface NotificationSpec { ... }
// export type Notification = K8sCustomResource<NotificationSpec>;
