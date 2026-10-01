import React, { useState } from 'react';
import { 
  MjmlTemplate, 
  MjmlBlock, 
  MjmlBlockType 
} from './types';
import { 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Trash2, 
  GripVertical, 
  Smartphone, 
  Monitor, 
  Layers,
  Plus
} from 'lucide-react';

interface MjmlCanvasProps {
  template: MjmlTemplate;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onMoveBlock: (index: number, direction: 'up' | 'down') => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onDropBlockAt: (index: number, type: MjmlBlockType) => void;
  viewportMode: 'desktop' | 'mobile';
  onToggleViewport: (mode: 'desktop' | 'mobile') => void;
}

export const MjmlCanvas: React.FC<MjmlCanvasProps> = ({
  template,
  selectedBlockId,
  onSelectBlock,
  onMoveBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onDropBlockAt,
  viewportMode,
  onToggleViewport
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    const blockType = e.dataTransfer.getData('text/plain') as MjmlBlockType;
    if (blockType) {
      onDropBlockAt(index, blockType);
    }
  };

  return (
    <div className="flex-1 bg-slate-100 dark:bg-slate-950/60 overflow-y-auto flex flex-col items-center p-4 sm:p-8 relative">
      {/* Top Device & Canvas Info Ribbon */}
      <div className="mb-4 flex items-center justify-between w-full max-w-[660px] px-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {template.settings.templateName}
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
            {template.blocks.length} sections
          </span>
        </div>

        {/* Viewport switcher */}
        <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <button
            onClick={() => onToggleViewport('desktop')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewportMode === 'desktop'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Desktop View (600px standard email)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop (600px)</span>
          </button>
          <button
            onClick={() => onToggleViewport('mobile')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewportMode === 'mobile'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Mobile View (375px iPhone/Android)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile (375px)</span>
          </button>
        </div>
      </div>

      {/* Email Viewport Frame */}
      <div
        style={{
          width: viewportMode === 'mobile' ? '375px' : `${template.settings.containerWidth || 600}px`,
          backgroundColor: template.settings.backgroundColor || '#f1f5f9'
        }}
        className={`transition-all duration-200 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden relative min-h-[500px] mb-12`}
      >
        {/* Email Header Bar Simulation */}
        <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-300 border-b border-slate-700">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="font-bold text-white ml-2 truncate">
              {template.settings.subject || 'Subject: Email Preview'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider shrink-0">
            MJML Engine
          </span>
        </div>

        {/* Drop zone at the very top */}
        <div
          onDragOver={(e) => handleDragOver(e, 0)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 0)}
          className={`h-2 transition-all ${
            dragOverIndex === 0 ? 'h-10 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-lg m-2 flex items-center justify-center text-xs font-bold text-blue-600' : ''
          }`}
        >
          {dragOverIndex === 0 && 'Drop here to insert at top'}
        </div>

        {/* Blocks Rendered In Sequence */}
        {template.blocks.map((block, index) => {
          const isSelected = selectedBlockId === block.id;

          return (
            <React.Fragment key={block.id}>
              {/* Block Wrapper with Hover & Selection controls */}
              <div
                onClick={() => onSelectBlock(block.id)}
                className={`group relative transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900 z-10'
                    : 'hover:outline-1 hover:outline-dashed hover:outline-blue-400/80'
                }`}
                style={{
                  backgroundColor: block.sectionBgColor || '#ffffff',
                  paddingTop: `${block.paddingTop ?? 16}px`,
                  paddingBottom: `${block.paddingBottom ?? 16}px`,
                  paddingLeft: `${block.paddingLeft ?? 20}px`,
                  paddingRight: `${block.paddingRight ?? 20}px`
                }}
              >
                {/* Floating Block Identifier & Quick Action Bar */}
                <div
                  className={`absolute -top-3.5 right-4 flex items-center gap-1 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-20 transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-blue-400 font-mono">mj-{block.type}</span>
                  <span className="text-slate-500 mx-1">|</span>
                  <button
                    onClick={() => onMoveBlock(index, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:text-blue-400 disabled:text-slate-600 cursor-pointer"
                    title="Move section up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onMoveBlock(index, 'down')}
                    disabled={index === template.blocks.length - 1}
                    className="p-1 hover:text-blue-400 disabled:text-slate-600 cursor-pointer"
                    title="Move section down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDuplicateBlock(block.id)}
                    className="p-1 hover:text-emerald-400 cursor-pointer"
                    title="Duplicate section"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeleteBlock(block.id)}
                    className="p-1 hover:text-red-400 cursor-pointer"
                    title="Delete section"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Render Specific Visual Content */}
                {renderBlockContent(block, template.settings.primaryBrandColor)}
              </div>

              {/* Intermediate Drop Zone */}
              <div
                onDragOver={(e) => handleDragOver(e, index + 1)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index + 1)}
                className={`transition-all ${
                  dragOverIndex === index + 1
                    ? 'h-10 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-lg m-2 flex items-center justify-center text-xs font-bold text-blue-600'
                    : 'h-1'
                }`}
              >
                {dragOverIndex === index + 1 && 'Drop here to insert block'}
              </div>
            </React.Fragment>
          );
        })}

        {/* Empty Canvas Notice */}
        {template.blocks.length === 0 && (
          <div className="py-24 px-6 text-center">
            <Layers className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Your email canvas is currently empty
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              Drag elements from the left palette or select a pre-built template from the top bar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Visual renderer for blocks in the interactive canvas
 */
function renderBlockContent(block: MjmlBlock, brandColor: string) {
  switch (block.type) {
    case 'header':
      return (
        <div style={{ textAlign: block.logoAlign || 'left' }}>
          <img
            src={block.logoUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=320&auto=format&fit=crop&q=80'}
            alt={block.altText || 'Logo'}
            style={{ width: `${block.logoWidth || 130}px` }}
            className="inline-block object-contain"
          />
        </div>
      );

    case 'hero':
      return (
        <div style={{ textAlign: block.titleAlign || 'center' }}>
          {block.imageUrl && (
            <img
              src={block.imageUrl}
              alt="Hero Banner"
              style={{ borderRadius: `${block.imageBorderRadius || 12}px` }}
              className="w-full object-cover max-h-56 mb-4"
            />
          )}
          <h1
            style={{
              fontSize: `${block.titleSize || 26}px`,
              color: block.titleColor || '#0f172a',
              lineHeight: 1.25
            }}
            className="font-extrabold tracking-tight mb-2"
          >
            {block.title || 'Headline Announcement'}
          </h1>
          {block.subtitle && (
            <p
              style={{
                fontSize: `${block.subtitleSize || 15}px`,
                color: block.subtitleColor || '#475569'
              }}
              className="leading-relaxed mb-4 max-w-lg mx-auto"
            >
              {block.subtitle}
            </p>
          )}
          {block.buttonText && (
            <div style={{ textAlign: block.buttonAlign || 'center' }}>
              <span
                style={{
                  backgroundColor: block.buttonBgColor || brandColor,
                  color: block.buttonTextColor || '#ffffff',
                  borderRadius: `${block.buttonRadius || 10}px`
                }}
                className="inline-block px-6 py-2.5 font-bold text-xs shadow-xs"
              >
                {block.buttonText}
              </span>
            </div>
          )}
        </div>
      );

    case 'text':
      return (
        <div style={{ textAlign: block.textAlign || 'left' }}>
          {block.title && (
            <h2
              style={{
                fontSize: `${block.titleSize || 20}px`,
                color: block.titleColor || '#0f172a'
              }}
              className="font-bold mb-2 tracking-tight"
            >
              {block.title}
            </h2>
          )}
          <p
            style={{
              fontSize: `${block.fontSize || 14}px`,
              color: block.textColor || '#334155',
              lineHeight: `${block.lineHeight || 22}px`
            }}
            className="whitespace-pre-line"
          >
            {block.contentHtml || 'Editorial paragraph body...'}
          </p>
        </div>
      );

    case 'button':
      return (
        <div style={{ textAlign: block.buttonAlign || 'center' }}>
          <span
            style={{
              backgroundColor: block.buttonBgColor || brandColor,
              color: block.buttonTextColor || '#ffffff',
              borderRadius: `${block.buttonRadius || 10}px`,
              padding: `${block.buttonPaddingY || 12}px ${block.buttonPaddingX || 28}px`
            }}
            className="inline-block font-bold text-xs shadow-xs"
          >
            {block.buttonText || 'Take Action'}
          </span>
        </div>
      );

    case 'image':
      return (
        <div className="text-center">
          <img
            src={block.imageUrl || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80'}
            alt={block.imageAlt || 'Showcase'}
            style={{
              width: `${block.imageWidth || 540}px`,
              borderRadius: `${block.imageBorderRadius || 8}px`
            }}
            className="inline-block max-w-full object-cover"
          />
        </div>
      );

    case 'two-column':
      const cols = block.columns || [
        { id: '1', title: 'Feature Alpha', text: 'Hospital offering details' },
        { id: '2', title: 'Feature Beta', text: 'Biomedical technical equipment' }
      ];
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cols.map((col, i) => (
            <div
              key={col.id || i}
              className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800"
            >
              {col.imageUrl && (
                <img
                  src={col.imageUrl}
                  alt={col.title}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
              )}
              <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                {col.title}
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mb-2">
                {col.text}
              </p>
              {col.buttonText && (
                <span className="inline-block text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  {col.buttonText} →
                </span>
              )}
            </div>
          ))}
        </div>
      );

    case 'three-column':
      const c3 = block.columns || [
        { id: '1', title: '15+', text: 'Stages' },
        { id: '2', title: '100%', text: 'Verified' },
        { id: '3', title: '₹0', text: 'Commission' }
      ];
      return (
        <div className="grid grid-cols-3 gap-2 text-center">
          {c3.map((col, i) => (
            <div key={col.id || i} className="p-2">
              <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                {col.title}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
                {col.text}
              </div>
            </div>
          ))}
        </div>
      );

    case 'rfp-card':
      return (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
            New Hospital RFP Invitation
          </span>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1.5">
            {block.hospitalName || 'Metro Super Specialty Hospital'}
          </h2>
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3 space-y-0.5">
            <div><strong>Stage:</strong> {block.projectStage || 'Medical Gas Pipeline'}</div>
            <div><strong>Scale:</strong> {block.bedCapacity || '250 Beds'} • <strong>Location:</strong> {block.location || 'Pune, Maharashtra'}</div>
            <div><strong>Budget:</strong> {block.budgetEst || '₹85 - 120 Lakhs'} • <strong>Deadline:</strong> {block.submissionDeadline || 'In 14 Days'}</div>
          </div>
          <span className="inline-block px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-2xs">
            {block.buttonText || 'Submit Technical Quotation →'}
          </span>
        </div>
      );

    case 'quote-card':
      return (
        <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
            Commercial Quotation Proposal
          </span>
          <h2 className="text-base font-extrabold text-emerald-950 dark:text-emerald-200 mb-1.5">
            {block.vendorName || 'Apex Biomedical Systems'}
          </h2>
          <div className="text-xs text-emerald-900/80 dark:text-emerald-300 leading-relaxed mb-3 space-y-0.5">
            <div><strong>Quote Amount:</strong> {block.quoteAmount || '₹42,50,000 (Excl. GST)'}</div>
            <div><strong>Lead Time:</strong> {block.deliveryTime || '3 Weeks'} • <strong>Warranty:</strong> {block.warrantyPeriod || '24 Months'}</div>
            <div><strong>Reference:</strong> {block.quotationRef || '#QT-2026-8902'}</div>
          </div>
          <span className="inline-block px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-2xs">
            {block.buttonText || 'Review Full Specification & BoQ'}
          </span>
        </div>
      );

    case 'divider':
      return (
        <hr
          style={{
            borderTopWidth: `${block.dividerWidth || 1}px`,
            borderTopStyle: block.dividerStyle || 'solid',
            borderColor: block.dividerColor || '#e2e8f0'
          }}
          className="border-0 my-1"
        />
      );

    case 'spacer':
      return (
        <div
          style={{ height: `${block.spacerHeight || 24}px` }}
          className="w-full flex items-center justify-center border border-dashed border-slate-300/40 dark:border-slate-700/40 text-[9px] text-slate-400 select-none"
        >
          <span>Spacer ({block.spacerHeight || 24}px)</span>
        </div>
      );

    case 'footer':
      return (
        <div className="text-center text-xs">
          <div className="font-extrabold text-white mb-1">
            {block.companyName || 'NOVA-H Network'}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            {block.address || 'BKC Healthcare Towers, Mumbai, India'}
            {block.supportEmail && ` • ${block.supportEmail}`}
          </p>
          <p className="text-[10px] text-slate-500">
            {block.copyrightText || '© 2026 NOVA-H'} • <span className="underline">Unsubscribe</span>
          </p>
        </div>
      );

    default:
      return null;
  }
}
