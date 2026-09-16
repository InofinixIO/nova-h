import React from 'react';
import { CheckCircle2, Building, Cog, UserCheck, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

interface WhyJoinNovaProps {
  onSignUpRole: (role: UserRole) => void;
}

export const WhyJoinNova: React.FC<WhyJoinNovaProps> = ({ onSignUpRole }) => {
  return (
    <section id="why-join-nova" className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full">
            Network Value
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Why Join NOVA?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-2">
            A purpose-built collaborative ecosystem created to de-risk healthcare capital projects and accelerate infrastructure delivery.
          </p>
        </div>

        {/* 3 Columns matching Wireframe Section 7 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* 1. For Owners */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For Owners</h3>
                  <p className="text-xs text-slate-500 font-medium">Hospital Promoters & Groups</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Access trusted vendors & advisors:</strong> Pre-screened healthcare professionals with proven institutional track records.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Save time in project planning:</strong> Clear roadmaps, stage benchmarks, and direct contractor connections.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Get expert insights and resources:</strong> 15-stage toolkits, compliance checklists, and statutory guidelines.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Build better hospitals:</strong> Avoid common structural, AERB, and MEP pitfalls to deliver high-quality care.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={() => onSignUpRole('owner')}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Join as Hospital Owner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. For Vendors */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Cog className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For Vendors</h3>
                  <p className="text-xs text-slate-500 font-medium">Manufacturers & Contractors</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Reach hospital owners & decision-makers:</strong> Direct access to promoters actively investing capital into new builds.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Showcase your products and services:</strong> Feature your technical certifications, past projects, and catalogs.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Generate high-intent leads:</strong> Receive RFPs and direct inquiries matched to your product specializations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Be part of a trusted healthcare network:</strong> Differentiate your business with verified credentials and client reviews.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={() => onSignUpRole('vendor')}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Register as Vendor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. For Advisors */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For Advisors</h3>
                  <p className="text-xs text-slate-500 font-medium">Consultants & Specialists</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Connect with hospital projects:</strong> Discover ongoing and upcoming developments seeking specialized expertise.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Share your domain expertise:</strong> Publish guides, write case studies, and establish recognized thought leadership.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Collaborate with industry stakeholders:</strong> Form joint consortia with architects, engineers, and financial advisors.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Grow your consulting practice:</strong> Expand your client reach beyond your local city across nationwide health systems.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={() => onSignUpRole('advisor')}
                className="w-full py-2.5 px-4 rounded-lg bg-sky-50 hover:bg-sky-700 text-sky-800 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Join as Advisor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
