import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  Star, 
  Mail, 
  Phone, 
  Globe, 
  CheckCircle2, 
  Send, 
  Lock, 
  Share2, 
  QrCode, 
  ArrowLeftRight, 
  ExternalLink, 
  Layers, 
  Clock, 
  Award, 
  Briefcase, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  X,
  Sparkles
} from 'lucide-react';
import { DirectoryItem, AuthUser, UserRole } from '../types';
import { addEnquiry } from '../utils/enquiriesStorage';
import { generateThemedQrSvg, generateThemedQrPng, ThemedQrOptions } from '../utils/customQrGenerator';

interface PartnerDetailViewProps {
  partner: DirectoryItem;
  currentUser: AuthUser | null;
  onBack: () => void;
  onOpenAuth: (mode: 'signin' | 'signup', role?: UserRole) => void;
  onPostRequirement: () => void;
  isCompared?: boolean;
  onToggleCompare?: (id: string) => void;
  onOpenCompare?: () => void;
  onNotify?: (message: string) => void;
}

export const PartnerDetailView: React.FC<PartnerDetailViewProps> = ({
  partner,
  currentUser,
  onBack,
  onOpenAuth,
  onPostRequirement,
  isCompared = false,
  onToggleCompare,
  onOpenCompare,
  onNotify
}) => {
  // RFQ Submission state
  const [rfqSubject, setRfqSubject] = useState('');
  const [rfqMessage, setRfqMessage] = useState('');
  const [rfqSent, setRfqSent] = useState(false);

  // Profile Share & QR Code Modal state
  const [copiedDirectLink, setCopiedDirectLink] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalPng, setQrModalPng] = useState<string>('');
  const [qrModalSvg, setQrModalSvg] = useState<string>('');
  const [copiedQrLink, setCopiedQrLink] = useState(false);

  // Compute canonical direct profile URL
  const canonicalProfileUrl = useMemo(() => {
    if (typeof window === 'undefined') return `http://nova-h.in/partner/${partner.id}`;
    const origin = window.location.origin.includes('localhost') || window.location.origin.includes('asia-southeast1')
      ? window.location.origin
      : 'http://nova-h.in';
    return `${origin}/partner/${encodeURIComponent(partner.id)}`;
  }, [partner.id]);

  // Generate Profile QR Code
  useEffect(() => {
    if (!qrModalOpen) return;

    const themeOptions: ThemedQrOptions = {
      darkColor: '#005C5E',
      eyeCenterColor: '#008A8F',
      bgColor: '#ffffff',
      margin: 3,
      dotScale: 0.44,
      errorCorrectionLevel: 'H',
      width: 1024,
      logoUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRUZWFsIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzAwNUM1RSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDA4QThGIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIHJ4PSI1NiIgZmlsbD0idXJsKCNncmFkVGVhbCkiIC8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEyLCAwKSI+ICAgIAogICAgPHRleHQgeD0iMTI4IiB5PSIxODAiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI5MDAiIGZvbnQtc2l6ZT0iMTYwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TjwvdGV4dD4KICAgIDxjaXJjbGUgY3g9IjE5NiIgY3k9IjE3MiIgcj0iMTYiIGZpbGw9IiNlZjQ0NDQiIC8+CiAgPC9nPgo8L3N2Zz4='
    };

    const svg = generateThemedQrSvg(canonicalProfileUrl, themeOptions);
    setQrModalSvg(svg);

    generateThemedQrPng(canonicalProfileUrl, themeOptions)
      .then((png) => setQrModalPng(png))
      .catch((err) => console.error('Failed to generate partner QR PNG:', err));
  }, [qrModalOpen, canonicalProfileUrl]);

  const handleCopyProfileUrl = () => {
    navigator.clipboard.writeText(canonicalProfileUrl);
    setCopiedDirectLink(true);
    if (onNotify) onNotify('Direct profile URL copied to clipboard.');
    setTimeout(() => setCopiedDirectLink(false), 2500);
  };

  const handleCopyQrLink = () => {
    navigator.clipboard.writeText(canonicalProfileUrl);
    setCopiedQrLink(true);
    if (onNotify) onNotify('QR code target link copied to clipboard.');
    setTimeout(() => setCopiedQrLink(false), 2500);
  };

  const handleDownloadQrPng = () => {
    if (!qrModalPng) return;
    const link = document.createElement('a');
    link.download = `nova-partner-${partner.id}-qr.png`;
    link.href = qrModalPng;
    link.click();
  };

  const handleDownloadQrSvg = () => {
    if (!qrModalSvg) return;
    const blob = new Blob([qrModalSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `nova-partner-${partner.id}-qr.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSendRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('signin');
      return;
    }

    if (!rfqMessage.trim()) return;

    addEnquiry({
      targetId: partner.id,
      targetName: partner.name,
      targetEmail: partner.contactEmail || 'contact@partner.in',
      targetRole: partner.role,
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      senderPhone: currentUser.phone,
      senderRole: currentUser.role,
      senderCompany: currentUser.company,
      subject: rfqSubject.trim() || `Inquiry regarding ${partner.category}`,
      message: rfqMessage.trim(),
      projectLocation: partner.location,
      projectStage: partner.projectStages?.[0] || partner.category
    });

    setRfqSent(true);
    if (onNotify) onNotify(`RFQ sent successfully to ${partner.name}.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 sm:py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Breadcrumb & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer transition-colors"
              title="Return to Directory search results"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Directory</span>
            </button>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {partner.role === 'vendor' ? 'Verified Vendors' : 'Healthcare Advisors'}
            </span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">
              {partner.name}
            </span>
          </div>

          {/* Quick Profile Actions: Compare, QR Code, Share */}
          <div className="flex flex-wrap items-center gap-2">
            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(partner.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs ${
                  isCompared
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-800'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                }`}
                title="Compare this profile with others"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>{isCompared ? 'Compared' : 'Compare Profile'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              title="Generate scannable QR code for this partner profile"
            >
              <QrCode className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Profile QR</span>
            </button>

            <button
              type="button"
              onClick={handleCopyProfileUrl}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Copy link to this partner profile"
            >
              {copiedDirectLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedDirectLink ? 'Copied Link' : 'Share Profile'}</span>
            </button>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/50 dark:bg-blue-950/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4 sm:gap-5">
              {/* Entity Avatar / Monogram */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 shadow-md">
                {partner.name.charAt(0)}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    partner.role === 'vendor'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                  }`}>
                    {partner.role === 'vendor' ? 'Verified Vendor Partner' : 'Specialist Hospital Advisor'}
                  </span>

                  {partner.gstinVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>GSTIN Verified</span>
                    </span>
                  )}

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Est. {partner.yearsInBusiness || '10+'} yrs
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {partner.name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>{partner.location} (Pan-India Servicing)</span>
                  </span>

                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{partner.rating || '4.9'} ({partner.ratingCount || 18} Verified Promoter Reviews)</span>
                  </span>

                  {partner.gstin && (
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      GSTIN: {partner.gstin}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Price Range & Quick Contact CTA */}
            <div className="flex flex-col sm:items-end gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
              <div className="sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
                  Typical Project Engagement
                </span>
                <span className="text-lg font-black text-blue-700 dark:text-blue-400">
                  {partner.priceRange || 'Commercial Terms on Inquiry'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('partner-rfq-console')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request Quotation / RFQ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Two-Column Content Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column (8 cols): Credentials, Products, Stages, References */}
          <div className="lg:col-span-8 space-y-6">

            {/* Public Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Executive Summary &amp; Healthcare Track Record</span>
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {partner.description}
              </p>
            </div>

            {/* Products & Services Catalog */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Products &amp; Turnkey Execution Offerings</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Verified equipment catalogs and specialized clinical engineering capabilities.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {partner.productsAndServices?.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hospital Project Stages Served */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Hospital Lifecycle Stages Covered</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                This partner actively supports promoters and contractors during these project milestones.
              </p>

              <div className="flex flex-wrap gap-2">
                {partner.projectStages?.map((stage, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-bold text-xs"
                  >
                    {stage}
                  </span>
                ))}
              </div>
            </div>

            {/* Notable Hospital References & Project Footprint */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Client References &amp; Execution Footprint</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-center">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hospital Projects</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                    {partner.projectsCompleted || '35+'} Installed
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Bed Capacity</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">50 to 500 Beds</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Compliance</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">NABH &amp; AERB</span>
                </div>
              </div>

              {partner.keyClients && partner.keyClients.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Marquee Healthcare Institutions Served:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {partner.keyClients.map((client, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700"
                      >
                        {client}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column (4 cols): RFQ Dispatch & Verified Contact Card */}
          <div className="lg:col-span-4 space-y-6">

            {/* Direct RFQ / Inquiry Card */}
            <div id="partner-rfq-console" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  <Send className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Send Direct RFQ / Inquiry
                </h3>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Send technical specifications, boq documents, or project scopes directly to {partner.name}.
              </p>

              {rfqSent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    RFQ Dispatched Successfully
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    The partner will review your inquiry in their dashboard and reply to your contact email.
                  </p>
                  <button
                    type="button"
                    onClick={() => setRfqSent(false)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 underline cursor-pointer mt-2"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendRfq} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Subject / Equipment Scope
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Turnkey 100-bed ICU Life Support Systems RFQ"
                      value={rfqSubject}
                      onChange={(e) => setRfqSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Project Details / Inquiry Message *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Provide hospital bed count, location, tentative commissioning date, and technical boq questions..."
                      value={rfqMessage}
                      onChange={(e) => setRfqMessage(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{currentUser ? 'Submit RFQ to Partner' : 'Sign In to Submit RFQ'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Verified Contact Details Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Direct Contact Info</span>
              </h3>

              {currentUser ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Email</span>
                    <a 
                      href={`mailto:${partner.contactEmail}`}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{partner.contactEmail}</span>
                    </a>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Direct Phone</span>
                    <a 
                      href={`tel:${partner.phone}`}
                      className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{partner.phone}</span>
                    </a>
                  </div>

                  {partner.website && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Corporate Website</span>
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 mt-0.5"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{partner.website.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-center space-y-2.5">
                  <Lock className="w-6 h-6 text-amber-600 mx-auto" />
                  <p className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                    Direct phone numbers and commercial catalogs are protected for verified network members.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('signin')}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    Sign In to Unlock Full Contacts
                  </button>
                </div>
              )}
            </div>

            {/* Post Requirement Fallback */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white text-center space-y-2.5 shadow-md">
              <Sparkles className="w-6 h-6 text-indigo-300 mx-auto" />
              <h4 className="text-xs font-black tracking-tight uppercase">
                Need Multi-Vendor Competitive Quotes?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Post your hospital infrastructure requirement once to receive bids from multiple verified suppliers.
              </p>
              <button
                type="button"
                onClick={onPostRequirement}
                className="w-full py-2 bg-white text-indigo-950 rounded-xl text-xs font-extrabold hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                Post Hospital Requirement →
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Partner Profile QR Code Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 relative animate-scaleUp text-slate-900 dark:text-white">
            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight">
                  Partner Profile QR Code
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Scan to view {partner.name}&apos;s verified credentials
                </p>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4">
              <div className="relative p-2.5 bg-white rounded-xl border border-teal-600 shadow-md">
                <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-teal-600 rounded-tl-xs pointer-events-none" />
                <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-teal-600 rounded-tr-xs pointer-events-none" />
                <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-teal-600 rounded-bl-xs pointer-events-none" />
                <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-teal-600 rounded-br-xs pointer-events-none" />

                {qrModalPng ? (
                  <img
                    src={qrModalPng}
                    alt={`${partner.name} Profile QR Code`}
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-52 sm:h-52 bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-400">
                    Generating QR Code...
                  </div>
                )}
              </div>

              {/* Dedicated Copy Icon right beside QR code link selection */}
              <div className="mt-3 w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate flex-1" title={canonicalProfileUrl}>
                  {canonicalProfileUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyQrLink}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer shrink-0"
                  title="Copy direct profile URL"
                >
                  {copiedQrLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={handleDownloadQrPng}
                className="px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                <span>PNG</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadQrSvg}
                className="px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                <span>SVG</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
