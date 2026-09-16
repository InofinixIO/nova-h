import React from 'react';
import { Building2, Users2, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

interface FinalCTAProps {
  onCreateOwner: () => void;
  onJoinVendorAdvisor: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onCreateOwner, onJoinVendorAdvisor }) => {
  return (
    <section id="final-cta" className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dual Cards matching Wireframe Section 9 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Are You Building a Hospital? */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  For Hospital Promoters
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Are You Building a Hospital?
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  You don&apos;t have to know everything. But you should know <strong>who to ask</strong>. Create your owner account and get started today.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                id="create-owner-account-btn"
                onClick={onCreateOwner}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create Owner Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Do You Serve Hospitals? */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Users2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  Vendors & Advisors
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Do You Serve Hospitals?
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  If your product, service or expertise can contribute to hospital development or operations, join as a vendor or advisor and be part of NOVA.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                id="join-vendor-advisor-btn"
                onClick={onJoinVendorAdvisor}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Join as Vendor / Advisor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
