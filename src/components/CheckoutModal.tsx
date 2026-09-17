import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Building2, 
  Cog, 
  UserCheck, 
  Receipt,
  Download,
  AlertCircle,
  Tag,
  Sparkles,
  Gift,
  ArrowRight
} from 'lucide-react';
import { PaymentTransaction, UserRole } from '../types';
import { processMembershipPayment } from '../utils/paymentService';
import { validateAndApplyCoupon, recordCouponRedemption, CouponValidationResult } from '../utils/couponService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  planDetails: {
    planId: string;
    title: string;
    amount: number;
    billingBasis: string;
    metadata?: any;
  } | null;
  onPaymentSuccess: (transaction: PaymentTransaction) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  role,
  planDetails,
  onPaymentSuccess
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [gstin, setGstin] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponResult, setAppliedCouponResult] = useState<CouponValidationResult | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);

  if (!isOpen || !planDetails) return null;

  // Base plan calculation
  const rawBaseAmount = planDetails.amount;

  // Current calculated figures based on whether coupon is applied
  const isCouponApplied = appliedCouponResult && appliedCouponResult.isValid;
  const originalBase = rawBaseAmount;
  const discountAmount = isCouponApplied ? appliedCouponResult.discountAmount : 0;
  const netBase = isCouponApplied ? appliedCouponResult.discountedBase : rawBaseAmount;
  // If net base is 0, GST is 0; otherwise 18% standard GST
  const gstAmount = netBase === 0 ? 0 : Math.round(netBase * 0.18);
  const finalPayable = netBase + gstAmount;
  const isComplimentary = finalPayable === 0;

  const handleApplyCoupon = (codeToApply?: string) => {
    const targetCode = (codeToApply !== undefined ? codeToApply : couponCode).trim();
    if (!targetCode) {
      setCouponFeedback({ type: 'error', message: 'Please enter a coupon or promotional code.' });
      return;
    }

    const result = validateAndApplyCoupon(targetCode, rawBaseAmount, role);
    if (result.isValid) {
      setCouponCode(result.coupon?.code || targetCode.toUpperCase());
      setAppliedCouponResult(result);
      setCouponFeedback({ type: 'success', message: result.message });
      setErrorMsg(null);
    } else {
      setAppliedCouponResult(null);
      setCouponFeedback({ type: 'error', message: result.message });
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCouponResult(null);
    setCouponFeedback(null);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsProcessing(true);

    const userName = name || (role === 'owner' ? 'Hospital Promoter' : 'Healthcare Partner');
    const userEmail = email || 'partner@nova-h.in';
    const userPhone = phone || '9876543210';
    const companyName = company || (role === 'owner' ? 'Healthcare Trust' : 'Nova Partner Firm');

    try {
      await processMembershipPayment(
        {
          amount: finalPayable,
          planId: planDetails.planId,
          planTitle: planDetails.title,
          userRole: role,
          userName,
          userEmail,
          userPhone,
          companyName,
          gateway: isComplimentary ? 'complimentary' : 'razorpay',
          couponCode: isCouponApplied ? appliedCouponResult.coupon?.code : undefined,
          discountAmount: isCouponApplied ? discountAmount : 0,
          originalAmount: rawBaseAmount + Math.round(rawBaseAmount * 0.18),
          metadata: {
            ...planDetails.metadata,
            gstin,
            netBase,
            gstAmount,
            discountAmount
          }
        },
        (transaction) => {
          setIsProcessing(false);
          setCompletedTx(transaction);

          // Record coupon redemption in audit log if coupon was used
          if (isCouponApplied && appliedCouponResult.coupon) {
            recordCouponRedemption({
              couponCode: appliedCouponResult.coupon.code,
              discountType: appliedCouponResult.coupon.discountType,
              discountValue: appliedCouponResult.coupon.discountValue,
              originalAmount: originalBase,
              discountAmount,
              finalPayable,
              isComplimentary,
              userRole: role,
              userName,
              userEmail,
              userPhone,
              companyName,
              planId: planDetails.planId,
              planTitle: planDetails.title,
              transactionId: transaction.id
            });
          }

          onPaymentSuccess(transaction);
        },
        (error) => {
          setIsProcessing(false);
          setErrorMsg(error);
        }
      );
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err?.message || 'Membership activation failed.');
    }
  };

  const handleDownloadInvoice = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 text-slate-900">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {completedTx ? (
          /* SUCCESS STATE & TAX INVOICE RECEIPT */
          <div className="text-center py-2 animate-fadeIn" id="printable-receipt">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              completedTx.isComplimentary ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {completedTx.isComplimentary ? (
                <Sparkles className="w-9 h-9" />
              ) : (
                <CheckCircle2 className="w-9 h-9" />
              )}
            </div>

            <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-2 border ${
              completedTx.isComplimentary
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-blue-700 bg-blue-50 border-blue-200'
            }`}>
              {completedTx.isComplimentary ? '100% Complimentary Membership Activated' : 'Payment Successful & Activated'}
            </span>

            <h3 className="text-2xl font-black text-slate-900">
              Welcome to the NOVA-H Network!
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              {completedTx.isComplimentary
                ? 'Your account and profile have been directly activated via coupon redemption.'
                : 'Your annual membership subscription is active. An invoice receipt has been generated.'}
            </p>

            {/* Receipt Box */}
            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 text-left text-xs space-y-2.5 mb-6">
              <div className="flex justify-between pb-2.5 border-b border-slate-200">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-800">{completedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Activation Mode:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  {completedTx.gateway === 'complimentary' ? (
                    <span className="text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded text-[11px] font-mono">
                      100% Coupon (Direct Activation)
                    </span>
                  ) : (
                    <span className="text-blue-700 flex items-center gap-1 font-bold">
                      <CreditCard className="w-3.5 h-3.5" /> Razorpay
                    </span>
                  )}
                </span>
              </div>
              {completedTx.couponCode && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Redeemed Coupon:</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {completedTx.couponCode}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Reference:</span>
                <span className="font-mono text-slate-700">{completedTx.gatewayPaymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plan Enrolled:</span>
                <span className="font-semibold text-slate-800">{completedTx.planTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Member Name:</span>
                <span className="font-semibold text-slate-800">{completedTx.userName}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-700">Total Paid:</span>
                <span className="font-black text-blue-700">
                  {completedTx.amount === 0 ? (
                    <span className="text-emerald-600 font-black">₹0 (100% Waived)</span>
                  ) : (
                    `₹${completedTx.amount.toLocaleString('en-IN')}`
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleDownloadInvoice}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save Receipt</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <span>Continue to Directory</span>
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                {role === 'owner' && <Building2 className="w-4 h-4" />}
                {role === 'vendor' && <Cog className="w-4 h-4" />}
                {role === 'advisor' && <UserCheck className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  Complete Membership Subscription
                </h3>
                <p className="text-xs text-slate-500">Annual access to NOVA-H ecosystem</p>
              </div>
            </div>

            {/* Plan Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 text-xs">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{planDetails.title}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{planDetails.billingBasis}</p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Annual
                </span>
              </div>
              
              <div className="pt-2.5 border-t border-slate-200/80 space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Base Annual Fee:</span>
                  <span className={isCouponApplied ? 'line-through text-slate-400' : 'font-medium text-slate-800'}>
                    ₹{originalBase.toLocaleString('en-IN')}
                  </span>
                </div>

                {isCouponApplied && (
                  <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/80 px-2 py-1 rounded">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Coupon Discount ({appliedCouponResult.coupon?.code}):
                    </span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>GST (18%):</span>
                  <span>
                    {gstAmount === 0 ? '₹0' : `₹${gstAmount.toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span className="text-xs uppercase tracking-wider text-slate-700">Total Payable:</span>
                  <div className="text-right">
                    {isComplimentary ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs line-through text-slate-400">
                          ₹{(originalBase + Math.round(originalBase * 0.18)).toLocaleString('en-IN')}
                        </span>
                        <span className="text-base font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          ₹0 (Complimentary)
                        </span>
                      </div>
                    ) : (
                      <span className="text-base font-black text-blue-700">
                        ₹{finalPayable.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* COUPON & PROMOTION CODE SECTION */}
            <div className="mb-4 bg-slate-50/60 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-blue-600" />
                  <span>Have a Coupon or BNI Code?</span>
                </label>
                {isCouponApplied && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] text-red-600 hover:text-red-700 font-medium underline cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. BNI100, NOVA20)"
                  value={couponCode}
                  disabled={Boolean(isCouponApplied)}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponFeedback(null);
                  }}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 uppercase font-mono tracking-wider font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
                />
                {!isCouponApplied ? (
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shadow-xs"
                  >
                    Apply
                  </button>
                ) : (
                  <span className="px-3 py-2 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                  </span>
                )}
              </div>

              {/* Feedback banner */}
              {couponFeedback && (
                <p className={`text-[11px] mt-1.5 font-medium ${
                  couponFeedback.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                }`}>
                  {couponFeedback.message}
                </p>
              )}

              {/* Suggested quick codes */}
              {!isCouponApplied && (
                <div className="mt-2 pt-2 border-t border-slate-200/70 flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="text-slate-400">Quick codes:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('BNI100')}
                    className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-mono font-bold cursor-pointer transition-colors"
                  >
                    BNI100 (100% Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('LAUNCH100')}
                    className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-800 font-mono font-bold cursor-pointer transition-colors"
                  >
                    LAUNCH100 (100% Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('NOVA20')}
                    className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-800 font-mono font-bold cursor-pointer transition-colors"
                  >
                    NOVA20 (20% Off)
                  </button>
                </div>
              )}
            </div>

            {/* GATEWAY / ACTIVATION ROUTING NOTICE */}
            <div className="mb-4">
              {isComplimentary ? (
                /* ₹0 CASE: DIRECT ACTIVATION (NO GATEWAY NEEDED) */
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>100% Fee Waived via Coupon</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    Total payable is ₹0. No payment gateway will be opened. Clicking below directly activates your annual membership and publishes your verified profile.
                  </p>
                </div>
              ) : (
                /* AMOUNT > ₹0: RAZORPAY SECURE GATEWAY */
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">
                        Razorpay Secure Gateway
                      </span>
                      <span className="text-[10px] text-slate-500">
                        UPI, Credit/Debit Cards, NetBanking, QR
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded-full">
                    PCI-DSS Level 1
                  </span>
                </div>
              )}
            </div>

            {/* Error banner if any */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Billing & Contact Form */}
            <form onSubmit={handleCheckoutSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@hospital.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {role === 'owner' ? 'Hospital / Trust Name *' : 'Company / Firm Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={role === 'owner' ? 'e.g. LifeCare Hospital Trust' : 'e.g. Apex BioMedical Systems'}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GSTIN (Optional, for Tax Invoice)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 29AAAAA0000A1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 uppercase focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* Submit Button */}
              {isComplimentary ? (
                /* ₹0 Button: Direct Instant Activation */
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md bg-emerald-600 hover:bg-emerald-700 transition-all mt-4 disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isProcessing ? 'Activating Profile in NOVA...' : 'Activate Membership Directly (₹0)'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                /* Amount > 0: Pay via Razorpay */
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md bg-blue-600 hover:bg-blue-700 transition-all mt-4 disabled:opacity-60"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {isProcessing
                      ? 'Connecting to Razorpay...'
                      : `Pay ₹${finalPayable.toLocaleString('en-IN')} via Razorpay`}
                  </span>
                </button>
              )}

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  256-bit Bank Grade SSL
                </span>
                <span>•</span>
                <span>Instant Activation</span>
                <span>•</span>
                <span>Official Receipt</span>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
