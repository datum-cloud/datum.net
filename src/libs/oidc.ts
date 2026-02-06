import * as client from 'openid-client';
import type { TokenEndpointResponse, UserInfoResponse, IDToken } from 'openid-client';

const server = process.env.AUTH_OIDC_ISSUER || import.meta.env.AUTH_OIDC_ISSUER || '';
const clientId = process.env.AUTH_OIDC_CLIENT_ID || import.meta.env.AUTH_OIDC_CLIENT_ID || '';
const clientSecret =
  process.env.AUTH_OIDC_CLIENT_SECRET || import.meta.env.AUTH_OIDC_CLIENT_SECRET || '';
const redirect_uri =
  process.env.AUTH_OIDC_REDIRECT_URI || import.meta.env.AUTH_OIDC_REDIRECT_URI || '';

if (!server || !clientId || !redirect_uri) {
  throw new Error(
    'Missing required OIDC configuration. Please set AUTH_OIDC_ISSUER, AUTH_OIDC_CLIENT_ID, and AUTH_OIDC_REDIRECT_URI environment variables.'
  );
}

export interface CallbackResult {
  tokens: TokenEndpointResponse;
  userInfo: UserInfoResponse | null;
  claims: IDToken | null;
}

export class OIDCClient {
  /**
   * Generate authorization URL with PKCE
   */
  async getAuthorizationUrl(prompt: 'none' | 'select_account' | 'login' | 'create'): Promise<{
    authUrl: string;
    codeVerifier: string;
    nonce?: string;
  }> {
    const codeVerifier = client.randomPKCECodeVerifier();
    const code_challenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const config: client.Configuration = await client.discovery(
      new URL(server),
      clientId,
      clientSecret
    );
    const parameters: Record<string, string> = {
      redirect_uri,
      scope: 'openid profile email',
      code_challenge,
      code_challenge_method: 'S256',
      prompt,
    };

    let nonce: string | undefined = undefined;

    // Add nonce if PKCE is not supported
    if (!config.serverMetadata().supportsPKCE()) {
      nonce = client.randomNonce();
      parameters.nonce = nonce;
    }

    const authUrl = client.buildAuthorizationUrl(config, parameters);

    return {
      authUrl: authUrl.href,
      codeVerifier,
      nonce,
    };
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleCallback(
    currentUrl: string,
    codeVerifier: string,
    nonce?: string
  ): Promise<CallbackResult> {
    const config: client.Configuration = await client.discovery(
      new URL(server),
      clientId,
      clientSecret
    );

    const currentUrlObj = new URL(currentUrl);

    // Check for errors in the callback
    const error = currentUrlObj.searchParams.get('error');
    if (error) {
      const errorDescription =
        currentUrlObj.searchParams.get('error_description') || 'Unknown error';
      throw new Error(`OAuth2 error: ${error} - ${errorDescription}`);
    }

    const code = currentUrlObj.searchParams.get('code');
    if (!code) {
      throw new Error('No authorization code in callback');
    }

    // Build options object conditionally
    const grantOptions: Record<string, any> = {
      pkceCodeVerifier: codeVerifier,
      expectedNonce: nonce,
      idTokenExpected: true,
    };

    // Only add expectedNonce if it exists
    if (nonce) {
      grantOptions.expectedNonce = nonce;
    }

    // console.log('[OIDC] Grant options:', { ...grantOptions, pkceCodeVerifier: codeVerifier });

    const response = await client.authorizationCodeGrant(config, currentUrlObj, grantOptions);

    // console.log('== [OIDC] Token exchange successful');
    // console.log('== [OIDC] Has access_token:', !!response.access_token);
    // console.log('== [OIDC] Has id_token:', !!response.id_token);
    // console.log('== [OIDC] Has refresh_token:', !!response.refresh_token);

    let userInfo: UserInfoResponse | null = null;
    let claims: IDToken | null = null;

    // First, get claims from ID token (this is more reliable)
    try {
      if (response.id_token) {
        claims = response.claims() as IDToken;

        // Use claims as userInfo if userinfo endpoint fails
        if (claims) {
          userInfo = claims as unknown as UserInfoResponse;
        }
      }
    } catch (error) {
      console.warn('[OIDC] Error extracting ID token claims:', error);
    }

    // Then try to get additional user info from userinfo endpoint (optional enhancement)
    try {
      const additionalUserInfo = await client.fetchUserInfo(
        config,
        response.access_token,
        claims?.sub ?? ''
      );

      // Merge with claims if we have both
      if (additionalUserInfo) {
        userInfo = { ...userInfo, ...additionalUserInfo };
      }
    } catch (error) {
      console.warn(
        '[OIDC] Could not fetch from userinfo endpoint (using ID token claims instead):',
        error instanceof Error ? error.message : String(error)
      );
    }

    return {
      tokens: response,
      userInfo,
      claims,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<TokenEndpointResponse> {
    const config: client.Configuration = await client.discovery(
      new URL(server),
      clientId,
      clientSecret
    );

    const response = await client.refreshTokenGrant(config, refreshToken);

    return response;
  }

  /**
   * Revoke a token (access token or refresh token)
   */
  async revokeToken(token: string): Promise<void> {
    const config: client.Configuration = await client.discovery(
      new URL(server),
      clientId,
      clientSecret
    );

    await client.tokenRevocation(config, token);
  }

  /**
   * End user session (logout)
   */
  getLogoutUrl(idToken?: string, postLogoutRedirectUri?: string): string {
    const logoutUrl = new URL(`${server}/oidc/v1/end_session`);

    if (idToken) {
      logoutUrl.searchParams.set('id_token_hint', idToken);
    }

    if (postLogoutRedirectUri) {
      logoutUrl.searchParams.set('post_logout_redirect_uri', postLogoutRedirectUri);
    }

    return logoutUrl.toString();
  }
}
