import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Code, 
  RotateCcw, 
  Download, 
  Sparkles, 
  Mail, 
  FileText, 
  Check, 
  Layers, 
  Eye, 
  FolderOpen,
  Share2
} from 'lucide-react';
import { MjmlTemplate, MjmlBlock, MjmlBlockType, MjmlTemplateSettings } from './types';
import { PRESET_TEMPLATES } from './presets';
import { MjmlBlockPalette } from './MjmlBlockPalette';
import { MjmlCanvas } from './MjmlCanvas';
import { MjmlInspector } from './MjmlInspector';
import { MjmlCodeModal } from './MjmlCodeModal';
import { ThemeToggle } from '../ThemeToggle';

interface MjmlTemplateBuilderProps {
  onBack: () => void;
  onNotify: (msg: string) => void;
}

const STORAGE_KEY = 'nova_mjml_active_template';
const SAVED_TEMPLATES_KEY = 'nova_mjml_saved_library';

export const MjmlTemplateBuilder: React.FC<MjmlTemplateBuilderProps> = ({
  onBack,
  onNotify
}) => {
  // Load initial template from localStorage or fallback to default preset
  const [template, setTemplate] = useState<MjmlTemplate>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return PRESET_TEMPLATES[0];
  });

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [savedLibrary, setSavedLibrary] = useState<MjmlTemplate[]>(() => {
    try {
      const lib = localStorage.getItem(SAVED_TEMPLATES_KEY);
      if (lib) return JSON.parse(lib);
    } catch {}
    return PRESET_TEMPLATES;
  });
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');

  // Auto-save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(template));
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(`Saved at ${timeStr}`);
    } catch {}
  }, [template]);

  // Block Manipulation Handlers
  const handleAddBlock = (type: MjmlBlockType) => {
    const newBlock = createDefaultBlock(type, template.settings.primaryBrandColor);
    setTemplate(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
      updatedAt: new Date().toISOString()
    }));
    setSelectedBlockId(newBlock.id);
    onNotify(`Added ${newBlock.label} to template.`);
  };

  const handleDropBlockAt = (index: number, type: MjmlBlockType) => {
    const newBlock = createDefaultBlock(type, template.settings.primaryBrandColor);
    setTemplate(prev => {
      const newBlocks = [...prev.blocks];
      newBlocks.splice(index, 0, newBlock);
      return {
        ...prev,
        blocks: newBlocks,
        updatedAt: new Date().toISOString()
      };
    });
    setSelectedBlockId(newBlock.id);
    onNotify(`Inserted ${newBlock.label} at position ${index + 1}.`);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    setTemplate(prev => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.blocks.length) return prev;
      const newBlocks = [...prev.blocks];
      const [moved] = newBlocks.splice(index, 1);
      newBlocks.splice(targetIndex, 0, moved);
      return {
        ...prev,
        blocks: newBlocks,
        updatedAt: new Date().toISOString()
      };
    });
  };

  const handleDeleteBlock = (id: string) => {
    setTemplate(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== id),
      updatedAt: new Date().toISOString()
    }));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
    onNotify('Section removed.');
  };

  const handleDuplicateBlock = (id: string) => {
    const block = template.blocks.find(b => b.id === id);
    if (!block) return;
    const duplicated: MjmlBlock = {
      ...JSON.parse(JSON.stringify(block)),
      id: `block-${Date.now()}`,
      label: `${block.label} (Copy)`
    };
    const index = template.blocks.findIndex(b => b.id === id);
    setTemplate(prev => {
      const newBlocks = [...prev.blocks];
      newBlocks.splice(index + 1, 0, duplicated);
      return {
        ...prev,
        blocks: newBlocks,
        updatedAt: new Date().toISOString()
      };
    });
    setSelectedBlockId(duplicated.id);
    onNotify('Section duplicated.');
  };

  const handleUpdateBlock = (id: string, updates: Partial<MjmlBlock>) => {
    setTemplate(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => (b.id === id ? { ...b, ...updates } : b)),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleUpdateSettings = (settingsUpdates: Partial<MjmlTemplateSettings>) => {
    setTemplate(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settingsUpdates },
      updatedAt: new Date().toISOString()
    }));
  };

  const handleLoadPreset = (presetId: string) => {
    const found = PRESET_TEMPLATES.find(p => p.id === presetId);
    if (found) {
      setTemplate(JSON.parse(JSON.stringify(found)));
      setSelectedBlockId(null);
      onNotify(`Loaded "${found.settings.templateName}" preset.`);
    }
  };

  const handleSaveToLibrary = () => {
    const updatedLib = [template, ...savedLibrary.filter(t => t.id !== template.id)];
    setSavedLibrary(updatedLib);
    try {
      localStorage.setItem(SAVED_TEMPLATES_KEY, JSON.stringify(updatedLib));
    } catch {}
    onNotify(`Saved "${template.settings.templateName}" to templates library.`);
  };

  const handleResetTemplate = () => {
    if (window.confirm('Reset current template to blank canvas?')) {
      const blank = PRESET_TEMPLATES.find(p => p.id === 'blank-slate') || PRESET_TEMPLATES[0];
      setTemplate(JSON.parse(JSON.stringify(blank)));
      setSelectedBlockId(null);
      onNotify('Template reset.');
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Top Application Bar */}
      <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-30">
        {/* Left: Back button & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Return to Admin Console"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Admin Console</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                MJML Email Studio
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                {template.settings.templateName}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden md:block">
              {lastSavedTime} • {template.blocks.length} sections
            </span>
          </div>
        </div>

        {/* Center: Presets Quick Dropdown */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Preset:</span>
          <select
            value={template.id}
            onChange={(e) => handleLoadPreset(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer focus:ring-1 focus:ring-blue-500"
          >
            {PRESET_TEMPLATES.map(p => (
              <option key={p.id} value={p.id}>
                {p.settings.templateName}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Actions (Code Modal, Save, Theme Toggle) */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle showMenu={false} size="sm" />

          {/* Reset Template */}
          <button
            onClick={handleResetTemplate}
            title="Reset template to blank state"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Save to library */}
          <button
            onClick={handleSaveToLibrary}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Save className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Export Code Modal */}
          <button
            onClick={() => setIsCodeModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Export MJML &amp; HTML</span>
          </button>
        </div>
      </header>

      {/* Main 3-Column Studio Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Draggable Block Palette */}
        <MjmlBlockPalette
          onAddBlock={handleAddBlock}
          onDragStartBlock={() => {}}
        />

        {/* Center Column: Interactive Visual Canvas */}
        <MjmlCanvas
          template={template}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          onMoveBlock={handleMoveBlock}
          onDeleteBlock={handleDeleteBlock}
          onDuplicateBlock={handleDuplicateBlock}
          onDropBlockAt={handleDropBlockAt}
          viewportMode={viewportMode}
          onToggleViewport={setViewportMode}
        />

        {/* Right Column: Properties & Global Settings Inspector */}
        <MjmlInspector
          template={template}
          selectedBlockId={selectedBlockId}
          onUpdateBlock={handleUpdateBlock}
          onUpdateSettings={handleUpdateSettings}
          onDeleteBlock={handleDeleteBlock}
          onDeselect={() => setSelectedBlockId(null)}
        />
      </div>

      {/* Code Export & Simulation Modal */}
      {isCodeModalOpen && (
        <MjmlCodeModal
          template={template}
          onClose={() => setIsCodeModalOpen(false)}
          onNotify={onNotify}
        />
      )}
    </div>
  );
};

/**
 * Creates default configuration for newly added blocks
 */
function createDefaultBlock(type: MjmlBlockType, brandColor: string): MjmlBlock {
  const id = `block-${Date.now()}`;

  switch (type) {
    case 'header':
      return {
        id,
        type: 'header',
        label: 'Brand Header',
        logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=320&auto=format&fit=crop&q=80',
        logoWidth: 130,
        logoAlign: 'left',
        sectionBgColor: '#ffffff',
        paddingTop: 20,
        paddingBottom: 16
      };

    case 'hero':
      return {
        id,
        type: 'hero',
        label: 'Hero Section',
        title: 'Empowering Healthcare Facilities',
        titleSize: 26,
        titleColor: '#0f172a',
        titleAlign: 'center',
        subtitle: 'Connect directly with verified vendors, equipment manufacturers, and biomedical consultants.',
        subtitleColor: '#475569',
        subtitleSize: 15,
        buttonText: 'Explore Hospital Projects',
        buttonUrl: '#',
        buttonBgColor: brandColor,
        buttonTextColor: '#ffffff',
        buttonRadius: 10,
        sectionBgColor: '#ffffff',
        paddingTop: 16,
        paddingBottom: 24
      };

    case 'text':
      return {
        id,
        type: 'text',
        label: 'Editorial Copy',
        title: 'Project Update Announcement',
        titleSize: 20,
        titleColor: '#0f172a',
        contentHtml: 'We are pleased to inform you that your quotation proposal has been shortlisted by the hospital committee for further technical evaluation.',
        fontSize: 14,
        textColor: '#334155',
        lineHeight: 22,
        sectionBgColor: '#ffffff',
        paddingTop: 16,
        paddingBottom: 16
      };

    case 'button':
      return {
        id,
        type: 'button',
        label: 'Action CTA',
        buttonText: 'Submit Proposal Documents',
        buttonUrl: '#',
        buttonBgColor: brandColor,
        buttonTextColor: '#ffffff',
        buttonRadius: 10,
        buttonAlign: 'center',
        sectionBgColor: '#ffffff',
        paddingTop: 16,
        paddingBottom: 20
      };

    case 'image':
      return {
        id,
        type: 'image',
        label: 'Showcase Image',
        imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
        imageAlt: 'Medical facility',
        imageWidth: 540,
        imageBorderRadius: 10,
        sectionBgColor: '#ffffff',
        paddingTop: 16,
        paddingBottom: 16
      };

    case 'two-column':
      return {
        id,
        type: 'two-column',
        label: '2-Column Features',
        sectionBgColor: '#ffffff',
        paddingTop: 16,
        paddingBottom: 20,
        columns: [
          { id: '1', title: 'Modular Cleanroom HVAC', text: 'Class 10,000 surgical suite airflow compliance.', buttonText: 'Learn More', buttonUrl: '#' },
          { id: '2', title: 'Medical Gas Pipelines', text: 'Oxygen manifold, vacuum points, and gas alarm systems.', buttonText: 'Explore', buttonUrl: '#' }
        ]
      };

    case 'three-column':
      return {
        id,
        type: 'three-column',
        label: '3-Column Stats',
        sectionBgColor: '#f8fafc',
        paddingTop: 20,
        paddingBottom: 20,
        columns: [
          { id: '1', title: '250+', text: 'Hospital Projects' },
          { id: '2', title: '100%', text: 'Verified Promoters' },
          { id: '3', title: '15', text: 'Project Stages' }
        ]
      };

    case 'rfp-card':
      return {
        id,
        type: 'rfp-card',
        label: 'Hospital Project RFP Card',
        hospitalName: 'Apollo Health Super Specialty',
        projectStage: 'Biomedical & Diagnostic Imaging Equipment',
        bedCapacity: '200 Beds',
        location: 'Bengaluru, Karnataka',
        budgetEst: '₹1.5 - 2.2 Crores',
        submissionDeadline: '10 Days Remaining',
        buttonText: 'Submit Technical Bid →',
        buttonUrl: '#',
        sectionBgColor: '#ffffff',
        paddingTop: 16,
        paddingBottom: 20
      };

    case 'quote-card':
      return {
        id,
        type: 'quote-card',
        label: 'Vendor Quotation Received',
        vendorName: 'Meditron Healthcare Pvt Ltd',
        quoteAmount: '₹34,80,000 (Excl. GST)',
        deliveryTime: '2 - 3 Weeks',
        warrantyPeriod: '36 Months Comprehensive',
        quotationRef: '#QT-2026-9041',
        buttonText: 'Review Quotation Details',
        buttonUrl: '#',
        sectionBgColor: '#ffffff',
        paddingTop: 16,
        paddingBottom: 20
      };

    case 'divider':
      return {
        id,
        type: 'divider',
        label: 'Divider Line',
        dividerWidth: 1,
        dividerColor: '#e2e8f0',
        dividerStyle: 'solid',
        sectionBgColor: '#ffffff',
        paddingTop: 10,
        paddingBottom: 10
      };

    case 'spacer':
      return {
        id,
        type: 'spacer',
        label: 'Vertical Spacer',
        spacerHeight: 24,
        sectionBgColor: '#ffffff'
      };

    case 'footer':
      return {
        id,
        type: 'footer',
        label: 'Compliance Footer',
        companyName: 'NOVA-H Healthcare Procurement & Infrastructure Network',
        address: 'Bandra Kurla Complex, Mumbai, India 400051',
        supportEmail: 'inquiries@nova-h.in',
        copyrightText: '© 2026 NOVA-H. All rights reserved.',
        unsubscribeUrl: '#',
        sectionBgColor: '#0f172a',
        paddingTop: 28,
        paddingBottom: 28
      };

    default:
      return {
        id,
        type: 'text',
        label: 'Content Block',
        contentHtml: 'Default text block',
        sectionBgColor: '#ffffff'
      };
  }
}
