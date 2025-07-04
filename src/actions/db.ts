import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { addVote, getVoted } from '@/src/utils/roadmap';
import * as os from 'os';
import crypto from 'crypto';

const networkInterfaces = os.networkInterfaces();
const ipAddress =
  Object.values(networkInterfaces)
    .flat()
    .find((iface) => iface?.family === 'IPv4' && !iface.internal)?.address || '';

interface VotingInput {
  id: string;
  userId: string;
}

interface UserVoteInput {
  id: string;
}

const voting = defineAction({
  input: z.object({
    id: z.string(),
    userId: z.string().optional().default(ipAddress),
  }),
  handler: async (input: VotingInput): Promise<number | null> => {
    return await addVote(input.id, generateHiddenUserId(input.userId));
  },
});

const getUserVoted = defineAction({
  input: z.object({
    id: z.string().optional().default(ipAddress),
  }),
  handler: async (input: UserVoteInput): Promise<string[] | null> => {
    return await getVoted(generateHiddenUserId(input.id));
  },
});

function generateHiddenUserId(value: string) {
  const hash = crypto.createHash('sha256');
  hash.update(value.toLowerCase());
  return hash.digest('hex');
}

export { voting, getUserVoted };
