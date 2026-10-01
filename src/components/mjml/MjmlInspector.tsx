import React from 'react';
import { 
  MjmlTemplate, 
  MjmlBlock, 
  MjmlTemplateSettings 
} from './types';
import { 
  Sliders, 
  Palette, 
  Type, 
  Layout, 
  Link, 
  Trash2, 
  Settings, 
  Eye,
  Check
} from 'lucide-react';

interface MjmlInspectorProps {
  template: MjmlTemplate;
  selectedBlockId: string | null;
  onUpdateBlock: (id: string, updates: Partial<MjmlBlock>) => void;
  onUpdateSettings: (settingsUpdates: Partial<MjmlTemplateSettings>) => void;
  onDeleteBlock: (id: string) => void;
  onDeselect: () => void;
}

export const MjmlInspector: React.FC<MjmlInspectorProps> = ({
  template,
  selectedBlockId,
  onUpdateBlock,
  onUpdateSettings,
  onDeleteBlock,
  onDeselect
}) => {
  const selectedBlock = template.blocks.find(b => b.id === selectedBlockId);

  // If no block selected, display global email template settings
  if (!selectedBlock) {
    return (
      <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-y-auto select-none">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-xs uppercase tracking-wider">
            <Settings className="w-4 h-4 text-blue-600" />
            <span>Global Email Settings</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Configure default attributes, container width &amp; inbox preview headers.
          </p>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {/* Template Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Template Internal Title
            </label>
            <input
              type="text"
              value={template.settings.templateName}
              onChange={(e) => onUpdateSettings({ templateName: e.target.value })}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Email Subject */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Subject Line
            </label>
            <input
              type="text"
              value={template.settings.subject}
              onChange={(e) => onUpdateSettings({ subject: e.target.value })}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. New Hospital RFP: 250-Bed Project"
            />
          </div>

          {/* Preheader Preview Text */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Inbox Preheader Snippet
            </label>
            <textarea
              rows={2}
              value={template.settings.previewText}
              onChange={(e) => onUpdateSettings({ previewText: e.target.value })}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-blue-500"
              placeholder="Short text shown in Gmail/Outlook before opening the email"
            />
          </div>

          {/* Canvas Background Color */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Canvas Background
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={template.settings.backgroundColor}
                onChange={(e) => onUpdateSettings({ backgroundColor: e.target.value })}
                className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={template.settings.backgroundColor}
                onChange={(e) => onUpdateSettings({ backgroundColor: e.target.value })}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
              />
            </div>
            {/* Quick palette presets */}
            <div className="flex items-center gap-1.5 mt-2">
              {['#f1f5f9', '#f8fafc', '#ffffff', '#0f172a', '#e2e8f0'].map(c => (
                <button
                  key={c}
                  onClick={() => onUpdateSettings({ backgroundColor: c })}
                  style={{ backgroundColor: c }}
                  className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600 cursor-pointer shadow-2xs hover:scale-110 transition-transform"
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Primary Brand Color */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Primary Brand Accent
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={template.settings.primaryBrandColor}
                onChange={(e) => onUpdateSettings({ primaryBrandColor: e.target.value })}
                className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={template.settings.primaryBrandColor}
                onChange={(e) => onUpdateSettings({ primaryBrandColor: e.target.value })}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {['#2563eb', '#059669', '#7c3aed', '#dc2626', '#d97706', '#0f172a'].map(c => (
                <button
                  key={c}
                  onClick={() => onUpdateSettings({ primaryBrandColor: c })}
                  style={{ backgroundColor: c }}
                  className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600 cursor-pointer shadow-2xs hover:scale-110 transition-transform"
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Container Width */}
          <div>
            <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span>Container Width</span>
              <span className="font-mono text-blue-600">{template.settings.containerWidth}px</span>
            </div>
            <input
              type="range"
              min={500}
              max={680}
              step={10}
              value={template.settings.containerWidth}
              onChange={(e) => onUpdateSettings({ containerWidth: Number(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>500px (Compact)</span>
              <span>600px (Industry Standard)</span>
              <span>680px (Wide)</span>
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Global Typography Family
            </label>
            <select
              value={template.settings.fontFamily}
              onChange={(e) => onUpdateSettings({ fontFamily: e.target.value })}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs cursor-pointer focus:ring-1 focus:ring-blue-500"
            >
              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Healthcare)</option>
              <option value="Inter">Inter (Clean Enterprise)</option>
              <option value="Arial">Arial (Universal Safe)</option>
              <option value="Helvetica">Helvetica (Classic Clean)</option>
              <option value="Georgia">Georgia (Editorial Serif)</option>
              <option value="Trebuchet MS">Trebuchet MS (Friendly)</option>
            </select>
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            💡 Click on any section in the center canvas to customize its layout, typography, colors, and content.
          </p>
        </div>
      </div>
    );
  }

  // When a block is actively selected
  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-y-auto select-none">
      {/* Header with Block Badge & Deselect */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold block">
            mj-{selectedBlock.type}
          </span>
          <h3 className="text-xs font-black text-slate-900 dark:text-white">
            {selectedBlock.label}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDeleteBlock(selectedBlock.id)}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            title="Delete this block"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDeselect}
            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* Section Background & Paddings */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <Layout className="w-3.5 h-3.5 text-blue-500" />
            <span>Section Spacing &amp; Background</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Section Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedBlock.sectionBgColor || '#ffffff'}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { sectionBgColor: e.target.value })}
                className="w-7 h-7 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={selectedBlock.sectionBgColor || '#ffffff'}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { sectionBgColor: e.target.value })}
                className="flex-1 px-2.5 py-1 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Padding sliders */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500">Top Pad: {selectedBlock.paddingTop ?? 16}px</span>
              <input
                type="range"
                min={0}
                max={60}
                value={selectedBlock.paddingTop ?? 16}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { paddingTop: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Bottom Pad: {selectedBlock.paddingBottom ?? 16}px</span>
              <input
                type="range"
                min={0}
                max={60}
                value={selectedBlock.paddingBottom ?? 16}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { paddingBottom: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Content Specific Form Fields */}
        {selectedBlock.type === 'header' && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Logo Image URL
              </label>
              <input
                type="text"
                value={selectedBlock.logoUrl || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { logoUrl: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Logo Width</span>
                <span className="font-mono text-blue-600">{selectedBlock.logoWidth || 130}px</span>
              </div>
              <input
                type="range"
                min={60}
                max={260}
                value={selectedBlock.logoWidth || 130}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { logoWidth: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Logo Alignment
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['left', 'center', 'right'] as const).map(align => (
                  <button
                    key={align}
                    onClick={() => onUpdateBlock(selectedBlock.id, { logoAlign: align })}
                    className={`py-1 text-xs font-bold rounded-lg capitalize border cursor-pointer ${
                      selectedBlock.logoAlign === align
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedBlock.type === 'hero' && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Headline Title
              </label>
              <input
                type="text"
                value={selectedBlock.title || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { title: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subtitle Description
              </label>
              <textarea
                rows={2}
                value={selectedBlock.subtitle || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { subtitle: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hero Image URL (Optional)
              </label>
              <input
                type="text"
                value={selectedBlock.imageUrl || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={selectedBlock.buttonText || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonText: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Button Target URL
              </label>
              <input
                type="text"
                value={selectedBlock.buttonUrl || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonUrl: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>
        )}

        {selectedBlock.type === 'text' && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Section Heading
              </label>
              <input
                type="text"
                value={selectedBlock.title || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { title: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Editorial Paragraph
              </label>
              <textarea
                rows={5}
                value={selectedBlock.contentHtml || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { contentHtml: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Font Size</span>
                <span className="font-mono text-blue-600">{selectedBlock.fontSize || 14}px</span>
              </div>
              <input
                type="range"
                min={12}
                max={22}
                value={selectedBlock.fontSize || 14}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { fontSize: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        )}

        {selectedBlock.type === 'button' && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Button Label
              </label>
              <input
                type="text"
                value={selectedBlock.buttonText || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonText: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target URL
              </label>
              <input
                type="text"
                value={selectedBlock.buttonUrl || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonUrl: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Button Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedBlock.buttonBgColor || '#2563eb'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonBgColor: e.target.value })}
                  className="w-7 h-7 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedBlock.buttonBgColor || '#2563eb'}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { buttonBgColor: e.target.value })}
                  className="flex-1 px-2.5 py-1 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {selectedBlock.type === 'rfp-card' && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hospital Facility Name
              </label>
              <input
                type="text"
                value={selectedBlock.hospitalName || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { hospitalName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Project Stage / Scope
              </label>
              <input
                type="text"
                value={selectedBlock.projectStage || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { projectStage: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bed Capacity
                </label>
                <input
                  type="text"
                  value={selectedBlock.bedCapacity || ''}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { bedCapacity: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={selectedBlock.location || ''}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { location: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Scope / Budget
              </label>
              <input
                type="text"
                value={selectedBlock.budgetEst || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { budgetEst: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>
        )}

        {selectedBlock.type === 'quote-card' && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vendor Partner Name
              </label>
              <input
                type="text"
                value={selectedBlock.vendorName || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { vendorName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Quote Amount
              </label>
              <input
                type="text"
                value={selectedBlock.quoteAmount || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { quoteAmount: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Delivery Lead
                </label>
                <input
                  type="text"
                  value={selectedBlock.deliveryTime || ''}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { deliveryTime: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Warranty Period
                </label>
                <input
                  type="text"
                  value={selectedBlock.warrantyPeriod || ''}
                  onChange={(e) => onUpdateBlock(selectedBlock.id, { warrantyPeriod: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {selectedBlock.type === 'footer' && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                value={selectedBlock.companyName || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { companyName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Physical Office Address
              </label>
              <textarea
                rows={2}
                value={selectedBlock.address || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { address: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Support / Inquiry Email
              </label>
              <input
                type="email"
                value={selectedBlock.supportEmail || ''}
                onChange={(e) => onUpdateBlock(selectedBlock.id, { supportEmail: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>
        )}

        {selectedBlock.type === 'spacer' && (
          <div>
            <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span>Spacer Height</span>
              <span className="font-mono text-blue-600">{selectedBlock.spacerHeight || 24}px</span>
            </div>
            <input
              type="range"
              min={8}
              max={80}
              value={selectedBlock.spacerHeight || 24}
              onChange={(e) => onUpdateBlock(selectedBlock.id, { spacerHeight: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>
        )}
      </div>
    </div>
  );
};
