import React, { useState, useEffect } from 'react';
import { 
  RFPItem, 
  RFPQuote, 
  RFPClarification, 
  RFPAuditEvent, 
  AdvisorObservation, 
  RFPLifecycleStatus,
  UserRole,
  AuthUser 
} from '../../types';
import { 
  getStoredRFPs, 
  saveStoredRFPs, 
  getStoredQuotes, 
  saveStoredQuotes, 
  getStoredClarifications, 
  saveStoredClarifications, 
  getStoredAuditEvents, 
  logAuditEvent, 
  getStoredAdvisorObservations,
  saveStoredAdvisorObservations
} from '../../utils/procurementStorage';
import { RfpCard, getStageBadge } from './RfpCard';
import { RfpCreateModal } from './RfpCreateModal';
import { ExternalQuoteUploadModal } from './ExternalQuoteUploadModal';
import { QuoteSubmissionModal } from './QuoteSubmissionModal';
import { ComparisonMatrixView } from './ComparisonMatrixView';
import { TcoCalculatorView } from './TcoCalculatorView';
import { ClarificationCycleView } from './ClarificationCycleView';
import { RfpDossierPrintModal } from './RfpDossierPrintModal';
import { VendorBidWorkspace } from './VendorBidWorkspace';
import { 
  Building2, 
  FileText, 
  Upload, 
  Plus, 
  Sparkles, 
  Share2, 
  Search, 
  Filter, 
  ChevronLeft, 
  Award, 
  History, 
  ShieldCheck, 
  EyeOff, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Briefcase,
  AlertCircle,
  Lock,
  MessageSquare,
  UserCheck
} from 'lucide-react';

interface ProcurementWorkspaceProps {
  currentUser?: AuthUser | null;
  onNavigateHome?: () => void;
}

const LIFECYCLE_STAGES: { key: RFPLifecycleStatus; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'internal_review', label: 'Review' },
  { key: 'published', label: 'Published' },
  { key: 'vendor_questions', label: 'Pre-Bid' },
  { key: 'submissions_open', label: 'Submissions' },
  { key: 'clarification', label: 'Clarifications' },
  { key: 'technical_comparison', label: 'Comparison' },
  { key: 'shortlisted', label: 'Shortlist' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'selected', label: 'Awarded' },
  { key: 'closed', label: 'Closed' }
];

export const ProcurementWorkspace: React.FC<ProcurementWorkspaceProps> = ({
  currentUser,
  onNavigateHome
}) => {
  // Master State
  const [rfps, setRfps] = useState<RFPItem[]>([]);
  const [quotes, setQuotes] = useState<RFPQuote[]>([]);
  const [clarifications, setClarifications] = useState<RFPClarification[]>([]);
  const [audits, setAudits] = useState<RFPAuditEvent[]>([]);
  const [observations, setObservations] = useState<AdvisorObservation[]>([]);

  // Role is strictly derived from authenticated logged-in user
  const effectiveRole: UserRole = currentUser?.role || 'owner';

  // Navigation / Selection State
  const [selectedRfpId, setSelectedRfpId] = useState<string | null>('rfp-ct-scan-blr-0042');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'my_bid' | 'comparison' | 'tco' | 'quotes' | 'clarifications' | 'specs' | 'advisor' | 'audit'>(
    (currentUser?.role === 'vendor') ? 'my_bid' : 'comparison'
  );
  const [directoryFilterCategory, setDirectoryFilterCategory] = useState<string>('all');
  const [directorySearch, setDirectorySearch] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExternalQuoteModalOpen, setIsExternalQuoteModalOpen] = useState(false);
  const [isVendorQuoteModalOpen, setIsVendorQuoteModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [awardNotes, setAwardNotes] = useState('');
  const [selectedWinningQuote, setSelectedWinningQuote] = useState<RFPQuote | null>(null);

  // New Advisor Observation Input
  const [newObsCategory, setNewObsCategory] = useState<'technical' | 'commercial_risk' | 'leverage_suggestion' | 'compliance'>('leverage_suggestion');
  const [newObsText, setNewObsText] = useState('');
  const [newObsRec, setNewObsRec] = useState('');

  // Load from storage on mount
  useEffect(() => {
    setRfps(getStoredRFPs());
    setQuotes(getStoredQuotes());
    setClarifications(getStoredClarifications());
    setAudits(getStoredAuditEvents());
    setObservations(getStoredAdvisorObservations());
  }, []);

  // Synchronize active tab with logged-in user role
  useEffect(() => {
    if (currentUser?.role === 'vendor') {
      setActiveWorkspaceTab('my_bid');
    } else {
      setActiveWorkspaceTab('comparison');
    }
  }, [currentUser?.role]);

  const selectedRfp = rfps.find(r => r.id === selectedRfpId);
  const rfpQuotes = quotes.filter(q => q.rfpId === selectedRfpId);
  const rfpClarifications = clarifications.filter(c => c.rfpId === selectedRfpId);
  const rfpAudits = audits.filter(a => a.rfpId === selectedRfpId);
  const rfpObservations = observations.filter(o => o.rfpId === selectedRfpId);

  // Match the vendor's own quotation for this RFP
  const myVendorQuote = selectedRfp ? rfpQuotes.find(q => {
    if (currentUser?.email && q.contactEmail?.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (currentUser?.company && q.vendorCompany?.toLowerCase().includes(currentUser.company.toLowerCase())) return true;
    if (currentUser?.id && q.vendorId === currentUser.id) return true;
    // For general demonstration, match the first non-external formal quotation
    return !q.isExternal;
  }) || null : null;

  // Handlers
  const handleSaveNewRfp = (newRfp: RFPItem) => {
    const updated = [newRfp, ...rfps];
    setRfps(updated);
    saveStoredRFPs(updated);
    setSelectedRfpId(newRfp.id);
    logAuditEvent(
      newRfp.id,
      currentUser?.name || 'Hospital Owner',
      'owner',
      'RFP Published',
      `Published new RFP package: ${newRfp.title}`,
      'draft',
      newRfp.status
    );
    setAudits(getStoredAuditEvents());
  };

  const handleSaveQuote = (quote: RFPQuote) => {
    const updated = [quote, ...quotes];
    setQuotes(updated);
    saveStoredQuotes(updated);

    if (selectedRfp) {
      logAuditEvent(
        selectedRfp.id,
        quote.isExternal ? (currentUser?.name || 'Hospital Lead') : quote.vendorName,
        quote.isExternal ? 'owner' : 'vendor',
        quote.isExternal ? 'External Quote Ingested & Verified' : 'Online Structured Bid Submitted',
        `Quote registered for ${quote.vendorName} (Landed: ₹${((quote.commercials.netLandedCost || 0) / 10000000).toFixed(2)} Cr)`,
        selectedRfp.status,
        'technical_comparison'
      );
      setAudits(getStoredAuditEvents());
    }
  };

  const handleAddClarification = (clr: RFPClarification) => {
    const updated = [clr, ...clarifications];
    setClarifications(updated);
    saveStoredClarifications(updated);

    if (selectedRfp) {
      logAuditEvent(
        selectedRfp.id,
        currentUser?.name || 'Hospital Procurement Lead',
        'owner',
        'Clarification Query Dispatched',
        `Sent query to ${clr.vendorName}: "${clr.question.slice(0, 60)}..."`,
        selectedRfp.status,
        'clarification'
      );
      setAudits(getStoredAuditEvents());
    }
  };

  const handleUpdateClarification = (clr: RFPClarification) => {
    const updated = clarifications.map(c => c.id === clr.id ? clr : c);
    setClarifications(updated);
    saveStoredClarifications(updated);

    if (selectedRfp) {
      logAuditEvent(
        selectedRfp.id,
        clr.vendorName,
        'vendor',
        'Clarification Response Recorded',
        `Vendor recorded clarification response regarding ${clr.category}. Terms updated in comparison.`,
        selectedRfp.status,
        'technical_comparison'
      );
      setAudits(getStoredAuditEvents());
    }
  };

  const handleAddAdvisorObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObsText.trim() || !selectedRfp) return;

    const newObs: AdvisorObservation = {
      id: `obs-${Date.now()}`,
      rfpId: selectedRfp.id,
      advisorName: currentUser?.name || 'Er. Rajeshwar Murthy',
      organization: 'Macula Healthcare Consulting LLP',
      category: newObsCategory,
      observation: newObsText.trim(),
      recommendation: newObsRec.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    const updated = [newObs, ...observations];
    setObservations(updated);
    saveStoredAdvisorObservations(updated);
    setNewObsText('');
    setNewObsRec('');

    logAuditEvent(
      selectedRfp.id,
      newObs.advisorName,
      'advisor',
      'Advisor Technical Observation Added',
      `Macula Healthcare advisor noted: ${newObs.observation.slice(0, 70)}...`
    );
    setAudits(getStoredAuditEvents());
  };

  const handleConfirmAward = () => {
    if (!selectedRfp || !selectedWinningQuote) return;

    const updatedRfps = rfps.map(r => {
      if (r.id === selectedRfp.id) {
        return {
          ...r,
          status: 'selected' as RFPLifecycleStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    setRfps(updatedRfps);
    saveStoredRFPs(updatedRfps);

    logAuditEvent(
      selectedRfp.id,
      currentUser?.name || 'Hospital Managing Director',
      'owner',
      'RFP Award Decision Executed',
      `Formally awarded procurement contract to ${selectedWinningQuote.vendorName} for Landed Value ₹${((selectedWinningQuote.commercials.netLandedCost || 0) / 10000000).toFixed(2)} Cr. Rationale: ${awardNotes || 'Highest combined technical compliance and warranty value.'}`,
      selectedRfp.status,
      'selected'
    );
    setAudits(getStoredAuditEvents());
    setIsAwardModalOpen(false);
  };

  // Filtered RFPs for directory
  const filteredRfps = rfps.filter(r => {
    const matchesCat = directoryFilterCategory === 'all' || r.category.toLowerCase().includes(directoryFilterCategory.toLowerCase());
    const matchesSearch = !directorySearch.trim() || 
      r.title.toLowerCase().includes(directorySearch.toLowerCase()) || 
      r.rfpNumber.toLowerCase().includes(directorySearch.toLowerCase()) ||
      r.locationCity.toLowerCase().includes(directorySearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      
      {/* Top Banner / Breadcrumb Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              {selectedRfpId ? (
                <button
                  onClick={() => setSelectedRfpId(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>All RFPs</span>
                </button>
              ) : null}

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black tracking-tight text-sm text-blue-400">
                    NOVA-H
                  </span>
                  <span className="text-slate-500">•</span>
                  <h1 className="text-base font-black tracking-tight text-white">
                    Hospital Procurement &amp; RFP Management System
                  </h1>
                </div>
                <p className="text-[11px] text-slate-400">
                  Multi-Channel Sourcing, Offline Quote AI Ingestion, Normalized Comparison &amp; Macula Healthcare Advisory
                </p>
              </div>
            </div>

            {/* User Session & Role Indicator & Global Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {currentUser && (
                <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-semibold text-white">{currentUser.name}</span>
                  <span className="text-slate-500">•</span>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                    effectiveRole === 'vendor'
                      ? 'bg-indigo-900/70 text-indigo-300 border border-indigo-700/60'
                      : effectiveRole === 'advisor'
                      ? 'bg-purple-900/70 text-purple-300 border border-purple-700/60'
                      : 'bg-blue-900/70 text-blue-300 border border-blue-700/60'
                  }`}>
                    {effectiveRole === 'vendor' ? '🏗️ Vendor Partner' : effectiveRole === 'advisor' ? '📋 Biomedical Advisor' : '🏥 Hospital Owner'}
                  </span>
                </div>
              )}

              {/* Create RFP only available to Hospital Owners / Admins */}
              {(effectiveRole === 'owner' || effectiveRole === 'admin') && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create RFP (AI-Guided)</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* VIEW A: RFP DIRECTORY (When no single RFP is selected) */}
      {!selectedRfpId && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          
          {/* Role-Adaptive KPI Strip */}
          {effectiveRole === 'vendor' ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Open Tenders</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">{rfps.length} Packages</div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Eligible for bidding</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">My Quotations</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-700 mt-2">
                  {quotes.filter(q => !q.isExternal).length} Submitted
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Active private bids</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Pre-Bid Q&amp;A</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-purple-700 mt-2">{clarifications.length} Queries</div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Clarifications &amp; Addenda</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Sealed-Bid Integrity</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-indigo-700 mt-2">Protected</div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Competitor bids 100% hidden</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Active RFPs</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">{rfps.length} Packages</div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">CT Scan, MGPS &amp; Modular OT</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Quotes Ingested</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-700 mt-2">{quotes.length} Quotes</div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Online bids + WhatsApp uploads</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Active Clarifications</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-purple-700 mt-2">{clarifications.length} Queries</div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">AI-prompted pre-bid questions</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Advisory Desk</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-700 mt-2">Active</div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Macula Healthcare Biomedical Team</span>
              </div>
            </div>
          )}

          {/* Directory Filter Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="Search by package, equipment, or city..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {['all', 'Biomedical Equipment', 'Engineering / MEP', 'Modular OT & CSSD'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setDirectoryFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap cursor-pointer transition-all ${
                    directoryFilterCategory === cat
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Packages' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* RFPs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRfps.map((rfp) => {
              const qCount = quotes.filter(q => q.rfpId === rfp.id).length;
              return (
                <RfpCard
                  key={rfp.id}
                  rfp={rfp}
                  quotesCount={qCount}
                  onSelect={(r) => setSelectedRfpId(r.id)}
                  onExportPdf={(r) => {
                    setSelectedRfpId(r.id);
                    setIsPrintModalOpen(true);
                  }}
                  userRole={effectiveRole}
                />
              );
            })}
          </div>

        </div>
      )}

      {/* VIEW B: ACTIVE RFP WORKSPACE */}
      {selectedRfp && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          
          {/* RFP Stage Tracker & Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
            
            {/* Top row: Number, Title, Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                    {selectedRfp.rfpNumber}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStageBadge(selectedRfp.status).bg}`}>
                    {getStageBadge(selectedRfp.status).label}
                  </span>
                  {selectedRfp.isIdentityMasked && (
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      <span>Protected Client Identity</span>
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {selectedRfp.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                  <span className="flex items-center gap-1 font-bold text-slate-800">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {selectedRfp.isIdentityMasked ? selectedRfp.maskedHospitalTitle : selectedRfp.hospitalName}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>{selectedRfp.locationCity}, {selectedRfp.locationState}</span>
                  <span className="text-slate-300">•</span>
                  <span>Est. Budget: <strong>{selectedRfp.estimatedBudgetRange}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Quote Deadline: <strong>{selectedRfp.revisedClosingDate || selectedRfp.quoteClosingDate}</strong></span>
                </div>
              </div>

              {/* Top Quick Actions - Filtered by Role */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Upload External Quote only for Owner and Admin */}
                {(effectiveRole === 'owner' || effectiveRole === 'admin') && (
                  <button
                    onClick={() => setIsExternalQuoteModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload External Quote</span>
                  </button>
                )}

                {/* Submit / Revise Bid */}
                {effectiveRole !== 'advisor' && (
                  <button
                    onClick={() => setIsVendorQuoteModalOpen(true)}
                    className={`px-3.5 py-2 rounded-xl text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 ${
                      effectiveRole === 'vendor' 
                        ? 'bg-indigo-600 hover:bg-indigo-700 ring-2 ring-indigo-300 ring-offset-1' 
                        : 'bg-blue-700 hover:bg-blue-800'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>{effectiveRole === 'vendor' && myVendorQuote ? 'Revise Submitted Bid' : 'Submit Vendor Bid'}</span>
                  </button>
                )}

                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  title="Export Dossier / Specification Document"
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Export Spec</span>
                </button>
              </div>
            </div>

            {/* Lifecycle Stages Progression Tracker (BRS Section 4: 12-Stage Lifecycle) */}
            <div className="pt-2 border-t border-slate-100 overflow-x-auto">
              <div className="flex items-center min-w-[750px] justify-between text-xs py-1">
                {LIFECYCLE_STAGES.map((st, idx) => {
                  const currentIdx = LIFECYCLE_STAGES.findIndex(s => s.key === selectedRfp.status);
                  const isPassed = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={st.key} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          isCurrent 
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs' 
                            : isPassed 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}>
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        <span className={`text-[10px] font-bold mt-1 whitespace-nowrap ${
                          isCurrent ? 'text-blue-700' : isPassed ? 'text-slate-800' : 'text-slate-400'
                        }`}>
                          {st.label}
                        </span>
                      </div>

                      {idx < LIFECYCLE_STAGES.length - 1 && (
                        <div className={`h-0.5 flex-1 mx-1.5 ${isPassed ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sub-Navigation Tabs - Dynamically Filtered by User Role */}
          <div className="flex rounded-2xl bg-white border border-slate-200 p-1.5 text-xs overflow-x-auto shadow-2xs">
            {(
              effectiveRole === 'vendor'
                ? [
                    { key: 'my_bid', label: myVendorQuote ? `My Quotation & Status (v${myVendorQuote.version})` : 'Submit Bid Now', icon: FileText },
                    { key: 'specs', label: `Requirements & Scope (${selectedRfp.requirements.length})`, icon: Briefcase },
                    { key: 'clarifications', label: `Pre-Bid Q&A (${rfpClarifications.length})`, icon: Sparkles }
                  ]
                : effectiveRole === 'advisor'
                ? [
                    { key: 'comparison', label: `Comparison Matrix (${rfpQuotes.length})`, icon: Award },
                    { key: 'tco', label: 'TCO Simulator (5y / 10y)', icon: TrendingUp },
                    { key: 'specs', label: `Requirements & Scope (${selectedRfp.requirements.length})`, icon: Briefcase },
                    { key: 'clarifications', label: `Clarifications (${rfpClarifications.length})`, icon: Sparkles },
                    { key: 'advisor', label: `Advisor Desk (${rfpObservations.length})`, icon: ShieldCheck }
                  ]
                : [
                    { key: 'comparison', label: `Comparison Matrix (${rfpQuotes.length})`, icon: Award },
                    { key: 'tco', label: 'TCO Simulator (5y / 10y)', icon: TrendingUp },
                    { key: 'quotes', label: `All Quotes (${rfpQuotes.length})`, icon: FileText },
                    { key: 'clarifications', label: `AI Clarifications (${rfpClarifications.length})`, icon: Sparkles },
                    { key: 'specs', label: `Requirements & Scope (${selectedRfp.requirements.length})`, icon: Briefcase },
                    { key: 'advisor', label: `Advisor Desk (${rfpObservations.length})`, icon: ShieldCheck },
                    { key: 'audit', label: `Audit Log (${rfpAudits.length})`, icon: History }
                  ]
            ).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveWorkspaceTab(tab.key as any)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    activeWorkspaceTab === tab.key
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT */}

          {/* 0. VENDOR PRIVATE BID & SUBMISSION WORKSPACE */}
          {(activeWorkspaceTab === 'my_bid' || effectiveRole === 'vendor') && activeWorkspaceTab !== 'specs' && activeWorkspaceTab !== 'clarifications' && (
            <VendorBidWorkspace
              rfp={selectedRfp}
              myQuote={myVendorQuote}
              onOpenBidModal={() => setIsVendorQuoteModalOpen(true)}
              onOpenClarification={() => setActiveWorkspaceTab('clarifications')}
              onExportPdf={() => setIsPrintModalOpen(true)}
              currentUser={currentUser}
              clarificationsCount={rfpClarifications.length}
            />
          )}

          {/* 1. COMPARISON MATRIX (Restricted to Hospital Owner, Admin & Advisor) */}
          {effectiveRole !== 'vendor' && activeWorkspaceTab === 'comparison' && (
            <ComparisonMatrixView
              rfp={selectedRfp}
              quotes={rfpQuotes}
              onOpenUploadModal={(effectiveRole === 'owner' || effectiveRole === 'admin') ? () => setIsExternalQuoteModalOpen(true) : undefined}
              onOpenClarification={(q) => {
                setActiveWorkspaceTab('clarifications');
              }}
              onSelectWinningQuote={(effectiveRole === 'owner' || effectiveRole === 'admin') ? (q) => {
                setSelectedWinningQuote(q);
                setIsAwardModalOpen(true);
              } : undefined}
            />
          )}

          {/* 2. TCO SIMULATOR */}
          {activeWorkspaceTab === 'tco' && (
            <TcoCalculatorView
              rfp={selectedRfp}
              quotes={rfpQuotes}
            />
          )}

          {/* 3. ALL QUOTES INGESTION DESK */}
          {activeWorkspaceTab === 'quotes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Quotation Ingestion Desk</h3>
                  <p className="text-xs text-slate-500">
                    Online submissions and WhatsApp/Email quotations ingested and verified.
                  </p>
                </div>
                <button
                  onClick={() => setIsExternalQuoteModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Offline Quote</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rfpQuotes.map((q) => (
                  <div key={q.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          q.isExternal ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {q.isExternal ? `Uploaded via ${q.externalSource || 'offline'}` : 'Online Formal Bid'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">Ver. {q.version}</span>
                      </div>

                      <h4 className="text-base font-black text-slate-900">{q.vendorName}</h4>
                      <div className="text-xl font-black text-blue-700 font-mono mt-1">
                        ₹{((q.commercials.netLandedCost || 0) / 10000000).toFixed(2)} Cr
                      </div>
                      <p className="text-[11px] text-slate-500">Landed acquisition estimate</p>

                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span>Warranty:</span>
                          <span className="font-bold text-slate-800">{q.commercials.warrantyYears} Years</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery:</span>
                          <span className="font-bold text-slate-800">{q.commercials.deliveryWeeks} Weeks</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Doc:</span>
                          <span className="font-medium text-slate-500 truncate max-w-[140px]">{q.officialDocumentName || 'proposal.pdf'}</span>
                        </div>
                      </div>

                      {q.aiExtraction && (
                        <div className="mt-3 p-2 bg-purple-50 rounded-lg text-[10px] text-purple-800 border border-purple-200">
                          <strong>AI Extracted:</strong> Confidence {q.aiExtraction.confidenceScore}% • Human Verified Gate Passed
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => setActiveWorkspaceTab('comparison')}
                        className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        Compare
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. AI CLARIFICATIONS */}
          {activeWorkspaceTab === 'clarifications' && (
            <ClarificationCycleView
              rfp={selectedRfp}
              clarifications={rfpClarifications}
              quotes={rfpQuotes}
              onAddClarification={handleAddClarification}
              onUpdateClarification={handleUpdateClarification}
              currentUser={currentUser}
            />
          )}

          {/* 5. REQUIREMENTS & SCOPE */}
          {activeWorkspaceTab === 'specs' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-900">Procurement Specifications &amp; Scope of Work</h3>
                <p className="text-xs text-slate-500">Structured requirement schedule drafted via AI questionnaire.</p>
              </div>

              {/* Scope of work */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Scope of Work Deliverables</h4>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5 pl-1">
                  {selectedRfp.scopeOfWork.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Requirements Schedule */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Technical Requirements</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedRfp.requirements.map(req => (
                    <div key={req.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{req.parameter}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          req.isMandatory ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {req.isMandatory ? 'Mandatory' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-snug">{req.hospitalSpecification}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              {selectedRfp.attachments && selectedRfp.attachments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Attached Drawings &amp; Schedules</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRfp.attachments.map(att => (
                      <div key={att.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-slate-800">{att.name}</span>
                        <span className="text-slate-400 text-[10px]">({att.size})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. ADVISOR REVIEW DESK (Macula Healthcare) */}
          {activeWorkspaceTab === 'advisor' && (
            <div className="space-y-6">
              
              {/* Advisor Assignment & Conflict of Interest Card */}
              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black">
                    MH
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-purple-950">
                      Macula Healthcare Consulting LLP - Biomedical Advisory Desk
                    </h3>
                    <p className="text-xs text-purple-800">
                      Assigned Advisor: <strong>Er. Rajeshwar Murthy</strong> (Principal Biomedical Engineer)
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    ✓ Vendor Neutrality &amp; Conflict Disclosed
                  </span>
                </div>
              </div>

              {/* Recorded Observations */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Advisor Observations &amp; Commercial Negotiation Levers
                </h4>

                <div className="space-y-3">
                  {rfpObservations.map((obs) => (
                    <div key={obs.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{obs.advisorName}</span>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded capitalize">
                          {obs.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed">{obs.observation}</p>
                      {obs.recommendation && (
                        <div className="p-2.5 bg-blue-50/80 rounded-lg text-xs text-blue-900 border border-blue-200 font-medium">
                          <strong>Strategic Recommendation:</strong> {obs.recommendation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Observation Form (for Advisor or Lead) */}
                <form onSubmit={handleAddAdvisorObservation} className="pt-4 border-t border-slate-100 space-y-3">
                  <h5 className="font-bold text-slate-800 text-xs">Add Expert Advisory Note / Negotiation Lever</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-600 text-[11px] block mb-1">Category</label>
                      <select
                        value={newObsCategory}
                        onChange={(e) => setNewObsCategory(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      >
                        <option value="leverage_suggestion">Commercial Negotiation Leverage</option>
                        <option value="technical">Technical Evaluation</option>
                        <option value="commercial_risk">Commercial Risk Analysis</option>
                        <option value="compliance">AERB / Regulatory Compliance</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      required
                      value={newObsText}
                      onChange={(e) => setNewObsText(e.target.value)}
                      placeholder="Enter technical observation or discrepancy found in vendor bids..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={newObsRec}
                      onChange={(e) => setNewObsRec(e.target.value)}
                      placeholder="Actionable negotiation recommendation for hospital committee..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                    >
                      Record Advisory Note
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* 7. AUDIT TRAIL (AUD-FR-01 to 05) */}
          {activeWorkspaceTab === 'audit' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Immutable Audit Trail</h3>
                  <p className="text-xs text-slate-500">
                    BRS Section 11: Chronological record of all actions, actors, state transitions and quote uploads.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {rfpAudits.map((event) => (
                  <div key={event.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                      <History className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="font-bold text-slate-900">{event.action}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-slate-600 mt-0.5 leading-snug">{event.description}</p>
                      
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                        <span>Actor: <strong className="text-slate-700">{event.actorName}</strong> ({event.actorRole})</span>
                        {event.priorState && event.newState && (
                          <span>
                            Transition: <span className="font-mono text-[10px] bg-slate-200 px-1 rounded">{event.priorState}</span> → <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded">{event.newState}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* MODAL 1: AI-GUIDED RFP CREATOR */}
      {isCreateModalOpen && (
        <RfpCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSaveNewRfp}
          currentUser={currentUser}
        />
      )}

      {/* MODAL 2: EXTERNAL QUOTE UPLOAD & AI EXTRACTION */}
      {isExternalQuoteModalOpen && selectedRfp && (
        <ExternalQuoteUploadModal
          isOpen={isExternalQuoteModalOpen}
          onClose={() => setIsExternalQuoteModalOpen(false)}
          rfp={selectedRfp}
          onSaveQuote={handleSaveQuote}
          currentQuotes={rfpQuotes}
        />
      )}

      {/* MODAL 3: ONLINE VENDOR BID FORM */}
      {isVendorQuoteModalOpen && selectedRfp && (
        <QuoteSubmissionModal
          isOpen={isVendorQuoteModalOpen}
          onClose={() => setIsVendorQuoteModalOpen(false)}
          rfp={selectedRfp}
          onSaveQuote={handleSaveQuote}
          currentUser={currentUser}
        />
      )}

      {/* MODAL 4: OFFLINE DOSSIER PRINT / WHATSAPP EXPORT */}
      {isPrintModalOpen && selectedRfp && (
        <RfpDossierPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          rfp={selectedRfp}
        />
      )}

      {/* MODAL 5: FINAL AWARD EXECUTION MODAL */}
      {isAwardModalOpen && selectedWinningQuote && selectedRfp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">Confirm Contract Award</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Execute award decision for <strong>{selectedWinningQuote.vendorName}</strong>
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Landed Amount:</span>
                <span className="font-bold text-slate-900">
                  ₹{((selectedWinningQuote.commercials.netLandedCost || 0) / 10000000).toFixed(2)} Cr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Warranty:</span>
                <span className="font-bold text-slate-900">{selectedWinningQuote.commercials.warrantyYears} Years</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">Award Justification / Notes</label>
              <textarea
                rows={2}
                value={awardNotes}
                onChange={(e) => setAwardNotes(e.target.value)}
                placeholder="Rationale for selection (e.g. Lowest lifecycle TCO with superior 3-year warranty)..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAwardModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAward}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs"
              >
                Execute Award &amp; Log PO
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
