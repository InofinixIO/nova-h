export type UserRole = 'owner' | 'vendor' | 'advisor';

export interface StageItem {
  stageNumber: number;
  title: string;
  category: string;
  summary: string;
  keyDeliverables: string[];
  checklist: string[];
  typicalTimeline: string;
  keyStakeholders: string[];
}

export interface DirectoryItem {
  id: string;
  name: string;
  role: 'vendor' | 'advisor';
  category: string;
  rating: number;
  reviewsCount: number;
  location: string;
  serviceLocations: string[];
  projectStages: string[];
  productsAndServices: string[];
  description: string;
  verified: boolean;
  yearsOfExperience: number;
  contactEmail: string;
  phone: string;
  website: string;
  featuredProject?: string;
}

export interface HowItWorksStep {
  number: number;
  title: string;
  subtitle: string;
  details: string;
  actionText: string;
}

export interface ProjectRequirement {
  id: string;
  hospitalName: string;
  location: string;
  bedCapacity: string;
  stage: string;
  categoryNeeded: string;
  description: string;
  contactPerson: string;
  email: string;
  phone: string;
  createdAt: string;
}
