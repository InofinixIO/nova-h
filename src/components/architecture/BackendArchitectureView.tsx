import React, { useState, useMemo } from 'react';
import { 
  Server, 
  Database, 
  Cpu, 
  Layers, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  Cloud, 
  MessageSquare, 
  Mail, 
  FileText, 
  HardDrive, 
  Activity, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Copy, 
  Check, 
  ChevronRight, 
  Info, 
  RefreshCw, 
  Zap, 
  Lock, 
  Globe, 
  Sliders, 
  Briefcase,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { ArchitectureFlowCanvas } from './ArchitectureFlowCanvas';
import { WordExportModal } from './WordExportModal';
import { ArchitectureAndEstimatesDocView } from './ArchitectureAndEstimatesDocView';

interface BackendArchitectureViewProps {
  onBack: () => void;
  onNotify: (msg: string) => void;
}

type TabType = 'architecture' | 'plan_document' | 'cost_calculator' | 'dev_timeline' | 'data_flow' | 'security' | 'archify_runtime';

export const BackendArchitectureView: React.FC<BackendArchitectureViewProps> = ({
  onBack,
  onNotify
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('architecture');
  const [copiedSpec, setCopiedSpec] = useState(false);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string>('api_gateway');

  // Interactive Cost Calculator State
  const [mau, setMau] = useState<number>(25000);
  const [rfpCount, setRfpCount] = useState<number>(350);
  const [whatsappConversations, setWhatsappConversations] = useState<number>(50000);
  const [emailVolume, setEmailVolume] = useState<number>(200000);
  const [storageGb, setStorageGb] = useState<number>(250);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  // Currency multiplier
  const fxRate = 84; // 1 USD = 84 INR approx

  // Presets
  const applyPreset = (preset: 'seed' | 'growth' | 'scale') => {
    if (preset === 'seed') {
      setMau(2500);
      setRfpCount(45);
      setWhatsappConversations(8000);
      setEmailVolume(35000);
      setStorageGb(40);
      onNotify('Loaded "Seed / Pilot Stage" scenario (2.5k MAU).');
    } else if (preset === 'growth') {
      setMau(25000);
      setRfpCount(350);
      setWhatsappConversations(50000);
      setEmailVolume(200000);
      setStorageGb(250);
      onNotify('Loaded "Growth Stage" scenario (25k MAU).');
    } else {
      setMau(120000);
      setRfpCount(2400);
      setWhatsappConversations(250000);
      setEmailVolume(1200000);
      setStorageGb(1500);
      onNotify('Loaded "Scale / Enterprise" scenario (120k MAU).');
    }
  };

  // Cost calculations
  const costs = useMemo(() => {
    // 1. Compute (Fastify/Node.js on AWS ECS or Render/Fly.io)
    // 1 container (~$20/mo) handles approx 5,000 MAU comfortably
    const containerCount = Math.max(2, Math.ceil(mau / 6000));
    const computeCost = containerCount * 28; // $28/container per month (e.g. 1 vCPU, 2GB RAM)

    // 2. Database (PostgreSQL on AWS RDS or Supabase)
    let dbCost = 35; // Base entry tier (2 vCPU, 4GB RAM)
    if (mau > 15000 && mau <= 60000) dbCost = 140; // 4 vCPU, 16GB RAM + auto backups
    else if (mau > 60000) dbCost = 420; // Multi-AZ + Read Replica + 32GB RAM

    // 3. In-memory Cache & Queue (Redis / BullMQ for WhatsApp & MJML jobs)
    let redisCost = 15;
    if (mau > 15000 && mau <= 60000) redisCost = 55;
    else if (mau > 60000) redisCost = 175;

    // 4. Object Storage & CDN (Cloudflare R2 - $0.015/GB with ZERO egress fees)
    const storageCost = Math.max(5, Math.ceil(storageGb * 0.015) + 5);

    // 5. Email Dispatch (Amazon SES: $0.10 per 1,000 emails)
    const emailCost = Math.max(3, Math.ceil((emailVolume / 1000) * 0.10));

    // 6. Meta WhatsApp Cloud API conversations (Avg blended rate ~$0.008 per utility/service/marketing conversation in India)
    const whatsappCost = Math.ceil(whatsappConversations * 0.0078);

    // 7. Observability, Logging & Sentry APM
    let opsCost = 15;
    if (mau > 15000 && mau <= 60000) opsCost = 65;
    else if (mau > 60000) opsCost = 190;

    const totalUsd = computeCost + dbCost + redisCost + storageCost + emailCost + whatsappCost + opsCost;
    const costPerMau = (totalUsd / Math.max(1, mau)).toFixed(3);

    return {
      computeCost,
      dbCost,
      redisCost,
      storageCost,
      emailCost,
      whatsappCost,
      opsCost,
      totalUsd,
      costPerMau,
      containerCount
    };
  }, [mau, rfpCount, whatsappConversations, emailVolume, storageGb]);

  const formatCost = (usdVal: number) => {
    if (currency === 'INR') {
      const inrVal = Math.round(usdVal * fxRate);
      return `₹${inrVal.toLocaleString('en-IN')}`;
    }
    return `$${usdVal.toLocaleString('en-US')}`;
  };

  const handleCopyProposal = async () => {
    const markdown = `# NOVA-H Backend Architecture & Infrastructure Cost Plan

## 1. Executive Summary
- Application: NOVA-H Healthcare Infrastructure & Equipment Procurement Network
- Architecture: TypeScript Modular Monolith (Node.js/Fastify) + PostgreSQL 16 + Redis/BullMQ
- File Storage: Cloudflare R2 ($0 egress fees for BoQ & medical catalogs)
- Communication: Amazon SES (Email) + Meta WhatsApp Cloud API (Interactive Flows)

## 2. Infrastructure Cost Projection (${mau.toLocaleString()} MAU)
- Total Monthly Cloud & API Spend: $${costs.totalUsd} / month (approx. ₹${(costs.totalUsd * fxRate).toLocaleString('en-IN')})
- Compute (API & Webhooks): $${costs.computeCost} / mo (${costs.containerCount} containers)
- Managed PostgreSQL: $${costs.dbCost} / mo
- Redis Cache & BullMQ Queue: $${costs.redisCost} / mo
- Storage & CDN (${storageGb} GB): $${costs.storageCost} / mo
- Email Dispatches (${emailVolume.toLocaleString()} emails): $${costs.emailCost} / mo
- WhatsApp Conversations (${whatsappConversations.toLocaleString()} chats): $${costs.whatsappCost} / mo
- Monitoring & Observability: $${costs.opsCost} / mo
- Estimated Unit Cost: $${costs.costPerMau} per MAU / month

## 3. Development Timeline & Budget
- Estimated Delivery: 14 - 16 Weeks (5 Milestones)
- Development Cost Estimate (India/Remote): $18,500 - $27,500
- Development Cost Estimate (US/EU): $75,000 - $110,000
`;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedSpec(true);
      onNotify('Copied full architecture & cost proposal to clipboard.');
      setTimeout(() => setCopiedSpec(false), 2500);
    } catch {
      onNotify('Failed to copy to clipboard.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            ← Return
          </button>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                System Engineering
              </span>
              <h1 className="text-sm font-black text-slate-900 dark:text-white">
                NOVA-H Backend Architecture &amp; Cost Modeling
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
              High-availability design, cloud infrastructure budgeting, and multi-tenant healthcare procurement specs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                currency === 'USD' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('INR')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                currency === 'INR' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              INR (₹)
            </button>
          </div>

          <ThemeToggle showMenu={false} size="sm" />

          <button
            onClick={() => setIsWordModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-95"
            title="Generate and download Microsoft Word (.docx) Specification for Architecture & Cost"
          >
            <div className="w-4 h-4 rounded-md bg-white text-blue-700 text-[10px] font-black flex items-center justify-center">
              W
            </div>
            <span>Word Doc (.docx)</span>
          </button>

          <button
            onClick={handleCopyProposal}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            {copiedSpec ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSpec ? 'Copied Brief!' : 'Copy Tech Brief'}</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex overflow-x-auto gap-2 py-2">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'architecture'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>XYFlow System Diagram</span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/20 text-white font-bold">
            Downloadable
          </span>
        </button>

        <button
          onClick={() => setActiveTab('plan_document')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'plan_document'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>Architecture &amp; Estimates Plan</span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            Doc &amp; PDF
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cost_calculator')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'cost_calculator'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Interactive Cost Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab('dev_timeline')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'dev_timeline'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Development Timeline &amp; Budget</span>
        </button>

        <button
          onClick={() => setActiveTab('data_flow')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'data_flow'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Database Schema &amp; Storage</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security &amp; Healthcare Compliance</span>
        </button>

        <button
          onClick={() => setActiveTab('archify_runtime')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'archify_runtime'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Archify Runtime Diagram</span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
            Blueprint Verified
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {/* ========================================================================= */}
        {/* TAB 1: INTERACTIVE RUNNING COST CALCULATOR */}
        {/* ========================================================================= */}
        {activeTab === 'cost_calculator' && (
          <div className="space-y-6">
            {/* Top Quick Presets Bar */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Quick Scale Scenarios:
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => applyPreset('seed')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  Seed Pilot (2.5k MAU)
                </button>
                <button
                  onClick={() => applyPreset('growth')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                >
                  Growth Stage (25k MAU)
                </button>
                <button
                  onClick={() => applyPreset('scale')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                >
                  Scale Enterprise (120k MAU)
                </button>
              </div>

              <button
                onClick={() => setIsWordModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Generate Word Document for current scale parameters"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export Word Doc (.docx)</span>
              </button>
            </div>

            {/* Split Grid: Sliders on Left, Monthly Cloud Bill on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Tunable Parameters */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Tunable Traffic &amp; Workload Metrics
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Adjust the active hospital promoters, vendor bids, and automated message volume to calculate running cost.
                  </p>
                </div>

                {/* Slider 1: Monthly Active Users (MAU) */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>Monthly Active Users (MAU)</span>
                    </label>
                    <span className="font-mono text-sm font-extrabold text-blue-600 dark:text-blue-400">
                      {mau.toLocaleString()} users
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={200000}
                    step={1000}
                    value={mau}
                    onChange={(e) => setMau(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1,000 (Launch)</span>
                    <span>50,000 (Mid-Market)</span>
                    <span>200,000 (National Scale)</span>
                  </div>
                </div>

                {/* Slider 2: RFPs & BoQ Submissions / month */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Monthly Hospital RFPs &amp; Bids</span>
                    </label>
                    <span className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {rfpCount.toLocaleString()} proposals
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={5000}
                    step={20}
                    value={rfpCount}
                    onChange={(e) => setRfpCount(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>10 projects</span>
                    <span>1,000 projects</span>
                    <span>5,000 projects</span>
                  </div>
                </div>

                {/* Slider 3: WhatsApp Flow Conversations */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                      <span>WhatsApp Business Automated Conversations</span>
                    </label>
                    <span className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {whatsappConversations.toLocaleString()} chats
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2000}
                    max={500000}
                    step={2000}
                    value={whatsappConversations}
                    onChange={(e) => setWhatsappConversations(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>2,000 chats</span>
                    <span>100,000 chats</span>
                    <span>500,000 chats</span>
                  </div>
                </div>

                {/* Slider 4: Email Volume */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-purple-500" />
                      <span>Transactional &amp; MJML Marketing Emails</span>
                    </label>
                    <span className="font-mono text-sm font-extrabold text-purple-600 dark:text-purple-400">
                      {emailVolume.toLocaleString()} emails
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={2000000}
                    step={10000}
                    value={emailVolume}
                    onChange={(e) => setEmailVolume(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>10k / mo</span>
                    <span>500k / mo</span>
                    <span>2.0M / mo</span>
                  </div>
                </div>

                {/* Slider 5: File & Drawing Storage */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                      <span>Hospital Blueprint &amp; BoQ Storage (GB)</span>
                    </label>
                    <span className="font-mono text-sm font-extrabold text-amber-600 dark:text-amber-400">
                      {storageGb.toLocaleString()} GB
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={3000}
                    step={10}
                    value={storageGb}
                    onChange={(e) => setStorageGb(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>10 GB</span>
                    <span>1,000 GB</span>
                    <span>3,000 GB</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Real-time Monthly Cost Summary */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {/* Total Grand Card */}
                <div className="p-6 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl shadow-lg border border-blue-900/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
                  
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-300 block mb-1">
                    Total Estimated Cloud &amp; API OpEx
                  </span>
                  <div className="text-4xl font-black tracking-tight text-white mb-1">
                    {formatCost(costs.totalUsd)}
                    <span className="text-sm font-semibold text-slate-300 ml-1.5">/ month</span>
                  </div>
                  <p className="text-xs text-blue-200/80 mb-4">
                    Covers compute, managed database, storage, WhatsApp API, and SES dispatches.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-blue-800/60 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Cost Per Active User</span>
                      <span className="font-mono font-bold text-white">
                        {currency === 'INR' ? `₹${(Number(costs.costPerMau) * fxRate).toFixed(2)}` : `$${costs.costPerMau}`} / MAU
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Active Node Containers</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {costs.containerCount} Cluster Nodes
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsWordModalOpen(true)}
                    className="w-full mt-4 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download Architecture &amp; Cost Word Spec (.docx)</span>
                  </button>
                </div>

                {/* Itemized Line Items Breakdown */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex-1 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                    Itemized Cost Line Items
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    {/* Compute */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Fastify / Node API Nodes</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCost(costs.computeCost)}</span>
                    </div>

                    {/* Database */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">PostgreSQL (Multi-AZ RDS/Neon)</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCost(costs.dbCost)}</span>
                    </div>

                    {/* Redis & Queues */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Redis &amp; BullMQ Workers</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCost(costs.redisCost)}</span>
                    </div>

                    {/* Cloudflare R2 Storage */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-3.5 h-3.5 text-sky-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Cloudflare R2 &amp; CDN ($0 egress)</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCost(costs.storageCost)}</span>
                    </div>

                    {/* WhatsApp Cloud API */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Meta WhatsApp Cloud API</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCost(costs.whatsappCost)}</span>
                    </div>

                    {/* Amazon SES Email */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-purple-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Amazon SES Email Relay</span>
                      </div>
                      <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{formatCost(costs.emailCost)}</span>
                    </div>

                    {/* Observability */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-rose-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Sentry APM &amp; Log Drains</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCost(costs.opsCost)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-[11px] text-blue-800 dark:text-blue-300 mt-4 leading-relaxed">
                    💡 <strong>Architectural Note:</strong> By storing hospital CAD blueprints and vendor BoQ sheets in <strong>Cloudflare R2</strong> instead of AWS S3, you save approximately <strong>$0.09 per GB in bandwidth egress fees</strong>, keeping operational costs exceptionally low as download volume spikes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: HIGH-LEVEL ARCHITECTURE DIAGRAM (XYFLOW) */}
        {/* ========================================================================= */}
        {activeTab === 'architecture' && (
          <div className="space-y-4">
            <ArchitectureFlowCanvas onNotify={onNotify} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: ARCHITECTURE & ESTIMATES PLAN DOCUMENT (MATCHING ATTACHMENT) */}
        {/* ========================================================================= */}
        {activeTab === 'plan_document' && (
          <ArchitectureAndEstimatesDocView onNotify={onNotify} />
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DEVELOPMENT TIMELINE & BUDGET */}
        {/* ========================================================================= */}
        {activeTab === 'dev_timeline' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-0.5">
                  Engineering Roadmap
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  15-Week End-to-End Implementation Schedule
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Detailed phase milestones, engineering allocations, and development cost estimates.
                </p>
              </div>

              {/* Phase Milestones Timeline */}
              <div className="space-y-4">
                {[
                  {
                    phase: 'Phase 1: Foundations & Auth',
                    weeks: 'Weeks 1 – 3',
                    badge: 'Foundations',
                    color: 'blue',
                    scope: 'PostgreSQL schema migrations (Drizzle ORM), multi-role RBAC (Hospital Owner, Vendor, Advisor, Admin), JWT session handling, Cloudflare R2 pre-signed uploads.',
                    indiaBudget: '$3,500 – $5,000',
                    usBudget: '$15,000 – $22,000'
                  },
                  {
                    phase: 'Phase 2: Procurement & RFP Engine',
                    weeks: 'Weeks 4 – 7',
                    badge: 'Core Business',
                    color: 'emerald',
                    scope: 'Hospital project milestone tracking (15 stages), sealed BoQ bidding, quotation comparison matrices, quotation acceptance, revision audit trails.',
                    indiaBudget: '$5,000 – $7,500',
                    usBudget: '$20,000 – $30,000'
                  },
                  {
                    phase: 'Phase 3: WhatsApp Engine & Webhooks',
                    weeks: 'Weeks 8 – 10',
                    badge: 'Automations',
                    color: 'emerald',
                    scope: 'Meta WhatsApp Cloud API webhook ingestion, idempotency handlers, dynamic graph execution engine, Redis session timeout handling.',
                    indiaBudget: '$4,000 – $6,000',
                    usBudget: '$16,000 – $24,000'
                  },
                  {
                    phase: 'Phase 4: MJML Studio Backend & Email Relay',
                    weeks: 'Weeks 11 – 12',
                    badge: 'Marketing Tech',
                    color: 'purple',
                    scope: 'Server-side MJML compilation endpoint, template versioning, Amazon SES integration, BullMQ batched delivery queue with open/click tracking.',
                    indiaBudget: '$3,000 – $4,500',
                    usBudget: '$12,000 – $18,000'
                  },
                  {
                    phase: 'Phase 5: Security Hardening & Launch',
                    weeks: 'Weeks 13 – 15',
                    badge: 'Production Ready',
                    color: 'amber',
                    scope: 'Load testing (10,000 concurrent requests), OWASP Top 10 vulnerability audit, ClamAV antivirus file scanning, CI/CD automated deployment pipelines.',
                    indiaBudget: '$3,000 – $4,500',
                    usBudget: '$12,000 – $16,000'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {item.phase}
                        </span>
                        <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {item.weeks}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.scope}
                      </p>
                    </div>

                    <div className="flex md:flex-col items-end justify-between shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 block text-right">Cost (India / Remote):</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {item.indiaBudget}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[10px] text-slate-400 block text-right">Cost (US / EU Agency):</span>
                        <span className="font-mono font-bold text-slate-500">
                          {item.usBudget}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary Row */}
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-extrabold text-sm text-purple-900 dark:text-purple-200">
                    Total Estimated Development Investment
                  </h4>
                  <p className="text-purple-700 dark:text-purple-300 text-[11px] mt-0.5">
                    15 Weeks to production launch with 2 senior backend engineers + 0.5 DevOps + 0.5 QA.
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block">India / Remote Team:</span>
                    <span className="text-base font-black text-purple-900 dark:text-purple-100 font-mono">
                      $18,500 – $27,500
                    </span>
                  </div>
                  <div className="h-8 w-px bg-purple-200 dark:bg-purple-800 hidden sm:block" />
                  <div>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block">US / Western EU Team:</span>
                    <span className="text-base font-black text-purple-900 dark:text-purple-100 font-mono">
                      $75,000 – $110,000
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DATABASE SCHEMA & DATA FLOW */}
        {/* ========================================================================= */}
        {activeTab === 'data_flow' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                  Relational Schema Blueprint
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  PostgreSQL Core Tables &amp; Relationships
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Designed for ACID transactional consistency across hospital RFPs, vendor bids, and automated message states.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                {/* Table 1: Users & Profiles */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700 mb-2">
                    <span>users &amp; profiles</span>
                    <span className="text-[10px] text-blue-500">Table</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                    <li><span className="text-blue-600 font-bold">id:</span> uuid [PK]</li>
                    <li><span className="text-blue-600 font-bold">role:</span> varchar (owner|vendor|advisor|admin)</li>
                    <li><span className="text-blue-600 font-bold">email:</span> varchar [UNIQUE]</li>
                    <li><span className="text-blue-600 font-bold">phone:</span> varchar [E.164 standard]</li>
                    <li><span className="text-blue-600 font-bold">company_name:</span> varchar</li>
                    <li><span className="text-blue-600 font-bold">verification_status:</span> enum</li>
                    <li><span className="text-blue-600 font-bold">created_at:</span> timestamptz</li>
                  </ul>
                </div>

                {/* Table 2: Project Requirements / RFPs */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700 mb-2">
                    <span>project_rfps</span>
                    <span className="text-[10px] text-emerald-500">Table</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                    <li><span className="text-emerald-600 font-bold">id:</span> uuid [PK]</li>
                    <li><span className="text-emerald-600 font-bold">promoter_id:</span> uuid [FK -&gt; users.id]</li>
                    <li><span className="text-emerald-600 font-bold">hospital_name:</span> varchar</li>
                    <li><span className="text-emerald-600 font-bold">stage_id:</span> varchar</li>
                    <li><span className="text-emerald-600 font-bold">bed_capacity:</span> integer</li>
                    <li><span className="text-emerald-600 font-bold">budget_min / max:</span> bigint</li>
                    <li><span className="text-emerald-600 font-bold">status:</span> varchar (draft|open|awarded)</li>
                    <li><span className="text-emerald-600 font-bold">boq_schema:</span> jsonb</li>
                  </ul>
                </div>

                {/* Table 3: Vendor Quotations & Bids */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700 mb-2">
                    <span>vendor_quotations</span>
                    <span className="text-[10px] text-purple-500">Table</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                    <li><span className="text-purple-600 font-bold">id:</span> uuid [PK]</li>
                    <li><span className="text-purple-600 font-bold">rfp_id:</span> uuid [FK -&gt; project_rfps.id]</li>
                    <li><span className="text-purple-600 font-bold">vendor_id:</span> uuid [FK -&gt; users.id]</li>
                    <li><span className="text-purple-600 font-bold">bid_amount:</span> bigint (INR)</li>
                    <li><span className="text-purple-600 font-bold">delivery_weeks:</span> integer</li>
                    <li><span className="text-purple-600 font-bold">is_sealed:</span> boolean</li>
                    <li><span className="text-purple-600 font-bold">quote_items:</span> jsonb</li>
                  </ul>
                </div>

                {/* Table 4: MJML Templates */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700 mb-2">
                    <span>mjml_templates</span>
                    <span className="text-[10px] text-amber-500">Table</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                    <li><span className="text-amber-600 font-bold">id:</span> varchar [PK]</li>
                    <li><span className="text-amber-600 font-bold">title:</span> varchar</li>
                    <li><span className="text-amber-600 font-bold">subject_line:</span> varchar</li>
                    <li><span className="text-amber-600 font-bold">blocks_ast:</span> jsonb</li>
                    <li><span className="text-amber-600 font-bold">compiled_html:</span> text</li>
                    <li><span className="text-amber-600 font-bold">created_by:</span> uuid [FK]</li>
                  </ul>
                </div>

                {/* Table 5: WhatsApp Flow Sessions */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700 mb-2">
                    <span>whatsapp_sessions</span>
                    <span className="text-[10px] text-teal-500">Table</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                    <li><span className="text-teal-600 font-bold">id:</span> uuid [PK]</li>
                    <li><span className="text-teal-600 font-bold">phone_hash:</span> varchar [INDEX]</li>
                    <li><span className="text-teal-600 font-bold">current_node_id:</span> varchar</li>
                    <li><span className="text-teal-600 font-bold">flow_state:</span> jsonb</li>
                    <li><span className="text-teal-600 font-bold">last_message_at:</span> timestamptz</li>
                  </ul>
                </div>

                {/* Table 6: Document Attachments */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700 mb-2">
                    <span>document_attachments</span>
                    <span className="text-[10px] text-rose-500">Table</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                    <li><span className="text-rose-600 font-bold">id:</span> uuid [PK]</li>
                    <li><span className="text-rose-600 font-bold">r2_object_key:</span> text</li>
                    <li><span className="text-rose-600 font-bold">file_name:</span> varchar</li>
                    <li><span className="text-rose-600 font-bold">file_size_bytes:</span> bigint</li>
                    <li><span className="text-rose-600 font-bold">mime_type:</span> varchar</li>
                    <li><span className="text-rose-600 font-bold">is_virus_scanned:</span> boolean</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SECURITY & COMPLIANCE */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-0.5">
                  Governance &amp; Safeguards
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Healthcare Compliance &amp; Sealed Bidding Security
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Protecting hospital project proprietary blueprints, vendor commercial quotes, and user PII.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Cryptographic Sealed Bidding
                    </h4>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    To eliminate vendor bid-tampering or favoritism, quotation prices are encrypted with an asymmetric public key upon submission. Decryption keys are held in escrow and automatically unlocked only when the RFP submission window officially closes.
                  </p>
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complies with public and private healthcare procurement standards</span>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Zero-Trust Storage &amp; Antivirus Scanning
                    </h4>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    All file uploads (PDF BoQs, AutoCAD drawings, equipment catalogs) stream directly to temporary isolated buckets via pre-signed URLs. ClamAV asynchronous background workers scan the binary before promoting to the production Cloudflare R2 bucket.
                  </p>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Prevents malware transmission across hospital network users</span>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-600" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Data Residency &amp; Encryption Standards
                    </h4>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    All hospital and vendor database records reside in the <strong>AWS Mumbai (ap-south-1)</strong> or nearest local sovereign cloud region to adhere to Indian healthcare data residency policies. All data is encrypted at rest via AES-256 and in transit via TLS 1.3.
                  </p>
                  <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>NABH &amp; ISO 27001 audit compliant configuration</span>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-600" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Immutable Audit Logs &amp; Traceability
                    </h4>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Every admin impersonation, quote acceptance, price revision, and WhatsApp webhook event is appended to an immutable append-only audit trail table with IP addresses, timestamps, and cryptographic hashes.
                  </p>
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete transparency for multi-crore medical equipment tenders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Archify Runtime Diagram Tab Content */}
        {activeTab === 'archify_runtime' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Archify v3.0.1
                  </span>
                  <span className="text-slate-400 text-xs">·</span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified from Repository Code
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Hospital Procurement &amp; RFP Runtime Architecture
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Generated using Archify CLI with Blueprint styling. Only includes verified components from the codebase without hypothetical inferences.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/archify-procurement-runtime.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Standalone HTML</span>
                </a>
              </div>
            </div>

            {/* Embedded Interactive Viewer */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Interactive Blueprint Canvas (Pan, Zoom &amp; Explore Nodes)
                </span>
                <span>Preset: Blueprint · Quality: Showcase</span>
              </div>
              <iframe
                src="/archify-procurement-runtime.html"
                title="Archify Procurement Architecture Diagram"
                className="w-full h-[650px] border-0"
              />
            </div>

            {/* Verification & Evidence Matrix */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Verified Repository Components Grounding Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Presentation Layer</p>
                  <p className="text-slate-500 font-mono text-[11px]">src/components/procurement/*</p>
                  <ul className="text-slate-600 dark:text-slate-300 list-disc list-inside space-y-0.5 text-[11px]">
                    <li>ProcurementWorkspace.tsx</li>
                    <li>RfpCreateModal.tsx</li>
                    <li>VendorBidWorkspace.tsx</li>
                    <li>ExternalQuoteUploadModal.tsx</li>
                    <li>ComparisonMatrixView.tsx</li>
                    <li>TcoCalculatorView.tsx</li>
                    <li>ClarificationCycleView.tsx</li>
                    <li>RfpDossierPrintModal.tsx</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Type Contracts &amp; State</p>
                  <p className="text-slate-500 font-mono text-[11px]">src/types.ts</p>
                  <ul className="text-slate-600 dark:text-slate-300 list-disc list-inside space-y-0.5 text-[11px]">
                    <li>RFPLifecycleStatus (16 states)</li>
                    <li>RFPItem &amp; RFPRequirementItem</li>
                    <li>RFPQuote &amp; QuoteCommercials</li>
                    <li>AIExtractionDetails</li>
                    <li>RFPTCOCalculation</li>
                    <li>UserRole (owner/vendor/advisor)</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Persistence Layer</p>
                  <p className="text-slate-500 font-mono text-[11px]">prisma/schema.prisma</p>
                  <ul className="text-slate-600 dark:text-slate-300 list-disc list-inside space-y-0.5 text-[11px]">
                    <li>model User &amp; model Role</li>
                    <li>model RFP &amp; model RfpStatus</li>
                    <li>model Quotation &amp; Specs</li>
                    <li>model ClarificationQuestion</li>
                    <li>model TCOProjection</li>
                    <li>model AuditEvent</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Word Document (.docx) Export Modal */}
      <WordExportModal
        isOpen={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
        costParams={{
          mau,
          rfpCount,
          whatsappConversations,
          emailVolume,
          storageGb,
          currency: currency === 'USD' ? 'USD' : 'INR',
          fxRate
        }}
        costs={costs}
        fxRate={fxRate}
        onNotify={onNotify}
      />
    </div>
  );
};
