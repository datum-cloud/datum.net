export interface ChangelogItem {
  id: string;
  date: Date;
  title: string;
  description: string;
  tags: ChangelogTag[];
}

export interface ChangelogTag {
  label: string;
  type: 'fixed' | 'new' | 'changed';
  value?: string;
}

export interface ChangelogCardProps {
  id: string;
  date: Date;
  title: string;
  description: string;
  tags: ChangelogTag[];
}
