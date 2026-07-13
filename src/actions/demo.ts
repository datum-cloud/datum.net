import { defineAction } from 'astro:actions';
import { z } from 'zod';
import { sendMail } from '@libs/mailer';

const SUBJECTS = {
  demo: 'Request to book a demo',
  'dedicated-cloud': 'Interest in Dedicated Cloud, request form',
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
      to: 'support@datum.net',
      subject: SUBJECTS[input.formType],
      text: [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Company: ${input.company}`,
        `Workload type: ${input.workloadType}`,
        `Message: ${input.message || '-'}`,
      ].join('\n'),
    });

    return { success: true };
  },
});

export { BookDemo };
