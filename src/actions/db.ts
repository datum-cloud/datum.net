import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { addVote } from '@/src/utils/files';

// Input type for the voting action
interface VotingInput {
  id: string;
}

export const voting = defineAction({
  input: z.object({
    id: z.string(),
  }),
  handler: async (input: VotingInput): Promise<number | null> => {
    return await addVote(input.id);
  },
});
