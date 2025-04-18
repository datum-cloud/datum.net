export interface TeamMember {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  position: string;
  order?: number;
  social: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export interface TeamMemberCardProps {
  member: TeamMember;
}
