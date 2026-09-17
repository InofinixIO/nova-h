import { EnquiryItem, EnquiryStatus, UserRole } from '../types';

export const INITIAL_ENQUIRIES: EnquiryItem[] = [
  {
    id: 'ENQ-801',
    targetId: 'dir-3',
    targetName: 'CleanFlow Modular OT & Cleanrooms',
    targetEmail: 'sales@cleanflowot.in',
    targetRole: 'vendor',
    senderName: 'Dr. Rajesh Deshmukh',
    senderEmail: 'dr.deshmukh@apexhospitals.in',
    senderPhone: '+91 98201 44552',
    senderRole: 'owner',
    senderCompany: 'Apex Super Specialty Hospital (Navi Mumbai)',
    subject: 'RFQ for 6 Class 100 Modular Operation Theatres',
    message: 'We are in the architectural planning stage for our 250-bed hospital project in Navi Mumbai. We require technical brochures, turnaround schedules, and approximate BOQ rates for 6 Class 100 laminar cleanroom OTs with integrated medical gas pendants and stainless steel modular wall panels.',
    projectLocation: 'Mumbai',
    hospitalName: 'Apex Super Specialty Hospital',
    bedCapacity: '250+ Beds',
    projectStage: 'Architectural Planning & Layout',
    status: 'new',
    createdAt: '2026-03-16 09:30'
  },
  {
    id: 'ENQ-802',
    targetId: 'dir-1',
    targetName: 'MediEquip India Solutions',
    targetEmail: 'contact@mediequip.in',
    targetRole: 'vendor',
    senderName: 'Anita Narayan',
    senderEmail: 'anita.narayan@careplusoncology.com',
    senderPhone: '+91 98450 88219',
    senderRole: 'owner',
    senderCompany: 'CarePlus Oncology Institute',
    subject: 'Expression of Interest: Turnkey Radiation Bunker Fit-out',
    message: 'We are seeking equipment quotes and turnkey bunker layout integration for a high-energy Dual Linear Accelerator and dedicated PET-CT suite. Please share your AERB-compliant case studies in Karnataka.',
    projectLocation: 'Bengaluru',
    hospitalName: 'CarePlus Oncology',
    bedCapacity: '120 Beds',
    projectStage: 'Equipment Procurement',
    status: 'in_review',
    createdAt: '2026-03-15 14:15',
    replyNote: 'Sent initial engineering drawing checklist to promoter team.'
  },
  {
    id: 'ENQ-803',
    targetId: 'dir-4',
    targetName: 'Synapse HealthTech Solutions',
    targetEmail: 'partners@synapsehealthtech.io',
    targetRole: 'vendor',
    senderName: 'Dr. K. S. Rao',
    senderEmail: 'dr.ksrao@heritagehealth.in',
    senderPhone: '+91 94401 77230',
    senderRole: 'owner',
    senderCompany: 'Heritage Multispecialty Hospital',
    subject: 'Cloud HIS & ABDM Integration Product Demo Request',
    message: 'Looking for a cloud-native HIS demo for our 150-bed upcoming facility in Gachibowli, Hyderabad. Need specific details on ABDM M1-M3 compliance, OT scheduling module, and PACS viewer licensing.',
    projectLocation: 'Hyderabad',
    hospitalName: 'Heritage Multispecialty',
    bedCapacity: '150 Beds',
    projectStage: 'Commissioning & Pre-op',
    status: 'proposal_sent',
    createdAt: '2026-03-14 11:20',
    replyNote: 'Demo conducted on March 15. Shared commercial proposal with Dr. Rao.'
  },
  {
    id: 'ENQ-804',
    targetId: 'dir-2',
    targetName: 'Macula Healthcare Consulting & DPR Specialists',
    targetEmail: 'advisory@maculahealthcare.com',
    targetRole: 'advisor',
    senderName: 'Vikram Ahuja',
    senderEmail: 'v.ahuja@metrohealthtrust.org',
    senderPhone: '+91 98110 33490',
    senderRole: 'owner',
    senderCompany: 'MetroHealth Mother & Child Trust',
    subject: 'DPR Review & Clinical Zoning Advisory',
    message: 'We are building an 80-bed boutique maternity facility in Gurugram. We need guidance on reviewing the draft DPR, clinical workflow separation for NICU/Labor wards, and assistance with statutory municipal NOCs.',
    projectLocation: 'Delhi NCR',
    hospitalName: 'MetroHealth Mother & Child',
    bedCapacity: '80 Beds',
    projectStage: 'Civil Construction',
    status: 'contacted',
    createdAt: '2026-03-13 16:45',
    replyNote: 'Introductory call completed. Shared Macula 15-stage toolkit framework.'
  },
  {
    id: 'ENQ-805',
    targetId: 'dir-5',
    targetName: 'QualiCare NABH & Accreditation Consortium',
    targetEmail: 'connect@qualicareaccredit.org',
    targetRole: 'advisor',
    senderName: 'Dr. Sunita Sen',
    senderEmail: 'dr.sen@lifecaresilchar.org',
    senderPhone: '+91 94350 22100',
    senderRole: 'owner',
    senderCompany: 'LifeCare Trust Hospitals',
    subject: 'NABH 5th Edition Gap Analysis for 100-bed Hospital',
    message: 'We are expanding our hospital to 100 beds and intend to achieve NABH Full Accreditation within 9 months of go-live. Seeking an experienced assessor team for baseline gap analysis and clinical SOP creation.',
    projectLocation: 'Kolkata / Eastern Region',
    hospitalName: 'LifeCare Hospital',
    bedCapacity: '100 Beds',
    projectStage: 'Operational Expansion',
    status: 'new',
    createdAt: '2026-03-16 10:10'
  },
  {
    id: 'ENQ-806',
    targetId: 'owner-apex',
    targetName: 'Apex Super Specialty Hospital (Dr. Rajesh Deshmukh)',
    targetEmail: 'dr.deshmukh@apexhospitals.in',
    targetRole: 'owner',
    senderName: 'Sanjay Verma, VP Projects',
    senderEmail: 'sales@cleanflowot.in',
    senderPhone: '+91 80 4122 8890',
    senderRole: 'vendor',
    senderCompany: 'CleanFlow Modular OT & Cleanrooms',
    subject: 'Technical Proposal & Layout Options for Apex 6-OT Suite',
    message: 'Dear Dr. Deshmukh, Following up on your hospital requirement posted on the NOVA network, we have prepared three turnkey architectural layout options for your 6 OT cleanroom suite, compliant with ISO Class 5 and HTM 02-01.',
    projectLocation: 'Mumbai',
    hospitalName: 'Apex Super Specialty Hospital',
    bedCapacity: '250+ Beds',
    projectStage: 'Architectural Planning & Layout',
    status: 'proposal_sent',
    createdAt: '2026-03-16 11:45',
    replyNote: 'Sent preliminary technical drawings via email.'
  },
  {
    id: 'ENQ-807',
    targetId: 'owner-careplus',
    targetName: 'CarePlus Oncology (Anita Narayan)',
    targetEmail: 'anita.narayan@careplusoncology.com',
    targetRole: 'owner',
    senderName: 'Dr. H. Mehta, Senior Advisor',
    senderEmail: 'advisory@maculahealthcare.com',
    senderPhone: '+91 22 4982 1100',
    senderRole: 'advisor',
    senderCompany: 'Macula Healthcare Consulting',
    subject: 'Advisory Assistance on AERB Site Approval & Shielding Calculations',
    message: 'Dear Ms. Narayan, We reviewed your posted LINAC procurement requirement on NOVA. Our medical physics team can assist with primary barrier calculation reports and AERB e-LORA portal filings.',
    projectLocation: 'Bengaluru',
    hospitalName: 'CarePlus Oncology',
    bedCapacity: '120 Beds',
    projectStage: 'Equipment Procurement',
    status: 'new',
    createdAt: '2026-03-16 12:00'
  }
];

const ENQUIRIES_STORAGE_KEY = 'nova_h_enquiries_list';

export const getStoredEnquiries = (): EnquiryItem[] => {
  if (typeof window === 'undefined') return INITIAL_ENQUIRIES;
  try {
    const raw = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(INITIAL_ENQUIRIES));
      return INITIAL_ENQUIRIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_ENQUIRIES;
  } catch (err) {
    console.error('Error reading enquiries from storage:', err);
    return INITIAL_ENQUIRIES;
  }
};

export const saveStoredEnquiries = (items: EnquiryItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('nova_enquiries_updated', { detail: items }));
  } catch (err) {
    console.error('Error saving enquiries:', err);
  }
};

export const addEnquiry = (
  data: Omit<EnquiryItem, 'id' | 'createdAt' | 'status'>
): EnquiryItem => {
  const current = getStoredEnquiries();
  const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const newEnquiry: EnquiryItem = {
    ...data,
    id: `ENQ-${Date.now().toString().slice(-5)}`,
    createdAt: dateStr,
    status: 'new'
  };
  const updated = [newEnquiry, ...current];
  saveStoredEnquiries(updated);
  return newEnquiry;
};

export const updateEnquiryStatus = (
  id: string,
  status: EnquiryStatus,
  replyNote?: string
): EnquiryItem[] => {
  const current = getStoredEnquiries();
  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        status,
        ...(replyNote !== undefined ? { replyNote } : {})
      };
    }
    return item;
  });
  saveStoredEnquiries(updated);
  return updated;
};

export const deleteEnquiry = (id: string): EnquiryItem[] => {
  const current = getStoredEnquiries();
  const updated = current.filter((item) => item.id !== id);
  saveStoredEnquiries(updated);
  return updated;
};

export const resetEnquiriesToDefault = (): EnquiryItem[] => {
  saveStoredEnquiries(INITIAL_ENQUIRIES);
  return INITIAL_ENQUIRIES;
};
