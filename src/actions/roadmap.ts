import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

import { OIDCClient } from '@libs/oidc';
import { incrementVote, decrementVote, getUserVoted as getUserVotedValue } from '@libs/postgres';

interface VotingInput {
  userId: string;
  issueId: string;
}

interface UserVoteInput {
  id: string;
}

const vote = defineAction({
  input: z.object({
    userId: z.string(),
    issueId: z.string(),
  }),
  handler: async (input: VotingInput): Promise<boolean> => {
    try {
      const vote_result = (await incrementVote(input.issueId, input.userId)) as boolean;

      if (!vote_result) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  },
});

const unvote = defineAction({
  input: z.object({
    userId: z.string(),
    issueId: z.string(),
  }),
  handler: async (input: VotingInput): Promise<boolean> => {
    try {
      const vote_result = (await decrementVote(input.issueId, input.userId)) as boolean;

      if (!vote_result) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  },
});

const getUserVoted = defineAction({
  input: z.object({
    id: z.string(),
  }),
  handler: async (input: UserVoteInput): Promise<string[] | null> => {
    const value = await getUserVotedValue(input.id);
    return (value as unknown as string[]) || null;
  },
});

const loginWithDatum = defineAction({
  handler: async (): Promise<object> => {
    try {
      const oidcClient = new OIDCClient();
      const oidcClientReturn = await oidcClient.getAuthorizationUrl();
      return oidcClientReturn;
    } catch (error) {
      console.error('Error:', error);
    }
    return {};
  },
});

export { vote, unvote, getUserVoted, loginWithDatum };
