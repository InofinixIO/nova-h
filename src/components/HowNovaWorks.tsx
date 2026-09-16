import React from 'react';
import { FileText, Search, FileSpreadsheet, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../data/mockData';

interface HowNovaWorksProps {
  onStepAction: (stepNumber: number) => void;
}

export const HowNovaWorks: React.FC<HowNovaWorksProps> = ({ onStepAction }) => {
  const getStepIcon = (num: number) => {
    switch (num) {
      case 1:
        return <FileText className="w-6 h-6 text-blue-600" />;
      case 2:
        return <Search className="w-6 h-6 text-blue-600" />;
      case 3:
        return <FileSpreadsheet className="w-6 h-6 text-blue-600" />;
      case 4:
        return <MessageSquare className="w-6 h-6 text-blue-600" />;
      case 5:
        return <TrendingUp className="w-6 h-6 text-blue-600" />;
      default:
        return <FileText className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <section id="how-it-works-section" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Methodology & Flow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            How NOVA Works
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-2">
            A frictionless, transparent 5-step journey to move hospital projects from inception to grand opening.
          </p>
        </div>

        {/* 5 Steps Grid with Connecting Arrows matching Wireframe Section 4 */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6 relative z-10">
            {HOW_IT_WORKS_STEPS.map((step, idx) => (
              <div 
                key={step.number}
                className="relative bg-slate-50 hover:bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Step Number Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {step.number}
                    </span>
                    <div className="p-2 rounded-lg bg-white group-hover:bg-blue-50 border border-slate-200 transition-colors">
                      {getStepIcon(step.number)}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs font-semibold text-blue-800 mb-2">
                    {step.subtitle}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {step.details}
                  </p>
                </div>

                {/* Step Action Button */}
                <div className="pt-4 mt-4 border-t border-slate-200/80">
                  <button
                    onClick={() => onStepAction(step.number)}
                    className="w-full text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center justify-between group-hover:translate-x-0.5 transition-all cursor-pointer py-1"
                  >
                    <span>{step.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Closing Ecosystem Reminder from OCR */}
        <div className="mt-12 text-center max-w-2xl mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-600 text-sm">
          <p className="font-medium">
            &ldquo;<strong>NOVA does not replace professional judgement.</strong> It makes the right ecosystem easier to access.&rdquo;
          </p>
        </div>

      </div>
    </section>
  );
};
