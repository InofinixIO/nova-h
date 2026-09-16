import React, { useState, useEffect, useRef } from 'react';
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
  Palette 
} from 'lucide-react';
import { generateThemedQrSvg, generateThemedQrPng, ThemedQrOptions } from '../utils/customQrGenerator';

import { SectionHeading } from './SectionHeading';

interface PamphletSectionProps {
  onSimulateScan: () => void;
}

export const PamphletSection: React.FC<PamphletSectionProps> = ({
  onSimulateScan
}) => {
  // Default directly to http://nova-h.in/directory as requested
  const [targetUrl, setTargetUrl] = useState('http://nova-h.in/directory');
  const [includeScanParams, setIncludeScanParams] = useState(true);
  const [themeStyle, setThemeStyle] = useState<'attached-theme' | 'classic'>('attached-theme');
  const [qrPngUrl, setQrPngUrl] = useState<string>('');
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [printSize, setPrintSize] = useState<'a4' | 'flyer'>('a4');
  const pamphletRef = useRef<HTMLDivElement>(null);

  // Compute final effective URL
  const effectiveUrl = includeScanParams
    ? (targetUrl.includes('?') ? `${targetUrl}&scan=true&type=vendor` : `${targetUrl}?scan=true&type=vendor`)
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
    <section id="pamphlet-section" className="py-16 sm:py-24 bg-white border-y border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <SectionHeading id="pamphlet-section" className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Printable Pamphlet & Smart QR Code
          </SectionHeading>
          <p className="text-slate-600 text-base sm:text-lg mt-3">
            Auto-detects scanner location and filters for verified healthcare vendors in the area.
          </p>
        </div>

        <div className="bg-white rounded-2xl w-full border border-slate-200 flex flex-col shadow-sm">

        {/* Configuration Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 min-w-[280px]">
            <span className="font-bold text-slate-700 whitespace-nowrap">Target URL:</span>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
            />
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600 font-medium whitespace-nowrap bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={includeScanParams}
                onChange={(e) => setIncludeScanParams(e.target.checked)}
                className="w-3.5 h-3.5 text-teal-700 rounded-sm focus:ring-teal-500"
              />
              <span>+ Geo & Vendor Filter</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Theme Toggle */}
            <div className="flex rounded-lg bg-white border border-slate-200 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setThemeStyle('attached-theme')}
                className={`px-2.5 py-1 rounded-md font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  themeStyle === 'attached-theme'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
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
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Classic Slate
              </button>
            </div>

            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadPng}
              className="px-3 py-1.5 rounded-lg bg-white border border-teal-200 hover:bg-teal-50 text-teal-800 font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Download high-resolution 1024x1024 PNG"
            >
              <Download className="w-3.5 h-3.5 text-teal-700" />
              <span>PNG</span>
            </button>

            <button
              onClick={handleDownloadSvg}
              className="px-3 py-1.5 rounded-lg bg-white border border-teal-200 hover:bg-teal-50 text-teal-800 font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Download vector SVG for offset printing"
            >
              <FileDown className="w-3.5 h-3.5 text-teal-700" />
              <span>SVG</span>
            </button>
          </div>
        </div>

        {/* Pamphlet Interactive Preview */}
        <div className="p-4 sm:p-8 bg-slate-100 flex flex-col items-center justify-center">
          
          {/* Action Bar Above Preview */}
          <div className="w-full max-w-xl mb-4 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Pamphlet Preview</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Print Ready
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPrintSize('a4')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  printSize === 'a4' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
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
                <span>Hospital Infrastructure & Procurement</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Building or Equipping a Hospital?
              </h1>
              <p className="text-sm font-medium text-slate-600 max-w-md mx-auto mt-1">
                Scan below to instantly find verified medical equipment, HVAC, MEP, and turnkey infrastructure vendors in your city.
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

              {/* Target URL caption */}
              <p className="mt-2 font-mono text-xs font-bold text-slate-800 tracking-tight">
                {effectiveUrl}
              </p>

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
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Scan Simulation:</span>
            <span>Test the exact experience mobile users get when scanning this pamphlet.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSimulateScan();
              }}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Simulate Mobile Scan & Detect Location</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};
