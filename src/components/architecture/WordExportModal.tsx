import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Check, 
  Layers, 
  DollarSign, 
  Calendar, 
  Database, 
  ShieldCheck, 
  Loader2, 
  Sparkles,
  Sliders,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { 
  generateArchitectureAndCostDocx, 
  CostCalculationParams, 
  CalculatedCosts 
} from '../../utils/generateArchitectureDocx';
import { generatePlanDocx } from '../../utils/generatePlanDocx';

interface WordExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  costParams: CostCalculationParams;
  costs: CalculatedCosts;
  fxRate?: number;
  canvasContainerEl?: HTMLElement | null;
  onNotify?: (msg: string) => void;
}

export const WordExportModal: React.FC<WordExportModalProps> = ({
  isOpen,
  onClose,
  costParams,
  costs,
  fxRate = 84,
  canvasContainerEl,
  onNotify
}) => {
  const [template, setTemplate] = useState<'nabh_plan' | 'infra_spec'>('nabh_plan');
  const [fileName, setFileName] = useState('NABH_Pulse_Architecture_and_Estimates_Plan.docx');
  const [includeDiagramImage, setIncludeDiagramImage] = useState(true);
  const [includeNodeSpecs, setIncludeNodeSpecs] = useState(true);
  const [includeCostBreakdown, setIncludeCostBreakdown] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [includeDatabaseSchema, setIncludeDatabaseSchema] = useState(true);
  const [includeSecurityCompliance, setIncludeSecurityCompliance] = useState(true);
  const [currencyMode, setCurrencyMode] = useState<'BOTH' | 'USD' | 'INR'>('INR');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  if (!isOpen) return null;

  const notify = (msg: string) => {
    if (onNotify) onNotify(msg);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedSuccess(false);

    try {
      if (template === 'nabh_plan') {
        await generatePlanDocx({
          fileName: fileName.trim() || 'NABH_Pulse_Architecture_and_Estimates_Plan.docx',
          currency: currencyMode,
          pilotHospitals: 3,
          growthHospitals: 10,
          scaleHospitals: 30
        });
      } else {
        await generateArchitectureAndCostDocx({
          fileName: fileName.trim() || 'NOVA-H_Architecture_and_Cost_Specification.docx',
          costParams: {
            ...costParams,
            currency: currencyMode,
            fxRate
          },
          calculatedCosts: costs,
          includeDiagramImage,
          canvasContainerEl: includeDiagramImage ? canvasContainerEl : null,
          includeNodeSpecs,
          includeCostBreakdown,
          includeTimeline,
          includeDatabaseSchema,
          includeSecurityCompliance
        });
      }

      setGeneratedSuccess(true);
      notify('Microsoft Word (.docx) document generated and downloaded successfully!');
      setTimeout(() => {
        setIsGenerating(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to generate docx:', err);
      setIsGenerating(false);
      notify('Failed to generate Word document. Please try again.');
    }
  };

  const totalInr = Math.round(costs.totalUsd * fxRate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md font-black text-lg">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Generate Word Document (.docx)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Architecture &amp; Estimates
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exports a comprehensive Microsoft Word whitepaper with technical architecture, diagrams and cost estimates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Template Choice Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Select Document Format Template:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTemplate('nabh_plan');
                  setFileName('NABH_Pulse_Architecture_and_Estimates_Plan.docx');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  template === 'nabh_plan'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    NABH Pulse Plan (Attachment)
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-600 text-white">
                    13 Pages
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Matches the executive document: Deployed runtime, logical architecture, 16-step request flow, technology stack &amp; INR operating budget.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTemplate('infra_spec');
                  setFileName('NOVA-H_Architecture_and_Cost_Specification.docx');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  template === 'infra_spec'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    NOVA-H OpEx &amp; Custom Spec
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-600 text-white">
                    Customizable
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Uses your live slider metrics (MAU, RFPs, WhatsApp chats, R2 storage) with itemized cloud bill and 15-week timeline.
                </p>
              </button>
            </div>
          </div>
          {/* Filename Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Document File Name:
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="NOVA-H_Architecture_and_Cost_Specification.docx"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Current Sizing & Cost Preview Card */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-xl border border-blue-900/50 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
                Active Traffic &amp; Cloud Workload
              </span>
              <p className="text-sm font-extrabold text-white mt-0.5">
                {costParams.mau.toLocaleString()} MAU • {costParams.rfpCount.toLocaleString()} RFPs • {costParams.whatsappConversations.toLocaleString()} WhatsApp Chats
              </p>
              <p className="text-[11px] text-blue-200/80 mt-0.5">
                {costParams.storageGb} GB Medical CAD &amp; BoQ Storage • {costParams.emailVolume.toLocaleString()} Emails / mo
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Estimated Cloud OpEx:</span>
              <span className="text-xl font-black text-white font-mono">
                ${costs.totalUsd} / mo
              </span>
              <span className="text-[11px] text-emerald-400 block font-mono">
                ₹{totalInr.toLocaleString('en-IN')} / mo (₹{(Number(costs.costPerMau) * fxRate).toFixed(2)}/user)
              </span>
            </div>
          </div>

          {/* Currency Display Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Currency Valuation in Tables:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCurrencyMode('BOTH')}
                className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                  currencyMode === 'BOTH'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                USD &amp; INR (Dual Currency)
              </button>
              <button
                type="button"
                onClick={() => setCurrencyMode('USD')}
                className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                  currencyMode === 'USD'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                USD ($) Only
              </button>
              <button
                type="button"
                onClick={() => setCurrencyMode('INR')}
                className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                  currencyMode === 'INR'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                INR (₹) Only
              </button>
            </div>
          </div>

          {/* Section Toggles */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Include Sections in Word Document:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Diagram Image */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeDiagramImage}
                  onChange={(e) => setIncludeDiagramImage(e.target.checked)}
                  className="rounded text-blue-600 accent-blue-600 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>XYFlow Diagram Snapshot</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Embeds hi-res architecture graphic</span>
                </div>
              </label>

              {/* Node Technical Specs */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeNodeSpecs}
                  onChange={(e) => setIncludeNodeSpecs(e.target.checked)}
                  className="rounded text-blue-600 accent-blue-600 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Node Technical Specs (15 Nodes)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Roles, tech stacks, SLAs, throughput</span>
                </div>
              </label>

              {/* Cloud OpEx & Unit Economics */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeCostBreakdown}
                  onChange={(e) => setIncludeCostBreakdown(e.target.checked)}
                  className="rounded text-blue-600 accent-blue-600 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Cloud OpEx &amp; Unit Economics</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Itemized line items, scale comparison</span>
                </div>
              </label>

              {/* Development Timeline */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeTimeline}
                  onChange={(e) => setIncludeTimeline(e.target.checked)}
                  className="rounded text-blue-600 accent-blue-600 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                    <span>15-Week Timeline &amp; Budget</span>
                  </div>
                  <span className="text-[11px] text-slate-400">5 phases, scopes, team estimates</span>
                </div>
              </label>

              {/* PostgreSQL Schema */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeDatabaseSchema}
                  onChange={(e) => setIncludeDatabaseSchema(e.target.checked)}
                  className="rounded text-blue-600 accent-blue-600 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Database className="w-3.5 h-3.5 text-amber-500" />
                    <span>Relational Database Schema</span>
                  </div>
                  <span className="text-[11px] text-slate-400">6 core tables, columns &amp; JSONB schemas</span>
                </div>
              </label>

              {/* Healthcare Security & Compliance */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeSecurityCompliance}
                  onChange={(e) => setIncludeSecurityCompliance(e.target.checked)}
                  className="rounded text-blue-600 accent-blue-600 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                    <span>Healthcare Security &amp; Compliance</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Sealed bidding, ClamAV, NABH/ISO</span>
                </div>
              </label>
            </div>
          </div>

          {/* Executive Document Features Note */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
            ✨ <strong>Standard OOXML .docx File:</strong> Generates an authentic Microsoft Word document complete with title page, executive summary, shaded table headers, page numbers, and structured metadata. Openable in Microsoft Word, Google Docs, Apple Pages, or LibreOffice.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer ${
              generatedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg disabled:opacity-60'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Word Document...</span>
              </>
            ) : generatedSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Word Document (.docx)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
