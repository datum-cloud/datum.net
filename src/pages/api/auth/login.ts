import type { APIRoute } from 'astro';
import { OIDCClient } from '@libs/oidc';

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    const oidcClient = new OIDCClient();
    const result = await oidcClient.getAuthorizationUrl('login');
    const expired = new Date(Date.now() + 3600 * 1000); // 1 hour

    const cookieOptions = {
      path: '/',
      sameSite: 'lax' as 'none' | 'strict' | 'lax',
      secure: process.env.MODE === 'production', // Only secure in production
      expires: expired,
    };

    // Store redirect path
    const redirect_to = request.headers.get('redirect-to') || '/';
    cookies.set('redirect_uri', redirect_to, cookieOptions);

    // Store PKCE verifier and nonce
    if (result.codeVerifier) {
      cookies.set('codeVerifier', result.codeVerifier, cookieOptions);
    }

    if (result.nonce) {
      cookies.set('nonce', result.nonce, cookieOptions);
    }

    return new Response(
      JSON.stringify({
        authUrl: result.authUrl,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate auth URL',
        message: error instanceof Error ? error.message : 'Unknown error',
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
