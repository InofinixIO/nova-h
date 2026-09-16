import React, { useState } from 'react';
import { X, Send, CheckCircle, Building, MapPin, Layers, Phone, Mail, User } from 'lucide-react';
import { ProjectRequirement } from '../types';

interface RequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (req: ProjectRequirement) => void;
}

export const RequirementModal: React.FC<RequirementModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [formData, setFormData] = useState({
    hospitalName: '',
    location: 'Mumbai',
    bedCapacity: '100 - 250 Beds',
    stage: 'Planning & Feasibility',
    categoryNeeded: 'Hospital Consulting',
    description: '',
    contactPerson: '',
    email: '',
    phone: '',
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: ProjectRequirement = {
      id: `REQ-${Date.now()}`,
      hospitalName: formData.hospitalName || 'Upcoming Hospital Project',
      location: formData.location,
      bedCapacity: formData.bedCapacity,
      stage: formData.stage,
      categoryNeeded: formData.categoryNeeded,
      description: formData.description,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      createdAt: new Date().toLocaleDateString(),
    };

    setSubmitted(true);
    setTimeout(() => {
      onSubmitSuccess(newReq);
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Requirement Received!</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Your hospital requirement has been securely logged. Relevant verified vendors and advisors will be notified.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-bold tracking-wider uppercase text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                Step 1: Tell Us What You Need
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                Share Hospital Project Requirement
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Help verified advisors and suppliers understand your specifications.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Proposed Hospital Name / Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Multispecialty Hospital"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Hospital Location
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white font-medium"
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Pune">Pune</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Other">Other Region in India</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Planned Bed Capacity
                  </label>
                  <select
                    value={formData.bedCapacity}
                    onChange={(e) => setFormData({ ...formData, bedCapacity: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white font-medium"
                  >
                    <option value="Up to 50 Beds">Up to 50 Beds (Daycare / Nursing Home)</option>
                    <option value="50 - 100 Beds">50 - 100 Beds (Secondary Care)</option>
                    <option value="100 - 250 Beds">100 - 250 Beds (Tertiary Care)</option>
                    <option value="250 - 500+ Beds">250 - 500+ Beds (Quaternary / Super-specialty)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Current Project Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white font-medium"
                  >
                    <option value="Planning & Feasibility">Stage 1 - 2: Concept & Land Feasibility</option>
                    <option value="Design & Architecture">Stage 3 - 4: Architecture & Clearances</option>
                    <option value="Civil Construction & MEP">Stage 6 - 8: Civil & MEP / MGPS</option>
                    <option value="Equipment Procurement">Stage 9 - 10: OT & Equipment Sourcing</option>
                    <option value="Commissioning & Pre-op">Stage 11 - 14: IT, HR & Testing</option>
                    <option value="Operational Expansion">Stage 15: Expansion / Accreditation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category of Partner Needed
                  </label>
                  <select
                    value={formData.categoryNeeded}
                    onChange={(e) => setFormData({ ...formData, categoryNeeded: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white font-medium"
                  >
                    <option value="Hospital Consulting">Hospital Feasibility / Project Advisor</option>
                    <option value="Architecture & Design">Healthcare Architect / Master Planner</option>
                    <option value="MEP & HVAC">Medical Gas (MGPS) & Cleanroom HVAC</option>
                    <option value="Medical Equipment & Devices">Diagnostic Equipment (MRI/CT/OT)</option>
                    <option value="Healthcare IT & HIS">Hospital Information System (HIS/PACS)</option>
                    <option value="Accreditation & Quality / NABH">NABH / JCI Accreditation Consultant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Brief Project Scope / Specific Requirements
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your requirement (e.g., Looking for turn-key MGPS installer with HTM-0201 compliance for 120-bed hospital...)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Rajesh / Promoter"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="promoter@hospital.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Requirement</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
