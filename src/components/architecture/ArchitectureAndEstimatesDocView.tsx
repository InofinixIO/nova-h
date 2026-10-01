import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Check, 
  Layers, 
  Server, 
  Database, 
  Cloud, 
  ShieldCheck, 
  Cpu, 
  Users, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  ExternalLink,
  ChevronRight,
  Info,
  DollarSign,
  Activity,
  ArrowRight,
  CheckCircle2,
  Copy,
  Lock,
  Loader2
} from 'lucide-react';
import { generatePlanDocx } from '../../utils/generatePlanDocx';

interface ArchitectureAndEstimatesDocViewProps {
  onBack?: () => void;
  onNotify?: (msg: string) => void;
}

type ScaleTier = 'pilot' | 'growth' | 'scale';

export const ArchitectureAndEstimatesDocView: React.FC<ArchitectureAndEstimatesDocViewProps> = ({
  onBack,
  onNotify
}) => {
  const [selectedTier, setSelectedTier] = useState<ScaleTier>('growth');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const notify = (msg: string) => {
    if (onNotify) onNotify(msg);
  };

  const handleDownloadDocx = async () => {
    setIsGeneratingDocx(true);
    try {
      await generatePlanDocx({
        fileName: `NABH_Pulse_Architecture_and_Estimates_Plan_${selectedTier.toUpperCase()}.docx`,
        pilotHospitals: 3,
        growthHospitals: 10,
        scaleHospitals: 30
      });
      notify('Downloaded NABH Pulse Architecture & Estimates Plan (.docx)!');
    } catch (err) {
      console.error(err);
      notify('Failed to generate Word document.');
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const tierData = {
    pilot: {
      hospitals: 3,
      registeredUsers: 60,
      activeUsers: 36,
      workload: '5,000 API actions · 300 AI/document jobs',
      infraCost: '₹ 8,500',
      toolsCost: '₹ 6,200',
      supportCost: '₹ 22,000',
      totalCost: '₹ 36,700',
      withPlatform: '₹ 45,500',
      costPerHospital: '₹ 12,233',
      controlledFiles: '2,400',
      storage: '≈ 11 GB',
      aiFiles: '360'
    },
    growth: {
      hospitals: 10,
      registeredUsers: 250,
      activeUsers: 150,
      workload: '30,000 API actions · 2,000 AI/document jobs',
      infraCost: '₹ 19,500',
      toolsCost: '₹ 16,000',
      supportCost: '₹ 37,000',
      totalCost: '₹ 72,500',
      withPlatform: '₹ 88,000',
      costPerHospital: '₹ 7,250',
      controlledFiles: '8,000',
      storage: '≈ 36 GB',
      aiFiles: '1,200'
    },
    scale: {
      hospitals: 30,
      registeredUsers: 900,
      activeUsers: 540,
      workload: '1,20,000 API actions · 8,000 AI/document jobs',
      infraCost: '₹ 54,000',
      toolsCost: '₹ 48,000',
      supportCost: '₹ 85,000',
      totalCost: '₹ 1,87,000',
      withPlatform: '₹ 2,20,000',
      costPerHospital: '₹ 6,233',
      controlledFiles: '24,000',
      storage: '≈ 108 GB',
      aiFiles: '3,600'
    }
  }[selectedTier];

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : ''}`}>
      {/* Top Document Action Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              ← Back
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                INOFINIX PLAN SPECIFICATION
              </span>
              <h1 className="text-sm font-black text-slate-900 dark:text-white">
                NABH Pulse · Architecture, Flows &amp; Estimates
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              13-Page executive architecture plan, sequence diagrams, and completed-product cost valuation.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Tier Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setSelectedTier('pilot')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedTier === 'pilot' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Pilot (3 H)
            </button>
            <button
              onClick={() => setSelectedTier('growth')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedTier === 'growth' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Growth (10 H)
            </button>
            <button
              onClick={() => setSelectedTier('scale')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedTier === 'scale' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Scale (30 H)
            </button>
          </div>

          {/* Download Word Document */}
          <button
            onClick={handleDownloadDocx}
            disabled={isGeneratingDocx}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-60"
            title="Download authentic Microsoft Word (.docx) document"
          >
            {isGeneratingDocx ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <div className="w-4 h-4 rounded-md bg-white text-blue-700 text-[10px] font-black flex items-center justify-center">
                W
              </div>
            )}
            <span>{isGeneratingDocx ? 'Generating...' : 'Word Doc (.docx)'}</span>
          </button>

          {/* Print / Save as PDF */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Document Body */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8 space-y-12">
        {/* ========================================================================= */}
        {/* PAGE 1: COVER PAGE */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-b from-[#0B1E38] via-[#0E274A] to-[#0A192F] text-white rounded-3xl p-8 sm:p-14 shadow-2xl border border-blue-900/60 relative overflow-hidden min-h-[580px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <span className="text-[12px] font-mono tracking-widest text-blue-300 font-bold uppercase">
              I N O F I N I X &nbsp;·&nbsp; P R O D U C T &nbsp; A R C H I T E C T U R E &nbsp; A N D &nbsp; P L A N
            </span>

            <div className="space-y-2 pt-4">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-sans">
                NABH Pulse
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-slate-200">
                Architecture, flows and estimates
              </p>
              <p className="text-sm sm:text-base text-blue-200/90 max-w-2xl leading-relaxed pt-2">
                Accreditation readiness, controlled documents, evidence, reviews and approvals.
              </p>
            </div>

            {/* Document Structure Table */}
            <div className="pt-8 max-w-xl">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <span className="font-black text-blue-400 text-sm">A</span>
                  <div>
                    <span className="font-bold text-white block">Architecture:</span>
                    <span className="text-blue-100/80">deployed runtime, logical architecture, request flow, technology stack</span>
                  </div>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex items-start gap-3">
                  <span className="font-black text-blue-400 text-sm">B</span>
                  <div>
                    <span className="font-bold text-white block">Estimates:</span>
                    <span className="text-blue-100/80">development cost (completed product) and monthly operating cost</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cover Metadata Footer */}
          <div className="pt-10 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-blue-200/80 relative z-10">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Planning Horizon:</span>
              <span className="text-white font-semibold">Completed-product valuation &amp; first 12 months</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimate Basis:</span>
              <span className="text-white font-semibold">India delivery &amp; operations, Sep 2026</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Currency:</span>
              <span className="text-emerald-400 font-bold font-mono">INR (₹), excluding GST</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PAGE 3: OVERVIEW & SIZING ASSUMPTIONS */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              OVERVIEW
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              NABH Pulse: architecture and estimates
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              NABH Pulse is one of three developed, multi-tenant Inofinix applications on a shared cloud foundation. Its main cost drivers are document storage and conversion, AI drafting, accreditation operations and expert review.
            </p>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                REPLACEMENT VALUE
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                ₹ 40–56 L
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                32–45 person-months to rebuild
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                STATUS
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                Nearing completion
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                no further dev in scope
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                RUN COST · GROWTH
              </span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                ₹ 72,500
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                per month · 10 hospitals
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                COST PER HOSPITAL
              </span>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                ₹ 7,250
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                per month at Growth midpoint
              </span>
            </div>
          </div>

          {/* Size and Scale Assumed Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              SIZE AND SCALE ASSUMED
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F1E36] text-white">
                  <tr>
                    <th className="p-3 font-bold">Scale</th>
                    <th className="p-3 font-bold text-center">Hospitals</th>
                    <th className="p-3 font-bold text-center">Registered users</th>
                    <th className="p-3 font-bold text-center">Active users / mo</th>
                    <th className="p-3 font-bold">Indicative monthly workload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr className={selectedTier === 'pilot' ? 'bg-blue-50/80 dark:bg-blue-950/40 font-bold' : ''}>
                    <td className="p-3 font-bold text-blue-600 dark:text-blue-400">Pilot</td>
                    <td className="p-3 text-center font-mono">3</td>
                    <td className="p-3 text-center font-mono">60</td>
                    <td className="p-3 text-center font-mono">36</td>
                    <td className="p-3">5,000 API actions · 300 AI/document jobs</td>
                  </tr>
                  <tr className={selectedTier === 'growth' ? 'bg-blue-50/80 dark:bg-blue-950/40 font-bold' : 'bg-slate-50/50 dark:bg-slate-800/30'}>
                    <td className="p-3 font-bold text-blue-600 dark:text-blue-400">Growth</td>
                    <td className="p-3 text-center font-mono">10</td>
                    <td className="p-3 text-center font-mono">250</td>
                    <td className="p-3 text-center font-mono">150</td>
                    <td className="p-3">30,000 API actions · 2,000 AI/document jobs</td>
                  </tr>
                  <tr className={selectedTier === 'scale' ? 'bg-blue-50/80 dark:bg-blue-950/40 font-bold' : ''}>
                    <td className="p-3 font-bold text-blue-600 dark:text-blue-400">Scale</td>
                    <td className="p-3 text-center font-mono">30</td>
                    <td className="p-3 text-center font-mono">900</td>
                    <td className="p-3 text-center font-mono">540</td>
                    <td className="p-3">1,20,000 API actions · 8,000 AI/document jobs</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
              <strong>Sized for small and medium hospitals (20–150 beds):</strong> about 20–30 registered users per hospital. Monthly active users are 60% of registered users; peak concurrent use is 5–10%.<br />
              <strong>NABH Pulse workload:</strong> 800 controlled files per hospital, 1.5 MB average file size, three retained versions, and 15% of files processed by AI each month.
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PAGE 4: A1 · DEPLOYED RUNTIME DIAGRAM */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              A · ARCHITECTURE
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              A1 · Deployed runtime: software and infrastructure
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              A Cloudflare Worker routes through a Durable Object to a Node.js / Express container that builds, converts and stores controlled documents.
            </p>
          </div>

          {/* Interactive Deployed Runtime Diagram (matching Page 4 of PDF) */}
          <div className="p-6 bg-slate-950 text-white rounded-2xl border border-slate-800 overflow-x-auto">
            <div className="min-w-[820px] grid grid-cols-12 gap-4 text-xs">
              {/* Column 1: Clients */}
              <div className="col-span-3 space-y-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">CLIENTS</span>
                
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
                  <div className="font-extrabold text-blue-400">Web application</div>
                  <div className="text-[10px] text-slate-400">React 19 · Vite 7</div>
                  <div className="text-[10px] text-slate-400">JavaScript · Lucide React</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-dashed border-slate-700 space-y-1">
                  <div className="font-extrabold text-emerald-400">OnlyOffice Document Server</div>
                  <div className="text-[10px] text-slate-400">In-browser editing</div>
                  <div className="text-[10px] text-slate-400">JWT-signed check-in</div>
                </div>
              </div>

              {/* Column 2: Cloudflare Platform & Container */}
              <div className="col-span-6 p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-amber-300 font-bold">CLOUDFLARE PLATFORM</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">Edge Hosted</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                    <span className="font-bold text-amber-300 block">Edge</span>
                    <span className="text-slate-400 text-[9px]">DNS · TLS · CDN · WAF</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                    <span className="font-bold text-amber-300 block">Worker router</span>
                    <span className="text-slate-400 text-[9px]">request routing</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                    <span className="font-bold text-amber-300 block">Durable Object</span>
                    <span className="text-slate-400 text-[9px]">container lifecycle</span>
                  </div>
                </div>

                {/* Cloudflare Container Box */}
                <div className="p-4 rounded-xl bg-[#0B1E38] border border-blue-500/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-blue-300 uppercase font-black">CLOUDFLARE CONTAINER</span>
                    <span className="text-[9px] font-mono text-emerald-400">HTTP API</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-blue-950/80 border border-blue-800 text-center">
                    <span className="font-black text-sm text-white block">Node.js 22 · Express 5</span>
                    <span className="text-[10px] text-blue-200">HTTP API · serves the Vite bundle · workflow · versions · approvals · audit</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                      <span className="font-bold text-slate-200 block">Document build</span>
                      <span className="text-[9px] text-slate-400">docx · docx-templates · pdf-lib · exceljs · sharp</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                      <span className="font-bold text-slate-200 block">LibreOffice</span>
                      <span className="text-[9px] text-slate-400">soffice · PDF previews &amp; exports</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                      <span className="font-bold text-slate-200 block">Email</span>
                      <span className="text-[9px] text-slate-400">MJML · Nodemailer · SMTP</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                    <span className="font-bold text-sky-300 block">R2 via AWS S3 SDK</span>
                    <span className="text-slate-400 text-[9px]">templates · controlled docs · evidence · versions ($0 egress)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                    <span className="font-bold text-rose-300 block">Workers observability</span>
                    <span className="text-slate-400 text-[9px]">logs · metrics · Sentry APM</span>
                  </div>
                </div>
              </div>

              {/* Column 3: Data, AI & Integrations */}
              <div className="col-span-3 space-y-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">DATA, AI &amp; INTEGRATIONS</span>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-blue-500 space-y-1">
                  <div className="font-extrabold text-blue-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span>PostgreSQL</span>
                  </div>
                  <div className="text-[10px] text-slate-400">NABH Pulse schema · pg</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-purple-500 space-y-1">
                  <div className="font-extrabold text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Anthropic Claude API</span>
                  </div>
                  <div className="text-[10px] text-slate-400">prompt refinement · template generation</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-dashed border-slate-700 space-y-1 opacity-70">
                  <div className="font-bold text-slate-300">Optional integrations</div>
                  <div className="text-[10px] text-slate-400">Google Drive · Azure Blob · Google Cloud Storage</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PAGE 5: A2 · LOGICAL ARCHITECTURE */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              A · ARCHITECTURE
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              A2 · Logical architecture: users, modules and data
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Accreditation readiness, controlled documents, evidence, reviews and approvals - part of the Inofinix platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Personas */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">USERS AND WHAT THEY DO</span>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 block">Hospital accreditation team</span>
                  <span className="text-[10px] text-slate-500">Gap assessment, owners, evidence upload, AI draft requests</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block">Owners and approvers</span>
                  <span className="text-[10px] text-slate-500">Review drafts, approve and release controlled documents</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-extrabold text-purple-600 dark:text-purple-400 block">Reviewers and consultants</span>
                  <span className="text-[10px] text-slate-500">Review, comment and advise on one hospital</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 block">Platform administrators</span>
                  <span className="text-[10px] text-slate-500">Tenants, roles, SSO, programme set-up</span>
                </div>
              </div>
            </div>

            {/* Application Modules */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-3">
              <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-300 block">NABH PULSE APPLICATION MODULES</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">Programme &amp; readiness</span>
                  <span className="text-[10px] text-slate-500">programmes, gap assessment, dashboard</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">Document control &amp; approval</span>
                  <span className="text-[10px] text-slate-500">versions, owner and approver review</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">Evidence, training &amp; audit</span>
                  <span className="text-[10px] text-slate-500">evidence capture, training records</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">Template Studio &amp; AI</span>
                  <span className="text-[10px] text-slate-500">AI-assisted drafts with placeholders</span>
                </div>
              </div>

              {/* Shared Platform Services */}
              <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">SHARED INOFINIX PLATFORM SERVICES</span>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
                  <div className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">Tenants &amp; RBAC</div>
                  <div className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">Immutable Audit</div>
                  <div className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">Queues &amp; Jobs</div>
                </div>
              </div>
            </div>

            {/* Data & AI */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">DATA &amp; GOVERNED AI</span>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">NABH PostgreSQL</span>
                  <span className="text-[10px] text-slate-500">readiness state, versions, reviews, audit</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">Versioned R2 Storage</span>
                  <span className="text-[10px] text-slate-500">object storage: five versions kept</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-purple-600 dark:text-purple-400 block">Governed AI Gateway</span>
                  <span className="text-[10px] text-slate-500">prompts, sources, confidence logged</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PAGE 6: A3 · REQUEST FLOW (16 STEPS) */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              A · ARCHITECTURE
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              A3 · Request flow: AI-assisted draft to controlled release
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              The prompt version, sources and confidence are recorded with every draft. Only the approver\'s release (step 14) makes a document controlled.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { num: '01', actor: 'Accreditation team', text: 'Request AI-assisted draft for a requirement', color: 'blue' },
              { num: '02', actor: 'Worker router', text: 'Route to active container instance', color: 'amber' },
              { num: '03', actor: 'Durable Object', text: 'Forward request and maintain container state', color: 'amber' },
              { num: '04', actor: 'Express container', text: 'Load programme, template, hospital context from PostgreSQL', color: 'blue' },
              { num: '05', actor: 'Anthropic Claude API', text: 'Refine prompt and generate draft (prompt version logged)', color: 'purple' },
              { num: '06', actor: 'Express container', text: 'Draft with placeholders and clinical schema returned', color: 'blue' },
              { num: '07', actor: 'Document build', text: 'Build DOCX (docx-templates) & PDF preview (LibreOffice soffice)', color: 'emerald' },
              { num: '08', actor: 'Cloudflare R2', text: 'Save DOCX + PDF as new version in R2 bucket', color: 'sky' },
              { num: '09', actor: 'PostgreSQL', text: 'Record version, sources, confidence, audit log in database', color: 'blue' },
              { num: '10', actor: 'Express container', text: 'Draft ready for owner review status broadcast', color: 'blue' },
              { num: '11', actor: 'Owner', text: 'Edit in browser via OnlyOffice Document Server', color: 'emerald' },
              { num: '12', actor: 'OnlyOffice Server', text: 'Check-in callback (JWT-signed) upon user save', color: 'emerald' },
              { num: '13', actor: 'Cloudflare R2', text: 'Save revised version to storage bucket', color: 'sky' },
              { num: '14', actor: 'Approver', text: 'Formal clinical approval and controlled release trigger', color: 'rose' },
              { num: '15', actor: 'PostgreSQL', text: 'Update release state to controlled + write immutable audit row', color: 'blue' },
              { num: '16', actor: 'Email Relay', text: 'Dispatch stakeholder email notice (MJML + Nodemailer)', color: 'purple' },
            ].map((step, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
              >
                <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
                  {step.num}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 w-44 shrink-0 text-[11px]">
                  {step.actor}
                </span>
                <span className="text-slate-600 dark:text-slate-300 flex-1">
                  {step.text}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PAGE 7: A4 · TECHNOLOGY STACK & LIBRARIES */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              A · ARCHITECTURE
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              A4 · Technology stack &amp; verified libraries
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Tech Stack Table */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                CORE SYSTEM LAYERS
              </h3>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 flex justify-between">
                  <span className="font-bold">Web Frontend</span>
                  <span className="text-slate-500 font-mono">React 19 · Vite 7 · Lucide</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-bold">Mobile</span>
                  <span className="text-slate-500 font-mono">Responsive web application</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 flex justify-between">
                  <span className="font-bold">API &amp; Runtime</span>
                  <span className="text-slate-500 font-mono">Node.js 22 + Express 5</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-bold">Database</span>
                  <span className="text-slate-500 font-mono">PostgreSQL via pg pool</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 flex justify-between">
                  <span className="font-bold">File Storage</span>
                  <span className="text-slate-500 font-mono">Cloudflare R2 ($0 egress)</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-bold">Cloud Platform</span>
                  <span className="text-slate-500 font-mono">Cloudflare Worker + Containers</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 flex justify-between">
                  <span className="font-bold">AI / LLM</span>
                  <span className="text-slate-500 font-mono">Anthropic Claude API</span>
                </div>
              </div>
            </div>

            {/* Verified Libraries */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                VERIFIED LIBRARIES AND UTILITIES
              </h3>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                {[
                  { tool: 'Express 5', purpose: 'HTTP API and application server' },
                  { tool: 'docx, docx-templates', purpose: 'Styled Word documents and template filling' },
                  { tool: 'LibreOffice / soffice', purpose: 'Office → PDF previews and exports' },
                  { tool: 'OnlyOffice Server', purpose: 'Browser editing with JWT-signed check-in' },
                  { tool: 'pdf-lib', purpose: 'Generate and manipulate clinical PDFs' },
                  { tool: 'exceljs, xlsx', purpose: 'Spreadsheet import/export matrices' },
                  { tool: 'MJML, Nodemailer', purpose: 'Responsive email templates and delivery' }
                ].map((lib, idx) => (
                  <div key={idx} className="p-3 flex justify-between items-center text-[11px]">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{lib.tool}</span>
                    <span className="text-slate-500 dark:text-slate-400">{lib.purpose}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PAGES 8 & 9: A5 · BUSINESS FLOW (01 TO 10) & SIZING */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              A · ARCHITECTURE
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              A5 · Business flow, design and sizing
            </h2>
          </div>

          {/* 10 Business Flow Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            {[
              { num: '01', title: 'Hospital registration and profile', phase: 'ONBOARD' },
              { num: '02', title: 'Accreditation programme selection', phase: 'ONBOARD' },
              { num: '03', title: 'Initialise document workspace', phase: 'ONBOARD' },
              { num: '04', title: 'Gap assessment and ownership', phase: 'READINESS' },
              { num: '05', title: 'Upload evidence or request AI draft', phase: 'READINESS' },
              { num: '06', title: 'Source-grounded draft with confidence', phase: 'READINESS' },
              { num: '07', title: 'Owner review and clinical edit', phase: 'READINESS' },
              { num: '08', title: 'Approver review and controlled release', phase: 'RELEASE' },
              { num: '09', title: 'Implementation and evidence capture', phase: 'OPERATIONS' },
              { num: '10', title: 'Readiness dashboard and reminders', phase: 'OPERATIONS' },
            ].map((step, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm">
                    {step.num}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {step.phase}
                  </span>
                </div>
                <div className="font-extrabold text-slate-900 dark:text-white leading-snug">
                  {step.title}
                </div>
              </div>
            ))}
          </div>

          {/* Sizing Derived from Workload Assumptions Table */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              SIZING DERIVED FROM WORKLOAD ASSUMPTIONS
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F1E36] text-white">
                  <tr>
                    <th className="p-3 font-bold">Measure</th>
                    <th className="p-3 font-bold text-center">Pilot</th>
                    <th className="p-3 font-bold text-center">Growth</th>
                    <th className="p-3 font-bold text-center">Scale</th>
                    <th className="p-3 font-bold">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">Controlled files</td>
                    <td className="p-3 text-center font-mono">2,400</td>
                    <td className="p-3 text-center font-mono font-bold text-blue-600">8,000</td>
                    <td className="p-3 text-center font-mono">24,000</td>
                    <td className="p-3 text-slate-500">800 per hospital</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">Versioned document storage</td>
                    <td className="p-3 text-center font-mono">≈ 11 GB</td>
                    <td className="p-3 text-center font-mono font-bold text-blue-600">≈ 36 GB</td>
                    <td className="p-3 text-center font-mono">≈ 108 GB</td>
                    <td className="p-3 text-slate-500">1.5 MB × 3 retained versions</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">AI-processed files per month</td>
                    <td className="p-3 text-center font-mono">360</td>
                    <td className="p-3 text-center font-mono font-bold text-blue-600">1,200</td>
                    <td className="p-3 text-center font-mono">3,600</td>
                    <td className="p-3 text-slate-500">15% of files processed monthly</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PAGE 11: B1 · DEVELOPMENT COST (COMPLETED PRODUCT) */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
              B · ESTIMATES
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              B1 · Development cost (completed product replacement value)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              NABH Pulse is developed and nearing completion; no further development work is included in this document. The figure below is what a lean India-based team would spend to build it today (replacement value).
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E3A8A] text-white">
                <tr>
                  <th className="p-3.5 font-bold">Estimate</th>
                  <th className="p-3.5 font-bold">Cost band (INR)</th>
                  <th className="p-3.5 font-bold">Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">
                    Developed software replacement value
                  </td>
                  <td className="p-3.5 font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
                    ₹ 40.0–56.2 Lakh
                  </td>
                  <td className="p-3.5 text-slate-500 leading-relaxed">
                    Hospital workspace, controlled documents, versions, reviews, Template Studio, AI drafting, conversion and storage
                  </td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">
                    Share of shared-platform replacement value (one third)
                  </td>
                  <td className="p-3.5 font-mono font-black text-base text-blue-600 dark:text-blue-400">
                    ₹ 15.0 Lakh
                  </td>
                  <td className="p-3.5 text-slate-500 leading-relaxed">
                    Only for a standalone business case; count the ₹ 45 Lakh foundation once across the portfolio.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200">
            <strong>How the replacement value is derived:</strong> 32–45 person-months × ₹ 1.25 lakh blended, fully loaded rate (product, UX, frontend, backend, QA, DevOps/security, part-time domain review) = <strong>₹ 40.0–56.2 Lakh</strong>.
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PAGES 11 & 12: B2 · MONTHLY OPERATING COST */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
              B · ESTIMATES
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              B2 · Monthly operating cost
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Monthly run cost = cloud infrastructure + tools and LLM usage + support operations team.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F1E36] text-white">
                <tr>
                  <th className="p-3.5 font-bold">Scale</th>
                  <th className="p-3.5 font-bold">Infra &amp; cloud</th>
                  <th className="p-3.5 font-bold">Tools &amp; LLM</th>
                  <th className="p-3.5 font-bold">Support team</th>
                  <th className="p-3.5 font-bold">Total / month</th>
                  <th className="p-3.5 font-bold">+ ⅓ platform overhead</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                <tr className={selectedTier === 'pilot' ? 'bg-blue-50/80 dark:bg-blue-950/40 font-bold' : ''}>
                  <td className="p-3.5 font-bold font-sans text-blue-600 dark:text-blue-400">Pilot (3 H)</td>
                  <td className="p-3.5">₹ 8,500</td>
                  <td className="p-3.5">₹ 6,200</td>
                  <td className="p-3.5">₹ 22,000</td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white text-sm">₹ 36,700</td>
                  <td className="p-3.5 text-slate-500">₹ 45,500</td>
                </tr>
                <tr className={selectedTier === 'growth' ? 'bg-blue-50/80 dark:bg-blue-950/40 font-bold' : 'bg-slate-50/50 dark:bg-slate-800/30'}>
                  <td className="p-3.5 font-bold font-sans text-blue-600 dark:text-blue-400">Growth (10 H)</td>
                  <td className="p-3.5">₹ 19,500</td>
                  <td className="p-3.5">₹ 16,000</td>
                  <td className="p-3.5">₹ 37,000</td>
                  <td className="p-3.5 font-bold text-blue-600 dark:text-blue-400 text-sm">₹ 72,500</td>
                  <td className="p-3.5 text-slate-500">₹ 88,000</td>
                </tr>
                <tr className={selectedTier === 'scale' ? 'bg-blue-50/80 dark:bg-blue-950/40 font-bold' : ''}>
                  <td className="p-3.5 font-bold font-sans text-blue-600 dark:text-blue-400">Scale (30 H)</td>
                  <td className="p-3.5">₹ 54,000</td>
                  <td className="p-3.5">₹ 48,000</td>
                  <td className="p-3.5">₹ 85,000</td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white text-sm">₹ 1,87,000</td>
                  <td className="p-3.5 text-slate-500">₹ 2,20,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Market Sanity Check */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                MARKET SANITY CHECK · PER HOSPITAL, PER MONTH
              </h3>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden font-mono">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 flex justify-between font-bold text-emerald-800 dark:text-emerald-200">
                  <span className="font-sans">NABH Pulse delivery cost (Growth midpoint)</span>
                  <span>₹ 7,250 / mo</span>
                </div>
                <div className="p-3 flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="font-sans">Cloud HMS benchmark (20–60 beds)</span>
                  <span>₹ 15,000–25,000</span>
                </div>
                <div className="p-3 flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="font-sans">Cloud HMS benchmark (small/mid hospital)</span>
                  <span>₹ 35,000–60,000</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                OPERATING RESERVE
              </h3>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2">
                <span className="font-bold block">20% Monthly Operating Reserve:</span>
                <p className="text-[11px] leading-relaxed">
                  Carry a 20% monthly operating reserve for the first six production months: <strong>₹ 14,500/month</strong> at Growth. Then replace these bands with measured unit costs and signed vendor quotes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PAGE 13: B3 · EXCLUSIONS, DECISIONS AND COST CONTROLS */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
              B · ESTIMATES
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              B3 · Exclusions, decisions and cost controls
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
              <h3 className="font-extrabold text-rose-900 dark:text-rose-300 uppercase tracking-wider text-[11px]">
                NOT INCLUDED IN THESE ESTIMATES
              </h3>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                <li>• GST, cloud marketplace taxes, payment-gateway charges.</li>
                <li>• NABH consultant or assessor fees, legal opinions.</li>
                <li>• Enterprise OnlyOffice / Microsoft licences.</li>
                <li>• Bulk legacy-document manual indexing.</li>
                <li>• SMS/WhatsApp message charges and cyber-insurance.</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
              <h3 className="font-extrabold text-blue-900 dark:text-blue-300 uppercase tracking-wider text-[11px]">
                DECISIONS NEEDED TO FIRM UP
              </h3>
              <ol className="space-y-1.5 list-decimal list-inside text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                <li>Go-live channel: web only at launch.</li>
                <li>First-year hospital count and document growth.</li>
                <li>Support window: business hours vs 24x7.</li>
                <li>Data residency and disaster-recovery SLA.</li>
                <li>Preferred LLM providers &amp; human-review policy.</li>
              </ol>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-3">
              <h3 className="font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                ARCHITECTURAL COST CONTROLS
              </h3>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                <li>• Per-tenant AI budgets with alerts at 50%, 75%, 90%.</li>
                <li>• Cache safe derived results; never re-process unchanged files.</li>
                <li>• Queue conversions, reports, bulk imports and AI jobs.</li>
                <li>• Track cost per hospital, active user, document, AI job.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
