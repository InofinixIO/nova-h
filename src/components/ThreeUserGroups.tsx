import React, { useState } from 'react';
import { Building, Cog, UserCheck, ArrowRight, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { UserRole } from '../types';
import { SectionHeading } from './SectionHeading';

interface ThreeUserGroupsProps {
  onSelectRole: (role: UserRole) => void;
  onPostRequirement: () => void;
}

export const ThreeUserGroups: React.FC<ThreeUserGroupsProps> = ({ onSelectRole, onPostRequirement }) => {
  const [expandedRole, setExpandedRole] = useState<UserRole | null>(null);

  const toggleExpand = (role: UserRole) => {
    setExpandedRole(expandedRole === role ? null : role);
  };

  return (
    <section id="three-groups" className="py-16 sm:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-3 py-1 rounded-full">
            Ecosystem Stakeholders
          </span>
          <SectionHeading id="three-groups" className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            One Network. Three Communities.
          </SectionHeading>
          <p className="text-slate-600 text-base sm:text-lg mt-2">
            Tailored journeys and dedicated workflows built specifically for healthcare creators, builders, and specialists.
          </p>
        </div>

        {/* 3 User Group Cards matching Wireframe Section 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* 1. For Owners */}
          <div 
            id="user-group-owners"
            className="bg-white rounded-2xl border border-slate-200 p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Building className="w-7 h-7" />
              </div>

              <span className="text-xs font-bold tracking-wider uppercase text-blue-600">Promoters & Operators</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-2">For Owners</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed font-medium">
                Planning, expanding or operating hospitals.
              </p>
              
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Explore resources, identify professionals, and connect with vetted vendors and advisors who can support your hospital project from inception to launch.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Access the 15-stage Hospital Owners Toolkit</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Search verified vendors and advisors by location</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Post direct project requirements freely</span>
                </div>
              </div>

              {expandedRole === 'owner' && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 text-xs text-blue-950 space-y-1 animate-fadeIn">
                  <p className="font-semibold">Supported Project Scales:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li>30 to 100 Bed Secondary Care Facilities</li>
                    <li>150 to 500+ Bed Tertiary & Multispecialty Hospitals</li>
                    <li>Single-specialty Daycare, Eye & Maternity Clinics</li>
                    <li>Hospital Renovation & OT Modernization</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
              <button
                onClick={() => onSelectRole('owner')}
                className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <span>Explore as Owner</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleExpand('owner')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-1 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>{expandedRole === 'owner' ? 'Show Less' : 'Learn More Details'}</span>
                {expandedRole === 'owner' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 2. For Vendors */}
          <div 
            id="user-group-vendors"
            className="bg-white rounded-2xl border border-slate-200 p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Cog className="w-7 h-7" />
              </div>

              <span className="text-xs font-bold tracking-wider uppercase text-indigo-600">Suppliers & Manufacturers</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-2">For Vendors</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed font-medium">
                Products & services for hospitals.
              </p>

              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Hospitals require hundreds of products and specialised services during development and operations. NOVA helps relevant businesses become discoverable.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Reach active hospital promoters and decision-makers</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Showcase products, catalogs and certified equipment</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Highlight geographic service locations</span>
                </div>
              </div>

              {expandedRole === 'vendor' && (
                <div className="mt-4 p-3 rounded-lg bg-indigo-50 text-xs text-indigo-950 space-y-1 animate-fadeIn">
                  <p className="font-semibold">Top In-Demand Categories:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li>Medical Gas Pipeline Systems (MGPS)</li>
                    <li>Modular Operating Theatres & HVAC AHUs</li>
                    <li>Radiology & Imaging (MRI, CT, Cath Lab)</li>
                    <li>Hospital Furniture, Beds & ICU Equipment</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
              <button
                onClick={() => onSelectRole('vendor')}
                className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <span>Join as Vendor</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleExpand('vendor')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-1 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>{expandedRole === 'vendor' ? 'Show Less' : 'Learn More Details'}</span>
                {expandedRole === 'vendor' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 3. For Advisors */}
          <div 
            id="user-group-advisors"
            className="bg-white rounded-2xl border border-slate-200 p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-14 h-14 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-6 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <UserCheck className="w-7 h-7" />
              </div>

              <span className="text-xs font-bold tracking-wider uppercase text-sky-600">Consultants & Experts</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-2">For Advisors</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed font-medium">
                Consultants & specialists in healthcare infrastructure.
              </p>

              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Hospital projects require specialised professional advice across multiple stages. Build your profile and make your expertise accessible.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Advise on NABH, AERB & statutory compliance</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Provide architectural and MEP engineering planning</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Collaborate with fellow domain specialists</span>
                </div>
              </div>

              {expandedRole === 'advisor' && (
                <div className="mt-4 p-3 rounded-lg bg-sky-50 text-xs text-sky-950 space-y-1 animate-fadeIn">
                  <p className="font-semibold">Specialist Disciplines Welcomed:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li>Healthcare Architects & Structural Planners</li>
                    <li>Hospital Project Management Consultants (PMC)</li>
                    <li>NABH / JCI Accreditation Assessors</li>
                    <li>Healthcare Financial Analysts & Legal Advisors</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
              <button
                onClick={() => onSelectRole('advisor')}
                className="w-full py-3 px-4 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <span>Join as Advisor</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleExpand('advisor')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-1 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>{expandedRole === 'advisor' ? 'Show Less' : 'Learn More Details'}</span>
                {expandedRole === 'advisor' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
