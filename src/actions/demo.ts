import { defineAction } from 'astro:actions';
import { z } from 'zod';
import { sendMail } from '@libs/mailer';

const SUBJECTS = {
  demo: 'Request to book a demo',
  'dedicated-cloud': 'Interest in Dedicated Cloud, request form',
} as const;

const FROM_ADDRESSES = {
  demo: 'demo@mail.datum.net',
  'dedicated-cloud': 'dedicated-cloud@mail.datum.net',
} as const;

const BookDemo = defineAction({
  input: z.object({
    name: z.string(),
    email: z.email(),
    company: z.string(),
    workloadType: z.string(),
    message: z.string().optional(),
    formType: z.enum(['demo', 'dedicated-cloud']),
  }),
  handler: async (input) => {
    await sendMail({
      from: FROM_ADDRESSES[input.formType],
      to: 'support@datum.net',
      subject: SUBJECTS[input.formType],
      text: [
        `name: ${input.name}`,
        `email: ${input.email}`,
        `company: ${input.company}`,
        `workload: ${input.workloadType}`,
        `message: ${input.message || '-'}`,
      ].join('\n'),
    });

    return { success: true };
  },
});

export { BookDemo };
