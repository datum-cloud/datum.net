// src/pages/auth.md.ts
//
// auth.md (workos.com/auth.md, github.com/workos/auth.md) — a well-known
// entrypoint telling an agent how to authenticate against this site's
// protected resources, and where to find the machine-readable metadata that
// actually describes it. Hand-authored, not derived from a content
// collection, the same way llms.txt.ts is.
//
// Every endpoint named below is real and already published:
//   - /.well-known/oauth-protected-resource and
//     /.well-known/oauth-authorization-server (public/.well-known/) —
//     the actual OAuth metadata for auth.datum.net.
//   - grant_types_supported (client_credentials, jwt-bearer) and
//     revocation_endpoint come straight from that metadata.
// No flow is claimed here that Datum doesn't actually support today — see
// the "no overclaiming" note in src/data/openapi.ts for why that matters.
export const prerender = false;

import type { APIRoute } from 'astro';

const body = `# auth.md

Datum Cloud's API and the resources this site describes sit behind OAuth 2.0,
issued by [auth.datum.net](https://auth.datum.net).

## Discovery

- Protected Resource Metadata: [/.well-known/oauth-protected-resource](/.well-known/oauth-protected-resource)
- Authorization Server Metadata: [/.well-known/oauth-authorization-server](/.well-known/oauth-authorization-server)
- OpenID Provider Metadata: [/.well-known/openid-configuration](/.well-known/openid-configuration)

## How an agent authenticates

- **Acting on behalf of a signed-in person:** OIDC Authorization Code flow
  with PKCE against the issuer above.
- **Headless / autonomous:** create a service account and use the
  \`client_credentials\` or \`urn:ietf:params:oauth:grant-type:jwt-bearer\` grant
  (both listed in \`grant_types_supported\` in the Authorization Server
  Metadata) to get a scoped bearer token — no interactive sign-in required.

## Registration

Sign up, then create a project and a service account for your agent:
<https://auth.datum.net/id/signup>

See the \`agent_auth\` block in
[/.well-known/oauth-authorization-server](/.well-known/oauth-authorization-server)
for the machine-readable version of this.

## Revoking access

\`POST\` to the \`revocation_endpoint\` named in the Authorization Server
Metadata (\`https://auth.datum.net/oauth/v2/revoke\`).
`;

export const GET: APIRoute = () => {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
