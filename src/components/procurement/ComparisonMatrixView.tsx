import React, { useState, useMemo } from 'react';
import { 
  RFPItem, 
  RFPQuote, 
  RFPClarification,
  AuthUser,
  QuoteCommercials, 
  QuoteTechnicalSpec 
} from '../../types';
import { RequestClarificationModal } from './RequestClarificationModal';
import { 
  X,
  MessageSquare,
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  TrendingDown,
  Clock,
  FileSpreadsheet,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Search,
  Filter,
  Pin,
  PinOff,
  Layers,
  ArrowUpDown,
  CheckSquare,
  Square,
  ExternalLink,
  DollarSign,
  Truck,
  FileText,
  SlidersHorizontal,
  Eye,
  AlertCircle
} from 'lucide-react';

interface ComparisonMatrixViewProps {
  rfp: RFPItem;
  quotes: RFPQuote[];
  onOpenUploadModal?: () => void;
  onOpenClarification?: (quote: RFPQuote) => void;
  onAddClarification?: (clarification: RFPClarification) => void;
  onSelectWinningQuote?: (quote: RFPQuote) => void;
  currentUser?: AuthUser | null;
}

type ComparisonSection = 'all' | 'price' | 'lead_time' | 'specs' | 'deviations_only';

export const ComparisonMatrixView: React.FC<ComparisonMatrixViewProps> = ({
  rfp,
  quotes,
  onOpenUploadModal,
  onOpenClarification,
  onAddClarification,
  onSelectWinningQuote,
  currentUser
}) => {
  // Pinned quotes selection (maximum 4 simultaneously side-by-side)
  const [pinnedQuoteIds, setPinnedQuoteIds] = useState<string[]>(() => 
    quotes.slice(0, 4).map(q => q.id)
  );

  const [activeSection, setActiveSection] = useState<ComparisonSection>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const [selectedQuoteForAward, setSelectedQuoteForAward] = useState<string | null>(null);
  
  // Request Clarification Modal State
  const [isClarificationModalOpen, setIsClarificationModalOpen] = useState(false);
  const [clarificationTargetQuote, setClarificationTargetQuote] = useState<RFPQuote | null>(null);
  const [clarificationInitialParam, setClarificationInitialParam] = useState<string | undefined>(undefined);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    commercial: true,
    logistics: true,
    technical: true,
    statutory: true
  });

  // Keep pinned quotes in sync if quotes prop updates
  const activeQuotes = useMemo(() => {
    const pinned = quotes.filter(q => pinnedQuoteIds.includes(q.id));
    if (pinned.length === 0 && quotes.length > 0) {
      return quotes.slice(0, 4);
    }
    return pinned;
  }, [quotes, pinnedQuoteIds]);

  const togglePinQuote = (quoteId: string) => {
    if (pinnedQuoteIds.includes(quoteId)) {
      if (pinnedQuoteIds.length === 1) return; // Keep at least one pinned
      setPinnedQuoteIds(prev => prev.filter(id => id !== quoteId));
    } else {
      if (pinnedQuoteIds.length >= 4) {
        // Replace the last one or prevent
        setPinnedQuoteIds(prev => [...prev.slice(0, 3), quoteId]);
      } else {
        setPinnedQuoteIds(prev => [...prev, quoteId]);
      }
    }
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Best-in-Class Metrics across all available quotes
  const metrics = useMemo(() => {
    let lowestLanded = Infinity;
    let lowestLandedQuoteId = '';
    let maxWarranty = 0;
    let maxWarrantyQuoteId = '';
    let minDelivery = Infinity;
    let minDeliveryQuoteId = '';

    quotes.forEach(q => {
      const landed = q.commercials.netLandedCost || q.commercials.basePrice;
      if (landed < lowestLanded) {
        lowestLanded = landed;
        lowestLandedQuoteId = q.id;
      }
      if ((q.commercials.warrantyYears || 0) > maxWarranty) {
        maxWarranty = q.commercials.warrantyYears || 0;
        maxWarrantyQuoteId = q.id;
      }
      if ((q.commercials.deliveryWeeks || Infinity) < minDelivery) {
        minDelivery = q.commercials.deliveryWeeks || Infinity;
        minDeliveryQuoteId = q.id;
      }
    });

    return {
      lowestLanded,
      lowestLandedQuoteId,
      maxWarranty,
      maxWarrantyQuoteId,
      minDelivery,
      minDeliveryQuoteId
    };
  }, [quotes]);

  // Filtered technical requirements
  const filteredRequirements = useMemo(() => {
    return rfp.requirements.filter(req => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesParam = req.parameter.toLowerCase().includes(q);
        const matchesSpec = req.hospitalSpecification.toLowerCase().includes(q);
        const matchesCategory = req.category.toLowerCase().includes(q);
        if (!matchesParam && !matchesSpec && !matchesCategory) return false;
      }

      // 2. Deviations Only filter
      if (activeSection === 'deviations_only') {
        const hasDeviation = activeQuotes.some(quote => {
          const spec = quote.technicalSpecs.find(s => s.reqId === req.id || s.parameter === req.parameter);
          return spec && spec.compliance !== 'compliant';
        });
        if (!hasDeviation) return false;
      }

      // 3. Show Differences Only filter
      if (showDifferencesOnly && activeQuotes.length > 1) {
        const values = activeQuotes.map(quote => {
          const spec = quote.technicalSpecs.find(s => s.reqId === req.id || s.parameter === req.parameter);
          return `${spec?.compliance || 'compliant'}:${spec?.offeredValue || ''}`;
        });
        const allSame = values.every(v => v === values[0]);
        if (allSame) return false;
      }

      return true;
    });
  }, [rfp.requirements, activeQuotes, searchQuery, activeSection, showDifferencesOnly]);

  const totalDeviationsCount = useMemo(() => {
    let count = 0;
    rfp.requirements.forEach(req => {
      const hasDeviation = quotes.some(quote => {
        const spec = quote.technicalSpecs.find(s => s.reqId === req.id || s.parameter === req.parameter);
        return spec && spec.compliance !== 'compliant';
      });
      if (hasDeviation) count++;
    });
    return count;
  }, [rfp.requirements, quotes]);

  const handleExportCsv = () => {
    const headers = ['Parameter Category', 'Parameter / Requirement Specification', ...activeQuotes.map(q => `${q.vendorName} (${q.isExternal ? 'Offline Upload' : 'Online'})`)];
    
    const rows: string[][] = [
      ['Commercials', 'Net Landed Acquisition Cost (INR)', ...activeQuotes.map(q => (q.commercials.netLandedCost || 0).toString())],
      ['Commercials', 'Price Variance vs L1', ...activeQuotes.map(q => {
        const landed = q.commercials.netLandedCost || q.commercials.basePrice;
        if (q.id === metrics.lowestLandedQuoteId) return 'Lowest (L1)';
        const diff = landed - metrics.lowestLanded;
        const pct = ((diff / metrics.lowestLanded) * 100).toFixed(1);
        return `+${pct}% (+₹${(diff / 100000).toFixed(2)} L)`;
      })],
      ['Commercials', 'Base Machine Price (INR)', ...activeQuotes.map(q => q.commercials.basePrice.toString())],
      ['Commercials', 'GST Rate & Amount', ...activeQuotes.map(q => `${q.commercials.gstRatePercent}% (₹${q.commercials.gstAmount})`)],
      ['Commercials', 'Freight & Rigging (INR)', ...activeQuotes.map(q => q.commercials.freightAmount.toString())],
      ['Commercials', 'Installation & Commissioning (INR)', ...activeQuotes.map(q => q.commercials.installationAmount.toString())],
      ['Commercials', 'Accessories Included (INR)', ...activeQuotes.map(q => (q.commercials.accessoriesAmount || 0).toString())],
      ['Logistics & SLA', 'Delivery Lead Time (Weeks)', ...activeQuotes.map(q => `${q.commercials.deliveryWeeks || '-'} Weeks`)],
      ['Logistics & SLA', 'Comprehensive Warranty (Years)', ...activeQuotes.map(q => `${q.commercials.warrantyYears || 0} Years`)],
      ['Logistics & SLA', 'Post-Warranty Annual CMC Rate (%)', ...activeQuotes.map(q => `${q.commercials.cmcAnnualPercent || 0}%`)],
      ['Logistics & SLA', 'Uptime Commitment SLA (%)', ...activeQuotes.map(q => `${q.commercials.uptimeCommitmentPercent || 98}%`)],
      ['Commercials', 'Payment Terms', ...activeQuotes.map(q => `"${q.commercials.paymentTerms || '-'}"`)]
    ];

    // Append technical specifications
    filteredRequirements.forEach(req => {
      const specRow = [
        req.category,
        `${req.parameter} [${req.hospitalSpecification}]`,
        ...activeQuotes.map(q => {
          const match = q.technicalSpecs.find(s => s.reqId === req.id || s.parameter === req.parameter);
          return `"${match?.compliance || 'compliant'}: ${match?.offeredValue || 'Standard'}"`;
        })
      ];
      rows.push(specRow);
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${rfp.rfpNumber}_Side_By_Side_Quote_Comparison.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (quotes.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
          <Award className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Quotations Available for Comparison</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1.5 mb-5">
          Competing quotes will populate automatically when registered medtech vendors submit bids online or when hospital owners digitize offline WhatsApp/Email quotes.
        </p>
        {onOpenUploadModal && (
          <button
            onClick={onOpenUploadModal}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upload &amp; Digitize External Quote</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      
      {/* 1. TOP HEADER & VENDOR PINNING STRIP */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-4">
        
        {/* Top Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Side-by-Side Quote Comparison Board
              </h3>
              <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-bold text-xs rounded-full">
                {activeQuotes.length} Pinned of {quotes.length} Offers
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Normalized evaluation of competing vendor quotes across price, delivery lead time, and technical BoQ compliance.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleExportCsv}
              title="Download normalized comparison table as CSV"
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV Matrix</span>
            </button>

            {onOpenUploadModal && (
              <button
                onClick={onOpenUploadModal}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>+ Add Quote</span>
              </button>
            )}
          </div>
        </div>

        {/* Vendor Selector & Pinning Bar */}
        <div className="bg-white dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            <Pin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Select Pinned Competitors (Max 4):</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {quotes.map(q => {
              const isPinned = pinnedQuoteIds.includes(q.id);
              const isL1 = q.id === metrics.lowestLandedQuoteId;
              const isFastest = q.id === metrics.minDeliveryQuoteId;
              const landed = q.commercials.netLandedCost || q.commercials.basePrice;

              return (
                <button
                  key={q.id}
                  onClick={() => togglePinQuote(q.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                    isPinned
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 font-bold shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  {isPinned ? (
                    <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}

                  <span className="truncate max-w-[120px]">{q.vendorName}</span>

                  <span className="font-mono text-[11px] opacity-80">
                    ₹{(landed / 10000000).toFixed(2)} Cr
                  </span>

                  {isL1 && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      L1
                    </span>
                  )}
                  {isFastest && !isL1 && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                      Fastest
                    </span>
                  )}
                </button>
              );
            })}

            {quotes.length > 4 && (
              <button
                onClick={() => setPinnedQuoteIds(quotes.slice(0, 4).map(q => q.id))}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline px-2 cursor-pointer font-bold"
              >
                Reset Top 4
              </button>
            )}
          </div>
        </div>

        {/* 2. SECTION FILTERS & SEARCH BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          {/* Section Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveSection('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSection === 'all'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Parameters
            </button>
            <button
              onClick={() => setActiveSection('price')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'price'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Price &amp; Commercials</span>
            </button>
            <button
              onClick={() => setActiveSection('lead_time')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'lead_time'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Lead Time &amp; SLA</span>
            </button>
            <button
              onClick={() => setActiveSection('specs')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'specs'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Technical Specs</span>
            </button>
            <button
              onClick={() => setActiveSection('deviations_only')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'deviations_only'
                  ? 'bg-amber-500 text-white shadow-2xs font-black'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-950/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Deviations Only ({totalDeviationsCount})</span>
            </button>
          </div>

          {/* Quick Search & Difference Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search specs or parameters..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ×
                </button>
              )}
            </div>

            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showDifferencesOnly}
                onChange={e => setShowDifferencesOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>Diffs Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. NORMALIZATION & DEVIATIONS ALERT CALLOUT */}
      {totalDeviationsCount > 0 && activeSection !== 'price' && activeSection !== 'lead_time' && (
        <div className="px-5 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{totalDeviationsCount} Technical Variance Notice:</strong> One or more competing vendors declared non-compliance, scope exclusion, or parameter deviations against the hospital BoQ.
            </span>
          </div>
          {activeSection !== 'deviations_only' && (
            <button
              onClick={() => setActiveSection('deviations_only')}
              className="px-2.5 py-1 bg-amber-200/70 hover:bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 rounded-lg text-[11px] font-bold cursor-pointer shrink-0 transition-colors"
            >
              Isolate Deviations
            </button>
          )}
        </div>
      )}

      {/* 4. UNIFIED COMPARISON MATRIX TABLE (STICKY PARAMETERS) */}
      <div className="overflow-x-auto relative">
        <table className="w-full text-xs text-left border-collapse min-w-[850px]">
          
          {/* TABLE HEADER (VENDOR COLUMNS) */}
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 sticky top-0 z-30">
              
              {/* STICKY TOP-LEFT CELL */}
              <th className="p-4 font-black w-[280px] min-w-[280px] sticky left-0 z-40 bg-slate-100 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-700 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Evaluation Dimension
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">
                    {activeQuotes.length} Columns
                  </span>
                </div>
              </th>

              {/* VENDOR HEADER COLUMNS */}
              {activeQuotes.map(q => {
                const isL1 = q.id === metrics.lowestLandedQuoteId;
                const isFastest = q.id === metrics.minDeliveryQuoteId;
                const landed = q.commercials.netLandedCost || q.commercials.basePrice;
                const diffFromL1 = landed - metrics.lowestLanded;
                const pctFromL1 = metrics.lowestLanded > 0 ? ((diffFromL1 / metrics.lowestLanded) * 100).toFixed(1) : '0.0';

                return (
                  <th 
                    key={q.id} 
                    className={`p-4 border-l border-slate-200 dark:border-slate-800 min-w-[220px] max-w-[280px] align-top transition-colors ${
                      isL1 ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          q.isExternal 
                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300' 
                            : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                        }`}>
                          {q.isExternal ? `Uploaded (${q.externalSource || 'offline'})` : 'NOVA-H Online'}
                        </span>

                        {isL1 && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-black bg-emerald-600 text-white shadow-2xs">
                            L1 Lowest
                          </span>
                        )}
                      </div>

                      {/* Vendor & Company Name */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate" title={q.vendorName}>
                          {q.vendorName}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {q.vendorCompany || 'Authorized Medical Distributor'}
                        </p>
                      </div>

                      {/* Primary Net Landed Highlight */}
                      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                        <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                          ₹{(landed / 10000000).toFixed(2)} Cr
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {isL1 ? (
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                              <Check className="w-3 h-3" />
                              Best Landed Price
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 font-mono">
                              +{pctFromL1}% (+₹{(diffFromL1 / 100000).toFixed(1)} L)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Triggers in Header */}
                      <div className="pt-2 flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setClarificationTargetQuote(q);
                            setClarificationInitialParam(undefined);
                            setIsClarificationModalOpen(true);
                          }}
                          title="Send direct clarification message to this vendor"
                          className="flex-1 py-1.5 px-2 rounded-lg bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[11px] cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Request Clarification</span>
                        </button>

                        {onSelectWinningQuote && (
                          <button
                            onClick={() => onSelectWinningQuote(q)}
                            title="Shortlist or award contract to this quotation"
                            className="py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
                          >
                            <Award className="w-3 h-3" />
                            <span>Award</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            
            {/* ======================================================================= */}
            {/* SECTION 1: PRICE & COMMERCIALS */}
            {/* ======================================================================= */}
            {(activeSection === 'all' || activeSection === 'price') && (
              <>
                {/* Section Header Row */}
                <tr className="bg-slate-200/70 dark:bg-slate-800/80 font-bold">
                  <td 
                    colSpan={activeQuotes.length + 1}
                    className="p-3 text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider sticky left-0 z-20 cursor-pointer select-none"
                    onClick={() => toggleSection('commercial')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>1. Commercial &amp; Price Breakdown (Normalized)</span>
                      </span>
                      {expandedSections.commercial ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </td>
                </tr>

                {expandedSections.commercial && (
                  <>
                    {/* Landed Cost Row */}
                    <tr className="bg-blue-50/40 dark:bg-blue-950/20 font-bold">
                      <td className="p-3.5 sticky left-0 z-20 bg-blue-50/90 dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <TrendingDown className="w-4 h-4 text-blue-600" />
                          <span>Net Landed Acquisition Cost</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal">
                          All-inclusive to hospital site (Base + Taxes + Logistics)
                        </span>
                      </td>
                      {activeQuotes.map(q => {
                        const isL1 = q.id === metrics.lowestLandedQuoteId;
                        const landed = q.commercials.netLandedCost || q.commercials.basePrice;
                        return (
                          <td key={q.id} className={`p-3.5 border-l border-slate-200 dark:border-slate-800 font-mono ${isL1 ? 'bg-emerald-50/60 dark:bg-emerald-950/30' : ''}`}>
                            <div className="text-base font-black text-slate-900 dark:text-white">
                              ₹{(landed / 10000000).toFixed(2)} Cr
                            </div>
                            <div className="text-[10px] text-slate-500">
                              ₹{landed.toLocaleString('en-IN')}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Base Machine Price */}
                    <tr>
                      <td className="p-3.5 sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Machine Base Price</span>
                        <span className="text-[10px] text-slate-400 block font-normal">Ex-factory standard configuration</span>
                      </td>
                      {activeQuotes.map(q => (
                        <td key={q.id} className="p-3.5 border-l border-slate-200 dark:border-slate-800 font-mono">
                          ₹{(q.commercials.basePrice / 100000).toFixed(2)} Lakhs
                        </td>
                      ))}
                    </tr>

                    {/* GST Taxes */}
                    <tr>
                      <td className="p-3.5 sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">GST / Tax Applicable</span>
                        <span className="text-[10px] text-slate-400 block font-normal">Statutory tax schedule rate</span>
                      </td>
                      {activeQuotes.map(q => (
                        <td key={q.id} className="p-3.5 border-l border-slate-200 dark:border-slate-800 font-mono">
                          {q.commercials.gstRatePercent}% (₹{(q.commercials.gstAmount / 100000).toFixed(2)} L)
                        </td>
                      ))}
                    </tr>

                    {/* Freight & Rigging */}
                    <tr>
                      <td className="p-3.5 sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Freight, Transit &amp; Rigging</span>
                        <span className="text-[10px] text-slate-400 block font-normal">Transit insurance, cranes &amp; uncrating</span>
                      </td>
                      {activeQuotes.map(q => (
                        <td key={q.id} className="p-3.5 border-l border-slate-200 dark:border-slate-800 font-mono">
                          ₹{(q.commercials.freightAmount / 1000).toFixed(0)}k
                        </td>
                      ))}
                    </tr>

                    {/* Installation & Commissioning */}
                    <tr>
                      <td className="p-3.5 sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Installation &amp; Commissioning</span>
                        <span className="text-[10px] text-slate-400 block font-normal">Site engineers &amp; calibration</span>
                      </td>
                      {activeQuotes.map(q => (
                        <td key={q.id} className="p-3.5 border-l border-slate-200 dark:border-slate-800 font-mono">
                          ₹{(q.commercials.installationAmount / 1000).toFixed(0)}k
                        </td>
                      ))}
                    </tr>

                    {/* Auxiliaries / Accessories */}
                    <tr>
                      <td className="p-3.5 sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Accessories / Auxiliaries Included</span>
                        <span className="text-[10px] text-slate-400 block font-normal">(UPS, Contrast Injector, Lead Shielding)</span>
                      </td>
                      {activeQuotes.map(q => (
                        <td key={q.id} className="p-3.5 border-l border-slate-200 dark:border-slate-800 font-mono">
                          ₹{(q.commercials.accessoriesAmount / 100000).toFixed(2)} Lakhs
                        </td>
                      ))}
                    </tr>

                    {/* Payment Terms */}
                    <tr>
                      <td className="p-3.5 sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Payment Terms &amp; Milestones</span>
                        <span className="text-[10px] text-slate-400 block font-normal">Advance / LC / Handover balance</span>
                      </td>
                      {activeQuotes.map(q => (
                        <td key={q.id} className="p-3.5 border-l border-slate-200 dark:border-slate-800 text-[11px] leading-relaxed">
                          {q.commercials.paymentTerms}
                        </td>
                      ))}
                    </tr>
                  </>
                )}
              </>
            )}

            {/* ======================================================================= */}
            {/* SECTION 2: LEAD TIME, LOGISTICS & SERVICE SLA */}
            {/* ======================================================================= */}
            {(activeSection === 'all' || activeSection === 'lead_time') && (
              <>
                <tr className="bg-slate-200/70 dark:bg-slate-800/80 font-bold">
                  <td 
                    colSpan={activeQuotes.length + 1}
                    className="p-3 text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider sticky left-0 z-20 cursor-pointer select-none"
                    onClick={() => toggleSection('logistics')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>2. Delivery Lead Time, Warranty &amp; Service SLAs</span>
                      </span>
                      {expandedSections.logistics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </td>
                </tr>

                {expandedSections.logistics && (
                  <>
                    {/* Delivery Lead Time */}
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                      <td className="p-3.5 sticky left-0 z-20 bg-slate-50/90 dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>Delivery Lead Time</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal">
                          Dispatched and delivered to hospital site
                        </span>
                      </td>
                      {activeQuotes.map(q => {
                        const isFastest = q.id === metrics.minDeliveryQuoteId;
                        const deltaWeeks = (q.commercials.deliveryWeeks || 0) - metrics.minDelivery;

                        return (
                          <td key={q.id} className={`p-3.5 border-l border-slate-200 dark:border-slate-800 ${isFastest ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                {q.commercials.deliveryWeeks} Weeks
                              </span>
                              {isFastest ? (
                                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-black px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-700">
                                  Fastest
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  (+{deltaWeeks} wks)
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Warranty */}
                    <tr>
                      <td className="p-3.5 sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Comprehensive Warranty</span>
                        <span className="text-[10px] text-slate-400 block font-normal">All parts, tube, labor &amp; software</span>
                      </td>
                      {activeQuotes.map(q => {
                        const isLongest = q.id === metrics.maxWarrantyQuoteId;
                        return (
                          <td key={q.id} className="p-3.5 border-l border-slate-200 dark:border-slate-800 font-bold">
                            <span className="text-slate-900 dark:text-white">{q.commercials.warrantyYears} Years</span>
                            {isLongest && (
                              <span className="ml-1.5 text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                                Longest
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Post-Warranty CMC Rate */}
                    <tr>
                      <td className="p-3.5 sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Post-Warranty Annual CMC Rate</span>
                        <span className="text-[10px] text-slate-400 block font-normal">% of base price per annum</span>
                      </td>
                      {activeQuotes.map(q => (
                        <td key={q.id} className="p-3.5 border-l border-slate-200 dark:border-slate-800 font-mono">
                          {q.commercials.cmcAnnualPercent}% (approx. ₹{(q.commercials.cmcAnnualAmount / 100000).toFixed(2)} L/yr)
                        </td>
                      ))}
                    </tr>

                    {/* Uptime Commitment SLA */}
                    <tr>
                      <td className="p-3.5 sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Guaranteed Uptime Commitment</span>
                        <span className="text-[10px] text-slate-400 block font-normal">Penalty-backed operational SLA</span>
                      </td>
                      {activeQuotes.map(q => (
                        <td key={q.id} className="p-3.5 border-l border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                          {q.commercials.uptimeCommitmentPercent || 98.0}% Uptime
                        </td>
                      ))}
                    </tr>
                  </>
                )}
              </>
            )}

            {/* ======================================================================= */}
            {/* SECTION 3: TECHNICAL SPECIFICATIONS (BoQ LINE-BY-LINE) */}
            {/* ======================================================================= */}
            {(activeSection === 'all' || activeSection === 'specs' || activeSection === 'deviations_only') && (
              <>
                <tr className="bg-slate-200/70 dark:bg-slate-800/80 font-bold">
                  <td 
                    colSpan={activeQuotes.length + 1}
                    className="p-3 text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider sticky left-0 z-20 cursor-pointer select-none"
                    onClick={() => toggleSection('technical')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>3. Technical Specifications &amp; Compliance Matrix ({filteredRequirements.length} Items)</span>
                      </span>
                      {expandedSections.technical ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </td>
                </tr>

                {expandedSections.technical && filteredRequirements.map(req => {
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      
                      {/* STICKY HOSPITAL REQUIREMENT */}
                      <td className="p-3.5 sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700 align-top">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {req.parameter}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                          {req.hospitalSpecification}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                            req.isMandatory 
                              ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {req.isMandatory ? 'Mandatory' : 'Optional'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {req.category}
                          </span>
                        </div>
                      </td>

                      {/* VENDOR SPECIFICATION OFFERS */}
                      {activeQuotes.map(q => {
                        const match = q.technicalSpecs.find(s => s.reqId === req.id || s.parameter === req.parameter);
                        const compliance = match?.compliance || 'compliant';

                        return (
                          <td key={q.id} className="p-3.5 border-l border-slate-200 dark:border-slate-800 align-top">
                            {/* Compliance Status Badge */}
                            <div className="flex items-center gap-1.5 mb-1.5">
                              {compliance === 'compliant' && (
                                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>Compliant</span>
                                </span>
                              )}

                              {compliance === 'deviation' && (
                                <span className="flex items-center gap-1 text-[10px] font-black text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-700">
                                  <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  <span>Deviation</span>
                                </span>
                              )}

                              {compliance === 'partial' && (
                                <span className="flex items-center gap-1 text-[10px] font-black text-purple-900 dark:text-purple-100 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-300 dark:border-purple-700">
                                  <Info className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                  <span>Partial</span>
                                </span>
                              )}

                              {compliance === 'excluded' && (
                                <span className="flex items-center gap-1 text-[10px] font-black text-red-900 dark:text-red-100 bg-red-100 dark:bg-red-950/80 px-2 py-0.5 rounded-md border border-red-300 dark:border-red-700">
                                  <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                                  <span>Excluded</span>
                                </span>
                              )}

                              {match?.sourceDocPage && (
                                <span className="text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded">
                                  {match.sourceDocPage}
                                </span>
                              )}

                              {/* Inline Request Clarification Button */}
                              <button
                                onClick={() => {
                                  setClarificationTargetQuote(q);
                                  setClarificationInitialParam(req.parameter);
                                  setIsClarificationModalOpen(true);
                                }}
                                title={`Clarify ${req.parameter} with ${q.vendorName}`}
                                className="ml-auto p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer transition-colors"
                              >
                                <MessageSquare className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Offered Value */}
                            <p className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                              {match?.offeredValue || 'Specification offered as per OEM standard catalog'}
                            </p>

                            {/* OEM Clarification or Notes */}
                            {match?.notes && (
                              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 italic bg-amber-50/70 dark:bg-amber-950/30 p-1.5 rounded-md border border-amber-200/60 dark:border-amber-900/40">
                                Note: {match.notes}
                              </p>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Stated Deviations & Customer Scope */}
                {expandedSections.technical && (
                  <tr className="bg-slate-50 dark:bg-slate-800/40">
                    <td className="p-3.5 sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white align-top">
                      <span>Declared Deviations &amp; Customer Scope</span>
                      <span className="text-[10px] text-slate-400 block font-normal">Customer site preparation responsibilities</span>
                    </td>
                    {activeQuotes.map(q => (
                      <td key={q.id} className="p-3.5 border-l border-slate-200 dark:border-slate-800 align-top">
                        {q.deviationsAndExclusions && q.deviationsAndExclusions.length > 0 ? (
                          <ul className="list-disc list-inside text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                            {q.deviationsAndExclusions.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">None stated in bid document</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}
              </>
            )}

            {/* ======================================================================= */}
            {/* SECTION 4: STATUTORY & QUALITY CERTIFICATIONS */}
            {/* ======================================================================= */}
            {(activeSection === 'all' || activeSection === 'specs') && (
              <>
                <tr className="bg-slate-200/70 dark:bg-slate-800/80 font-bold">
                  <td 
                    colSpan={activeQuotes.length + 1}
                    className="p-3 text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider sticky left-0 z-20 cursor-pointer select-none"
                    onClick={() => toggleSection('statutory')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>4. Statutory Approvals &amp; Compliance Standards</span>
                      </span>
                      {expandedSections.statutory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </td>
                </tr>

                {expandedSections.statutory && (
                  <tr>
                    <td className="p-3.5 sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Statutory &amp; Quality Certifications</span>
                      <span className="text-[10px] text-slate-400 block font-normal">AERB, CE, US FDA, ISO standards</span>
                    </td>
                    {activeQuotes.map(q => (
                      <td key={q.id} className="p-3.5 border-l border-slate-200 dark:border-slate-800">
                        <div className="flex flex-wrap gap-1">
                          {q.statutoryCertifications && q.statutoryCertifications.length > 0 ? (
                            q.statutoryCertifications.map((c, i) => (
                              <span key={i} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Pending verification</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                )}
              </>
            )}

          </tbody>
        </table>
      </div>

      {/* 5. SUMMARY FOOTER CARDS */}
      <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-bold text-slate-900 dark:text-white">Legends:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Compliant</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Deviation</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>Partial</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>Excluded</span>
          </span>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Comparing <strong>{activeQuotes.length}</strong> quotes across <strong>{filteredRequirements.length}</strong> technical specifications.
        </div>
      </div>

      {/* Floating or Top Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-xl flex items-center gap-3 text-xs max-w-md animate-in slide-in-from-bottom-3 duration-200 border border-slate-800 dark:border-slate-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Clarification Sent</p>
            <p className="opacity-80 text-[11px] mt-0.5">{toastNotification}</p>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="p-1 text-slate-400 hover:text-white dark:hover:text-slate-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Request Clarification Modal */}
      <RequestClarificationModal
        isOpen={isClarificationModalOpen}
        onClose={() => {
          setIsClarificationModalOpen(false);
          setClarificationTargetQuote(null);
        }}
        rfp={rfp}
        targetQuote={clarificationTargetQuote}
        initialParameter={clarificationInitialParam}
        currentUser={currentUser}
        onSubmitClarification={(clarification) => {
          if (onAddClarification) {
            onAddClarification(clarification);
          }
          setToastNotification(`Inquiry dispatched to ${clarification.vendorName} regarding "${clarification.parameterName || 'Quote Specifications'}".`);
          setTimeout(() => setToastNotification(null), 5000);
        }}
      />
    </div>
  );
};
