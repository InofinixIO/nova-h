import React, { useState } from 'react';
import { X, CheckCircle2, ChevronRight, ChevronLeft, BookOpen, Clock, Users, ShieldAlert, Award, FileText, Check } from 'lucide-react';
import { TOOLKIT_15_STAGES } from '../data/mockData';
import { StageItem } from '../types';

interface ToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStageIndex?: number;
  stages?: StageItem[];
}

export const ToolkitModal: React.FC<ToolkitModalProps> = ({
  isOpen,
  onClose,
  initialStageIndex = 0,
  stages
}) => {
  const stagesList = stages && stages.length > 0 ? stages : TOOLKIT_15_STAGES;
  const [activeStageIndex, setActiveStageIndex] = useState(initialStageIndex);
  const [completedItems, setCompletedItems] = useState<{ [key: string]: boolean }>({});

  if (!isOpen) return null;

  const safeIndex = activeStageIndex < stagesList.length ? activeStageIndex : 0;
  const stage: StageItem = stagesList[safeIndex];

  const toggleCheck = (itemKey: string) => {
    setCompletedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const calculateStageProgress = () => {
    const total = stage.checklist.length;
    const completed = stage.checklist.filter((_, idx) => completedItems[`${stage.stageNumber}-${idx}`]).length;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                Hospital Owners Toolkit
              </h2>
              <p className="text-xs text-slate-400">
                A 15-stage practical masterguide from concept to commissioning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-slate-800 text-xs text-blue-300 font-mono">
              Stage {stage.stageNumber} of {stagesList.length}
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
          <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200 overflow-y-auto p-3 space-y-1 shrink-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
              The {stagesList.length} Developmental Stages
            </p>
            {stagesList.map((s, idx) => (
              <button
                key={s.stageNumber}
                onClick={() => setActiveStageIndex(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                  safeIndex === idx
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                  safeIndex === idx ? 'bg-white text-blue-700 font-bold' : 'bg-slate-200 text-slate-600'
                }`}>
                  {s.stageNumber}
                </span>
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </div>

          {/* Right Main Stage View */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            
            {/* Stage Title and Meta */}
            <div className="border-b border-slate-200 pb-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase border border-blue-200">
                  Stage {stage.stageNumber}: {stage.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Timeline: {stage.typicalTimeline}</span>
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900">
                {stage.title}
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {stage.summary}
              </p>
            </div>

            {/* Checklist with Interactive Toggles */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Stage Milestone Checklist</h4>
                  <p className="text-xs text-slate-500">Check off items as your project achieves them</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-blue-700">{calculateStageProgress()}% Complete</span>
                  <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${calculateStageProgress()}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {stage.checklist.map((item, idx) => {
                  const key = `${stage.stageNumber}-${idx}`;
                  const isChecked = !!completedItems[key];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(key)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-300 text-slate-800'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className={`text-xs sm:text-sm font-medium ${isChecked ? 'line-through text-slate-500' : ''}`}>
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Deliverables & Stakeholders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Key Deliverables Required</span>
                </h5>
                <ul className="space-y-2 text-xs text-slate-600">
                  {stage.keyDeliverables.map((deliv, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                      <span>{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-3">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Key Stakeholders Involved</span>
                </h5>
                <ul className="space-y-2 text-xs text-slate-600">
                  {stage.keyStakeholders.map((person, i) => (
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
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => setActiveStageIndex((prev) => Math.max(0, prev - 1))}
            disabled={safeIndex === 0}
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Stage</span>
          </button>

          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Step {stage.stageNumber} of {stagesList.length}
          </span>

          <button
            onClick={() => setActiveStageIndex((prev) => Math.min(stagesList.length - 1, prev + 1))}
            disabled={safeIndex >= stagesList.length - 1}
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
