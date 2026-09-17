import { 
  RFPItem, 
  RFPQuote, 
  RFPClarification, 
  RFPAuditEvent, 
  AdvisorObservation, 
  UserRole,
  RFPTCOCalculation
} from '../types';

const STORAGE_KEY_RFPS = 'novah_procurement_rfps';
const STORAGE_KEY_QUOTES = 'novah_procurement_quotes';
const STORAGE_KEY_CLARIFICATIONS = 'novah_procurement_clarifications';
const STORAGE_KEY_AUDITS = 'novah_procurement_audits';
const STORAGE_KEY_OBSERVATIONS = 'novah_procurement_observations';

// ============================================================================
// INITIAL SEED DATA ALIGNED WITH BRS SPECIFICATION
// ============================================================================

export const SEED_RFPS: RFPItem[] = [
  {
    id: 'rfp-ct-scan-blr-0042',
    rfpNumber: 'NOVA-RFP-2026-0042',
    title: '32-Slice Whole Body CT Scanner System with Workstation & UPS',
    category: 'Biomedical Equipment',
    hospitalName: 'Apollo City Hospital Bengaluru',
    maskedHospitalTitle: '50-bed Multispecialty Hospital - Bengaluru',
    isIdentityMasked: true,
    locationCity: 'Bengaluru',
    locationState: 'Karnataka',
    bedCapacity: '50 Beds',
    summary: 'Procurement of brand new 32-slice whole body multi-detector CT Scanner with sub-millimeter isotropic resolution, dedicated dual-monitor post-processing console, 0.5s gantry rotation, and 120 kVA online isolation UPS for 24x7 emergency & trauma imaging.',
    scopeOfWork: [
      'Supply, transport, uncrating, safe rigging and site positioning of 32-slice CT gantry and patient couch.',
      'AERB Type Approval compliance, lead-lining radiation shielding guidance and survey inspection report.',
      'Supply of 120 kVA online isolation UPS with 15-minute full load backup batteries.',
      'Dual-head automated contrast pressure injector with ceiling mount suspension.',
      '5-Year Comprehensive Warranty followed by mandatory 5-Year CMC pricing model with guaranteed 98% uptime SLA.'
    ],
    estimatedBudgetRange: '₹1.50 Cr - ₹1.85 Cr',
    currency: 'INR',
    status: 'technical_comparison',
    publishingModes: ['selected_invite', 'marketplace', 'public_web', 'offline_export'],
    identityDisclosure: 'on_shortlist',
    publicationDate: '2026-08-20',
    questionDeadline: '2026-09-05',
    quoteClosingDate: '2026-09-15',
    revisedClosingDate: '2026-09-22',
    expectedDecisionDate: '2026-10-05',
    targetInstallationDate: '2026-12-15',
    invitedVendorIds: ['v-wipro-ge', 'v-siemens-health', 'v-philips-med'],
    requirements: [
      {
        id: 'req-01',
        category: 'Gantry & Detector',
        parameter: 'Detector Slices per Rotation',
        hospitalSpecification: 'True physical 32 slices or 64 reconstructed slices per rotation',
        isMandatory: true,
        unit: 'Slices'
      },
      {
        id: 'req-02',
        category: 'Gantry & Detector',
        parameter: 'Gantry Rotation Speed',
        hospitalSpecification: '0.50 seconds or faster for 360 degree full rotation',
        isMandatory: true,
        unit: 'Seconds'
      },
      {
        id: 'req-03',
        category: 'X-Ray Generator & Tube',
        parameter: 'Generator Power & Anode Heat Capacity',
        hospitalSpecification: 'Minimum 42 kW generator, tube heat capacity >= 5.0 MHU',
        isMandatory: true,
        unit: 'kW / MHU'
      },
      {
        id: 'req-04',
        category: 'Compliance & Safety',
        parameter: 'AERB & Radiation Safety',
        hospitalSpecification: 'Valid AERB Type Approval certificate in India + Dose Modulation SW',
        isMandatory: true
      },
      {
        id: 'req-05',
        category: 'Warranty & SLA',
        parameter: 'Comprehensive Warranty & Uptime',
        hospitalSpecification: 'Minimum 2 Years Comprehensive Warranty including Tube, followed by 98% uptime SLA',
        isMandatory: true,
        unit: 'Years'
      },
      {
        id: 'req-06',
        category: 'UPS & Auxiliaries',
        parameter: 'Online UPS & Injector',
        hospitalSpecification: '100-120 kVA online UPS with 15 min VRLA battery + Dual head injector included',
        isMandatory: false
      }
    ],
    attachments: [
      {
        id: 'att-01',
        name: 'CT_Scan_Room_Architectural_Layout_AERB_Shielding.pdf',
        type: 'application/pdf',
        size: '4.2 MB',
        category: 'drawing',
        uploadedAt: '2026-08-20'
      },
      {
        id: 'att-02',
        name: 'Technical_BOQ_CT_Scanner_Schedule_A.pdf',
        type: 'application/pdf',
        size: '1.1 MB',
        category: 'boq',
        uploadedAt: '2026-08-20'
      },
      {
        id: 'att-03',
        name: 'Commercial_Terms_and_Conditions_NOVA_H.pdf',
        type: 'application/pdf',
        size: '850 KB',
        category: 'terms',
        uploadedAt: '2026-08-20'
      }
    ],
    assignedAdvisor: {
      advisorId: 'adv-macula-01',
      name: 'Er. Rajeshwar Murthy',
      organization: 'Macula Healthcare Consulting LLP',
      role: 'Principal Healthcare Technology & Biomedical Advisor',
      assignedAt: '2026-08-22',
      canComment: true,
      canCompare: true,
      conflictDisclosed: true,
      conflictNotes: 'No financial or distributorship ties to any bidding OEMs.'
    },
    createdBy: 'Dr. S. K. Narayanan (Managing Director)',
    hospitalOwnerEmail: 'md@apollo-city-hospital.org',
    hospitalOwnerPhone: '+91 98450 12389',
    createdAt: '2026-08-20T10:30:00Z',
    updatedAt: '2026-09-16T15:45:00Z'
  },
  {
    id: 'rfp-mgps-hyd-0043',
    rfpNumber: 'NOVA-RFP-2026-0043',
    title: '1000 LPM Medical Gas Pipeline System (MGPS) with Cryogenic LMO Tank & Manifold',
    category: 'Engineering / MEP',
    hospitalName: 'Apex Supercare Hospital Hyderabad',
    maskedHospitalTitle: '150-bed Tertiary Hospital - Hyderabad',
    isIdentityMasked: true,
    locationCity: 'Hyderabad',
    locationState: 'Telangana',
    bedCapacity: '150 Beds',
    summary: 'Turnkey supply, testing and HTM 02-01 / NFPA 99 compliant installation of complete Medical Gas Pipeline System including 10 kL Vacuum Insulated Cryogenic Liquid Oxygen tank, 2x15 duplex cylinder manifold with auto changeover, triplex medical air and vacuum plant, and 280 terminal outlets.',
    scopeOfWork: [
      'Supply and installation of 10 kL LMO Cryogenic Storage Tank with dual atmospheric vaporizers and PESO license approval.',
      'Triplex Medical Air Compressor (oil-free scroll) and Triplex Medical Vacuum pump system with bacteria filters.',
      'Degreased copper piping BS EN 13348 standard across 6 floors, ICU, OT and wards.',
      'Area valve service units (AVSU), digital master alarm panels, and gas terminal outlets with gas-specific probe locks.'
    ],
    estimatedBudgetRange: '₹85.0 L - ₹1.15 Cr',
    currency: 'INR',
    status: 'submissions_open',
    publishingModes: ['marketplace', 'public_web', 'offline_export'],
    identityDisclosure: 'on_approval',
    publicationDate: '2026-09-01',
    questionDeadline: '2026-09-18',
    quoteClosingDate: '2026-09-28',
    expectedDecisionDate: '2026-10-10',
    targetInstallationDate: '2027-01-15',
    invitedVendorIds: ['v-bhurat-oxygen', 'v-linde-india'],
    requirements: [
      {
        id: 'mgps-01',
        category: 'Piping Standard',
        parameter: 'Copper Tube Specification',
        hospitalSpecification: 'BS EN 13348 degreased, phosphorus-deoxidised seamless copper',
        isMandatory: true
      },
      {
        id: 'mgps-02',
        category: 'Cryogenic Storage',
        parameter: 'LMO Tank Capacity & PESO Approvals',
        hospitalSpecification: '10,000 Litre Vacuum Insulated with dual 120 Nm3/hr vaporizers & PESO SMPV certificate',
        isMandatory: true
      },
      {
        id: 'mgps-03',
        category: 'Air & Vacuum',
        parameter: 'Medical Air Purity Standards',
        hospitalSpecification: 'ISO 7396-1 / HTM 02-01 certified oil-free scroll compressor',
        isMandatory: true
      }
    ],
    attachments: [
      {
        id: 'att-mgps-01',
        name: 'MGPS_Riser_Diagram_and_Terminal_BOQ.pdf',
        type: 'application/pdf',
        size: '3.4 MB',
        category: 'drawing',
        uploadedAt: '2026-09-01'
      }
    ],
    createdBy: 'Col. (Retd) R. K. Varma (COO)',
    hospitalOwnerEmail: 'coo@apexsupercare.com',
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-12T11:20:00Z'
  },
  {
    id: 'rfp-mod-ot-pune-0044',
    rfpNumber: 'NOVA-RFP-2026-0044',
    title: 'Turnkey Modular Operation Theatre Complex (3 Suites with Laminar Air Flow & Pendants)',
    category: 'Modular OT & CSSD',
    hospitalName: 'St. Jude Metro Specialty Center, Pune',
    maskedHospitalTitle: '100-bed Surgical Center - Pune',
    isIdentityMasked: true,
    locationCity: 'Pune',
    locationState: 'Maharashtra',
    bedCapacity: '100 Beds',
    summary: 'Turnkey design and installation of 3 Super-Specialty Modular Operation Theatres (Cardiac, Neuro & Ortho) equipped with antibacterial solid surface wall cladding, plenum laminar air flow with terminal HEPA filters, motorized surgical & anesthesia pendants, anti-static conductive flooring, and integrated touchscreen surgeon control panels.',
    scopeOfWork: [
      'Prefabricated modular wall and ceiling panels with anti-microbial Dupont Corian / powder-coated GI construction.',
      'Ceiling laminar airflow canopy (8x8 ft) with terminal Class 100 HEPA filtration (H14 grade).',
      'Ceiling mounted motorized surgical and anesthesia equipment pendants.',
      'Hermetically sealed sliding automatic doors with radiation lead shielding.'
    ],
    estimatedBudgetRange: '₹1.10 Cr - ₹1.45 Cr',
    currency: 'INR',
    status: 'clarification',
    publishingModes: ['selected_invite', 'marketplace'],
    identityDisclosure: 'nda_required',
    publicationDate: '2026-08-25',
    questionDeadline: '2026-09-10',
    quoteClosingDate: '2026-09-20',
    expectedDecisionDate: '2026-10-02',
    targetInstallationDate: '2026-12-30',
    invitedVendorIds: ['v-medi-cleanroom', 'v-dentsply-ot'],
    requirements: [
      {
        id: 'ot-01',
        category: 'HVAC & Air Handling',
        parameter: 'Air Changes & Cleanliness Class',
        hospitalSpecification: 'Minimum 25-30 air changes per hour, Class 100 at surgical table level',
        isMandatory: true
      },
      {
        id: 'ot-02',
        category: 'Wall Panels',
        parameter: 'Panel Material & Joint Quality',
        hospitalSpecification: 'Antimicrobial solid surface / seamless flush silicone jointed GI panels',
        isMandatory: true
      }
    ],
    attachments: [
      {
        id: 'att-ot-01',
        name: 'OT_Complex_Floor_Plan_Dirty_Clean_Corridor.pdf',
        type: 'application/pdf',
        size: '5.6 MB',
        category: 'drawing',
        uploadedAt: '2026-08-25'
      }
    ],
    createdBy: 'Dr. Anita Deshmukh (Medical Director)',
    hospitalOwnerEmail: 'director@stjudepune.org',
    createdAt: '2026-08-25T14:00:00Z',
    updatedAt: '2026-09-15T18:10:00Z'
  }
];

export const SEED_QUOTES: RFPQuote[] = [
  {
    id: 'quote-ge-01',
    rfpId: 'rfp-ct-scan-blr-0042',
    vendorId: 'v-wipro-ge',
    vendorName: 'Wipro GE Healthcare Pvt Ltd',
    vendorCompany: 'Wipro GE Healthcare India',
    contactEmail: 'bids.south@gehealthcare.com',
    contactPhone: '+91 80 4012 3000',
    isExternal: false, // Platform Native Online Submission
    submissionDate: '2026-09-12T14:20:00Z',
    quoteValidityDate: '2026-12-15',
    version: 1,
    status: 'verified',
    officialDocumentName: 'Wipro_GE_Revolution_ACTs_32_NOVA_Formal_Bid.pdf',
    commercials: {
      basePrice: 13500000,
      gstRatePercent: 12,
      gstAmount: 1620000,
      freightAmount: 350000,
      installationAmount: 250000,
      sitePrepAmount: 180000,
      accessoriesAmount: 500000, // Includes injector + 120kVA UPS
      netLandedCost: 16400000,
      paymentTerms: '10% advance with PO, 70% against delivery dispatch, 20% post successful AERB sign-off',
      deliveryWeeks: 6,
      warrantyYears: 2,
      amcAnnualPercent: 4.5,
      amcAnnualAmount: 607500,
      cmcAnnualPercent: 6.2,
      cmcAnnualAmount: 837000,
      highValueSparesEstAnnual: 450000,
      consumablesCostPerTest: 85,
      trainingIncluded: true,
      softwareLicenseCost: 0, // Included in base package
      uptimeCommitmentPercent: 98
    },
    technicalSpecs: [
      {
        reqId: 'req-01',
        parameter: 'Detector Slices per Rotation',
        offeredValue: '32 Physical detector rows with 64 sub-slice ASiR reconstruction',
        compliance: 'compliant',
        notes: 'Full sub-millimeter volume acquisition'
      },
      {
        reqId: 'req-02',
        parameter: 'Gantry Rotation Speed',
        offeredValue: '0.48 seconds full 360 degree rotation',
        compliance: 'compliant',
        notes: 'Superior to 0.5s requirement'
      },
      {
        reqId: 'req-03',
        parameter: 'Generator Power & Anode Heat Capacity',
        offeredValue: '48 kW generator with 5.3 MHU Performix Tube',
        compliance: 'compliant',
        notes: 'Tube warranty 24 months or 200,000 scan seconds'
      },
      {
        reqId: 'req-04',
        parameter: 'AERB & Radiation Safety',
        offeredValue: 'Certified AERB Type Approved with Smart Dose & ODM modulation',
        compliance: 'compliant'
      },
      {
        reqId: 'req-05',
        parameter: 'Comprehensive Warranty & Uptime',
        offeredValue: '2 Years Comprehensive Warranty with 98% uptime guarantee penalty clause',
        compliance: 'compliant'
      },
      {
        reqId: 'req-06',
        parameter: 'Online UPS & Injector',
        offeredValue: '120 kVA Fuji Online UPS + Ulrich Dual Syringe Injector Included',
        compliance: 'compliant'
      }
    ],
    deviationsAndExclusions: [
      'Lead glass viewing window (1.2m x 1.0m) to be provided by hospital civil team.',
      'Dedicated 3-phase 415V 50Hz transformer connection to CT room distribution panel.'
    ],
    statutoryCertifications: ['AERB Type Approval', 'CE Mark', 'US FDA 510(k)', 'ISO 13485:2016']
  },
  {
    id: 'quote-siemens-02',
    rfpId: 'rfp-ct-scan-blr-0042',
    vendorId: 'v-siemens-health',
    vendorName: 'Siemens Healthcare Private Limited',
    vendorCompany: 'Siemens Healthineers India',
    contactEmail: 'healthcare.sales@siemens-healthineers.com',
    contactPhone: '+91 22 3967 7000',
    isExternal: true, // Offline Quote Uploaded by Hospital from WhatsApp/Email
    externalSource: 'whatsapp',
    submissionDate: '2026-09-14T11:05:00Z',
    quoteValidityDate: '2026-11-30',
    version: 2,
    status: 'verified',
    officialDocumentName: 'Somatom_goNow_32Slice_Quotation_Bangalore.pdf',
    commercials: {
      basePrice: 13100000,
      gstRatePercent: 12,
      gstAmount: 1572000,
      freightAmount: 380000,
      installationAmount: 200000,
      sitePrepAmount: 150000,
      accessoriesAmount: 398000,
      netLandedCost: 15800000,
      paymentTerms: '20% advance with order, 70% against delivery challan, 10% on installation sign-off',
      deliveryWeeks: 8,
      warrantyYears: 2,
      amcAnnualPercent: 4.2,
      amcAnnualAmount: 550200,
      cmcAnnualPercent: 5.9,
      cmcAnnualAmount: 772900,
      highValueSparesEstAnnual: 420000,
      consumablesCostPerTest: 92,
      trainingIncluded: true,
      softwareLicenseCost: 150000,
      uptimeCommitmentPercent: 97.5
    },
    technicalSpecs: [
      {
        reqId: 'req-01',
        parameter: 'Detector Slices per Rotation',
        offeredValue: '32 Physical rows with Chrono4D Reconstruction',
        compliance: 'compliant'
      },
      {
        reqId: 'req-02',
        parameter: 'Gantry Rotation Speed',
        offeredValue: '0.50 seconds rotation speed',
        compliance: 'compliant'
      },
      {
        reqId: 'req-03',
        parameter: 'Generator Power & Anode Heat Capacity',
        offeredValue: '42 kW Athlon X-ray Tube (5.0 MHU equivalent with smart cooling)',
        compliance: 'compliant',
        notes: 'X-ray tube warranty clarified after hospital question: 2 years included'
      },
      {
        reqId: 'req-04',
        parameter: 'AERB & Radiation Safety',
        offeredValue: 'AERB Approved with CARE Dose 4D real-time mA modulation',
        compliance: 'compliant'
      },
      {
        reqId: 'req-05',
        parameter: 'Comprehensive Warranty & Uptime',
        offeredValue: '2 Years Comprehensive Warranty with 97.5% uptime commitment',
        compliance: 'compliant'
      },
      {
        reqId: 'req-06',
        parameter: 'Online UPS & Injector',
        offeredValue: '100 kVA Delta UPS with 15 min backup. Injector is single head (dual head optional)',
        compliance: 'partial',
        notes: 'Dual-head contrast injector is quoted as optional extra (+₹3.5L)'
      }
    ],
    deviationsAndExclusions: [
      'Single-head injector standard; dual head available as option.',
      'Lead acrylic mobile barrier not included in base quote.'
    ],
    statutoryCertifications: ['AERB Type Approval', 'ISO 13485', 'CE Certification'],
    aiExtraction: {
      isExtracted: true,
      confidenceScore: 94,
      humanVerified: true,
      verifiedBy: 'Dr. S. K. Narayanan (MD)',
      verifiedAt: '2026-09-14T16:30:00Z',
      missingRequiredFields: ['Initial quote omitted X-ray tube warranty terms'],
      flaggedDiscrepancies: [
        'Single-head injector provided instead of requested dual-head injector',
        'Software license renewal after Year 1 was initially ambiguous'
      ],
      rawSnippets: {
        vendorName: 'Siemens Healthcare Private Limited - Medical Imaging Div',
        modelOffered: 'SOMATOM go.Now (32-slice configuration)',
        basePriceQuoted: 'INR 1,31,00,000/- (Rupees One Crore Thirty One Lakhs Only)',
        taxTerms: 'GST 12% extra as applicable at time of invoicing',
        warrantyClause: '24 calendar months from handover date. Tube covered under manufacturer standard.'
      }
    }
  },
  {
    id: 'quote-philips-03',
    rfpId: 'rfp-ct-scan-blr-0042',
    vendorId: 'v-philips-med',
    vendorName: 'Philips India Limited - Healthcare',
    vendorCompany: 'Philips Healthcare',
    contactEmail: 'ct.sales.in@philips.com',
    contactPhone: '+91 124 460 6000',
    isExternal: true, // Offline Quote Uploaded from Email by Hospital
    externalSource: 'email',
    submissionDate: '2026-09-15T09:45:00Z',
    quoteValidityDate: '2026-12-31',
    version: 1,
    status: 'verified',
    officialDocumentName: 'Philips_AccessCT_32_ApolloCity_Bangalore_Proposal.pdf',
    commercials: {
      basePrice: 14200000,
      gstRatePercent: 12,
      gstAmount: 1704000,
      freightAmount: 320000,
      installationAmount: 220000,
      sitePrepAmount: 210000,
      accessoriesAmount: 546000,
      netLandedCost: 17200000,
      paymentTerms: '15% advance, 75% on delivery dispatch, 10% after 30 days of error-free clinical trial',
      deliveryWeeks: 5,
      warrantyYears: 3, // Longest warranty!
      amcAnnualPercent: 4.8,
      amcAnnualAmount: 681600,
      cmcAnnualPercent: 6.5,
      cmcAnnualAmount: 923000,
      highValueSparesEstAnnual: 480000,
      consumablesCostPerTest: 88,
      trainingIncluded: true,
      softwareLicenseCost: 0,
      uptimeCommitmentPercent: 98.5
    },
    technicalSpecs: [
      {
        reqId: 'req-01',
        parameter: 'Detector Slices per Rotation',
        offeredValue: '32 Physical detector rows with iDose4 Iterative Reconstruction',
        compliance: 'compliant'
      },
      {
        reqId: 'req-02',
        parameter: 'Gantry Rotation Speed',
        offeredValue: '0.50 seconds rotation speed',
        compliance: 'compliant'
      },
      {
        reqId: 'req-03',
        parameter: 'Generator Power & Anode Heat Capacity',
        offeredValue: '48 kW generator with 5.0 MHU vMRC X-ray Tube',
        compliance: 'compliant',
        notes: 'Includes full 3-year tube guarantee'
      },
      {
        reqId: 'req-04',
        parameter: 'AERB & Radiation Safety',
        offeredValue: 'AERB Certified with DoseRight automatic exposure control',
        compliance: 'compliant'
      },
      {
        reqId: 'req-05',
        parameter: 'Comprehensive Warranty & Uptime',
        offeredValue: '3 Years Full Comprehensive Warranty including Tube and Detectors (Longest in category)',
        compliance: 'compliant'
      },
      {
        reqId: 'req-06',
        parameter: 'Online UPS & Injector',
        offeredValue: '120 kVA APC/Schneider Online UPS + Nemoto Dual Injector included',
        compliance: 'compliant'
      }
    ],
    deviationsAndExclusions: [
      'Site preparation civil shielding work to be validated by AERB accredited surveyor.'
    ],
    statutoryCertifications: ['AERB Approved', 'CE MDD', 'ISO 13485'],
    aiExtraction: {
      isExtracted: true,
      confidenceScore: 97,
      humanVerified: true,
      verifiedBy: 'Dr. S. K. Narayanan (MD)',
      verifiedAt: '2026-09-15T14:10:00Z',
      missingRequiredFields: [],
      flaggedDiscrepancies: [
        'Higher initial capital acquisition price, compensated by 3-year comprehensive warranty'
      ],
      rawSnippets: {
        model: 'Philips Access CT 32-Slice System',
        landedEstimate: 'INR 1,72,00,000/- All inclusive landed'
      }
    }
  }
];

export const SEED_CLARIFICATIONS: RFPClarification[] = [
  {
    id: 'clr-01',
    rfpId: 'rfp-ct-scan-blr-0042',
    quoteId: 'quote-siemens-02',
    vendorName: 'Siemens Healthcare Private Limited',
    category: 'warranty',
    isAiDrafted: true,
    question: 'AI Prompt Detected: Your uploaded proposal does not explicitly state the warranty period and scan second limit for the Athlon X-ray tube. Please confirm if the tube is covered for the full 24 months without scan-count limitations.',
    askedBy: 'Hospital Procurement Committee',
    askedAt: '2026-09-14T17:15:00Z',
    response: 'Siemens confirms that the Athlon tube is covered under 24 months comprehensive warranty up to 200,000 scan seconds or 2 years, whichever occurs later for single-shift hospital usage.',
    respondedAt: '2026-09-15T10:45:00Z',
    status: 'resolved',
    revisionResulted: true
  },
  {
    id: 'clr-02',
    rfpId: 'rfp-ct-scan-blr-0042',
    quoteId: 'quote-siemens-02',
    vendorName: 'Siemens Healthcare Private Limited',
    category: 'technical',
    isAiDrafted: true,
    question: 'AI Prompt Detected: RFP Schedule A requires a dual-head contrast pressure injector. Your quotation lists a single-head unit with dual-head as optional. Please confirm your best package price to include the dual-head injector in the primary scope.',
    askedBy: 'Hospital Procurement Committee',
    askedAt: '2026-09-14T17:20:00Z',
    response: 'We are willing to bundle the dual-head injector for a special concession of ₹1.5L (reduced from ₹3.5L) subject to purchase order release within October 2026.',
    respondedAt: '2026-09-15T11:30:00Z',
    status: 'answered',
    revisionResulted: true
  },
  {
    id: 'clr-03',
    rfpId: 'rfp-ct-scan-blr-0042',
    quoteId: 'quote-ge-01',
    vendorName: 'Wipro GE Healthcare Pvt Ltd',
    category: 'commercial',
    isAiDrafted: false,
    question: 'Please confirm whether 5th to 10th year Comprehensive Maintenance Contract (CMC) escalates at a fixed annual percentage or is capped at 6.2% of machine base price.',
    askedBy: 'Er. Rajeshwar Murthy (Macula Healthcare Advisor)',
    askedAt: '2026-09-15T15:00:00Z',
    response: 'Wipro GE confirms CMC rate is capped at 6.2% of base equipment cost with maximum 5% annual inflation indexing from Year 6 onwards.',
    respondedAt: '2026-09-16T09:15:00Z',
    status: 'resolved'
  }
];

export const SEED_OBSERVATIONS: AdvisorObservation[] = [
  {
    id: 'obs-01',
    rfpId: 'rfp-ct-scan-blr-0042',
    advisorName: 'Er. Rajeshwar Murthy',
    organization: 'Macula Healthcare Consulting LLP',
    category: 'commercial_risk',
    observation: 'Landed acquisition cost comparison: Siemens is ₹1.58 Cr, Wipro GE is ₹1.64 Cr, Philips is ₹1.72 Cr. However, Philips includes 3 years of full warranty while GE and Siemens provide 2 years.',
    recommendation: 'When factoring in Year 3 CMC savings (approx. ₹8.5 Lakhs), the effective net gap between GE and Philips narrows to less than ₹50,000.',
    createdAt: '2026-09-16T11:00:00Z'
  },
  {
    id: 'obs-02',
    rfpId: 'rfp-ct-scan-blr-0042',
    advisorName: 'Er. Rajeshwar Murthy',
    organization: 'Macula Healthcare Consulting LLP',
    category: 'technical',
    observation: 'Gantry rotation & pitch: GE offers 0.48s with ASiR dose reduction which is advantageous for pediatric and trauma scanning in a 50-bed center.',
    recommendation: 'Use Siemens competitive price point (₹1.58 Cr) as leverage during final negotiation rounds to bring Wipro GE down to ₹1.55 Cr.',
    createdAt: '2026-09-16T11:30:00Z'
  }
];

export const SEED_AUDITS: RFPAuditEvent[] = [
  {
    id: 'aud-01',
    rfpId: 'rfp-ct-scan-blr-0042',
    timestamp: '2026-08-20T10:30:00Z',
    actorName: 'Dr. S. K. Narayanan (MD)',
    actorRole: 'owner',
    action: 'RFP Created',
    description: 'Created 32-slice CT Scanner RFP using AI-guided equipment questionnaire.',
    priorState: 'None',
    newState: 'draft'
  },
  {
    id: 'aud-02',
    rfpId: 'rfp-ct-scan-blr-0042',
    timestamp: '2026-08-20T12:00:00Z',
    actorName: 'Dr. S. K. Narayanan (MD)',
    actorRole: 'owner',
    action: 'RFP Published Multi-Channel',
    description: 'Published opportunity to NOVA-H Marketplace, enabled Public Web search indexing with protected identity, and sent targeted invites to GE and Siemens.',
    priorState: 'draft',
    newState: 'published'
  },
  {
    id: 'aud-03',
    rfpId: 'rfp-ct-scan-blr-0042',
    timestamp: '2026-08-22T09:15:00Z',
    actorName: 'Dr. S. K. Narayanan (MD)',
    actorRole: 'owner',
    action: 'Advisor Scoped Access Granted',
    description: 'Assigned Er. Rajeshwar Murthy (Macula Healthcare) as technical & commercial review advisor with commenting & comparison rights.',
    newState: 'advisor_assigned'
  },
  {
    id: 'aud-04',
    rfpId: 'rfp-ct-scan-blr-0042',
    timestamp: '2026-09-12T14:20:00Z',
    actorName: 'Wipro GE Healthcare',
    actorRole: 'vendor',
    action: 'Online Structured Quote Submitted',
    description: 'Wipro GE submitted formal online quote (₹1.64 Cr landed) with technical compliance sheets and AERB documentation.',
    newState: 'quote_received'
  },
  {
    id: 'aud-05',
    rfpId: 'rfp-ct-scan-blr-0042',
    timestamp: '2026-09-14T11:05:00Z',
    actorName: 'Dr. S. K. Narayanan (MD)',
    actorRole: 'owner',
    action: 'External Quote Uploaded',
    description: 'Hospital uploaded external quotation received from Siemens Healthineers via WhatsApp channel.',
    newState: 'quote_uploaded_external'
  },
  {
    id: 'aud-06',
    rfpId: 'rfp-ct-scan-blr-0042',
    timestamp: '2026-09-14T16:30:00Z',
    actorName: 'Dr. S. K. Narayanan (MD)',
    actorRole: 'owner',
    action: 'AI Extraction Human Gate Verified',
    description: 'Reviewed and confirmed AI extracted values for Siemens Somatom quote (Base: ₹1.31 Cr, GST: 12%, Landed: ₹1.58 Cr). Missing tube warranty flagged for clarification.',
    newState: 'quote_verified'
  },
  {
    id: 'aud-07',
    rfpId: 'rfp-ct-scan-blr-0042',
    timestamp: '2026-09-14T17:15:00Z',
    actorName: 'Hospital Procurement Committee',
    actorRole: 'owner',
    action: 'AI Clarification Dispatched',
    description: 'Dispatched AI-generated clarification queries regarding X-ray tube warranty and dual-head injector to Siemens.',
    newState: 'clarification_sent'
  },
  {
    id: 'aud-08',
    rfpId: 'rfp-ct-scan-blr-0042',
    timestamp: '2026-09-15T09:45:00Z',
    actorName: 'Dr. S. K. Narayanan (MD)',
    actorRole: 'owner',
    action: 'External Quote Uploaded',
    description: 'Hospital uploaded external quotation received from Philips Healthcare via Email channel. Verified AI extraction (Landed: ₹1.72 Cr with 3-year warranty).',
    newState: 'quote_verified'
  }
];

// ============================================================================
// STORAGE HELPERS
// ============================================================================

export function getStoredRFPs(): RFPItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RFPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RFPS, JSON.stringify(SEED_RFPS));
      return SEED_RFPS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading RFPs from localStorage', e);
    return SEED_RFPS;
  }
}

export function saveStoredRFPs(rfps: RFPItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RFPS, JSON.stringify(rfps));
  } catch (e) {
    console.error('Failed saving RFPs to localStorage', e);
  }
}

export function getStoredQuotes(): RFPQuote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUOTES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(SEED_QUOTES));
      return SEED_QUOTES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading Quotes from localStorage', e);
    return SEED_QUOTES;
  }
}

export function saveStoredQuotes(quotes: RFPQuote[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(quotes));
  } catch (e) {
    console.error('Failed saving Quotes to localStorage', e);
  }
}

export function getStoredClarifications(): RFPClarification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLARIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CLARIFICATIONS, JSON.stringify(SEED_CLARIFICATIONS));
      return SEED_CLARIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return SEED_CLARIFICATIONS;
  }
}

export function saveStoredClarifications(clarifications: RFPClarification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CLARIFICATIONS, JSON.stringify(clarifications));
  } catch (e) {
    console.error('Failed saving Clarifications', e);
  }
}

export function getStoredAuditEvents(): RFPAuditEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDITS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_AUDITS, JSON.stringify(SEED_AUDITS));
      return SEED_AUDITS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return SEED_AUDITS;
  }
}

export function saveStoredAuditEvents(audits: RFPAuditEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUDITS, JSON.stringify(audits));
  } catch (e) {
    console.error('Failed saving Audits', e);
  }
}

export function getStoredAdvisorObservations(): AdvisorObservation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OBSERVATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_OBSERVATIONS, JSON.stringify(SEED_OBSERVATIONS));
      return SEED_OBSERVATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return SEED_OBSERVATIONS;
  }
}

export function saveStoredAdvisorObservations(obs: AdvisorObservation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_OBSERVATIONS, JSON.stringify(obs));
  } catch (e) {
    console.error('Failed saving Observations', e);
  }
}

export function logAuditEvent(
  rfpId: string,
  actorName: string,
  actorRole: UserRole,
  action: string,
  description: string,
  priorState?: string,
  newState?: string
): void {
  const current = getStoredAuditEvents();
  const event: RFPAuditEvent = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    rfpId,
    timestamp: new Date().toISOString(),
    actorName,
    actorRole,
    action,
    description,
    priorState,
    newState
  };
  saveStoredAuditEvents([event, ...current]);
}

// Helper to compute TCO according to Section 9 (TCO-FR-01 to 05)
export function calculateTCO(quote: RFPQuote, periodYears: 5 | 10 = 5): RFPTCOCalculation {
  const c = quote.commercials;
  const acquisition = c.netLandedCost || (c.basePrice + c.gstAmount + c.freightAmount + c.installationAmount);
  const sitePrep = c.sitePrepAmount || 0;

  // Post-warranty CMC years
  const warrantyYears = c.warrantyYears || 1;
  const postWarrantyYears = Math.max(0, periodYears - warrantyYears);
  const annualCMC = c.cmcAnnualAmount || (c.cmcAnnualPercent ? (c.basePrice * c.cmcAnnualPercent) / 100 : 0);
  const totalMaintenance = postWarrantyYears * annualCMC;

  // High value replacement parts (e.g. X-ray tube every 3-4 years)
  const annualSpares = c.highValueSparesEstAnnual || 0;
  const totalSpares = postWarrantyYears * annualSpares;

  // Consumables (e.g. 15 scans/day * 300 days = 4500 tests/yr)
  const testsPerYear = 4500;
  const costPerTest = c.consumablesCostPerTest || 0;
  const totalConsumables = costPerTest * testsPerYear * periodYears;

  const totalLifecycleCost = acquisition + sitePrep + totalMaintenance + totalSpares + totalConsumables;

  const missingDataWarnings: string[] = [];
  if (!c.cmcAnnualAmount && !c.cmcAnnualPercent) {
    missingDataWarnings.push('Vendor did not commit post-warranty CMC pricing (assumed ₹0 - incomplete TCO)');
  }
  if (!c.highValueSparesEstAnnual) {
    missingDataWarnings.push('High-value replacement parts schedule unstated (TCO requires inquiry)');
  }
  if (!c.consumablesCostPerTest) {
    missingDataWarnings.push('Consumables cost per use unquoted');
  }

  return {
    periodYears,
    quoteId: quote.id,
    vendorName: quote.vendorName,
    acquisitionLanded: acquisition,
    sitePrepMEP: sitePrep,
    postWarrantyMaintenanceTotal: totalMaintenance,
    estimatedSparesTotal: totalSpares,
    estimatedConsumablesTotal: totalConsumables,
    totalLifecycleCost,
    missingDataWarnings
  };
}
