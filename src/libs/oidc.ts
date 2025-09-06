import * as client from 'openid-client';
import type {
  TokenEndpointResponseHelpers,
  TokenEndpointResponse,
  IDToken,
  UserInfoResponse,
} from 'openid-client';
const server = import.meta.env.AUTH_OIDC_ISSUER || process.env.AUTH_OIDC_ISSUER;
const clientId = import.meta.env.AUTH_OIDC_CLIENT_ID || process.env.AUTH_OIDC_CLIENT_ID;
const clientSecret = import.meta.env.AUTH_OIDC_CLIENT_SECRET || process.env.AUTH_OIDC_CLIENT_SECRET;
const redirect_uri = import.meta.env.AUTH_OIDC_REDIRECT_URI || process.env.AUTH_OIDC_REDIRECT_URI;

export interface userInfo {
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  locale: string;
  name: string;
  picture: string;
  preferred_username: string;
  sub: string;
  updated_at: number;
}

export interface claims {
  amr: string[];
  at_hash: string;
  aud: string[];
  auth_time: number;
  azp: string;
  client_id: string;
  email: string;
  exp: number;
  iat: number;
  iss: string;
  sid: string;
  sub: string;
}

export interface callbackResult {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  claims: IDToken | undefined;
  userInfo: UserInfoResponse;
  error?: object;
}

export interface tokenResult {
  access_token: string;
  token_type: string;
  id_token: string;
  expires_in: number;
  claims: () => claims;
}

export class OIDCClient {
  async getAuthorizationUrl(): Promise<object> {
    const codeVerifier = client.randomPKCECodeVerifier();
    const code_challenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const config: client.Configuration = await client.discovery(
      new URL(server),
      clientId,
      clientSecret
    );
    const parameters: Record<string, string> = {
      redirect_uri,
      scope: 'openid email profile',
      code_challenge,
      code_challenge_method: 'S256',
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
      nonce: nonce,
    };
  }

  async handleCallback(
    currentUrl?: string,
    codeVerifier?: string,
    nonce?: string
  ): Promise<callbackResult> {
    const config: client.Configuration = await client.discovery(
      new URL(server),
      clientId,
      clientSecret
    );

    let tokens: TokenEndpointResponseHelpers & TokenEndpointResponse;
    let claims: IDToken | undefined = undefined;
    let userInfo: UserInfoResponse;

    if (!currentUrl) {
      throw new Error('Callback URL is required to handle OIDC callback.');
    }

    try {
      tokens = await client.authorizationCodeGrant(config, new URL(currentUrl), {
        pkceCodeVerifier: codeVerifier,
        expectedNonce: nonce,
        idTokenExpected: true,
      });

      claims = tokens.claims();
      userInfo = await client.fetchUserInfo(config, tokens.access_token, claims?.sub ?? '');
    } catch (error) {
      return {
        accessToken: '',
        refreshToken: '',
        idToken: '',
        claims: claims,
        userInfo: {} as UserInfoResponse,
        error: error instanceof Error ? error : { message: String(error) },
      };
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || '',
      idToken: tokens.id_token || '',
      claims,
      userInfo,
    };
  }

  async refreshTokens(refreshToken: string) {
    const config: client.Configuration = await client.discovery(
      new URL(server),
      clientId,
      clientSecret
    );
    const tokens = await client.refreshTokenGrant(config, refreshToken);
    return tokens;
  }
}
