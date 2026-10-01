import React, { useState } from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Columns2, 
  Columns3, 
  SquareAsterisk, 
  Minus, 
  ChevronsUpDown, 
  FileText, 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  Plus, 
  Sparkles,
  HelpCircle,
  Search
} from 'lucide-react';
import { MjmlBlockType, MjmlBlock } from './types';

interface MjmlBlockPaletteProps {
  onAddBlock: (blockType: MjmlBlockType) => void;
  onDragStartBlock?: (blockType: MjmlBlockType) => void;
}

interface PaletteItem {
  type: MjmlBlockType;
  title: string;
  desc: string;
  icon: React.ReactNode;
  category: 'structure' | 'content' | 'healthcare' | 'utility';
  badge?: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Structure
  {
    type: 'header',
    title: 'Brand Header',
    desc: 'Logo banner with alignment & custom sizing',
    icon: <SquareAsterisk className="w-4 h-4 text-blue-500" />,
    category: 'structure'
  },
  {
    type: 'two-column',
    title: '2-Column Grid',
    desc: 'Side-by-side cards or feature comparison',
    icon: <Columns2 className="w-4 h-4 text-indigo-500" />,
    category: 'structure'
  },
  {
    type: 'three-column',
    title: '3-Column Stats',
    desc: 'Key metrics, numbers, or accreditation badges',
    icon: <Columns3 className="w-4 h-4 text-purple-500" />,
    category: 'structure'
  },
  {
    type: 'footer',
    title: 'Legal & Footer',
    desc: 'Company address, copyright & unsubscribe notice',
    icon: <ShieldCheck className="w-4 h-4 text-slate-500" />,
    category: 'structure'
  },

  // Content
  {
    type: 'hero',
    title: 'Hero Banner',
    desc: 'Bold headline, subtitle, image & direct CTA',
    icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    category: 'content',
    badge: 'Popular'
  },
  {
    type: 'text',
    title: 'Editorial Text',
    desc: 'Headings, paragraph copy & rich typography',
    icon: <Type className="w-4 h-4 text-emerald-500" />,
    category: 'content'
  },
  {
    type: 'button',
    title: 'CTA Button',
    desc: 'High-contrast action button with custom styling',
    icon: <SquareAsterisk className="w-4 h-4 text-blue-600" />,
    category: 'content'
  },
  {
    type: 'image',
    title: 'Image Showcase',
    desc: 'Full-bleed or centered responsive photo asset',
    icon: <ImageIcon className="w-4 h-4 text-sky-500" />,
    category: 'content'
  },

  // Healthcare
  {
    type: 'rfp-card',
    title: 'Hospital RFP Card',
    desc: 'Bed count, project stage, budget & bid CTA',
    icon: <Building2 className="w-4 h-4 text-blue-600" />,
    category: 'healthcare',
    badge: 'Healthcare'
  },
  {
    type: 'quote-card',
    title: 'Vendor Quote Card',
    desc: 'Commercial quote summary, turnaround & BoQ link',
    icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
    category: 'healthcare',
    badge: 'Procurement'
  },

  // Utility
  {
    type: 'divider',
    title: 'Divider Line',
    desc: 'Subtle section border line (solid, dashed)',
    icon: <Minus className="w-4 h-4 text-slate-400" />,
    category: 'utility'
  },
  {
    type: 'spacer',
    title: 'Vertical Spacer',
    desc: 'Custom whitespace between email sections',
    icon: <ChevronsUpDown className="w-4 h-4 text-slate-400" />,
    category: 'utility'
  }
];

export const MjmlBlockPalette: React.FC<MjmlBlockPaletteProps> = ({
  onAddBlock,
  onDragStartBlock
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'structure' | 'content' | 'healthcare' | 'utility'>('all');

  const filteredItems = PALETTE_ITEMS.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>MJML Block Palette</span>
          </h3>
          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
            {PALETTE_ITEMS.length} blocks
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
          Drag blocks onto the canvas or click <span className="font-bold text-blue-600 dark:text-blue-400">+</span> to append.
        </p>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search email blocks..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 text-[11px]">
          {(['all', 'healthcare', 'content', 'structure', 'utility'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded-lg font-bold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Palette Items List */}
      <div className="p-3 overflow-y-auto flex-1 space-y-2">
        {filteredItems.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', item.type);
              onDragStartBlock?.(item.type);
            }}
            className="group relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/90 hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-grab active:cursor-grabbing shadow-2xs"
          >
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/60 shrink-0 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                  {item.desc}
                </p>
              </div>

              {/* Add button shortcut */}
              <button
                type="button"
                onClick={() => onAddBlock(item.type)}
                title="Add to bottom of email"
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-opacity cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs">
            No matching blocks found.
          </div>
        )}
      </div>

      {/* Footer tip */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span>MJML compiles cleanly into bulletproof email HTML.</span>
      </div>
    </div>
  );
};
