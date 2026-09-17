import React, { useState } from 'react';
import { Building2, HardHat, UserCheck, ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

interface HeroSectionProps {
  onExplore: () => void;
  onSignUp: (role?: UserRole) => void;
  onSelectRole: (role: UserRole) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore, onSignUp, onSelectRole }) => {
  const [activeNode, setActiveNode] = useState<'owner' | 'vendor' | 'advisor'>('owner');

  return (
    <section id="hero-section" className="relative pt-8 sm:pt-12 md:pt-16 pb-14 md:pb-20 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      {/* Subtle grid background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading & Content matching wireframe */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Network for Owners, Vendors & Advisors</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Where Hospital Projects <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900">
                Find the Right People
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
              NOVA is a trusted platform that connects hospital owners, vendors, and advisors to turn healthcare projects into reality.
            </p>

            {/* CTAs matching wireframe */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-explore-btn"
                onClick={onExplore}
                className="px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore NOVA</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-signup-btn"
                onClick={() => onSignUp()}
                className="px-6 py-3.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-base hover:border-slate-400 transition-all cursor-pointer shadow-2xs"
              >
                Sign Up
              </button>
            </div>

            {/* Sub-tagline equation from wireframe */}
            <div className="pt-4 flex items-center gap-2 text-sm sm:text-base font-bold text-slate-800">
              <span className="px-3 py-1 rounded-md bg-slate-100 text-blue-900 border border-slate-200">
                Owners + Vendors + Advisors = NOVA
              </span>
            </div>

            {/* Trust highlights */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/80">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">15</p>
                <p className="text-xs text-slate-500 font-medium">Standardized Stages</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">100%</p>
                <p className="text-xs text-slate-500 font-medium">Healthcare Focused</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">Free</p>
                <p className="text-xs text-slate-500 font-medium">Public Directory</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Diagram matching wireframe */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 relative">
              
              {/* Header inside diagram card */}
              <div className="text-center mb-6">
                <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-full">
                  The Hospital Project Ecosystem
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Integrated Collaboration
                </h3>
              </div>

              {/* Triangle / Orbit visualization of the 3 user groups */}
              <div className="relative py-6 flex flex-col items-center">
                {/* SVG connection lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-200" style={{ zIndex: 0 }}>
                  <line x1="50%" y1="20%" x2="25%" y2="78%" strokeWidth="2" strokeDasharray="4 4" className="stroke-blue-300" />
                  <line x1="50%" y1="20%" x2="75%" y2="78%" strokeWidth="2" strokeDasharray="4 4" className="stroke-indigo-300" />
                  <line x1="25%" y1="78%" x2="75%" y2="78%" strokeWidth="2" strokeDasharray="4 4" className="stroke-sky-300" />
                </svg>

                {/* Top Node: Hospital Owner */}
                <div 
                  onClick={() => { setActiveNode('owner'); onSelectRole('owner'); }}
                  className={`relative z-10 flex flex-col items-center cursor-pointer transition-all ${
                    activeNode === 'owner' ? 'scale-105' : 'opacity-85 hover:opacity-100'
                  }`}
                  id="diagram-node-owner"
                >
                  <div className={`w-18 h-18 rounded-2xl flex items-center justify-center shadow-md transition-all ${
                    activeNode === 'owner'
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-blue-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}>
                    <Building2 className="w-9 h-9" />
                  </div>
                  <span className="font-bold text-sm text-slate-900 mt-2">Hospital Owner</span>
                  <span className="text-[11px] text-slate-500 font-medium">Vision & Capital</span>
                </div>

                {/* Bottom Row: Vendors & Advisors */}
                <div className="w-full flex items-center justify-between mt-12 px-2 relative z-10">
                  {/* Left: Vendors */}
                  <div 
                    onClick={() => { setActiveNode('vendor'); onSelectRole('vendor'); }}
                    className={`flex flex-col items-center cursor-pointer transition-all ${
                      activeNode === 'vendor' ? 'scale-105' : 'opacity-85 hover:opacity-100'
                    }`}
                    id="diagram-node-vendor"
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-all ${
                      activeNode === 'vendor'
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-indigo-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}>
                      <HardHat className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-sm text-slate-900 mt-2">Vendors</span>
                    <span className="text-[11px] text-slate-500 font-medium">Products & Services</span>
                  </div>

                  {/* Center badge in the middle of triangle */}
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
                    +
                  </div>

                  {/* Right: Advisors */}
                  <div 
                    onClick={() => { setActiveNode('advisor'); onSelectRole('advisor'); }}
                    className={`flex flex-col items-center cursor-pointer transition-all ${
                      activeNode === 'advisor' ? 'scale-105' : 'opacity-85 hover:opacity-100'
                    }`}
                    id="diagram-node-advisor"
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-all ${
                      activeNode === 'advisor'
                        ? 'bg-sky-600 text-white ring-4 ring-sky-100 shadow-sky-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}>
                      <UserCheck className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-sm text-slate-900 mt-2">Advisors</span>
                    <span className="text-[11px] text-slate-500 font-medium">Consultants & Specialists</span>
                  </div>
                </div>
              </div>

              {/* Dynamic node insight pill */}
              <div className="mt-6 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 text-center">
                {activeNode === 'owner' && (
                  <span><strong>Owners:</strong> Access verified suppliers, specialized architects, and stage-by-stage toolkits.</span>
                )}
                {activeNode === 'vendor' && (
                  <span><strong>Vendors:</strong> Present healthcare products, OT equipment, and MEP capabilities to active builders.</span>
                )}
                {activeNode === 'advisor' && (
                  <span><strong>Advisors:</strong> Provide expertise in hospital planning, AERB radiation layout, and NABH accreditation.</span>
                )}
              </div>

              {/* Bottom Tagline from wireframe */}
              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <span className="text-sm font-bold text-blue-900 tracking-tight">
                  Better Hospitals, Brighter Tomorrows
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
