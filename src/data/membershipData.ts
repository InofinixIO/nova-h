import { MembershipPlan, VendorCommercialModel, VendorValueBand } from '../types';

export const MEMBERSHIP_PLANS: Record<string, MembershipPlan> = {
  owner: {
    id: 'plan_owner',
    role: 'owner',
    title: 'Hospital Owner Membership',
    subtitle: 'Low-cost access designed to keep hospital owners accessible across India',
    commercialBasis: 'Per hospital / project',
    annualFee: 1000,
    displayFee: '₹1,000/year',
    badge: 'Promoter Access',
    benefits: [
      'Unrestricted access to the 15-stage Hospital Owners Toolkit',
      'Direct directory search of verified vendors & advisors by city',
      'Post direct project requirements & RFQs to network vendors',
      'Pre-vetted procurement checklists and milestone templates',
      'Direct contact details of verified regional specialists'
    ],
    recommendedRule: 'Hospital Owners pay for access to tools, vetted vendors, and network RFQ channels.'
  },
  advisor: {
    id: 'plan_advisor',
    role: 'advisor',
    title: 'Advisor / Consultant Membership',
    subtitle: 'Qualified professional aligned to NOVA-H / Macula Healthcare methodology',
    commercialBasis: 'Qualified professional subscription',
    annualFee: 1000,
    displayFee: '₹1,000/year',
    badge: 'Expert Network',
    benefits: [
      'Publish verified professional consultant profile in NOVA-H directory',
      'Ecosystem collaboration with hospital promoters & turnkey builders',
      'Receive direct project inquiries and RFQs from hospital owners',
      'Eligibility for NOVA-H / Macula Healthcare project collaboration',
      'Access to orientation programmes and specialist network events'
    ],
    recommendedRule: 'Advisors pay for entry membership + qualification and ecosystem participation.'
  }
};

export interface VendorPricingOption {
  model: VendorCommercialModel;
  modelLabel: string;
  band: VendorValueBand;
  label: string;
  description: string;
  orderValueRange: string;
  fee: number;
  displayFee: string;
}

export const VENDOR_PRICING_OPTIONS: VendorPricingOption[] = [
  // One-time supply
  {
    model: 'one_time',
    modelLabel: 'One-Time Supply',
    band: 'below_2l',
    label: 'Typical order value below ₹2 Lakh',
    description: 'For small medical devices, clinical instruments, consumables, or minor fixtures.',
    orderValueRange: '< ₹2,00,000 for a 50-bed hospital',
    fee: 1000,
    displayFee: '₹1,000/year'
  },
  {
    model: 'one_time',
    modelLabel: 'One-Time Supply',
    band: '2l_to_5l',
    label: 'Typical order value ₹2 Lakh - ₹5 Lakh',
    description: 'For specialized equipment packages, OT lights, furniture lots, or sub-systems.',
    orderValueRange: '₹2,00,000 - ₹5,00,000 for a 50-bed hospital',
    fee: 2500,
    displayFee: '₹2,500/year'
  },
  {
    model: 'one_time',
    modelLabel: 'One-Time Supply',
    band: 'above_5l',
    label: 'Typical order value Above ₹5 Lakh',
    description: 'For major turnkey packages, MRI/CT, MGPS pipeline, modular OTs, HVAC AHUs, or construction.',
    orderValueRange: '> ₹5,00,000 for a 50-bed hospital',
    fee: 5000,
    displayFee: '₹5,000/year'
  },

  // Recurring service
  {
    model: 'recurring',
    modelLabel: 'Recurring Service',
    band: 'below_25k_pm',
    label: 'Typical billing below ₹25,000 / month',
    description: 'For routine biomedical calibration, pest control, laundry, or maintenance retainers.',
    orderValueRange: '< ₹25,000/month billing for a 50-bed hospital',
    fee: 2000,
    displayFee: '₹2,000/year'
  },
  {
    model: 'recurring',
    modelLabel: 'Recurring Service',
    band: '25k_to_50k_pm',
    label: 'Typical billing ₹25,000 - ₹50,000 / month',
    description: 'For facility management, security contracts, specialized clinical software / HMIS.',
    orderValueRange: '₹25,000 - ₹50,000/month billing for a 50-bed hospital',
    fee: 3000,
    displayFee: '₹3,000/year'
  },
  {
    model: 'recurring',
    modelLabel: 'Recurring Service',
    band: 'above_50k_pm',
    label: 'Typical billing Above ₹50,000 / month',
    description: 'For comprehensive multi-department facility operations, full biomedical AMC/CMC retainers.',
    orderValueRange: '> ₹50,000/month billing for a 50-bed hospital',
    fee: 5000,
    displayFee: '₹5,000/year'
  }
];

export const ADVISOR_QUALIFICATION_DETAILS = {
  memberFee: 1000,
  memberFeeDisplay: '₹1,000/year',
  workshopFeeRange: '₹2,500 - ₹5,000 per workshop',
  advisorTypes: [
    {
      title: 'NOVA-H Advisor Member',
      fee: '₹1,000/year',
      description: 'Can create a profile, access the ecosystem, receive relevant hospital information, and attend network workshops.'
    },
    {
      title: 'NOVA-H Qualified Advisor',
      fee: 'Qualification Required',
      description: 'Understands Macula Healthcare methodology, follows professional standards, attends prescribed workshops, and agrees to coordinated project delivery.'
    }
  ],
  qualificationExpectations: [
    'Understand and align with NOVA-H / Macula Healthcare hospital-development methodology.',
    'Follow agreed professional, ethical, and consulting standards.',
    'Attend prescribed paid workshops or orientation programmes.',
    'Where assignments originate through NOVA-H, work in coordination with the Macula Healthcare team.',
    'Accept that Macula Healthcare may be part of the execution / project-management team where required.'
  ]
};

export const ECOSYSTEM_COMMERCIAL_LOGIC = [
  {
    userType: 'Hospital Owners',
    commercialBasis: 'Low-cost access',
    annualFee: '₹1,000/year',
    notes: 'Per hospital / project to keep entry low and encourage active discovery.'
  },
  {
    userType: 'Vendors',
    commercialBasis: 'Primary subscription revenue linked to business opportunity',
    annualFee: '₹1,000 - ₹5,000/year',
    notes: 'Auto-mapped by system based on typical order value for a 50-bed hospital.'
  },
  {
    userType: 'Advisors',
    commercialBasis: 'Entry membership + paid learning + project collaboration',
    annualFee: '₹1,000/year + workshops',
    notes: 'Workshops separately chargeable at ₹2,500 - ₹5,000.'
  },
  {
    userType: 'Macula Healthcare',
    commercialBasis: 'Consulting, project management and execution revenue',
    annualFee: 'Project-based',
    notes: 'Direct advisory & execution when actual hospital projects arise.'
  }
];
