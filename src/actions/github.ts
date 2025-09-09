import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

import { stargazerCount } from '@utils/github';

type GetStargazerCountInput = {
  owner: string;
  name: string;
};

const getStargazerCount = defineAction({
  input: z.object({
    owner: z.string(),
    name: z.string(),
  }),
  handler: async (input: GetStargazerCountInput): Promise<number> => {
    try {
      return (await stargazerCount(input.owner, input.name)) as number;
    } catch {
      return 0;
    }
  },
});

export { getStargazerCount };
