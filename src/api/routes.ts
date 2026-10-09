import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { sqlClient, isDatabaseConfigured } from '../db/index';
import { DIRECTORY_DATA } from '../data/mockData';
import { DEFAULT_ACCREDITATION_PROGRAMMES } from '../utils/accreditationStorage';
import { INITIAL_PROJECT_REQUIREMENTS } from '../utils/requirementsStorage';
import { INITIAL_ENQUIRIES } from '../utils/enquiriesStorage';
import { PRESET_COUPONS } from '../utils/couponService';
import { getSampleLogins } from '../utils/sampleLogins';
import { DEFAULT_USERS } from '../utils/userManagement';
import { DirectoryItem, AccreditationProgramme, ProjectRequirement, EnquiryItem, AuthUser, ProfileClaim, EmailLog, VerificationOtp, RFPItem, RFPQuote, RFPClarification, RFPAuditEvent, AdvisorObservation } from '../types';

export const apiRouter = Router();

// Helper for SMTP email transport
async function sendSmtpEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  if (!host) return false;
  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || ''
      } : undefined
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"NOVA Healthcare Platform" <no-reply@nova-h.in>',
      to,
      subject,
      text: text || '',
      html
    });
    console.log(`[SMTP] Successfully dispatched email to ${to}: "${subject}"`);
    return true;
  } catch (smtpErr) {
    console.warn(`[SMTP] Failed to send email via SMTP to ${to}:`, smtpErr);
    return false;
  }
}

// In-memory fallback stores when DATABASE_URL is not set
let memoryDirectory: DirectoryItem[] = [...DIRECTORY_DATA];
let memoryAccreditations: AccreditationProgramme[] = [...DEFAULT_ACCREDITATION_PROGRAMMES];
let memoryRequirements: ProjectRequirement[] = [...INITIAL_PROJECT_REQUIREMENTS];
let memoryEnquiries: EnquiryItem[] = [...INITIAL_ENQUIRIES];
let memoryClaims: ProfileClaim[] = [];
let memoryOtps: VerificationOtp[] = [];
let memoryEmailLogs: EmailLog[] = [];
let memoryUsers: AuthUser[] = getSampleLogins().length > 0 
  ? getSampleLogins().map(s => ({
      id: `user-${s.role}-mem`,
      name: s.label || 'Healthcare Member',
      role: s.role,
      email: s.email,
      phone: '+91 98765 43210',
      company: 'Healthcare Organization',
      isSubscribed: true,
      status: 'active',
      plan: s.role === 'admin' ? 'Administrator Master Access' : 'Active Member',
      createdAt: new Date().toISOString()
    }))
  : [...DEFAULT_USERS];

// ==========================================
// 1. HEALTH & DATABASE STATUS
// ==========================================
apiRouter.get('/health', (_req: Request, res: Response) => {
  const configured = isDatabaseConfigured();
  res.json({
    status: 'ok',
    service: 'NOVA-H Healthcare Platform API',
    database: {
      configured,
      provider: configured ? 'Neon Serverless PostgreSQL' : 'Local Fallback Storage',
      urlMasked: configured ? `${process.env.DATABASE_URL?.split('@')[1] || 'neon.tech'}` : null
    },
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 2. DIRECTORY ITEMS (Vendors & Advisors)
// ==========================================
apiRouter.get('/directory', async (_req: Request, res: Response) => {
  try {
    if (isDatabaseConfigured() && sqlClient) {
      const rows = await sqlClient`
        SELECT 
          id, name, role, category, rating, reviews_count as "reviewsCount",
          location, service_locations as "serviceLocations", project_stages as "projectStages",
          products_and_services as "productsAndServices", description, verified,
          years_of_experience as "yearsOfExperience", contact_email as "contactEmail",
          phone, website, featured_project as "featuredProject", client_portfolio as "clientPortfolio",
          gstin, price_range as "priceRange", turnaround_time as "turnaroundTime",
          certifications, headquarters_address as "headquartersAddress",
          compliance_badges as "complianceBadges", created_at as "createdAt"
        FROM directory_items
        ORDER BY rating DESC;
      `;
      if (rows && rows.length > 0) {
        return res.json(rows);
      }
    }
    return res.json(memoryDirectory);
  } catch (err) {
    console.error('[API] Error fetching directory:', err);
    return res.json(memoryDirectory);
  }
});

apiRouter.post('/directory', async (req: Request, res: Response) => {
  try {
    const item: DirectoryItem = req.body;
    if (!item.id || !item.name) {
      return res.status(400).json({ error: 'id and name are required' });
    }

    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`
        INSERT INTO directory_items (
          id, name, role, category, rating, reviews_count, location,
          service_locations, project_stages, products_and_services,
          description, verified, years_of_experience, contact_email,
          phone, website, featured_project, client_portfolio, gstin,
          price_range, turnaround_time, certifications, headquarters_address,
          compliance_badges
        ) VALUES (
          ${item.id}, ${item.name}, ${item.role}, ${item.category},
          ${item.rating || 4.8}, ${item.reviewsCount || 1}, ${item.location},
          ${JSON.stringify(item.serviceLocations || [])},
          ${JSON.stringify(item.projectStages || [])},
          ${JSON.stringify(item.productsAndServices || [])},
          ${item.description}, ${item.verified ?? true},
          ${item.yearsOfExperience || 5}, ${item.contactEmail},
          ${item.phone}, ${item.website || ''},
          ${item.featuredProject || null},
          ${JSON.stringify(item.clientPortfolio || [])},
          ${item.gstin || null}, ${item.priceRange || null},
          ${item.turnaroundTime || null},
          ${JSON.stringify(item.certifications || [])},
          ${item.headquartersAddress || null},
          ${JSON.stringify(item.complianceBadges || [])}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          phone = EXCLUDED.phone,
          contact_email = EXCLUDED.contact_email,
          products_and_services = EXCLUDED.products_and_services;
      `;
    }

    // Also update in-memory
    const idx = memoryDirectory.findIndex(d => d.id === item.id);
    if (idx >= 0) {
      memoryDirectory[idx] = item;
    } else {
      memoryDirectory = [item, ...memoryDirectory];
    }

    return res.json({ success: true, item });
  } catch (err: any) {
    console.error('[API] Error saving directory item:', err);
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/directory/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`DELETE FROM directory_items WHERE id = ${id};`;
    }
    memoryDirectory = memoryDirectory.filter(d => d.id !== id);
    return res.json({ success: true, id });
  } catch (err: any) {
    console.error('[API] Error deleting directory item:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Bulk Import & Ingestion Endpoint for CSV / Database Sync
apiRouter.post('/directory/bulk', async (req: Request, res: Response) => {
  try {
    const { items, mode = 'append' } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required and must not be empty' });
    }

    const sanitizedItems: DirectoryItem[] = items.map((item, index) => {
      const sanitizedId = item.id && item.id.trim() 
        ? item.id.trim() 
        : `partner-csv-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`;
      return {
        id: sanitizedId,
        name: item.name ? String(item.name).trim() : 'Unnamed Healthcare Partner',
        role: (item.role === 'advisor' || item.role === 'hospital' ? item.role : 'vendor'),
        category: item.category ? String(item.category).trim() : 'Hospital Infrastructure',
        rating: Number(item.rating) || 4.8,
        reviewsCount: Number(item.reviewsCount) || 1,
        location: item.location ? String(item.location).trim() : 'Pan-India',
        serviceLocations: Array.isArray(item.serviceLocations) ? item.serviceLocations : ['Pan-India'],
        projectStages: Array.isArray(item.projectStages) ? item.projectStages : [1, 2, 3],
        productsAndServices: Array.isArray(item.productsAndServices) ? item.productsAndServices : [],
        description: item.description ? String(item.description).trim() : 'Healthcare partner verified via NOVA administrative import.',
        verified: item.verified ?? true,
        yearsOfExperience: Number(item.yearsOfExperience) || 5,
        contactEmail: item.contactEmail ? String(item.contactEmail).trim() : 'contact@partner.in',
        phone: item.phone ? String(item.phone).trim() : '+91 98765 43210',
        website: item.website ? String(item.website).trim() : '',
        featuredProject: item.featuredProject || null,
        clientPortfolio: Array.isArray(item.clientPortfolio) ? item.clientPortfolio : [],
        gstin: item.gstin || null,
        priceRange: item.priceRange || null,
        turnaroundTime: item.turnaroundTime || null,
        certifications: Array.isArray(item.certifications) ? item.certifications : ['ISO 9001', 'AERB Compliant'],
        headquartersAddress: item.headquartersAddress || null,
        complianceBadges: Array.isArray(item.complianceBadges) ? item.complianceBadges : ['Verified Vendor']
      };
    });

    const isDb = isDatabaseConfigured() && Boolean(sqlClient);

    if (isDb && sqlClient) {
      if (mode === 'replace') {
        // Clear all existing directory listings for a fresh replace
        await sqlClient`DELETE FROM directory_items;`;
      }

      for (const itm of sanitizedItems) {
        await sqlClient`
          INSERT INTO directory_items (
            id, name, role, category, rating, reviews_count, location,
            service_locations, project_stages, products_and_services,
            description, verified, years_of_experience, contact_email,
            phone, website, featured_project, client_portfolio, gstin,
            price_range, turnaround_time, certifications, headquarters_address,
            compliance_badges
          ) VALUES (
            ${itm.id}, ${itm.name}, ${itm.role}, ${itm.category},
            ${itm.rating}, ${itm.reviewsCount}, ${itm.location},
            ${JSON.stringify(itm.serviceLocations)},
            ${JSON.stringify(itm.projectStages)},
            ${JSON.stringify(itm.productsAndServices)},
            ${itm.description}, ${itm.verified},
            ${itm.yearsOfExperience}, ${itm.contactEmail},
            ${itm.phone}, ${itm.website || ''},
            ${itm.featuredProject || null},
            ${JSON.stringify(itm.clientPortfolio)},
            ${itm.gstin || null}, ${itm.priceRange || null},
            ${itm.turnaroundTime || null},
            ${JSON.stringify(itm.certifications)},
            ${itm.headquartersAddress || null},
            ${JSON.stringify(itm.complianceBadges)}
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            category = EXCLUDED.category,
            description = EXCLUDED.description,
            phone = EXCLUDED.phone,
            contact_email = EXCLUDED.contact_email,
            products_and_services = EXCLUDED.products_and_services,
            location = EXCLUDED.location,
            featured_project = EXCLUDED.featured_project,
            compliance_badges = EXCLUDED.compliance_badges,
            verified = EXCLUDED.verified,
            gstin = EXCLUDED.gstin,
            price_range = EXCLUDED.price_range,
            turnaround_time = EXCLUDED.turnaround_time,
            certifications = EXCLUDED.certifications,
            headquarters_address = EXCLUDED.headquarters_address;
        `;
      }
    }

    // Keep in-memory store coherent
    if (mode === 'replace') {
      memoryDirectory = [...sanitizedItems];
    } else {
      const existingIds = new Set(memoryDirectory.map(m => m.id));
      const additions = sanitizedItems.filter(i => !existingIds.has(i.id));
      const incomingMap = new Map(sanitizedItems.map(i => [i.id, i]));
      const updatedExisting = memoryDirectory.map(m => incomingMap.get(m.id) || m);
      memoryDirectory = [...additions, ...updatedExisting];
    }

    let totalCount = memoryDirectory.length;
    if (isDb && sqlClient) {
      const countRes = await sqlClient`SELECT COUNT(*) as count FROM directory_items;`;
      totalCount = Number(countRes[0]?.count || sanitizedItems.length);
    }

    return res.json({
      success: true,
      mode,
      importedCount: sanitizedItems.length,
      totalCount,
      database: isDb ? 'Neon Serverless PostgreSQL' : 'Local Fallback Storage',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[API] Error during bulk directory import:', err);
    return res.status(500).json({ error: err.message || 'Bulk import failed' });
  }
});

// Database & Directory Sync Statistics Endpoint
apiRouter.get('/directory/stats', async (_req: Request, res: Response) => {
  try {
    const configured = isDatabaseConfigured() && Boolean(sqlClient);
    let totalCount = memoryDirectory.length;
    if (configured && sqlClient) {
      try {
        const countRes = await sqlClient`SELECT COUNT(*) as count FROM directory_items;`;
        totalCount = Number(countRes[0]?.count || 0);
      } catch (countErr) {
        console.warn('[API] Could not count directory_items table:', countErr);
      }
    }

    return res.json({
      totalCount,
      databaseConfigured: configured,
      databaseProvider: configured ? 'Neon Serverless PostgreSQL' : 'Local Fallback Storage',
      lastSyncedAt: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. ACCREDITATION PROGRAMMES
// ==========================================
apiRouter.get('/accreditations', async (_req: Request, res: Response) => {
  try {
    if (isDatabaseConfigured() && sqlClient) {
      const rows = await sqlClient`
        SELECT 
          id, name, code, authority, category, description,
          target_bed_capacity as "targetBedCapacity",
          estimated_duration as "estimatedDuration",
          applicable_stage_numbers as "applicableStageNumbers",
          stage_notes as "stageNotes",
          active,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM accreditation_programmes
        ORDER BY created_at ASC;
      `;
      if (rows && rows.length > 0) {
        return res.json(rows);
      }
    }
    return res.json(memoryAccreditations);
  } catch (err) {
    console.error('[API] Error fetching accreditations:', err);
    return res.json(memoryAccreditations);
  }
});

apiRouter.post('/accreditations', async (req: Request, res: Response) => {
  try {
    const prog: AccreditationProgramme = req.body;
    if (!prog.name || !prog.code) {
      return res.status(400).json({ error: 'name and code are required' });
    }
    const id = prog.id || `prog-${Date.now()}`;
    const cleanProg: AccreditationProgramme = {
      ...prog,
      id,
      createdAt: prog.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`
        INSERT INTO accreditation_programmes (
          id, name, code, authority, category, description,
          target_bed_capacity, estimated_duration, applicable_stage_numbers,
          stage_notes, active, created_at, updated_at
        ) VALUES (
          ${cleanProg.id}, ${cleanProg.name}, ${cleanProg.code},
          ${cleanProg.authority}, ${cleanProg.category}, ${cleanProg.description},
          ${cleanProg.targetBedCapacity}, ${cleanProg.estimatedDuration},
          ${JSON.stringify(cleanProg.applicableStageNumbers)},
          ${JSON.stringify(cleanProg.stageNotes || {})},
          ${cleanProg.active ?? true},
          ${cleanProg.createdAt}, ${cleanProg.updatedAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          authority = EXCLUDED.authority,
          description = EXCLUDED.description,
          target_bed_capacity = EXCLUDED.target_bed_capacity,
          estimated_duration = EXCLUDED.estimated_duration,
          applicable_stage_numbers = EXCLUDED.applicable_stage_numbers,
          stage_notes = EXCLUDED.stage_notes,
          active = EXCLUDED.active,
          updated_at = EXCLUDED.updated_at;
      `;
    }

    const idx = memoryAccreditations.findIndex(p => p.id === cleanProg.id);
    if (idx >= 0) {
      memoryAccreditations[idx] = cleanProg;
    } else {
      memoryAccreditations = [cleanProg, ...memoryAccreditations];
    }

    return res.json({ success: true, programme: cleanProg });
  } catch (err: any) {
    console.error('[API] Error saving accreditation programme:', err);
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/accreditations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`DELETE FROM accreditation_programmes WHERE id = ${id};`;
    }
    memoryAccreditations = memoryAccreditations.filter(p => p.id !== id);
    return res.json({ success: true, id });
  } catch (err: any) {
    console.error('[API] Error deleting accreditation programme:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. PROJECT REQUIREMENTS (Promoter RFQs)
// ==========================================
apiRouter.get('/requirements', async (_req: Request, res: Response) => {
  try {
    if (isDatabaseConfigured() && sqlClient) {
      const rows = await sqlClient`
        SELECT 
          id, hospital_name as "hospitalName", location, bed_capacity as "bedCapacity",
          stage, category_needed as "categoryNeeded", description,
          contact_person as "contactPerson", email, phone, status,
          estimated_budget as "estimatedBudget", admin_notes as "adminNotes",
          assigned_vendors as "assignedVendors", created_at as "createdAt"
        FROM project_requirements
        ORDER BY created_at DESC;
      `;
      return res.json(rows);
    }
    return res.json(memoryRequirements);
  } catch (err) {
    console.error('[API] Error fetching requirements:', err);
    return res.json(memoryRequirements);
  }
});

apiRouter.post('/requirements', async (req: Request, res: Response) => {
  try {
    const r: ProjectRequirement = req.body;
    const id = r.id || `req-${Date.now()}`;
    const newReq: ProjectRequirement = {
      ...r,
      id,
      status: r.status || 'pending_review',
      createdAt: r.createdAt || new Date().toISOString()
    };

    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`
        INSERT INTO project_requirements (
          id, hospital_name, location, bed_capacity, stage,
          category_needed, description, contact_person, email, phone,
          status, estimated_budget, admin_notes, assigned_vendors, created_at
        ) VALUES (
          ${newReq.id}, ${newReq.hospitalName}, ${newReq.location},
          ${newReq.bedCapacity || ''}, ${newReq.stage || ''},
          ${newReq.categoryNeeded}, ${newReq.description},
          ${newReq.contactPerson}, ${newReq.email}, ${newReq.phone},
          ${newReq.status || 'pending_review'}, ${newReq.estimatedBudget || null},
          ${newReq.adminNotes || null}, ${JSON.stringify(newReq.assignedVendors || [])},
          ${newReq.createdAt}
        );
      `;
    }

    memoryRequirements = [newReq, ...memoryRequirements];
    return res.json({ success: true, requirement: newReq });
  } catch (err: any) {
    console.error('[API] Error creating requirement:', err);
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/requirements/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`
        UPDATE project_requirements
        SET status = ${status}
        WHERE id = ${id};
      `;
    }

    const item = memoryRequirements.find(r => r.id === id);
    if (item) {
      item.status = status;
    }

    return res.json({ success: true, id, status });
  } catch (err: any) {
    console.error('[API] Error updating requirement status:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. ENQUIRIES (Direct B2B Communications)
// ==========================================
apiRouter.get('/enquiries', async (_req: Request, res: Response) => {
  try {
    if (isDatabaseConfigured() && sqlClient) {
      const rows = await sqlClient`
        SELECT 
          id, target_id as "targetId", target_name as "targetName",
          target_email as "targetEmail", target_role as "targetRole",
          sender_name as "senderName", sender_email as "senderEmail",
          sender_phone as "senderPhone", sender_role as "senderRole",
          sender_company as "senderCompany", subject, message,
          project_location as "projectLocation", hospital_name as "hospitalName",
          bed_capacity as "bedCapacity", project_stage as "projectStage",
          status, reply_note as "replyNote", created_at as "createdAt"
        FROM enquiries
        ORDER BY created_at DESC;
      `;
      return res.json(rows);
    }
    return res.json(memoryEnquiries);
  } catch (err) {
    console.error('[API] Error fetching enquiries:', err);
    return res.json(memoryEnquiries);
  }
});

apiRouter.post('/enquiries', async (req: Request, res: Response) => {
  try {
    const e: EnquiryItem = req.body;
    const id = e.id || `enq-${Date.now()}`;
    const newEnq: EnquiryItem = {
      ...e,
      id,
      status: e.status || 'new',
      createdAt: e.createdAt || new Date().toISOString()
    };

    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`
        INSERT INTO enquiries (
          id, target_id, target_name, target_email, target_role,
          sender_name, sender_email, sender_phone, sender_role,
          sender_company, subject, message, project_location,
          hospital_name, bed_capacity, project_stage,
          status, reply_note, created_at
        ) VALUES (
          ${newEnq.id}, ${newEnq.targetId}, ${newEnq.targetName},
          ${newEnq.targetEmail}, ${newEnq.targetRole},
          ${newEnq.senderName}, ${newEnq.senderEmail},
          ${newEnq.senderPhone || null}, ${newEnq.senderRole},
          ${newEnq.senderCompany || null}, ${newEnq.subject},
          ${newEnq.message}, ${newEnq.projectLocation || null},
          ${newEnq.hospitalName || null}, ${newEnq.bedCapacity || null},
          ${newEnq.projectStage || null}, ${newEnq.status},
          ${newEnq.replyNote || null}, ${newEnq.createdAt}
        );
      `;
    }

    memoryEnquiries = [newEnq, ...memoryEnquiries];
    return res.json({ success: true, enquiry: newEnq });
  } catch (err: any) {
    console.error('[API] Error creating enquiry:', err);
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/enquiries/:id/reply', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ error: 'reply is required' });

    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`
        UPDATE enquiries
        SET 
          reply_note = ${reply},
          status = 'proposal_sent'
        WHERE id = ${id};
      `;
    }

    const item = memoryEnquiries.find(e => e.id === id);
    if (item) {
      item.replyNote = reply;
      item.status = 'proposal_sent';
    }

    return res.json({ success: true, id, reply });
  } catch (err: any) {
    console.error('[API] Error replying to enquiry:', err);
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/enquiries/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });

    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`
        UPDATE enquiries
        SET status = ${status}
        WHERE id = ${id};
      `;
    }

    const item = memoryEnquiries.find(e => e.id === id);
    if (item) {
      item.status = status;
    }

    return res.json({ success: true, id, status });
  } catch (err: any) {
    console.error('[API] Error updating enquiry status:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. USERS & PROFILES
// ==========================================
apiRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    if (isDatabaseConfigured() && sqlClient) {
      const rows = await sqlClient`
        SELECT 
          id, name, role, email, phone, company, specialization,
          is_subscribed as "isSubscribed", plan, status,
          enrolled_accreditation_id as "enrolledAccreditationId",
          enrolled_accreditation_date as "enrolledAccreditationDate",
          created_at as "createdAt", last_login_at as "lastLoginAt"
        FROM users
        ORDER BY created_at DESC;
      `;
      return res.json(rows);
    }
    return res.json(memoryUsers);
  } catch (err) {
    console.error('[API] Error fetching users:', err);
    return res.json(memoryUsers);
  }
});

apiRouter.post('/users/sync', async (req: Request, res: Response) => {
  try {
    const user: AuthUser = req.body;
    if (!user.email) return res.status(400).json({ error: 'email is required' });

    const id = user.id || `user-${Date.now().toString(36)}`;
    const updatedUser: AuthUser = {
      ...user,
      id,
      lastLoginAt: new Date().toISOString()
    };

    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`
        INSERT INTO users (
          id, name, role, email, phone, company, specialization,
          is_subscribed, plan, status, enrolled_accreditation_id,
          enrolled_accreditation_date, created_at, last_login_at
        ) VALUES (
          ${updatedUser.id}, ${updatedUser.name}, ${updatedUser.role},
          ${updatedUser.email.toLowerCase().trim()}, ${updatedUser.phone || null},
          ${updatedUser.company || null}, ${updatedUser.specialization || null},
          ${updatedUser.isSubscribed ?? true}, ${updatedUser.plan || null},
          ${updatedUser.status || 'active'},
          ${updatedUser.enrolledAccreditationId || null},
          ${updatedUser.enrolledAccreditationDate || null},
          ${updatedUser.createdAt || new Date().toISOString()},
          ${updatedUser.lastLoginAt}
        )
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          phone = COALESCE(EXCLUDED.phone, users.phone),
          company = COALESCE(EXCLUDED.company, users.company),
          is_subscribed = EXCLUDED.is_subscribed,
          plan = COALESCE(EXCLUDED.plan, users.plan),
          status = COALESCE(EXCLUDED.status, users.status),
          enrolled_accreditation_id = EXCLUDED.enrolled_accreditation_id,
          enrolled_accreditation_date = EXCLUDED.enrolled_accreditation_date,
          last_login_at = EXCLUDED.last_login_at;
      `;
    }

    const idx = memoryUsers.findIndex(u => u.email.toLowerCase().trim() === user.email.toLowerCase().trim());
    if (idx >= 0) {
      memoryUsers[idx] = { ...memoryUsers[idx], ...updatedUser };
    } else {
      memoryUsers = [updatedUser, ...memoryUsers];
    }

    return res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error('[API] Error syncing user:', err);
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/users/:email/status', async (req: Request, res: Response) => {
  try {
    const emailNorm = req.params.email.toLowerCase().trim();
    const { status, plan, isSubscribed } = req.body;

    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`
        UPDATE users
        SET 
          status = COALESCE(${status || null}, status),
          plan = COALESCE(${plan || null}, plan),
          is_subscribed = COALESCE(${isSubscribed ?? null}, is_subscribed)
        WHERE LOWER(email) = ${emailNorm};
      `;
    }

    const idx = memoryUsers.findIndex(u => u.email.toLowerCase().trim() === emailNorm);
    if (idx >= 0) {
      if (status) memoryUsers[idx].status = status;
      if (plan) memoryUsers[idx].plan = plan;
      if (isSubscribed !== undefined) memoryUsers[idx].isSubscribed = isSubscribed;
    }

    return res.json({ success: true, email: emailNorm, status, plan });
  } catch (err: any) {
    console.error('[API] Error updating user status:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. COUPONS & MEMBERSHIP REDEMPTIONS
// ==========================================
let memoryCoupons = [...PRESET_COUPONS];
let memoryRedemptions: any[] = [];

apiRouter.get('/coupons', async (_req: Request, res: Response) => {
  try {
    if (isDatabaseConfigured() && sqlClient) {
      const rows = await sqlClient`
        SELECT 
          c.code, c.discount_type as "discountType", c.discount_value as "discountValue",
          c.description, c.applicable_roles as "applicableRoles", c.valid_until as "validUntil",
          c.max_total_uses as "maxTotalUses", c.max_uses_per_user as "maxUsesPerUser",
          COALESCE(COUNT(r.id), 0)::int as "totalRedemptions"
        FROM coupons c
        LEFT JOIN coupon_redemptions r ON LOWER(r.coupon_code) = LOWER(c.code)
        GROUP BY c.code, c.discount_type, c.discount_value, c.description, c.applicable_roles, c.valid_until, c.max_total_uses, c.max_uses_per_user
        ORDER BY c.code ASC;
      `;
      if (rows && rows.length > 0) {
        return res.json(rows);
      }
    }

    const list = memoryCoupons.map(c => {
      const total = memoryRedemptions.filter(r => r.couponCode.toUpperCase() === c.code.toUpperCase()).length;
      return {
        ...c,
        maxTotalUses: c.maxTotalUses !== undefined ? c.maxTotalUses : null,
        maxUsesPerUser: c.maxUsesPerUser !== undefined ? c.maxUsesPerUser : 1,
        totalRedemptions: total
      };
    });
    return res.json(list);
  } catch (err) {
    console.error('[API] Error fetching coupons:', err);
    return res.json(memoryCoupons);
  }
});

apiRouter.post('/coupons/validate', async (req: Request, res: Response) => {
  try {
    const { code, baseAmount, role, userEmail, userPhone } = req.body;
    const cleanCode = (code || '').trim().toUpperCase();

    if (!cleanCode) {
      const gst = Math.round(Number(baseAmount || 0) * 0.18);
      return res.json({
        isValid: false,
        coupon: null,
        message: 'Please enter a valid coupon code.',
        originalBase: Number(baseAmount || 0),
        discountAmount: 0,
        discountedBase: Number(baseAmount || 0),
        gstAmount: gst,
        finalPayable: Number(baseAmount || 0) + gst,
        isComplimentary: false
      });
    }

    let found: any = null;
    let totalRedemptions = 0;
    let userRedemptions = 0;

    if (isDatabaseConfigured() && sqlClient) {
      const couponRows = await sqlClient`
        SELECT 
          code, discount_type as "discountType", discount_value as "discountValue",
          description, applicable_roles as "applicableRoles", valid_until as "validUntil",
          max_total_uses as "maxTotalUses", max_uses_per_user as "maxUsesPerUser"
        FROM coupons
        WHERE UPPER(code) = ${cleanCode};
      `;
      if (couponRows && couponRows.length > 0) {
        found = couponRows[0];
      }

      if (found) {
        const countRows = await sqlClient`
          SELECT COUNT(*)::int as count
          FROM coupon_redemptions
          WHERE UPPER(coupon_code) = ${cleanCode};
        `;
        totalRedemptions = countRows[0]?.count || 0;

        if (userEmail || userPhone) {
          const normEmail = (userEmail || '').trim().toLowerCase();
          const cleanP = (userPhone || '').replace(/\D/g, '');
          const userCountRows = await sqlClient`
            SELECT COUNT(*)::int as count
            FROM coupon_redemptions
            WHERE UPPER(coupon_code) = ${cleanCode}
              AND (
                (${normEmail !== ''} AND LOWER(user_email) = ${normEmail})
                OR (${cleanP !== ''} AND user_phone = ${cleanP})
              );
          `;
          userRedemptions = userCountRows[0]?.count || 0;
        }
      }
    }

    if (!found) {
      found = memoryCoupons.find(c => c.code.toUpperCase() === cleanCode);
      if (found) {
        totalRedemptions = memoryRedemptions.filter(r => r.couponCode.toUpperCase() === cleanCode).length;
        if (userEmail || userPhone) {
          const normEmail = (userEmail || '').trim().toLowerCase();
          const cleanP = (userPhone || '').replace(/\D/g, '');
          userRedemptions = memoryRedemptions.filter(r => {
            if (r.couponCode.toUpperCase() !== cleanCode) return false;
            const rEmail = (r.userEmail || '').trim().toLowerCase();
            const rPhone = (r.userPhone || '').replace(/\D/g, '');
            return (normEmail && rEmail === normEmail) || (cleanP && rPhone === cleanP);
          }).length;
        }
      }
    }

    if (!found) {
      const gst = Math.round(Number(baseAmount || 0) * 0.18);
      return res.json({
        isValid: false,
        coupon: null,
        message: `Coupon code "${cleanCode}" is invalid or expired.`,
        originalBase: Number(baseAmount || 0),
        discountAmount: 0,
        discountedBase: Number(baseAmount || 0),
        gstAmount: gst,
        finalPayable: Number(baseAmount || 0) + gst,
        isComplimentary: false
      });
    }

    // 1. Date Expiry Check
    if (found.validUntil) {
      const expiry = new Date(found.validUntil);
      if (!isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
        const gst = Math.round(Number(baseAmount || 0) * 0.18);
        return res.json({
          isValid: false,
          coupon: found,
          message: `Coupon "${found.code}" expired on ${expiry.toLocaleDateString('en-IN')}.`,
          originalBase: Number(baseAmount || 0),
          discountAmount: 0,
          discountedBase: Number(baseAmount || 0),
          gstAmount: gst,
          finalPayable: Number(baseAmount || 0) + gst,
          isComplimentary: false,
          isLimitReached: true
        });
      }
    }

    // 2. Role Applicability Check
    if (role && found.applicableRoles && !found.applicableRoles.includes(role)) {
      const gst = Math.round(Number(baseAmount || 0) * 0.18);
      return res.json({
        isValid: false,
        coupon: found,
        message: `Coupon "${found.code}" is not applicable for ${role} accounts.`,
        originalBase: Number(baseAmount || 0),
        discountAmount: 0,
        discountedBase: Number(baseAmount || 0),
        gstAmount: gst,
        finalPayable: Number(baseAmount || 0) + gst,
        isComplimentary: false
      });
    }

    // 3. Global Usage Limit Check (maxTotalUses)
    if (found.maxTotalUses !== undefined && found.maxTotalUses !== null && found.maxTotalUses > 0) {
      if (totalRedemptions >= found.maxTotalUses) {
        const gst = Math.round(Number(baseAmount || 0) * 0.18);
        return res.json({
          isValid: false,
          coupon: found,
          message: `Coupon "${found.code}" has reached its maximum platform limit (${found.maxTotalUses} redemptions).`,
          originalBase: Number(baseAmount || 0),
          discountAmount: 0,
          discountedBase: Number(baseAmount || 0),
          gstAmount: gst,
          finalPayable: Number(baseAmount || 0) + gst,
          isComplimentary: false,
          totalRedemptions,
          isLimitReached: true
        });
      }
    }

    // 4. Per-User Usage Limit Check (maxUsesPerUser)
    const maxPerUser = found.maxUsesPerUser !== undefined && found.maxUsesPerUser !== null
      ? found.maxUsesPerUser
      : 1;

    if ((userEmail || userPhone) && userRedemptions >= maxPerUser) {
      const gst = Math.round(Number(baseAmount || 0) * 0.18);
      return res.json({
        isValid: false,
        coupon: found,
        message: `You have already redeemed coupon "${found.code}" on this account (Limit: ${maxPerUser} redemption per member).`,
        originalBase: Number(baseAmount || 0),
        discountAmount: 0,
        discountedBase: Number(baseAmount || 0),
        gstAmount: gst,
        finalPayable: Number(baseAmount || 0) + gst,
        isComplimentary: false,
        totalRedemptions,
        userRedemptions,
        isLimitReached: true
      });
    }

    const numBase = Number(baseAmount || 0);
    let discount = 0;
    if (found.discountType === 'percentage') {
      discount = found.discountValue >= 100 ? numBase : Math.round((numBase * found.discountValue) / 100);
    } else {
      discount = Math.min(numBase, found.discountValue);
    }

    const discountedBase = Math.max(0, numBase - discount);
    const gstAmount = discountedBase === 0 ? 0 : Math.round(discountedBase * 0.18);
    const finalPayable = discountedBase + gstAmount;
    const isComplimentary = finalPayable === 0;

    const remainingGlobal = found.maxTotalUses ? Math.max(0, found.maxTotalUses - totalRedemptions) : null;
    const quotaNote = remainingGlobal !== null && remainingGlobal <= 5 
      ? ` (${remainingGlobal} redemption${remainingGlobal === 1 ? '' : 's'} remaining)` 
      : '';

    return res.json({
      isValid: true,
      coupon: {
        ...found,
        totalRedemptions,
        userRedemptions
      },
      message: isComplimentary
        ? `Coupon "${found.code}" applied! 100% Complimentary Waiver (Payable: ₹0). Profile will activate directly.${quotaNote}`
        : `Coupon "${found.code}" applied! Saved ₹${discount.toLocaleString('en-IN')}. Payable: ₹${finalPayable.toLocaleString('en-IN')}.${quotaNote}`,
      originalBase: numBase,
      discountAmount: discount,
      discountedBase,
      gstAmount,
      finalPayable,
      isComplimentary,
      totalRedemptions,
      userRedemptions
    });
  } catch (err: any) {
    console.error('[API] Error validating coupon:', err);
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/coupons/redeem', async (req: Request, res: Response) => {
  try {
    const redemption = req.body;
    const cleanCode = (redemption.couponCode || '').trim().toUpperCase();

    // Verify limit on server before saving
    let foundCoupon: any = null;
    let totalRedemptions = 0;
    let userRedemptions = 0;

    if (isDatabaseConfigured() && sqlClient) {
      const cRows = await sqlClient`
        SELECT 
          discount_type as "discountType", discount_value as "discountValue",
          max_total_uses as "maxTotalUses", max_uses_per_user as "maxUsesPerUser"
        FROM coupons WHERE UPPER(code) = ${cleanCode};
      `;
      if (cRows && cRows.length > 0) {
        foundCoupon = cRows[0];
        const countRows = await sqlClient`
          SELECT COUNT(*)::int as count FROM coupon_redemptions WHERE UPPER(coupon_code) = ${cleanCode};
        `;
        totalRedemptions = countRows[0]?.count || 0;

        if (redemption.userEmail) {
          const normEmail = redemption.userEmail.trim().toLowerCase();
          const uRows = await sqlClient`
            SELECT COUNT(*)::int as count FROM coupon_redemptions
            WHERE UPPER(coupon_code) = ${cleanCode} AND LOWER(user_email) = ${normEmail};
          `;
          userRedemptions = uRows[0]?.count || 0;
        }
      }
    } else {
      foundCoupon = memoryCoupons.find(c => c.code.toUpperCase() === cleanCode);
      if (foundCoupon) {
        totalRedemptions = memoryRedemptions.filter(r => r.couponCode.toUpperCase() === cleanCode).length;
        if (redemption.userEmail) {
          const normEmail = redemption.userEmail.trim().toLowerCase();
          userRedemptions = memoryRedemptions.filter(r => r.couponCode.toUpperCase() === cleanCode && (r.userEmail || '').trim().toLowerCase() === normEmail).length;
        }
      }
    }

    if (foundCoupon) {
      if (foundCoupon.maxTotalUses != null && foundCoupon.maxTotalUses > 0 && totalRedemptions >= foundCoupon.maxTotalUses) {
        return res.status(400).json({ error: `Coupon ${cleanCode} has reached its maximum global usage limit.` });
      }
      const maxPerUser = foundCoupon.maxUsesPerUser ?? 1;
      if (redemption.userEmail && userRedemptions >= maxPerUser) {
        return res.status(400).json({ error: `Coupon ${cleanCode} has already been redeemed on this account.` });
      }
    }

    const id = redemption.id || `RDM_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const discType = redemption.discountType || foundCoupon?.discountType || 'percentage';
    const discVal = Number(redemption.discountValue !== undefined ? redemption.discountValue : (foundCoupon?.discountValue ?? 100));
    const origAmt = Number(redemption.originalAmount || 0);
    const discAmt = redemption.discountAmount !== undefined ? Number(redemption.discountAmount) : (discType === 'percentage' ? Math.round((origAmt * discVal) / 100) : Math.min(origAmt, discVal));
    const finalPay = redemption.finalPayable !== undefined ? Number(redemption.finalPayable) : Math.max(0, origAmt - discAmt);
    const isCompl = redemption.isComplimentary !== undefined ? Boolean(redemption.isComplimentary) : finalPay === 0;

    const cleanRedemption = {
      ...redemption,
      id,
      discountType: discType,
      discountValue: discVal,
      originalAmount: origAmt,
      discountAmount: discAmt,
      finalPayable: finalPay,
      isComplimentary: isCompl,
      transactionId: redemption.transactionId || `TXN_${Date.now()}`,
      redeemedAt: redemption.redeemedAt || new Date().toISOString()
    };

    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`
        INSERT INTO coupon_redemptions (
          id, coupon_code, discount_type, discount_value,
          original_amount, discount_amount, final_payable,
          is_complimentary, user_role, user_name, user_email,
          user_phone, company_name, plan_id, plan_title,
          transaction_id, redeemed_at
        ) VALUES (
          ${cleanRedemption.id}, ${cleanRedemption.couponCode}, ${cleanRedemption.discountType},
          ${cleanRedemption.discountValue}, ${cleanRedemption.originalAmount},
          ${cleanRedemption.discountAmount}, ${cleanRedemption.finalPayable},
          ${cleanRedemption.isComplimentary}, ${cleanRedemption.userRole || 'vendor'},
          ${cleanRedemption.userName || 'Member'}, ${cleanRedemption.userEmail || ''},
          ${cleanRedemption.userPhone || null}, ${cleanRedemption.companyName || null},
          ${cleanRedemption.planId || 'membership'}, ${cleanRedemption.planTitle || 'Annual Plan'},
          ${cleanRedemption.transactionId}, ${cleanRedemption.redeemedAt}
        );
      `;
    }

    memoryRedemptions.unshift(cleanRedemption);
    return res.json({ success: true, redemption: cleanRedemption });
  } catch (err: any) {
    console.error('[API] Error recording coupon redemption:', err);
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/coupons', async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, description, applicableRoles, validUntil, maxTotalUses, maxUsesPerUser } = req.body;
    if (!code) return res.status(400).json({ error: 'code is required' });
    const cleanCode = code.trim().toUpperCase();
    const cleanCoupon = {
      code: cleanCode,
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue) || 100,
      description: description || 'Promotional Discount Code',
      applicableRoles: applicableRoles || ['vendor', 'advisor', 'owner'],
      validUntil: validUntil || null,
      maxTotalUses: maxTotalUses !== undefined && maxTotalUses !== null && maxTotalUses !== '' ? Number(maxTotalUses) : null,
      maxUsesPerUser: maxUsesPerUser ? Number(maxUsesPerUser) : 1
    };

    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`
        INSERT INTO coupons (
          code, discount_type, discount_value, description, applicable_roles, valid_until, max_total_uses, max_uses_per_user
        ) VALUES (
          ${cleanCoupon.code}, ${cleanCoupon.discountType}, ${cleanCoupon.discountValue},
          ${cleanCoupon.description}, ${JSON.stringify(cleanCoupon.applicableRoles || [])},
          ${cleanCoupon.validUntil}, ${cleanCoupon.maxTotalUses}, ${cleanCoupon.maxUsesPerUser}
        )
        ON CONFLICT (code) DO UPDATE SET
          discount_type = EXCLUDED.discount_type,
          discount_value = EXCLUDED.discount_value,
          description = EXCLUDED.description,
          applicable_roles = EXCLUDED.applicable_roles,
          valid_until = EXCLUDED.valid_until,
          max_total_uses = EXCLUDED.max_total_uses,
          max_uses_per_user = EXCLUDED.max_uses_per_user;
      `;
    }

    const idx = memoryCoupons.findIndex(c => c.code.toUpperCase() === cleanCode);
    if (idx >= 0) {
      memoryCoupons[idx] = cleanCoupon;
    } else {
      memoryCoupons.unshift(cleanCoupon);
    }

    return res.json({ success: true, coupon: cleanCoupon });
  } catch (err: any) {
    console.error('[API] Error creating coupon:', err);
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/coupons/:code', async (req: Request, res: Response) => {
  try {
    const cleanCode = req.params.code.trim().toUpperCase();
    const { maxTotalUses, maxUsesPerUser, description, validUntil, discountValue } = req.body;

    const parsedMaxTotal = maxTotalUses !== undefined && maxTotalUses !== '' 
      ? (maxTotalUses === null ? null : Number(maxTotalUses)) 
      : null;
    const parsedMaxPerUser = maxUsesPerUser ? Number(maxUsesPerUser) : 1;

    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`
        UPDATE coupons
        SET
          max_total_uses = ${parsedMaxTotal},
          max_uses_per_user = ${parsedMaxPerUser},
          description = COALESCE(${description || null}, description),
          valid_until = COALESCE(${validUntil || null}, valid_until)
        WHERE UPPER(code) = ${cleanCode};
      `;
    }

    const idx = memoryCoupons.findIndex(c => c.code.toUpperCase() === cleanCode);
    if (idx >= 0) {
      memoryCoupons[idx] = {
        ...memoryCoupons[idx],
        maxTotalUses: parsedMaxTotal,
        maxUsesPerUser: parsedMaxPerUser,
        ...(description ? { description } : {})
      };
    }

    return res.json({ success: true, code: cleanCode, maxTotalUses: parsedMaxTotal, maxUsesPerUser: parsedMaxPerUser });
  } catch (err: any) {
    console.error('[API] Error updating coupon:', err);
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/coupons/:code', async (req: Request, res: Response) => {
  try {
    const cleanCode = req.params.code.trim().toUpperCase();
    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`DELETE FROM coupons WHERE UPPER(code) = ${cleanCode};`;
    }
    memoryCoupons = memoryCoupons.filter(c => c.code.toUpperCase() !== cleanCode);
    return res.json({ success: true, code: cleanCode });
  } catch (err: any) {
    console.error('[API] Error deleting coupon:', err);
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/coupons/redemptions', async (_req: Request, res: Response) => {
  try {
    if (isDatabaseConfigured() && sqlClient) {
      const rows = await sqlClient`
        SELECT 
          id, coupon_code as "couponCode", discount_type as "discountType",
          discount_value as "discountValue", original_amount as "originalAmount",
          discount_amount as "discountAmount", final_payable as "finalPayable",
          is_complimentary as "isComplimentary", user_role as "userRole",
          user_name as "userName", user_email as "userEmail",
          user_phone as "userPhone", company_name as "companyName",
          plan_id as "planId", plan_title as "planTitle",
          transaction_id as "transactionId", redeemed_at as "redeemedAt"
        FROM coupon_redemptions
        ORDER BY redeemed_at DESC;
      `;
      return res.json(rows);
    }
    return res.json(memoryRedemptions);
  } catch (err) {
    console.error('[API] Error fetching coupon redemptions:', err);
    return res.json(memoryRedemptions);
  }
});

// ==========================================
// 8. AUTHENTICATION & EMAIL OTP VERIFICATION
// ==========================================

apiRouter.post('/auth/register-request', async (req: Request, res: Response) => {
  try {
    const { name, email, role = 'owner', phone, company, enrolledAccreditationId } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || '').trim() || (role === 'owner' ? 'Hospital Promoter' : 'Healthcare Partner');

    // Generate 6-digit cryptographic-style numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry
    const otpId = `OTP_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 1. Store in database or memory
    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`
        INSERT INTO verification_otps (id, email, otp, expires_at, verified, created_at)
        VALUES (${otpId}, ${cleanEmail}, ${otp}, ${expiresAt}, false, ${new Date().toISOString()});
      `;
    }
    memoryOtps = [
      { id: otpId, email: cleanEmail, otp, expiresAt, verified: false, createdAt: new Date().toISOString() },
      ...memoryOtps.filter(o => o.email !== cleanEmail)
    ];

    // 2. Build email template
    const subject = `[NOVA] ${otp} is your verification code`;
    const bodyText = `Hello ${cleanName},\n\nYour 6-digit verification code is: ${otp}\n\nThis code will expire in 10 minutes. Enter it to activate your NOVA healthcare account.`;
    const bodyHtml = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:540px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
        <div style="background:#0f172a;padding:24px 32px;text-align:left;">
          <h1 style="color:#fff;font-size:20px;font-weight:800;margin:0;">NOVA Healthcare Platform</h1>
          <p style="color:#94a3b8;font-size:12px;margin:4px 0 0 0;">Network for Owners, Vendors & Advisors</p>
        </div>
        <div style="padding:32px;">
          <h2 style="font-size:16px;font-weight:700;color:#0f172a;margin-top:0;">Verify your email address</h2>
          <p style="font-size:13px;line-height:1.6;color:#475569;">Welcome to NOVA, <strong>${cleanName}</strong>. Please enter the 6-digit verification code below to confirm your email and access your workspace.</p>
          <div style="text-align:center;background:#f1f5f9;border:1px dashed #cbd5e1;border-radius:12px;padding:20px;margin:24px 0;">
            <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">6-Digit Verification Code</div>
            <div style="font-family:monospace;font-size:32px;font-weight:800;letter-spacing:0.25em;color:#2563eb;">${otp}</div>
          </div>
          <p style="font-size:12px;color:#64748b;">This security code expires in 10 minutes. If you did not request this, please disregard.</p>
        </div>
        <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;">
          NOVA Healthcare Infrastructure Network · Mumbai · Bangalore · New Delhi
        </div>
      </div>
    `.trim();

    // 3. Store email log
    const emailLogId = `EML_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newEmailLog: EmailLog = {
      id: emailLogId,
      toEmail: cleanEmail,
      recipientName: cleanName,
      subject,
      type: 'verification_otp',
      bodyHtml,
      bodyText,
      otpCode: otp,
      sentAt: new Date().toISOString()
    };

    if (isDatabaseConfigured() && sqlClient) {
      try {
        await sqlClient`
          INSERT INTO email_logs (id, to_email, recipient_name, subject, type, body_html, body_text, otp_code, sent_at)
          VALUES (${emailLogId}, ${cleanEmail}, ${cleanName}, ${subject}, 'verification_otp', ${bodyHtml}, ${bodyText}, ${otp}, ${newEmailLog.sentAt});
        `;
      } catch (logErr) {
        console.warn('[API] Could not persist email log to database:', logErr);
      }
    }
    memoryEmailLogs = [newEmailLog, ...memoryEmailLogs].slice(0, 50);

    // 4. Send via SMTP if configured
    sendSmtpEmail(cleanEmail, subject, bodyHtml, bodyText).catch(() => {});

    console.log(`[AUTH] Generated 6-digit OTP for ${cleanEmail}: [${otp}]`);

    return res.json({
      success: true,
      email: cleanEmail,
      otp, // Provided for instant in-app test verification
      expiresAt,
      message: `A 6-digit verification code was sent to ${cleanEmail}.`
    });
  } catch (err: any) {
    console.error('[API] Error generating registration OTP:', err);
    return res.status(500).json({ error: err.message || 'Failed to dispatch verification code.' });
  }
});

apiRouter.post('/auth/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp, name, role = 'owner', phone, company, enrolledAccreditationId } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // Verify OTP against database or memory
    let isValid = false;

    if (isDatabaseConfigured() && sqlClient) {
      const rows = await sqlClient`
        SELECT id, expires_at as "expiresAt", verified
        FROM verification_otps
        WHERE LOWER(email) = ${cleanEmail} AND otp = ${cleanOtp}
        ORDER BY created_at DESC
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        const record = rows[0];
        const isExpired = new Date(record.expiresAt).getTime() < Date.now();
        if (!isExpired) {
          isValid = true;
          await sqlClient`UPDATE verification_otps SET verified = true WHERE id = ${record.id};`;
        }
      }
    }

    // Memory check fallback
    if (!isValid) {
      const memRecord = memoryOtps.find(o => o.email === cleanEmail && o.otp === cleanOtp);
      if (memRecord) {
        const isExpired = new Date(memRecord.expiresAt).getTime() < Date.now();
        if (!isExpired) {
          isValid = true;
          memRecord.verified = true;
        }
      }
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code. Please check your inbox or click "Resend Code".'
      });
    }

    // User is verified! Create or update user account
    const cleanName = (name || '').trim() || (role === 'owner' ? 'Dr. Rajesh / Promoter' : 'Healthcare Partner');
    const cleanCompany = (company || '').trim() || (role === 'owner' ? 'Multispecialty Hospital Project' : 'Apex Healthcare Solutions');
    const cleanPhone = (phone || '').trim() || '+91 98765 43210';
    const plan = role === 'admin' ? 'Administrator Master Access' : `${role.charAt(0).toUpperCase() + role.slice(1)} Starter Plan`;

    const user: AuthUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      email: cleanEmail,
      role,
      company: cleanCompany,
      phone: cleanPhone,
      isSubscribed: true,
      status: 'active',
      plan,
      enrolledAccreditationId: enrolledAccreditationId || undefined,
      enrolledAccreditationDate: enrolledAccreditationId ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString()
    };

    if (isDatabaseConfigured() && sqlClient) {
      try {
        await sqlClient`
          INSERT INTO users (
            id, name, role, email, phone, company, is_subscribed, plan, status, email_verified,
            enrolled_accreditation_id, enrolled_accreditation_date, created_at, last_login_at
          ) VALUES (
            ${user.id}, ${user.name}, ${user.role}, ${user.email}, ${user.phone}, ${user.company},
            true, ${user.plan}, 'active', true,
            ${user.enrolledAccreditationId || null}, ${user.enrolledAccreditationDate || null},
            NOW(), NOW()
          )
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            phone = COALESCE(EXCLUDED.phone, users.phone),
            company = COALESCE(EXCLUDED.company, users.company),
            email_verified = true,
            status = 'active',
            last_login_at = NOW();
        `;
      } catch (dbErr) {
        console.warn('[API] Could not save verified user to database:', dbErr);
      }
    }

    // Update memory
    const existingIdx = memoryUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);
    if (existingIdx >= 0) {
      memoryUsers[existingIdx] = { ...memoryUsers[existingIdx], ...user };
    } else {
      memoryUsers.push(user);
    }

    return res.json({
      success: true,
      user,
      message: 'Email verified successfully! Workspace access granted.'
    });
  } catch (err: any) {
    console.error('[API] Error in OTP verification:', err);
    return res.status(500).json({ error: err.message || 'Verification failed.' });
  }
});

// ==========================================
// 9. PROFILE OWNERSHIP CLAIMS
// ==========================================

apiRouter.get('/claims', async (_req: Request, res: Response) => {
  try {
    if (isDatabaseConfigured() && sqlClient) {
      const rows = await sqlClient`
        SELECT 
          id, directory_id as "directoryId", directory_name as "directoryName",
          directory_role as "directoryRole", claimant_user_id as "claimantUserId",
          claimant_name as "claimantName", claimant_email as "claimantEmail",
          claimant_phone as "claimantPhone", claimant_company as "claimantCompany",
          designation, proof_notes as "proofNotes", status,
          created_at as "createdAt", reviewed_at as "reviewedAt",
          reviewer_notes as "reviewerNotes"
        FROM profile_claims
        ORDER BY created_at DESC;
      `;
      return res.json(rows);
    }
    return res.json(memoryClaims);
  } catch (err: any) {
    console.error('[API] Error fetching claims:', err);
    return res.json(memoryClaims);
  }
});

apiRouter.post('/claims', async (req: Request, res: Response) => {
  try {
    const claim = req.body as ProfileClaim;
    if (!claim.directoryId || !claim.claimantEmail || !claim.claimantName) {
      return res.status(400).json({ error: 'Missing mandatory claim fields.' });
    }

    const cleanClaim: ProfileClaim = {
      ...claim,
      id: claim.id || `CLM_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      status: 'pending',
      createdAt: claim.createdAt || new Date().toISOString()
    };

    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`
        INSERT INTO profile_claims (
          id, directory_id, directory_name, directory_role, claimant_user_id,
          claimant_name, claimant_email, claimant_phone, claimant_company,
          designation, proof_notes, status, created_at
        ) VALUES (
          ${cleanClaim.id}, ${cleanClaim.directoryId}, ${cleanClaim.directoryName},
          ${cleanClaim.directoryRole}, ${cleanClaim.claimantUserId}, ${cleanClaim.claimantName},
          ${cleanClaim.claimantEmail}, ${cleanClaim.claimantPhone}, ${cleanClaim.claimantCompany || null},
          ${cleanClaim.designation || null}, ${cleanClaim.proofNotes}, 'pending', ${cleanClaim.createdAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          proof_notes = EXCLUDED.proof_notes,
          status = 'pending';
      `;

      // Update directory item claim status
      await sqlClient`
        UPDATE directory_items 
        SET claim_status = 'pending' 
        WHERE id = ${cleanClaim.directoryId};
      `;
    }

    // Update memory
    memoryClaims = [cleanClaim, ...memoryClaims.filter(c => c.id !== cleanClaim.id)];
    const dirIdx = memoryDirectory.findIndex(d => d.id === cleanClaim.directoryId);
    if (dirIdx >= 0) {
      memoryDirectory[dirIdx].claimStatus = 'pending';
    }

    return res.json({ success: true, claim: cleanClaim });
  } catch (err: any) {
    console.error('[API] Error submitting profile claim:', err);
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/claims/:id/approve', async (req: Request, res: Response) => {
  try {
    const claimId = req.params.id;
    const { reviewerNotes } = req.body;
    const notes = reviewerNotes || 'Approved by administrator upon verification of business credentials.';
    const reviewedAt = new Date().toISOString();

    let targetClaim: ProfileClaim | undefined;

    if (isDatabaseConfigured() && sqlClient) {
      const rows = await sqlClient`
        SELECT 
          id, directory_id as "directoryId", directory_name as "directoryName",
          directory_role as "directoryRole", claimant_user_id as "claimantUserId",
          claimant_name as "claimantName", claimant_email as "claimantEmail",
          claimant_phone as "claimantPhone"
        FROM profile_claims
        WHERE id = ${claimId};
      `;
      if (rows.length > 0) {
        targetClaim = rows[0] as ProfileClaim;
      }

      await sqlClient`
        UPDATE profile_claims
        SET status = 'approved', reviewed_at = ${reviewedAt}, reviewer_notes = ${notes}
        WHERE id = ${claimId};
      `;

      if (targetClaim) {
        // Link directory item to claimant user
        await sqlClient`
          UPDATE directory_items
          SET 
            is_claimed = true,
            claimed_by_user_id = ${targetClaim.claimantUserId},
            claim_status = 'claimed',
            contact_email = ${targetClaim.claimantEmail},
            verified = true
          WHERE id = ${targetClaim.directoryId};
        `;

        // Update user's claimed_directory_id
        await sqlClient`
          UPDATE users
          SET claimed_directory_id = ${targetClaim.directoryId}
          WHERE id = ${targetClaim.claimantUserId} OR LOWER(email) = ${targetClaim.claimantEmail.toLowerCase()};
        `;
      }
    }

    // Memory sync
    const memIdx = memoryClaims.findIndex(c => c.id === claimId);
    if (memIdx >= 0) {
      memoryClaims[memIdx] = {
        ...memoryClaims[memIdx],
        status: 'approved',
        reviewedAt,
        reviewerNotes: notes
      };
      targetClaim = memoryClaims[memIdx];

      const dirIdx = memoryDirectory.findIndex(d => d.id === targetClaim!.directoryId);
      if (dirIdx >= 0) {
        memoryDirectory[dirIdx].isClaimed = true;
        memoryDirectory[dirIdx].claimedByUserId = targetClaim!.claimantUserId;
        memoryDirectory[dirIdx].claimStatus = 'claimed';
        memoryDirectory[dirIdx].contactEmail = targetClaim!.claimantEmail;
        memoryDirectory[dirIdx].verified = true;
      }
    }

    return res.json({ success: true, claimId, status: 'approved' });
  } catch (err: any) {
    console.error('[API] Error approving claim:', err);
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/claims/:id/reject', async (req: Request, res: Response) => {
  try {
    const claimId = req.params.id;
    const { reviewerNotes } = req.body;
    const notes = reviewerNotes || 'Unable to substantiate official authorization for this organization.';
    const reviewedAt = new Date().toISOString();

    let targetClaim: ProfileClaim | undefined;

    if (isDatabaseConfigured() && sqlClient) {
      const rows = await sqlClient`
        SELECT directory_id as "directoryId" FROM profile_claims WHERE id = ${claimId};
      `;
      if (rows.length > 0) {
        targetClaim = rows[0] as ProfileClaim;
      }

      await sqlClient`
        UPDATE profile_claims
        SET status = 'rejected', reviewed_at = ${reviewedAt}, reviewer_notes = ${notes}
        WHERE id = ${claimId};
      `;

      if (targetClaim) {
        // Release directory listing back to unclaimed
        await sqlClient`
          UPDATE directory_items
          SET 
            is_claimed = false,
            claimed_by_user_id = null,
            claim_status = 'unclaimed'
          WHERE id = ${targetClaim.directoryId};
        `;
      }
    }

    // Memory sync
    const memIdx = memoryClaims.findIndex(c => c.id === claimId);
    if (memIdx >= 0) {
      memoryClaims[memIdx] = {
        ...memoryClaims[memIdx],
        status: 'rejected',
        reviewedAt,
        reviewerNotes: notes
      };
      targetClaim = memoryClaims[memIdx];

      const dirIdx = memoryDirectory.findIndex(d => d.id === targetClaim!.directoryId);
      if (dirIdx >= 0) {
        memoryDirectory[dirIdx].isClaimed = false;
        memoryDirectory[dirIdx].claimedByUserId = undefined;
        memoryDirectory[dirIdx].claimStatus = 'unclaimed';
      }
    }

    return res.json({ success: true, claimId, status: 'rejected' });
  } catch (err: any) {
    console.error('[API] Error rejecting claim:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. IN-APP MAILBOX & EMAIL LOGS
// ==========================================

apiRouter.get('/mail/inbox', async (_req: Request, res: Response) => {
  try {
    if (isDatabaseConfigured() && sqlClient) {
      const rows = await sqlClient`
        SELECT 
          id, to_email as "toEmail", recipient_name as "recipientName",
          subject, type, body_html as "bodyHtml", body_text as "bodyText",
          otp_code as "otpCode", sent_at as "sentAt"
        FROM email_logs
        ORDER BY sent_at DESC
        LIMIT 50;
      `;
      return res.json(rows);
    }
    return res.json(memoryEmailLogs);
  } catch (err) {
    console.error('[API] Error fetching mail inbox:', err);
    return res.json(memoryEmailLogs);
  }
});

apiRouter.post('/mail/send', async (req: Request, res: Response) => {
  try {
    const log = req.body as EmailLog;
    if (!log.toEmail || !log.subject) {
      return res.status(400).json({ error: 'toEmail and subject are required.' });
    }

    const cleanLog: EmailLog = {
      ...log,
      id: log.id || `EML_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      sentAt: log.sentAt || new Date().toISOString()
    };

    if (isDatabaseConfigured() && sqlClient) {
      await sqlClient`
        INSERT INTO email_logs (id, to_email, recipient_name, subject, type, body_html, body_text, otp_code, sent_at)
        VALUES (
          ${cleanLog.id}, ${cleanLog.toEmail.toLowerCase().trim()}, ${cleanLog.recipientName || null},
          ${cleanLog.subject}, ${cleanLog.type}, ${cleanLog.bodyHtml}, ${cleanLog.bodyText || null},
          ${cleanLog.otpCode || null}, ${cleanLog.sentAt}
        );
      `;
    }

    memoryEmailLogs = [cleanLog, ...memoryEmailLogs].slice(0, 50);

    // If SMTP is configured, trigger real mail dispatch
    sendSmtpEmail(cleanLog.toEmail, cleanLog.subject, cleanLog.bodyHtml, cleanLog.bodyText).catch(() => {});

    return res.json({ success: true, log: cleanLog });
  } catch (err: any) {
    console.error('[API] Error dispatching mail:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// RFP, QUOTATIONS & CLARIFICATIONS POSTGRESQL REST CRUD API
// ============================================================================

function ensureDatabase(res: Response): boolean {
  if (!isDatabaseConfigured() || !sqlClient) {
    res.status(503).json({
      error: 'PostgreSQL database is currently disconnected. Strict mode blocks unsaved modifications.',
      code: 'DB_DISCONNECTED',
      database: {
        configured: false,
        provider: 'Neon Serverless PostgreSQL'
      }
    });
    return false;
  }
  return true;
}

function mapDbRowToRfp(row: any): RFPItem {
  return {
    id: row.id,
    rfpNumber: row.rfp_number,
    title: row.title,
    category: row.category,
    hospitalName: row.hospital_name,
    maskedHospitalTitle: row.masked_hospital_title || `${row.bed_capacity || 'Hospital'} - ${row.location_city || 'India'}`,
    isIdentityMasked: Boolean(row.is_identity_masked),
    locationCity: row.location_city || '',
    locationState: row.location_state || '',
    bedCapacity: row.bed_capacity || '',
    summary: row.summary || '',
    scopeOfWork: Array.isArray(row.scope_of_work) ? row.scope_of_work : [],
    estimatedBudgetRange: row.estimated_budget_range || '',
    currency: row.currency || 'INR',
    status: row.status,
    publishingModes: Array.isArray(row.publishing_modes) ? row.publishing_modes : ['marketplace'],
    identityDisclosure: row.identity_disclosure || 'on_shortlist',
    publicationDate: row.publication_date || '',
    questionDeadline: row.question_deadline || '',
    quoteClosingDate: row.quote_closing_date || '',
    revisedClosingDate: row.revised_closing_date,
    expectedDecisionDate: row.expected_decision_date || '',
    targetInstallationDate: row.target_installation_date || '',
    invitedVendorIds: Array.isArray(row.invited_vendor_ids) ? row.invited_vendor_ids : [],
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    assignedAdvisor: row.assigned_advisor || undefined,
    createdBy: row.created_by || 'Hospital Administrator',
    hospitalOwnerEmail: row.hospital_owner_email || 'procurement@hospital.org',
    hospitalOwnerPhone: row.hospital_owner_phone,
    awardDetails: row.award_details || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
  };
}

function mapDbRowToQuote(row: any): RFPQuote {
  return {
    id: row.id,
    rfpId: row.rfp_id,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    vendorCompany: row.vendor_company || row.vendor_name,
    contactEmail: row.contact_email || '',
    contactPhone: row.contact_phone,
    isExternal: Boolean(row.is_external),
    externalSource: row.external_source,
    officialDocumentName: row.official_document_name,
    submissionDate: row.submission_date || '',
    quoteValidityDate: row.quote_validity_date || '',
    version: row.version || 1,
    status: row.status || 'submitted',
    commercials: row.commercials || {},
    technicalSpecs: Array.isArray(row.technical_specs) ? row.technical_specs : [],
    deviationsAndExclusions: Array.isArray(row.deviations_and_exclusions) ? row.deviations_and_exclusions : [],
    statutoryCertifications: Array.isArray(row.statutory_certifications) ? row.statutory_certifications : [],
    aiExtraction: row.ai_extraction || undefined
  };
}

// ----------------------------------------------------------------------------
// 1. RFP ENDPOINTS
// ----------------------------------------------------------------------------

// GET /api/rfps - List RFPs
apiRouter.get('/rfps', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;

    const { search, category, status } = req.query;

    let query = sqlClient!`
      SELECT * FROM rfps
      ORDER BY created_at DESC;
    `;

    const rows = await query;
    let items = (rows || []).map(mapDbRowToRfp);

    if (category && category !== 'all') {
      items = items.filter(r => r.category.toLowerCase() === String(category).toLowerCase());
    }
    if (status && status !== 'all') {
      items = items.filter(r => r.status === String(status));
    }
    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.rfpNumber.toLowerCase().includes(q) ||
        r.hospitalName.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (err: any) {
    console.error('[API] Error fetching RFPs:', err);
    return res.status(500).json({ error: err.message || 'Failed to query RFPs' });
  }
});

// GET /api/rfps/:id - Get single RFP
apiRouter.get('/rfps/:id', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;
    const { id } = req.params;

    const rows = await sqlClient!`
      SELECT * FROM rfps WHERE id = ${id} LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: `RFP with id ${id} not found.` });
    }

    return res.json({
      success: true,
      data: mapDbRowToRfp(rows[0])
    });
  } catch (err: any) {
    console.error('[API] Error retrieving RFP:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/rfps - Create new RFP
apiRouter.post('/rfps', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;
    const rfp = req.body as RFPItem;

    if (!rfp.title || !rfp.category || !rfp.hospitalName) {
      return res.status(400).json({ error: 'Title, category, and hospitalName are required.' });
    }

    const id = rfp.id || `rfp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const rfpNumber = rfp.rfpNumber || `NOVA-RFP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    await sqlClient!`
      INSERT INTO rfps (
        id, rfp_number, title, category, hospital_name, masked_hospital_title,
        is_identity_masked, location_city, location_state, bed_capacity, summary,
        scope_of_work, estimated_budget_range, currency, status, publishing_modes,
        identity_disclosure, publication_date, question_deadline, quote_closing_date,
        revised_closing_date, expected_decision_date, target_installation_date,
        invited_vendor_ids, requirements, attachments, assigned_advisor, created_by,
        hospital_owner_email, hospital_owner_phone, award_details, created_at, updated_at
      ) VALUES (
        ${id}, ${rfpNumber}, ${rfp.title}, ${rfp.category}, ${rfp.hospitalName},
        ${rfp.maskedHospitalTitle || null}, ${rfp.isIdentityMasked ?? false},
        ${rfp.locationCity || ''}, ${rfp.locationState || ''}, ${rfp.bedCapacity || ''},
        ${rfp.summary || ''}, ${JSON.stringify(rfp.scopeOfWork || [])},
        ${rfp.estimatedBudgetRange || ''}, ${rfp.currency || 'INR'},
        ${rfp.status || 'draft'}, ${JSON.stringify(rfp.publishingModes || ['marketplace'])},
        ${rfp.identityDisclosure || 'on_shortlist'}, ${rfp.publicationDate || nowIso},
        ${rfp.questionDeadline || ''}, ${rfp.quoteClosingDate || ''},
        ${rfp.revisedClosingDate || null}, ${rfp.expectedDecisionDate || ''},
        ${rfp.targetInstallationDate || ''}, ${JSON.stringify(rfp.invitedVendorIds || [])},
        ${JSON.stringify(rfp.requirements || [])}, ${JSON.stringify(rfp.attachments || [])},
        ${rfp.assignedAdvisor ? JSON.stringify(rfp.assignedAdvisor) : null},
        ${rfp.createdBy || 'Hospital Administrator'}, ${rfp.hospitalOwnerEmail || 'procurement@hospital.org'},
        ${rfp.hospitalOwnerPhone || null}, ${rfp.awardDetails ? JSON.stringify(rfp.awardDetails) : null},
        ${nowIso}, ${nowIso}
      );
    `;

    // Log initial audit event
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await sqlClient!`
      INSERT INTO rfp_audit_events (id, rfp_id, action, performed_by, user_role, details, created_at)
      VALUES (
        ${auditId}, ${id}, 'RFP Created & Initialized',
        ${rfp.createdBy || 'Hospital Owner'}, 'owner',
        ${JSON.stringify({ rfpNumber, title: rfp.title, status: rfp.status || 'draft' })},
        ${nowIso}
      );
    `;

    const savedRows = await sqlClient!`SELECT * FROM rfps WHERE id = ${id} LIMIT 1;`;
    return res.status(201).json({
      success: true,
      data: mapDbRowToRfp(savedRows[0]),
      message: 'RFP successfully registered in PostgreSQL database.'
    });
  } catch (err: any) {
    console.error('[API] Error creating RFP:', err);
    return res.status(500).json({ error: err.message || 'Failed to create RFP in database' });
  }
});

// PUT /api/rfps/:id - Update full RFP
apiRouter.put('/rfps/:id', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;
    const { id } = req.params;
    const rfp = req.body as Partial<RFPItem>;
    const nowIso = new Date().toISOString();

    await sqlClient!`
      UPDATE rfps SET
        title = COALESCE(${rfp.title || null}, title),
        category = COALESCE(${rfp.category || null}, category),
        hospital_name = COALESCE(${rfp.hospitalName || null}, hospital_name),
        masked_hospital_title = COALESCE(${rfp.maskedHospitalTitle || null}, masked_hospital_title),
        is_identity_masked = COALESCE(${rfp.isIdentityMasked !== undefined ? rfp.isIdentityMasked : null}, is_identity_masked),
        location_city = COALESCE(${rfp.locationCity || null}, location_city),
        location_state = COALESCE(${rfp.locationState || null}, location_state),
        bed_capacity = COALESCE(${rfp.bedCapacity || null}, bed_capacity),
        summary = COALESCE(${rfp.summary || null}, summary),
        scope_of_work = COALESCE(${rfp.scopeOfWork ? JSON.stringify(rfp.scopeOfWork) : null}, scope_of_work),
        estimated_budget_range = COALESCE(${rfp.estimatedBudgetRange || null}, estimated_budget_range),
        currency = COALESCE(${rfp.currency || null}, currency),
        status = COALESCE(${rfp.status || null}, status),
        publishing_modes = COALESCE(${rfp.publishingModes ? JSON.stringify(rfp.publishingModes) : null}, publishing_modes),
        identity_disclosure = COALESCE(${rfp.identityDisclosure || null}, identity_disclosure),
        question_deadline = COALESCE(${rfp.questionDeadline || null}, question_deadline),
        quote_closing_date = COALESCE(${rfp.quoteClosingDate || null}, quote_closing_date),
        revised_closing_date = COALESCE(${rfp.revisedClosingDate || null}, revised_closing_date),
        expected_decision_date = COALESCE(${rfp.expectedDecisionDate || null}, expected_decision_date),
        target_installation_date = COALESCE(${rfp.targetInstallationDate || null}, target_installation_date),
        invited_vendor_ids = COALESCE(${rfp.invitedVendorIds ? JSON.stringify(rfp.invitedVendorIds) : null}, invited_vendor_ids),
        requirements = COALESCE(${rfp.requirements ? JSON.stringify(rfp.requirements) : null}, requirements),
        attachments = COALESCE(${rfp.attachments ? JSON.stringify(rfp.attachments) : null}, attachments),
        assigned_advisor = COALESCE(${rfp.assignedAdvisor ? JSON.stringify(rfp.assignedAdvisor) : null}, assigned_advisor),
        award_details = COALESCE(${rfp.awardDetails ? JSON.stringify(rfp.awardDetails) : null}, award_details),
        updated_at = ${nowIso}
      WHERE id = ${id};
    `;

    const savedRows = await sqlClient!`SELECT * FROM rfps WHERE id = ${id} LIMIT 1;`;
    if (!savedRows || savedRows.length === 0) {
      return res.status(404).json({ error: `RFP ${id} not found` });
    }

    return res.json({
      success: true,
      data: mapDbRowToRfp(savedRows[0]),
      message: 'RFP specifications updated successfully.'
    });
  } catch (err: any) {
    console.error('[API] Error updating RFP:', err);
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/rfps/:id/status - Lifecycle Stage Transition
apiRouter.patch('/rfps/:id/status', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;
    const { id } = req.params;
    const { status, performedBy = 'Hospital Procurement Team', userRole = 'owner', notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Target status is required' });
    }

    const nowIso = new Date().toISOString();

    await sqlClient!`
      UPDATE rfps SET
        status = ${status},
        updated_at = ${nowIso}
      WHERE id = ${id};
    `;

    // Log lifecycle audit event
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await sqlClient!`
      INSERT INTO rfp_audit_events (id, rfp_id, action, performed_by, user_role, details, created_at)
      VALUES (
        ${auditId}, ${id}, ${`Transitioned status to ${status}`},
        ${performedBy}, ${userRole},
        ${JSON.stringify({ newStatus: status, notes: notes || `RFP lifecycle advanced to ${status}` })},
        ${nowIso}
      );
    `;

    const savedRows = await sqlClient!`SELECT * FROM rfps WHERE id = ${id} LIMIT 1;`;
    if (!savedRows || savedRows.length === 0) {
      return res.status(404).json({ error: `RFP ${id} not found` });
    }

    return res.json({
      success: true,
      data: mapDbRowToRfp(savedRows[0]),
      message: `RFP lifecycle advanced to ${status}`
    });
  } catch (err: any) {
    console.error('[API] Error advancing RFP status:', err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/rfps/:id
apiRouter.delete('/rfps/:id', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;
    const { id } = req.params;

    await sqlClient!`DELETE FROM rfps WHERE id = ${id};`;
    return res.json({ success: true, message: `RFP ${id} removed successfully.` });
  } catch (err: any) {
    console.error('[API] Error deleting RFP:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 2. VENDOR QUOTATIONS ENDPOINTS
// ----------------------------------------------------------------------------

// GET /api/rfps/:rfpId/quotes - List quotes for an RFP
apiRouter.get('/rfps/:rfpId/quotes', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;
    const { rfpId } = req.params;

    const rows = await sqlClient!`
      SELECT * FROM quotations
      WHERE rfp_id = ${rfpId}
      ORDER BY created_at ASC;
    `;

    const quotes = (rows || []).map(mapDbRowToQuote);
    return res.json({
      success: true,
      data: quotes,
      count: quotes.length
    });
  } catch (err: any) {
    console.error('[API] Error fetching quotations:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/rfps/:rfpId/quotes - Submit or upsert vendor quote
apiRouter.post('/rfps/:rfpId/quotes', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;
    const { rfpId } = req.params;
    const quote = req.body as RFPQuote;

    if (!quote.vendorName || !quote.commercials) {
      return res.status(400).json({ error: 'Vendor name and commercials are required.' });
    }

    const id = quote.id || `quote-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    await sqlClient!`
      INSERT INTO quotations (
        id, rfp_id, vendor_id, vendor_name, vendor_company, contact_email,
        contact_phone, is_external, external_source, official_document_name,
        submission_date, quote_validity_date, version, status, commercials,
        technical_specs, deviations_and_exclusions, statutory_certifications,
        ai_extraction, created_at, updated_at
      ) VALUES (
        ${id}, ${rfpId}, ${quote.vendorId || id}, ${quote.vendorName},
        ${quote.vendorCompany || quote.vendorName}, ${quote.contactEmail || ''},
        ${quote.contactPhone || null}, ${quote.isExternal ?? false},
        ${quote.externalSource || null}, ${quote.officialDocumentName || null},
        ${quote.submissionDate || nowIso}, ${quote.quoteValidityDate || ''},
        ${quote.version || 1}, ${quote.status || 'submitted'},
        ${JSON.stringify(quote.commercials || {})},
        ${JSON.stringify(quote.technicalSpecs || [])},
        ${JSON.stringify(quote.deviationsAndExclusions || [])},
        ${JSON.stringify(quote.statutoryCertifications || [])},
        ${quote.aiExtraction ? JSON.stringify(quote.aiExtraction) : null},
        ${nowIso}, ${nowIso}
      )
      ON CONFLICT (id) DO UPDATE SET
        vendor_name = EXCLUDED.vendor_name,
        vendor_company = EXCLUDED.vendor_company,
        contact_email = EXCLUDED.contact_email,
        contact_phone = EXCLUDED.contact_phone,
        status = EXCLUDED.status,
        commercials = EXCLUDED.commercials,
        technical_specs = EXCLUDED.technical_specs,
        deviations_and_exclusions = EXCLUDED.deviations_and_exclusions,
        statutory_certifications = EXCLUDED.statutory_certifications,
        ai_extraction = EXCLUDED.ai_extraction,
        version = EXCLUDED.version,
        updated_at = ${nowIso};
    `;

    // Log bid submission in audit events
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await sqlClient!`
      INSERT INTO rfp_audit_events (id, rfp_id, action, performed_by, user_role, details, created_at)
      VALUES (
        ${auditId}, ${rfpId}, 'Quotation Submitted / Updated',
        ${quote.vendorName}, 'vendor',
        ${JSON.stringify({ quoteId: id, totalCost: quote.commercials.netLandedCost, status: quote.status || 'submitted' })},
        ${nowIso}
      );
    `;

    const savedRows = await sqlClient!`SELECT * FROM quotations WHERE id = ${id} LIMIT 1;`;
    return res.status(201).json({
      success: true,
      data: mapDbRowToQuote(savedRows[0]),
      message: 'Quotation persisted successfully in PostgreSQL.'
    });
  } catch (err: any) {
    console.error('[API] Error submitting quotation:', err);
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/rfps/:rfpId/quotes/:quoteId/status
apiRouter.patch('/rfps/:rfpId/quotes/:quoteId/status', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;
    const { rfpId, quoteId } = req.params;
    const { status, decisionRationale, poReference } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const nowIso = new Date().toISOString();

    await sqlClient!`
      UPDATE quotations SET
        status = ${status},
        updated_at = ${nowIso}
      WHERE id = ${quoteId} AND rfp_id = ${rfpId};
    `;

    // Log decision in audit events
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await sqlClient!`
      INSERT INTO rfp_audit_events (id, rfp_id, action, performed_by, user_role, details, created_at)
      VALUES (
        ${auditId}, ${rfpId}, ${`Quote Status Changed to ${status}`},
        'Hospital Procurement Lead', 'owner',
        ${JSON.stringify({ quoteId, status, decisionRationale, poReference })},
        ${nowIso}
      );
    `;

    const savedRows = await sqlClient!`SELECT * FROM quotations WHERE id = ${quoteId} LIMIT 1;`;
    if (!savedRows || savedRows.length === 0) {
      return res.status(404).json({ error: `Quotation ${quoteId} not found` });
    }

    return res.json({
      success: true,
      data: mapDbRowToQuote(savedRows[0]),
      message: `Quote status updated to ${status}`
    });
  } catch (err: any) {
    console.error('[API] Error updating quote status:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 3. CLARIFICATIONS ENDPOINTS (PostgreSQL with SMTP Notification)
// ----------------------------------------------------------------------------

// GET /api/rfps/:rfpId/clarifications
apiRouter.get('/rfps/:rfpId/clarifications', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;
    const { rfpId } = req.params;
    const { quoteId, status, category } = req.query;

    const rows = await sqlClient!`
      SELECT 
        id, rfp_id as "rfpId", quote_id as "quoteId", vendor_name as "vendorName",
        line_item_id as "lineItemId", parameter_name as "parameterName", category,
        question, is_ai_drafted as "isAiDrafted", asked_by as "askedBy",
        asked_at as "askedAt", response, responded_at as "respondedAt",
        status, revision_resulted as "revisionResulted",
        whatsapp_status as "whatsappStatus", email_status as "emailStatus"
      FROM rfp_clarifications
      WHERE rfp_id = ${rfpId}
      ORDER BY asked_at DESC;
    `;

    let items = rows || [];
    if (quoteId) items = items.filter((c: any) => c.quoteId === String(quoteId));
    if (status) items = items.filter((c: any) => c.status === String(status));
    if (category) items = items.filter((c: any) => c.category === String(category));

    return res.json({
      success: true,
      data: items,
      total: items.length
    });
  } catch (err: any) {
    console.error('[API] Error fetching clarifications:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/rfps/:rfpId/clarifications - Submit a clarification inquiry
apiRouter.post('/rfps/:rfpId/clarifications', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;
    const { rfpId } = req.params;
    const {
      quoteId,
      vendorName,
      lineItemId,
      parameterName,
      category = 'technical',
      question,
      askedBy = 'Hospital Procurement Owner',
      isAiDrafted = false,
      vendorEmail = 'vendor-sales@medtech.com'
    } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question content is required' });
    }

    const id = `clar-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    await sqlClient!`
      INSERT INTO rfp_clarifications (
        id, rfp_id, quote_id, vendor_name, line_item_id, parameter_name,
        category, question, is_ai_drafted, asked_by, asked_at, status,
        revision_resulted, whatsapp_status, email_status
      ) VALUES (
        ${id}, ${rfpId}, ${quoteId || null}, ${vendorName || 'Medical Equipment Vendor'},
        ${lineItemId || null}, ${parameterName || null}, ${category},
        ${question.trim()}, ${isAiDrafted}, ${askedBy}, ${nowIso}, 'open',
        false, 'sent', 'sent'
      );
    `;

    // Dispatch async notification email to vendor
    sendSmtpEmail(
      vendorEmail,
      `[NOVA-H Tender] Clarification Query on RFP ${rfpId} (${parameterName || category})`,
      `
        <div style="font-family:sans-serif;padding:20px;border:1px solid #e2e8f0;border-radius:8px;">
          <h2 style="color:#0f172a;margin-top:0;">Clarification Requested by Hospital</h2>
          <p>The hospital procurement team has requested clarification on your quotation line item:</p>
          <div style="background:#f8fafc;padding:12px;border-left:4px solid #3b82f6;margin:16px 0;">
            <strong>Parameter:</strong> ${parameterName || 'General Specification'}<br>
            <strong>Question:</strong> ${question}
          </div>
          <p style="font-size:12px;color:#64748b;">Please log in to your NOVA Vendor Workspace to submit your official technical response.</p>
        </div>
      `,
      `Hospital Clarification Request: ${question}`
    ).catch(() => {});

    // Log audit event
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await sqlClient!`
      INSERT INTO rfp_audit_events (id, rfp_id, action, performed_by, user_role, details, created_at)
      VALUES (
        ${auditId}, ${rfpId}, 'Clarification Query Sent to Vendor',
        ${askedBy}, 'owner',
        ${JSON.stringify({ clarificationId: id, vendorName, parameterName, question })},
        ${nowIso}
      );
    `;

    return res.status(201).json({
      success: true,
      data: {
        id,
        rfpId,
        quoteId,
        vendorName,
        lineItemId,
        parameterName,
        category,
        question: question.trim(),
        askedBy,
        askedAt: nowIso,
        status: 'open',
        isAiDrafted,
        revisionResulted: false,
        whatsappStatus: 'sent',
        emailStatus: 'sent'
      },
      message: 'Clarification query registered and dispatched to vendor.'
    });
  } catch (err: any) {
    console.error('[API] Error creating clarification:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/rfps/:rfpId/clarifications/:id/respond
apiRouter.post('/rfps/:rfpId/clarifications/:id/respond', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;
    const { id } = req.params;
    const { response, revisionResulted = false } = req.body;

    if (!response || !response.trim()) {
      return res.status(400).json({ error: 'Response text is required' });
    }

    const nowIso = new Date().toISOString();

    await sqlClient!`
      UPDATE rfp_clarifications SET
        response = ${response.trim()},
        responded_at = ${nowIso},
        status = 'answered',
        revision_resulted = ${revisionResulted}
      WHERE id = ${id};
    `;

    const rows = await sqlClient!`SELECT * FROM rfp_clarifications WHERE id = ${id} LIMIT 1;`;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Clarification query not found' });
    }

    return res.json({
      success: true,
      data: rows[0],
      message: 'Vendor response submitted successfully.'
    });
  } catch (err: any) {
    console.error('[API] Error submitting clarification response:', err);
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/rfps/:rfpId/clarifications/:id/resolve
apiRouter.patch('/rfps/:rfpId/clarifications/:id/resolve', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;
    const { id } = req.params;

    await sqlClient!`
      UPDATE rfp_clarifications SET
        status = 'resolved'
      WHERE id = ${id};
    `;

    const rows = await sqlClient!`SELECT * FROM rfp_clarifications WHERE id = ${id} LIMIT 1;`;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Clarification query not found' });
    }

    return res.json({
      success: true,
      data: rows[0],
      message: 'Clarification thread resolved.'
    });
  } catch (err: any) {
    console.error('[API] Error resolving clarification:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 4. AUDIT EVENTS & ADVISOR OBSERVATIONS ENDPOINTS
// ----------------------------------------------------------------------------

// GET /api/rfps/:rfpId/audits
apiRouter.get('/rfps/:rfpId/audits', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;
    const { rfpId } = req.params;

    const rows = await sqlClient!`
      SELECT 
        id, rfp_id as "rfpId", action, performed_by as "performedBy",
        user_role as "userRole", details, created_at as "timestamp"
      FROM rfp_audit_events
      WHERE rfp_id = ${rfpId}
      ORDER BY created_at DESC;
    `;

    return res.json({
      success: true,
      data: rows || []
    });
  } catch (err: any) {
    console.error('[API] Error fetching audits:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/rfps/:rfpId/audits
apiRouter.post('/rfps/:rfpId/audits', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;
    const { rfpId } = req.params;
    const { action, performedBy = 'User', userRole = 'owner', details = {} } = req.body;

    const id = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    await sqlClient!`
      INSERT INTO rfp_audit_events (id, rfp_id, action, performed_by, user_role, details, created_at)
      VALUES (${id}, ${rfpId}, ${action}, ${performedBy}, ${userRole}, ${JSON.stringify(details)}, ${nowIso});
    `;

    return res.status(201).json({
      success: true,
      data: { id, rfpId, action, performedBy, userRole, details, timestamp: nowIso }
    });
  } catch (err: any) {
    console.error('[API] Error logging audit event:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/rfps/:rfpId/observations
apiRouter.get('/rfps/:rfpId/observations', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;
    const { rfpId } = req.params;

    const rows = await sqlClient!`
      SELECT 
        id, rfp_id as "rfpId", advisor_name as "advisorName", organization,
        category, observation, recommendation, created_at as "createdAt"
      FROM advisor_observations
      WHERE rfp_id = ${rfpId}
      ORDER BY created_at DESC;
    `;

    return res.json({
      success: true,
      data: rows || []
    });
  } catch (err: any) {
    console.error('[API] Error fetching advisor observations:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/rfps/:rfpId/observations
apiRouter.post('/rfps/:rfpId/observations', async (req: Request, res: Response) => {
  try {
    if (!ensureDatabase(res)) return;
    const { rfpId } = req.params;
    const obs = req.body as AdvisorObservation;

    const id = obs.id || `obs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    await sqlClient!`
      INSERT INTO advisor_observations (
        id, rfp_id, advisor_name, organization, category, observation,
        recommendation, created_at
      ) VALUES (
        ${id}, ${rfpId}, ${obs.advisorName}, ${obs.organization || 'Independent Biomedical Advisor'},
        ${obs.category}, ${obs.observation}, ${obs.recommendation || ''},
        ${nowIso}
      );
    `;

    return res.status(201).json({
      success: true,
      data: { ...obs, id, rfpId, createdAt: nowIso }
    });
  } catch (err: any) {
    console.error('[API] Error saving observation:', err);
    return res.status(500).json({ error: err.message });
  }
});
