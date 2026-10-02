import { sqlClient, isDatabaseConfigured } from './index';
import { DIRECTORY_DATA } from '../data/mockData';
import { DEFAULT_ACCREDITATION_PROGRAMMES } from '../utils/accreditationStorage';
import { INITIAL_PROJECT_REQUIREMENTS } from '../utils/requirementsStorage';
import { INITIAL_ENQUIRIES } from '../utils/enquiriesStorage';
import { PRESET_COUPONS } from '../utils/couponService';
import { getSampleLogins } from '../utils/sampleLogins';
import { DEFAULT_USERS } from '../utils/userManagement';

export async function initializeDatabase(): Promise<boolean> {
  if (!isDatabaseConfigured() || !sqlClient) {
    console.log('[Neon PostgreSQL] DATABASE_URL not configured. Operating in local memory/storage mode.');
    return false;
  }

  try {
    console.log('[Neon PostgreSQL] Initializing database schema on Neon...');

    // 1. Create Tables
    await sqlClient`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(128) PRIMARY KEY,
        name TEXT NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'owner',
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        company TEXT,
        specialization TEXT,
        is_subscribed BOOLEAN DEFAULT true,
        plan TEXT,
        status VARCHAR(32) DEFAULT 'active',
        enrolled_accreditation_id TEXT,
        enrolled_accreditation_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_login_at TIMESTAMPTZ
      );
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS directory_items (
        id VARCHAR(128) PRIMARY KEY,
        name TEXT NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'vendor',
        category TEXT NOT NULL,
        rating REAL DEFAULT 4.8,
        reviews_count INTEGER DEFAULT 1,
        location TEXT NOT NULL,
        service_locations JSONB DEFAULT '[]',
        project_stages JSONB DEFAULT '[]',
        products_and_services JSONB DEFAULT '[]',
        description TEXT NOT NULL,
        verified BOOLEAN DEFAULT true,
        years_of_experience INTEGER DEFAULT 5,
        contact_email TEXT NOT NULL,
        phone TEXT NOT NULL,
        website TEXT DEFAULT '',
        featured_project TEXT,
        client_portfolio JSONB DEFAULT '[]',
        gstin TEXT,
        price_range TEXT,
        turnaround_time TEXT,
        certifications JSONB DEFAULT '[]',
        headquarters_address TEXT,
        compliance_badges JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS accreditation_programmes (
        id VARCHAR(128) PRIMARY KEY,
        name TEXT NOT NULL,
        code VARCHAR(64) NOT NULL UNIQUE,
        authority TEXT NOT NULL,
        category VARCHAR(64) NOT NULL DEFAULT 'Hospital Accreditation',
        description TEXT NOT NULL,
        target_bed_capacity TEXT NOT NULL,
        estimated_duration TEXT NOT NULL,
        applicable_stage_numbers JSONB NOT NULL,
        stage_notes JSONB DEFAULT '{}',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS project_requirements (
        id VARCHAR(128) PRIMARY KEY,
        hospital_name TEXT NOT NULL,
        location TEXT NOT NULL,
        bed_capacity TEXT DEFAULT '',
        stage TEXT DEFAULT '',
        category_needed TEXT NOT NULL,
        description TEXT NOT NULL,
        contact_person TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending_review',
        estimated_budget TEXT,
        admin_notes TEXT,
        assigned_vendors JSONB DEFAULT '[]',
        created_at TEXT NOT NULL
      );
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS enquiries (
        id VARCHAR(128) PRIMARY KEY,
        target_id TEXT NOT NULL,
        target_name TEXT NOT NULL,
        target_email TEXT NOT NULL,
        target_role VARCHAR(32) NOT NULL,
        sender_name TEXT NOT NULL,
        sender_email TEXT NOT NULL,
        sender_phone TEXT,
        sender_role VARCHAR(32) NOT NULL,
        sender_company TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        project_location TEXT,
        hospital_name TEXT,
        bed_capacity TEXT,
        project_stage TEXT,
        status VARCHAR(32) NOT NULL DEFAULT 'new',
        reply_note TEXT,
        created_at TEXT NOT NULL
      );
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS coupons (
        code VARCHAR(64) PRIMARY KEY,
        discount_type VARCHAR(32) NOT NULL,
        discount_value REAL NOT NULL,
        description TEXT NOT NULL,
        applicable_roles JSONB,
        valid_until TEXT,
        max_total_uses INTEGER,
        max_uses_per_user INTEGER DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Ensure columns exist if table was already created
    try {
      await sqlClient`ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_total_uses INTEGER;`;
      await sqlClient`ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_uses_per_user INTEGER DEFAULT 1;`;
    } catch (migErr) {
      console.warn('[Neon PostgreSQL] Coupon column verification notice:', migErr);
    }

    await sqlClient`
      CREATE TABLE IF NOT EXISTS coupon_redemptions (
        id VARCHAR(128) PRIMARY KEY,
        coupon_code VARCHAR(64) NOT NULL,
        discount_type VARCHAR(32) NOT NULL,
        discount_value REAL NOT NULL,
        original_amount REAL NOT NULL,
        discount_amount REAL NOT NULL,
        final_payable REAL NOT NULL,
        is_complimentary BOOLEAN DEFAULT false,
        user_role VARCHAR(32) NOT NULL,
        user_name TEXT NOT NULL,
        user_email TEXT NOT NULL,
        user_phone TEXT,
        company_name TEXT,
        plan_id TEXT NOT NULL,
        plan_title TEXT NOT NULL,
        redeemed_at TIMESTAMPTZ DEFAULT NOW(),
        transaction_id TEXT NOT NULL
      );
    `;

    console.log('[Neon PostgreSQL] Schema tables checked and created.');

    // 2. Automated Seed: Accreditation Programmes
    const countAccreditation = await sqlClient`SELECT COUNT(*) as count FROM accreditation_programmes;`;
    if (Number(countAccreditation[0]?.count || 0) === 0) {
      console.log('[Neon PostgreSQL] Seeding default accreditation programmes (NABH Entry, Full NABH, JCI, NABL)...');
      for (const prog of DEFAULT_ACCREDITATION_PROGRAMMES) {
        await sqlClient`
          INSERT INTO accreditation_programmes (
            id, name, code, authority, category, description,
            target_bed_capacity, estimated_duration, applicable_stage_numbers,
            stage_notes, active, created_at, updated_at
          ) VALUES (
            ${prog.id},
            ${prog.name},
            ${prog.code},
            ${prog.authority},
            ${prog.category},
            ${prog.description},
            ${prog.targetBedCapacity},
            ${prog.estimatedDuration},
            ${JSON.stringify(prog.applicableStageNumbers)},
            ${JSON.stringify(prog.stageNotes || {})},
            ${prog.active},
            ${prog.createdAt || new Date().toISOString()},
            ${prog.updatedAt || new Date().toISOString()}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // 3. Automated Seed: Directory Partners
    const countDirectory = await sqlClient`SELECT COUNT(*) as count FROM directory_items;`;
    if (Number(countDirectory[0]?.count || 0) === 0) {
      console.log(`[Neon PostgreSQL] Seeding initial ${DIRECTORY_DATA.length} healthcare directory partners...`);
      for (const item of DIRECTORY_DATA) {
        await sqlClient`
          INSERT INTO directory_items (
            id, name, role, category, rating, reviews_count, location,
            service_locations, project_stages, products_and_services,
            description, verified, years_of_experience, contact_email,
            phone, website, featured_project, client_portfolio, gstin,
            price_range, turnaround_time, certifications, headquarters_address,
            compliance_badges
          ) VALUES (
            ${item.id},
            ${item.name},
            ${item.role},
            ${item.category},
            ${item.rating},
            ${item.reviewsCount},
            ${item.location},
            ${JSON.stringify(item.serviceLocations || [])},
            ${JSON.stringify(item.projectStages || [])},
            ${JSON.stringify(item.productsAndServices || [])},
            ${item.description},
            ${item.verified},
            ${item.yearsOfExperience},
            ${item.contactEmail},
            ${item.phone},
            ${item.website || ''},
            ${item.featuredProject || null},
            ${JSON.stringify(item.clientPortfolio || [])},
            ${item.gstin || null},
            ${item.priceRange || null},
            ${item.turnaroundTime || null},
            ${JSON.stringify(item.certifications || [])},
            ${item.headquartersAddress || null},
            ${JSON.stringify(item.complianceBadges || [])}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // 4. Automated Seed: Project Requirements
    const countRequirements = await sqlClient`SELECT COUNT(*) as count FROM project_requirements;`;
    if (Number(countRequirements[0]?.count || 0) === 0) {
      console.log(`[Neon PostgreSQL] Seeding initial hospital project requirements...`);
      for (const req of INITIAL_PROJECT_REQUIREMENTS) {
        await sqlClient`
          INSERT INTO project_requirements (
            id, hospital_name, location, bed_capacity, stage,
            category_needed, description, contact_person, email, phone,
            status, estimated_budget, admin_notes, assigned_vendors, created_at
          ) VALUES (
            ${req.id},
            ${req.hospitalName},
            ${req.location},
            ${req.bedCapacity},
            ${req.stage},
            ${req.categoryNeeded},
            ${req.description},
            ${req.contactPerson},
            ${req.email},
            ${req.phone},
            ${req.status || 'pending_review'},
            ${req.estimatedBudget || null},
            ${req.adminNotes || null},
            ${JSON.stringify(req.assignedVendors || [])},
            ${req.createdAt}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // 5. Automated Seed: Enquiries
    const countEnquiries = await sqlClient`SELECT COUNT(*) as count FROM enquiries;`;
    if (Number(countEnquiries[0]?.count || 0) === 0) {
      console.log(`[Neon PostgreSQL] Seeding initial enquiries...`);
      for (const enq of INITIAL_ENQUIRIES) {
        await sqlClient`
          INSERT INTO enquiries (
            id, target_id, target_name, target_email, target_role,
            sender_name, sender_email, sender_phone, sender_role, sender_company,
            subject, message, project_location, hospital_name, bed_capacity,
            project_stage, status, reply_note, created_at
          ) VALUES (
            ${enq.id},
            ${enq.targetId},
            ${enq.targetName},
            ${enq.targetEmail},
            ${enq.targetRole},
            ${enq.senderName},
            ${enq.senderEmail},
            ${enq.senderPhone || null},
            ${enq.senderRole},
            ${enq.senderCompany || null},
            ${enq.subject},
            ${enq.message},
            ${enq.projectLocation || null},
            ${enq.hospitalName || null},
            ${enq.bedCapacity || null},
            ${enq.projectStage || null},
            ${enq.status},
            ${enq.replyNote || null},
            ${enq.createdAt}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // 6. Automated Seed: Preset Coupons
    const countCoupons = await sqlClient`SELECT COUNT(*) as count FROM coupons;`;
    if (Number(countCoupons[0]?.count || 0) === 0) {
      console.log('[Neon PostgreSQL] Seeding preset coupons...');
      for (const c of PRESET_COUPONS) {
        await sqlClient`
          INSERT INTO coupons (
            code, discount_type, discount_value, description, applicable_roles, valid_until,
            max_total_uses, max_uses_per_user
          ) VALUES (
            ${c.code},
            ${c.discountType},
            ${c.discountValue},
            ${c.description},
            ${JSON.stringify(c.applicableRoles || [])},
            ${c.validUntil || null},
            ${c.maxTotalUses ?? null},
            ${c.maxUsesPerUser ?? 1}
          )
          ON CONFLICT (code) DO NOTHING;
        `;
      }
    }

    // 7. Automated Seed: Default Sample Users
    const countUsers = await sqlClient`SELECT COUNT(*) as count FROM users;`;
    if (Number(countUsers[0]?.count || 0) === 0) {
      console.log('[Neon PostgreSQL] Seeding users into database...');
      const sampleUsers = getSampleLogins().length > 0 
        ? getSampleLogins().map(s => ({
            name: s.label || 'Healthcare Member',
            role: s.role,
            email: s.email,
            phone: '+91 98765 43210',
            company: 'Healthcare Organization',
            status: 'active' as const,
            isSubscribed: true,
            plan: s.role === 'admin' ? 'Administrator Master Access' : 'Active Member'
          }))
        : DEFAULT_USERS.map(u => ({
            name: u.name,
            role: u.role,
            email: u.email,
            phone: u.phone || '+91 98765 43210',
            company: u.company || 'Healthcare Organization',
            status: u.status || 'active',
            isSubscribed: u.isSubscribed ?? true,
            plan: u.plan || 'Active Member'
          }));

      for (const u of sampleUsers) {
        const id = `user-${u.role}-${Date.now().toString(36)}`;
        await sqlClient`
          INSERT INTO users (
            id, name, role, email, phone, company, status, is_subscribed, plan
          ) VALUES (
            ${id},
            ${u.name},
            ${u.role},
            ${u.email.toLowerCase().trim()},
            ${u.phone},
            ${u.company},
            ${u.status},
            ${u.isSubscribed},
            ${u.plan}
          )
          ON CONFLICT (email) DO NOTHING;
        `;
      }
    }

    console.log('[Neon PostgreSQL] Database initialization and auto-seeding completed successfully!');
    return true;
  } catch (err) {
    console.error('[Neon PostgreSQL] Error during database initialization:', err);
    return false;
  }
}
