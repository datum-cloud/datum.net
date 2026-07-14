interface SendMailInput {
  from: string;
  to: string;
  subject: string;
  text: string;
}

async function sendMail(input: SendMailInput): Promise<void> {
  const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY must be configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: input.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend request failed (${response.status}): ${body}`);
  }
}

export { sendMail };
