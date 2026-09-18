import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  Star, 
  X, 
  Compass,
  QrCode,
  Sparkles,
  RefreshCw,
  Lock,
  Unlock,
  Settings,
  UploadCloud,
  PlusCircle,
  ArrowLeftRight,
  ArrowRight
} from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { DirectoryItem, AuthUser, UserRole, FacilityType } from '../types';
import { detectUserCity } from '../utils/geoUtils';

interface DirectorySearchProps {
  onSelectVendor: (vendor: DirectoryItem) => void;
  onPostRequirement: () => void;
  onOpenPamphletQr?: () => void;
  autoDetectTrigger?: number;
  currentUser?: AuthUser | null;
  onOpenAuth?: (mode: 'signin' | 'signup', role?: UserRole) => void;
  directoryItems: DirectoryItem[];
  onOpenAdminDirectory?: () => void;
  isStandalonePage?: boolean;
  comparedIds?: string[];
  onToggleCompare?: (id: string) => void;
  onClearCompare?: () => void;
  onOpenCompare?: () => void;
  facilityTypes?: FacilityType[];
  activeFacilityId?: string;
  setActiveFacilityId?: (id: string) => void;
}

// Stage to categories mapping: Stages have different categories
const STAGE_CATEGORY_MAP: Record<string, string[]> = {
  'Planning & Feasibility': [
    'Feasibility & Strategy',
    'Hospital Consulting',
    'Detailed Project Reports (DPR)',
    'Financial Modeling & Debt Syndication',
    'Catchment & Market Demand'
  ],
  'Design & Architecture': [
    'Hospital Architecture & Space Planning',
    'AERB Radiation Bunker Design',
    'Clinical Circulation & Zoning',
    'Healthcare Architecture'
  ],
  'Statutory Approvals': [
    'Statutory Licensing & Compliance',
    'AERB Radiation Safety Clearance',
    'Pollution Control Board CTE/CTO',
    'Fire Safety & Municipal Approvals'
  ],
  'Civil Construction & MEP': [
    'Civil Construction & Structural Engineering',
    'MEP, HVAC & Critical Utilities',
    'Cleanroom & Modular OT Infrastructure',
    'Medical Gas Pipeline Systems (MGPS)',
    'Effluent & Sewage Treatment (ETP/STP)',
    'Equipment & Engineering'
  ],
  'Interiors & Cleanrooms': [
    'Hospital Interiors & Healing Architecture',
    'Antimicrobial Conductive Flooring',
    'Acoustic Ceilings & Wall Paneling',
    'Wayfinding & Hospital Signage'
  ],
  'IT, HIS & Softwares': [
    'Digital Healthcare & IT Systems',
    'Hospital Information System (HIS)',
    'Cloud PACS & DICOM Imaging',
    'ABDM Ayushman Bharat Integration',
    'Healthcare IT & Software'
  ],
  'Equipment Procurement': [
    'Medical Technology & Life Support',
    'Diagnostic Imaging (MRI, CT, X-Ray)',
    'Operating Theatre & Surgical Consoles',
    'Critical Care & ICU Life Support',
    'Biomedical Engineering & Turnkey'
  ],
  'Recruitment & Staffing': [
    'Clinical & Administrative Talent',
    'Healthcare HR & Doctor Credentialing',
    'Nursing Cadre & Staff Training'
  ],
  'Commissioning & Pre-op': [
    'Testing, Commissioning & Dry Runs',
    'NABH Quality Accreditation Support',
    'OT Particle Count & Validation',
    'Hospital Pre-opening Simulation'
  ],
  'Branding & Marketing': [
    'Marketing, Outreach & Community Connect',
    'Hospital Branding & Digital PR',
    'TPA & Corporate Health Empanelment'
  ],
  'Operational Expansion': [
    'Operations, Clinical Audits & NABH Journey',
    'Hospital Management Consulting',
    'Specialist Consultation',
    'Hospital Expansion Advisory'
  ],
  'Maintenance & AMC': [
    'Facility Management & Equipment AMC',
    'Biomedical Equipment Calibration',
    'HVAC, Chiller & DG Maintenance',
    'Turnkey Comprehensive AMC / CMC'
  ]
};

export const DirectorySearch: React.FC<DirectorySearchProps> = ({ 
  onSelectVendor, 
  onPostRequirement,
  onOpenPamphletQr,
  autoDetectTrigger,
  currentUser,
  onOpenAuth,
  directoryItems,
  onOpenAdminDirectory,
  isStandalonePage = false,
  comparedIds = [],
  onToggleCompare,
  onClearCompare,
  onOpenCompare,
  facilityTypes = [],
  activeFacilityId,
  setActiveFacilityId
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'vendor' | 'advisor'>('all');
  const [showOnlyVerified, setShowOnlyVerified] = useState(false);

  // Geolocation & Pamphlet Scan States
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [detectionMethod, setDetectionMethod] = useState<'gps' | 'ip' | 'fallback'>('gps');
  const [isPamphletScanActive, setIsPamphletScanActive] = useState(false);

  // Extract unique locations dynamically from current items
  const locations = useMemo(() => {
    const locSet = new Set<string>();
    directoryItems.forEach(item => {
      if (item.location) locSet.add(item.location);
      if (item.serviceLocations) {
        item.serviceLocations.forEach(l => {
          if (l !== 'All India') locSet.add(l);
        });
      }
    });
    return ['All', ...Array.from(locSet)];
  }, [directoryItems]);

  const triggerLocationDetection = async () => {
    setIsDetectingLocation(true);
    try {
      const result = await detectUserCity();
      setDetectedCity(result.city);
      setDetectionMethod(result.method);
      
      // Auto-set the dropdown to the detected city
      const foundInList = locations.find(loc => loc.toLowerCase() === result.city.toLowerCase());
      if (foundInList) {
        setSelectedLocation(foundInList);
      } else {
        setSelectedLocation(result.city);
      }
    } catch (e) {
      console.error('Geo detection error:', e);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // React to parent QR scan trigger
  useEffect(() => {
    if (autoDetectTrigger && autoDetectTrigger > 0) {
      setRoleFilter('vendor');
      setIsPamphletScanActive(true);
      triggerLocationDetection();
      
      // Scroll to directory section
      setTimeout(() => {
        document.getElementById('directory-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [autoDetectTrigger]);

  // Handle initial hash check if accessed via direct QR link #scan-vendor
  useEffect(() => {
    if (window.location.hash === '#scan-vendor' || window.location.hash.includes('pamphlet')) {
      setRoleFilter('vendor');
      setIsPamphletScanActive(true);
      triggerLocationDetection();
      
      setTimeout(() => {
        document.getElementById('directory-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, []);
  
  // Stages list covering the complete hospital project lifecycle
  const stages = useMemo(() => {
    const stageSet = new Set<string>();
    [
      'Planning & Feasibility',
      'Design & Architecture',
      'Statutory Approvals',
      'Civil Construction & MEP',
      'Interiors & Cleanrooms',
      'IT, HIS & Softwares',
      'Equipment Procurement',
      'Recruitment & Staffing',
      'Commissioning & Pre-op',
      'Branding & Marketing',
      'Operational Expansion',
      'Maintenance & AMC'
    ].forEach(s => stageSet.add(s));

    directoryItems.forEach(item => {
      item.projectStages?.forEach(s => {
        if (s) stageSet.add(s);
      });
    });

    return ['All', ...Array.from(stageSet)];
  }, [directoryItems]);

  // Extract categories dynamically:
  // "Stages will have different category."
  const categories = useMemo(() => {
    if (selectedStage === 'All') {
      const catSet = new Set<string>();
      directoryItems.forEach(item => {
        if (item.category) catSet.add(item.category);
      });
      Object.values(STAGE_CATEGORY_MAP).forEach(cats => {
        cats.forEach(c => catSet.add(c));
      });
      return ['All', ...Array.from(catSet)];
    }

    // Specific stage selected: stages will have different category!
    const stageCats = new Set<string>();

    // 1. Check mapped categories for this stage
    Object.entries(STAGE_CATEGORY_MAP).forEach(([stgKey, cats]) => {
      if (
        stgKey.toLowerCase().includes(selectedStage.toLowerCase()) ||
        selectedStage.toLowerCase().includes(stgKey.toLowerCase())
      ) {
        cats.forEach(c => stageCats.add(c));
      }
    });

    // 2. Extract categories from directory items matching this stage
    directoryItems.forEach(item => {
      const matchesStage = item.projectStages?.some(s =>
        s.toLowerCase().includes(selectedStage.toLowerCase()) ||
        selectedStage.toLowerCase().includes(s.toLowerCase())
      );
      if (matchesStage && item.category) {
        stageCats.add(item.category);
      }
    });

    return ['All', ...Array.from(stageCats)];
  }, [directoryItems, selectedStage]);

  const handleStageChange = (newStage: string) => {
    setSelectedStage(newStage);
    setSelectedCategory('All');
  };

  // Filtering logic incorporating search, category, location, stage, role, verification, and facility type
  const filteredBusinesses = useMemo(() => {
    return directoryItems.filter((item) => {
      // Location filter
      if (selectedLocation !== 'All' && selectedLocation !== 'All Locations') {
        const vendorCities = item.serviceLocations ? item.serviceLocations.map(loc => loc.toLowerCase()) : [];
        const matchesLocation = item.location.toLowerCase() === selectedLocation.toLowerCase() ||
          vendorCities.includes(selectedLocation.toLowerCase()) ||
          vendorCities.includes('all india') ||
          vendorCities.includes('pan india');
        if (!matchesLocation) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && selectedCategory !== 'All Categories' && item.category !== selectedCategory) {
        return false;
      }

      // Project Stage filter
      if (selectedStage !== 'All') {
        const matchesStage = item.projectStages?.some(stage => 
          stage.toLowerCase().includes(selectedStage.toLowerCase()) ||
          selectedStage.toLowerCase().includes(stage.toLowerCase())
        );
        if (!matchesStage) return false;
      }

      // Role filter
      if (roleFilter !== 'all' && item.role !== roleFilter) {
        return false;
      }

      // Verification filter
      if (showOnlyVerified && !item.verified && !(item as any).isVerified) {
        return false;
      }

      // Facility filter
      if (activeFacilityId && activeFacilityId !== 'all') {
        const facilityServed = (item as any).facilityTypesServed;
        if (facilityServed && facilityServed.length > 0 && !facilityServed.includes(activeFacilityId)) {
          return false;
        }
      }

      // Free Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        const matchesOfferings = item.productsAndServices?.some(p => p.toLowerCase().includes(q));
        const matchesGstin = item.gstin?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesOfferings && !matchesGstin) {
          return false;
        }
      }

      return true;
    });
  }, [directoryItems, selectedLocation, selectedCategory, selectedStage, roleFilter, searchQuery, showOnlyVerified, activeFacilityId]);

  const resetFilters = () => {
    setSelectedLocation('All');
    setSelectedStage('All');
    setSelectedCategory('All');
    setSearchQuery('');
    setRoleFilter('all');
    setShowOnlyVerified(false);
    if (setActiveFacilityId) setActiveFacilityId('all');
  };

  return (
    <section id="directory-section" className={`${isStandalonePage ? 'pt-2 sm:pt-4 pb-16' : 'py-12 sm:py-16'} bg-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="text-center md:text-left max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Location-Based Search / Directory
            </span>
            <SectionHeading id="directory-section" className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              NOVA Directory
            </SectionHeading>
            <p className="text-slate-600 text-base sm:text-lg mt-1.5">
              Search verified equipment vendors, healthcare advisors, and hospital infrastructure partners across Indian metros.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Compare Profiles button */}
            {onOpenCompare && (
              <button
                id="header-compare-profiles-btn"
                onClick={onOpenCompare}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap ${
                  comparedIds.length > 0
                    ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
                }`}
                title="Compare hospital partner profiles side-by-side"
              >
                <ArrowLeftRight className="w-4 h-4 text-blue-500 group-hover:text-white" />
                <span>Compare Profiles</span>
                {comparedIds.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-blue-700 text-[10px] font-black flex items-center justify-center">
                    {comparedIds.length}
                  </span>
                )}
              </button>
            )}

            {/* Admin Directory Management Button (Only for authenticated admin) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={onOpenAdminDirectory}
                className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                <Settings className="w-4 h-4 text-purple-300" />
                <span>Manage Directory &amp; CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Pamphlet QR Scan Banner */}
        {isPamphletScanActive && detectedCity && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-300 shadow-sm flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                    Pamphlet Scan Mode
                  </span>
                  <span className="text-xs font-semibold text-emerald-900">
                    Detected via {detectionMethod === 'gps' ? 'Device GPS' : 'City Network'}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  Location auto-set to <span className="text-emerald-700 underline">{detectedCity}</span> &bull; Filtered for <span className="text-blue-700">Vendors Only</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedLocation('All')}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer shadow-2xs transition-colors"
              >
                Show All Cities
              </button>
              <button
                onClick={() => {
                  setIsPamphletScanActive(false);
                  setRoleFilter('all');
                  setSelectedLocation('All');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer transition-colors"
              >
                Exit Scan Mode
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter Bar matching Wireframe Section 6 */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
            
            {/* Location Select with Auto-Detect Button */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Location
                </label>
                <button
                  type="button"
                  onClick={triggerLocationDetection}
                  disabled={isDetectingLocation}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer disabled:opacity-50 transition-colors"
                  title="Detect my current location automatically"
                >
                  <Compass className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin text-blue-600' : ''}`} />
                  <span>{isDetectingLocation ? 'Locating...' : 'Auto-Detect'}</span>
                </button>
              </div>

              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  id="directory-location-select"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Hospital Project Stage Select (Comes BEFORE Specialty / Category) */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hospital Project Stage
              </label>
              <select
                id="directory-stage-select"
                value={selectedStage}
                onChange={(e) => handleStageChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            {/* 3. Specialty / Category Select (Stages have different categories) */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Specialty / Category
              </label>
              <select
                id="directory-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Keyword / Company
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="directory-keyword-input"
                  type="text"
                  placeholder="e.g. Cleanroom, AERB, OT, MRI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Subtext and Quick Role Filter */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <p className="text-slate-600 font-medium">
                Browse verified partners freely.
              </p>
              {currentUser ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>
                    Logged in as {currentUser.name.split(' ')[0]} ({currentUser.role.toUpperCase()}) &bull; Full Details Unlocked
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Guest View &bull; Limited Contact &amp; Pricing</span>
                  {onOpenAuth && (
                    <button
                      onClick={() => onOpenAuth('signin')}
                      className="ml-1 text-blue-700 underline font-bold cursor-pointer hover:text-blue-800"
                    >
                      Login
                    </button>
                  )}
                </span>
              )}
            </div>

            {/* Quick role tabs */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  roleFilter === 'all' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({directoryItems.length})
              </button>
              <button
                onClick={() => setRoleFilter('advisor')}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  roleFilter === 'advisor' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Advisors ({directoryItems.filter(i => i.role === 'advisor').length})
              </button>
              <button
                onClick={() => setRoleFilter('vendor')}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  roleFilter === 'vendor' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vendors ({directoryItems.filter(i => i.role === 'vendor').length})
              </button>
            </div>

            {(selectedLocation !== 'All' || selectedCategory !== 'All' || selectedStage !== 'All' || searchQuery !== '' || roleFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-slate-800">
            Showing <span className="text-blue-700">{filteredBusinesses.length}</span> verified healthcare partner{filteredBusinesses.length === 1 ? '' : 's'}
          </p>
          <div className="flex items-center gap-4">
            {currentUser?.role === 'admin' && (
              <button
                onClick={onOpenAdminDirectory}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Admin CSV Console</span>
              </button>
            )}
            <button
              onClick={onPostRequirement}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer flex items-center gap-1"
            >
              {!currentUser && <Lock className="w-3 h-3 text-slate-400" />}
              <span>{currentUser ? "Can't find what you need? Post a requirement →" : "Can't find what you need? Sign in to post requirement →"}</span>
            </button>
          </div>
        </div>

        {/* Directory Listings Grid */}
        {filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((item) => (
              <div
                key={item.id}
                id={`vendor-card-${item.id}`}
                className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-blue-300"
              >
                <div>
                  {/* Card Header: Role badge & location */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      item.role === 'advisor'
                        ? 'bg-sky-100 text-sky-800 border border-sky-200'
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    }`}>
                      {item.role === 'advisor' ? 'Advisor' : 'Vendor'}
                    </span>

                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.location}</span>
                    </div>
                  </div>

                  {/* Company Name & Verification */}
                  <div className="mb-2">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                        {item.name}
                      </h4>
                      {item.verified && (
                        <span title="Verified Partner by NOVA">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        </span>
                      )}
                    </div>

                    {/* Project Stages come BEFORE Specialty / Category */}
                    <div className="mt-1.5 space-y-1">
                      {item.projectStages && item.projectStages.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage:</span>
                          {item.projectStages.slice(0, 2).map((stg, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 text-[10px] font-semibold"
                            >
                              {stg}
                            </span>
                          ))}
                          {item.projectStages.length > 2 && (
                            <span className="text-[10px] text-amber-700 font-medium">
                              +{item.projectStages.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category:</span>
                        <span className="text-xs font-semibold text-blue-600">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Review Count */}
                  <div className="flex items-center gap-2 mb-3 text-xs">
                    <div className="flex items-center text-amber-500 font-bold gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{item.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 font-medium">
                      {item.reviewsCount} verified reviews
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Products & Services Tags */}
                  <div className="space-y-1.5 mb-4">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Key Offerings:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.productsAndServices?.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.productsAndServices && item.productsAndServices.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-semibold">
                          +{item.productsAndServices.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {onToggleCompare && (
                      <label 
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer select-none transition-all ${
                          comparedIds.includes(item.id)
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                        }`}
                        title="Add to side-by-side comparison"
                      >
                        <input
                          type="checkbox"
                          checked={comparedIds.includes(item.id)}
                          onChange={() => onToggleCompare(item.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                        />
                        <span>Compare</span>
                      </label>
                    )}

                    <span className="text-xs text-slate-500 font-medium">
                      {item.yearsOfExperience}+ yrs exp
                    </span>
                    <span className="text-slate-300">•</span>
                    {currentUser ? (
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                        <Unlock className="w-3 h-3 text-emerald-600" />
                        <span>Full Details</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-0.5" title="Log in to view phone, commercial pricing & GSTIN">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Limited</span>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onSelectVendor(item)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{currentUser ? 'View Full Profile' : 'View Profile'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-slate-200">
            <Filter className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No matching partners found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Try resetting your filters or tell our network what you need.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                onClick={onPostRequirement}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 cursor-pointer flex items-center gap-1.5"
              >
                {!currentUser && <Lock className="w-3.5 h-3.5 text-blue-200" />}
                <span>{currentUser ? "Post Your Requirement" : "Sign In to Post Requirement"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Compare Bar when items are selected */}
        {comparedIds.length > 0 && onOpenCompare && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 animate-slideUp">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 font-extrabold text-xs shadow-xs">
                {comparedIds.length}
              </div>
              <div>
                <p className="text-xs font-bold flex items-center gap-1.5">
                  <span>{comparedIds.length} {comparedIds.length === 1 ? 'partner' : 'partners'} selected</span>
                  <span className="text-[10px] text-blue-300 font-medium">(up to 4)</span>
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  Compare verified track records, hospital projects &amp; capabilities
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onClearCompare && (
                <button
                  onClick={onClearCompare}
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                onClick={onOpenCompare}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <span>Compare Profiles Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
