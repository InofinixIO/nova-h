import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  MapPin, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  QrCode, 
  Layers, 
  ArrowRight, 
  FileDown, 
  Palette,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { generateThemedQrSvg, generateThemedQrPng, ThemedQrOptions } from '../utils/customQrGenerator';
import { 
  buildDirectoryUrl, 
  buildDirectoryQueryString, 
  getDirectoryParamsFromUrl, 
  DirectorySearchParams 
} from '../utils/directoryQueryParams';
import { SectionHeading } from './SectionHeading';

interface PamphletSectionProps {
  onSimulateScan?: () => void;
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
  onNavigate?: (slug: any) => void;
  isDirectPage?: boolean;
  initialCriteria?: DirectorySearchParams;
}

const INDIAN_METROS = [
  'All',
  'Mumbai',
  'Delhi NCR',
  'Bengaluru',
  'Chennai',
  'Hyderabad',
  'Kolkata',
  'Ahmedabad',
  'Pune',
  'Jaipur',
  'Lucknow',
  'Kochi',
  'Chandigarh',
  'Indore',
  'Bhopal',
  'Nagpur',
  'Coimbatore'
];

const HOSPITAL_STAGES = [
  'All',
  'Planning & Feasibility',
  'Design & Architecture',
  'Statutory Approvals',
  'Civil Construction & MEP',
  'Interiors & Cleanrooms',
  'IT, HIS & Softwares',
  'Equipment Procurement',
  'Recruitment & Staffing',
  'Commissioning & Pre-op',
  'Branding & Marketing',
  'Operational Expansion',
  'Maintenance & AMC'
];

const STAGE_CATEGORIES: Record<string, string[]> = {
  'Planning & Feasibility': ['Feasibility & Strategy', 'Hospital Consulting', 'Detailed Project Reports (DPR)', 'Financial Modeling'],
  'Design & Architecture': ['Hospital Architecture & Space Planning', 'AERB Radiation Bunker Design', 'Clinical Circulation & Zoning'],
  'Statutory Approvals': ['Statutory Licensing & Compliance', 'AERB Radiation Safety Clearance', 'Pollution Control Board CTE/CTO'],
  'Civil Construction & MEP': ['Civil Construction & Structural Engineering', 'MEP, HVAC & Critical Utilities', 'Cleanroom & Modular OT Infrastructure', 'Medical Gas Pipeline Systems (MGPS)'],
  'Interiors & Cleanrooms': ['Hospital Interiors & Healing Architecture', 'Antimicrobial Conductive Flooring', 'Acoustic Ceilings & Wall Paneling'],
  'IT, HIS & Softwares': ['Digital Healthcare & IT Systems', 'Hospital Information System (HIS)', 'Cloud PACS & DICOM Imaging'],
  'Equipment Procurement': ['Diagnostic Imaging (MRI, CT, X-Ray)', 'Operating Theatre & Surgical Consoles', 'Critical Care & ICU Life Support', 'Biomedical Engineering & Turnkey'],
  'Recruitment & Staffing': ['Clinical & Administrative Talent', 'Healthcare HR & Doctor Credentialing'],
  'Commissioning & Pre-op': ['Testing, Commissioning & Dry Runs', 'NABH Quality Accreditation Support'],
  'Branding & Marketing': ['Marketing, Outreach & Community Connect', 'Hospital Branding & Digital PR'],
  'Operational Expansion': ['Operations, Clinical Audits & NABH Journey', 'Hospital Management Consulting'],
  'Maintenance & AMC': ['Facility Management & Equipment AMC', 'Biomedical Equipment Calibration']
};

export const PamphletSection: React.FC<PamphletSectionProps> = ({
  onSimulateScan,
  onOpenAuth,
  onNavigate,
  isDirectPage = false,
  initialCriteria
}) => {
  // Directory Search Criteria for Tailored QR Code
  const initialUrlParams = useMemo(() => getDirectoryParamsFromUrl(), []);

  const [qrRole, setQrRole] = useState<'all' | 'vendor' | 'advisor'>(
    initialCriteria?.role || initialUrlParams.role || 'vendor'
  );
  const [qrLocation, setQrLocation] = useState<string>(
    initialCriteria?.location || initialUrlParams.location || 'All'
  );
  const [qrStage, setQrStage] = useState<string>(
    initialCriteria?.stage || initialUrlParams.stage || 'All'
  );
  const [qrCategory, setQrCategory] = useState<string>(
    initialCriteria?.category || initialUrlParams.category || 'All'
  );
  const [qrKeyword, setQrKeyword] = useState<string>(
    initialCriteria?.q || initialUrlParams.q || ''
  );

  const availableCategories = useMemo(() => {
    if (qrStage === 'All') {
      const allCats = new Set<string>();
      Object.values(STAGE_CATEGORIES).forEach(cats => cats.forEach(c => allCats.add(c)));
      return ['All', ...Array.from(allCats)];
    }
    return ['All', ...(STAGE_CATEGORIES[qrStage] || [])];
  }, [qrStage]);

  // Compute initial target URL
  const initialComputedUrl = useMemo(() => {
    return buildDirectoryUrl(
      {
        q: initialCriteria?.q || initialUrlParams.q || '',
        role: initialCriteria?.role || initialUrlParams.role || 'vendor',
        stage: initialCriteria?.stage || initialUrlParams.stage || 'All',
        category: initialCriteria?.category || initialUrlParams.category || 'All',
        location: initialCriteria?.location || initialUrlParams.location || 'All',
      },
      '/directory',
      'http://nova-h.in'
    );
  }, []);

  const [targetUrl, setTargetUrl] = useState<string>(initialComputedUrl);
  const [includeScanParams, setIncludeScanParams] = useState(true);
  const [themeStyle, setThemeStyle] = useState<'attached-theme' | 'classic'>('attached-theme');
  const [qrPngUrl, setQrPngUrl] = useState<string>('');
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [printSize, setPrintSize] = useState<'a4' | 'flyer'>('a4');
  const pamphletRef = useRef<HTMLDivElement>(null);

  // Explicit handler to update QR code based on directory search criteria
  const handleApplyCriteriaToQr = (explicitTerm?: string) => {
    const kw = typeof explicitTerm === 'string' ? explicitTerm.trim() : qrKeyword.trim();
    const newUrl = buildDirectoryUrl(
      {
        q: kw,
        role: qrRole,
        stage: qrStage,
        category: qrCategory,
        location: qrLocation
      },
      '/directory',
      'http://nova-h.in'
    );
    setTargetUrl(newUrl);
  };

  const handleResetQrCriteria = () => {
    setQrRole('all');
    setQrLocation('All');
    setQrStage('All');
    setQrCategory('All');
    setQrKeyword('');
    setTargetUrl('http://nova-h.in/directory');
  };

  // Compute final effective URL
  const effectiveUrl = includeScanParams
    ? (targetUrl.includes('?') 
        ? `${targetUrl}&scan=true${qrRole !== 'all' ? `&type=${qrRole}` : ''}` 
        : `${targetUrl}?scan=true${qrRole !== 'all' ? `&type=${qrRole}` : ''}`)
    : targetUrl;

  // Generate QR code matching the attached design theme
  useEffect(() => {
    const themeOptions: ThemedQrOptions = themeStyle === 'attached-theme'
      ? {
          darkColor: '#005C5E',      // Deep teal for rings & dots (matches image)
          eyeCenterColor: '#008A8F', // Vibrant cyan-teal for eye centers
          bgColor: '#ffffff',
          margin: 3,
          dotScale: 0.44,
          errorCorrectionLevel: 'H',
          width: 1024,
          logoUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRUZWFsIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzAwNUM1RSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDA4QThGIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIHJ4PSI1NiIgZmlsbD0idXJsKCNncmFkVGVhbCkiIC8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEyLCAwKSI+ICAgIAogICAgPHRleHQgeD0iMTI4IiB5PSIxODAiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI5MDAiIGZvbnQtc2l6ZT0iMTYwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TjwvdGV4dD4KICAgIDxjaXJjbGUgY3g9IjE5NiIgY3k9IjE3MiIgcj0iMTYiIGZpbGw9IiNlZjQ0NDQiIC8+CiAgPC9nPgo8L3N2Zz4='
        }
      : {
          darkColor: '#0f172a',      // Classic slate
          eyeCenterColor: '#1e293b',
          bgColor: '#ffffff',
          margin: 3,
          dotScale: 0.44,
          errorCorrectionLevel: 'H',
          width: 1024,
          logoUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRTbGF0ZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwZjE3MmEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzFlMjkzYiIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiByeD0iNTYiIGZpbGw9InVybCgjZ3JhZFNsYXRlKSIgLz4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTIsIDApIj4gICAgCiAgICA8dGV4dCB4PSIxMjgiIHk9IjE4MCIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwgLWFwcGxlLXN5c3RlbSwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjkwMCIgZm9udC1zaXplPSIxNjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OPC90ZXh0PgogICAgPGNpcmNsZSBjeD0iMTk2IiBjeT0iMTcyIiByPSIxNiIgZmlsbD0iI2VmNDQ0NCIgLz4KICA8L2c+Cjwvc3ZnPg=='
        };

    const svg = generateThemedQrSvg(effectiveUrl, themeOptions);
    setQrSvgString(svg);

    generateThemedQrPng(effectiveUrl, themeOptions)
      .then((png) => setQrPngUrl(png))
      .catch((err) => console.error('Failed to render themed QR PNG:', err));
  }, [effectiveUrl, themeStyle]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(effectiveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPng = () => {
    if (!qrPngUrl) return;
    const link = document.createElement('a');
    link.download = 'nova-directory-qr-code.png';
    link.href = qrPngUrl;
    link.click();
  };

  const handleDownloadSvg = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'nova-directory-qr-code.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="pamphlet-section" className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <SectionHeading id="pamphlet-section" className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
            Printable Pamphlet & Smart QR Code
          </SectionHeading>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mt-3">
            Auto-detects scanner location and filters for verified healthcare vendors in the area.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-850 rounded-2xl w-full border border-slate-200 dark:border-slate-750 flex flex-col shadow-sm">

        {/* Directory Search & Filter QR Customizer (Requirement #2) */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-teal-50/80 via-blue-50/50 to-slate-50 dark:from-slate-850 dark:via-slate-800 dark:to-slate-850 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-600 text-white shadow-2xs">
                <Filter className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Directory Search Criteria Embedded in QR</span>
                  <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                    Smart Embedding
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select criteria to generate targeted QR codes for specific regions, hospital project stages, or equipment categories.
                </p>
              </div>
            </div>

            {(qrLocation !== 'All' || qrStage !== 'All' || qrCategory !== 'All' || qrKeyword !== '' || qrRole !== 'all') && (
              <button
                type="button"
                onClick={handleResetQrCriteria}
                className="text-xs text-blue-700 dark:text-blue-400 hover:text-blue-900 font-semibold cursor-pointer flex items-center gap-1 self-start md:self-auto"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset to All India</span>
              </button>
            )}
          </div>

          {/* 5 Criteria Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            {/* 1. Location */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Target City / Region
              </label>
              <select
                id="qr-filter-location"
                value={qrLocation}
                onChange={(e) => {
                  setQrLocation(e.target.value);
                }}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600 cursor-pointer shadow-2xs"
              >
                {INDIAN_METROS.map((city) => (
                  <option key={city} value={city}>{city === 'All' ? 'All India (National)' : city}</option>
                ))}
              </select>
            </div>

            {/* 2. Role */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Community Role
              </label>
              <select
                id="qr-filter-role"
                value={qrRole}
                onChange={(e) => {
                  setQrRole(e.target.value as any);
                }}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600 cursor-pointer shadow-2xs"
              >
                <option value="all">All Partners</option>
                <option value="vendor">Verified Vendors</option>
                <option value="advisor">Hospital Advisors</option>
              </select>
            </div>

            {/* 3. Project Stage */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Project Stage
              </label>
              <select
                id="qr-filter-stage"
                value={qrStage}
                onChange={(e) => {
                  setQrStage(e.target.value);
                  setQrCategory('All');
                }}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600 cursor-pointer shadow-2xs"
              >
                {HOSPITAL_STAGES.map((stg) => (
                  <option key={stg} value={stg}>{stg}</option>
                ))}
              </select>
            </div>

            {/* 4. Specialty / Category */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Specialty / Category
              </label>
              <select
                id="qr-filter-category"
                value={qrCategory}
                onChange={(e) => {
                  setQrCategory(e.target.value);
                }}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600 cursor-pointer shadow-2xs"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* 5. Keyword & Explicit Search Button */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Keyword / Company
              </label>
              <div className="flex gap-1.5">
                <input
                  id="qr-filter-keyword"
                  type="text"
                  placeholder="e.g. MRI, Modular OT..."
                  value={qrKeyword}
                  onChange={(e) => setQrKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCriteriaToQr();
                    }
                  }}
                  className="flex-1 min-w-0 px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600 shadow-2xs"
                />
                <button
                  type="button"
                  id="qr-explicit-apply-btn"
                  onClick={() => handleApplyCriteriaToQr()}
                  className="px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
                  title="Apply search criteria to generate QR code"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Apply</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 min-w-[280px]">
            <span className="font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">Target URL:</span>
            <div className="flex items-center flex-1 relative">
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg pl-3 pr-8 py-1.5 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="absolute right-1.5 p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Copy target URL"
                aria-label="Copy target URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                checked={includeScanParams}
                onChange={(e) => setIncludeScanParams(e.target.checked)}
                className="w-3.5 h-3.5 text-teal-700 rounded-sm focus:ring-teal-500"
              />
              <span>+ Geo &amp; Vendor Filter</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Theme Toggle */}
            <div className="flex rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setThemeStyle('attached-theme')}
                className={`px-2.5 py-1 rounded-md font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  themeStyle === 'attached-theme'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Circular teal rings and dots matching uploaded sample"
              >
                <Palette className="w-3 h-3" />
                <span>Teal Dots Theme</span>
              </button>
              <button
                type="button"
                onClick={() => setThemeStyle('classic')}
                className={`px-2.5 py-1 rounded-md font-bold text-xs transition-all cursor-pointer ${
                  themeStyle === 'classic'
                    ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Classic Slate
              </button>
            </div>

            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadPng}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-teal-800 dark:text-teal-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Download high-resolution 1024x1024 PNG"
            >
              <Download className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>PNG</span>
            </button>

            <button
              onClick={handleDownloadSvg}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-teal-800 dark:text-teal-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Download vector SVG for offset printing"
            >
              <FileDown className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>SVG</span>
            </button>
          </div>
        </div>

        {/* Pamphlet Interactive Preview */}
        <div className="p-4 sm:p-8 bg-slate-100 dark:bg-slate-950/80 flex flex-col items-center justify-center">
          
          {/* Action Bar Above Preview */}
          <div className="w-full max-w-xl mb-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Pamphlet Preview</span>
              <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-blue-200 dark:border-blue-800">
                Print Ready
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPrintSize('a4')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  printSize === 'a4' ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Standard Flyer
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pamphlet</span>
              </button>
            </div>
          </div>

          {/* THE PRINTABLE PAMPHLET FLYER CARD */}
          <div 
            ref={pamphletRef}
            id="printable-pamphlet"
            className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200/90 p-6 sm:p-8 relative overflow-hidden text-slate-900"
          >
            {/* Subtle corner watermark / aesthetic accent */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-50 rounded-full pointer-events-none opacity-60" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-indigo-50 rounded-full pointer-events-none opacity-60" />

            {/* Header: NOVA Brand & Title */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white font-black text-xl shadow-xs">
                  N
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-2xl tracking-tight text-slate-900 leading-none">NOVA</span>
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  </div>
                  <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mt-0.5">
                    Network for Owners, Vendors & Advisors
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full uppercase tracking-wider block">
                  Healthcare Directory
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  http://nova-h.in
                </span>
              </div>
            </div>

            {/* Pamphlet Catchy Headline */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {qrCategory !== 'All' 
                    ? qrCategory 
                    : qrStage !== 'All' 
                    ? qrStage 
                    : 'Hospital Infrastructure & Procurement'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {qrLocation !== 'All' 
                  ? `Building a Hospital in ${qrLocation}?` 
                  : 'Building or Equipping a Hospital?'}
              </h1>
              <p className="text-sm font-medium text-slate-600 max-w-md mx-auto mt-1">
                {qrLocation !== 'All'
                  ? `Scan below to instantly connect with verified healthcare partners and equipment specialists in ${qrLocation}.`
                  : 'Scan below to instantly find verified medical equipment, HVAC, MEP, and turnkey infrastructure vendors in your city.'}
              </p>
            </div>

            {/* Center: The QR Code with Scanning Target */}
            <div className="my-6 flex flex-col items-center">
              <div className={`relative p-3 bg-white rounded-2xl border-2 ${themeStyle === 'attached-theme' ? 'border-[#005C5E]' : 'border-slate-900'} shadow-md`}>
                {/* Viewfinder corners */}
                <div className={`absolute top-1 left-1 w-4 h-4 border-t-3 border-l-3 ${themeStyle === 'attached-theme' ? 'border-[#008A8F]' : 'border-blue-600'} rounded-tl-sm pointer-events-none`} />
                <div className={`absolute top-1 right-1 w-4 h-4 border-t-3 border-r-3 ${themeStyle === 'attached-theme' ? 'border-[#008A8F]' : 'border-blue-600'} rounded-tr-sm pointer-events-none`} />
                <div className={`absolute bottom-1 left-1 w-4 h-4 border-b-3 border-l-3 ${themeStyle === 'attached-theme' ? 'border-[#008A8F]' : 'border-blue-600'} rounded-bl-sm pointer-events-none`} />
                <div className={`absolute bottom-1 right-1 w-4 h-4 border-b-3 border-r-3 ${themeStyle === 'attached-theme' ? 'border-[#008A8F]' : 'border-blue-600'} rounded-br-sm pointer-events-none`} />

                {qrPngUrl ? (
                  <img 
                    src={qrPngUrl} 
                    alt="NOVA Hospital Directory QR Code" 
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-400">
                    Generating Themed QR Code...
                  </div>
                )}
              </div>

              {/* Target URL caption with dedicated copy button */}
              <div className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg shadow-2xs max-w-full">
                <span className="font-mono text-xs font-bold text-slate-800 tracking-tight truncate select-all" title={effectiveUrl}>
                  {effectiveUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-1 rounded text-slate-500 hover:text-teal-700 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                  title="Copy QR code target link"
                  aria-label="Copy target link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Dynamic Scanning Instruction Badge */}
              <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Auto-detects scanner location & displays local vendors only</span>
              </div>
            </div>

            {/* Feature Highlights on the Pamphlet */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-200 text-left mb-4">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Verified Vendors Only</p>
                  <p className="text-[11px] text-slate-500 leading-tight">Authentic medical equipment & construction specialists</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Local City Match</p>
                  <p className="text-[11px] text-slate-500 leading-tight">Instant proximity filtering for fast delivery & servicing</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Layers className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">15 Project Stages</p>
                  <p className="text-[11px] text-slate-500 leading-tight">From architectural design to ICU commissioning</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">100% Free Public Access</p>
                  <p className="text-[11px] text-slate-500 leading-tight">No login or signup required to view catalog & contacts</p>
                </div>
              </div>
            </div>

            {/* Pamphlet Footer */}
            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono font-medium text-slate-700">http://nova-h.in/directory</span>
              <span className="font-medium">contact@nova-h.in</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Test Action */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-850 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Scan Simulation:</span>
            <span>Test the exact experience mobile users get when scanning this pamphlet.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onSimulateScan) {
                  onSimulateScan();
                } else if (onNavigate) {
                  const qs = buildDirectoryQueryString({
                    q: qrKeyword.trim(),
                    role: qrRole,
                    stage: qrStage,
                    category: qrCategory,
                    location: qrLocation
                  });
                  onNavigate(qs ? `directory?${qs}` : 'directory');
                }
              }}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Simulate Mobile Scan &amp; Open Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};
