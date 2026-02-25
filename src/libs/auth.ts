import type { AstroCookies } from 'astro';
import type { IDToken } from 'openid-client';
import { OIDCClient } from './oidc';

const REFRESH_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface Session {
  sub: string;
  accessToken: string;
  expiredAt: string;
}

interface ValidateSessionResult {
  session: Session | null;
  refreshed: boolean;
}

// Cookie options
const cookieOptions = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.MODE === 'production',
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7, // 7 days,
  domain: '.datum.net',
};

/**
 * Validate session and refresh if needed
 *
 * This function:
 * 1. Reads session from cookie
 * 2. If no session, tries to restore from refresh token
 * 3. Checks if token is expired or near expiry (within 1 hour)
 * 4. Auto-refreshes tokens if needed
 * 5. Updates cookies with new tokens
 *
 * @param cookies - Astro cookies object
 * @returns Object with session (if valid) and refreshed flag
 */
export async function validateAndRefreshSession(
  cookies: AstroCookies
): Promise<ValidateSessionResult> {
  // 1. Read session from cookie
  const sessionCookie = cookies.get('_session')?.value;
  let session: Session | null = null;

  if (sessionCookie) {
    try {
      session = JSON.parse(sessionCookie);
    } catch (e) {
      console.error('[Auth] Error parsing session:', e);
    }
  }

  // 2. If no session, try to restore from refresh token
  if (!session) {
    const refreshToken = cookies.get('_refresh_token')?.value;
    if (refreshToken) {
      try {
        const oidcClient = new OIDCClient();
        const response = (await oidcClient.refreshTokens(refreshToken)) as {
          access_token: string;
          refresh_token?: string;
          expires_at?: Date;
          claims?: () => IDToken;
        };

        // Create new session
        const claims = response.claims?.();
        const newSession: Session = {
          sub: claims?.sub || '',
          accessToken: response.access_token,
          expiredAt:
            response.expires_at?.toISOString() || new Date(Date.now() + 3600 * 1000).toISOString(),
        };

        // Update cookies
        cookies.set('_session', JSON.stringify(newSession), cookieOptions);
        cookies.set('_access_token', response.access_token, cookieOptions);

        if (response.refresh_token) {
          cookies.set('_refresh_token', response.refresh_token, {
            ...cookieOptions,
            maxAge: 60 * 60 * 24 * 30, // 30 days
          });
        }

        return { session: newSession, refreshed: true };
      } catch (error) {
        console.error('[Auth] Failed to restore session:', error);
        // Clean up invalid refresh token
        cookies.delete('_refresh_token');
        return { session: null, refreshed: false };
      }
    }
    return { session: null, refreshed: false };
  }

  // 3. Session exists - check if refresh is needed
  const tokenExpiryTime = new Date(session.expiredAt).getTime();
  const currentTime = Date.now();
  const timeUntilExpiry = tokenExpiryTime - currentTime;

  const isExpired = tokenExpiryTime < currentTime;
  const isNearExpiry = timeUntilExpiry < REFRESH_WINDOW_MS && timeUntilExpiry > 0;

  // 4. Refresh if expired or near expiry (within 1 hour)
  if (isExpired || isNearExpiry) {
    const refreshToken = cookies.get('_refresh_token')?.value;
    if (refreshToken) {
      try {
        const oidcClient = new OIDCClient();
        const response = (await oidcClient.refreshTokens(refreshToken)) as {
          access_token: string;
          refresh_token?: string;
          expires_at?: Date;
          claims?: () => IDToken;
        };

        const claims = response.claims?.();
        const newSession: Session = {
          sub: claims?.sub || session.sub,
          accessToken: response.access_token,
          expiredAt:
            response.expires_at?.toISOString() || new Date(Date.now() + 3600 * 1000).toISOString(),
        };

        // Update cookies
        cookies.set('_session', JSON.stringify(newSession), cookieOptions);
        cookies.set('_access_token', response.access_token, cookieOptions);

        if (response.refresh_token) {
          cookies.set('_refresh_token', response.refresh_token, {
            ...cookieOptions,
            maxAge: 60 * 60 * 24 * 30, // 30 days
          });
        }

        return { session: newSession, refreshed: true };
      } catch (error) {
        console.error('[Auth] Token refresh failed:', error);

        // If token has enough time left (> 5 minutes), continue with current session
        const MIN_BUFFER_MS = 5 * 60 * 1000;
        if (!isExpired && timeUntilExpiry > MIN_BUFFER_MS) {
          return { session, refreshed: false };
        }

        // Token is expired and refresh failed - clear session
        cookies.delete('_session');
        cookies.delete('_access_token');
        cookies.delete('_refresh_token');
        return { session: null, refreshed: false };
      }
    }

    // No refresh token available but session is expired
    if (isExpired) {
      cookies.delete('_session');
      cookies.delete('_access_token');
      return { session: null, refreshed: false };
    }
  }

  // 5. Session is valid
  return { session, refreshed: false };
}

/**
 * Get current session without validation or refresh
 * Simple read operation for cases where you just need the session data
 *
 * @param cookies - Astro cookies object
 * @returns Session object or null if not authenticated
 */
export function getSession(cookies: AstroCookies): Session | null {
  const sessionCookie = cookies.get('_session')?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie) as Session;
  } catch (e) {
    console.error('[Auth] Error parsing session:', e);
    return null;
  }
}

/**
 * Clear all authentication cookies
 *
 * @param cookies - Astro cookies object
 */
export function clearSession(cookies: AstroCookies): void {
  cookies.delete('_session', cookieOptions);
  cookies.delete('_access_token', cookieOptions);
  cookies.delete('_refresh_token', cookieOptions);
  cookies.delete('_id_token', cookieOptions);
}
