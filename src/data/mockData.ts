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
    title: "Concept & Feasibility",
    category: "Feasibility & Strategy",
    summary: "Healthcare demand assessment, catchment demographics study, clinical specialty mix planning, and project financial viability modeling.",
    keyDeliverables: ["Market Demand & Catchment Study", "Clinical Specialty Mix Matrix", "Bed Requirement Projections", "10-Year Financial Model & ROI"],
    checklist: [
      "Analyze 15 km primary and secondary catchment demographics and disease profiles",
      "Survey existing public and private hospital bed availability and occupancy rates",
      "Determine core clinical specialties (Cardiac, Ortho, Neuro, Mother & Child, Oncology)",
      "Formulate 10-year Capex, Opex, and operational breakeven projections"
    ],
    typicalTimeline: "1 - 2 Months",
    keyStakeholders: ["Hospital Promoters", "Healthcare Feasibility Consultants", "Financial Analysts"]
  },
  {
    stageNumber: 2,
    title: "Funding",
    category: "Capital & Project Finance",
    summary: "Structuring promoter equity, senior debt term loans, institutional investor partnerships, subsidies, and credit syndication.",
    keyDeliverables: ["Detailed Project Report (DPR)", "Techno-Economic Viability (TEV) Report", "Bank Loan Sanction Letter", "Escrow & Disbursement Schedule"],
    checklist: [
      "Prepare comprehensive DPR and TEV assessment report for commercial lenders",
      "Negotiate moratorium period covering construction plus initial 6 months of operations",
      "Structure optimal debt-to-equity ratio (typically 65:35 or 70:30) with lead banks",
      "Secure state industrial capital investment subsidies and project escrow accounts"
    ],
    typicalTimeline: "2 - 4 Months",
    keyStakeholders: ["Investment Bankers", "Commercial Bank Lenders", "CFO & Financial Advisors"]
  },
  {
    stageNumber: 3,
    title: "Land / Building Identification",
    category: "Real Estate & Site Due Diligence",
    summary: "Selecting strategic land parcel or building structure for healthcare conversion, verifying clear titles, road accessibility, and zoning bylaws.",
    keyDeliverables: ["Title Clearance Certificate", "Zoning Clearance / CLU (Change of Land Use)", "Topographical & Soil Testing Report", "Building Structural Audit (for Brownfield)"],
    checklist: [
      "Verify minimum road frontage width (typically 12m - 18m+) for fire tender movement",
      "Confirm institutional / non-agricultural (NA) zoning and municipal master plan compliance",
      "Conduct geo-technical soil bearing capacity and groundwater table testing",
      "Assess municipal water supply, HT electrical grid proximity, and sewage outfall connection"
    ],
    typicalTimeline: "2 - 4 Months",
    keyStakeholders: ["Legal Advisors", "Civil Surveyors", "Local Municipal Authorities", "Real Estate Partners"]
  },
  {
    stageNumber: 4,
    title: "Architecture & Designs",
    category: "Hospital Architecture & Space Planning",
    summary: "Developing clinical departmental zoning, patient and visitor circulation flows, AERB radiation bunkers, clean/dirty segregation, and 3D architectural schematics.",
    keyDeliverables: ["Master Concept Layout", "Departmental Space Allocation Schedule", "AERB / Radiation Safety Shielding Layout", "3D Architectural & BIM Renderings"],
    checklist: [
      "Establish strict segregation for patient, visitor, emergency ambulance, and mortuary flows",
      "Separate sterile and contaminated corridor traffic across CSSD, Operating Theatres, and Laundry",
      "Design AERB-compliant concrete shielded bunkers for Cath Lab, CT Scan, MRI, and LINAC",
      "Optimize bed-to-square-foot ratios (typically 650 - 1,000 sq ft per bed for multispecialty)"
    ],
    typicalTimeline: "3 - 5 Months",
    keyStakeholders: ["Healthcare Architects", "Clinical Facility Planners", "Structural Engineers"]
  },
  {
    stageNumber: 5,
    title: "Statutory Approvals",
    category: "Statutory Licensing & Compliance",
    summary: "Securing mandatory municipal building sanctions, environmental clearances, provisional fire department NOCs, and atomic energy site approvals.",
    keyDeliverables: ["Municipal Building Plan Sanction", "State Pollution Control Board CTE (Consent to Establish)", "Provisional Fire Department NOC", "AERB Site Clearance"],
    checklist: [
      "Submit architectural drawings for municipal building sanction and Floor Area Ratio (FAR) approval",
      "Obtain State Pollution Control Board CTE for dedicated Effluent and Sewage Treatment Plants (ETP/STP)",
      "Procure provisional Fire Safety NOC confirming setback distances, staircase widths, and refuge areas",
      "Secure AERB clearance for radiodiagnostic room layouts and bunker structural shielding"
    ],
    typicalTimeline: "3 - 6 Months",
    keyStakeholders: ["Liaison Officers", "Environmental Consultants", "Fire Safety Advisors", "Municipal Authorities"]
  },
  {
    stageNumber: 6,
    title: "Civil Constructions",
    category: "Civil Construction & Structural Engineering",
    summary: "Execution of reinforced concrete cement (RCC) structural shell, vibration dampening foundations, specialized waterproofing, and heavy equipment floor slabs.",
    keyDeliverables: ["Civil Bill of Quantities (BOQ)", "Structural RCC Milestones & Certifications", "Third-Party QA / Cube Testing Logs", "Specialized Waterproofing Warranties"],
    checklist: [
      "Ensure generous floor-to-floor heights (minimum 4.2m - 4.5m) to accommodate MEP ducting and ceiling pendants",
      "Cast vibration-isolated foundations and heavy reinforced floor slabs for MRI and CT scanners",
      "Execute specialized crystalline waterproofing for basements, wet areas, and terraces",
      "Perform routine concrete cube compression testing and independent third-party QA audits"
    ],
    typicalTimeline: "12 - 18 Months",
    keyStakeholders: ["Civil Contractors", "Project Management Consultants (PMC)", "Structural Engineers"]
  },
  {
    stageNumber: 7,
    title: "MEP / Engineering",
    category: "MEP, HVAC & Critical Utilities",
    summary: "Engineering precision HVAC with laminar airflow and HEPA filtration, electrical substations with dual DG backup, plumbing, and Medical Gas Pipeline Systems (MGPS).",
    keyDeliverables: ["MEP Detailed Engineering Schematics", "HVAC Air Flow & Pressure Gradient Balance Plan", "Electrical Single Line Diagram (SLD) & DG Redundancy Plan", "MGPS Master Layout & Gas Plant Specification"],
    checklist: [
      "Implement positive pressure in Operating Theatres and negative pressure in infectious isolation wards",
      "Install minimum 20 - 25 air changes per hour (ACH) with 99.97% HEPA filters in modular OTs",
      "Deploy dual redundant diesel generator backup with seamless N+1 online UPS for life-support circuits",
      "Install medical-grade degreased copper MGPS pipelines, Liquid Medical Oxygen (LMO) bulk tank, and digital alarms"
    ],
    typicalTimeline: "6 - 9 Months",
    keyStakeholders: ["MEP Consultants", "HVAC Contractors", "Electrical Engineers", "MGPS Specialists"]
  },
  {
    stageNumber: 8,
    title: "Interiors",
    category: "Hospital Interiors & Healing Architecture",
    summary: "Designing anti-microbial healthcare interior finishes, acoustic ceiling systems, anti-static conductive vinyl flooring, wall crash guards, and patient-centric healing environments.",
    keyDeliverables: ["Interior Finishes Schedule", "Signage & Wayfinding Masterplan", "Acoustic & Lighting Design Plan", "Modular Wall Paneling Specifications"],
    checklist: [
      "Install seamless, anti-microbial, anti-static conductive vinyl flooring with coved skirting in OTs & ICUs",
      "Apply heavy-duty PVC crash rails, corner guards, and handrails along patient corridors",
      "Implement circadian rhythm LED lighting and acoustic ceiling tiles for sound dampening in patient rooms",
      "Design bilingual, high-contrast, universally accessible signage and digital wayfinding"
    ],
    typicalTimeline: "3 - 5 Months",
    keyStakeholders: ["Healthcare Interior Designers", "Modular Wall Specialists", "Wayfinding & Signage Vendors"]
  },
  {
    stageNumber: 9,
    title: "IT and Softwares",
    category: "Digital Healthcare & IT Systems",
    summary: "Deployment of Hospital Information System (HIS), Electronic Medical Records (EMR), Enterprise PACS imaging archives, LIMS pathology integration, and ABDM compliance.",
    keyDeliverables: ["HIS / EMR System Architecture Blueprint", "PACS & DICOM Server Specification", "ABDM / Ayushman Bharat Milestone 1-3 Certification", "Network & Cybersecurity Audit Report"],
    checklist: [
      "Deploy core HIS modules: OPD registration, IPD billing, nursing workbenches, pharmacy inventory, and OT scheduling",
      "Integrate Enterprise PACS with diagnostic radiological workstations and zero-footprint web viewers",
      "Achieve ABDM (Ayushman Bharat Digital Mission) compliance for ABHA creation and digital health records exchange",
      "Set up structured fiber network cabling, Wi-Fi 6 access points, firewall cybersecurity, and automated data backups"
    ],
    typicalTimeline: "3 - 6 Months",
    keyStakeholders: ["HIS Software Vendors", "Chief Information Officer (CIO)", "PACS & Network Engineers"]
  },
  {
    stageNumber: 10,
    title: "Equipment Procurement",
    category: "Medical Technology & Life Support",
    summary: "Specification, comparative tender evaluation, vendor negotiation, and turnkey commissioning of diagnostic imaging, surgical consoles, and life-support assets.",
    keyDeliverables: ["Room-by-Room Medical Equipment Master Schedule", "Vendor Tender Comparative Matrix", "Turnkey Installation & Uptime SLA Contracts", "5-Year Comprehensive Maintenance Contracts (CMC)"],
    checklist: [
      "Procure heavy imaging modalities (MRI, CT Scanner, Cath Lab, Digital X-Ray, Color Doppler Ultrasound)",
      "Equip ICU suites with multi-parameter monitors, invasive ventilators, syringe pumps, and defibrillators",
      "Outfit Operating Theatres with anesthesia workstations, LED surgical lights, electro-cautery, and laparoscopy towers",
      "Negotiate 5-year warranty + 5-year CMC contracts with guaranteed uptime (>98%) and penalty clauses"
    ],
    typicalTimeline: "4 - 8 Months",
    keyStakeholders: ["Biomedical Equipment Vendors", "Procurement Advisory Committee", "Clinical Specialists"]
  },
  {
    stageNumber: 11,
    title: "Recruitment",
    category: "Clinical & Administrative Talent",
    summary: "Talent acquisition for medical leadership, department heads, senior consultants, resident medical officers (RMOs), nursing teams, and hospital administrative staff.",
    keyDeliverables: ["Organization Structure & Manpower Budget", "Doctor Credentialing & Privileging Matrix", "Standard Operating Procedures (SOPs)", "Staff Training & Code Blue Certification Logs"],
    checklist: [
      "Recruit Chief of Medical Services, Nursing Superintendent, and Head of Hospital Operations",
      "Contract senior clinical specialists across OPD/IPD with defined fee-for-service or minimum guarantee structures",
      "Hire licensed nursing cadres maintaining 1:1 nurse-to-patient ratio in ICU and 1:4 in inpatient wards",
      "Conduct comprehensive hospital orientation covering BLS/ACLS protocols, fire safety drills, and patient etiquette"
    ],
    typicalTimeline: "3 - 6 Months",
    keyStakeholders: ["Healthcare HR Consultants", "Medical Director", "Nursing Superintendent", "Department Heads"]
  },
  {
    stageNumber: 12,
    title: "Pre-Opening / Commissioning",
    category: "Testing, Commissioning & Dry Runs",
    summary: "End-to-end rehearsal of emergency trauma reception, patient journeys, medical equipment calibration, statutory operating licenses, and soft-launch trial operations.",
    keyDeliverables: ["Clinical Establishment Act Registration", "Final Fire Safety Certificate", "State Pollution Control Board CTO (Consent to Operate)", "Dry Run & Simulation Audit Report"],
    checklist: [
      "Secure Clinical Establishments Act registration from the district health authorities",
      "Procure final Fire Safety Certificate, Atomic Energy AERB operating licenses, and Retail/Bulk Pharmacy licenses",
      "Conduct sterile particle count validation in OTs to confirm ISO 14644 Class 5/7 cleanroom standards",
      "Execute mock emergency drills (Code Blue, Code Red, disaster response) and full clinical patient flow dry runs"
    ],
    typicalTimeline: "1 - 3 Months",
    keyStakeholders: ["Medical Superintendent", "Quality & Infection Control Team", "Statutory Compliance Officers"]
  },
  {
    stageNumber: 13,
    title: "Branding / Marketing",
    category: "Marketing, Outreach & Community Connect",
    summary: "Building hospital brand identity, public awareness campaigns, physician referral outreach, corporate empanelment, and community health camp launches.",
    keyDeliverables: ["Brand Identity & Visual Guidelines", "Hospital Website & Patient Mobile App", "Corporate & TPA Empanelment Dossiers", "Catchment Outreach & CME Program Calendar"],
    checklist: [
      "Design unified hospital signage, brand collaterals, digital website, and appointment booking portal",
      "Organize Continuing Medical Education (CME) seminars and outreach meetings with local general practitioners",
      "Submit empanelment applications to key health insurance TPAs, private corporates, and Government schemes",
      "Launch pre-opening community health checkup camps and specialty clinic awareness initiatives"
    ],
    typicalTimeline: "2 - 4 Months",
    keyStakeholders: ["Healthcare Marketing Agency", "Public Relations Officer", "Corporate Empanelment Head"]
  },
  {
    stageNumber: 14,
    title: "Post Opening Operations",
    category: "Operations, Clinical Audits & NABH Journey",
    summary: "Day-to-day inpatient and outpatient workflow management, clinical quality indicator tracking, patient feedback systems, and NABH accreditation initiation.",
    keyDeliverables: ["Daily Hospital Operations Dashboard (Occupancy, ALOS, ARPOB)", "Patient Satisfaction (CSAT/NPS) Reports", "Clinical Indicator Dashboard", "NABH Pre-Entry Assessment Dossier"],
    checklist: [
      "Track daily key performance metrics: Average Length of Stay (ALOS), Bed Occupancy Rate, and Emergency wait times",
      "Monitor mandatory clinical quality indicators: hospital-acquired infection (HAI) rates, surgical site infections, medication errors",
      "Implement digital patient feedback kiosks and grievance redressal workflows",
      "Initiate preparation and documentation for NABH Pre-Entry Level or Full Hospital Accreditation"
    ],
    typicalTimeline: "Ongoing (First 6 - 12 Months)",
    keyStakeholders: ["Hospital CEO / COO", "Quality Assurance Manager", "NABH Consultants", "Department Heads"]
  },
  {
    stageNumber: 15,
    title: "Maintenance / AMC",
    category: "Facility Management & Equipment AMC",
    summary: "Long-term facility preventive maintenance, Annual Maintenance Contracts (AMC/CMC) for biomedical and MEP assets, equipment recalibration, and infrastructure upkeep.",
    keyDeliverables: ["Comprehensive AMC / CMC Register", "Planned Preventive Maintenance (PPM) Schedule", "Biomedical Equipment Calibration Certificates", "Facility Safety Audit Reports"],
    checklist: [
      "Maintain unified register of all active warranties, AMCs, and Comprehensive Maintenance Contracts (CMCs)",
      "Enforce strict Planned Preventive Maintenance (PPM) calendars for HVAC chillers, DGs, elevators, and MGPS manifolds",
      "Conduct periodic biomedical calibration, electrical safety testing, and radiation survey audits",
      "Establish 24/7 facility engineering emergency breakdown response protocols with guaranteed SLAs"
    ],
    typicalTimeline: "Ongoing Lifecycle Management",
    keyStakeholders: ["Head of Facility & Engineering", "Biomedical Engineering Team", "Equipment AMC Vendors", "Safety Officers"]
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
    featuredProject: "150-bed Superspecialty Cardiac Institute, Navi Mumbai",
    clientPortfolio: ["Kokilaben Ambani Affiliate", "Jupiter Hospital Wing", "Sahyadri Specialty Clinic", "Lilavati Cardiac Annexe"],
    gstin: "27AAACM4821K1Z5",
    priceRange: "₹180 - ₹350 / sq. ft (Consultancy & Arch)",
    turnaroundTime: "30 - 45 Days Concept Blueprint",
    certifications: ["Council of Architecture (CoA)", "IGBC Green Healthcare Fellow", "AERB Qualified Planner"],
    headquartersAddress: "Suite 402, Signature Towers, BKC, Bandra East, Mumbai, MH 400051",
    complianceBadges: ["AERB Compliant Layouts", "NABH Standard Arch", "IGBC Gold Certified"]
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
    featuredProject: "300-bed Multispecialty Hospital, Gurugram",
    clientPortfolio: ["Max Healthcare Group Partner", "Fortis Escorts Expansion", "Medanta Sister Trust", "Sarvodaya Hospital"],
    gstin: "07AAHCA9920F1ZX",
    priceRange: "Milestone-linked (₹15L - ₹45L per DPR & Launch)",
    turnaroundTime: "60 Days Comprehensive DPR & TEV",
    certifications: ["QCI Certified Consultant", "NABH Empanelled Advisor", "ICRA Hospital Rating Valuer"],
    headquartersAddress: "Tower B, 9th Floor, Cyber City, DLF Phase 2, Gurugram, HR 122002",
    complianceBadges: ["Bankable TEV Reports", "NABH 5th Edition Ready", "ABHA Gateway Partner"]
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
    featuredProject: "Central MGPS & 8 Modular OTs for Regional Cancer Centre",
    clientPortfolio: ["Manipal Hospitals", "Aster CMI Hospital", "Narayana Health City", "KIMS Hyderabad"],
    gstin: "29AABCA7732D1Z8",
    priceRange: "₹28 Lakhs - ₹75 Lakhs per Modular OT Suite",
    turnaroundTime: "4 - 6 Weeks On-Site Commissioning",
    certifications: ["ISO 13485:2016", "CE 0123 Certified", "HTM 02-01 Standards", "Class 100 Laminar Cleanroom"],
    headquartersAddress: "Plot 84-B, Peenya Industrial Area Phase III, Bengaluru, KA 560058",
    complianceBadges: ["NFPA 99 Compliant", "ISO 14644 Class 5 OT", "PESO Approved Vessel"]
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
    featuredProject: "Enterprise HIS deployment across 4-unit hospital network",
    clientPortfolio: ["Yashoda Hospitals", "Care Hospitals Group", "Rainbow Children's Hospital", "Medicover India"],
    gstin: "36AAACS4102N1Z4",
    priceRange: "₹1,200 - ₹2,500 / bed / month (or One-Time Enterprise License)",
    turnaroundTime: "2 - 3 Weeks Go-Live Deployment",
    certifications: ["ABDM Certified M1, M2 & M3", "HL7 FHIR compliant", "HIPAA Security Audited", "ISO 27001:2022"],
    headquartersAddress: "Floor 5, Mindspace IT Park, HITEC City, Hyderabad, TG 500081",
    complianceBadges: ["ABHA Direct Gateway", "NDHM Certified", "DICOM 3.0 Ready"]
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
    featuredProject: "Fast-track NABH 5th edition compliance for 200-bed hospital",
    clientPortfolio: ["Apollo Reach Hospitals", "Kauvery Hospital", "MIOT International", "Gleneagles Global"],
    gstin: "33AAATQ5829H1Z2",
    priceRange: "₹3.5L - ₹8.5L (Full NABH Journey Mentorship)",
    turnaroundTime: "4 - 6 Months End-to-End Handholding",
    certifications: ["NABH Empanelled Lead Assessor", "QCI Accredited Body", "Six Sigma Black Belt Healthcare"],
    headquartersAddress: "Old No 48, New No 112, Anna Salai, Guindy, Chennai, TN 600032",
    complianceBadges: ["100% First-Pass NABH", "NABH 5th Edition Ready", "ISQua Member"]
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
    featuredProject: "Turnkey diagnostic radiology wing setup in Tier-2 city",
    clientPortfolio: ["BLK-Max Super Specialty", "Artemis Hospital", "Metro Heart Institute", "Narayana Superspecialty"],
    gstin: "07AABCV8941P1ZW",
    priceRange: "₹45L - ₹3.8 Cr (Turnkey Radiology Wing Solutions)",
    turnaroundTime: "30 Days Delivery & Lead Bunker Installation",
    certifications: ["AERB Type Approved", "ISO 9001:2015", "FDA / CE Cleared Modalities"],
    headquartersAddress: "Okhla Industrial Area, Phase II, New Delhi, DL 110020",
    complianceBadges: ["AERB Certified Equipment", "24x7 AMC Network", "Cold-Head Helium Service"]
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
    featuredProject: "Fast-track 250-bed general hospital delivered in 14 months",
    clientPortfolio: ["Ruby Hall Clinic Expansion", "Deenanath Mangeshkar Hospital", "Jehangir Hospital", "Symbiosis University Hospital"],
    gstin: "27AALCS9940L1Z9",
    priceRange: "₹2,200 - ₹3,800 / sq. ft Built-up EPC Area",
    turnaroundTime: "12 - 18 Months Turnkey Delivery",
    certifications: ["Class 1 PWD Contractor", "ISO 14001 & 45001", "LEED AP Certified Builder"],
    headquartersAddress: "ICC Trade Tower, Senapati Bapat Road, Pune, MH 411016",
    complianceBadges: ["AERB Shielding Audit Pass", "Seismic Zone IV Compliant", "NFPA Fire Certified"]
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
    featuredProject: "₹85 Cr project term loan syndication for oncology center",
    clientPortfolio: ["Peerless Hospital Sister Group", "AMRI Hospitals Syndicate", "Medica Superspecialty Trust", "Mission Hospital Durgapur"],
    gstin: "19AABCC6654G1Z3",
    priceRange: "Success-fee linked (1.0% - 2.5% of Syndicated Capex)",
    turnaroundTime: "45 Days Term Sheet Sanction",
    certifications: ["SEBI Registered Cat-1 Merchant Banker Partner", "Insolvency & Valuation Council Member"],
    headquartersAddress: "Chowringhee Road, Kolkata, WB 700071",
    complianceBadges: ["SBI / PNB / HDFC Empanelled", "TEV Viability Certified", "Govt Subsidy Specialist"]
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
