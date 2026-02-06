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
 * Extracts the last name from a full name string
 */
function getLastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Extracts the first name from a full name string
 */
function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0].toLowerCase();
}

/**
 * Fetches all team members (authors where isTeam is true),
 * sorted with founders first, then alphabetically by last name.
 * @returns Sorted array of team member entries
 */
export async function getTeamMembers() {
  const teamMembers = (await getCollection('authors', ({ data }) => data.isTeam === true)).sort(
    (a, b) => {
      const aIsFounder = a.data.team === 'founders';
      const bIsFounder = b.data.team === 'founders';

      // Founders always come first
      if (aIsFounder && !bIsFounder) return -1;
      if (!aIsFounder && bIsFounder) return 1;

      // Among founders, sort by title so CEO comes first
      if (aIsFounder && bIsFounder) {
        const aIsCeo = a.data.title?.includes('CEO') ? 0 : 1;
        const bIsCeo = b.data.title?.includes('CEO') ? 0 : 1;
        if (aIsCeo !== bIsCeo) return aIsCeo - bIsCeo;
      }

      // Within the same group, sort by last name, then first name
      const lastNameCmp = getLastName(a.data.name).localeCompare(getLastName(b.data.name));
      if (lastNameCmp !== 0) return lastNameCmp;
      return getFirstName(a.data.name).localeCompare(getFirstName(b.data.name));
    }
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
