declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

function loadRecaptchaScript(siteKey: string): Promise<void> {
  if (window.grecaptcha) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
    document.head.appendChild(script);
  });
}

async function getRecaptchaToken(siteKey: string, action: string): Promise<string> {
  if (!siteKey) return '';

  try {
    await loadRecaptchaScript(siteKey);
    return await new Promise<string>((resolve, reject) => {
      window.grecaptcha!.ready(() => {
        window.grecaptcha!.execute(siteKey, { action }).then(resolve, reject);
      });
    });
  } catch {
    return '';
  }
}

export { getRecaptchaToken };
