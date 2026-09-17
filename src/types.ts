export type UserRole = 'owner' | 'vendor' | 'advisor' | 'admin';

export type PaymentGatewayType = 'razorpay' | 'complimentary';

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

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number; // e.g. 100 for 100%, 20 for 20%, 1000 for flat 1000
  description: string;
  applicableRoles?: UserRole[];
  validUntil?: string;
}

export interface CouponRedemption {
  id: string;
  couponCode: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  originalAmount: number;
  discountAmount: number;
  finalPayable: number;
  isComplimentary: boolean;
  userRole: UserRole;
  userName: string;
  userEmail: string;
  userPhone?: string;
  companyName: string;
  planId: string;
  planTitle: string;
  redeemedAt: string;
  transactionId: string;
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
  couponCode?: string;
  discountAmount?: number;
  originalAmount?: number;
  isComplimentary?: boolean;
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

export type ProjectRequirementStatus = 'pending_review' | 'approved' | 'matched' | 'closed';

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
  status?: ProjectRequirementStatus;
  estimatedBudget?: string;
  adminNotes?: string;
  assignedVendors?: string[];
}

export type EnquiryStatus = 'new' | 'in_review' | 'contacted' | 'proposal_sent' | 'closed';

export interface EnquiryItem {
  id: string;
  targetId: string;
  targetName: string;
  targetEmail: string;
  targetRole: 'vendor' | 'advisor' | 'owner';
  
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  senderRole: UserRole;
  senderCompany?: string;

  subject: string;
  message: string;
  projectLocation?: string;
  hospitalName?: string;
  bedCapacity?: string;
  projectStage?: string;
  
  status: EnquiryStatus;
  createdAt: string;
  replyNote?: string;
}

// ==========================================
// WHATSAPP INTERACTIVE FLOW BUILDER TYPES
// ==========================================

export type WhatsAppNodeType = 
  | 'button'          // Interactive Quick Reply (up to 3 buttons)
  | 'list'            // Interactive List Menu (Sections & rows)
  | 'flow_screen'     // Meta WhatsApp Flow (Native in-app form screen)
  | 'media_cta'       // Media Header + Call / URL action
  | 'input_capture'   // Ask user input & store to variable
  | 'agent_handover'; // Route conversation to human representative

export interface WhatsAppButton {
  id: string;
  title: string;
  nextNodeId?: string;
  payload?: string;
}

export interface WhatsAppListItem {
  id: string;
  title: string;
  description?: string;
  nextNodeId?: string;
}

export interface WhatsAppListSection {
  title: string;
  rows: WhatsAppListItem[];
}

export interface WhatsAppFormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'radio';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface WhatsAppFlowScreen {
  title: string;
  subtitle?: string;
  fields: WhatsAppFormField[];
  submitButtonTitle: string;
  nextNodeId?: string;
}

export interface WhatsAppNode {
  id: string;
  title: string;
  type: WhatsAppNodeType;
  headerType: 'none' | 'text' | 'image' | 'document' | 'video';
  headerContent?: string;
  bodyText: string;
  footerText?: string;
  buttons?: WhatsAppButton[];
  listButtonText?: string;
  listSections?: WhatsAppListSection[];
  flowScreen?: WhatsAppFlowScreen;
  ctaType?: 'url' | 'call';
  ctaLabel?: string;
  ctaValue?: string;
  inputVariable?: string;
  inputPlaceholder?: string;
  nextNodeId?: string;
  position?: { x: number; y: number };
}

export interface WhatsAppFlow {
  id: string;
  name: string;
  description: string;
  category: 'healthcare' | 'rfq' | 'vendor' | 'support';
  triggerKeyword: string;
  nodes: WhatsAppNode[];
  startNodeId: string;
}

// ==========================================
// RFP & PROCUREMENT BRS (NOVA-H SPEC 1.0)
// ==========================================

export type RFPLifecycleStatus =
  | 'draft'
  | 'internal_review'
  | 'published'
  | 'vendor_questions'
  | 'submissions_open'
  | 'submissions_closed'
  | 'clarification'
  | 'technical_comparison'
  | 'commercial_comparison'
  | 'shortlisted'
  | 'negotiation'
  | 'selected'
  | 'po_issued'
  | 'closed'
  | 'cancelled'
  | 'on_hold';

export type RFPPublishMode =
  | 'selected_invite'
  | 'marketplace'
  | 'public_web'
  | 'offline_export';

export type IdentityDisclosureMode =
  | 'immediate'
  | 'on_approval'
  | 'nda_required'
  | 'on_shortlist'
  | 'never';

export interface RFPRequirementItem {
  id: string;
  category: string;
  parameter: string;
  hospitalSpecification: string;
  isMandatory: boolean;
  unit?: string;
  acceptableDeviation?: string;
}

export interface RFPAttachment {
  id: string;
  name: string;
  type: string;
  size: string;
  category: 'boq' | 'drawing' | 'scope_doc' | 'terms' | 'other';
  uploadedAt: string;
}

export interface RFPItem {
  id: string;
  rfpNumber: string; // e.g. NOVA-RFP-2026-0042
  title: string;
  category: string;
  hospitalName: string;
  maskedHospitalTitle: string;
  isIdentityMasked: boolean;
  locationCity: string;
  locationState: string;
  bedCapacity: string;
  summary: string;
  scopeOfWork: string[];
  estimatedBudgetRange: string;
  currency: string;
  status: RFPLifecycleStatus;
  publishingModes: RFPPublishMode[];
  identityDisclosure: IdentityDisclosureMode;
  publicationDate: string;
  questionDeadline: string;
  quoteClosingDate: string;
  revisedClosingDate?: string;
  expectedDecisionDate: string;
  targetInstallationDate: string;
  invitedVendorIds: string[];
  requirements: RFPRequirementItem[];
  attachments: RFPAttachment[];
  assignedAdvisor?: {
    advisorId?: string;
    name: string;
    organization: string;
    role: string;
    assignedAt: string;
    canComment: boolean;
    canCompare: boolean;
    conflictDisclosed?: boolean;
    conflictNotes?: string;
  };
  createdBy: string;
  hospitalOwnerEmail: string;
  hospitalOwnerPhone?: string;
  createdAt: string;
  updatedAt: string;
  awardDetails?: {
    awardedVendorId: string;
    vendorName: string;
    poReference: string;
    awardedAmount: number;
    decisionRationale: string;
    awardedDate: string;
  };
}

export interface QuoteCommercials {
  basePrice: number;
  gstRatePercent: number;
  gstAmount: number;
  freightAmount: number;
  installationAmount: number;
  sitePrepAmount?: number;
  accessoriesAmount?: number;
  netLandedCost: number;
  paymentTerms: string;
  deliveryWeeks: number;
  warrantyYears: number;
  amcAnnualPercent?: number;
  amcAnnualAmount?: number;
  cmcAnnualPercent?: number;
  cmcAnnualAmount?: number;
  highValueSparesEstAnnual?: number;
  consumablesCostPerTest?: number;
  trainingIncluded: boolean;
  softwareLicenseCost?: number;
  uptimeCommitmentPercent?: number;
}

export interface QuoteTechnicalSpec {
  reqId: string;
  parameter: string;
  offeredValue: string;
  compliance: 'compliant' | 'deviation' | 'excluded' | 'partial';
  notes?: string;
  sourceDocPage?: string;
}

export interface AIExtractionDetails {
  isExtracted: boolean;
  confidenceScore: number; // 0 - 100
  humanVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  missingRequiredFields: string[];
  flaggedDiscrepancies: string[];
  rawSnippets: Record<string, string>;
}

export interface RFPQuote {
  id: string;
  rfpId: string;
  vendorId: string;
  vendorName: string;
  vendorCompany: string;
  contactEmail: string;
  contactPhone?: string;
  isExternal: boolean; // True if uploaded from WhatsApp, Email or Hardcopy by Hospital
  externalSource?: 'whatsapp' | 'email' | 'hard_copy' | 'other';
  officialDocumentName?: string;
  submissionDate: string;
  quoteValidityDate: string;
  version: number;
  status: 'submitted' | 'under_clarification' | 'verified' | 'shortlisted' | 'rejected' | 'awarded';
  commercials: QuoteCommercials;
  technicalSpecs: QuoteTechnicalSpec[];
  deviationsAndExclusions: string[];
  statutoryCertifications: string[];
  aiExtraction?: AIExtractionDetails;
}

export interface RFPClarification {
  id: string;
  rfpId: string;
  quoteId: string;
  vendorName: string;
  category: 'warranty' | 'commercial' | 'technical' | 'delivery' | 'compliance' | 'amc';
  question: string;
  isAiDrafted?: boolean;
  askedBy: string;
  askedAt: string;
  response?: string;
  respondedAt?: string;
  status: 'open' | 'answered' | 'resolved';
  revisionResulted?: boolean;
}

export interface RFPTCOCalculation {
  periodYears: 5 | 10;
  quoteId: string;
  vendorName: string;
  acquisitionLanded: number;
  sitePrepMEP: number;
  postWarrantyMaintenanceTotal: number;
  estimatedSparesTotal: number;
  estimatedConsumablesTotal: number;
  totalLifecycleCost: number;
  missingDataWarnings: string[];
}

export interface RFPAuditEvent {
  id: string;
  rfpId: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  description: string;
  priorState?: string;
  newState?: string;
}

export interface AdvisorObservation {
  id: string;
  rfpId: string;
  advisorName: string;
  organization: string;
  category: 'technical' | 'commercial_risk' | 'vendor_suitability' | 'negotiation_leverage';
  observation: string;
  recommendation: string;
  createdAt: string;
}

