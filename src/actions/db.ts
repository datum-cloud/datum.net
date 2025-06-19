import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { getVote, setVote } from '@utils/roadmap';

// Interface for vote data
interface Vote {
  vote: number;
}

// Input type for the voting action
interface VotingInput {
  id: string;
}

export const voting = defineAction({
  input: z.object({
    id: z.string(),
  }),
  handler: async (input: VotingInput): Promise<number> => {
    let newValue = 1;
    const existingVote: Vote | null = await getVote(input.id);

    if (existingVote) {
      // Increment the vote count if the vote already exists
      newValue = existingVote.vote + 1;
    }

    await setVote(input.id, newValue);

    return newValue;
  },
});
