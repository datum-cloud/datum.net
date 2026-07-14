import { defineAction } from 'astro:actions';
import { z } from 'zod';
import { sendMail } from '@libs/mailer';

const SUBJECTS = {
  demo: 'Request to book a demo',
  'dedicated-cloud': 'Interest in Dedicated Cloud, request form',
} as const;

const FROM_ADDRESS = 'team@mail.datum.net';

const BookDemo = defineAction({
  input: z.object({
    name: z.string(),
    email: z.email(),
    company: z.string(),
    workloadType: z.string(),
    message: z.string().optional(),
    formType: z.enum(['demo', 'dedicated-cloud']),
    website: z.string().optional(),
    elapsedMs: z.number(),
  }),
  handler: async (input) => {
    if (input.website || input.elapsedMs < 3000) {
      return { success: true };
    }

    await sendMail({
      from: FROM_ADDRESS,
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
