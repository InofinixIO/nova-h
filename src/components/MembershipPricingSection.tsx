import React, { useState } from 'react';
import { 
  Building2, 
  Cog, 
  UserCheck, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  CreditCard, 
  Calculator, 
  Sparkles, 
  HelpCircle,
  Award,
  BookOpen,
  Receipt
} from 'lucide-react';
import { UserRole, VendorCommercialModel, VendorValueBand } from '../types';
import { 
  MEMBERSHIP_PLANS, 
  VENDOR_PRICING_OPTIONS, 
  ADVISOR_QUALIFICATION_DETAILS, 
  ECOSYSTEM_COMMERCIAL_LOGIC 
} from '../data/membershipData';
import { SectionHeading } from './SectionHeading';

interface MembershipPricingSectionProps {
  onSelectPlanForPayment: (role: UserRole, planDetails: {
    planId: string;
    title: string;
    amount: number;
    billingBasis: string;
    metadata?: any;
  }) => void;
}

export const MembershipPricingSection: React.FC<MembershipPricingSectionProps> = ({
  onSelectPlanForPayment
}) => {
  // Interactive tab for exploring different personas
  const [activeTab, setActiveTab] = useState<UserRole>('vendor');

  // Vendor Pricing interactive assignment steps
  const [vendorType, setVendorType] = useState<'product' | 'service' | 'both'>('product');
  const [commercialModel, setCommercialModel] = useState<VendorCommercialModel>('one_time');
  const [selectedBand, setSelectedBand] = useState<VendorValueBand>('2l_to_5l');

  // Filter vendor value bands matching selected commercial model
  const availableBands = VENDOR_PRICING_OPTIONS.filter((opt) => opt.model === commercialModel);
  const currentAssignedBand = VENDOR_PRICING_OPTIONS.find((opt) => opt.band === selectedBand) || availableBands[0];

  const handleModelChange = (model: VendorCommercialModel) => {
    setCommercialModel(model);
    if (model === 'one_time') {
      setSelectedBand('2l_to_5l');
    } else {
      setSelectedBand('25k_to_50k_pm');
    }
  };

  const handlePayForVendor = () => {
    onSelectPlanForPayment('vendor', {
      planId: `vendor_${currentAssignedBand.band}`,
      title: `Vendor Membership (${currentAssignedBand.modelLabel})`,
      amount: currentAssignedBand.fee,
      billingBasis: currentAssignedBand.orderValueRange,
      metadata: {
        vendorType,
        commercialModel,
        band: currentAssignedBand.band,
        orderValueRange: currentAssignedBand.orderValueRange
      }
    });
  };

  const handlePayForOwner = () => {
    const plan = MEMBERSHIP_PLANS.owner;
    onSelectPlanForPayment('owner', {
      planId: plan.id,
      title: plan.title,
      amount: plan.annualFee,
      billingBasis: plan.commercialBasis
    });
  };

  const handlePayForAdvisor = () => {
    const plan = MEMBERSHIP_PLANS.advisor;
    onSelectPlanForPayment('advisor', {
      planId: plan.id,
      title: plan.title,
      amount: plan.annualFee,
      billingBasis: plan.commercialBasis
    });
  };

  return (
    <section id="pricing-section" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Transparent Commercial Model
          </span>
          <SectionHeading id="pricing-section" className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
            NOVA-H Membership &amp; Pricing Model
          </SectionHeading>
          <p className="text-slate-600 text-base sm:text-lg mt-2">
            A simple annual membership structure designed to keep hospital owners accessible, price vendors according to commercial opportunity, and build a qualified advisor ecosystem.
          </p>
          
          {/* Payment gateway trust badges */}
          <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Supported Gateways:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-800 rounded-md font-bold text-[11px] border border-blue-200">
              <CreditCard className="w-3 h-3 text-blue-600" />
              Razorpay
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md font-bold text-[11px] border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              PayU
            </span>
            <span className="text-[11px] text-slate-400">UPI, Cards, NetBanking, EMI</span>
          </div>
        </div>

        {/* 3 User Group Pricing Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          
          {/* 1. Hospital Owner */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-7 flex flex-col justify-between hover:border-blue-400 transition-all shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Low-Cost Access
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Hospital Owner</h3>
              <p className="text-xs text-slate-500 mt-0.5 mb-4">Promoters, Trustees &amp; Operators</p>
              
              <div className="mb-5 pb-5 border-b border-slate-200">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">₹1,000</span>
                  <span className="text-xs text-slate-500 font-semibold">/year</span>
                </div>
                <p className="text-xs font-medium text-slate-600 mt-1">Per hospital / project</p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Full access to the 15-stage Hospital Owners Toolkit</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Search verified vendors and advisors by city/state</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Post unlimited project RFQs and procurement needs</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Direct phone, email, and catalog access</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayForOwner}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <span>Join as Hospital Owner (₹1,000)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. Vendor */}
          <div className="bg-gradient-to-b from-blue-50/50 to-white rounded-2xl border-2 border-blue-600 p-6 sm:p-7 flex flex-col justify-between relative shadow-md">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Automated Value Mapping
            </div>
            <div>
              <div className="flex items-center justify-between mb-4 mt-1">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Cog className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Opportunity-Based
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Healthcare Vendor</h3>
              <p className="text-xs text-slate-500 mt-0.5 mb-4">Equipment, Turnkey, MEP &amp; Services</p>
              
              <div className="mb-5 pb-5 border-b border-slate-200">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">₹1,000 - ₹5,000</span>
                  <span className="text-xs text-slate-500 font-semibold">/year</span>
                </div>
                <p className="text-xs font-medium text-slate-600 mt-1">
                  Mapped automatically based on typical 50-bed hospital order value
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Featured listing in verified healthcare directory</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Direct inquiries from active hospital promoters</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Display project stages, certifications &amp; service locations</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>One-time supply or monthly recurring fee mapping</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                document.getElementById('vendor-calculator-box')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Calculator className="w-3.5 h-3.5 text-blue-400" />
              <span>Calculate &amp; Register (Step 2 Below)</span>
            </button>
          </div>

          {/* 3. Advisor / Consultant */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-7 flex flex-col justify-between hover:border-blue-400 transition-all shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-sky-700 bg-sky-100/70 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Qualification Model
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Advisor / Consultant</h3>
              <p className="text-xs text-slate-500 mt-0.5 mb-4">Architects, Engineers &amp; Planners</p>
              
              <div className="mb-5 pb-5 border-b border-slate-200">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">₹1,000</span>
                  <span className="text-xs text-slate-500 font-semibold">/year</span>
                </div>
                <p className="text-xs font-medium text-slate-600 mt-1">Entry membership + paid workshops</p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Platform membership &amp; verified specialist profile</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Eligible for NOVA-H / Macula Healthcare project delivery</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Access to prescribed methodology workshops (₹2.5k - ₹5k)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Coordination with Macula Healthcare execution team</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayForAdvisor}
              className="w-full py-3 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <span>Join as Advisor (₹1,000)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* SECTION 2: HOW VENDOR PRICING SHOULD BE ASSIGNED (The 4-Step Interactive Assignment Box) */}
        <div id="vendor-calculator-box" className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden mb-16">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl mb-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800/80 inline-block mb-2">
              Automated Assignment Engine
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              2. How Vendor Pricing Is Assigned
            </h3>
            <p className="text-slate-300 text-sm sm:text-base mt-2">
              Vendors do not directly pick a fee slab. During registration, tell us your business nature and approximate commercial value with a typical <strong>50-bed hospital</strong>. The system calculates and assigns your membership fee automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Steps 1, 2, 3 */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Step 1: Business Type */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h4 className="text-sm font-bold text-white">Business Type</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'product', label: 'Product Provider' },
                    { id: 'service', label: 'Service Provider' },
                    { id: 'both', label: 'Both (Turnkey)' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setVendorType(t.id as any)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                        vendorType === t.id
                          ? 'border-blue-400 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Commercial Model */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h4 className="text-sm font-bold text-white">Commercial Model</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleModelChange('one_time')}
                    className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                      commercialModel === 'one_time'
                        ? 'border-blue-400 bg-blue-950/60 text-white ring-1 ring-blue-400'
                        : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">One-Time Supply</p>
                    <p className="text-[11px] text-slate-400 mt-1">Capital equipment, construction materials, civil, OT fixtures</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModelChange('recurring')}
                    className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                      commercialModel === 'recurring'
                        ? 'border-blue-400 bg-blue-950/60 text-white ring-1 ring-blue-400'
                        : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">Recurring Monthly Service</p>
                    <p className="text-[11px] text-slate-400 mt-1">AMC/CMC, biomedical calibration, facility retainers, laundry</p>
                  </button>
                </div>
              </div>

              {/* Step 3: Typical Value for a 50-bed hospital */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Typical Value for a 50-Bed Hospital
                  </h4>
                </div>
                
                <div className="space-y-2">
                  {availableBands.map((band) => (
                    <button
                      key={band.band}
                      type="button"
                      onClick={() => setSelectedBand(band.band)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        selectedBand === band.band
                          ? 'border-emerald-400 bg-emerald-950/40 text-white ring-1 ring-emerald-400'
                          : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{band.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{band.description}</p>
                      </div>
                      <span className="text-sm font-black text-emerald-400 shrink-0 font-mono">
                        {band.displayFee}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Step 4: System Assigns Membership */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-blue-900/90 to-slate-800 border border-blue-500/30 rounded-2xl p-6 sm:p-7">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-blue-700/50 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">
                      4
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                      System Fee Assignment
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                    Auto-Mapped
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Selected Commercial Model:</span>
                    <span className="text-sm font-bold text-white">{currentAssignedBand.modelLabel}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">50-Bed Hospital Benchmark:</span>
                    <span className="text-xs font-semibold text-blue-200">{currentAssignedBand.orderValueRange}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Category Rule:</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                      Annual membership reflects the economic opportunity of this tier. Simple to understand, automate, and justify.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-4 border border-blue-400/20 mb-6">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Calculated Annual Membership:
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black text-white tracking-tight">
                      ₹{currentAssignedBand.fee.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">/year + GST</span>
                  </div>
                </div>
              </div>

              {/* Pay Now Button supporting PayU & Razorpay */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handlePayForVendor}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-500/20"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Pay ₹{currentAssignedBand.fee.toLocaleString('en-IN')} via PayU / Razorpay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  Instant activation • GST invoice issued • Verified vendor badge
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 3: ADVISOR MEMBERSHIP & QUALIFICATION */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 mb-16">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-3 py-1 rounded-full border border-sky-200 inline-block mb-2">
              Advisor Pathway
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              3. Advisor Membership &amp; Qualification
            </h3>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Advisors are treated differently from vendors. The ₹1,000 annual subscription provides platform membership, but it does not automatically make someone a NOVA-H recommended advisor without qualification alignment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Tier A: Member */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold text-slate-900">NOVA-H Advisor Member</h4>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">
                  ₹1,000/year
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Can create a profile, access the ecosystem, receive relevant hospital information, and attend network workshops.
              </p>
              <div className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Standard verified listing in Directory</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Receive inquiries from hospital owners</span>
                </div>
              </div>
            </div>

            {/* Tier B: Qualified Advisor */}
            <div className="bg-white rounded-2xl border-2 border-sky-600 p-6 shadow-xs relative">
              <div className="absolute -top-2.5 right-6 bg-sky-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Recommended Status
              </div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold text-slate-900">NOVA-H Qualified Advisor</h4>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  Qualification Required
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Understands Macula Healthcare methodology, follows professional standards, attends prescribed workshops, and agrees to coordinated project delivery.
              </p>
              <div className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-sky-600" />
                  <span>Recommended badge &amp; Macula Healthcare alignment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-sky-600" />
                  <span>Joint project execution on active hospital developments</span>
                </div>
              </div>
            </div>
          </div>

          {/* Qualification expectations & Workshops banner */}
          <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-5 sm:p-6 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-700" />
              <span>Qualification Expectations for Consultants:</span>
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
              {ADVISOR_QUALIFICATION_DETAILS.qualificationExpectations.map((exp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">•</span>
                  <span>{exp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold">Prescribed Workshops:</span>{' '}
              Workshops remain separately chargeable (typically ₹2,500 - ₹5,000 per workshop) with a structured certification programme.
            </div>
            <button
              onClick={handlePayForAdvisor}
              className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
            >
              Subscribe as Advisor (₹1,000)
            </button>
          </div>
        </div>

        {/* SECTION 4: COMMERCIAL LOGIC OF THE ECOSYSTEM (Table) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="max-w-3xl mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 inline-block mb-2">
              Ecosystem Overview
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              4. Commercial Logic of the Ecosystem
            </h3>
            <p className="text-slate-600 text-sm mt-1">
              Positioning NOVA-H not merely as a paid directory, but as a hospital-project business ecosystem connecting genuine hospital owners with relevant vendors, qualified advisors, and execution support.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-700">
                  <th className="py-3 px-4 font-bold">Stakeholder Group</th>
                  <th className="py-3 px-4 font-bold">Commercial Basis</th>
                  <th className="py-3 px-4 font-bold">Annual Fee</th>
                  <th className="py-3 px-4 font-bold hidden sm:table-cell">Strategic Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {ECOSYSTEM_COMMERCIAL_LOGIC.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.userType}</td>
                    <td className="py-3.5 px-4">{row.commercialBasis}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-700">{row.annualFee}</td>
                    <td className="py-3.5 px-4 text-slate-500 hidden sm:table-cell">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
