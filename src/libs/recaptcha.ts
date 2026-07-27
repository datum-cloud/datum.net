interface RecaptchaVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
}

const MIN_SCORE = 0.5;

async function verifyRecaptcha(token: string, expectedAction: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY || import.meta.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    throw new Error('RECAPTCHA_SECRET_KEY must be configured');
  }

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: secretKey, response: token }),
  });

  if (!response.ok) return false;

  const result: RecaptchaVerifyResponse = await response.json();

  return result.success && result.action === expectedAction && (result.score ?? 0) >= MIN_SCORE;
}

export { verifyRecaptcha };
