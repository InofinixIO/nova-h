import React from 'react';
import { 
  RFPItem, 
  RFPQuote, 
  RFPClarification, 
  AuthUser 
} from '../../types';
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PlusCircle, 
  Send, 
  DollarSign, 
  Wrench, 
  Calendar, 
  HelpCircle,
  Sparkles,
  Download,
  Building2,
  FileCheck
} from 'lucide-react';

interface VendorBidWorkspaceProps {
  rfp: RFPItem;
  myQuote?: RFPQuote | null;
  onOpenBidModal: () => void;
  onOpenClarification: () => void;
  onExportPdf?: () => void;
  currentUser?: AuthUser | null;
  clarificationsCount: number;
}

export const VendorBidWorkspace: React.FC<VendorBidWorkspaceProps> = ({
  rfp,
  myQuote,
  onOpenBidModal,
  onOpenClarification,
  onExportPdf,
  currentUser,
  clarificationsCount
}) => {
  const isAwardedToMe = rfp.status === 'selected' && rfp.awardDetails?.awardedVendorId === myQuote?.vendorId;
  const isAwardedToOther = rfp.status === 'selected' && !isAwardedToMe;
  const isTenderClosed = rfp.status === 'closed' || rfp.status === 'cancelled';

  return (
    <div className="space-y-6">
      {/* 1. Sealed-Bid Confidentiality Guarantee Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800 shadow-md">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Sealed-Bid Integrity Active</h3>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                SECURE TENDER DESK
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              In adherence to healthcare procurement governance, competing bidder pricing and commercial margins are strictly protected and sealed. You have exclusive private access to manage your quotation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={onOpenClarification}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Pre-Bid Q&A ({clarificationsCount})</span>
          </button>
          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Spec PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Quotation Status Card */}
      {myQuote ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-linear-to-r from-blue-50/70 via-white to-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded">
                  Quote ID: {myQuote.id}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Version {myQuote.version}.0
                </span>
                {isAwardedToMe ? (
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Contract Awarded to Your Firm</span>
                  </span>
                ) : isAwardedToOther ? (
                  <span className="bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Tender Concluded
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Active Submission Under Evaluation</span>
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {myQuote.vendorCompany || myQuote.vendorName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Submitted by {myQuote.contactEmail} • Logged on {new Date(myQuote.submissionDate).toLocaleDateString()}
              </p>
            </div>

            {!isTenderClosed && !isAwardedToOther && (
              <button
                onClick={onOpenBidModal}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Revised Quotation</span>
              </button>
            )}
          </div>

          {/* Key Quotation Metrics Grid */}
          <div className="p-5 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-100">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Base Equipment</span>
              <div className="text-lg font-black text-slate-900 mt-1">
                ₹{(myQuote.commercials.basePrice / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Lakhs
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Ex-factory machine cost</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Turnkey & MEP</span>
              <div className="text-lg font-black text-slate-900 mt-1">
                ₹{((myQuote.commercials.sitePrepAmount || 0) + (myQuote.commercials.installationAmount || 0)) > 0
                  ? `₹${(((myQuote.commercials.sitePrepAmount || 0) + (myQuote.commercials.installationAmount || 0)) / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} L`
                  : 'Included / Nil'}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Site prep & installation</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Warranty & CMC</span>
              <div className="text-lg font-black text-slate-900 mt-1">
                {myQuote.commercials.warrantyYears} Yrs Full Warranty
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {myQuote.commercials.cmcAnnualPercent ? `${myQuote.commercials.cmcAnnualPercent}% CMC/Yr Post-Warranty` : 'CMC terms defined'}
              </span>
            </div>

            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Net Landed Offer</span>
              <div className="text-xl font-black text-blue-900 mt-1">
                ₹{((myQuote.commercials.netLandedCost || 0) / 10000000).toFixed(2)} Cr
              </div>
              <span className="text-[10px] text-blue-600 mt-0.5 block">Incl. GST ({myQuote.commercials.gstRatePercent}%) & Freight</span>
            </div>
          </div>

          {/* Details & Declarations */}
          <div className="p-5 sm:p-6 space-y-6">
            {/* Commercial terms row */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Commercial Clauses & Delivery Timeline
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Payment Terms</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{myQuote.commercials.paymentTerms}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Dispatch & Delivery Lead Time</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{myQuote.commercials.deliveryWeeks} Weeks from advance</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Uptime Guarantee Commitment</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">
                    {myQuote.commercials.uptimeCommitmentPercent || 95}% Guaranteed Uptime
                  </span>
                </div>
              </div>
            </div>

            {/* Certifications & Compliances */}
            {myQuote.statutoryCertifications && myQuote.statutoryCertifications.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Statutory & Clinical Certifications Declared
                </h4>
                <div className="flex flex-wrap gap-2">
                  {myQuote.statutoryCertifications.map((cert, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{cert}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Deviations if any */}
            {myQuote.deviationsAndExclusions && myQuote.deviationsAndExclusions.length > 0 && (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-1">Declared Deviations / Exclusions:</span>
                <ul className="list-disc list-inside text-amber-800 space-y-0.5">
                  {myQuote.deviationsAndExclusions.map((dev, idx) => (
                    <li key={idx}>{dev}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State: Vendor has not submitted a bid yet */
        <div className="bg-white rounded-2xl border-2 border-dashed border-blue-200 p-8 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FileCheck className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-black text-slate-900">
              No Bid Submitted Yet for This Package
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              You are invited to review the clinical and engineering requirements below and submit your firm commercial quotation for {rfp.title}.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenBidModal}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Structured Vendor Bid</span>
            </button>
            <button
              onClick={onOpenClarification}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <span>Ask Pre-Bid Clarification</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Hospital Technical Requirements & Clinical Scope (Visible to all Bidders) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Technical Specifications & Scope of Work
            </h3>
            <p className="text-xs text-slate-500">
              Hospital clinical mandates, turnkey MEP conditions, and acceptable deviations.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {rfp.requirements.length} Mandatory Parameters
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Parameter</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Hospital Mandate Specification</th>
                <th className="py-2.5 px-3 text-right">Mandatory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rfp.requirements.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-800">
                    {req.parameter}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {req.category}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {req.hospitalSpecification}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {req.isMandatory ? (
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                        Mandatory
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                        Preferred
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
