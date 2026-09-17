import React from 'react';
import { 
  Building2, 
  Calendar, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  EyeOff, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Share2,
  Clock
} from 'lucide-react';
import { RFPItem, RFPLifecycleStatus } from '../../types';

interface RfpCardProps {
  rfp: RFPItem;
  quotesCount: number;
  onSelect: (rfp: RFPItem) => void;
  onExportPdf?: (rfp: RFPItem) => void;
  userRole?: string;
}

export const getStageBadge = (status: RFPLifecycleStatus) => {
  switch (status) {
    case 'draft':
      return { label: 'Draft', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    case 'internal_review':
      return { label: 'Internal Review', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'published':
      return { label: 'Published', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'vendor_questions':
      return { label: 'Pre-Bid Questions', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
    case 'submissions_open':
      return { label: 'Submissions Open', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'submissions_closed':
      return { label: 'Submissions Closed', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    case 'clarification':
      return { label: 'AI Clarification', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
    case 'technical_comparison':
      return { label: 'Tech Comparison', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    case 'commercial_comparison':
      return { label: 'Commercial Comparison', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
    case 'shortlisted':
      return { label: 'Shortlisted', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
    case 'negotiation':
      return { label: 'Negotiation', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
    case 'selected':
    case 'po_issued':
      return { label: 'Awarded / PO Issued', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    case 'closed':
      return { label: 'Closed', bg: 'bg-slate-200 text-slate-700 border-slate-300' };
    default:
      return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};

export const RfpCard: React.FC<RfpCardProps> = ({
  rfp,
  quotesCount,
  onSelect,
  onExportPdf,
  userRole = 'owner'
}) => {
  const badge = getStageBadge(rfp.status);

  // Compute days left until closing
  const closing = new Date(rfp.revisedClosingDate || rfp.quoteClosingDate);
  const now = new Date();
  const diffDays = Math.ceil((closing.getTime() - now.getTime()) / (1000 * 3600 * 24));

  return (
    <div 
      onClick={() => onSelect(rfp)}
      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Top bar: RFP number & Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {rfp.rfpNumber}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
              {badge.label}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {rfp.isIdentityMasked && (
              <span 
                title="Protected Client Identity (Masked until shortlisted/approved)"
                className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full"
              >
                <EyeOff className="w-3 h-3 text-slate-500" />
                <span>Masked</span>
              </span>
            )}
            {rfp.publishingModes.includes('public_web') && (
              <span 
                title="Public Search Indexable" 
                className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-0.5"
              >
                <Share2 className="w-3 h-3" />
                <span>Public</span>
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
          {rfp.title}
        </h3>

        {/* Hospital or Masked Title */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium truncate">
            {rfp.isIdentityMasked && userRole !== 'owner' && userRole !== 'admin'
              ? rfp.maskedHospitalTitle
              : rfp.hospitalName}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 flex items-center gap-0.5 shrink-0">
            <MapPin className="w-3 h-3" />
            {rfp.locationCity}
          </span>
        </div>

        {/* Summary */}
        <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
          {rfp.summary}
        </p>

        {/* Scope highlights */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
            Category: {rfp.category}
          </span>
          <span className="text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
            Est. Budget: {rfp.estimatedBudgetRange}
          </span>
          {rfp.assignedAdvisor && (
            <span className="text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>Advisor: Macula Healthcare</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer bar: Quotes count & Closing date */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-700 font-bold">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>{quotesCount} {quotesCount === 1 ? 'Quote' : 'Quotes'}</span>
          </div>

          <div className={`flex items-center gap-1 font-semibold ${
            diffDays < 0 ? 'text-slate-400' : diffDays <= 5 ? 'text-amber-600' : 'text-slate-500'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>
              {diffDays < 0 ? 'Closed' : `${diffDays} days left`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onExportPdf && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExportPdf(rfp);
              }}
              title="Download Offline RFP PDF for WhatsApp/Email distribution"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="text-blue-700 font-bold text-xs flex items-center group-hover:translate-x-0.5 transition-transform">
            <span>Workspace</span>
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
};
