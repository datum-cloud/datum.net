// src/utils/authorUtils.ts
import {
  getStrapiTeamMembers,
  getAuthorBgColorFromStrapi,
  fetchStrapiAuthors,
  getTeamBgColor as getStrapiTeamBgColor,
} from '@libs/strapi/authors';
import type { StrapiAuthorFull } from '@/src/types/strapi';

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
 * Normalized team member structure for compatibility with existing components
 */
export interface NormalizedTeamMember {
  id: string;
  data: {
    name: string;
    title?: string;
    bio?: string;
    avatar?: { src: string };
    tick?: string;
    surprising?: string;
    weekends?: string;
    team?: string;
    isTeam?: boolean;
  };
}

/**
 * Transforms a Strapi author to the normalized format used by components
 */
function normalizeTeamMember(author: StrapiAuthorFull): NormalizedTeamMember {
  return {
    id: author.slug || author.documentId,
    data: {
      name: author.name,
      title: author.title || undefined,
      bio: author.bio || undefined,
      avatar: author.avatar?.url ? { src: author.avatar.url } : undefined,
      tick: author.tick || undefined,
      surprising: author.surprising || undefined,
      weekends: author.weekends || undefined,
      team: author.team || undefined,
      isTeam: author.isTeam,
    },
  };
}

/**
 * Fetches all team members from Strapi (authors where isTeam is true),
 * sorted with founders first, then alphabetically by last name.
 * @returns Sorted array of normalized team member entries
 */
export async function getTeamMembers(): Promise<NormalizedTeamMember[]> {
  const strapiTeamMembers = await getStrapiTeamMembers();
  return strapiTeamMembers.map(normalizeTeamMember);
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

// Re-export Strapi author functions from strapi module (with caching)
export {
  getStrapiTeamMembers,
  getAuthorBgColorFromStrapi,
  fetchStrapiAuthors,
  getStrapiTeamBgColor,
};
