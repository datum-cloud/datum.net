import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, eq, ProjectVotes } from 'astro:db';

export const server = {
  voting: defineAction({
    input: z.object({
      id: z.string(),
    }),
    handler: async (input) => {
      let newValue = 1;
      const existingVote = await db
        .select()
        .from(ProjectVotes)
        .where(eq(ProjectVotes.id, input.id));

      if (existingVote && typeof existingVote[0] != 'undefined') {
        newValue = existingVote[0].vote + 1;
        // Increment the vote count if the vote already exists
        await db.update(ProjectVotes).set({ vote: newValue }).where(eq(ProjectVotes.id, input.id));
      } else {
        // Create a new vote entry if it doesn't exist
        await db.insert(ProjectVotes).values({
          id: input.id,
          vote: newValue,
        });
      }

      return newValue;
    },
  }),
};
