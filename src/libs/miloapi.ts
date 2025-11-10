async function createNewsletterContact(
  token: string,
  email: string,
  familyName: string,
  givenName: string
): Promise<boolean> {
  try {
    const body = JSON.stringify({
      apiVersion: 'notification.miloapis.com/v1alpha1',
      kind: 'Contact',
      metadata: {
        name: 'newsletter-contact-sample-3',
        namespace: 'milo-system',
      },
      spec: {
        email,
        familyName,
        givenName,
      },
    });
    console.log('Request body for creating newsletter contact:', body);

    const host =
      process.env.MODE === 'development'
        ? 'https://api.staging.env.datum.net'
        : 'https://api.datum.net';

    const response = await fetch(
      host + '/apis/notification.miloapis.com/v1alpha1/namespaces/milo-system/contacts',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      }
    );

    if (!response.ok) {
      console.log('Failed to create newsletter contact:', response);
      return false;
    }
    const jsonResponse = await response.json();
    console.log('Newsletter contact created:', jsonResponse);

    return true;
  } catch (error) {
    console.error('Error creating newsletter contact:', error);
    return false;
  }
}

export { createNewsletterContact };
