import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  AlertCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { AccreditationProgramme, StageItem } from '../../types';
import { 
  getStoredAccreditationProgrammes, 
  saveStoredAccreditationProgrammes, 
  createAccreditationProgramme, 
  updateAccreditationProgramme, 
  deleteAccreditationProgramme,
  resetAccreditationProgrammesToDefault 
} from '../../utils/accreditationStorage';

interface AdminAccreditationManagerProps {
  toolkitStages: StageItem[];
  onNotify: (msg: string) => void;
}

export const AdminAccreditationManager: React.FC<AdminAccreditationManagerProps> = ({
  toolkitStages,
  onNotify
}) => {
  const [programmes, setProgrammes] = useState<AccreditationProgramme[]>(() => getStoredAccreditationProgrammes());
  const [editingProg, setEditingProg] = useState<AccreditationProgramme | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [expandedProgId, setExpandedProgId] = useState<string | null>(null);

  // Form states for Create/Edit
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formAuthority, setFormAuthority] = useState('');
  const [formCategory, setFormCategory] = useState<'Hospital Execution Templates' | 'Hospital Accreditation' | 'Laboratory Standards' | 'Laboratory Accreditation' | 'Safety Clearance'>('Hospital Execution Templates');
  const [formDescription, setFormDescription] = useState('');
  const [formTargetBeds, setFormTargetBeds] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formStages, setFormStages] = useState<number[]>([]);
  const [formNotes, setFormNotes] = useState<Record<number, string>>({});
  const [formActive, setFormActive] = useState(true);

  // Sync state if external change occurs
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<AccreditationProgramme[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setProgrammes(customEvent.detail);
      }
    };
    window.addEventListener('nova_accreditation_updated', handleSync);
    return () => window.removeEventListener('nova_accreditation_updated', handleSync);
  }, []);

  const openCreateModal = () => {
    setIsCreatingNew(true);
    setEditingProg(null);
    setFormName('');
    setFormCode('');
    setFormAuthority('Quality Council of India (QCI)');
    setFormCategory('Hospital Execution Templates');
    setFormDescription('');
    setFormTargetBeds('30–100 Bed Facilities');
    setFormDuration('6–12 Months');
    // Default to initial 8 standard stages
    setFormStages([1, 2, 3, 5, 7, 8, 12, 14]);
    setFormNotes({});
    setFormActive(true);
  };

  const openEditModal = (prog: AccreditationProgramme) => {
    setIsCreatingNew(false);
    setEditingProg(prog);
    setFormName(prog.name);
    setFormCode(prog.code);
    setFormAuthority(prog.authority);
    setFormCategory(prog.category);
    setFormDescription(prog.description);
    setFormTargetBeds(prog.targetBedCapacity);
    setFormDuration(prog.estimatedDuration);
    setFormStages([...prog.applicableStageNumbers]);
    setFormNotes(prog.stageNotes ? { ...prog.stageNotes } : {});
    setFormActive(prog.active !== false);
  };

  const handleDuplicate = (prog: AccreditationProgramme) => {
    const duplicated = createAccreditationProgramme({
      name: `${prog.name} (Copy)`,
      code: `${prog.code}-copy`,
      authority: prog.authority,
      category: prog.category,
      description: prog.description,
      targetBedCapacity: prog.targetBedCapacity,
      estimatedDuration: prog.estimatedDuration,
      applicableStageNumbers: [...prog.applicableStageNumbers],
      stageNotes: prog.stageNotes ? { ...prog.stageNotes } : {},
      active: true
    });
    setProgrammes(getStoredAccreditationProgrammes());
    onNotify(`Duplicated "${prog.name}" successfully.`);
    openEditModal(duplicated);
  };

  const handleDelete = (id: string, name: string) => {
    if (programmes.length <= 1) {
      onNotify('Cannot delete the last remaining accreditation programme.');
      return;
    }
    deleteAccreditationProgramme(id);
    setProgrammes(getStoredAccreditationProgrammes());
    onNotify(`Deleted accreditation programme "${name}".`);
  };

  const handleToggleStage = (stageNum: number) => {
    setFormStages(prev => {
      if (prev.includes(stageNum)) {
        return prev.filter(n => n !== stageNum).sort((a, b) => a - b);
      } else {
        return [...prev, stageNum].sort((a, b) => a - b);
      }
    });
  };

  const handleSelectAllStages = () => {
    setFormStages(toolkitStages.map(s => s.stageNumber));
  };

  const handleClearAllStages = () => {
    setFormStages([]);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      onNotify('Please provide a programme name.');
      return;
    }
    if (formStages.length === 0) {
      onNotify('Please map at least one applicable toolkit stage.');
      return;
    }

    const cleanCode = (formCode || formName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')).trim();

    if (isCreatingNew) {
      createAccreditationProgramme({
        name: formName.trim(),
        code: cleanCode,
        authority: formAuthority.trim() || 'Accreditation Board',
        category: formCategory,
        description: formDescription.trim(),
        targetBedCapacity: formTargetBeds.trim() || 'All Facilities',
        estimatedDuration: formDuration.trim() || '6–12 Months',
        applicableStageNumbers: formStages,
        stageNotes: formNotes,
        active: formActive
      });
      onNotify(`Created new accreditation programme "${formName}".`);
    } else if (editingProg) {
      updateAccreditationProgramme(editingProg.id, {
        name: formName.trim(),
        code: cleanCode,
        authority: formAuthority.trim() || 'Accreditation Board',
        category: formCategory,
        description: formDescription.trim(),
        targetBedCapacity: formTargetBeds.trim() || 'All Facilities',
        estimatedDuration: formDuration.trim() || '6–12 Months',
        applicableStageNumbers: formStages,
        stageNotes: formNotes,
        active: formActive
      });
      onNotify(`Updated "${formName}" accreditation programme.`);
    }

    setProgrammes(getStoredAccreditationProgrammes());
    setEditingProg(null);
    setIsCreatingNew(false);
  };

  const handleResetDefaults = () => {
    const defaults = resetAccreditationProgrammesToDefault();
    setProgrammes(defaults);
    onNotify('Accreditation programmes restored to default standards.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-7 rounded-2xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
              <Award className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 px-2 py-0.5 rounded text-white">
              Institutional Templates
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
            Toolkit Templates &amp; Stage Mapping
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Configure institutional quality standards (NABH, JCI, NABL) and define which of the 15 developmental stages apply. Enrolled hospital owners will automatically receive a customized, stage-filtered toolkit view.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to default NABH, JCI and NABL templates"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Toolkit Template</span>
          </button>
        </div>
      </div>

      {/* Programmes List Grid */}
      <div className="grid grid-cols-1 gap-4">
        {programmes.map((prog) => {
          const isExpanded = expandedProgId === prog.id;
          const mappedCount = prog.applicableStageNumbers.length;
          const totalCount = toolkitStages.length;

          return (
            <div
              key={prog.id}
              className={`rounded-2xl border transition-all bg-white dark:bg-slate-900 shadow-2xs overflow-hidden ${
                prog.active
                  ? 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                  : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50 dark:bg-slate-900/50'
              }`}
            >
              <div className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {prog.category}
                    </span>

                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                      {prog.authority}
                    </span>

                    {!prog.active && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Inactive
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {prog.name}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed max-w-3xl">
                    {prog.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>{prog.estimatedDuration} prep cycle</span>
                    </span>

                    <span className="flex items-center gap-1 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{prog.targetBedCapacity}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{mappedCount} of {totalCount} Stages Mapped</span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => setExpandedProgId(isExpanded ? null : prog.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    title={isExpanded ? 'Hide mapped stages' : 'View mapped stages'}
                  >
                    <span>{isExpanded ? 'Hide Stages' : 'View Stages'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(prog)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                    title="Duplicate programme"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(prog)}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 text-blue-700 dark:text-blue-300 hover:text-white text-xs font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Mapping</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(prog.id, prog.name)}
                    className="p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 cursor-pointer transition-colors"
                    title="Delete programme"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expandable Mapped Stages Preview */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 animate-fadeIn space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    <span>Applicable Hospital Development Stages for {prog.name}:</span>
                    <span>{mappedCount} active stages</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {toolkitStages.map((stage) => {
                      const isMapped = prog.applicableStageNumbers.includes(stage.stageNumber);
                      const customNote = prog.stageNotes?.[stage.stageNumber];

                      return (
                        <div
                          key={stage.stageNumber}
                          className={`p-3 rounded-xl border text-xs transition-all ${
                            isMapped
                              ? 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 text-slate-800 dark:text-slate-200 shadow-2xs'
                              : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-600 line-through'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-[11px] text-blue-600 dark:text-blue-400">
                              Stage {stage.stageNumber}
                            </span>
                            {isMapped ? (
                              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                                ✓
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">Not Mapped</span>
                            )}
                          </div>
                          <p className={`font-semibold line-clamp-1 ${isMapped ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                            {stage.title}
                          </p>
                          {isMapped && customNote && (
                            <p className="mt-1.5 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200/70 dark:border-amber-800/60 leading-tight">
                              <strong>Note:</strong> {customNote}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT PROGRAMME MODAL */}
      {(isCreatingNew || editingProg) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                  <Award className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {isCreatingNew ? 'Create Toolkit Template' : `Edit: ${editingProg?.name}`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Map applicable toolkit developmental stages and guidelines
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setIsCreatingNew(false); setEditingProg(null); }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleSaveForm} className="overflow-y-auto flex-1 py-5 space-y-5 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Programme Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Template Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. NABH Entry-Level Standards"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Code / Slug */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Unique Code / Identifier
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. nabh-entry"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Accrediting Authority */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Issuing Authority / Standard Body
                  </label>
                  <input
                    type="text"
                    value={formAuthority}
                    onChange={(e) => setFormAuthority(e.target.value)}
                    placeholder="e.g. Quality Council of India (QCI) / NABH"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Template Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Hospital Execution Templates">Hospital Execution Templates</option>
                    <option value="Laboratory Standards">Laboratory Standards</option>
                    <option value="Safety Clearance">Safety &amp; Clearance Templates</option>
                  </select>
                </div>

                {/* Estimated Prep Cycle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Estimated Timeline / Cycle
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 6–9 Months"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Target Facility Size */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Target Facility Scale / Bed Range
                  </label>
                  <input
                    type="text"
                    value={formTargetBeds}
                    onChange={(e) => setFormTargetBeds(e.target.value)}
                    placeholder="e.g. Up to 50 beds (SHCO) & 50–100 beds (HCO)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Programme Objective &amp; Details
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe the key clinical, operational, and insurance empanelment objectives..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* STAGE MAPPING SECTION */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>Map Applicable Toolkit Stages ({formStages.length} / {toolkitStages.length} Selected)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Check the developmental milestones required to attain this accreditation.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllStages}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearAllStages}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* 15 Stages Interactive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50">
                  {toolkitStages.map((stg) => {
                    const isSelected = formStages.includes(stg.stageNumber);
                    return (
                      <div
                        key={stg.stageNumber}
                        onClick={() => handleToggleStage(stg.stageNumber)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer select-none transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600 shadow-2xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent div onClick
                          className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[10px] text-blue-700 dark:text-blue-300 uppercase">
                              Stage {stg.stageNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">
                              {stg.typicalTimeline}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 dark:text-white truncate mt-0.5">
                            {stg.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {stg.category}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Active for Hospital Owner Enrolment
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    When active, hospital owners can select this framework during signup or in their workspace dashboard.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => { setIsCreatingNew(false); setEditingProg(null); }}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isCreatingNew ? 'Create Programme' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
