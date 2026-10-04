import { AccreditationProgramme } from '../types';

export const ACCREDITATION_STORAGE_KEY = 'nova_accreditation_programmes';

export const DEFAULT_ACCREDITATION_PROGRAMMES: AccreditationProgramme[] = [
  {
    id: 'prog-nabh-entry',
    name: 'NABH Entry-Level Standards (SHCO & HCO)',
    code: 'nabh-entry',
    authority: 'Quality Council of India (QCI) / NABH',
    category: 'Hospital Execution Templates',
    description: 'Essential quality benchmark for new or expanding healthcare facilities. Qualifies the hospital for insurance empanelment (ROHINI/GIPSA) and focuses on fundamental patient safety and statutory clearances.',
    targetBedCapacity: 'Up to 50 beds (SHCO) & 50–100 beds (HCO)',
    estimatedDuration: '6–9 Months',
    applicableStageNumbers: [1, 2, 3, 5, 7, 8, 12, 14, 15],
    stageNotes: {
      3: 'Fire NOC, AERB radiation clearance, pollution control board consent, and clinical establishment registration are strict prerequisites.',
      5: 'Cleanroom AHU, HEPA filtration (ISO Class 7/8), and antibacterial OT surfaces required.',
      12: 'Biomedical waste management authorization and hospital-acquired infection control committee protocols.',
      14: 'Mandatory 30-day mock audit and incident reporting dry runs before quality assessor visit.'
    },
    active: true,
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'prog-nabh-full',
    name: 'Full NABH Hospital Standards (5th Edition)',
    code: 'nabh-full',
    authority: 'Quality Council of India (QCI) / NABH',
    category: 'Hospital Execution Templates',
    description: 'The pinnacle Indian hospital quality mark across 10 chapters and 651 objective elements. Covers comprehensive clinical governance, pharmacy medication safety, patient rights, and facility management.',
    targetBedCapacity: '100+ Bed Tertiary & Multispecialty Hospitals',
    estimatedDuration: '12–18 Months',
    applicableStageNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    stageNotes: {
      1: 'DPR must establish clinical catchment and department zoning compliant with NBC/NABH area guidelines.',
      4: 'Structural zoning separating public, sterile, and service circulation corridors.',
      6: 'ABDM-compliant HIS with digital clinical documentation, CPOE, and EMR audit trails.',
      8: 'Standardized job descriptions, nurse-to-patient staffing ratios (1:1 ICU, 1:4 general ward), and BLS/ACLS training.'
    },
    active: true,
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'prog-jci',
    name: 'JCI International Hospital Standards',
    code: 'jci',
    authority: 'Joint Commission International (USA)',
    category: 'Hospital Execution Templates',
    description: 'The premier international healthcare credential for medical value travel, academic medical centers, and super-specialty hospitals adhering to global patient safety goals (IPSG) and NFPA fire standards.',
    targetBedCapacity: 'Super-Specialty & International Referral Hospitals (150+ Beds)',
    estimatedDuration: '18–24 Months',
    applicableStageNumbers: [1, 2, 4, 5, 7, 8, 10, 11, 12, 13, 14, 15],
    stageNotes: {
      2: 'Design must conform to NFPA 101 Life Safety Code and international infection barrier zoning.',
      7: 'US FDA / CE mark life-support biomedical equipment with redundant backup power and gas manifolds.',
      10: 'International Patient Safety Goals (IPSG 1–6) implemented through dual barcode patient identification.',
      14: 'Mock tracer audits simulating multi-department patient pathways.'
    },
    active: true,
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'prog-nabl',
    name: 'NABL Diagnostic Laboratory Standards (ISO 15189)',
    code: 'nabl',
    authority: 'NABL (Quality Council of India)',
    category: 'Laboratory Standards',
    description: 'Quality benchmark for in-house hospital pathology, biochemistry, microbiology, and molecular diagnostic laboratories guaranteeing calibrated test precision and clinical reliability.',
    targetBedCapacity: 'Hospital Pathology & Core Diagnostic Labs',
    estimatedDuration: '4–6 Months',
    applicableStageNumbers: [1, 2, 3, 6, 7, 8, 12, 14],
    stageNotes: {
      2: 'Air conditioning, vibration-isolated benching, and biosafety cabinet (BSL-2/3) exhaust design.',
      6: 'LIS (Laboratory Information System) with bidirectional analyzer interfacing and barcoded tube routing.',
      7: 'Calibrated diagnostic analyzers with traceability certificates and valid CMC service agreements.',
      8: 'Qualified medical laboratory technicians, pathologists, and biohazard spill response protocols.',
      12: 'Laboratory waste segregation and hazardous reagent disposal certification.',
      14: 'Internal Quality Control (IQC) daily runs and External Quality Assessment Scheme (EQAS) participation.'
    },
    active: true,
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z'
  }
];

export function getStoredAccreditationProgrammes(): AccreditationProgramme[] {
  if (typeof window === 'undefined') return DEFAULT_ACCREDITATION_PROGRAMMES;
  try {
    const raw = localStorage.getItem(ACCREDITATION_STORAGE_KEY);
    if (!raw) {
      saveStoredAccreditationProgrammes(DEFAULT_ACCREDITATION_PROGRAMMES);
      return DEFAULT_ACCREDITATION_PROGRAMMES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_ACCREDITATION_PROGRAMMES;
  } catch (err) {
    console.error('Error reading accreditation programmes from storage:', err);
    return DEFAULT_ACCREDITATION_PROGRAMMES;
  }
}

export function saveStoredAccreditationProgrammes(programmes: AccreditationProgramme[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCREDITATION_STORAGE_KEY, JSON.stringify(programmes));
    window.dispatchEvent(new CustomEvent('nova_accreditation_updated', { detail: programmes }));
  } catch (err) {
    console.error('Error saving accreditation programmes to storage:', err);
  }
}

export function getActiveAccreditationProgrammes(): AccreditationProgramme[] {
  return getStoredAccreditationProgrammes().filter(p => p.active !== false);
}

export function getAccreditationProgrammeById(id: string): AccreditationProgramme | undefined {
  return getStoredAccreditationProgrammes().find(p => p.id === id || p.code === id);
}

// Background API sync helper with Neon PostgreSQL backend
export async function syncAccreditationWithBackend(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch('/api/accreditations');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(ACCREDITATION_STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('nova_accreditation_updated', { detail: data }));
      }
    }
  } catch (e) {
    // Offline or running in static mode
  }
}

// Automatically initiate sync on client boot
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncAccreditationWithBackend();
  }, 100);
}

export function createAccreditationProgramme(programme: Omit<AccreditationProgramme, 'id' | 'createdAt' | 'updatedAt'>): AccreditationProgramme {
  const current = getStoredAccreditationProgrammes();
  const newProg: AccreditationProgramme = {
    ...programme,
    id: `prog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const updated = [newProg, ...current];
  saveStoredAccreditationProgrammes(updated);

  // Sync to Neon API in background
  if (typeof window !== 'undefined') {
    fetch('/api/accreditations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProg)
    }).catch(err => console.warn('[Storage] Background API sync deferred:', err));
  }

  return newProg;
}

export function updateAccreditationProgramme(id: string, updates: Partial<AccreditationProgramme>): AccreditationProgramme | null {
  const current = getStoredAccreditationProgrammes();
  const idx = current.findIndex(p => p.id === id);
  if (idx === -1) return null;

  const updatedProg: AccreditationProgramme = {
    ...current[idx],
    ...updates,
    id: current[idx].id, // preserve primary ID
    updatedAt: new Date().toISOString()
  };

  current[idx] = updatedProg;
  saveStoredAccreditationProgrammes([...current]);

  // Sync to Neon API in background
  if (typeof window !== 'undefined') {
    fetch('/api/accreditations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProg)
    }).catch(err => console.warn('[Storage] Background API sync deferred:', err));
  }

  return updatedProg;
}

export function deleteAccreditationProgramme(id: string): boolean {
  const current = getStoredAccreditationProgrammes();
  const filtered = current.filter(p => p.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredAccreditationProgrammes(filtered);

  // Sync to Neon API in background
  if (typeof window !== 'undefined') {
    fetch(`/api/accreditations/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).catch(err => console.warn('[Storage] Background API delete deferred:', err));
  }

  return true;
}

export function resetAccreditationProgrammesToDefault(): AccreditationProgramme[] {
  saveStoredAccreditationProgrammes(DEFAULT_ACCREDITATION_PROGRAMMES);
  return DEFAULT_ACCREDITATION_PROGRAMMES;
}

