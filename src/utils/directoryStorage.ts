import { DirectoryItem } from '../types';
import { DIRECTORY_DATA } from '../data/mockData';

const STORAGE_KEY = 'nova_h_directory_listings_v1';

export function getStoredDirectory(): DirectoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Seed with mock data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DIRECTORY_DATA));
      return DIRECTORY_DATA;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DIRECTORY_DATA;
  } catch (e) {
    console.error('Failed to load directory items from storage:', e);
    return DIRECTORY_DATA;
  }
}

export function saveStoredDirectory(items: DirectoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('nova_directory_updated', { detail: items }));

    // Sync to Neon API in background
    if (typeof window !== 'undefined') {
      for (const item of items) {
        fetch('/api/directory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        }).catch(err => console.warn('[Storage] Directory item API sync deferred:', err));
      }
    }
  } catch (e) {
    console.error('Failed to save directory items:', e);
  }
}

// Background API sync helper with Neon PostgreSQL backend
export async function syncDirectoryWithBackend(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch('/api/directory');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('nova_directory_updated', { detail: data }));
      }
    }
  } catch (e) {
    // Offline fallback
  }
}

export interface DirectoryDbStats {
  totalCount: number;
  databaseConfigured: boolean;
  databaseProvider: string;
  lastSyncedAt: string;
}

export async function fetchDirectoryDbStats(): Promise<DirectoryDbStats | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/directory/stats');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Offline or network error
  }
  return null;
}

export interface BulkImportResult {
  success: boolean;
  mode: 'append' | 'replace';
  importedCount: number;
  totalCount: number;
  database: string;
  timestamp: string;
  error?: string;
}

/**
 * Transactional bulk sync of directory items to backend database (/api/directory/bulk)
 * Supports atomic append or replace modes, with cache fallback and event notification.
 */
export async function syncBulkDirectoryToDatabase(
  items: DirectoryItem[],
  mode: 'append' | 'replace'
): Promise<BulkImportResult> {
  try {
    const res = await fetch('/api/directory/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, mode })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${res.status}`);
    }

    const data: BulkImportResult = await res.json();

    // Mirror to client cache
    let updatedLocalList: DirectoryItem[];
    if (mode === 'replace') {
      updatedLocalList = items;
    } else {
      const current = getStoredDirectory();
      const existingIds = new Set(current.map(i => i.id));
      const additions = items.filter(i => !existingIds.has(i.id));
      const incomingMap = new Map(items.map(i => [i.id, i]));
      const updatedExisting = current.map(i => incomingMap.get(i.id) || i);
      updatedLocalList = [...additions, ...updatedExisting];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocalList));
    window.dispatchEvent(new CustomEvent('nova_directory_updated', { detail: updatedLocalList }));

    return data;
  } catch (err: any) {
    console.warn('[Storage] Database bulk sync failed, falling back to local cache persistence:', err);
    // Offline or network failure: preserve data locally
    let updatedLocalList: DirectoryItem[];
    if (mode === 'replace') {
      updatedLocalList = items;
    } else {
      const current = getStoredDirectory();
      const existingIds = new Set(current.map(i => i.id));
      const additions = items.filter(i => !existingIds.has(i.id));
      updatedLocalList = [...additions, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocalList));
    window.dispatchEvent(new CustomEvent('nova_directory_updated', { detail: updatedLocalList }));

    return {
      success: false,
      mode,
      importedCount: items.length,
      totalCount: updatedLocalList.length,
      database: 'Local Storage Fallback (Offline/Deferred)',
      timestamp: new Date().toISOString(),
      error: err.message || 'Database bulk endpoint unreachable'
    };
  }
}

// Auto sync on client load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncDirectoryWithBackend();
  }, 150);
}

export function resetDirectoryToDefault(): DirectoryItem[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DIRECTORY_DATA));
    window.dispatchEvent(new CustomEvent('nova_directory_updated', { detail: DIRECTORY_DATA }));
    return DIRECTORY_DATA;
  } catch (e) {
    return DIRECTORY_DATA;
  }
}

/**
 * Parses CSV text into DirectoryItem objects
 * Expected headers (flexible matching):
 * Name, Role, Category, Location, Service Locations, Project Stages, Products & Services, Description, Phone, Email, Experience, Website, Rating, Reviews, GSTIN, Price Range, Certifications, Address
 */
export function parseDirectoryCSV(csvText: string): { items: DirectoryItem[]; errors: string[] } {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return { items: [], errors: ['CSV file is empty or has no header row.'] };
  }

  // Parse CSV line handling quoted commas
  const parseLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const items: DirectoryItem[] = [];
  const errors: string[] = [];

  for (let idx = 1; idx < lines.length; idx++) {
    const row = parseLine(lines[idx]);
    if (row.length === 0 || row.every(cell => !cell)) continue;

    const getVal = (possibleHeaders: string[]): string => {
      for (const ph of possibleHeaders) {
        const index = headers.findIndex(h => h.includes(ph));
        if (index !== -1 && row[index]) {
          return row[index];
        }
      }
      return '';
    };

    const name = getVal(['name', 'company', 'business', 'partner']);
    if (!name) {
      errors.push(`Row ${idx + 1}: Skipped due to missing business/vendor name.`);
      continue;
    }

    const rawRole = getVal(['role', 'type']).toLowerCase();
    const role: 'vendor' | 'advisor' = rawRole.includes('advisor') || rawRole.includes('consult') ? 'advisor' : 'vendor';
    const category = getVal(['category', 'domain', 'specialty']) || (role === 'advisor' ? 'Hospital Consulting' : 'Equipment & Engineering');
    const location = getVal(['location', 'city', 'headquarters']) || 'Mumbai';
    const serviceLocsRaw = getVal(['servicelocations', 'servicecities', 'coverage', 'areas']);
    const serviceLocations = serviceLocsRaw
      ? serviceLocsRaw.split(/[;|]/).map(s => s.trim()).filter(Boolean)
      : [location, 'All India'];

    const stagesRaw = getVal(['projectstages', 'stages', 'phases']);
    const projectStages = stagesRaw
      ? stagesRaw.split(/[;|]/).map(s => s.trim()).filter(Boolean)
      : ['Civil Construction & MEP', 'Equipment & Procurement'];

    const offeringsRaw = getVal(['productsandservices', 'products', 'services', 'offerings']);
    const productsAndServices = offeringsRaw
      ? offeringsRaw.split(/[;|]/).map(s => s.trim()).filter(Boolean)
      : ['Hospital Turnkey Solutions', 'Specialist Consultation'];

    const description = getVal(['description', 'about', 'summary']) || `Verified healthcare ${role} based in ${location}.`;
    const contactEmail = getVal(['contactemail', 'email', 'mail']) || `contact@${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'partner'}.in`;
    const phone = getVal(['phone', 'mobile', 'tel', 'contact']) || '+91 98200 12345';
    const website = getVal(['website', 'url', 'web']) || `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.in`;
    const expNum = parseInt(getVal(['yearsofexperience', 'experience', 'exp']), 10);
    const yearsOfExperience = isNaN(expNum) ? 10 : expNum;
    const ratingNum = parseFloat(getVal(['rating', 'stars']));
    const rating = isNaN(ratingNum) ? 4.8 : Math.min(5, Math.max(1, ratingNum));
    const reviewsNum = parseInt(getVal(['reviewscount', 'reviews']), 10);
    const reviewsCount = isNaN(reviewsNum) ? 15 : reviewsNum;
    const gstin = getVal(['gstin', 'gst', 'taxid']) || '27AAACG9999K1Z5';
    const priceRange = getVal(['pricerange', 'pricing', 'commercials', 'rate']) || 'Standard Hospital Project Rates';
    const turnaroundTime = getVal(['turnaroundtime', 'timeline', 'delivery']) || '3 - 6 Weeks';

    const certsRaw = getVal(['certifications', 'accreditations', 'licenses']);
    const certifications = certsRaw
      ? certsRaw.split(/[;|]/).map(s => s.trim()).filter(Boolean)
      : ['ISO 9001:2015', 'NABH Compliant'];

    const portfolioRaw = getVal(['clientportfolio', 'clients', 'projects', 'portfolio']);
    const clientPortfolio = portfolioRaw
      ? portfolioRaw.split(/[;|]/).map(s => s.trim()).filter(Boolean)
      : ['Regional Multispecialty Center', 'City Super Specialty Hospital'];

    const headquartersAddress = getVal(['headquartersaddress', 'address', 'office']) || `${location}, India`;

    // Featured Project
    const featuredProject = getVal(['featuredproject', 'featured_project', 'flagshipproject', 'keyproject', 'featured']) || undefined;

    // Compliance Badges (e.g. semicolon or pipe separated)
    const badgesRaw = getVal(['compliancebadges', 'compliance_badges', 'badges', 'compliance', 'compliancebadge']);
    const complianceBadges = badgesRaw
      ? badgesRaw.split(/[;|]/).map(s => s.trim()).filter(Boolean)
      : ['Verified by NOVA Admin', 'Active License'];

    // Verified Status (treat 'true', 'yes', '1', 'verified' as true; default true if empty)
    const verifiedVal = getVal(['verified', 'isverified', 'verification']).toLowerCase().trim();
    const verified = verifiedVal !== ''
      ? (verifiedVal === 'true' || verifiedVal === 'yes' || verifiedVal === '1' || verifiedVal === 'verified')
      : true;

    const newItem: DirectoryItem = {
      id: `dir-custom-${Date.now()}-${idx}`,
      name,
      role,
      category,
      rating,
      reviewsCount,
      location,
      serviceLocations,
      projectStages,
      productsAndServices,
      description,
      verified,
      yearsOfExperience,
      contactEmail,
      phone,
      website,
      gstin,
      priceRange,
      turnaroundTime,
      certifications,
      clientPortfolio,
      headquartersAddress,
      featuredProject: featuredProject || undefined,
      complianceBadges: complianceBadges.length > 0 ? complianceBadges : ['Verified by NOVA Admin', 'Active License'],
      isClaimed: false,
      claimStatus: 'unclaimed'
    };

    items.push(newItem);
  }

  return { items, errors };
}

/**
 * Generates sample CSV template string that users can download to populate easily.
 * Comprehensive template includes Featured Project, Compliance Badges, Verified status, and all directory attributes.
 */
export function generateSampleDirectoryCSV(): string {
  const headers = [
    "Name",
    "Role",
    "Category",
    "Location",
    "Service Locations",
    "Project Stages",
    "Products & Services",
    "Description",
    "Featured Project",
    "Compliance Badges",
    "Verified",
    "Phone",
    "Contact Email",
    "Years Of Experience",
    "Rating",
    "Reviews Count",
    "Website",
    "GSTIN",
    "Price Range",
    "Turnaround Time",
    "Certifications",
    "Client Portfolio",
    "Headquarters Address"
  ];

  const sampleRows = [
    [
      "VitalTech Biomedical Systems",
      "vendor",
      "Biomedical Equipment",
      "Bengaluru",
      "Bengaluru; Hyderabad; Chennai; All India",
      "Medical Equipment & Technology; Commissioning & Handover",
      "High-end ICU Ventilators; Digital C-Arm X-Ray; Patient Monitors",
      "Direct authorized supplier of advanced critical care equipment with comprehensive AMC maintenance across South India.",
      "50-Bed Modular ICU Upgrade at Fortis Bannerghatta",
      "Verified by NOVA Admin; AERB Certified Supplier; Active GSTIN",
      "true",
      "+91 80 4123 7890",
      "sales@vitaltech-bio.in",
      "14",
      "4.9",
      "29",
      "https://www.vitaltech-bio.in",
      "29AAACV5678P1Z3",
      "₹4.5L - ₹18L per ICU bed setup",
      "10 - 20 Business Days",
      "ISO 13485:2016; CE Medical Device; AERB Type Approved",
      "Manipal Hospital; Apollo Specialty; Aster CMI",
      "Plot 14B, Electronic City Phase 1, Bengaluru, KA 560100"
    ],
    [
      "SurgiClean Modular Cleanrooms",
      "vendor",
      "Modular OT & Cleanrooms",
      "Delhi NCR",
      "Delhi NCR; Jaipur; Chandigarh; Lucknow",
      "Civil Construction & MEP; Interior Fitouts & Finishes",
      "Prefabricated SS Modular OT; Laminar Airflow Plenums; Hermetic Doors",
      "Turnkey cleanroom and modular operation theatre infrastructure compliant with NABH and ISO 14644 standards.",
      "6-Suite NABH Super-Specialty OT Wing at Max Healthcare Saket",
      "Verified by NOVA Admin; ISO 14644 Validated; PESO Cleanroom Approved",
      "true",
      "+91 11 2689 4433",
      "projects@surgiclean.in",
      "12",
      "4.8",
      "24",
      "https://www.surgiclean.in",
      "07AAACS1234F1Z8",
      "₹24L - ₹65L per OT Suite",
      "45 - 60 Days",
      "ISO 14644-1; NABH Infection Control Standard; CE Certified",
      "Max Super Specialty; Fortis Escorts; Medanta Medicity",
      "Okhla Industrial Area Phase III, New Delhi, DL 110020"
    ],
    [
      "AeroMed NABH & Quality Advisors",
      "advisor",
      "NABH & Quality Accreditation",
      "Hyderabad",
      "Hyderabad; Bengaluru; Visakhapatnam; All India",
      "Dry Runs & Soft Launch; Commercial Launch & NABH",
      "NABH 5th Edition Audit; Infection Control SOPs; Mock Drills & Clinician Training",
      "Healthcare quality advisory firm with 100% first-attempt NABH & NABL accreditation track record for 70+ hospitals.",
      "Turnkey NABH 5th Edition Full Accreditation for 350-bed Aster Prime",
      "Verified by NOVA Admin; QCI Empaneled Auditor; ISQua Senior Fellow",
      "true",
      "+91 40 6712 8899",
      "consult@aeromed-quality.in",
      "16",
      "4.9",
      "42",
      "https://www.aeromed-quality.in",
      "36AAACA4321R1Z1",
      "₹3.5L - ₹8.5L complete NABH journey",
      "6 - 9 Months implementation",
      "QCI Empaneled Consultant; Lead Assessor ISO 15189",
      "KIMS Hospital; Yashoda Hospitals; CARE Hospitals",
      "Road No. 36, Jubilee Hills, Hyderabad, TS 500033"
    ],
    [
      "Apex MedDesign Healthcare Architects",
      "advisor",
      "Hospital Architecture & MEP",
      "Mumbai",
      "Mumbai; Pune; Ahmedabad; Surat; All India",
      "Feasibility & Concept; Architectural Design; Civil Construction & MEP",
      "AERB Bunker Shielding Layouts; Clinical Flow Optimization; Green Hospital GRIHA Rating",
      "Specialized healthcare master planning and engineering consultants delivering radiation-safe oncology wings and energy-efficient hospital blocks.",
      "120-Bed Comprehensive Oncology & Linear Accelerator Center at Ruby Hall Pune",
      "Verified by NOVA Admin; Council of Architecture Reg.; AERB Safety Certified",
      "true",
      "+91 22 2498 7700",
      "studio@apexmeddesign.in",
      "18",
      "4.9",
      "38",
      "https://www.apexmeddesign.in",
      "27AAACA9876Q1Z2",
      "₹85 - ₹160 per sq. ft. architectural planning",
      "30 - 45 Days schematic set",
      "Council of Architecture CA/2005/31200; GRIHA Evaluator",
      "Ruby Hall Clinic; Sahyadri Hospitals; Lilavati Hospital",
      "Senapati Bapat Marg, Lower Parel, Mumbai, MH 400013"
    ],
    [
      "LifeLine MGPS Technologies",
      "vendor",
      "Medical Gas Pipeline Systems (MGPS)",
      "Chennai",
      "Chennai; Coimbatore; Madurai; Kochi; All India",
      "Civil Construction & MEP; Medical Equipment & Technology",
      "HTM 02-01 Medical Gas Plants; Oxygen Vacuum Outlets; Liquid Medical Oxygen (LMO) Storage",
      "ISO 7396 and HTM 02-01 certified cryogenic medical gas pipelines, digital alarm panels, and automated manifold systems.",
      "High-Purity Oxygen & Medical Air Grid for 400-bed SRM Global Hospital",
      "Verified by NOVA Admin; HTM 02-01 Standard Compliant; PESO Cryogenic Licensed",
      "true",
      "+91 44 2815 6677",
      "projects@lifelinemgps.in",
      "15",
      "4.8",
      "31",
      "https://www.lifelinemgps.in",
      "33AAACL1122K1Z9",
      "₹38,000 - ₹55,000 per piped hospital bed point",
      "20 - 35 Days",
      "ISO 7396-1; HTM 02-01; CE 0434; PESO Licensed",
      "SRM Global Hospital; MIOT International; Kauvery Hospital",
      "Guindy Industrial Estate, Chennai, TN 600032"
    ],
    [
      "PulseCare Digital Health Solutions",
      "vendor",
      "Hospital Information Systems (HIS) & PACS",
      "Pune",
      "Pune; Mumbai; Delhi NCR; Bengaluru; Pan-India",
      "Medical Equipment & Technology; Commissioning & Handover",
      "Cloud HIS with ABDM M1/M2/M3 Integration; DICOM Cloud PACS; EMR & Tele-ICU Platform",
      "Ayushman Bharat Digital Mission (ABDM) accredited hospital management platform with zero hardware on-prem footprint.",
      "ABDM Milestone 3 Paperless Transition across 18 Community Health Centers",
      "Verified by NOVA Admin; NHA ABDM Certified M1-M3; HIPAA / ISO 27001",
      "true",
      "+91 20 6620 4400",
      "integrations@pulsecare.in",
      "9",
      "4.7",
      "19",
      "https://www.pulsecare.in",
      "27AAACP5544L1ZP",
      "₹45 - ₹90 per outpatient encounter / SaaS tier",
      "14 - 21 Days setup and go-live",
      "NHA ABDM Milestone 1-3; ISO 27001:2013; HIPAA Compliant",
      "Sahyadri Hospitals; Deenanath Mangeshkar Hospital; Bharati Vidyapeeth Hospital",
      "Magarpatta Cybercity, Hadapsar, Pune, MH 411028"
    ]
  ];

  const escapeCell = (cell: string) => {
    if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...sampleRows.map(row => row.map(escapeCell).join(','))
  ].join('\n');

  return csvContent;
}
