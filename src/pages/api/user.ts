import type { APIRoute } from 'astro';

const API_URL = process.env.API_URL || import.meta.env.API_URL || 'https://api.datum.net';

interface Session {
  sub: string;
  accessToken: string;
  expiredAt: string;
}

// Helper to decode JWT without verification (for debugging)
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    return decoded;
  } catch {
    return null;
  }
}

export const GET: APIRoute = async ({ cookies }) => {
  try {
    // Get session from cookie
    const sessionCookie = cookies.get('_session')?.value;
    if (!sessionCookie) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Not authenticated',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const session: Session = JSON.parse(sessionCookie);

    const tokenPayload = decodeJWT(session.accessToken);
    console.log('Token payload:', JSON.stringify(tokenPayload, null, 2));

    // Try using ID token from cookie if available
    const idTokenCookie = cookies.get('_id_token')?.value;
    let tokenToUse = session.accessToken;

    if (idTokenCookie) {
      // const idTokenPayload = decodeJWT(idTokenCookie);
      // console.log('ID token payload:', JSON.stringify(idTokenPayload, null, 2));
      tokenToUse = idTokenCookie;
    }

    const url = `${API_URL}/apis/iam.miloapis.com/v1alpha1/users/${session.sub}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenToUse}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const userData = await response.json();

    // Transform API response to user object (similar to cloud-portal adapter)
    const user = {
      sub: userData.metadata?.name || session.sub,
      email: userData.spec?.email || '',
      firstName: userData.spec?.givenName || '',
      lastName: userData.spec?.familyName || '',
      fullName: `${userData.spec?.givenName || ''} ${userData.spec?.familyName || ''}`.trim(),
      avatarUrl: userData.status?.avatarUrl || null,
      picture: userData.status?.avatarUrl || null, // OIDC standard field
      name: `${userData.spec?.givenName || ''} ${userData.spec?.familyName || ''}`.trim(),
      given_name: userData.spec?.givenName || '',
      family_name: userData.spec?.familyName || '',
      preferred_username: userData.metadata?.name || '',
      email_verified: true,
      lastLoginProvider: userData.status?.lastLoginProvider || null,
      registrationApproval: userData.status?.registrationApproval || null,
      state: userData.status?.state || null,
      createdAt: userData.metadata?.creationTimestamp || null,
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: user,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching user:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

export const prerender = false;
