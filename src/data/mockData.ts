import { StageItem, DirectoryItem, HowItWorksStep } from '../types';

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    number: 1,
    title: "Tell us what you need",
    subtitle: "Share your project requirements",
    details: "Define your hospital location, proposed bed count, project stage, and the specific expertise or equipment you need.",
    actionText: "Post Requirement"
  },
  {
    number: 2,
    title: "Discover",
    subtitle: "Find relevant vendors and advisors",
    details: "Explore vetted hospital planners, architects, MEP engineers, equipment manufacturers, and healthcare consultants serving your region.",
    actionText: "Search Directory"
  },
  {
    number: 3,
    title: "Understand",
    subtitle: "Compare profiles, solutions and insights",
    details: "Evaluate verified track records, past hospital projects completed, regulatory compliance experience, and portfolio brochures.",
    actionText: "Compare Profiles"
  },
  {
    number: 4,
    title: "Connect",
    subtitle: "Start conversations and collaborate",
    details: "Directly message or book consultations with decision-makers without intermediaries or opaque broker markups.",
    actionText: "Direct Connect"
  },
  {
    number: 5,
    title: "Move project forward",
    subtitle: "Turn ideas into hospitals",
    details: "Coordinate milestones seamlessly across statutory approvals, civil construction, equipment installation, and NABH accreditation.",
    actionText: "Track Milestones"
  }
];

export const TOOLKIT_15_STAGES: StageItem[] = [
  {
    stageNumber: 1,
    title: "Concept & Market Feasibility",
    category: "Feasibility & Strategy",
    summary: "Identify healthcare catchment area demographics, competitor analysis, bed requirement projections, and financial viability model.",
    keyDeliverables: ["Market Demand Survey", "Catchment Demographics Study", "Clinical Speciality Mix Matrix", "Financial Projections & ROI"],
    checklist: [
      "Analyze 15 km primary and secondary catchment demographics",
      "Survey existing public & private hospital bed availability",
      "Determine core clinical specialties (Cardio, Onco, Ortho, Mother & Child)",
      "Prepare 10-year financial model with Capex/Opex estimates"
    ],
    typicalTimeline: "1 - 2 Months",
    keyStakeholders: ["Hospital Promoters", "Healthcare Feasibility Consultants", "Financial Analysts"]
  },
  {
    stageNumber: 2,
    title: "Land Acquisition & Zoning Due Diligence",
    category: "Real Estate & Zoning",
    summary: "Selecting strategic land parcels, verifying clear titles, road accessibility, and healthcare municipal zoning bylaws.",
    keyDeliverables: ["Title Clearance Certificate", "Zoning Clearance / CLU (Change of Land Use)", "Topographical & Soil Testing Report"],
    checklist: [
      "Ensure minimum road width for fire tender movement (typically 12m - 18m+)",
      "Verify non-agricultural (NA) and institutional zoning permissions",
      "Conduct geo-technical soil bearing capacity and water table testing",
      "Check municipal water, electrical substation, and drainage connectivity"
    ],
    typicalTimeline: "2 - 4 Months",
    keyStakeholders: ["Legal Advisors", "Civil Surveyors", "Local Municipal Authorities"]
  },
  {
    stageNumber: 3,
    title: "Architecture & Healthcare Facility Planning",
    category: "Design & Master Planning",
    summary: "Creating functional departmental layouts, infection-control zoning, patient flow separation, and AERB-compliant bunkers.",
    keyDeliverables: ["Master Concept Layout", "Departmental Space Allocation Schedule", "AERB / Radiation Safety Layout", "3D Architectural Renderings"],
    checklist: [
      "Separate clean and dirty corridors (CSSD, OT, Laundry, Waste)",
      "Establish segregated patient, visitor, ambulance, and mortuary flows",
      "Design AERB-compliant shielded bunker layouts for Cath Lab, CT, MRI, Linac",
      "Optimize bed-to-square-foot ratios (typically 650 - 1000 sq ft per bed)"
    ],
    typicalTimeline: "3 - 5 Months",
    keyStakeholders: ["Hospital Architects", "Clinical Planners", "Structural Engineers"]
  },
  {
    stageNumber: 4,
    title: "Statutory & Environmental Approvals",
    category: "Regulatory & Compliance",
    summary: "Securing mandatory central, state, and local licenses before and during construction commencement.",
    keyDeliverables: ["Building Plan Sanction", "State Pollution Control Board CTE (Consent to Establish)", "Fire Department Provisional NOC", "AERB Site Clearance"],
    checklist: [
      "Submit municipal building permit sanction with fire safety drawings",
      "Obtain State Pollution Control Board CTE for ETP/STP design",
      "Procure provisional Fire Safety NOC including setback and staircase widths",
      "Apply for environmental clearance if built-up area exceeds statutory threshold"
    ],
    typicalTimeline: "3 - 6 Months",
    keyStakeholders: ["Liaison Officers", "Environmental Consultants", "Statutory Advisors"]
  },
  {
    stageNumber: 5,
    title: "Project Financing & Capital Structuring",
    category: "Finance & Banking",
    summary: "Structuring promoter equity, senior debt term loans, subsidies, and managing multi-tranche lender drawdowns.",
    keyDeliverables: ["Detailed Project Report (DPR)", "Bank Loan Sanction Letter", "Escrow & Disbursement Schedule"],
    checklist: [
      "Finalize TEV (Techno-Economic Viability) assessment report",
      "Negotiate moratorium period covering construction and initial 6 months ops",
      "Structure equipment lease financing versus direct capital purchase",
      "Set up project debt monitoring and statutory escrow accounts"
    ],
    typicalTimeline: "2 - 4 Months",
    keyStakeholders: ["Investment Bankers", "Commercial Bank Lenders", "CFO & Finance Advisors"]
  },
  {
    stageNumber: 6,
    title: "Civil Construction & Structural Engineering",
    category: "Construction & Civil",
    summary: "Execution of structural shell, seismic load balancing, waterproofing, and heavy equipment slab reinforcement.",
    keyDeliverables: ["BOQ (Bill of Quantities)", "Structural RCC Milestones", "Quality Inspection Reports"],
    checklist: [
      "Enforce vibration dampening foundations for radiology equipment",
      "Ensure proper floor-to-floor heights (minimum 4.2m - 4.5m for OT/MEP ducting)",
      "Execute specialized waterproofing for basements, wet areas, and terraces",
      "Conduct regular concrete cube compression tests and third-party QA"
    ],
    typicalTimeline: "12 - 18 Months",
    keyStakeholders: ["Civil Contractors", "Project Management Consultants (PMC)", "Structural Engineers"]
  },
  {
    stageNumber: 7,
    title: "MEP, HVAC & Infection Control Air Handling",
    category: "MEP Engineering",
    summary: "Engineering precision HVAC with laminar airflow, HEPA filtration, differential pressure gradients, and backup power grids.",
    keyDeliverables: ["MEP Detailed Engineering Drawings", "HVAC Air Balance Schematics", "Electrical SLD & DG Redundancy Plan"],
    checklist: [
      "Implement positive pressure in OTs / ICUs and negative pressure in Isolation wards",
      "Install minimum 20 - 25 air changes per hour (ACH) in Modular Operating Theatres",
      "Deploy dual redundant DG power backup with N+1 UPS for life-support systems",
      "Install specialized earthing grids for cath labs and surgical consoles"
    ],
    typicalTimeline: "6 - 9 Months",
    keyStakeholders: ["MEP Consultants", "HVAC Contractors", "Electrical Engineers"]
  },
  {
    stageNumber: 8,
    title: "Medical Gas Pipeline System (MGPS)",
    category: "Specialized Infrastructure",
    summary: "Designing HTM 02-01 / NFPA 99 compliant central medical gas plant, copper distribution manifolds, and emergency shutoff valves.",
    keyDeliverables: ["MGPS Master Layout", "Liquid Medical Oxygen (LMO) Storage Tank Plan", "Gas Flow Pressure Validation Report"],
    checklist: [
      "Install bulk cryogenic Liquid Medical Oxygen (LMO) tank + 2x cylinder manifold backups",
      "Ensure medical vacuum, compressed air (4 bar / 7 bar), and nitrous oxide piping",
      "Place area alarm panels and master emergency shutoff valves outside ICU/OTs",
      "Perform degreased medical-grade copper pipe hydrostatic and leak testing"
    ],
    typicalTimeline: "3 - 5 Months",
    keyStakeholders: ["MGPS Specialists", "Safety Officers", "Biomedical Engineers"]
  },
  {
    stageNumber: 9,
    title: "Modular Operation Theatres & ICU Setup",
    category: "Specialized Healthcare Areas",
    summary: "Fabrication of seamless anti-microbial wall panels, surgical pendants, laminar air ceilings, and hermetic sliding doors.",
    keyDeliverables: ["OT Modular Wall & Ceiling Layout", "Surgical Pendant Integration Plan", "Cleanroom Air Velocity Report"],
    checklist: [
      "Install antimicrobial anti-static conductive vinyl flooring (<10^6 ohms)",
      "Set up stainless steel / powder-coated GI modular antibacterial wall paneling",
      "Install motorized ceiling pendants for anesthesia, surgical monitors, and gas supply",
      "Ensure touchless hermetic automatic sliding lead-lined radiation doors"
    ],
    typicalTimeline: "3 - 4 Months",
    keyStakeholders: ["Modular OT Vendors", "Infection Control Officers", "Chief Surgeon Advisory"]
  },
  {
    stageNumber: 10,
    title: "Medical Equipment Planning & Procurement",
    category: "Medical Technology",
    summary: "Specification, tender evaluation, negotiation, warranty structuring, and turnkey installation of diagnostic and life-support assets.",
    keyDeliverables: ["Medical Equipment Master Schedule (Room-by-Room)", "Vendor Tender Comparative Matrix", "CMC/AMC Service Contracts"],
    checklist: [
      "Schedule procurement for heavy diagnostics (MRI, CT, Cath Lab, X-Ray, Ultrasound)",
      "Procure ICU monitors, ventilators, defibrillators, anesthesia workstations",
      "Negotiate comprehensive 5-year warranty + 5-year CMC uptime commitments (>98%)",
      "Verify power supply conditioning, RF cages, and chiller requirements"
    ],
    typicalTimeline: "4 - 8 Months",
    keyStakeholders: ["Biomedical Equipment Vendors", "Procurement Committee", "Radiologists / Specialists"]
  },
  {
    stageNumber: 11,
    title: "Healthcare IT, HIS, EMR & Digital Infrastructure",
    category: "Digital Healthcare",
    summary: "Implementation of Hospital Information System (HIS), PACS imaging archive, LIMS pathology integration, and ABHA/NDHM compliance.",
    keyDeliverables: ["HIS System Architecture Blueprint", "PACS & DICOM Server Specification", "ABHA / ABDM Milestone Certification"],
    checklist: [
      "Deploy core HIS modules: OPD registration, IPD billing, nursing station, pharmacy",
      "Integrate Enterprise PACS with diagnostic workstations and web-based DICOM viewers",
      "Ensure ABDM (Ayushman Bharat Digital Mission) M1/M2/M3 compliance and ABDM gateway",
      "Implement structured network cabling, Wi-Fi 6 access points, and server failover"
    ],
    typicalTimeline: "3 - 6 Months",
    keyStakeholders: ["HIS Software Vendors", "Chief Information Officer", "PACS Engineers"]
  },
  {
    stageNumber: 12,
    title: "Clinical & Non-Clinical Talent Recruitment",
    category: "Human Resources",
    summary: "Hiring department heads, senior consultants, resident medical officers (RMOs), nursing superintendents, and administrative teams.",
    keyDeliverables: ["Organization Structure & Manpower Budget", "Standard Operating Procedures (SOPs)", "Doctor Credentialing & Privileging Matrix"],
    checklist: [
      "Recruit Chief of Medical Services, Nursing Superintendent, and Head of Operations",
      "Establish full-time vs visiting consultant revenue-sharing and guarantee contracts",
      "Recruit licensed nursing staff maintaining 1:1 ICU and 1:4 ward nurse-patient ratio",
      "Conduct BLS/ACLS training, code blue drills, and patient safety orientation"
    ],
    typicalTimeline: "3 - 6 Months",
    keyStakeholders: ["Healthcare HR Consultants", "Medical Director", "Nursing Head"]
  },
  {
    stageNumber: 13,
    title: "Licensing, Statutory Registrations & Final NOCs",
    category: "Operational Legalities",
    summary: "Securing operational licenses including Clinical Establishments Act registration, final Fire NOC, Pharmacy license, and AERB operating license.",
    keyDeliverables: ["Clinical Establishment Registration Certificate", "Final Fire Safety Certificate", "State Pollution Control Board CTO (Consent to Operate)", "Retail & Bulk Drug Licenses"],
    checklist: [
      "Secure Clinical Establishment Act registration from district health authorities",
      "Obtain AERB operating license (RSO certification & TLD badge clearance)",
      "Secure Drug Control Dept license for in-house retail and IPD pharmacy",
      "Procure Bio-Medical Waste Management authorization and barcoded bag manifest"
    ],
    typicalTimeline: "2 - 4 Months",
    keyStakeholders: ["Hospital Administrator", "Legal Compliance Officer", "District Health Officials"]
  },
  {
    stageNumber: 14,
    title: "Dry Runs, Simulation Drills & Soft Launch",
    category: "Quality & Testing",
    summary: "End-to-end rehearsal of patient journey, emergency trauma reception, disaster mock drills, and electrical load testing.",
    keyDeliverables: ["Dry Run Audit Report", "Emergency Simulation Log", "HVAC / OT Validation Certificate"],
    checklist: [
      "Simulate code blue, fire evacuation, and power outage switchover drills",
      "Validate pharmacy inventory batching, pricing barcodes, and insurance TPA desks",
      "Conduct particulate particle count tests in OTs to achieve ISO 14644 Class 5/7",
      "Run mock patient journeys from registration through triage, diagnostics, and discharge"
    ],
    typicalTimeline: "3 - 4 Weeks",
    keyStakeholders: ["Quality Team", "Medical Operations", "Clinical Heads"]
  },
  {
    stageNumber: 15,
    title: "Commercial Launch & NABH / JCI Quality Journey",
    category: "Operations & Accreditation",
    summary: "Grand opening, physician outreach, empaneled corporate/TPA insurance tie-ups, and initiating NABH Pre-Entry Level accreditation.",
    keyDeliverables: ["Commercial Opening Ceremony", "NABH Readiness Assessment", "TPA / Insurance Empanelment Agreements"],
    checklist: [
      "Inaugurate outpatient, diagnostic, emergency, and elective surgery departments",
      "Submit empanelment dossiers to major health insurers and Government schemes",
      "Begin daily monitoring of clinical indicators (infection rates, fall rates, medication errors)",
      "Apply for NABH Pre-Entry or Full Accreditation within 6 - 12 months of operations"
    ],
    typicalTimeline: "Ongoing",
    keyStakeholders: ["Promoters", "Hospital CEO", "NABH Accreditation Consultants"]
  }
];

export const DIRECTORY_DATA: DirectoryItem[] = [
  {
    id: "dir-1",
    name: "MedCraft Hospital Infrastructure & Design",
    role: "advisor",
    category: "Architecture & Design",
    rating: 4.9,
    reviewsCount: 38,
    location: "Mumbai",
    serviceLocations: ["Mumbai", "Pune", "Ahmedabad", "All India"],
    projectStages: ["Planning & Feasibility", "Design & Architecture", "Civil Construction & MEP"],
    productsAndServices: ["Healthcare Master Planning", "AERB Bunker Architecture", "Departmental Space Zoning", "Infection Control Circulation"],
    description: "Specialized healthcare architecture firm with over 45 completed multispecialty hospitals across Western India, focusing on evidence-based green hospital designs.",
    verified: true,
    yearsOfExperience: 18,
    contactEmail: "projects@medcraft-infra.in",
    phone: "+91 22 4982 1100",
    website: "https://www.medcraft-infra.in",
    featuredProject: "150-bed Superspecialty Cardiac Institute, Navi Mumbai"
  },
  {
    id: "dir-2",
    name: "Apex Healthcare Project Advisors",
    role: "advisor",
    category: "Hospital Consulting",
    rating: 4.8,
    reviewsCount: 52,
    location: "Delhi NCR",
    serviceLocations: ["Delhi NCR", "Jaipur", "Chandigarh", "Lucknow", "All India"],
    projectStages: ["Planning & Feasibility", "Statutory Approvals", "Equipment Procurement", "Commissioning & Pre-op"],
    productsAndServices: ["Techno-Economic Feasibility (TEV)", "NABH / JCI Mentorship", "Doctor Revenue Structuring", "Project Management Consulting (PMC)"],
    description: "End-to-end hospital advisory practice leading new greenfield projects and multi-chain bed expansions from idea to profitable operational milestone.",
    verified: true,
    yearsOfExperience: 22,
    contactEmail: "advisory@apexhealthgroup.com",
    phone: "+91 11 4109 8833",
    website: "https://www.apexhealthgroup.com",
    featuredProject: "300-bed Multispecialty Hospital, Gurugram"
  },
  {
    id: "dir-3",
    name: "Aerolife Medical Gas & Cleanroom Systems",
    role: "vendor",
    category: "MEP & HVAC",
    rating: 4.9,
    reviewsCount: 44,
    location: "Bengaluru",
    serviceLocations: ["Bengaluru", "Hyderabad", "Chennai", "Kochi", "All India"],
    projectStages: ["Civil Construction & MEP", "Equipment Procurement", "Commissioning & Pre-op"],
    productsAndServices: ["HTM 02-01 Medical Gas Plants", "Modular OT Laminar Ceilings", "Cryogenic Oxygen Tanks", "HEPA HVAC Air Handling Units"],
    description: "Leading manufacturer and turnkey installer of hospital medical gas pipelines (MGPS) and antimicrobial modular surgical theatre suites.",
    verified: true,
    yearsOfExperience: 16,
    contactEmail: "sales@aerolifemed.com",
    phone: "+91 80 2839 5521",
    website: "https://www.aerolifemed.com",
    featuredProject: "Central MGPS & 8 Modular OTs for Regional Cancer Centre"
  },
  {
    id: "dir-4",
    name: "Synapse HealthTech Solutions",
    role: "vendor",
    category: "Healthcare IT & HIS",
    rating: 4.7,
    reviewsCount: 29,
    location: "Hyderabad",
    serviceLocations: ["Hyderabad", "Bengaluru", "Chennai", "All India"],
    projectStages: ["Equipment Procurement", "Commissioning & Pre-op", "Operational Expansion"],
    productsAndServices: ["Cloud-Native HIS / EMR", "Cloud PACS & DICOM Viewers", "ABDM M1-M3 Integration", "Smart Patient Room Tablets"],
    description: "Modern healthcare IT platform powering over 80 hospitals in South Asia. Zero-downtime microservices architecture with complete paperless workflows.",
    verified: true,
    yearsOfExperience: 11,
    contactEmail: "partners@synapsehealthtech.io",
    phone: "+91 40 6720 9944",
    website: "https://www.synapsehealthtech.io",
    featuredProject: "Enterprise HIS deployment across 4-unit hospital network"
  },
  {
    id: "dir-5",
    name: "QualiCare NABH & Accreditation Consortium",
    role: "advisor",
    category: "Accreditation & Quality / NABH",
    rating: 5.0,
    reviewsCount: 61,
    location: "Chennai",
    serviceLocations: ["Chennai", "Coimbatore", "Bengaluru", "Hyderabad", "All India"],
    projectStages: ["Commissioning & Pre-op", "Operational Expansion"],
    productsAndServices: ["NABH 5th Edition Preparation", "Hospital SOP Frameworks", "Infection Control Audits", "Mock Assessment Drills"],
    description: "100% first-pass rate for hospital NABH and JCI accreditation dossiers. Experienced team of empanelled principal assessors and healthcare auditors.",
    verified: true,
    yearsOfExperience: 15,
    contactEmail: "connect@qualicareaccredit.org",
    phone: "+91 44 2499 1080",
    website: "https://www.qualicareaccredit.org",
    featuredProject: "Fast-track NABH 5th edition compliance for 200-bed hospital"
  },
  {
    id: "dir-6",
    name: "Vanguard Biomedical & Diagnostic Technologies",
    role: "vendor",
    category: "Medical Equipment & Devices",
    rating: 4.8,
    reviewsCount: 35,
    location: "Delhi NCR",
    serviceLocations: ["Delhi NCR", "Kolkata", "Ahmedabad", "Pune", "All India"],
    projectStages: ["Equipment Procurement", "Commissioning & Pre-op", "Operational Expansion"],
    productsAndServices: ["Refurbished & New 1.5T/3T MRI", "128-Slice CT Scanners", "Digital Flat-Panel Cath Labs", "Critical Care Ventilators"],
    description: "Authorized channel partner and turnkey biomedical diagnostic solution provider with dedicated 24/7 field maintenance engineers across India.",
    verified: true,
    yearsOfExperience: 19,
    contactEmail: "sales@vanguardbiomed.com",
    phone: "+91 11 2680 7711",
    website: "https://www.vanguardbiomed.com",
    featuredProject: "Turnkey diagnostic radiology wing setup in Tier-2 city"
  },
  {
    id: "dir-7",
    name: "Shapoorji & Structura Health Build",
    role: "vendor",
    category: "Turnkey Infrastructure & MEP",
    rating: 4.9,
    reviewsCount: 41,
    location: "Pune",
    serviceLocations: ["Pune", "Mumbai", "Hyderabad", "All India"],
    projectStages: ["Civil Construction & MEP", "Commissioning & Pre-op"],
    productsAndServices: ["Turnkey Hospital EPC", "Cleanroom Wall Systems", "ETP/STP Water Recycling Plants", "Radiation Shielding Bunkers"],
    description: "Specialized engineering, procurement, and construction (EPC) contractor executing rapid pre-engineered healthcare buildings and high-spec hospitals.",
    verified: true,
    yearsOfExperience: 25,
    contactEmail: "epc@structurahealth.com",
    phone: "+91 20 2567 4400",
    website: "https://www.structurahealth.com",
    featuredProject: "Fast-track 250-bed general hospital delivered in 14 months"
  },
  {
    id: "dir-8",
    name: "CapitalBridge Healthcare Finance & Valuation",
    role: "advisor",
    category: "Hospital Consulting",
    rating: 4.8,
    reviewsCount: 23,
    location: "Kolkata",
    serviceLocations: ["Kolkata", "Delhi NCR", "Mumbai", "All India"],
    projectStages: ["Planning & Feasibility", "Civil Construction & MEP"],
    productsAndServices: ["Hospital Debt Syndication", "Capex Structured Equipment Lease", "Hospital Valuation & M&A", "Government Subsidy Submissions"],
    description: "Financial advisory boutique dedicated to healthcare promoters, arranging over ₹1,200 Cr in institutional hospital debt and project financing.",
    verified: true,
    yearsOfExperience: 14,
    contactEmail: "inquiry@capitalbridge-hc.com",
    phone: "+91 33 2287 9090",
    website: "https://www.capitalbridge-hc.com",
    featuredProject: "₹85 Cr project term loan syndication for oncology center"
  }
];

export const FUTURE_FEATURES = [
  {
    id: "feat-1",
    title: "Templates & Checklists",
    subtitle: "Ready-to-use resources for hospital projects.",
    description: "Downloadable BOQs, departmental square-footage calculators, equipment procurement checklists, and NABH compliance documents.",
    icon: "FileCheck",
    tag: "Coming Soon",
    details: [
      "Room-by-room architectural area program templates",
      "Medical equipment procurement RFP & tender templates",
      "NABH 5th Edition standard policy & SOP templates",
      "Statutory approval roadmap and tracker spreadsheets"
    ]
  },
  {
    id: "feat-2",
    title: "Project Tools",
    subtitle: "Planning, tracking and collaboration tools.",
    description: "Collaborative Gantt charts, budget tracking milestones, multi-vendor quote comparison tools, and site audit logs.",
    icon: "Wrench",
    tag: "In Development",
    details: [
      "Interactive 15-stage timeline milestone tracker",
      "Multi-vendor quotation comparative matrix",
      "Vendor milestone payment escrow release triggers",
      "Site inspection photographic punch-list tracker"
    ]
  },
  {
    id: "feat-3",
    title: "Case-based Consulting",
    subtitle: "Learn from real projects and case studies.",
    description: "In-depth operational post-mortems, cost saving case studies, HVAC error retrospectives, and hospital breakeven analyses.",
    icon: "Lightbulb",
    tag: "Curated Library",
    details: [
      "How a 120-bed hospital reached operational breakeven in 9 months",
      "Avoiding common MEP pitfalls in laminar air distribution",
      "Optimizing bed-to-OT ratios in surgical daycare facilities",
      "Cost-benefit case study: Buying vs leasing MRI machines"
    ]
  },
  {
    id: "feat-4",
    title: "AI-assisted Hospital Consulting",
    subtitle: "Get AI-powered insights and recommendations.",
    description: "Instant AI assessment of your hospital project stage, estimated Capex range, regulatory prerequisites, and optimal vendor matching.",
    icon: "Cpu",
    tag: "Live Interactive Demo",
    details: [
      "Instant stage readiness assessment based on your project status",
      "Bed capacity to area requirement estimation engine",
      "Custom checklist generation for your specific hospital location",
      "Regulatory and license requirement matrix generator"
    ]
  },
  {
    id: "feat-5",
    title: "Resource Library",
    subtitle: "Guides, research and industry resources.",
    description: "Authoritative repository of healthcare building codes (NBC 2016), AERB radiation rules, NABH guidelines, and healthcare market studies.",
    icon: "BookOpen",
    tag: "Knowledge Base",
    details: [
      "National Building Code (NBC 2016 Part 4) Fire & Life Safety guidelines",
      "Atomic Energy Regulatory Board (AERB) medical diagnostic room layouts",
      "Central Pollution Control Board Bio-medical Waste Rules 2016",
      "State-wise Clinical Establishments Act statutory requirement briefs"
    ]
  }
];
