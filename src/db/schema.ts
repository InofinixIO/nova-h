import { pgTable, text, varchar, boolean, real, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { EnquiryStatus, ProjectRequirementStatus, UserRole } from '../types';

export const usersTable = pgTable('users', {
  id: varchar('id', { length: 128 }).primaryKey(),
  name: text('name').notNull(),
  role: varchar('role', { length: 32 }).$type<UserRole>().notNull().default('owner'),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  company: text('company'),
  specialization: text('specialization'),
  isSubscribed: boolean('is_subscribed').default(true),
  plan: text('plan'),
  status: varchar('status', { length: 32 }).$type<'active' | 'disabled' | 'pending'>().default('active'),
  enrolledAccreditationId: text('enrolled_accreditation_id'),
  enrolledAccreditationDate: timestamp('enrolled_accreditation_date', { withTimezone: true }),
  emailVerified: boolean('email_verified').default(false),
  claimedDirectoryId: text('claimed_directory_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true })
});

export const directoryItemsTable = pgTable('directory_items', {
  id: varchar('id', { length: 128 }).primaryKey(),
  name: text('name').notNull(),
  role: varchar('role', { length: 32 }).$type<'vendor' | 'advisor'>().notNull().default('vendor'),
  category: text('category').notNull(),
  rating: real('rating').default(4.8),
  reviewsCount: integer('reviews_count').default(1),
  location: text('location').notNull(),
  serviceLocations: jsonb('service_locations').$type<string[]>().default([]),
  projectStages: jsonb('project_stages').$type<string[]>().default([]),
  productsAndServices: jsonb('products_and_services').$type<string[]>().default([]),
  description: text('description').notNull(),
  verified: boolean('verified').default(true),
  yearsOfExperience: integer('years_of_experience').default(5),
  contactEmail: text('contact_email').notNull(),
  phone: text('phone').notNull(),
  website: text('website').default(''),
  featuredProject: text('featured_project'),
  clientPortfolio: jsonb('client_portfolio').$type<string[]>().default([]),
  gstin: text('gstin'),
  priceRange: text('price_range'),
  turnaroundTime: text('turnaround_time'),
  certifications: jsonb('certifications').$type<string[]>().default([]),
  headquartersAddress: text('headquarters_address'),
  complianceBadges: jsonb('compliance_badges').$type<string[]>().default([]),
  isClaimed: boolean('is_claimed').default(false),
  claimedByUserId: text('claimed_by_user_id'),
  claimStatus: varchar('claim_status', { length: 32 }).default('unclaimed'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const accreditationProgrammesTable = pgTable('accreditation_programmes', {
  id: varchar('id', { length: 128 }).primaryKey(),
  name: text('name').notNull(),
  code: varchar('code', { length: 64 }).notNull().unique(),
  authority: text('authority').notNull(),
  category: varchar('category', { length: 64 }).notNull().default('Hospital Accreditation'),
  description: text('description').notNull(),
  targetBedCapacity: text('target_bed_capacity').notNull(),
  estimatedDuration: text('estimated_duration').notNull(),
  applicableStageNumbers: jsonb('applicable_stage_numbers').$type<number[]>().notNull(),
  stageNotes: jsonb('stage_notes').$type<Record<number, string>>().default({}),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const projectRequirementsTable = pgTable('project_requirements', {
  id: varchar('id', { length: 128 }).primaryKey(),
  hospitalName: text('hospital_name').notNull(),
  location: text('location').notNull(),
  bedCapacity: text('bed_capacity').default(''),
  stage: text('stage').default(''),
  categoryNeeded: text('category_needed').notNull(),
  description: text('description').notNull(),
  contactPerson: text('contact_person').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  createdAt: text('created_at').notNull(),
  status: varchar('status', { length: 32 }).$type<ProjectRequirementStatus>().notNull().default('pending_review'),
  estimatedBudget: text('estimated_budget'),
  adminNotes: text('admin_notes'),
  assignedVendors: jsonb('assigned_vendors').$type<string[]>().default([])
});

export const enquiriesTable = pgTable('enquiries', {
  id: varchar('id', { length: 128 }).primaryKey(),
  targetId: text('target_id').notNull(),
  targetName: text('target_name').notNull(),
  targetEmail: text('target_email').notNull(),
  targetRole: varchar('target_role', { length: 32 }).$type<'vendor' | 'advisor' | 'owner'>().notNull(),
  senderName: text('sender_name').notNull(),
  senderEmail: text('sender_email').notNull(),
  senderPhone: text('sender_phone'),
  senderRole: varchar('sender_role', { length: 32 }).$type<UserRole>().notNull(),
  senderCompany: text('sender_company'),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  projectLocation: text('project_location'),
  hospitalName: text('hospital_name'),
  bedCapacity: text('bed_capacity'),
  projectStage: text('project_stage'),
  status: varchar('status', { length: 32 }).$type<EnquiryStatus>().notNull().default('new'),
  replyNote: text('reply_note'),
  createdAt: text('created_at').notNull()
});

export const couponsTable = pgTable('coupons', {
  code: varchar('code', { length: 64 }).primaryKey(),
  discountType: varchar('discount_type', { length: 32 }).notNull(),
  discountValue: real('discount_value').notNull(),
  description: text('description').notNull(),
  applicableRoles: jsonb('applicable_roles').$type<string[]>(),
  validUntil: text('valid_until'),
  maxTotalUses: integer('max_total_uses'),
  maxUsesPerUser: integer('max_uses_per_user').default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const couponRedemptionsTable = pgTable('coupon_redemptions', {
  id: varchar('id', { length: 128 }).primaryKey(),
  couponCode: varchar('coupon_code', { length: 64 }).notNull(),
  discountType: varchar('discount_type', { length: 32 }).notNull(),
  discountValue: real('discount_value').notNull(),
  originalAmount: real('original_amount').notNull(),
  discountAmount: real('discount_amount').notNull(),
  finalPayable: real('final_payable').notNull(),
  isComplimentary: boolean('is_complimentary').default(false),
  userRole: varchar('user_role', { length: 32 }).notNull(),
  userName: text('user_name').notNull(),
  userEmail: text('user_email').notNull(),
  userPhone: text('user_phone'),
  companyName: text('company_name'),
  planId: text('plan_id').notNull(),
  planTitle: text('plan_title').notNull(),
  redeemedAt: timestamp('redeemed_at', { withTimezone: true }).defaultNow(),
  transactionId: text('transaction_id').notNull()
});

export const profileClaimsTable = pgTable('profile_claims', {
  id: varchar('id', { length: 128 }).primaryKey(),
  directoryId: text('directory_id').notNull(),
  directoryName: text('directory_name').notNull(),
  directoryRole: varchar('directory_role', { length: 32 }).notNull().default('vendor'),
  claimantUserId: text('claimant_user_id').notNull(),
  claimantName: text('claimant_name').notNull(),
  claimantEmail: text('claimant_email').notNull(),
  claimantPhone: text('claimant_phone').notNull(),
  claimantCompany: text('claimant_company'),
  designation: text('designation'),
  proofNotes: text('proof_notes').notNull(),
  status: varchar('status', { length: 32 }).notNull().default('pending'),
  createdAt: text('created_at').notNull(),
  reviewedAt: text('reviewed_at'),
  reviewerNotes: text('reviewer_notes')
});

export const verificationOtpsTable = pgTable('verification_otps', {
  id: varchar('id', { length: 128 }).primaryKey(),
  email: text('email').notNull(),
  otp: varchar('otp', { length: 16 }).notNull(),
  expiresAt: text('expires_at').notNull(),
  verified: boolean('verified').default(false),
  createdAt: text('created_at').notNull()
});

export const emailLogsTable = pgTable('email_logs', {
  id: varchar('id', { length: 128 }).primaryKey(),
  toEmail: text('to_email').notNull(),
  recipientName: text('recipient_name'),
  subject: text('subject').notNull(),
  type: varchar('type', { length: 64 }).notNull(),
  bodyHtml: text('body_html').notNull(),
  bodyText: text('body_text'),
  otpCode: varchar('otp_code', { length: 16 }),
  sentAt: text('sent_at').notNull()
});

