import React, { useState } from 'react';
import { FileCheck, Wrench, Lightbulb, Cpu, BookOpen, Sparkles, ArrowRight, X, CheckCircle, Bot } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { FUTURE_FEATURES } from '../data/mockData';

interface FutureFeaturesProps {
  onOpenAiConsultant: () => void;
}

export const FutureFeatures: React.FC<FutureFeaturesProps> = ({ onOpenAiConsultant }) => {
  const [selectedFeature, setSelectedFeature] = useState<typeof FUTURE_FEATURES[0] | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileCheck':
        return <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      case 'Wrench':
        return <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      case 'Lightbulb':
        return <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <section id="future-features" className="py-16 sm:py-24 bg-white dark:bg-slate-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching wireframe Section 8 */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            Roadmap & Digital Ecosystem
          </span>
          <SectionHeading id="future-features" className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
            Coming to NOVA
          </SectionHeading>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mt-2">
            NOVA is developing a comprehensive digital operating system for hospital promoters, vendors, and advisors.
          </p>
          <div className="mt-4 inline-block px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
            Our objective is simple: <strong>Make professional hospital-project knowledge and expertise easier to access.</strong>
          </div>
        </div>

        {/* 5 Feature Cards matching Wireframe Section 8 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {FUTURE_FEATURES.map((feature) => (
            <div
              key={feature.id}
              onClick={() => {
                if (feature.id === 'feat-4') {
                  onOpenAiConsultant();
                } else {
                  setSelectedFeature(feature);
                }
              }}
              className={`rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between group ${
                feature.id === 'feat-4'
                  ? 'bg-gradient-to-b from-blue-50/70 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/30 border-blue-300 dark:border-blue-700 ring-2 ring-blue-200/50 dark:ring-blue-900/40 hover:shadow-lg'
                  : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 shadow-2xs border border-slate-200 dark:border-slate-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getIcon(feature.icon)}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    feature.id === 'feat-4'
                      ? 'bg-blue-600 text-white animate-pulse'
                      : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {feature.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors mb-1.5">
                  {feature.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {feature.subtitle}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-700">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 group-hover:text-blue-900 dark:group-hover:text-blue-300 flex items-center justify-between">
                  <span>{feature.id === 'feat-4' ? 'Launch AI Demo' : 'Preview Details'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Detail Modal */}
        {selectedFeature && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
              <button
                onClick={() => setSelectedFeature(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                  {getIcon(selectedFeature.icon)}
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                    {selectedFeature.tag}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{selectedFeature.title}</h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
                {selectedFeature.description}
              </p>

              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mb-6 space-y-2">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">What’s Included:</p>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {selectedFeature.details.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedFeature(null);
                    onOpenAiConsultant();
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
                >
                  Explore AI Consulting
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
