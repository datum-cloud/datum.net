interface HelpScoutLeadInput {
  subject: string;
  name: string;
  email: string;
  text: string;
  envPrefix: 'HELPSCOUT_DEMO' | 'HELPSCOUT_DEDICATED_CLOUD';
}

interface HelpScoutTokenResponse {
  access_token: string;
  expires_in: number;
}

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }

  const response = await fetch('https://api.helpscout.net/v2/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HelpScout token request failed (${response.status}): ${body}`);
  }

  const { access_token, expires_in }: HelpScoutTokenResponse = await response.json();
  // Refresh a minute early so a nearly-expired cached token is never used for a request.
  cachedToken = { accessToken: access_token, expiresAt: Date.now() + (expires_in - 60) * 1000 };

  return access_token;
}

async function sendToHelpScout(input: HelpScoutLeadInput): Promise<void> {
  const serverEnv = typeof process !== 'undefined' ? process.env : undefined;
  const clientId = serverEnv?.[`${input.envPrefix}_CLIENT_ID`];
  const clientSecret = serverEnv?.[`${input.envPrefix}_CLIENT_SECRET`];
  const mailboxId = serverEnv?.[`${input.envPrefix}_MAILBOX_ID`];

  if (!clientId || !clientSecret || !mailboxId) {
    throw new Error(
      `${input.envPrefix}_CLIENT_ID, ${input.envPrefix}_CLIENT_SECRET and ${input.envPrefix}_MAILBOX_ID must be configured`
    );
  }

  const accessToken = await getAccessToken(clientId, clientSecret);

  const [firstName, ...lastNameParts] = input.name.trim().split(/\s+/);

  const response = await fetch('https://api.helpscout.net/v2/conversations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'email',
      mailboxId: Number(mailboxId),
      subject: input.subject,
      status: 'active',
      customer: {
        email: input.email,
        firstName,
        lastName: lastNameParts.join(' ') || undefined,
      },
      threads: [
        {
          type: 'customer',
          customer: { email: input.email },
          text: input.text,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HelpScout request failed (${response.status}): ${body}`);
  }
}

export { sendToHelpScout };
