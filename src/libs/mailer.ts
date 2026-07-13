import nodemailer from 'nodemailer';

interface SendMailInput {
  to: string;
  subject: string;
  text: string;
}

async function sendMail(input: SendMailInput): Promise<void> {
  const host = import.meta.env.SMTP_HOST || process.env.SMTP_HOST;
  const port = Number(import.meta.env.SMTP_PORT || process.env.SMTP_PORT || 587);
  const user = import.meta.env.SMTP_USER || process.env.SMTP_USER;
  const password = import.meta.env.SMTP_PASSWORD || process.env.SMTP_PASSWORD;
  const from = import.meta.env.SMTP_FROM || process.env.SMTP_FROM || user;

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && password ? { user, pass: password } : undefined,
  });

  await transport.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });
}

export { sendMail };
