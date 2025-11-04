export interface FeaturesDataProps {
  title: string;
  description: string;
  keyFeatures: string[];
  benefits: string;
  perfectFor: string[];
  iconName?: string;
}

export interface FeaturesProps {
  features: Array<{
    id: string;
    data: FeaturesDataProps;
    body: string;
  }>;
}
