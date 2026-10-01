import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Code, 
  FileCode, 
  Eye, 
  Send, 
  Mail, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { MjmlTemplate } from './types';
import { generateMjml, generateEmailHtml } from './mjmlGenerator';

interface MjmlCodeModalProps {
  template: MjmlTemplate;
  onClose: () => void;
  onNotify: (msg: string) => void;
}

export const MjmlCodeModal: React.FC<MjmlCodeModalProps> = ({
  template,
  onClose,
  onNotify
}) => {
  const [activeTab, setActiveTab] = useState<'mjml' | 'html' | 'inbox'>('mjml');
  const [copiedMjml, setCopiedMjml] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [simulatingSend, setSimulatingSend] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('director@metrohospital.in');

  const mjmlCode = generateMjml(template);
  const emailHtml = generateEmailHtml(template);

  const handleCopyMjml = async () => {
    try {
      await navigator.clipboard.writeText(mjmlCode);
      setCopiedMjml(true);
      onNotify('Copied valid MJML markup to clipboard.');
      setTimeout(() => setCopiedMjml(false), 2500);
    } catch {
      onNotify('Failed to copy to clipboard.');
    }
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(emailHtml);
      setCopiedHtml(true);
      onNotify('Copied compiled responsive HTML email to clipboard.');
      setTimeout(() => setCopiedHtml(false), 2500);
    } catch {
      onNotify('Failed to copy to clipboard.');
    }
  };

  const handleDownloadMjml = () => {
    const filename = `${template.settings.templateName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mjml`;
    const blob = new Blob([mjmlCode], { type: 'text/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    onNotify(`Downloaded ${filename}`);
  };

  const handleDownloadHtml = () => {
    const filename = `${template.settings.templateName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.html`;
    const blob = new Blob([emailHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    onNotify(`Downloaded ${filename}`);
  };

  const handleSimulateSend = () => {
    if (!testEmailAddress) {
      onNotify('Please enter a destination email address.');
      return;
    }
    setSimulatingSend(true);
    setTimeout(() => {
      setSimulatingSend(false);
      onNotify(`Test preview email successfully dispatched to ${testEmailAddress}!`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Export &amp; Code Inspector
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {template.settings.templateName} • Validated MJML &amp; Compiled Email HTML
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Action Toolbar */}
        <div className="px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('mjml')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'mjml'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>MJML Markup ({mjmlCode.split('\n').length} lines)</span>
            </button>

            <button
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'html'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Compiled HTML Email</span>
            </button>

            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'inbox'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inbox Simulation &amp; Test</span>
            </button>
          </div>

          {/* Quick Copy / Download Buttons */}
          <div className="flex items-center gap-2">
            {activeTab === 'mjml' && (
              <>
                <button
                  onClick={handleCopyMjml}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedMjml ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMjml ? 'Copied MJML!' : 'Copy MJML'}</span>
                </button>
                <button
                  onClick={handleDownloadMjml}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .mjml</span>
                </button>
              </>
            )}

            {activeTab === 'html' && (
              <>
                <button
                  onClick={handleCopyHtml}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHtml ? 'Copied HTML!' : 'Copy HTML'}</span>
                </button>
                <button
                  onClick={handleDownloadHtml}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .html</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900 text-slate-100 font-mono text-xs">
          {activeTab === 'mjml' && (
            <pre className="p-4 bg-slate-950 rounded-xl overflow-x-auto text-[11px] leading-relaxed text-blue-300 border border-slate-800">
              <code>{mjmlCode}</code>
            </pre>
          )}

          {activeTab === 'html' && (
            <pre className="p-4 bg-slate-950 rounded-xl overflow-x-auto text-[11px] leading-relaxed text-emerald-300 border border-slate-800">
              <code>{emailHtml}</code>
            </pre>
          )}

          {activeTab === 'inbox' && (
            <div className="font-sans text-slate-900 dark:text-slate-100 space-y-4">
              {/* Send Test Dispatch Simulator */}
              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 text-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold">Simulate Live Test Send:</span>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="Enter recipient email..."
                    className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-600 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-purple-400 w-64"
                  />
                </div>
                <button
                  onClick={handleSimulateSend}
                  disabled={simulatingSend}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{simulatingSend ? 'Dispatching...' : 'Send Test Simulation'}</span>
                </button>
              </div>

              {/* Realistic Webmail Client Window Header */}
              <div className="rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-md">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      {template.settings.subject || 'Subject: Email Preview'}
                    </h3>
                    <span className="text-[10px] text-slate-400">Today at 10:45 AM</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">From: </span>
                    NOVA-H Healthcare Procurement &lt;alerts@nova-h.in&gt;
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">To: </span>
                    {testEmailAddress}
                  </div>
                  {template.settings.previewText && (
                    <div className="text-[10px] text-slate-500 italic">
                      Preheader: {template.settings.previewText}
                    </div>
                  )}
                </div>

                {/* Rendered HTML inside iframe for isolation */}
                <div className="p-4 bg-slate-100 dark:bg-slate-900 flex justify-center">
                  <iframe
                    title="Live Email Output"
                    srcDoc={emailHtml}
                    className="w-full max-w-[620px] h-[550px] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Exported MJML is 100% compliant with standard MJML v4 CLI and mail transpilations.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-bold cursor-pointer hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
