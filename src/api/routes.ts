import { Router, Request, Response } from 'express';
import { sqlClient, isDatabaseConfigured } from '../db/index';
import { DIRECTORY_DATA } from '../data/mockData';
import { DEFAULT_ACCREDITATION_PROGRAMMES } from '../utils/accreditationStorage';
import { INITIAL_PROJECT_REQUIREMENTS } from '../utils/requirementsStorage';
import { INITIAL_ENQUIRIES } from '../utils/enquiriesStorage';
import { PRESET_COUPONS } from '../utils/couponService';
import { getSampleLogins } from '../utils/sampleLogins';
import { DEFAULT_USERS } from '../utils/userManagement';
import { DirectoryItem, AccreditationProgramme, ProjectRequirement, EnquiryItem, AuthUser } from '../types';

export const apiRouter = Router();

// In-memory fallback stores when DATABASE_URL is not set
let memoryDirectory: DirectoryItem[] = [...DIRECTORY_DATA];
let memoryAccreditations: AccreditationProgramme[] = [...DEFAULT_ACCREDITATION_PROGRAMMES];
let memoryRequirements: ProjectRequirement[] = [...INITIAL_PROJECT_REQUIREMENTS];
let memoryEnquiries: EnquiryItem[] = [...INITIAL_ENQUIRIES];
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
