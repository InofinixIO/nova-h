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
  } catch (e) {
    console.error('Failed to save directory items:', e);
  }
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
      verified: true,
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
      complianceBadges: ['Verified by NOVA Admin', 'Active License']
    };

    items.push(newItem);
  }

  return { items, errors };
}

/**
 * Generates sample CSV template string that users can download to populate easily
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
