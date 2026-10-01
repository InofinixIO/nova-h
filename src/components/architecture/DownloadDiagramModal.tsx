import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileImage, 
  FileCode, 
  FileText, 
  Layers, 
  Sparkles, 
  Check, 
  Copy, 
  Loader2, 
  Monitor, 
  Maximize2,
  Palette,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import { 
  exportFlowAsPng, 
  exportFlowAsSvg, 
  exportFlowAsJpeg, 
  exportFlowAsJson, 
  exportFlowAsMarkdown, 
  copyFlowToClipboard, 
  ExportFlowOptions,
  ExportTheme
} from '../../utils/xyflowExport';
import { generateArchitectureAndCostDocx } from '../../utils/generateArchitectureDocx';
import { Node, Edge } from '@xyflow/react';

export type ExportFormat = 'png' | 'docx' | 'svg' | 'jpeg' | 'json' | 'markdown';

interface DownloadDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  containerEl: HTMLElement | null;
  nodes: Node[];
  edges: Edge[];
  nodeDetails: Record<string, any>;
  initialTheme?: ExportTheme;
  onNotify?: (msg: string) => void;
}

export const DownloadDiagramModal: React.FC<DownloadDiagramModalProps> = ({
  isOpen,
  onClose,
  containerEl,
  nodes,
  edges,
  nodeDetails,
  initialTheme = 'dark',
  onNotify
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
  const [scope, setScope] = useState<'full' | 'viewport'>('full');
  const [theme, setTheme] = useState<ExportTheme>(initialTheme);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedClipboard, setCopiedClipboard] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const notify = (msg: string) => {
    if (onNotify) onNotify(msg);
  };

  const handleDownload = async () => {
    setIsExporting(true);
    setStatusMessage(`Preparing ${selectedFormat.toUpperCase()} export...`);

    try {
      if (selectedFormat === 'json') {
        setStatusMessage('Serializing XYFlow graph schema...');
        exportFlowAsJson('NOVA-H System Architecture Topology', nodes, edges, nodeDetails);
        notify('Downloaded XYFlow topology as JSON.');
        setStatusMessage('Downloaded!');
        setTimeout(() => onClose(), 800);
        return;
      }

      if (selectedFormat === 'markdown') {
        setStatusMessage('Generating Markdown specification document...');
        exportFlowAsMarkdown('NOVA-H Healthcare Infrastructure — Technical Blueprint', nodes, edges, nodeDetails);
        notify('Downloaded technical architecture report as Markdown.');
        setStatusMessage('Downloaded!');
        setTimeout(() => onClose(), 800);
        return;
      }

      if (selectedFormat === 'docx') {
        setStatusMessage('Generating Microsoft Word (.docx) Specification...');
        await generateArchitectureAndCostDocx({
          canvasContainerEl: containerEl,
          includeDiagramImage: true,
          includeNodeSpecs: true,
          includeCostBreakdown: true,
          includeTimeline: true,
          includeDatabaseSchema: true,
          includeSecurityCompliance: true
        });
        notify('Downloaded complete Architecture & Cost Plan as Word Document (.docx).');
        setStatusMessage('Downloaded!');
        setTimeout(() => onClose(), 800);
        return;
      }

      if (!containerEl) {
        throw new Error('Canvas container element not detected.');
      }

      const options: ExportFlowOptions = {
        fileName: `nova-h-architecture-${scope === 'full' ? 'complete' : 'view'}.${selectedFormat}`,
        scope,
        theme,
        pixelRatio: 2,
        nodes
      };

      if (selectedFormat === 'png') {
        setStatusMessage('Rendering 2x High-Resolution PNG...');
        await exportFlowAsPng(containerEl, options);
        notify('Downloaded high-resolution diagram as PNG.');
      } else if (selectedFormat === 'svg') {
        setStatusMessage('Generating scalable SVG vector...');
        await exportFlowAsSvg(containerEl, options);
        notify('Downloaded scalable vector diagram as SVG.');
      } else if (selectedFormat === 'jpeg') {
        setStatusMessage('Compressing high-quality JPEG...');
        await exportFlowAsJpeg(containerEl, options);
        notify('Downloaded architecture diagram as JPEG.');
      }

      setStatusMessage('Done! Diagram saved to your device.');
      setTimeout(() => {
        onClose();
        setIsExporting(false);
        setStatusMessage(null);
      }, 1000);
    } catch (err: any) {
      console.error('Export error:', err);
      setStatusMessage('Export encountered an issue. Try viewport mode.');
      notify('Export failed: ' + (err.message || 'Unknown error'));
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    if (!containerEl) return;
    setIsExporting(true);
    setStatusMessage('Rendering PNG to clipboard...');

    try {
      await copyFlowToClipboard(containerEl, {
        scope,
        theme,
        pixelRatio: 2,
        nodes
      });
      setCopiedClipboard(true);
      notify('Diagram copied to clipboard! You can paste directly into Docs, Figma, or Slack.');
      setStatusMessage('Copied to clipboard!');
      setTimeout(() => setCopiedClipboard(false), 3000);
    } catch (err: any) {
      console.warn('Clipboard copy error:', err);
      notify('Clipboard copy failed. Please use standard PNG download.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Download Architecture Diagram</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                  XYFlow Export
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export crisp presentation graphics, vector assets, raw schemas, or technical docs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Format Selection Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
              1. Choose Export Format
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Word Document (.docx) */}
              <div
                onClick={() => setSelectedFormat('docx')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 sm:col-span-2 ${
                  selectedFormat === 'docx'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                  W
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Microsoft Word (.docx) Executive Specification
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white uppercase">
                      Architecture &amp; Cost
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Complete executive whitepaper with embedded topology diagram, 15 node specifications, itemized OpEx cloud cost breakdown, and 15-week engineering roadmap.
                  </p>
                </div>
              </div>

              {/* PNG */}
              <div
                onClick={() => setSelectedFormat('png')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  selectedFormat === 'png'
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40'
                }`}
              >
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 shrink-0">
                  <FileImage className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      PNG Image (2x HD)
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Crisp 2560px raster graphic, ideal for keynote slides, decks, and reports.
                  </p>
                </div>
              </div>

              {/* SVG */}
              <div
                onClick={() => setSelectedFormat('svg')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  selectedFormat === 'svg'
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40'
                }`}
              >
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      SVG Vector
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-300 uppercase">
                      Vector
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Lossless vector format, editable in Figma, Illustrator, or draw.io.
                  </p>
                </div>
              </div>

              {/* JSON */}
              <div
                onClick={() => setSelectedFormat('json')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  selectedFormat === 'json'
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40'
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      JSON Topology
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 uppercase">
                      Data
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Raw XYFlow node graph schema, coordinates, flow tags, and edges.
                  </p>
                </div>
              </div>

              {/* Markdown */}
              <div
                onClick={() => setSelectedFormat('markdown')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  selectedFormat === 'markdown'
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40'
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Markdown Blueprint
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 uppercase">
                      Spec Doc
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Complete technical documentation report with code snippets &amp; SLAs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scope Controls (for image & vector formats) */}
          {(selectedFormat === 'png' || selectedFormat === 'svg' || selectedFormat === 'jpeg') && (
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                2. Framing &amp; Scope
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScope('full')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    scope === 'full'
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-xs'
                  }`}
                >
                  <Maximize2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">Full Architecture</span>
                    <span className="text-[10px] text-slate-400 font-normal">All 7 tiers auto-framed</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setScope('viewport')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    scope === 'viewport'
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-xs'
                  }`}
                >
                  <Monitor className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">Current Screen View</span>
                    <span className="text-[10px] text-slate-400 font-normal">Exact zoom crop</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Theme Background (for image & vector formats) */}
          {(selectedFormat === 'png' || selectedFormat === 'svg' || selectedFormat === 'jpeg') && (
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                3. Background Appearance
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`py-2 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    theme === 'dark'
                      ? 'border-blue-600 bg-slate-950 text-white font-bold shadow-xs ring-1 ring-blue-500/50'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Dark Slate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`py-2 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    theme === 'light'
                      ? 'border-blue-600 bg-white text-slate-900 font-bold shadow-xs ring-1 ring-blue-500/50'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Clean Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('blueprint')}
                  className={`py-2 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    theme === 'blueprint'
                      ? 'border-cyan-500 bg-[#071324] text-cyan-300 font-bold shadow-xs ring-1 ring-cyan-400/50'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Blueprint</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('midnight')}
                  className={`py-2 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    theme === 'midnight'
                      ? 'border-zinc-500 bg-black text-white font-bold shadow-xs ring-1 ring-zinc-400/50'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Midnight</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('transparent')}
                  className={`py-2 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1 ${
                    theme === 'transparent'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold shadow-xs ring-1 ring-purple-500/50'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                  <span>Transparent</span>
                </button>
              </div>
            </div>
          )}

          {/* Word document preview details */}
          {selectedFormat === 'docx' && (
            <div className="p-4 bg-gradient-to-br from-blue-900/10 to-indigo-900/10 dark:from-blue-950/40 dark:to-indigo-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-extrabold text-sm">
                <FileText className="w-4 h-4" />
                <span>Executive Word Document (.docx) Specification</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                This will generate and download an authentic Microsoft Word whitepaper containing:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✔</span> Embedded XYFlow Architecture Graphic
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✔</span> Detailed Node Specifications (15 Nodes)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✔</span> Itemized Cloud OpEx &amp; Unit Economics
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✔</span> 15-Week Timeline &amp; Engineering Budget
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✔</span> PostgreSQL Core Relational Schema
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✔</span> Healthcare Sealed Bidding &amp; Compliance
                </div>
              </div>
            </div>
          )}

          {/* Status feedback banner if working */}
          {statusMessage && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-2.5 text-xs text-blue-800 dark:text-blue-200">
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              <span className="font-semibold">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          {/* Quick Copy to Clipboard Button (PNG only) */}
          {(selectedFormat === 'png' || selectedFormat === 'svg') && (
            <button
              type="button"
              onClick={handleCopyClipboard}
              disabled={isExporting}
              className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              {copiedClipboard ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Image</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download {selectedFormat.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
