import React from 'react';
import { Users2, CheckCircle2, MapPin, Clock, Target, Award } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

export const WhatIsNova: React.FC = () => {
  return (
    <section id="what-is-nova" className="py-16 sm:py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Callout box matching wireframe item 2 */}
        <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50/50 dark:from-blue-950/40 dark:via-slate-900 dark:to-indigo-950/30 rounded-2xl border border-blue-200/80 dark:border-blue-800/80 p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Users2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider bg-blue-100/70 dark:bg-blue-900/60 px-2.5 py-0.5 rounded-full">
                Ecosystem Vision
              </span>
              <SectionHeading id="what-is-nova" className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                What is NOVA?
              </SectionHeading>
              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                <strong>NOVA (Network for Owners, Vendors & Advisors)</strong> is an ecosystem for hospital projects. It connects hospital owners, vendors, and advisors to collaborate, share knowledge, and build better healthcare facilities.
              </p>
            </div>
          </div>
        </div>

        {/* Narrative Section from OCR: "One Hospital Project. Many Decisions. Many Professionals." */}
        <div className="mt-14 max-w-4xl mx-auto text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            One Hospital Project. Many Decisions. Many Professionals.
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
            Building a hospital is not the work of one person or one company. A promoter may need architects, engineers, contractors, equipment suppliers, technology partners, consultants, finance professionals, statutory experts, and many other specialised service providers.
          </p>
          <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-base font-medium max-w-2xl mx-auto">
            &ldquo;The challenge is often not finding someone. It is finding the <strong className="text-blue-700 dark:text-blue-400">right professional</strong>, for the <strong className="text-blue-700 dark:text-blue-400">right requirement</strong>, at the <strong className="text-blue-700 dark:text-blue-400">right time</strong>, and in the <strong className="text-blue-700 dark:text-blue-400">right location</strong>.&rdquo;
          </div>
          <p className="text-blue-800 dark:text-blue-400 font-bold text-lg pt-1">
            That is where NOVA comes in.
          </p>
        </div>

        {/* Key Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-3 font-bold">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">Right Requirement</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Match specialized hospital needs from bunker shielding to cryogenic gas systems without trial-and-error.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mb-3 font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">Right Time</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Engage experts precisely when needed across the 15 developmental stages to prevent costly rework.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center mb-3 font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">Right Location</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Discover verified vendors and consultants with proven local municipal and regional track records.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">Right Quality</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Transparent track records, certified project deliverables, and NABH/AERB regulatory compliance.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
