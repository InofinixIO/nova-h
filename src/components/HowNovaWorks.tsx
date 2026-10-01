import React from 'react';
import { FileText, Search, FileSpreadsheet, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { HOW_IT_WORKS_STEPS } from '../data/mockData';

interface HowNovaWorksProps {
  onStepAction: (stepNumber: number) => void;
  isStandalonePage?: boolean;
}

export const HowNovaWorks: React.FC<HowNovaWorksProps> = ({ onStepAction, isStandalonePage = false }) => {
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
    <section id="how-it-works-section" className={`${isStandalonePage ? 'pt-2 sm:pt-4 pb-12' : 'py-12 sm:py-16'} bg-white dark:bg-slate-900 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            Methodology & Flow
          </span>
          <SectionHeading id="how-it-works-section" className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
            How NOVA Works
          </SectionHeading>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mt-2">
            A frictionless, transparent 5-step journey to move hospital projects from inception to grand opening.
          </p>
        </div>

        {/* 5 Steps Grid with Connecting Arrows matching Wireframe Section 4 */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6 relative z-10">
            {HOW_IT_WORKS_STEPS.map((step, idx) => (
              <div 
                key={step.number}
                className="relative bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Step Number Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {step.number}
                    </span>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 transition-colors">
                      {getStepIcon(step.number)}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs font-semibold text-blue-800 dark:text-blue-400 mb-2">
                    {step.subtitle}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {step.details}
                  </p>
                </div>

                {/* Step Action Button */}
                <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-700">
                  <button
                    onClick={() => onStepAction(step.number)}
                    className="w-full text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 flex items-center justify-between group-hover:translate-x-0.5 transition-all cursor-pointer py-1"
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
        <div className="mt-12 text-center max-w-2xl mx-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm">
          <p className="font-medium">
            &ldquo;<strong>NOVA does not replace professional judgement.</strong> It makes the right ecosystem easier to access.&rdquo;
          </p>
        </div>

      </div>
    </section>
  );
};
