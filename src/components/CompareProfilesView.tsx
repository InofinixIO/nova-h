import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  ArrowLeftRight, 
  CheckCircle2, 
  X, 
  Plus, 
  Star, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Printer, 
  Share2, 
  ExternalLink, 
  Lock, 
  Unlock, 
  Sparkles, 
  Layers, 
  Phone, 
  Mail, 
  Award, 
  Clock, 
  Briefcase,
  HelpCircle,
  FileText
} from 'lucide-react';
import { DirectoryItem, AuthUser, UserRole } from '../types';

interface CompareProfilesViewProps {
  directoryItems: DirectoryItem[];
  comparedIds: string[];
  onToggleCompare: (id: string) => void;
  onClearCompare: () => void;
  onSelectVendor: (vendor: DirectoryItem) => void;
  onPostRequirement: () => void;
  onOpenAuth: (mode: 'signin' | 'signup', role?: UserRole) => void;
  currentUser: AuthUser | null;
  onNavigate: (slug: any) => void;
}

export const CompareProfilesView: React.FC<CompareProfilesViewProps> = ({
  directoryItems,
  comparedIds,
  onToggleCompare,
  onClearCompare,
  onSelectVendor,
  onPostRequirement,
  onOpenAuth,
  currentUser,
  onNavigate
}) => {
  const [highlightDifferences, setHighlightDifferences] = useState<boolean>(false);
  const [activeCategoryPreset, setActiveCategoryPreset] = useState<string>('all');
  const [selectorSlotIndex, setSelectorSlotIndex] = useState<number | null>(null);
  const [slotSearchQuery, setSlotSearchQuery] = useState<string>('');

  // Determine initial compared items
  // If fewer than 2 items are selected, pick 2 or 3 high quality items as default
  const defaultItems = useMemo(() => {
    if (directoryItems.length === 0) return [];
    // Prioritize verified items across diverse or popular categories
    const sorted = [...directoryItems].sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0) || b.rating - a.rating);
    return sorted.slice(0, 3);
  }, [directoryItems]);

  const activeComparedItems: DirectoryItem[] = useMemo(() => {
    if (comparedIds.length > 0) {
      const items = comparedIds
        .map(id => directoryItems.find(d => d.id === id))
        .filter((d): d is DirectoryItem => Boolean(d));
      if (items.length > 0) return items.slice(0, 4);
    }
    return defaultItems.slice(0, 3);
  }, [comparedIds, directoryItems, defaultItems]);

  // Presets by healthcare specialty
  const PRESETS = [
    { id: 'all', label: 'All Specialties' },
    { id: 'consulting', label: 'Hospital Advisory & Consultants', keyword: 'consult' },
    { id: 'arch', label: 'Hospital Architecture & Design', keyword: 'architect' },
    { id: 'mep', label: 'MEP, HVAC & Cleanrooms', keyword: 'mep' },
    { id: 'equipment', label: 'Medical Equipment & ICU', keyword: 'equipment' },
    { id: 'it', label: 'Healthcare IT & HIS', keyword: 'it' }
  ];

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setActiveCategoryPreset(preset.id);
    if (preset.id === 'all') {
      onClearCompare();
      return;
    }
    const matches = directoryItems.filter(item => 
      item.category.toLowerCase().includes(preset.keyword || '') ||
      item.description.toLowerCase().includes(preset.keyword || '') ||
      item.productsAndServices.some(p => p.toLowerCase().includes(preset.keyword || ''))
    ).slice(0, 3);

    if (matches.length > 0) {
      onClearCompare();
      matches.forEach(m => onToggleCompare(m.id));
    }
  };

  const handleReplaceSlot = (oldItemId: string, newItemId: string) => {
    if (oldItemId === newItemId) {
      setSelectorSlotIndex(null);
      return;
    }
    if (comparedIds.includes(oldItemId)) {
      onToggleCompare(oldItemId);
    }
    if (!comparedIds.includes(newItemId)) {
      onToggleCompare(newItemId);
    }
    setSelectorSlotIndex(null);
    setSlotSearchQuery('');
  };

  const handleAddSlot = (newItemId: string) => {
    if (!comparedIds.includes(newItemId)) {
      onToggleCompare(newItemId);
    }
    setSelectorSlotIndex(null);
    setSlotSearchQuery('');
  };

  const handleRemoveSlot = (itemId: string) => {
    onToggleCompare(itemId);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to check if values differ for difference highlighting
  const isRowDifferent = (getter: (item: DirectoryItem) => any) => {
    if (activeComparedItems.length <= 1) return false;
    const first = JSON.stringify(getter(activeComparedItems[0]));
    return activeComparedItems.some(item => JSON.stringify(getter(item)) !== first);
  };

  // Filter directory for the slot swap modal/dropdown
  const availableForSlot = useMemo(() => {
    return directoryItems
      .filter(item => !activeComparedItems.some(c => c.id === item.id))
      .filter(item => {
        if (!slotSearchQuery) return true;
        const q = slotSearchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
        );
      });
  }, [directoryItems, activeComparedItems, slotSearchQuery]);

  return (
    <div className="pt-2 sm:pt-4 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => onNavigate('directory')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Directory</span>
            </button>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900">
              Side-by-Side Comparison
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ArrowLeftRight className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Healthcare Partner Profile Comparison</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Evaluate verified track records, hospital projects completed, regulatory compliance, and clinical capabilities side-by-side to make confident procurement decisions.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none transition-colors">
            <input
              type="checkbox"
              checked={highlightDifferences}
              onChange={(e) => setHighlightDifferences(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>Highlight Differences</span>
          </label>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            title="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Print Matrix</span>
          </button>

          {comparedIds.length > 0 && (
            <button
              onClick={onClearCompare}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-600 dark:text-slate-400 hover:text-red-700 dark:hover:text-red-400 font-semibold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              Reset Selection
            </button>
          )}
        </div>
      </div>

      {/* Specialty Quick Filter Presets */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
          Quick Compare:
        </span>
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleApplyPreset(preset)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeCategoryPreset === preset.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* MAIN SIDE-BY-SIDE MATRIX */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full border-collapse text-left min-w-[768px]">
          
          {/* HEADER / PARTNER CARDS ROW */}
          <thead>
            <tr className="bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
              <th className="w-56 p-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/70 align-top border-r border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="block text-slate-800 dark:text-slate-200">Partner Details</span>
                  <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400 lowercase">
                    comparing {activeComparedItems.length} of 4 max
                  </span>
                </div>
              </th>

              {activeComparedItems.map((item, idx) => (
                <th key={item.id} className="p-4 align-top border-r border-slate-200 dark:border-slate-800 last:border-r-0 min-w-[240px]">
                  <div className="space-y-3">
                    {/* Action Bar: Role pill & Remove button */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.role === 'advisor'
                          ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                          : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      }`}>
                        {item.role === 'advisor' ? 'Advisor' : 'Vendor'}
                      </span>

                      <button
                        onClick={() => handleRemoveSlot(item.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Name & Verification */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {item.name}
                        </h3>
                        {item.verified && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" title="Verified by NOVA" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mt-0.5">
                        {item.category}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <span>{item.location}</span>
                      </p>
                    </div>

                    {/* Rating & Experience */}
                    <div className="flex items-center justify-between text-xs bg-slate-100/70 dark:bg-slate-800/70 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{item.rating.toFixed(1)}</span>
                        <span className="text-slate-400 dark:text-slate-500 font-normal">({item.reviewsCount})</span>
                      </div>
                      <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                        {item.yearsOfExperience}+ yrs exp
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      <button
                        onClick={() => onSelectVendor(item)}
                        className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <span>View Full Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectorSlotIndex(idx);
                        }}
                        className="w-full py-1 px-2 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <ArrowLeftRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <span>Swap Partner</span>
                      </button>
                    </div>
                  </div>
                </th>
              ))}

              {/* Slot to add another profile if less than 4 */}
              {activeComparedItems.length < 4 && (
                <th className="p-4 align-middle bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 last:border-r-0 min-w-[200px] text-center">
                  <button
                    onClick={() => setSelectorSlotIndex(99)}
                    className="w-full h-full min-h-[200px] border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-950 flex items-center justify-center text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold">Add Another Partner</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Compare up to 4</span>
                  </button>
                </th>
              )}
            </tr>
          </thead>

          {/* TABLE BODY: COMPARISON CRITERIA ROWS */}
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
            
            {/* SECTION 1: PROJECT STAGES */}
            <tr className="bg-slate-100/60 dark:bg-slate-800/60 font-bold text-slate-800 dark:text-slate-200">
              <td colSpan={activeComparedItems.length + (activeComparedItems.length < 4 ? 2 : 1)} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                1. Hospital Project Stages Supported
              </td>
            </tr>

            <tr className={highlightDifferences && isRowDifferent(i => i.projectStages) ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 align-top">
                Project Stages
              </td>
              {activeComparedItems.map(item => (
                <td key={item.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top">
                  <div className="flex flex-wrap gap-1.5">
                    {item.projectStages && item.projectStages.length > 0 ? (
                      item.projectStages.map((stage, sIdx) => (
                        <span 
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-semibold"
                        >
                          {stage}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic">Across all stages</span>
                    )}
                  </div>
                </td>
              ))}
              {activeComparedItems.length < 4 && <td className="bg-slate-50/30 dark:bg-slate-900/30"></td>}
            </tr>

            {/* SECTION 2: TRACK RECORD & HEALTHCARE SCALE */}
            <tr className="bg-slate-100/60 dark:bg-slate-800/60 font-bold text-slate-800 dark:text-slate-200">
              <td colSpan={activeComparedItems.length + (activeComparedItems.length < 4 ? 2 : 1)} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                2. Healthcare Track Record &amp; Scale
              </td>
            </tr>

            <tr className={highlightDifferences && isRowDifferent(i => i.yearsOfExperience) ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800">
                Healthcare Experience
              </td>
              {activeComparedItems.map(item => (
                <td key={item.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0 font-bold text-slate-900 dark:text-white">
                  {item.yearsOfExperience} Years Dedicated Experience
                </td>
              ))}
              {activeComparedItems.length < 4 && <td className="bg-slate-50/30 dark:bg-slate-900/30"></td>}
            </tr>

            <tr className={highlightDifferences && isRowDifferent(i => i.featuredProject) ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 align-top">
                Featured Landmark Project
              </td>
              {activeComparedItems.map(item => (
                <td key={item.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top">
                  {item.featuredProject ? (
                    <div className="font-semibold text-slate-800 dark:text-slate-200 bg-blue-50/60 dark:bg-blue-950/40 p-2 rounded-lg border border-blue-100 dark:border-blue-900">
                      {item.featuredProject}
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 italic">Multiple private and trust hospitals</span>
                  )}
                </td>
              ))}
              {activeComparedItems.length < 4 && <td className="bg-slate-50/30 dark:bg-slate-900/30"></td>}
            </tr>

            <tr className={highlightDifferences && isRowDifferent(i => i.clientPortfolio) ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 align-top">
                Notable Hospital Clients
              </td>
              {activeComparedItems.map(item => (
                <td key={item.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top">
                  {item.clientPortfolio && item.clientPortfolio.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.clientPortfolio.map((client, cIdx) => (
                        <span key={cIdx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px] border border-slate-200/80 dark:border-slate-700/80">
                          {client}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 italic">Confidential Healthcare Portfolios</span>
                  )}
                </td>
              ))}
              {activeComparedItems.length < 4 && <td className="bg-slate-50/30 dark:bg-slate-900/30"></td>}
            </tr>

            {/* SECTION 3: PRODUCTS & SERVICES */}
            <tr className="bg-slate-100/60 dark:bg-slate-800/60 font-bold text-slate-800 dark:text-slate-200">
              <td colSpan={activeComparedItems.length + (activeComparedItems.length < 4 ? 2 : 1)} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                3. Products, Solutions &amp; Clinical Capabilities
              </td>
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 align-top">
                Core Offerings
              </td>
              {activeComparedItems.map(item => (
                <td key={item.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top">
                  <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                    {item.productsAndServices?.map((prod, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <span className="text-blue-500 dark:text-blue-400 mt-0.5 font-bold">•</span>
                        <span>{prod}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
              {activeComparedItems.length < 4 && <td className="bg-slate-50/30 dark:bg-slate-900/30"></td>}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 align-top">
                About &amp; Overview
              </td>
              {activeComparedItems.map(item => (
                <td key={item.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </td>
              ))}
              {activeComparedItems.length < 4 && <td className="bg-slate-50/30 dark:bg-slate-900/30"></td>}
            </tr>

            {/* SECTION 4: CERTIFICATIONS & COMPLIANCE */}
            <tr className="bg-slate-100/60 dark:bg-slate-800/60 font-bold text-slate-800 dark:text-slate-200">
              <td colSpan={activeComparedItems.length + (activeComparedItems.length < 4 ? 2 : 1)} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                4. Quality, Compliance &amp; Accreditations
              </td>
            </tr>

            <tr className={highlightDifferences && isRowDifferent(i => i.certifications) ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 align-top">
                Certifications &amp; Approvals
              </td>
              {activeComparedItems.map(item => (
                <td key={item.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top">
                  {item.certifications && item.certifications.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.certifications.map((cert, cIdx) => (
                        <span key={cIdx} className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-[10px] flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{cert}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 italic">NABH / ISO compliant standards</span>
                  )}
                </td>
              ))}
              {activeComparedItems.length < 4 && <td className="bg-slate-50/30 dark:bg-slate-900/30"></td>}
            </tr>

            <tr className={highlightDifferences && isRowDifferent(i => i.verified) ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800">
                NOVA Network Verification
              </td>
              {activeComparedItems.map(item => (
                <td key={item.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                  {item.verified ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Verified Partner</span>
                    </div>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Standard Listing</span>
                  )}
                </td>
              ))}
              {activeComparedItems.length < 4 && <td className="bg-slate-50/30 dark:bg-slate-900/30"></td>}
            </tr>

            {/* SECTION 5: COMMERCIAL & LOGISTICS */}
            <tr className="bg-slate-100/60 dark:bg-slate-800/60 font-bold text-slate-800 dark:text-slate-200">
              <td colSpan={activeComparedItems.length + (activeComparedItems.length < 4 ? 2 : 1)} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                5. Commercial Scope &amp; Delivery Footprint
              </td>
            </tr>

            <tr className={highlightDifferences && isRowDifferent(i => i.priceRange) ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800">
                Commercial Scale
              </td>
              {activeComparedItems.map(item => (
                <td key={item.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0 font-medium text-slate-800 dark:text-slate-200">
                  {currentUser ? (
                    <span>{item.priceRange || 'Custom Quote / RFP Based'}</span>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Lock className="w-3 h-3 text-amber-500" />
                      <span>Sign in to unlock pricing</span>
                    </div>
                  )}
                </td>
              ))}
              {activeComparedItems.length < 4 && <td className="bg-slate-50/30 dark:bg-slate-900/30"></td>}
            </tr>

            <tr className={highlightDifferences && isRowDifferent(i => i.turnaroundTime) ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800">
                Turnaround / Delivery Lead
              </td>
              {activeComparedItems.map(item => (
                <td key={item.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0 font-medium text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    <span>{item.turnaroundTime || 'Project milestone schedule'}</span>
                  </div>
                </td>
              ))}
              {activeComparedItems.length < 4 && <td className="bg-slate-50/30 dark:bg-slate-900/30"></td>}
            </tr>

            <tr className={highlightDifferences && isRowDifferent(i => i.serviceLocations) ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 align-top">
                Service Regions
              </td>
              {activeComparedItems.map(item => (
                <td key={item.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top">
                  <div className="flex flex-wrap gap-1">
                    {item.serviceLocations?.map((loc, lIdx) => (
                      <span key={lIdx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium">
                        {loc}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
              {activeComparedItems.length < 4 && <td className="bg-slate-50/30 dark:bg-slate-900/30"></td>}
            </tr>

            {/* SECTION 6: DIRECT CONTACT & ACTION */}
            <tr className="bg-slate-100/60 dark:bg-slate-800/60 font-bold text-slate-800 dark:text-slate-200">
              <td colSpan={activeComparedItems.length + (activeComparedItems.length < 4 ? 2 : 1)} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                6. Direct Communication &amp; RFQ
              </td>
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 align-top">
                Contact Decision-Maker
              </td>
              {activeComparedItems.map(item => (
                <td key={item.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top space-y-2">
                  {currentUser ? (
                    <div className="space-y-1 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="font-semibold break-all text-slate-900 dark:text-white">{item.contactEmail}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{item.phone}</span>
                      </div>
                      {item.website && (
                        <div className="pt-1">
                          <a 
                            href={item.website.startsWith('http') ? item.website : `https://${item.website}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <span>Website</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[11px] leading-relaxed">
                        Direct contact numbers and verified emails are available for authenticated hospital promoters.
                      </div>
                      <button
                        onClick={() => onOpenAuth('signin')}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Sign In to Unlock</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={onPostRequirement}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs mt-2"
                  >
                    <span>Request Quotation</span>
                  </button>
                </td>
              ))}
              {activeComparedItems.length < 4 && <td className="bg-slate-50/30 dark:bg-slate-900/30"></td>}
            </tr>

          </tbody>
        </table>
      </div>

      {/* SWAP / ADD PARTNER MODAL / SELECTOR */}
      {selectorSlotIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/70">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {selectorSlotIndex === 99 ? 'Add Partner to Comparison' : `Swap Partner (Slot ${selectorSlotIndex + 1})`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose a verified hospital vendor or healthcare advisor from the directory.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectorSlotIndex(null);
                  setSlotSearchQuery('');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <input
                type="text"
                value={slotSearchQuery}
                onChange={(e) => setSlotSearchQuery(e.target.value)}
                placeholder="Search by company name, category, or city..."
                className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                autoFocus
              />
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
              {availableForSlot.length > 0 ? (
                availableForSlot.map(item => (
                  <div 
                    key={item.id}
                    className="pt-2 first:pt-0 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 p-2 rounded-xl transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</span>
                        {item.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">{item.category}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.location} • {item.yearsOfExperience}+ yrs exp</p>
                    </div>

                    <button
                      onClick={() => {
                        if (selectorSlotIndex === 99) {
                          handleAddSlot(item.id);
                        } else {
                          const oldItem = activeComparedItems[selectorSlotIndex];
                          if (oldItem) {
                            handleReplaceSlot(oldItem.id, item.id);
                          }
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
                    >
                      Select
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                  No other partners match your search query.
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 text-right">
              <button
                onClick={() => {
                  setSelectorSlotIndex(null);
                  setSlotSearchQuery('');
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER CALLOUT */}
      <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
            Need customized competitive bidding or turnkey technical RFP?
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Post your hospital project specifications to receive structured commercial quotes from verified vendors with zero commission markups.
          </p>
        </div>
        <button
          onClick={onPostRequirement}
          className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
        >
          Post Project Requirement
        </button>
      </div>

    </div>
  );
};
