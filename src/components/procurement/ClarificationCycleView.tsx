import React, { useState } from 'react';
import { 
  RFPItem, 
  RFPClarification, 
  RFPQuote,
  AuthUser
} from '../../types';
import { 
  Sparkles, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  FileText,
  User,
  Building2,
  ChevronRight
} from 'lucide-react';

interface ClarificationCycleViewProps {
  rfp: RFPItem;
  clarifications: RFPClarification[];
  quotes: RFPQuote[];
  onAddClarification: (clarification: RFPClarification) => void;
  onUpdateClarification: (clarification: RFPClarification) => void;
  currentUser?: AuthUser | null;
}

export const ClarificationCycleView: React.FC<ClarificationCycleViewProps> = ({
  rfp,
  clarifications,
  quotes,
  onAddClarification,
  onUpdateClarification,
  currentUser
}) => {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(quotes[0]?.id || '');
  const [newQuestion, setNewQuestion] = useState('');
  const [category, setCategory] = useState<'technical' | 'commercial' | 'warranty' | 'delivery'>('warranty');
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  // Suggested AI prompts based on quotes
  const aiSuggestedPrompts = [
    {
      title: 'Inquire on X-ray Tube Warranty Terms',
      category: 'warranty' as const,
      text: 'AI Prompt: Your quotation does not explicitly confirm whether the X-ray tube is included in the 2-year warranty without scan-second capping. Please confirm whether the tube replacement is covered 100% in the warranty period.'
    },
    {
      title: 'Clarify Dual-Head Injector Scope',
      category: 'technical' as const,
      text: 'AI Prompt: Schedule A lists a dual-head contrast injector as mandatory. Your quote lists a single-head unit. Please confirm package pricing to upgrade to a ceiling-suspended dual-head injector.'
    },
    {
      title: 'Confirm Year 6-10 CMC Escalation Cap',
      category: 'commercial' as const,
      text: 'AI Prompt: Please confirm whether the annual Comprehensive Maintenance Contract (CMC) rate escalates at a capped index or remains fixed at the quoted percentage.'
    }
  ];

  const handleCreateClarification = (promptText?: string, promptCat?: any) => {
    const textToSend = promptText || newQuestion;
    if (!textToSend.trim()) return;

    const targetQuote = quotes.find(q => q.id === selectedQuoteId) || quotes[0];

    const newClr: RFPClarification = {
      id: `clr-${Date.now()}`,
      rfpId: rfp.id,
      quoteId: targetQuote?.id,
      vendorName: targetQuote?.vendorName || 'Selected Bidder',
      category: promptCat || category,
      question: textToSend.trim(),
      askedBy: currentUser?.name || 'Hospital Procurement Committee',
      askedAt: new Date().toISOString(),
      status: 'open',
      isAiDrafted: !!promptText
    };

    onAddClarification(newClr);
    setNewQuestion('');
  };

  const handleSimulateVendorReply = (clr: RFPClarification) => {
    if (!replyText.trim()) return;

    const updated: RFPClarification = {
      ...clr,
      response: replyText.trim(),
      respondedAt: new Date().toISOString(),
      status: 'resolved',
      revisionResulted: true
    };

    onUpdateClarification(updated);
    setActiveReplyId(null);
    setReplyText('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900">
              AI Clarification &amp; Pre-Bid Query Cycle
            </h3>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold text-[11px] rounded-full">
              BRS Section 7.1 (CLR-FR-01 to 03)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            AI flags missing quotation parameters and drafts targeted inquiry prompts to close gaps before final decision.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">
            {clarifications.length} Active Queries
          </span>
        </div>
      </div>

      {/* AI Prompt Recommender Bar */}
      <div className="p-5 bg-purple-50/60 border-b border-purple-200 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-700" />
          <span className="text-xs font-black text-purple-950 uppercase tracking-wider">
            AI-Detected Discrepancies &amp; Ready-to-Send Clarification Prompts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {aiSuggestedPrompts.map((prompt, idx) => (
            <div 
              key={idx}
              className="p-3.5 rounded-xl bg-white border border-purple-200 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  {prompt.category}
                </span>
                <h5 className="font-bold text-slate-900 text-xs mt-2">{prompt.title}</h5>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {prompt.text}
                </p>
              </div>

              <button
                onClick={() => handleCreateClarification(prompt.text, prompt.category)}
                className="mt-3 w-full py-1.5 px-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Dispatch Prompt to Bidder</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Query Threads List */}
      <div className="p-6 space-y-4">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
          Threaded Inquiries &amp; Vendor Responses
        </h4>

        {clarifications.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs border border-dashed rounded-xl">
            No clarifications raised yet. Select an AI prompt above or post a custom inquiry below.
          </div>
        ) : (
          <div className="space-y-4">
            {clarifications.map((clr) => {
              const isResolved = clr.status === 'resolved' || clr.status === 'answered';
              return (
                <div 
                  key={clr.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs"
                >
                  {/* Query Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        clr.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {clr.status.toUpperCase()}
                      </span>
                      <span className="font-bold text-xs text-slate-900">
                        To: {clr.vendorName}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-500 capitalize">Category: {clr.category}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(clr.askedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="flex items-start gap-2.5 text-xs text-slate-800">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
                      H
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-slate-900 block text-[11px]">
                        {clr.askedBy} {clr.isAiDrafted && <span className="text-purple-600 font-normal">(AI Assisted)</span>}
                      </span>
                      <p className="mt-0.5 leading-relaxed">{clr.question}</p>
                    </div>
                  </div>

                  {/* Vendor Response */}
                  {clr.response ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5 text-xs">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                        V
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-950 text-[11px]">
                            {clr.vendorName} (Official Response)
                          </span>
                          {clr.respondedAt && (
                            <span className="text-[10px] text-emerald-700">
                              {new Date(clr.respondedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-emerald-900 leading-relaxed">{clr.response}</p>
                        {clr.revisionResulted && (
                          <span className="inline-block mt-2 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                            ✓ Commercial &amp; Technical terms updated in Comparison Matrix
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1">
                      {activeReplyId === clr.id ? (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <label className="font-bold text-slate-700 text-xs block">
                            Record Vendor's Official Reply:
                          </label>
                          <textarea
                            rows={2}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Paste or record the vendor's confirmed clarification..."
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setActiveReplyId(null)}
                              className="px-3 py-1 rounded-lg border text-slate-600 font-semibold text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSimulateVendorReply(clr)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                            >
                              Save Reply
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="italic flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            Awaiting official response from {clr.vendorName}
                          </span>
                          <button
                            onClick={() => {
                              setActiveReplyId(clr.id);
                              setReplyText('');
                            }}
                            className="text-blue-700 hover:text-blue-900 font-bold cursor-pointer"
                          >
                            + Record Vendor Reply
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        {/* Custom Clarification Poster */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <h5 className="font-bold text-slate-900 text-xs">Post Custom Pre-Bid / Clarification Query</h5>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Bidder</label>
              <select
                value={selectedQuoteId}
                onChange={(e) => setSelectedQuoteId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-xs"
              >
                {quotes.map(q => (
                  <option key={q.id} value={q.id}>{q.vendorName} ({q.isExternal ? 'Offline' : 'Online'})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Inquiry Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-xs"
              >
                <option value="warranty">Warranty &amp; Service Terms</option>
                <option value="technical">Technical Specification Scope</option>
                <option value="commercial">Commercial, Taxes &amp; CMC</option>
                <option value="delivery">Delivery, Site &amp; Rigging</option>
              </select>
            </div>
          </div>

          <div>
            <textarea
              rows={2}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Type inquiry to vendor (e.g. Please confirm if 120 kVA UPS includes 15-minute battery rack)..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => handleCreateClarification()}
              disabled={!newQuestion.trim()}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Inquiry to Bidder</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
