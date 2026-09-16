import React, { useState } from 'react';
import { BookOpen, CheckCircle, ChevronLeft, ChevronRight, Sparkles, Layers, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { TOOLKIT_15_STAGES } from '../data/mockData';

interface HospitalToolkitProps {
  onOpenFullToolkit: (stageIndex?: number) => void;
}

export const HospitalToolkit: React.FC<HospitalToolkitProps> = ({ onOpenFullToolkit }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % TOOLKIT_15_STAGES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + TOOLKIT_15_STAGES.length) % TOOLKIT_15_STAGES.length);
  };

  const activeStage = TOOLKIT_15_STAGES[currentSlide];

  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full">
            Essential Founder Resource
          </span>
          <SectionHeading id="toolkit-section" className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Hospital Owner's Toolkit
          </SectionHeading>
          <p className="text-slate-600 text-base sm:text-lg mt-2">
            Start with the Hospital Owners Toolkit. Understand the complete hospital development journey before searching for vendors.
          </p>
        </div>

        {/* Wireframe Section 5 Grid: Left Canva Embed + Right Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Canva Book Embed (Interactive Simulation) */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800 text-white relative">
              
              {/* Canva Reader Top Bar */}
              <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                  <span className="ml-2 font-mono text-[11px] text-slate-400">Canva Interactive Reader: Hospital Owners Toolkit</span>
                </div>
                <div className="text-slate-400 font-medium">
                  Stage {activeStage.stageNumber} of 15
                </div>
              </div>

              {/* Book Stage Slide Content */}
              <div className="p-6 sm:p-8 min-h-[360px] flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 font-bold text-xs uppercase tracking-wider border border-blue-400/30">
                      Stage {activeStage.stageNumber} • {activeStage.category}
                    </span>
                    <span className="text-xs text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full font-mono">
                      ⏱ {activeStage.typicalTimeline}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-2 mb-3">
                    {activeStage.title}
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed mb-5">
                    {activeStage.summary}
                  </p>

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

                  {/* Stage indicator dots (previewing stages) */}
                  <div className="flex items-center gap-1.5">
                    {TOOLKIT_15_STAGES.slice(0, 8).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          currentSlide === idx ? 'w-6 bg-blue-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                        }`}
                        title={`Stage ${idx + 1}`}
                      />
                    ))}
                    <span className="text-[10px] text-slate-400 ml-1">...+7 more</span>
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
              <div className="bg-slate-950/90 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Interactive hospital promoter curriculum</span>
                <button
                  onClick={() => onOpenFullToolkit(currentSlide)}
                  className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline flex items-center gap-1"
                >
                  Expand Full Guide & Checklist
                </button>
              </div>

            </div>
          </div>

          {/* Right: Text & Action Button matching wireframe */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold text-blue-700 tracking-wider uppercase bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Founders Field Guide
              </span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                Hospital Owners Toolkit
              </h3>
              <p className="text-base text-slate-700 font-medium mt-2">
                A quick guide to the 15 stages of hospital development.
              </p>
            </div>

            {/* Bullet points matching wireframe */}
            <ul className="space-y-3 text-slate-700 text-sm">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <span>
                  <strong>From concept to commissioning:</strong> Complete roadmap from initial land zoning to NABH commercial launch.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <span>
                  <strong>Practical insights and checklists:</strong> Essential statutory milestones, area norms, and vendor evaluation questions.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <span>
                  <strong>Built for hospital owners:</strong> Written in simple, non-jargon language designed to be understood in less than an hour.
                </span>
              </li>
            </ul>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-blue-900">Understand the journey before you begin it.</p>
              <p>Knowing what comes next saves months of civil rework, prevents equipment mismatch, and protects project capital.</p>
            </div>

            {/* Action button matching wireframe */}
            <div className="pt-2">
              <button
                id="read-toolkit-btn"
                onClick={() => onOpenFullToolkit(0)}
                className="px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Read the Toolkit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
