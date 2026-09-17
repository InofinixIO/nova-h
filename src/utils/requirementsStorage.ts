import { ProjectRequirement } from '../types';

export const INITIAL_PROJECT_REQUIREMENTS: ProjectRequirement[] = [
  {
    id: 'REQ-101',
    hospitalName: 'Apex Super Specialty Hospital',
    location: 'Mumbai',
    bedCapacity: '250+ Beds',
    stage: 'Planning & Feasibility',
    categoryNeeded: 'Modular Operation Theatres & Turnkey MEP',
    description: 'Planning a 250-bed tertiary care hospital in Navi Mumbai. Seeking turnkey contractors for 6 modular OT suites (Class 100 laminar flow), medical gas pipelines (MGPS), and central HVAC chiller plant setup.',
    contactPerson: 'Dr. Rajesh Deshmukh',
    email: 'dr.deshmukh@apexhospitals.in',
    phone: '+91 98201 44552',
    createdAt: '2026-03-12',
    status: 'approved',
    estimatedBudget: '₹18 - 25 Crores',
    adminNotes: 'Verified trust documents & municipal layout sanctions. Matched with 3 verified modular OT providers.',
    assignedVendors: ['dir-3', 'dir-1']
  },
  {
    id: 'REQ-102',
    hospitalName: 'CarePlus Oncology & Diagnostic Institute',
    location: 'Bengaluru',
    bedCapacity: '100 - 250 Beds',
    stage: 'Equipment Procurement',
    categoryNeeded: 'Radiation Oncology & Linear Accelerators',
    description: 'Procuring high-end diagnostic and therapeutic oncology equipment: TrueBeam/Versa HD LINAC, PET-CT scanner, and 128-slice dual-energy CT. Vendor must provide turnkey bunker design support and AERB licensing assistance.',
    contactPerson: 'Anita Narayan, COO',
    email: 'anita.narayan@careplusoncology.com',
    phone: '+91 98450 88219',
    createdAt: '2026-03-14',
    status: 'pending_review',
    estimatedBudget: '₹14 - 18 Crores',
    adminNotes: 'Awaiting updated AERB radiation safety officer registration dossier.',
    assignedVendors: ['dir-1']
  },
  {
    id: 'REQ-103',
    hospitalName: 'MetroHealth Mother & Child Center',
    location: 'Delhi NCR',
    bedCapacity: '50 - 100 Beds',
    stage: 'Civil Construction',
    categoryNeeded: 'Hospital Consulting & NABH Accreditation',
    description: '80-bed boutique maternity and pediatric hospital under construction in Gurugram Sector 62. Looking for healthcare planners to review infection control flows, clinical zoning, and prepare for NABH 5th edition from Day 1.',
    contactPerson: 'Vikram Ahuja, Managing Trustee',
    email: 'v.ahuja@metrohealthtrust.org',
    phone: '+91 98110 33490',
    createdAt: '2026-03-15',
    status: 'matched',
    estimatedBudget: '₹6 - 9 Crores',
    adminNotes: 'Consultant introduction completed with Macula Healthcare advisory panel.',
    assignedVendors: ['dir-2', 'dir-5']
  },
  {
    id: 'REQ-104',
    hospitalName: 'Heritage Multispecialty Hospital',
    location: 'Hyderabad',
    bedCapacity: '100 - 250 Beds',
    stage: 'Commissioning & Pre-op',
    categoryNeeded: 'Healthcare IT, Cloud HIS & EMR Systems',
    description: '150-bed hospital commissioning in Q4 2026. Needs cloud-native Hospital Information System (HIS), PACS integration, OPD token management, and complete ABDM Milestone 1-3 certification.',
    contactPerson: 'Dr. K. S. Rao',
    email: 'dr.ksrao@heritagehealth.in',
    phone: '+91 94401 77230',
    createdAt: '2026-03-16',
    status: 'approved',
    estimatedBudget: '₹2.5 - 4 Crores',
    adminNotes: 'Requirements broadcasted to verified healthtech vendors.',
    assignedVendors: ['dir-4']
  },
  {
    id: 'REQ-105',
    hospitalName: 'Suraksha District Health Center',
    location: 'Pune',
    bedCapacity: '50 - 100 Beds',
    stage: 'Planning & Feasibility',
    categoryNeeded: 'Biomedical Waste & Effluent Treatment (ETP/STP)',
    description: 'Sanctioned 90-bed hospital near Chakan industrial belt. Seeking environmental engineering partners for zero-liquid discharge ETP, STP plant, and MPCB pollution control board consents.',
    contactPerson: 'Sachin Patil, Project Director',
    email: 'sachin.patil@surakshahealth.org',
    phone: '+91 97640 12890',
    createdAt: '2026-03-16',
    status: 'pending_review',
    estimatedBudget: '₹1.8 - 2.5 Crores',
    adminNotes: 'Fresh submission - pending phone verification.'
  }
];

const REQUIREMENTS_STORAGE_KEY = 'nova_h_project_requirements';

export const getStoredRequirements = (): ProjectRequirement[] => {
  if (typeof window === 'undefined') return INITIAL_PROJECT_REQUIREMENTS;
  try {
    const raw = localStorage.getItem(REQUIREMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REQUIREMENTS_STORAGE_KEY, JSON.stringify(INITIAL_PROJECT_REQUIREMENTS));
      return INITIAL_PROJECT_REQUIREMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_PROJECT_REQUIREMENTS;
  } catch (err) {
    console.error('Error reading project requirements from storage:', err);
    return INITIAL_PROJECT_REQUIREMENTS;
  }
};

export const saveStoredRequirements = (reqs: ProjectRequirement[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REQUIREMENTS_STORAGE_KEY, JSON.stringify(reqs));
    window.dispatchEvent(new CustomEvent('nova_requirements_updated', { detail: reqs }));
  } catch (err) {
    console.error('Error saving project requirements:', err);
  }
};

export const addRequirement = (
  data: Omit<ProjectRequirement, 'id' | 'createdAt'>
): ProjectRequirement => {
  const current = getStoredRequirements();
  const newReq: ProjectRequirement = {
    ...data,
    id: `REQ-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString().split('T')[0],
    status: data.status || 'pending_review'
  };
  const updated = [newReq, ...current];
  saveStoredRequirements(updated);
  return newReq;
};

export const updateRequirement = (
  id: string,
  updates: Partial<ProjectRequirement>
): ProjectRequirement[] => {
  const current = getStoredRequirements();
  const updated = current.map((item) =>
    item.id === id ? { ...item, ...updates } : item
  );
  saveStoredRequirements(updated);
  return updated;
};

export const deleteRequirement = (id: string): ProjectRequirement[] => {
  const current = getStoredRequirements();
  const updated = current.filter((item) => item.id !== id);
  saveStoredRequirements(updated);
  return updated;
};

export const resetRequirementsToDefault = (): ProjectRequirement[] => {
  saveStoredRequirements(INITIAL_PROJECT_REQUIREMENTS);
  return INITIAL_PROJECT_REQUIREMENTS;
};
