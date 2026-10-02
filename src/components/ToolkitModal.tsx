import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Clock, 
  Users, 
  ShieldAlert, 
  Award, 
  FileText, 
  Check, 
  Layers,
  Sparkles
} from 'lucide-react';
import { TOOLKIT_15_STAGES } from '../data/mockData';
import { StageItem, AuthUser, AccreditationProgramme } from '../types';
import { getStoredAccreditationProgrammes, getAccreditationProgrammeById } from '../utils/accreditationStorage';

interface ToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStageIndex?: number;
  stages?: StageItem[];
  initialProgrammeId?: string;
  currentUser?: AuthUser | null;
}

export const ToolkitModal: React.FC<ToolkitModalProps> = ({
  isOpen,
  onClose,
  initialStageIndex = 0,
  stages,
  initialProgrammeId,
  currentUser
}) => {
  const fullStagesList = stages && stages.length > 0 ? stages : TOOLKIT_15_STAGES;
  
  // Accreditation programmes
  const [programmes, setProgrammes] = useState<AccreditationProgramme[]>(() => getStoredAccreditationProgrammes());
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>(() => {
    return initialProgrammeId || currentUser?.enrolledAccreditationId || '';
  });

  const [filterMode, setFilterMode] = useState<'mapped_only' | 'full_roadmap'>('mapped_only');
  const [activeStageNumber, setActiveStageNumber] = useState<number>(() => {
    return fullStagesList[initialStageIndex]?.stageNumber || 1;
  });
  const [completedItems, setCompletedItems] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (isOpen) {
      const progId = initialProgrammeId || currentUser?.enrolledAccreditationId || '';
      setSelectedProgrammeId(progId);
      setFilterMode(progId ? 'mapped_only' : 'full_roadmap');
      const startNum = fullStagesList[initialStageIndex]?.stageNumber || 1;
      setActiveStageNumber(startNum);
    }
  }, [isOpen, initialStageIndex, initialProgrammeId, currentUser?.enrolledAccreditationId, fullStagesList]);

  if (!isOpen) return null;

  const activeProgramme: AccreditationProgramme | undefined = selectedProgrammeId
    ? programmes.find(p => p.id === selectedProgrammeId || p.code === selectedProgrammeId)
    : undefined;

  // Filter stages based on current view mode
  const displayedStages = (!activeProgramme || filterMode === 'full_roadmap')
    ? fullStagesList
    : fullStagesList.filter(s => activeProgramme.applicableStageNumbers.includes(s.stageNumber));

  // Current active stage item
  const currentStage: StageItem = fullStagesList.find(s => s.stageNumber === activeStageNumber) 
    || displayedStages[0] 
    || fullStagesList[0];

  const currentDisplayIndex = displayedStages.findIndex(s => s.stageNumber === currentStage.stageNumber);

  const toggleCheck = (itemKey: string) => {
    setCompletedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const calculateStageProgress = () => {
    const total = currentStage.checklist.length;
    const completed = currentStage.checklist.filter((_, idx) => completedItems[`${currentStage.stageNumber}-${idx}`]).length;
    return Math.round((completed / total) * 100);
  };

  const isStageMapped = (stageNum: number) => {
    if (!activeProgramme) return true;
    return activeProgramme.applicableStageNumbers.includes(stageNum);
  };

  const handlePrev = () => {
    if (currentDisplayIndex > 0) {
      setActiveStageNumber(displayedStages[currentDisplayIndex - 1].stageNumber);
    }
  };

  const handleNext = () => {
    if (currentDisplayIndex < displayedStages.length - 1) {
      setActiveStageNumber(displayedStages[currentDisplayIndex + 1].stageNumber);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                  Hospital Owners Toolkit
                </h2>
                {activeProgramme && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/30 text-blue-300 border border-blue-400/30">
                    {activeProgramme.code.toUpperCase()} Roadmap
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                15-stage masterguide from concept to commissioning &amp; quality accreditation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeProgramme ? (
              <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterMode('mapped_only')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    filterMode === 'mapped_only'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mapped ({activeProgramme.applicableStageNumbers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('full_roadmap')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    filterMode === 'full_roadmap'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All 15
                </button>
              </div>
            ) : null}

            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-slate-800 text-xs text-blue-300 font-mono">
              Stage {currentStage.stageNumber} of {fullStagesList.length}
            </span>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area with Sidebar Navigation */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Stages List (Sidebar) */}
          <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-3 space-y-1 shrink-0">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{activeProgramme && filterMode === 'mapped_only' ? `${displayedStages.length} Mapped Stages` : 'All 15 Stages'}</span>
              {activeProgramme && (
                <span className="text-blue-600 dark:text-blue-400 font-mono text-[10px]">
                  {activeProgramme.code.toUpperCase()}
                </span>
              )}
            </div>

            {displayedStages.map((s) => {
              const isSelected = s.stageNumber === currentStage.stageNumber;
              const mapped = isStageMapped(s.stageNumber);
              return (
                <button
                  key={s.stageNumber}
                  onClick={() => setActiveStageNumber(s.stageNumber)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : mapped
                        ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                        : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                      isSelected 
                        ? 'bg-white text-blue-700 font-bold' 
                        : mapped 
                          ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {s.stageNumber}
                    </span>
                    <span className="truncate">{s.title.split(':')[0] || s.title}</span>
                  </div>

                  {activeProgramme && mapped && filterMode === 'full_roadmap' && (
                    <Award className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-300' : 'text-blue-500'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Main Stage View */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900">
            
            {/* Stage Title and Meta */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase border border-blue-200 dark:border-blue-800">
                  Stage {currentStage.stageNumber}: {currentStage.category}
                </span>

                {activeProgramme && isStageMapped(currentStage.stageNumber) && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{activeProgramme.name.split('(')[0].trim()} Milestone</span>
                  </span>
                )}

                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Timeline: {currentStage.typicalTimeline}</span>
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {currentStage.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {currentStage.summary}
              </p>
            </div>

            {/* Special Accreditation Audit Guidelines if present */}
            {activeProgramme && activeProgramme.stageNotes && activeProgramme.stageNotes[currentStage.stageNumber] && (
              <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 text-xs space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
                  <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{activeProgramme.name} • Special Stage Directives</span>
                </div>
                <p className="text-blue-950 dark:text-blue-200 leading-relaxed text-[11px] sm:text-xs">
                  {activeProgramme.stageNotes[currentStage.stageNumber]}
                </p>
              </div>
            )}

            {/* Checklist with Interactive Toggles */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Stage Milestone Checklist</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Check off items as your project achieves them</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{calculateStageProgress()}% Complete</span>
                  <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${calculateStageProgress()}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {currentStage.checklist.map((item, idx) => {
                  const key = `${currentStage.stageNumber}-${idx}`;
                  const isChecked = !!completedItems[key];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(key)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-slate-800 dark:text-slate-200'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className={`text-xs sm:text-sm font-medium ${isChecked ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Deliverables & Stakeholders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-3">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Key Deliverables Required</span>
                </h5>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {currentStage.keyDeliverables.map((deliv, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                      <span>{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-3">
                  <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Key Stakeholders Involved</span>
                </h5>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {currentStage.keyStakeholders.map((person, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                      <span>{person}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentDisplayIndex <= 0}
            className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Stage</span>
          </button>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            Step {currentDisplayIndex + 1} of {displayedStages.length} {filterMode === 'mapped_only' && activeProgramme ? '(Mapped)' : ''}
          </span>

          <button
            onClick={handleNext}
            disabled={currentDisplayIndex >= displayedStages.length - 1}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Next Stage</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
