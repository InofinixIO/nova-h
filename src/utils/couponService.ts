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
    applicableRoles: ['vendor', 'advisor', 'owner']
  },
  {
    code: 'LAUNCH100',
    discountType: 'percentage',
    discountValue: 100,
    description: '100% NOVA Platform Launch Complimentary Access (₹0 Payable)',
    applicableRoles: ['vendor', 'advisor', 'owner']
  },
  {
    code: 'MACULA100',
    discountType: 'percentage',
    discountValue: 100,
    description: '100% Macula Strategic Healthcare Advisor Invitation Code (₹0 Payable)',
    applicableRoles: ['advisor', 'vendor']
  },
  {
    code: 'SPONSOR100',
    discountType: 'percentage',
    discountValue: 100,
    description: '100% Institutional Healthcare Sponsor Waiver (₹0 Payable)',
    applicableRoles: ['vendor', 'advisor', 'owner']
  },
  {
    code: 'NOVA20',
    discountType: 'percentage',
    discountValue: 20,
    description: '20% Special Healthcare Partner Early-Bird Discount',
    applicableRoles: ['vendor', 'advisor', 'owner']
  },
  {
    code: 'HEALTH50',
    discountType: 'percentage',
    discountValue: 50,
    description: '50% Healthcare Startup & Equipment Supplier Subsidy',
    applicableRoles: ['vendor', 'advisor']
  },
  {
    code: 'SPECIAL1000',
    discountType: 'flat',
    discountValue: 1000,
    description: 'Flat ₹1,000 Off on Annual Healthcare Subscription',
    applicableRoles: ['vendor', 'advisor', 'owner']
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
}

/**
 * Validates a coupon code against base plan amount and user role
 */
export const validateAndApplyCoupon = (
  rawCode: string,
  baseAmount: number,
  role?: UserRole
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

  // Look in presets or custom user-defined coupons in localStorage
  let allCoupons = [...PRESET_COUPONS];
  try {
    const custom = JSON.parse(localStorage.getItem('novah_custom_coupons') || '[]');
    if (Array.isArray(custom)) {
      allCoupons = [...allCoupons, ...custom];
    }
  } catch (e) {}

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

  // Check role applicability if defined
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
  // If base is ₹0, GST is ₹0
  const gstAmount = discountedBase === 0 ? 0 : Math.round(discountedBase * 0.18);
  const finalPayable = discountedBase + gstAmount;
  const isComplimentary = finalPayable === 0;

  return {
    isValid: true,
    coupon: foundCoupon,
    message: isComplimentary
      ? `Coupon "${foundCoupon.code}" applied! 100% Complimentary Waiver (Payable: ₹0). Profile will activate directly.`
      : `Coupon "${foundCoupon.code}" applied! Saved ₹${discount.toLocaleString('en-IN')}. Payable: ₹${finalPayable.toLocaleString('en-IN')}.`,
    originalBase: baseAmount,
    discountAmount: discount,
    discountedBase,
    gstAmount,
    finalPayable,
    isComplimentary
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
