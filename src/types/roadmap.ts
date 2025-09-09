export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  votes: number;
  githubUrl?: string;
  hasVoted?: boolean;
}

export interface RoadmapCardProps {
  id: string;
  title: string;
  description: string;
  votes: number;
  githubUrl?: string;
  hasVoted?: boolean;
}
