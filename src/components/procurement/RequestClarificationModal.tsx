import React, { useState, useEffect } from 'react';
import { 
  RFPItem, 
  RFPQuote, 
  RFPClarification, 
  AuthUser 
} from '../../types';
import { 
  X, 
  Send, 
  Sparkles, 
  MessageSquare, 
  Building2, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  DollarSign, 
  Truck, 
  ShieldCheck, 
  Layers, 
  FileText 
} from 'lucide-react';

interface RequestClarificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfp: RFPItem;
  targetQuote: RFPQuote | null;
  initialParameter?: string;
  currentUser?: AuthUser | null;
  onSubmitClarification: (clarification: RFPClarification) => void;
}

export const RequestClarificationModal: React.FC<RequestClarificationModalProps> = ({
  isOpen,
  onClose,
  rfp,
  targetQuote,
  initialParameter,
  currentUser,
  onSubmitClarification
}) => {
  const [selectedParameter, setSelectedParameter] = useState<string>('');
  const [category, setCategory] = useState<RFPClarification['category']>('technical');
  const [questionText, setQuestionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize or update parameter selection when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialParameter) {
        setSelectedParameter(initialParameter);
        // Guess category from parameter name
        const lower = initialParameter.toLowerCase();
        if (lower.includes('price') || lower.includes('cost') || lower.includes('gst') || lower.includes('payment')) {
          setCategory('commercial');
        } else if (lower.includes('warranty') || lower.includes('tube')) {
          setCategory('warranty');
        } else if (lower.includes('delivery') || lower.includes('lead') || lower.includes('freight')) {
          setCategory('delivery');
        } else if (lower.includes('cmc') || lower.includes('amc') || lower.includes('maintenance')) {
          setCategory('amc');
        } else {
          setCategory('technical');
        }
      } else {
        setSelectedParameter(rfp.requirements[0]?.parameter || 'General Technical Scope');
        setCategory('technical');
      }
      setQuestionText('');
      setError(null);
    }
  }, [isOpen, initialParameter, rfp.requirements]);

  if (!isOpen || !targetQuote) return null;

  // Commercial parameters catalogue
  const commercialParameters = [
    'Net Landed Acquisition Cost Reconciliation',
    'Machine Base Price & Commercial Discounts',
    'GST / Tax Schedule Rate Verification',
    'Freight, Rigging & Transit Insurance Scope',
    'Installation & Commissioning Engineering',
    'Auxiliaries & Accessories (UPS, Contrast Injector, Lead Shielding)',
    'Comprehensive Warranty Terms & Coverage Capping',
    'Post-Warranty Annual CMC / AMC Rate Escalation',
    'Delivery Lead Time & Shipment Origin Contingencies',
    'Guaranteed Uptime Commitment SLA (98%+)',
    'Payment Milestones & Credit Handover Terms'
  ];

  // Dynamic AI prompt suggestions tailored to category and vendor
  const aiPromptSuggestions = [
    {
      title: 'X-ray Tube Full Warranty Confirmation',
      category: 'warranty' as const,
      text: `Regarding our CT Scanner tender: Your quote commitments state standard warranty. Please confirm in writing whether the high-heat capacity X-ray tube and solid-state detectors are covered 100% without pro-rata scan-second capping for the full warranty period.`
    },
    {
      title: 'Upgrade Package for Dual-Head Contrast Injector',
      category: 'technical' as const,
      text: `Schedule A of RFP ${rfp.rfpNumber} specifies a ceiling-suspended dual-head automated contrast pressure injector as mandatory. Your quotation offered a single-head unit. Please confirm package pricing to upgrade to the compliant dual-head specification.`
    },
    {
      title: 'CMC Escalation Cap (Years 6-10)',
      category: 'commercial' as const,
      text: `Please confirm whether the post-warranty Comprehensive Maintenance Contract (CMC) rate escalates with a defined index cap (e.g. max 5% annually) or remains fixed at your quoted percentage of machine base price.`
    },
    {
      title: 'Delivery Transit Readiness & Delay Penalty',
      category: 'delivery' as const,
      text: `Hospital site readiness and radiation shielding construction will conclude in 8 weeks. Please confirm factory dispatch schedule, shipping port of origin, and acceptance of the standard 0.5% per week liquidated damages clause for unexcused delays.`
    }
  ];

  const handleApplyAiPrompt = (promptText: string, promptCat: RFPClarification['category']) => {
    setQuestionText(promptText);
    setCategory(promptCat);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setError('Please enter your clarification question before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Matching requirement item ID if applicable
    const matchedReq = rfp.requirements.find(r => r.parameter === selectedParameter);

    const newClarification: RFPClarification = {
      id: `clar-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      rfpId: rfp.id,
      quoteId: targetQuote.id,
      vendorName: targetQuote.vendorName,
      lineItemId: matchedReq?.id,
      parameterName: selectedParameter,
      category,
      question: questionText.trim(),
      askedBy: currentUser?.name ? `${currentUser.name} (${currentUser.role.toUpperCase()})` : 'Hospital Procurement Team',
      askedAt: new Date().toISOString(),
      status: 'open',
      isAiDrafted: questionText.includes('AI Prompt') || questionText.includes('Regarding our'),
      revisionResulted: false,
      whatsappStatus: notifyWhatsapp ? 'sent' : 'queued',
      emailStatus: notifyEmail ? 'sent' : 'queued'
    };

    setTimeout(() => {
      onSubmitClarification(newClarification);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Request Vendor Clarification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct structured query to vendor regarding specific quote parameters or BoQ specifications
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Target Vendor Context Card */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-950 dark:text-blue-200">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-bold">{targetQuote.vendorName}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                  {targetQuote.isExternal ? 'Offline Upload' : 'Online Bid'}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{targetQuote.contactEmail || 'sales-bid@medtech.com'}</span>
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Quoted Net Landed Cost</span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                ₹{((targetQuote.commercials.netLandedCost || targetQuote.commercials.basePrice) / 10000000).toFixed(2)} Cr
              </span>
            </div>
          </div>

          {/* Line Item / Parameter Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Target Line Item / Specification Parameter
            </label>
            <select
              value={selectedParameter}
              onChange={e => setSelectedParameter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-blue-500"
            >
              <optgroup label="Hospital BoQ Requirements">
                {rfp.requirements.map(req => (
                  <option key={req.id} value={req.parameter}>
                    {req.parameter} ({req.hospitalSpecification})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Commercial &amp; Financial Line Items">
                {commercialParameters.map((param, idx) => (
                  <option key={idx} value={param}>
                    {param}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other">
                <option value="General Scope &amp; Commercial Alignment">
                  General Scope &amp; Commercial Alignment
                </option>
              </optgroup>
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              The query will be explicitly anchored to this parameter in the comparison audit log.
            </p>
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Clarification Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'technical', label: 'Technical' },
                { id: 'commercial', label: 'Commercial' },
                { id: 'warranty', label: 'Warranty' },
                { id: 'delivery', label: 'Delivery' },
                { id: 'compliance', label: 'Compliance' },
                { id: 'amc', label: 'CMC / AMC' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as any)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                    category === cat.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Inspiration Prompts */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>AI Clarification Prompts (Click to Use):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {aiPromptSuggestions.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyAiPrompt(prompt.text, prompt.category)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      {prompt.title}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-400 uppercase">
                      {prompt.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {prompt.text}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Inquiry Question Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Inquiry / Clarification Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              placeholder="State the discrepancy or specific clarification requested from the vendor's engineering team..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 leading-relaxed"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Will be logged to the RFP immutable audit trail.</span>
              <span>{questionText.length} characters</span>
            </div>
          </div>

          {/* Webhook Dispatch Notifications */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Automated Dispatch Channels
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifyWhatsapp}
                  onChange={e => setNotifyWhatsapp(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Meta WhatsApp Cloud API (Template Alert)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={e => setNotifyEmail(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Amazon SES (Official Bid Notification)
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Sending to Vendor...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request to {targetQuote.vendorName}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
