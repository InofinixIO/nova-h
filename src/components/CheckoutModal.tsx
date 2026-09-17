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
  ExternalLink,
  Receipt,
  Download,
  AlertCircle
} from 'lucide-react';
import { PaymentGatewayType, PaymentTransaction, UserRole } from '../types';
import { processMembershipPayment } from '../utils/paymentService';

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
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayType>('razorpay');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [gstin, setGstin] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);

  if (!isOpen || !planDetails) return null;

  // Calculate 18% GST standard in India
  const baseAmount = planDetails.amount;
  const gstAmount = Math.round(baseAmount * 0.18);
  const totalPayable = baseAmount + gstAmount;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      await processMembershipPayment(
        {
          amount: totalPayable,
          planId: planDetails.planId,
          planTitle: planDetails.title,
          userRole: role,
          userName: name || (role === 'owner' ? 'Hospital Promoter' : 'Healthcare Partner'),
          userEmail: email || 'partner@nova-h.in',
          userPhone: phone || '9876543210',
          companyName: company || (role === 'owner' ? 'Healthcare Trust' : 'Nova Partner Firm'),
          gateway: selectedGateway,
          metadata: {
            ...planDetails.metadata,
            gstin,
            baseAmount,
            gstAmount
          }
        },
        (transaction) => {
          setIsProcessing(false);
          setCompletedTx(transaction);
          onPaymentSuccess(transaction);
        },
        (error) => {
          setIsProcessing(false);
          setErrorMsg(error);
        }
      );
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err?.message || 'Payment initiation failed.');
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
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {completedTx ? (
          /* SUCCESS STATE & TAX INVOICE RECEIPT */
          <div className="text-center py-2 animate-fadeIn" id="printable-receipt">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-2">
              Payment Successful &amp; Activated
            </span>

            <h3 className="text-2xl font-black text-slate-900">
              Welcome to the NOVA-H Network!
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Your annual membership subscription is active. A receipt has been issued.
            </p>

            {/* Receipt Box */}
            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 text-left text-xs space-y-2.5 mb-6">
              <div className="flex justify-between pb-2.5 border-b border-slate-200">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-800">{completedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway:</span>
                <span className="font-bold text-slate-800 uppercase flex items-center gap-1">
                  {completedTx.gateway === 'razorpay' ? (
                    <span className="text-blue-700">Razorpay</span>
                  ) : (
                    <span className="text-emerald-700">PayU</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Reference:</span>
                <span className="font-mono text-slate-700">{completedTx.gatewayPaymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plan Enrolled:</span>
                <span className="font-semibold text-slate-800">{completedTx.planTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Member:</span>
                <span className="font-semibold text-slate-800">{completedTx.userName}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-700">Total Paid (incl. 18% GST):</span>
                <span className="font-black text-blue-700">₹{completedTx.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleDownloadInvoice}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save Tax Receipt</span>
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
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 text-xs">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{planDetails.title}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{planDetails.billingBasis}</p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Annual
                </span>
              </div>
              
              <div className="pt-2.5 border-t border-slate-200/80 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Base Annual Fee:</span>
                  <span>₹{baseAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>GST (18%):</span>
                  <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Payable:</span>
                  <span className="text-sm font-black text-blue-700">₹{totalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Payment Gateway Selection: Razorpay vs PayU */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Payment Gateway:
              </label>
              <div className="grid grid-cols-2 gap-3">
                
                {/* Razorpay option */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('razorpay')}
                  className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                    selectedGateway === 'razorpay'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/30'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-blue-950">
                      <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                      <span>Razorpay</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      UPI, Credit/Debit, NetBanking, QR
                    </p>
                  </div>
                  <span className="w-3.5 h-3.5 rounded-full border border-blue-500 flex items-center justify-center">
                    {selectedGateway === 'razorpay' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                  </span>
                </button>

                {/* PayU option */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('payu')}
                  className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                    selectedGateway === 'payu'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>PayU</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      PayU Biz, Corporate NetBanking, Wallets
                    </p>
                  </div>
                  <span className="w-3.5 h-3.5 rounded-full border border-emerald-500 flex items-center justify-center">
                    {selectedGateway === 'payu' && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                  </span>
                </button>

              </div>
            </div>

            {/* Error banner if any */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Billing & Contact Form */}
            <form onSubmit={handlePay} className="space-y-3">
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
                  GSTIN (Optional, for Tax Input Credit)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 29AAAAA0000A1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 uppercase focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* Submit Payment CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all mt-4 ${
                  selectedGateway === 'razorpay'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                } ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {isProcessing
                    ? 'Connecting to Secure Gateway...'
                    : `Pay ₹${totalPayable.toLocaleString('en-IN')} via ${
                        selectedGateway === 'razorpay' ? 'Razorpay' : 'PayU'
                      }`}
                </span>
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  256-bit Bank Grade SSL
                </span>
                <span>•</span>
                <span>PCI-DSS Compliant</span>
                <span>•</span>
                <span>Instant GST Invoice</span>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
