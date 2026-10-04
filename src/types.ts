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
  maxTotalUses?: number | null; // Total global redemption limit (null = unlimited)
  maxUsesPerUser?: number;       // Per-user redemption limit (default: 1)
  totalRedemptions?: number;     // Current total redemptions recorded
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

export interface AccreditationProgramme {
  id: string;
  name: string;
  code: string; // e.g., 'nabh-entry', 'nabh-full', 'jci', 'nabl'
  authority: string; // e.g., 'Quality Council of India (QCI)', 'JCI (USA)'
  category: 'Hospital Execution Templates' | 'Hospital Accreditation' | 'Laboratory Standards' | 'Laboratory Accreditation' | 'Safety Clearance' | string;
  description: string;
  targetBedCapacity: string; // e.g. 'Up to 50 beds (SHCO)', '100+ beds', 'All hospital sizes'
  estimatedDuration: string; // e.g. '6–9 months', '12–18 months'
  applicableStageNumbers: number[]; // Array of mapped stage numbers from 1 to 15
  stageNotes?: Record<number, string>; // Special milestone notes for specific stages
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id?: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  company?: string;
  specialization?: string;
  isSubscribed?: boolean;
  plan?: string;
  status?: 'active' | 'disabled' | 'pending';
  enrolledAccreditationId?: string;
  enrolledAccreditationDate?: string;
  emailVerified?: boolean;
  claimedDirectoryId?: string;
  createdAt?: string;
  lastLoginAt?: string;
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
  isClaimed?: boolean;
  claimedByUserId?: string;
  claimStatus?: 'unclaimed' | 'pending' | 'claimed';
}

export interface ProfileClaim {
  id: string;
  directoryId: string;
  directoryName: string;
  directoryRole: 'vendor' | 'advisor';
  claimantUserId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  claimantCompany?: string;
  designation?: string;
  proofNotes: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
}

export interface EmailLog {
  id: string;
  toEmail: string;
  recipientName?: string;
  subject: string;
  type: 'verification_otp' | 'claim_submitted' | 'claim_admin_alert' | 'claim_approved' | 'claim_rejected';
  bodyHtml: string;
  bodyText?: string;
  otpCode?: string;
  sentAt: string;
}

export interface VerificationOtp {
  id: string;
  email: string;
  otp: string;
  expiresAt: string;
  verified: boolean;
  createdAt: string;
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
  | 'text_buttons'    // 1. Text Buttons: Text message with up to 3 quick-reply buttons
  | 'media_buttons'   // 2. Media Buttons: Media (image/video/doc) + text + buttons
  | 'list'            // 3. List: Interactive List Menu (Sections & rows)
  | 'catalogue'       // 4. Catalogue Message: WhatsApp Catalog showcase with "View catalog"
  | 'single_product'  // 5. Single Product: Single item showcase with price, image, view action
  | 'multi_product'   // 6. Multi Product: Multi-item catalog showcase with sectioned items
  | 'template'        // 7. Template: Meta-approved pre-configured WhatsApp template
  | 'button'          // Backwards-compatible alias for text_buttons
  | 'flow_screen'     // Meta WhatsApp Flow (Native in-app form screen)
  | 'media_cta'       // Backwards-compatible alias: Media + Call / URL action
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

// Single / Multi Product item specifications
export interface WhatsAppProductItem {
  id: string;
  retailerId: string; // e.g. "SKU-ICU-VENT-01"
  title: string;
  price: string;      // e.g. "₹4,50,000" or "450000"
  catalogId?: string;
  currency?: string;  // e.g. "INR"
  description?: string;
  imageUrl?: string;
  category?: string;
  nextNodeId?: string;
}

export interface WhatsAppProductSection {
  title: string;
  products: WhatsAppProductItem[];
}

export interface WhatsAppCatalogueConfig {
  catalogId: string;
  thumbnailUrl?: string;
  headerText?: string;
  bodyText?: string;
  footerText?: string;
  actionButtonText?: string;
  nextNodeId?: string;
}

export interface WhatsAppTemplateButton {
  id: string;
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  value?: string;
  nextNodeId?: string;
}

export interface WhatsAppTemplateConfig {
  templateName: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  headerType?: 'none' | 'text' | 'image' | 'video' | 'document';
  headerText?: string;
  headerMediaUrl?: string;
  bodyVariables: string[];
  buttons?: WhatsAppTemplateButton[];
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
  
  // E-commerce & Catalogue & Template extensions
  singleProduct?: WhatsAppProductItem;
  productSections?: WhatsAppProductSection[];
  catalogConfig?: WhatsAppCatalogueConfig;
  templateConfig?: WhatsAppTemplateConfig;

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

