import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { incrementVote, getUserVoted as getUserVotedValue } from '@libs/postgres';
import * as os from 'os';
// import { sha256 } from '@libs/file';
import { OIDCClient } from '@libs/oidc';

const networkInterfaces = os.networkInterfaces();
const ipAddress =
  Object.values(networkInterfaces)
    .flat()
    .find((iface) => iface?.family === 'IPv4' && !iface.internal)?.address || '';

interface VotingInput {
  userId: string;
  issueId: string;
}

interface UserVoteInput {
  id: string;
}

const voting = defineAction({
  input: z.object({
    userId: z.string(),
    issueId: z.string(),
  }),
  handler: async (input: VotingInput): Promise<object | null> => {
    try {
      const voted = (await incrementVote(input.issueId, input.userId)) as { data?: object };

      if (!voted) {
        return null;
      }

      return voted || null;

      // const userVotesData = await addUserVote(sha256(input.userId), input.issueId);
      // return userVotesData ? voted : null;
    } catch {
      return null;
    }
  },
});

const getUserVoted = defineAction({
  input: z.object({
    id: z.string().optional().default(ipAddress),
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
      return await oidcClient.getAuthorizationUrl();
    } catch (error) {
      console.error('Error:', error);
    }
    return {};
  },
});

export { voting, getUserVoted, loginWithDatum };
