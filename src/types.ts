export type UserRole = 'owner' | 'vendor' | 'advisor';

export type PaymentGatewayType = 'razorpay' | 'payu';

export type VendorCommercialModel = 'one_time' | 'recurring';

export type VendorValueBand =
  | 'below_2l'       // Below Rs 2 lakh -> Rs 1,000/yr
  | '2l_to_5l'       // Rs 2L - Rs 5L -> Rs 2,500/yr
  | 'above_5l'       // Above Rs 5L -> Rs 5,000/yr
  | 'below_25k_pm'   // Below Rs 25k/month -> Rs 2,000/yr
  | '25k_to_50k_pm'  // Rs 25k - Rs 50k/month -> Rs 3,000/yr
  | 'above_50k_pm';  // Above Rs 50k/month -> Rs 5,000/yr

export interface MembershipPlan {
  id: string;
  role: UserRole;
  title: string;
  subtitle: string;
  commercialBasis: string;
  annualFee: number;
  displayFee: string;
  benefits: string[];
  recommendedRule?: string;
  badge?: string;
}

export interface PaymentTransaction {
  id: string;
  gateway: PaymentGatewayType;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  userRole: UserRole;
  userName: string;
  userEmail: string;
  userPhone?: string;
  companyName?: string;
  membershipPlanId: string;
  planTitle: string;
  timestamp: string;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
}

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

export interface AuthUser {
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  company?: string;
  isSubscribed?: boolean;
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
  clientPortfolio?: string[];
  gstin?: string;
  priceRange?: string;
  turnaroundTime?: string;
  certifications?: string[];
  headquartersAddress?: string;
  complianceBadges?: string[];
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
