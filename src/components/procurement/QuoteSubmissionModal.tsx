import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Upload, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { RFPItem, RFPQuote, AuthUser, QuoteCommercials, QuoteTechnicalSpec } from '../../types';

interface QuoteSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfp: RFPItem;
  onSaveQuote: (quote: RFPQuote) => void;
  currentUser?: AuthUser | null;
}

export const QuoteSubmissionModal: React.FC<QuoteSubmissionModalProps> = ({
  isOpen,
  onClose,
  rfp,
  onSaveQuote,
  currentUser
}) => {
  const [vendorCompany, setVendorCompany] = useState(currentUser?.company || 'Precision Medical Systems');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || 'sales@precisionmed.com');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '+91 98400 55512');
  
  // Commercials
  const [basePrice, setBasePrice] = useState<number>(14000000);
  const [gstPercent, setGstPercent] = useState<number>(12);
  const [freight, setFreight] = useState<number>(300000);
  const [installation, setInstallation] = useState<number>(250000);
  const [sitePrep, setSitePrep] = useState<number>(150000);
  const [accessories, setAccessories] = useState<number>(400000);
  const [paymentTerms, setPaymentTerms] = useState<string>('15% advance with order, 75% on dispatch, 10% post installation and AERB sign-off');
  const [deliveryWeeks, setDeliveryWeeks] = useState<number>(6);
  const [warrantyYears, setWarrantyYears] = useState<number>(2);
  const [cmcPercent, setCmcPercent] = useState<number>(6.0);
  const [validityDays, setValidityDays] = useState<number>(60);
  const [uptimeSla, setUptimeSla] = useState<number>(98);
  const [trainingIncluded, setTrainingIncluded] = useState<boolean>(true);

  // Technical Specs compliance mapping
  const [techSpecs, setTechSpecs] = useState<Record<string, { value: string; compliance: 'compliant' | 'deviation' | 'excluded' | 'partial'; notes: string }>>(() => {
    const initial: Record<string, { value: string; compliance: 'compliant' | 'deviation' | 'excluded' | 'partial'; notes: string }> = {};
    rfp.requirements.forEach(req => {
      initial[req.id] = {
        value: `Fully meets ${req.hospitalSpecification}`,
        compliance: 'compliant',
        notes: 'Complies with specification schedule'
      };
    });
    return initial;
  });

  const [deviations, setDeviations] = useState<string>('Standard 3-phase 415V power connection to be provided by hospital.');
  const [docName, setDocName] = useState<string>('Official_Technical_and_Price_Bid.pdf');

  if (!isOpen) return null;

  const gstAmount = Math.round((basePrice * gstPercent) / 100);
  const netLandedCost = basePrice + gstAmount + freight + installation + sitePrep + accessories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedSpecs: QuoteTechnicalSpec[] = rfp.requirements.map(req => {
      const entry = techSpecs[req.id] || {
        value: 'Standard compliant',
        compliance: 'compliant',
        notes: ''
      };
      return {
        reqId: req.id,
        parameter: req.parameter,
        offeredValue: entry.value,
        compliance: entry.compliance,
        notes: entry.notes
      };
    });

    const quoteValidityDate = new Date();
    quoteValidityDate.setDate(quoteValidityDate.getDate() + validityDays);

    const quote: RFPQuote = {
      id: `quote-${Date.now()}`,
      rfpId: rfp.id,
      vendorId: `v-${vendorCompany.toLowerCase().replace(/\s+/g, '-')}`,
      vendorName: vendorCompany,
      vendorCompany,
      contactEmail,
      contactPhone,
      isExternal: false,
      officialDocumentName: docName,
      submissionDate: new Date().toISOString(),
      quoteValidityDate: quoteValidityDate.toISOString().split('T')[0],
      version: 1,
      status: 'submitted',
      commercials: {
        basePrice,
        gstRatePercent: gstPercent,
        gstAmount,
        freightAmount: freight,
        installationAmount: installation,
        sitePrepAmount: sitePrep,
        accessoriesAmount: accessories,
        netLandedCost,
        paymentTerms,
        deliveryWeeks,
        warrantyYears,
        cmcAnnualPercent: cmcPercent,
        cmcAnnualAmount: Math.round((basePrice * cmcPercent) / 100),
        trainingIncluded,
        uptimeCommitmentPercent: uptimeSla
      },
      technicalSpecs: formattedSpecs,
      deviationsAndExclusions: deviations.split('\n').filter(d => d.trim().length > 0),
      statutoryCertifications: ['AERB / CE', 'ISO 13485:2016']
    };

    onSaveQuote(quote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                Online Structured Quotation Submission
              </h2>
              <p className="text-[11px] text-slate-300">
                BRS Section 6: Standardized commercial breakdown &amp; technical compliance schedule
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confidentiality Notice Banner (VEN-FR-12) */}
        <div className="px-6 py-2.5 bg-blue-50 border-b border-blue-200 flex items-center gap-2 text-xs text-blue-900">
          <Lock className="w-4 h-4 text-blue-700 shrink-0" />
          <span className="font-semibold">
            Confidential Bidding: Your commercial submission is encrypted and strictly invisible to all competing bidders.
          </span>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 text-xs space-y-6">
          
          {/* Vendor Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              1. Bidding Entity Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company / OEM Name *</label>
                <input
                  type="text"
                  required
                  value={vendorCompany}
                  onChange={(e) => setVendorCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Contact Email *</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Commercial Schedule */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                2. Structured Commercial Offer (INR)
              </h3>
              <span className="font-mono text-xs font-bold text-slate-500">Currency: INR (₹)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Base Equipment Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">GST Applicable (%) *</label>
                <input
                  type="number"
                  required
                  value={gstPercent}
                  onChange={(e) => setGstPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Freight &amp; Insurance (₹)</label>
                <input
                  type="number"
                  value={freight}
                  onChange={(e) => setFreight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Installation &amp; Commissioning (₹)</label>
                <input
                  type="number"
                  value={installation}
                  onChange={(e) => setInstallation(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Site Prep &amp; Auxiliaries (₹)</label>
                <input
                  type="number"
                  value={sitePrep}
                  onChange={(e) => setSitePrep(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Accessories / Consumables (₹)</label>
                <input
                  type="number"
                  value={accessories}
                  onChange={(e) => setAccessories(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                />
              </div>
            </div>

            {/* Landed Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 font-bold block text-[11px]">Net Total Landed Cost (L1 Calculation):</span>
                <span className="text-slate-400 text-[10px]">Base + {gstPercent}% GST + Freight + Installation + Auxiliaries</span>
              </div>
              <span className="text-lg font-black text-blue-700 font-mono">
                ₹{netLandedCost.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Warranty & Maintenance */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Warranty (Years) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={warrantyYears}
                  onChange={(e) => setWarrantyYears(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Post-Warranty CMC (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={cmcPercent}
                  onChange={(e) => setCmcPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Delivery Lead Time</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={deliveryWeeks}
                    onChange={(e) => setDeliveryWeeks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                  <span className="text-slate-400 font-bold">Wks</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Uptime SLA (%)</label>
                <input
                  type="number"
                  value={uptimeSla}
                  onChange={(e) => setUptimeSla(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Commercial Payment Terms</label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Technical Compliance Schedule */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              3. Technical Compliance Against Hospital RFP Specifications
            </h3>

            <div className="space-y-2.5">
              {rfp.requirements.map((req) => {
                const specState = techSpecs[req.id] || { value: '', compliance: 'compliant', notes: '' };
                return (
                  <div key={req.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{req.parameter}</span>
                      <select
                        value={specState.compliance}
                        onChange={(e) => {
                          setTechSpecs({
                            ...techSpecs,
                            [req.id]: { ...specState, compliance: e.target.value as any }
                          });
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border cursor-pointer ${
                          specState.compliance === 'compliant'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : specState.compliance === 'deviation'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-red-50 text-red-800 border-red-300'
                        }`}
                      >
                        <option value="compliant">Compliant</option>
                        <option value="deviation">Deviation</option>
                        <option value="partial">Partial</option>
                        <option value="excluded">Excluded</option>
                      </select>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      RFP Requirement: <span className="font-semibold text-slate-700">{req.hospitalSpecification}</span>
                    </p>

                    <input
                      type="text"
                      placeholder="Specify your offered model feature / specification..."
                      value={specState.value}
                      onChange={(e) => {
                        setTechSpecs({
                          ...techSpecs,
                          [req.id]: { ...specState, value: e.target.value }
                        });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Upload & Exclusions */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              4. Document Upload &amp; Deviations
            </h3>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Quote Document (PDF)</label>
              <div className="p-3 border border-slate-300 rounded-xl flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-xs text-slate-800">{docName}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded border">
                  Simulated Ready
                </span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Exclusions &amp; Site Prerequisites</label>
              <textarea
                rows={2}
                value={deviations}
                onChange={(e) => setDeviations(e.target.value)}
                placeholder="Specify any site, electrical or civil prerequisites not included in your scope..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black cursor-pointer shadow-md transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Formal Quotation</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
