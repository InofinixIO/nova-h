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
  ArrowRight,
  Download,
  Copy,
  Printer,
  Check,
  Share2
} from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { DirectoryItem, AuthUser, UserRole } from '../types';
import { detectUserCity } from '../utils/geoUtils';
import { 
  getDirectoryParamsFromUrl, 
  updateDirectoryUrlParams, 
  buildDirectoryUrl, 
  DirectorySearchParams 
} from '../utils/directoryQueryParams';
import { generateThemedQrSvg, generateThemedQrPng, ThemedQrOptions } from '../utils/customQrGenerator';

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
  onOpenCompare
}) => {
  // Hydrate search criteria from URL query params
  const initialParams = useMemo(() => getDirectoryParamsFromUrl(), []);

  const [selectedLocation, setSelectedLocation] = useState<string>(initialParams.location || 'All');
  const [selectedStage, setSelectedStage] = useState<string>(initialParams.stage || 'All');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialParams.category || 'All');
  const [roleFilter, setRoleFilter] = useState<'all' | 'vendor' | 'advisor'>(initialParams.role || 'all');
  
  // searchQuery tracks draft input in search bar; appliedSearchQuery filters the directory
  const [searchQuery, setSearchQuery] = useState<string>(initialParams.q || '');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState<string>(initialParams.q || '');

  // QR Code Generation Modal for Current Search
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalPng, setQrModalPng] = useState<string>('');
  const [qrModalSvg, setQrModalSvg] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Geolocation & Pamphlet Scan States
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [detectionMethod, setDetectionMethod] = useState<'gps' | 'ip' | 'fallback'>('gps');
  const [isPamphletScanActive, setIsPamphletScanActive] = useState(false);

  // Synchronize state with URL query parameters
  const syncQueryParams = (
    updates: Partial<DirectorySearchParams>,
    replace: boolean = false
  ) => {
    const nextCriteria: DirectorySearchParams = {
      q: updates.q !== undefined ? updates.q : appliedSearchQuery,
      role: updates.role !== undefined ? updates.role : roleFilter,
      stage: updates.stage !== undefined ? updates.stage : selectedStage,
      category: updates.category !== undefined ? updates.category : selectedCategory,
      location: updates.location !== undefined ? updates.location : selectedLocation,
    };
    updateDirectoryUrlParams(nextCriteria, replace);
  };

  // Explicit search button or Enter-key execution
  const handleExecuteSearch = (explicitTerm?: string) => {
    const term = typeof explicitTerm === 'string' ? explicitTerm.trim() : searchQuery.trim();
    setAppliedSearchQuery(term);
    syncQueryParams({ q: term }, false);
  };

  // Replace state while typing to keep query parameter current without polluting history
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    syncQueryParams({ q: value.trim() }, true);
  };

  const handleClearKeyword = () => {
    setSearchQuery('');
    setAppliedSearchQuery('');
    syncQueryParams({ q: '' }, false);
  };

  const handleLocationSelect = (newLoc: string) => {
    setSelectedLocation(newLoc);
    syncQueryParams({ location: newLoc }, false);
  };

  const handleStageSelect = (newStage: string) => {
    setSelectedStage(newStage);
    setSelectedCategory('All');
    syncQueryParams({ stage: newStage, category: 'All' }, false);
  };

  const handleCategorySelect = (newCat: string) => {
    setSelectedCategory(newCat);
    syncQueryParams({ category: newCat }, false);
  };

  const handleRoleSelect = (newRole: 'all' | 'vendor' | 'advisor') => {
    setRoleFilter(newRole);
    syncQueryParams({ role: newRole }, false);
  };

  // Synchronize from URL on browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const params = getDirectoryParamsFromUrl();
      setSelectedLocation(params.location || 'All');
      setSelectedStage(params.stage || 'All');
      setSelectedCategory(params.category || 'All');
      setRoleFilter(params.role || 'all');
      setSearchQuery(params.q || '');
      setAppliedSearchQuery(params.q || '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Compute live search URL for QR generation
  const currentSearchUrl = useMemo(() => {
    return buildDirectoryUrl(
      {
        q: appliedSearchQuery,
        role: roleFilter,
        stage: selectedStage,
        category: selectedCategory,
        location: selectedLocation
      },
      '/directory',
      'http://nova-h.in'
    );
  }, [appliedSearchQuery, roleFilter, selectedStage, selectedCategory, selectedLocation]);

  // Generate QR code for current search criteria when modal is opened
  useEffect(() => {
    if (!qrModalOpen) return;

    const themeOptions: ThemedQrOptions = {
      darkColor: '#005C5E',
      eyeCenterColor: '#008A8F',
      bgColor: '#ffffff',
      margin: 3,
      dotScale: 0.44,
      errorCorrectionLevel: 'H',
      width: 1024,
      logoUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRUZWFsIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzAwNUM1RSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDA4QThGIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIHJ4PSI1NiIgZmlsbD0idXJsKCNncmFkVGVhbCkiIC8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEyLCAwKSI+ICAgIAogICAgPHRleHQgeD0iMTI4IiB5PSIxODAiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI5MDAiIGZvbnQtc2l6ZT0iMTYwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TjwvdGV4dD4KICAgIDxjaXJjbGUgY3g9IjE5NiIgY3k9IjE3MiIgcj0iMTYiIGZpbGw9IiNlZjQ0NDQiIC8+CiAgPC9nPgo8L3N2Zz4='
    };

    const svg = generateThemedQrSvg(currentSearchUrl, themeOptions);
    setQrModalSvg(svg);

    generateThemedQrPng(currentSearchUrl, themeOptions)
      .then((png) => setQrModalPng(png))
      .catch((err) => console.error('Failed to generate search QR PNG:', err));
  }, [qrModalOpen, currentSearchUrl]);

  const handleCopySearchLink = () => {
    navigator.clipboard.writeText(currentSearchUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadSearchQrPng = () => {
    if (!qrModalPng) return;
    const link = document.createElement('a');
    link.download = `nova-search-qr-${(selectedLocation !== 'All' ? selectedLocation : 'all')}-${Date.now()}.png`;
    link.href = qrModalPng;
    link.click();
  };

  const handleDownloadSearchQrSvg = () => {
    if (!qrModalSvg) return;
    const blob = new Blob([qrModalSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `nova-search-qr-${(selectedLocation !== 'All' ? selectedLocation : 'all')}-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

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
    // Ensure initial location from URL is in dropdown even if no items yet
    if (initialParams.location && initialParams.location !== 'All') {
      locSet.add(initialParams.location);
    }
    return ['All', ...Array.from(locSet)];
  }, [directoryItems, initialParams.location]);

  const triggerLocationDetection = async () => {
    setIsDetectingLocation(true);
    try {
      const result = await detectUserCity();
      setDetectedCity(result.city);
      setDetectionMethod(result.method);
      
      // Auto-set the dropdown to the detected city
      const foundInList = locations.find(loc => loc.toLowerCase() === result.city.toLowerCase());
      const finalLoc = foundInList || result.city;
      setSelectedLocation(finalLoc);
      syncQueryParams({ location: finalLoc }, false);
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
      syncQueryParams({ role: 'vendor' }, false);
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
      syncQueryParams({ role: 'vendor' }, false);
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

  // Filtering logic based on appliedSearchQuery (committed via Search button or Enter key)
  const filteredBusinesses = useMemo(() => {
    return directoryItems.filter((item) => {
      // Location filter
      if (selectedLocation !== 'All') {
        const matchesLocation = item.location.toLowerCase() === selectedLocation.toLowerCase() ||
          item.serviceLocations?.some(loc => loc.toLowerCase() === selectedLocation.toLowerCase() || loc === 'All India');
        if (!matchesLocation) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
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

      // Free Search Query (Using appliedSearchQuery committed by explicit search or Enter)
      if (appliedSearchQuery.trim() !== '') {
        const q = appliedSearchQuery.toLowerCase();
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
  }, [directoryItems, selectedLocation, selectedCategory, selectedStage, roleFilter, appliedSearchQuery]);

  const hasActiveFilters = useMemo(() => {
    return selectedLocation !== 'All' || 
      selectedStage !== 'All' || 
      selectedCategory !== 'All' || 
      appliedSearchQuery.trim() !== '' || 
      roleFilter !== 'all';
  }, [selectedLocation, selectedStage, selectedCategory, appliedSearchQuery, roleFilter]);

  const resetFilters = () => {
    setSelectedLocation('All');
    setSelectedStage('All');
    setSelectedCategory('All');
    setSearchQuery('');
    setAppliedSearchQuery('');
    setRoleFilter('all');
    updateDirectoryUrlParams({}, false);
  };

  return (
    <section id="directory-section" className={`${isStandalonePage ? 'pt-2 sm:pt-4 pb-16' : 'py-12 sm:py-16'} bg-white dark:bg-slate-900 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="text-center md:text-left max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              Location-Based Search / Directory
            </span>
            <SectionHeading id="directory-section" className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
              NOVA Directory
            </SectionHeading>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mt-1.5">
              Search verified equipment vendors, healthcare advisors, and hospital infrastructure partners across Indian metros.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 w-full md:w-auto">
            {/* Compare Profiles button */}
            {onOpenCompare && (
              <button
                id="header-compare-profiles-btn"
                onClick={onOpenCompare}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap ${
                  comparedIds.length > 0
                    ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-300'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
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

            {/* Generate QR Code for Current Filtered Search */}
            <button
              id="header-generate-qr-btn"
              onClick={() => setQrModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
              title="Generate shareable QR code and flyer for this directory search"
            >
              <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Generate QR</span>
              {hasActiveFilters && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Filtered
                </span>
              )}
            </button>

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
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-blue-950/40 border border-emerald-300 dark:border-emerald-800 shadow-sm flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                    Pamphlet Scan Mode
                  </span>
                  <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                    Detected via {detectionMethod === 'gps' ? 'Device GPS' : 'City Network'}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  Location auto-set to <span className="text-emerald-700 dark:text-emerald-400 underline">{detectedCity}</span> &bull; Filtered for <span className="text-blue-700 dark:text-blue-400">Vendors Only</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedLocation('All')}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer shadow-2xs transition-colors"
              >
                Show All Cities
              </button>
              <button
                onClick={() => {
                  setIsPamphletScanActive(false);
                  setRoleFilter('all');
                  setSelectedLocation('All');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold cursor-pointer transition-colors"
              >
                Exit Scan Mode
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter Bar matching Wireframe Section 6 */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 rounded-2xl p-4 sm:p-6 shadow-xs mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
            
            {/* Location Select with Auto-Detect Button */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Location
                </label>
                <button
                  type="button"
                  onClick={triggerLocationDetection}
                  disabled={isDetectingLocation}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer disabled:opacity-50 transition-colors"
                  title="Detect my current location automatically"
                >
                  <Compass className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
                  <span>{isDetectingLocation ? 'Locating...' : 'Auto-Detect'}</span>
                </button>
              </div>

              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  id="directory-location-select"
                  value={selectedLocation}
                  onChange={(e) => handleLocationSelect(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc} className="dark:bg-slate-900">{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Hospital Project Stage Select (Comes BEFORE Specialty / Category) */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Hospital Project Stage
              </label>
              <select
                id="directory-stage-select"
                value={selectedStage}
                onChange={(e) => handleStageSelect(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage} className="dark:bg-slate-900">{stage}</option>
                ))}
              </select>
            </div>

            {/* 3. Specialty / Category Select (Stages have different categories) */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Specialty / Category
              </label>
              <select
                id="directory-category-select"
                value={selectedCategory}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="dark:bg-slate-900">{cat}</option>
                ))}
              </select>
            </div>

            {/* Search Input with Explicit Search Button */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Keyword / Company
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="directory-keyword-input"
                    type="text"
                    placeholder="e.g. Cleanroom, AERB, OT, MRI..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleExecuteSearch();
                      }
                    }}
                    className="w-full pl-9 pr-7 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearKeyword}
                      className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="Clear keyword"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  id="directory-explicit-search-btn"
                  onClick={() => handleExecuteSearch()}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs hover:shadow-md ${
                    searchQuery.trim() !== appliedSearchQuery.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-300 dark:ring-blue-800'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  title="Search directory with keyword and active filters"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              </div>
            </div>

          </div>

          {/* Subtext and Quick Role Filter */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 max-w-full">
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Browse verified partners freely.
              </p>
              {currentUser ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>
                    Logged in as {currentUser.name.split(' ')[0]} ({currentUser.role.toUpperCase()}) &bull; Full Details Unlocked
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Guest View &bull; Limited Contact &amp; Pricing</span>
                  {onOpenAuth && (
                    <button
                      onClick={() => onOpenAuth('signin')}
                      className="ml-1 text-blue-700 dark:text-blue-400 underline font-bold cursor-pointer hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Login
                    </button>
                  )}
                </span>
              )}
            </div>

            {/* Quick role tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => handleRoleSelect('all')}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  roleFilter === 'all' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({directoryItems.length})
              </button>
              <button
                onClick={() => handleRoleSelect('advisor')}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  roleFilter === 'advisor' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Advisors ({directoryItems.filter(i => i.role === 'advisor').length})
              </button>
              <button
                onClick={() => handleRoleSelect('vendor')}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  roleFilter === 'vendor' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Vendors ({directoryItems.filter(i => i.role === 'vendor').length})
              </button>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-semibold cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Showing <span className="text-blue-700 dark:text-blue-400">{filteredBusinesses.length}</span> verified healthcare partner{filteredBusinesses.length === 1 ? '' : 's'}
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {currentUser?.role === 'admin' && (
              <button
                onClick={onOpenAdminDirectory}
                className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 underline cursor-pointer flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Admin CSV Console</span>
              </button>
            )}
            <button
              onClick={onPostRequirement}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline cursor-pointer flex items-center gap-1"
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
                className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/90 dark:border-slate-700 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-blue-300 dark:hover:border-blue-600"
              >
                <div>
                  {/* Card Header: Role badge & location */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      item.role === 'advisor'
                        ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                        : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    }`}>
                      {item.role === 'advisor' ? 'Advisor' : 'Vendor'}
                    </span>

                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.location}</span>
                    </div>
                  </div>

                  {/* Company Name & Verification */}
                  <div className="mb-2">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {item.name}
                      </h4>
                      {item.verified && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" title="Verified Partner by NOVA" />
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
                              className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 text-[10px] font-semibold"
                            >
                              {stg}
                            </span>
                          ))}
                          {item.projectStages.length > 2 && (
                            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                              +{item.projectStages.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category:</span>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
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
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {item.reviewsCount} verified reviews
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Products & Services Tags */}
                  <div className="space-y-1.5 mb-4">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Key Offerings:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.productsAndServices?.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200/60 dark:border-slate-650"
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
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {onToggleCompare && (
                      <label 
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer select-none transition-all ${
                          comparedIds.includes(item.id)
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-600'
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

                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {item.yearsOfExperience}+ yrs exp
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    {currentUser ? (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                        <Unlock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Full Details</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-0.5" title="Log in to view phone, commercial pricing & GSTIN">
                        <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>Limited</span>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onSelectVendor(item)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 text-blue-700 dark:text-blue-300 hover:text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{currentUser ? 'View Full Profile' : 'View Profile'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <Filter className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No matching partners found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
              Try resetting your filters or tell our network what you need.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
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

        {/* Filtered Search QR Code Modal */}
        {qrModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 relative animate-scaleUp text-slate-900 dark:text-white">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    Directory Search QR Code
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Scan with any phone camera to land directly on this filtered search
                  </p>
                </div>
              </div>

              {/* Active Criteria Badges */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 text-xs">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                  Encoded Search Criteria:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {roleFilter !== 'all' && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold text-[11px]">
                      Role: {roleFilter.toUpperCase()}
                    </span>
                  )}
                  {selectedLocation !== 'All' && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedLocation}
                    </span>
                  )}
                  {selectedStage !== 'All' && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-semibold text-[11px]">
                      Stage: {selectedStage}
                    </span>
                  )}
                  {selectedCategory !== 'All' && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-semibold text-[11px]">
                      Category: {selectedCategory}
                    </span>
                  )}
                  {appliedSearchQuery && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold text-[11px]">
                      Keyword: &ldquo;{appliedSearchQuery}&rdquo;
                    </span>
                  )}
                  {!hasActiveFilters && (
                    <span className="text-slate-500 italic text-[11px]">
                      Default: All Indian Healthcare Partners
                    </span>
                  )}
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4">
                <div className="relative p-2.5 bg-white rounded-xl border border-teal-600 shadow-md">
                  {/* Viewfinder corner accents */}
                  <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-teal-600 rounded-tl-xs pointer-events-none" />
                  <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-teal-600 rounded-tr-xs pointer-events-none" />
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-teal-600 rounded-bl-xs pointer-events-none" />
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-teal-600 rounded-br-xs pointer-events-none" />

                  {qrModalPng ? (
                    <img
                      src={qrModalPng}
                      alt="Directory Filter QR Code"
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 sm:w-52 sm:h-52 bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-400">
                      Generating Filtered QR...
                    </div>
                  )}
                </div>

                {/* Dedicated Copy Icon directly beside the QR code link selection */}
                <div className="mt-3 w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate flex-1 select-all" title={currentSearchUrl}>
                    {currentSearchUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySearchLink}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer shrink-0"
                    title="Copy QR code target link"
                    aria-label="Copy search link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleCopySearchLink}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy URL'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSearchQrPng}
                  className="px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Download High-Res PNG"
                >
                  <Download className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                  <span>PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSearchQrSvg}
                  className="px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Download Print Vector SVG"
                >
                  <Download className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                  <span>SVG</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>

              {/* Admin Studio Navigation Link if available */}
              {onOpenPamphletQr && (
                <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setQrModalOpen(false);
                      onOpenPamphletQr();
                    }}
                    className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 underline cursor-pointer"
                  >
                    Open in Full Admin Pamphlet &amp; Flyer Studio &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
