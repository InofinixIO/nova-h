import { Coupon, CouponRedemption, UserRole } from '../types';

/**
 * Standard preset promotional and complimentary membership coupons
 * BNI100 & LAUNCH100: 100% complimentary waiver (₹0 payable, direct activation)
 * NOVA20: 20% discount (routes to Razorpay for remaining amount)
 */
export const PRESET_COUPONS: Coupon[] = [
  {
    code: 'BNI100',
    discountType: 'percentage',
    discountValue: 100,
    description: '100% BNI Chapter Healthcare Partner Complimentary Waiver (₹0 Payable)',
    applicableRoles: ['vendor', 'advisor', 'owner'],
    maxTotalUses: null, // Unlimited global pool
    maxUsesPerUser: 1   // 1 redemption per account
  },
  {
    code: 'LAUNCH100',
    discountType: 'percentage',
    discountValue: 100,
    description: '100% NOVA Platform Launch Complimentary Access (₹0 Payable)',
    applicableRoles: ['vendor', 'advisor', 'owner'],
    maxTotalUses: null,
    maxUsesPerUser: 1
  },
  {
    code: 'MACULA100',
    discountType: 'percentage',
    discountValue: 100,
    description: '100% Macula Strategic Healthcare Advisor Invitation Code (₹0 Payable)',
    applicableRoles: ['advisor', 'vendor'],
    maxTotalUses: null,
    maxUsesPerUser: 1
  },
  {
    code: 'SPONSOR100',
    discountType: 'percentage',
    discountValue: 100,
    description: '100% Institutional Healthcare Sponsor Waiver (₹0 Payable)',
    applicableRoles: ['vendor', 'advisor', 'owner'],
    maxTotalUses: null,
    maxUsesPerUser: 1
  },
  {
    code: 'NOVA20',
    discountType: 'percentage',
    discountValue: 20,
    description: '20% Special Healthcare Partner Early-Bird Discount',
    applicableRoles: ['vendor', 'advisor', 'owner'],
    maxTotalUses: null,
    maxUsesPerUser: 1
  },
  {
    code: 'HEALTH50',
    discountType: 'percentage',
    discountValue: 50,
    description: '50% Healthcare Startup & Equipment Supplier Subsidy',
    applicableRoles: ['vendor', 'advisor'],
    maxTotalUses: null,
    maxUsesPerUser: 1
  },
  {
    code: 'SPECIAL1000',
    discountType: 'flat',
    discountValue: 1000,
    description: 'Flat ₹1,000 Off on Annual Healthcare Subscription',
    applicableRoles: ['vendor', 'advisor', 'owner'],
    maxTotalUses: null,
    maxUsesPerUser: 1
  }
];

export interface CouponValidationResult {
  isValid: boolean;
  coupon: Coupon | null;
  message: string;
  originalBase: number;
  discountAmount: number;
  discountedBase: number;
  gstAmount: number;
  finalPayable: number;
  isComplimentary: boolean; // True if total payable is ₹0
  totalRedemptions?: number;
  userRedemptions?: number;
  isLimitReached?: boolean;
}

/**
 * Fetch all available coupons (presets + custom saved in localStorage, de-duplicated with overrides applied)
 */
export const getAllCoupons = (): Coupon[] => {
  const couponMap = new Map<string, Coupon>();

  // 1. Initialize with standard presets
  for (const preset of PRESET_COUPONS) {
    couponMap.set(preset.code.toUpperCase(), { ...preset });
  }

  // 2. Apply custom creations and overrides
  if (typeof window !== 'undefined') {
    try {
      const custom = JSON.parse(localStorage.getItem('novah_custom_coupons') || '[]');
      if (Array.isArray(custom)) {
        for (const c of custom) {
          if (c && c.code) {
            const clean = c.code.trim().toUpperCase();
            const existing = couponMap.get(clean);
            if (existing) {
              couponMap.set(clean, { ...existing, ...c });
            } else {
              couponMap.set(clean, { ...c });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse custom coupons:', e);
    }
  }

  // 3. Attach live redemption counters
  const redemptions = getStoredCouponRedemptions();
  return Array.from(couponMap.values()).map(c => {
    const total = redemptions.filter(r => r.couponCode.toUpperCase() === c.code.toUpperCase()).length;
    return {
      ...c,
      maxTotalUses: c.maxTotalUses !== undefined ? c.maxTotalUses : null,
      maxUsesPerUser: c.maxUsesPerUser !== undefined ? c.maxUsesPerUser : 1,
      totalRedemptions: total
    };
  });
};

/**
 * Save custom coupons list to storage and background sync
 */
export const saveCustomCoupons = (coupons: Coupon[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('novah_custom_coupons', JSON.stringify(coupons));
    window.dispatchEvent(new CustomEvent('nova_coupons_updated', { detail: coupons }));
  } catch (e) {
    console.error('Failed to save custom coupons:', e);
  }
};

/**
 * Create and publish a new custom coupon code
 */
export const createCoupon = (coupon: Coupon): Coupon[] => {
  const cleanCode = coupon.code.trim().toUpperCase();
  const currentCustom: Coupon[] = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('novah_custom_coupons') || '[]')
    : [];

  const existingIdx = currentCustom.findIndex(c => c.code.toUpperCase() === cleanCode);
  const updatedCoupon: Coupon = {
    ...coupon,
    code: cleanCode,
    maxTotalUses: coupon.maxTotalUses !== undefined ? coupon.maxTotalUses : null,
    maxUsesPerUser: coupon.maxUsesPerUser !== undefined ? coupon.maxUsesPerUser : 1
  };

  let updatedList: Coupon[];
  if (existingIdx >= 0) {
    updatedList = [...currentCustom];
    updatedList[existingIdx] = updatedCoupon;
  } else {
    updatedList = [updatedCoupon, ...currentCustom];
  }

  saveCustomCoupons(updatedList);

  // Sync to backend API
  if (typeof window !== 'undefined') {
    fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCoupon)
    }).catch(err => console.warn('[Storage] Create coupon API deferred:', err));
  }

  return getAllCoupons();
};

/**
 * Update limits on a specific coupon (preset or custom)
 */
export const updateCouponLimits = (
  code: string,
  limits: { maxTotalUses?: number | null; maxUsesPerUser?: number; description?: string }
): Coupon[] => {
  const cleanCode = code.trim().toUpperCase();
  const currentCustom: Coupon[] = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('novah_custom_coupons') || '[]')
    : [];
  const existingCustomIdx = currentCustom.findIndex(c => c.code.toUpperCase() === cleanCode);

  let updatedCustom = [...currentCustom];
  if (existingCustomIdx >= 0) {
    updatedCustom[existingCustomIdx] = {
      ...updatedCustom[existingCustomIdx],
      ...limits
    };
  } else {
    // If it's an existing preset, persist an override entry into custom list
    const preset = PRESET_COUPONS.find(c => c.code.toUpperCase() === cleanCode);
    if (preset) {
      updatedCustom.unshift({
        ...preset,
        ...limits
      });
    }
  }

  saveCustomCoupons(updatedCustom);

  // Sync to Neon API backend
  if (typeof window !== 'undefined') {
    fetch(`/api/coupons/${encodeURIComponent(cleanCode)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(limits)
    }).catch(err => console.warn('[Storage] Coupon limit update API deferred:', err));
  }

  return getAllCoupons();
};

/**
 * Reset a coupon's limits back to system default (clears custom override for presets)
 */
export const resetCouponLimits = (code: string): Coupon[] => {
  const cleanCode = code.trim().toUpperCase();
  if (typeof window !== 'undefined') {
    const currentCustom: Coupon[] = JSON.parse(localStorage.getItem('novah_custom_coupons') || '[]');
    const filtered = currentCustom.filter(c => c.code.toUpperCase() !== cleanCode);
    saveCustomCoupons(filtered);

    // Sync reset to backend API
    fetch(`/api/coupons/${encodeURIComponent(cleanCode)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxTotalUses: null, maxUsesPerUser: 1 })
    }).catch(err => console.warn('[Storage] Reset coupon limits API deferred:', err));
  }
  return getAllCoupons();
};

/**
 * Delete a custom coupon code
 */
export const deleteCustomCoupon = (code: string): Coupon[] => {
  const cleanCode = code.trim().toUpperCase();
  if (typeof window !== 'undefined') {
    const currentCustom: Coupon[] = JSON.parse(localStorage.getItem('novah_custom_coupons') || '[]');
    const filtered = currentCustom.filter(c => c.code.toUpperCase() !== cleanCode);
    saveCustomCoupons(filtered);

    // Call DELETE API
    fetch(`/api/coupons/${encodeURIComponent(cleanCode)}`, {
      method: 'DELETE'
    }).catch(err => console.warn('[Storage] Delete coupon API deferred:', err));
  }
  return getAllCoupons();
};

/**
 * Validates a coupon code against base plan amount, user role, and usage quotas
 */
export const validateAndApplyCoupon = (
  rawCode: string,
  baseAmount: number,
  role?: UserRole,
  userEmail?: string,
  userPhone?: string
): CouponValidationResult => {
  const code = rawCode.trim().toUpperCase();

  if (!code) {
    const gst = Math.round(baseAmount * 0.18);
    return {
      isValid: false,
      coupon: null,
      message: 'Please enter a coupon code.',
      originalBase: baseAmount,
      discountAmount: 0,
      discountedBase: baseAmount,
      gstAmount: gst,
      finalPayable: baseAmount + gst,
      isComplimentary: false
    };
  }

  const allCoupons = getAllCoupons();
  const foundCoupon = allCoupons.find(c => c.code.toUpperCase() === code);

  if (!foundCoupon) {
    const gst = Math.round(baseAmount * 0.18);
    return {
      isValid: false,
      coupon: null,
      message: `Coupon code "${code}" is invalid or expired.`,
      originalBase: baseAmount,
      discountAmount: 0,
      discountedBase: baseAmount,
      gstAmount: gst,
      finalPayable: baseAmount + gst,
      isComplimentary: false
    };
  }

  // 1. Expiration Date Check
  if (foundCoupon.validUntil) {
    const expiry = new Date(foundCoupon.validUntil);
    if (!isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
      const gst = Math.round(baseAmount * 0.18);
      return {
        isValid: false,
        coupon: foundCoupon,
        message: `Coupon "${foundCoupon.code}" expired on ${expiry.toLocaleDateString('en-IN')}.`,
        originalBase: baseAmount,
        discountAmount: 0,
        discountedBase: baseAmount,
        gstAmount: gst,
        finalPayable: baseAmount + gst,
        isComplimentary: false,
        isLimitReached: true
      };
    }
  }

  // 2. Role Applicability Check
  if (role && foundCoupon.applicableRoles && !foundCoupon.applicableRoles.includes(role)) {
    const gst = Math.round(baseAmount * 0.18);
    return {
      isValid: false,
      coupon: foundCoupon,
      message: `Coupon "${foundCoupon.code}" is not applicable for ${role} accounts.`,
      originalBase: baseAmount,
      discountAmount: 0,
      discountedBase: baseAmount,
      gstAmount: gst,
      finalPayable: baseAmount + gst,
      isComplimentary: false
    };
  }

  // 3. Global Usage Cap Check (maxTotalUses)
  const redemptions = getStoredCouponRedemptions();
  const totalRedemptions = redemptions.filter(r => r.couponCode.toUpperCase() === code).length;

  if (
    foundCoupon.maxTotalUses !== undefined &&
    foundCoupon.maxTotalUses !== null &&
    foundCoupon.maxTotalUses > 0 &&
    totalRedemptions >= foundCoupon.maxTotalUses
  ) {
    const gst = Math.round(baseAmount * 0.18);
    return {
      isValid: false,
      coupon: foundCoupon,
      message: `Coupon "${foundCoupon.code}" has reached its maximum platform limit (${foundCoupon.maxTotalUses} redemptions).`,
      originalBase: baseAmount,
      discountAmount: 0,
      discountedBase: baseAmount,
      gstAmount: gst,
      finalPayable: baseAmount + gst,
      isComplimentary: false,
      totalRedemptions,
      isLimitReached: true
    };
  }

  // 4. Per-User Usage Limit Check (maxUsesPerUser)
  const maxPerUser = foundCoupon.maxUsesPerUser !== undefined && foundCoupon.maxUsesPerUser !== null
    ? foundCoupon.maxUsesPerUser
    : 1;

  let userRedemptionsCount = 0;
  if (userEmail || userPhone) {
    const normEmail = (userEmail || '').trim().toLowerCase();
    const cleanPhone = (userPhone || '').replace(/\D/g, '');
    userRedemptionsCount = redemptions.filter(r => {
      if (r.couponCode.toUpperCase() !== code) return false;
      const rEmail = (r.userEmail || '').trim().toLowerCase();
      const rPhone = (r.userPhone || '').replace(/\D/g, '');
      const emailMatch = normEmail && rEmail && rEmail === normEmail;
      const phoneMatch = cleanPhone && rPhone && rPhone === cleanPhone;
      return Boolean(emailMatch || phoneMatch);
    }).length;

    if (userRedemptionsCount >= maxPerUser) {
      const gst = Math.round(baseAmount * 0.18);
      return {
        isValid: false,
        coupon: foundCoupon,
        message: `You have already redeemed coupon "${foundCoupon.code}" on this account (Limit: ${maxPerUser} redemption per member).`,
        originalBase: baseAmount,
        discountAmount: 0,
        discountedBase: baseAmount,
        gstAmount: gst,
        finalPayable: baseAmount + gst,
        isComplimentary: false,
        totalRedemptions,
        userRedemptions: userRedemptionsCount,
        isLimitReached: true
      };
    }
  }

  // Calculate discount
  let discount = 0;
  if (foundCoupon.discountType === 'percentage') {
    if (foundCoupon.discountValue >= 100) {
      discount = baseAmount; // 100% discount
    } else {
      discount = Math.round((baseAmount * foundCoupon.discountValue) / 100);
    }
  } else {
    discount = Math.min(baseAmount, foundCoupon.discountValue);
  }

  const discountedBase = Math.max(0, baseAmount - discount);
  const gstAmount = discountedBase === 0 ? 0 : Math.round(discountedBase * 0.18);
  const finalPayable = discountedBase + gstAmount;
  const isComplimentary = finalPayable === 0;

  const remainingGlobal = foundCoupon.maxTotalUses ? Math.max(0, foundCoupon.maxTotalUses - totalRedemptions) : null;
  const quotaNote = remainingGlobal !== null && remainingGlobal <= 5 
    ? ` (${remainingGlobal} redemption${remainingGlobal === 1 ? '' : 's'} remaining)` 
    : '';

  return {
    isValid: true,
    coupon: foundCoupon,
    message: isComplimentary
      ? `Coupon "${foundCoupon.code}" applied! 100% Complimentary Waiver (Payable: ₹0). Profile will activate directly.${quotaNote}`
      : `Coupon "${foundCoupon.code}" applied! Saved ₹${discount.toLocaleString('en-IN')}. Payable: ₹${finalPayable.toLocaleString('en-IN')}.${quotaNote}`,
    originalBase: baseAmount,
    discountAmount: discount,
    discountedBase,
    gstAmount,
    finalPayable,
    isComplimentary,
    totalRedemptions,
    userRedemptions: userRedemptionsCount
  };
};

/**
 * Record a coupon redemption in durable local store for auditing and tracking
 */
export const recordCouponRedemption = (redemption: Omit<CouponRedemption, 'id' | 'redeemedAt'>): CouponRedemption => {
  const fullRecord: CouponRedemption = {
    ...redemption,
    id: `RDM_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    redeemedAt: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    try {
      const stored = JSON.parse(localStorage.getItem('novah_coupon_redemptions') || '[]');
      stored.unshift(fullRecord);
      localStorage.setItem('novah_coupon_redemptions', JSON.stringify(stored.slice(0, 100)));

      // Sync to Neon PostgreSQL API
      fetch('/api/coupons/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullRecord)
      }).catch(err => console.warn('[Storage] Coupon redemption API deferred:', err));
    } catch (e) {
      console.error('Could not persist coupon redemption:', e);
    }
  }

  return fullRecord;
};

/**
 * Fetch all recorded coupon redemptions for Admin review
 */
export const getStoredCouponRedemptions = (): CouponRedemption[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('novah_coupon_redemptions') || '[]');
  } catch {
    return [];
  }
};

/**
 * Sync coupon redemptions from Neon PostgreSQL backend
 */
export async function syncCouponRedemptionsWithBackend(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch('/api/coupons/redemptions');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('novah_coupon_redemptions', JSON.stringify(data.slice(0, 100)));
      }
    }
  } catch (e) {
    // Offline fallback
  }
}

if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncCouponRedemptionsWithBackend();
  }, 350);
}
