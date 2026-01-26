// src/utils/authorUtils.ts
import { getCollection } from 'astro:content';

/**
 * Color palette that cycles through for team member avatars
 */
export const TEAM_BG_COLORS = ['#5F735E', '#BF9595', '#D1CDC0'] as const;

/**
 * Gets background color based on index, cycling through the color palette
 * @param index - The index of the team member
 * @returns The background color hex code
 */
export const getTeamBgColor = (index: number): string => {
  return TEAM_BG_COLORS[index % TEAM_BG_COLORS.length];
};

/**
 * Fetches all team members (authors where isTeam is true) sorted by order
 * @returns Sorted array of team member entries
 */
export async function getTeamMembers() {
  const teamMembers = (await getCollection('authors', ({ data }) => data.isTeam === true)).sort(
    (a, b) => (a.data.order ?? 999) - (b.data.order ?? 999)
  );
  return teamMembers;
}

/**
 * Gets the background color for an author based on their position in the team members list
 * @param authorId - The ID of the author
 * @returns The background color hex code, or undefined if author is not a team member
 */
export async function getAuthorBgColor(authorId: string): Promise<string | undefined> {
  const teamMembers = await getTeamMembers();
  const authorIndex = teamMembers.findIndex((member) => member.id === authorId);

  if (authorIndex >= 0) {
    return getTeamBgColor(authorIndex);
  }

  return undefined;
}
