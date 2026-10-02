import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Check, 
  SlidersHorizontal,
  Info,
  Calendar,
  Building2
} from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { TOOLKIT_15_STAGES } from '../data/mockData';
import { StageItem, AuthUser, AccreditationProgramme, UserRole } from '../types';
import { getStoredAccreditationProgrammes, getAccreditationProgrammeById } from '../utils/accreditationStorage';
import { registerOrUpdateUser } from '../utils/userManagement';

interface HospitalToolkitProps {
  onOpenFullToolkit: (stageIndex?: number, programmeId?: string) => void;
  stages?: StageItem[];
  isStandalonePage?: boolean;
  currentUser?: AuthUser | null;
  onUpdateUser?: (user: AuthUser) => void;
  onOpenAuth?: (mode?: 'signin' | 'signup', role?: UserRole) => void;
}

export const HospitalToolkit: React.FC<HospitalToolkitProps> = ({ 
  onOpenFullToolkit, 
  stages,
  isStandalonePage = false,
  currentUser,
  onUpdateUser,
  onOpenAuth
}) => {
  const fullStagesList = stages && stages.length > 0 ? stages : TOOLKIT_15_STAGES;

  // Accreditation programmes management
  const [programmes, setProgrammes] = useState<AccreditationProgramme[]>(() => getStoredAccreditationProgrammes());
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>(() => {
    return currentUser?.enrolledAccreditationId || '';
  });

  // Filter mode: 'mapped_only' or 'full_roadmap'
  // If user has an accreditation programme selected, default to 'mapped_only'
  const [filterMode, setFilterMode] = useState<'mapped_only' | 'full_roadmap'>(() => {
    return currentUser?.enrolledAccreditationId ? 'mapped_only' : 'mapped_only';
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  // Sync when currentUser changes
  useEffect(() => {
    if (currentUser?.enrolledAccreditationId) {
      setSelectedProgrammeId(currentUser.enrolledAccreditationId);
    }
  }, [currentUser?.enrolledAccreditationId]);

  // Sync accreditation programmes from localStorage events
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<AccreditationProgramme[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setProgrammes(customEvent.detail);
      } else {
        setProgrammes(getStoredAccreditationProgrammes());
      }
    };
    window.addEventListener('nova_accreditation_updated', handleSync);
    return () => window.removeEventListener('nova_accreditation_updated', handleSync);
  }, []);

  const activeProgramme: AccreditationProgramme | undefined = selectedProgrammeId
    ? programmes.find(p => p.id === selectedProgrammeId || p.code === selectedProgrammeId)
    : undefined;

  // Calculate the active stages list based on filter mode
  const displayedStages = React.useMemo(() => {
    if (!activeProgramme || filterMode === 'full_roadmap') {
      return fullStagesList;
    }
    // Filter to only mapped stages
    const mapped = fullStagesList.filter(s => activeProgramme.applicableStageNumbers.includes(s.stageNumber));
    return mapped.length > 0 ? mapped : fullStagesList;
  }, [activeProgramme, filterMode, fullStagesList]);

  // Ensure current slide doesn't overflow bounds
  const safeSlideIndex = currentSlide < displayedStages.length ? currentSlide : 0;
  const activeStage = displayedStages[safeSlideIndex] || fullStagesList[0];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % displayedStages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + displayedStages.length) % displayedStages.length);
  };

  // Helper to check if a stage is mapped in the active programme
  const isStageMapped = (stageNum: number) => {
    if (!activeProgramme) return true;
    return activeProgramme.applicableStageNumbers.includes(stageNum);
  };

  // Enrol current user into the selected programme
  const handleEnrolCurrentProgramme = () => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('signup', 'owner');
      return;
    }
    if (!activeProgramme) return;

    const updatedUser: AuthUser = {
      ...currentUser,
      enrolledAccreditationId: activeProgramme.id,
      enrolledAccreditationDate: new Date().toISOString()
    };

    try {
      localStorage.setItem('nova_h_current_user', JSON.stringify(updatedUser));
    } catch (e) {}

    registerOrUpdateUser(updatedUser);

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
  };

  return (
    <section className={isStandalonePage ? "pt-2 sm:pt-4 pb-12 bg-transparent" : "py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800 transition-colors duration-200"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className={`text-center max-w-3xl mx-auto ${isStandalonePage ? 'mb-5 sm:mb-6' : 'mb-8 sm:mb-10'}`}>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-950/60 px-3 py-1 rounded-full">
              Essential Founder Resource
            </span>
            {activeProgramme && (
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-3 py-1 rounded-full flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>{activeProgramme.name.split('(')[0].trim()}</span>
              </span>
            )}
          </div>

          <SectionHeading id="toolkit-section" className={`${isStandalonePage ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-3xl sm:text-4xl'} font-extrabold text-slate-900 dark:text-white tracking-tight`}>
            Hospital Owner's Toolkit
          </SectionHeading>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-2xl mx-auto">
            A comprehensive hospital development journey from concept to commissioning. Tailored for NABH, JCI, and NABL accreditation roadmaps.
          </p>
        </div>

        {/* ACCREDITATION PROGRAMME FILTER & CUSTOMIZATION BANNER */}
        <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Programme selector and status */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Accreditation Roadmap:
                  </span>
                  {currentUser?.enrolledAccreditationId === selectedProgrammeId && activeProgramme && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Enrolled Facility
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <select
                    id="toolkit-programme-selector"
                    value={selectedProgrammeId}
                    onChange={(e) => {
                      setSelectedProgrammeId(e.target.value);
                      setCurrentSlide(0);
                    }}
                    className="text-xs sm:text-sm font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-full sm:max-w-xs"
                  >
                    <option value="">Full 15-Stage General Development Roadmap</option>
                    {programmes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.applicableStageNumbers.length} mapped stages)
                      </option>
                    ))}
                  </select>

                  {/* 1-click Enrolment Button if not enrolled in this programme */}
                  {activeProgramme && currentUser?.enrolledAccreditationId !== activeProgramme.id && (
                    <button
                      type="button"
                      onClick={handleEnrolCurrentProgramme}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      title={currentUser ? "Enrol your hospital facility in this programme" : "Sign in / Sign up to enrol"}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{currentUser ? 'Enrol in Programme' : 'Sign In to Enrol'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Stage Filtering Toggle (Mapped Only vs Full Roadmap) */}
            {activeProgramme ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:justify-end">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  View Mode:
                </span>
                <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterMode('mapped_only');
                      setCurrentSlide(0);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      filterMode === 'mapped_only'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Programme Stages ({activeProgramme.applicableStageNumbers.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterMode('full_roadmap');
                      setCurrentSlide(0);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      filterMode === 'full_roadmap'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Full Roadmap (15)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Select an accreditation programme above to isolate required stages &amp; statutory audits.</span>
              </div>
            )}

          </div>

          {/* Quick Info bar for active programme */}
          {activeProgramme && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs">
                <span>🏛️ Authority: <strong className="text-slate-800 dark:text-slate-200">{activeProgramme.authority}</strong></span>
                <span>⏱️ Est. Timeline: <strong className="text-slate-800 dark:text-slate-200">{activeProgramme.estimatedDuration}</strong></span>
                <span>🏥 Scope: <strong className="text-slate-800 dark:text-slate-200">{activeProgramme.targetBedCapacity}</strong></span>
              </div>
              <div className="text-[11px] font-medium text-blue-700 dark:text-blue-400">
                {filterMode === 'mapped_only'
                  ? `Filtering to ${displayedStages.length} critical accreditation stages`
                  : `Showing all 15 stages with ${activeProgramme.applicableStageNumbers.length} highlighted accreditation milestones`}
              </div>
            </div>
          )}
        </div>

        {/* Quick Stage Pills */}
        <div className="mb-6 sm:mb-8 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {activeProgramme && filterMode === 'mapped_only' 
                ? `${displayedStages.length} Mapped Stages for ${activeProgramme.name.split('(')[0]}:` 
                : `${displayedStages.length} Project Development Stages:`}
            </span>
            <span className="text-slate-400 dark:text-slate-500">Click to preview stage</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {displayedStages.map((s, idx) => {
              const isSelected = safeSlideIndex === idx;
              const mapped = isStageMapped(s.stageNumber);
              return (
                <button
                  key={s.stageNumber}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : mapped
                        ? 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700'
                        : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border border-transparent'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
                    isSelected 
                      ? 'bg-white/20 text-white' 
                      : mapped 
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {s.stageNumber}
                  </span>
                  <span className="max-w-[110px] truncate">{s.title.split(':')[0] || s.title}</span>
                  {activeProgramme && mapped && filterMode === 'full_roadmap' && (
                    <Award className={`w-3 h-3 ${isSelected ? 'text-amber-300' : 'text-blue-500'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Wireframe Section: Left Canva Embed + Right Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Canva Book Embed (Interactive Simulation) */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800 text-white relative">
              
              {/* Canva Reader Top Bar */}
              <div className="bg-slate-950 px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 shrink-0"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shrink-0"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shrink-0"></span>
                  <span className="ml-1.5 font-mono text-[10px] sm:text-[11px] text-slate-400 truncate">
                    Canva Interactive Reader: Owners Toolkit
                    {activeProgramme ? ` • ${activeProgramme.code.toUpperCase()}` : ''}
                  </span>
                </div>
                <div className="text-slate-400 font-medium whitespace-nowrap text-[11px] sm:text-xs shrink-0 flex items-center gap-1.5">
                  <span>Stage {activeStage?.stageNumber || safeSlideIndex + 1}</span>
                  <span className="text-slate-600">/</span>
                  <span>{displayedStages.length} {filterMode === 'mapped_only' && activeProgramme ? 'Mapped' : 'Stages'}</span>
                </div>
              </div>

              {/* Book Stage Slide Content */}
              <div className="p-6 sm:p-8 min-h-[360px] flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 font-bold text-xs uppercase tracking-wider border border-blue-400/30">
                        Stage {activeStage.stageNumber} • {activeStage.category}
                      </span>
                      {activeProgramme && isStageMapped(activeStage.stageNumber) && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>{activeProgramme.code.toUpperCase()} Milestone</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full font-mono">
                      ⏱ {activeStage.typicalTimeline}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-2 mb-3">
                    {activeStage.title}
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {activeStage.summary}
                  </p>

                  {/* Special Accreditation Note if configured for this stage */}
                  {activeProgramme && activeProgramme.stageNotes && activeProgramme.stageNotes[activeStage.stageNumber] && (
                    <div className="mb-4 bg-blue-950/80 border border-blue-700/60 rounded-xl p-3 text-xs text-blue-200 space-y-1 animate-fadeIn">
                      <div className="flex items-center gap-1.5 font-bold text-blue-300 text-[11px] uppercase tracking-wider">
                        <Award className="w-3.5 h-3.5 text-blue-400" />
                        <span>{activeProgramme.name.split('(')[0].trim()} Audit Specifics</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-blue-100">
                        {activeProgramme.stageNotes[activeStage.stageNumber]}
                      </p>
                    </div>
                  )}

                  <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-2">
                    <p className="text-xs font-bold text-blue-300 uppercase tracking-wide">
                      Critical Stage Checklist:
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-200">
                      {activeStage.checklist.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Reader Controls: Prev / Next / Dots */}
                <div className="pt-6 mt-4 border-t border-slate-700/60 flex items-center justify-between">
                  <button
                    onClick={prevSlide}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
                    aria-label="Previous stage"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Prev Stage</span>
                  </button>

                  {/* Stage indicator dots */}
                  <div className="flex items-center gap-1 max-w-[140px] sm:max-w-none overflow-x-auto scrollbar-none px-1 py-1">
                    {displayedStages.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          safeSlideIndex === idx ? 'w-5 bg-blue-500' : 'w-1.5 sm:w-2 bg-slate-700 hover:bg-slate-500'
                        }`}
                        title={`Stage ${s.stageNumber}: ${s.title}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextSlide}
                    className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
                    aria-label="Next stage"
                  >
                    <span className="hidden sm:inline">Next Stage</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Bottom bar with quick modal launch */}
              <div className="bg-slate-950/90 px-3 sm:px-4 py-2.5 sm:py-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs text-center sm:text-left">
                <span className="text-slate-400 text-[11px] sm:text-xs">
                  {activeProgramme ? `Mapped to ${activeProgramme.name.split('(')[0]}` : 'Interactive hospital promoter curriculum'}
                </span>
                <button
                  onClick={() => onOpenFullToolkit(activeStage.stageNumber - 1, activeProgramme?.id)}
                  className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline flex items-center gap-1 text-[11px] sm:text-xs"
                >
                  Expand Full Guide &amp; Checklist
                </button>
              </div>

            </div>
          </div>

          {/* Right: Text & Action Button matching wireframe */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 tracking-wider uppercase bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                Founders Field Guide
              </span>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
                Hospital Owners Toolkit
              </h3>
              <p className="text-base text-slate-700 dark:text-slate-300 font-medium mt-2">
                {activeProgramme 
                  ? `Customized development track for ${activeProgramme.name}.`
                  : 'A quick guide to the 15 stages of hospital development.'}
              </p>
            </div>

            {/* Bullet points matching wireframe */}
            <ul className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <span>
                  <strong>Accreditation-aligned roadmap:</strong> Seamlessly filter between statutory requirements, civil execution, and NABH/JCI clinical protocols.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <span>
                  <strong>Practical insights and checklists:</strong> Essential statutory milestones, area norms, and vendor evaluation questions for hospital promoters.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <span>
                  <strong>Single facility enrolment:</strong> Hospital founders can enrol their project at registration or anytime, adapting stages to their exact clinical scope.
                </span>
              </li>
            </ul>

            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-bold text-blue-900 dark:text-blue-200">Understand the journey before you begin it.</p>
              <p>Knowing what comes next saves months of civil rework, prevents equipment mismatch, and protects project capital.</p>
            </div>

            {/* Action button matching wireframe */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                id="read-toolkit-btn"
                onClick={() => onOpenFullToolkit(activeStage.stageNumber - 1, activeProgramme?.id)}
                className="px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Read Full Toolkit</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {activeProgramme && currentUser?.enrolledAccreditationId !== activeProgramme.id && (
                <button
                  type="button"
                  onClick={handleEnrolCurrentProgramme}
                  className="px-5 py-3.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Enrol Facility</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
