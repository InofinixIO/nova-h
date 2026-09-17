import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Calendar, 
  EyeOff, 
  Share2, 
  Plus, 
  Trash2, 
  Sliders,
  Send,
  Upload,
  AlertCircle
} from 'lucide-react';
import { 
  RFPItem, 
  RFPRequirementItem, 
  RFPPublishMode, 
  IdentityDisclosureMode, 
  AuthUser 
} from '../../types';

interface RfpCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newRfp: RFPItem) => void;
  currentUser?: AuthUser | null;
}

const PRESET_CATEGORIES = [
  'Biomedical Equipment',
  'Engineering / MEP',
  'Modular OT & CSSD',
  'IT / Software / HIS',
  'Hospital Furniture',
  'Facility Services',
  'Consultancy / Turnkey'
];

export const RfpCreateModal: React.FC<RfpCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentUser
}) => {
  const [step, setStep] = useState<'category' | 'questionnaire' | 'draft_review' | 'publish_config'>('category');

  // Form Fields
  const [category, setCategory] = useState('Biomedical Equipment');
  const [title, setTitle] = useState('');
  const [hospitalName, setHospitalName] = useState(currentUser?.company || 'City Memorial Healthcare');
  const [locationCity, setLocationCity] = useState('Bengaluru');
  const [locationState, setLocationState] = useState('Karnataka');
  const [bedCapacity, setBedCapacity] = useState('100 Beds');
  
  // AI Questionnaire Fields
  const [techExpectation, setTechExpectation] = useState('High-throughput digital diagnostic unit with 3-year warranty and 98% uptime guarantee');
  const [budgetRange, setBudgetRange] = useState('₹1.20 Cr - ₹1.60 Cr');
  const [deliveryWeeks, setDeliveryWeeks] = useState('6-8 Weeks');
  const [warrantyExpectation, setWarrantyExpectation] = useState('2 Years Comprehensive + 5 Years CMC Pricing');
  const [complianceNeeds, setComplianceNeeds] = useState('AERB Approval / CE / ISO 13485 certification mandatory');
  const [summary, setSummary] = useState('');
  const [scopeOfWork, setScopeOfWork] = useState<string[]>([
    'Supply, transport, uncrating, safe rigging and site positioning.',
    'Civil/MEP readiness validation and turnkey installation.',
    'Initial clinical staff training and calibration sign-off.'
  ]);
  const [newScopeItem, setNewScopeItem] = useState('');

  // Requirement lines
  const [requirements, setRequirements] = useState<RFPRequirementItem[]>([
    {
      id: 'req-01',
      category: 'Primary Specification',
      parameter: 'Core System Capacity / Throughput',
      hospitalSpecification: 'Standard high-performance specification matching clinical workload',
      isMandatory: true
    },
    {
      id: 'req-02',
      category: 'Warranty & Service',
      parameter: 'Comprehensive Warranty Period',
      hospitalSpecification: 'Minimum 2 Years Comprehensive Warranty with 98% uptime commitment',
      isMandatory: true
    }
  ]);
  const [newReqParam, setNewReqParam] = useState('');
  const [newReqSpec, setNewReqSpec] = useState('');
  const [newReqMandatory, setNewReqMandatory] = useState(true);

  // Publishing & Identity Settings
  const [publishingModes, setPublishingModes] = useState<RFPPublishMode[]>([
    'selected_invite',
    'marketplace',
    'public_web',
    'offline_export'
  ]);
  const [isIdentityMasked, setIsIdentityMasked] = useState(true);
  const [identityDisclosure, setIdentityDisclosure] = useState<IdentityDisclosureMode>('on_shortlist');
  const [quoteClosingDays, setQuoteClosingDays] = useState(21);
  const [assignedAdvisor, setAssignedAdvisor] = useState(true);

  if (!isOpen) return null;

  const handleApplyAiGeneration = () => {
    // Generate draft using intelligent presets based on chosen category and input
    const generatedTitle = title.trim() || `${category} Procurement & Turnkey Package - ${bedCapacity}`;
    setTitle(generatedTitle);
    
    const generatedSummary = `Turnkey procurement of ${category} for ${bedCapacity} hospital in ${locationCity}. System must satisfy ${complianceNeeds}. Scope includes supply, installation, commissioning, ${warrantyExpectation}, and delivery within ${deliveryWeeks}.`;
    setSummary(generatedSummary);

    // Populate category-specific requirements
    if (category === 'Biomedical Equipment') {
      setRequirements([
        {
          id: `req-${Date.now()}-1`,
          category: 'Core Performance',
          parameter: 'Equipment Model & Output Capacity',
          hospitalSpecification: techExpectation,
          isMandatory: true
        },
        {
          id: `req-${Date.now()}-2`,
          category: 'Certifications',
          parameter: 'Statutory & Regulatory Approvals',
          hospitalSpecification: complianceNeeds,
          isMandatory: true
        },
        {
          id: `req-${Date.now()}-3`,
          category: 'Warranty & SLA',
          parameter: 'Warranty & Comprehensive Maintenance (CMC)',
          hospitalSpecification: warrantyExpectation,
          isMandatory: true
        },
        {
          id: `req-${Date.now()}-4`,
          category: 'Logistics',
          parameter: 'Delivery, Rigging & Commissioning',
          hospitalSpecification: `Maximum ${deliveryWeeks} to site`,
          isMandatory: false
        }
      ]);
    } else if (category === 'Engineering / MEP') {
      setRequirements([
        {
          id: `req-${Date.now()}-1`,
          category: 'Technical Standard',
          parameter: 'Design Standard & Code Compliance',
          hospitalSpecification: 'HTM 02-01 / NFPA 99 / NBC 2016 standard compliance',
          isMandatory: true
        },
        {
          id: `req-${Date.now()}-2`,
          category: 'Capacity',
          parameter: 'Plant Sizing & Redundancy',
          hospitalSpecification: `Sized for ${bedCapacity} with N+1 duplex redundancy`,
          isMandatory: true
        }
      ]);
    }
    setStep('draft_review');
  };

  const handleTogglePublishMode = (mode: RFPPublishMode) => {
    if (publishingModes.includes(mode)) {
      if (publishingModes.length === 1) return; // keep at least 1
      setPublishingModes(publishingModes.filter(m => m !== mode));
    } else {
      setPublishingModes([...publishingModes, mode]);
    }
  };

  const handleFinalSubmit = () => {
    const now = new Date();
    const closingDate = new Date();
    closingDate.setDate(now.getDate() + quoteClosingDays);
    const questionDate = new Date();
    questionDate.setDate(now.getDate() + Math.max(7, Math.floor(quoteClosingDays * 0.4)));
    const decisionDate = new Date();
    decisionDate.setDate(closingDate.getDate() + 14);

    const rfpNumber = `NOVA-RFP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRfp: RFPItem = {
      id: `rfp-${Date.now()}`,
      rfpNumber,
      title: title.trim() || `${category} Procurement Package`,
      category,
      hospitalName: hospitalName.trim() || 'Partner Healthcare Hospital',
      maskedHospitalTitle: `${bedCapacity} Multispecialty Hospital - ${locationCity}`,
      isIdentityMasked,
      locationCity,
      locationState,
      bedCapacity,
      summary: summary || `Hospital procurement for ${category} at ${locationCity}.`,
      scopeOfWork,
      estimatedBudgetRange: budgetRange,
      currency: 'INR',
      status: 'published',
      publishingModes,
      identityDisclosure,
      publicationDate: now.toISOString().split('T')[0],
      questionDeadline: questionDate.toISOString().split('T')[0],
      quoteClosingDate: closingDate.toISOString().split('T')[0],
      expectedDecisionDate: decisionDate.toISOString().split('T')[0],
      targetInstallationDate: new Date(now.getTime() + 90 * 86400000).toISOString().split('T')[0],
      invitedVendorIds: [],
      requirements,
      attachments: [
        {
          id: `att-${Date.now()}-1`,
          name: `${title.replace(/\s+/g, '_')}_BOQ_Schedule.pdf`,
          type: 'application/pdf',
          size: '1.2 MB',
          category: 'boq',
          uploadedAt: now.toISOString().split('T')[0]
        }
      ],
      assignedAdvisor: assignedAdvisor ? {
        advisorId: 'adv-macula-01',
        name: 'Macula Healthcare Expert Review Desk',
        organization: 'Macula Healthcare Consulting LLP',
        role: 'Healthcare Technology & Procurement Validator',
        assignedAt: now.toISOString(),
        canComment: true,
        canCompare: true,
        conflictDisclosed: true,
        conflictNotes: 'Strict vendor neutrality policy enforced.'
      } : undefined,
      createdBy: currentUser?.name || 'Hospital Owner / Procurement Lead',
      hospitalOwnerEmail: currentUser?.email || 'procurement@hospital.org',
      hospitalOwnerPhone: currentUser?.phone || '+91 98000 00000',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    onSave(newRfp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                AI-Assisted RFP Drafter &amp; Publisher
              </h2>
              <p className="text-[11px] text-slate-300">
                BRS Stage 01 - 04: Structured specification, multi-channel publishing &amp; identity protection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
          {[
            { key: 'category', label: '1. Category & Scope' },
            { key: 'questionnaire', label: '2. AI Questionnaire' },
            { key: 'draft_review', label: '3. Editable Draft' },
            { key: 'publish_config', label: '4. Sourcing & Privacy' }
          ].map((s, idx) => (
            <button
              key={s.key}
              onClick={() => {
                if (step === 'publish_config' || step === 'draft_review' || s.key === 'category') {
                  setStep(s.key as any);
                }
              }}
              className={`font-bold transition-colors flex items-center gap-1.5 ${
                step === s.key ? 'text-blue-700' : 'text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === s.key ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {idx + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-6">

          {/* STEP 1: CATEGORY SELECTION */}
          {step === 'category' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-black text-slate-900">Select Procurement Category</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Choose the healthcare package to load category-specific procurement templates and comparison fields.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      category === cat
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-black shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs">{cat}</span>
                      {category === cat && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hospital / Buyer Name *</label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g. Apollo City Hospital"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Can be hidden on public marketplace via Protected Identity toggle.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bed Capacity</label>
                  <input
                    type="text"
                    value={bedCapacity}
                    onChange={(e) => setBedCapacity(e.target.value)}
                    placeholder="e.g. 100 Beds / 30 ICU Beds"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location City</label>
                  <input
                    type="text"
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">State / Region</label>
                  <input
                    type="text"
                    value={locationState}
                    onChange={(e) => setLocationState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep('questionnaire')}
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <span>Proceed to AI Questionnaire</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AI QUESTIONNAIRE (RFP-FR-02) */}
          {step === 'questionnaire' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-purple-900 text-xs">AI Smart Questionnaire</h4>
                  <p className="text-[11px] text-purple-700 mt-0.5 leading-relaxed">
                    System asks category-relevant questions (capacity, warranty, compliance, budget) to automatically draft a comprehensive technical and commercial RFP with minimum omissions.
                  </p>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Equipment / Package Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 32-Slice Whole Body CT Scanner System with Workstation"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Technical Expectation / Output</label>
                  <textarea
                    rows={2}
                    value={techExpectation}
                    onChange={(e) => setTechExpectation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimated Budget Range</label>
                  <input
                    type="text"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    placeholder="e.g. ₹1.50 Cr - ₹1.85 Cr"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Delivery &amp; Rigging Timeline</label>
                  <input
                    type="text"
                    value={deliveryWeeks}
                    onChange={(e) => setDeliveryWeeks(e.target.value)}
                    placeholder="e.g. 6 to 8 Weeks"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Warranty &amp; CMC Expectations</label>
                  <input
                    type="text"
                    value={warrantyExpectation}
                    onChange={(e) => setWarrantyExpectation(e.target.value)}
                    placeholder="e.g. 2 Yrs Comprehensive + 5 Yrs CMC"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Statutory Approvals &amp; Compliance</label>
                <input
                  type="text"
                  value={complianceNeeds}
                  onChange={(e) => setComplianceNeeds(e.target.value)}
                  placeholder="e.g. AERB Type Approval, CE, ISO 13485, PESO license"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep('category')}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Back
                </button>

                <button
                  onClick={handleApplyAiGeneration}
                  className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold cursor-pointer transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Generate Editable RFP Draft</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: EDITABLE DRAFT (RFP-FR-03 & RFP-FR-04) */}
          {step === 'draft_review' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">Review &amp; Edit Generated RFP Draft</h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  AI has drafted the initial scope and structured requirements. You can fine-tune every parameter.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">RFP Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Executive Summary / Opportunity Note</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs leading-relaxed"
                />
              </div>

              {/* Scope of Work */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Scope of Work Items ({scopeOfWork.length})</label>
                <div className="space-y-1.5">
                  {scopeOfWork.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-800 text-xs leading-snug">• {item}</span>
                      <button
                        onClick={() => setScopeOfWork(scopeOfWork.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newScopeItem}
                    onChange={(e) => setNewScopeItem(e.target.value)}
                    placeholder="Add additional scope deliverable..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                  <button
                    onClick={() => {
                      if (newScopeItem.trim()) {
                        setScopeOfWork([...scopeOfWork, newScopeItem.trim()]);
                        setNewScopeItem('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-bold text-xs cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Technical Requirements Schedule */}
              <div className="space-y-2 pt-2">
                <label className="font-bold text-slate-700 block">Structured Requirement Lines ({requirements.length})</label>
                <div className="space-y-2">
                  {requirements.map((req, idx) => (
                    <div key={req.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{req.parameter}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.isMandatory ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {req.isMandatory ? 'Mandatory' : 'Optional'}
                          </span>
                          <button
                            onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-600 text-xs">{req.hospitalSpecification}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
                  <span className="font-bold text-blue-900 text-xs block">Add Custom Requirement Parameter</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Parameter Name (e.g. Tube Heat Capacity)"
                      value={newReqParam}
                      onChange={(e) => setNewReqParam(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Hospital Specification (e.g. >= 5.0 MHU)"
                      value={newReqSpec}
                      onChange={(e) => setNewReqSpec(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newReqMandatory}
                        onChange={(e) => setNewReqMandatory(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Mandatory Requirement</span>
                    </label>
                    <button
                      onClick={() => {
                        if (newReqParam.trim() && newReqSpec.trim()) {
                          setRequirements([
                            ...requirements,
                            {
                              id: `req-${Date.now()}`,
                              category: 'Custom',
                              parameter: newReqParam.trim(),
                              hospitalSpecification: newReqSpec.trim(),
                              isMandatory: newReqMandatory
                            }
                          ]);
                          setNewReqParam('');
                          setNewReqSpec('');
                        }
                      }}
                      className="px-3 py-1 bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                    >
                      Add Line
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep('questionnaire')}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Back
                </button>

                <button
                  onClick={() => setStep('publish_config')}
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer transition-colors"
                >
                  Continue to Publishing &amp; Privacy
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SOURCING & PRIVACY (RFP-FR-06 TO 11, PUB-FR-01 TO 05) */}
          {step === 'publish_config' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-black text-slate-900">Publishing Channels &amp; Client Identity Protection</h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Multi-channel by design: Broadcast across online channels or export offline PDF for WhatsApp/email.
                </p>
              </div>

              {/* 4 Publishing Modes */}
              <div className="space-y-2.5">
                <label className="font-bold text-slate-800 block text-xs">Active Sourcing Channels (Select all that apply)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      mode: 'selected_invite' as RFPPublishMode,
                      title: 'Direct Vendor Invite',
                      desc: 'Invite pre-verified NOVA-H platform OEMs and distributors directly.'
                    },
                    {
                      mode: 'marketplace' as RFPPublishMode,
                      title: 'NOVA-H Marketplace',
                      desc: 'Broadcast to all qualified vendors in this category and region.'
                    },
                    {
                      mode: 'public_web' as RFPPublishMode,
                      title: 'Public Web Page (SEO-Safe)',
                      desc: 'Google-indexable opportunity page allowing new vendors to spot-register.'
                    },
                    {
                      mode: 'offline_export' as RFPPublishMode,
                      title: 'Downloadable Offline PDF',
                      desc: 'Generate professional branded RFP document for circulating via WhatsApp or Email.'
                    }
                  ].map((p) => {
                    const isChecked = publishingModes.includes(p.mode);
                    return (
                      <div
                        key={p.mode}
                        onClick={() => handleTogglePublishMode(p.mode)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 text-slate-900'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">{p.title}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-blue-600"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{p.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Client Identity Protection (VEN-FR-02 & PUB-FR-03) */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-amber-700" />
                    <span className="font-black text-xs text-amber-950">Protected Client Identity</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isIdentityMasked}
                      onChange={(e) => setIsIdentityMasked(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                <p className="text-[11px] text-amber-900 leading-relaxed">
                  When enabled, public listings and unverified vendors only see: 
                  <strong className="block mt-0.5 font-mono text-[11px]">
                    "{bedCapacity} Multispecialty Hospital - {locationCity}"
                  </strong>
                  Hospital name, contact phone, and exact address remain completely masked until your disclosure condition is met.
                </p>

                {isIdentityMasked && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                      Identity Disclosure Rule
                    </label>
                    <select
                      value={identityDisclosure}
                      onChange={(e) => setIdentityDisclosure(e.target.value as IdentityDisclosureMode)}
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-semibold"
                    >
                      <option value="on_shortlist">Only after vendor is shortlisted by hospital</option>
                      <option value="on_approval">Only after manual hospital approval</option>
                      <option value="nda_required">Only after mutual NDA acceptance</option>
                      <option value="immediate">Disclose immediately after vendor registers</option>
                      <option value="never">Never (All communications stay strictly within NOVA-H)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Deadlines and Advisor support */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quote Submission Window</label>
                  <select
                    value={quoteClosingDays}
                    onChange={(e) => setQuoteClosingDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs"
                  >
                    <option value={14}>14 Days (Fast Track)</option>
                    <option value={21}>21 Days (Recommended Standard)</option>
                    <option value={30}>30 Days (Complex Biomedical Packages)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer pt-4">
                    <input
                      type="checkbox"
                      checked={assignedAdvisor}
                      onChange={(e) => setAssignedAdvisor(e.target.checked)}
                      className="rounded text-purple-600"
                    />
                    <span>Request Macula Healthcare Advisor Review</span>
                  </label>
                  <span className="text-[10px] text-slate-500 pl-5">
                    Biomedical specialist validates technical specs and highlights negotiation levers.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-between">
                <button
                  onClick={() => setStep('draft_review')}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Back
                </button>

                <button
                  onClick={handleFinalSubmit}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black cursor-pointer shadow-md transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish &amp; Open Procurement Workspace</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
