import { defineAction, ActionError } from 'astro:actions';
import { z } from 'zod';
import { sendMail } from '@libs/mailer';
import { verifyRecaptcha } from '@libs/recaptcha';

const RECAPTCHA_ACTIONS = {
  demo: 'demo_form',
  'dedicated-cloud': 'dedicated_cloud_form',
} as const;

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
    // Dedicated Cloud-only fields — optional so the simpler /demo form is unaffected.
    gpuGeneration: z.string().optional(),
    networking: z.string().optional(),
    cooling: z.string().optional(),
    gpuCount: z.number().optional(),
    storage: z.string().optional(),
    locationRequirements: z.string().optional(),
    fleetManagement: z.array(z.string()).optional(),
    recaptchaToken: z.string().optional(),
  }),
  handler: async (input) => {
    if (input.website || input.elapsedMs < 3000) {
      return { success: true };
    }

    const isHuman =
      !!input.recaptchaToken &&
      (await verifyRecaptcha(input.recaptchaToken, RECAPTCHA_ACTIONS[input.formType]));

    if (!isHuman) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'reCAPTCHA verification failed.' });
    }

    const lines = [
      `name: ${input.name}`,
      `email: ${input.email}`,
      `company: ${input.company}`,
      `workload: ${input.workloadType}`,
    ];

    if (input.formType === 'dedicated-cloud') {
      lines.push(
        `gpu generation: ${input.gpuGeneration || '-'}`,
        `networking: ${input.networking || '-'}`,
        `cooling: ${input.cooling || '-'}`,
        `gpu count: ${input.gpuCount ?? '-'}`,
        `storage: ${input.storage || '-'}`,
        `location requirements: ${input.locationRequirements || '-'}`,
        `fleet management: ${input.fleetManagement?.length ? input.fleetManagement.join(', ') : '-'}`
      );
    }

    lines.push(`message: ${input.message || '-'}`);

    await sendMail({
      from: FROM_ADDRESS,
      to: 'support@datum.net',
      subject: SUBJECTS[input.formType],
      text: lines.join('\n'),
    });

    return { success: true };
  },
});

export { BookDemo };
