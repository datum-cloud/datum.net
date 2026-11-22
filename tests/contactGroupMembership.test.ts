// Newsletter signups must land in the newsletter ContactGroup, which staff-portal shows at
// /marketing/contact-groups/<group>/members and newsletters are sent to. The
// email-newsletter enrollment policy only enrolls Contacts tied to a User, and signup
// Contacts have none, so the form creates the membership itself. Milo rejects a
// membership whose refs don't point at an existing Contact and ContactGroup, so these
// tests pin the refs: the Contact's own namespace (milo-system) and the group's (default).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createContact, createContactGroupMembership } from '../src/types/k8s-resources.ts';

const GROUP = { name: 'emailnewsletter-contact-group-3a3ar9', namespace: 'default' };

test('the membership points at the signup Contact in its own namespace', () => {
  const contact = createContact('newsletter-jane-ab12cd', { email: 'jane@example.com' });

  const membership = createContactGroupMembership(contact, GROUP);

  assert.equal(membership.kind, 'ContactGroupMembership');
  assert.equal(membership.apiVersion, 'notification.miloapis.com/v1alpha1');
  assert.deepEqual(membership.spec.contactRef, {
    name: 'newsletter-jane-ab12cd',
    namespace: 'milo-system',
  });
});

test('the membership lives in the group namespace, next to the ones staff-portal creates', () => {
  const contact = createContact('newsletter-jane-ab12cd', { email: 'jane@example.com' });

  const membership = createContactGroupMembership(contact, GROUP);

  assert.deepEqual(membership.spec.contactGroupRef, GROUP);
  assert.equal(membership.metadata.namespace, 'default');
});

test('a Contact in another namespace keeps that namespace in its ref', () => {
  const contact = createContact('newsletter-jane-ab12cd', { email: 'jane@example.com' }, 'default');

  const membership = createContactGroupMembership(contact, GROUP);

  assert.equal(membership.spec.contactRef.namespace, 'default');
});

test('each signup gets its own membership name, so two signups never collide', () => {
  const first = createContact('newsletter-jane-ab12cd', { email: 'jane@example.com' });
  const second = createContact('newsletter-jane-ef34gh', { email: 'jane@example.com' });

  assert.notEqual(
    createContactGroupMembership(first, GROUP).metadata.name,
    createContactGroupMembership(second, GROUP).metadata.name
  );
});
