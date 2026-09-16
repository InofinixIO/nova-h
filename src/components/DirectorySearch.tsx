import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Tag, 
  Layers, 
  Filter, 
  CheckCircle, 
  ExternalLink, 
  Mail, 
  Phone, 
  Star, 
  ShieldCheck, 
  X,
  Compass,
  QrCode,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { DIRECTORY_DATA } from '../data/mockData';
import { DirectoryItem } from '../types';
import { detectUserCity } from '../utils/geoUtils';

interface DirectorySearchProps {
  onSelectVendor: (vendor: DirectoryItem) => void;
  onPostRequirement: () => void;
  onOpenPamphletQr: () => void;
  autoDetectTrigger?: number;
}

export const DirectorySearch: React.FC<DirectorySearchProps> = ({ 
  onSelectVendor, 
  onPostRequirement,
  onOpenPamphletQr,
  autoDetectTrigger
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'vendor' | 'advisor'>('all');

  // Geolocation & Pamphlet Scan States
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [detectionMethod, setDetectionMethod] = useState<'gps' | 'ip' | 'fallback'>('gps');
  const [isPamphletScanActive, setIsPamphletScanActive] = useState(false);

  const locations = ['All', 'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];

  const triggerLocationDetection = async () => {
    setIsDetectingLocation(true);
    try {
      const result = await detectUserCity();
      setSelectedLocation(result.city);
      setDetectedCity(result.city);
      setDetectionMethod(result.method);
      setRoleFilter('vendor'); // Strictly filter vendors only when scanned / location requested
      setIsPamphletScanActive(true);
    } catch (err) {
      console.error('Location detection failed:', err);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Listen to autoDetectTrigger passed from modal simulation
  useEffect(() => {
    if (autoDetectTrigger && autoDetectTrigger > 0) {
      triggerLocationDetection();
      document.getElementById('directory-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autoDetectTrigger]);

  // Check URL parameters on mount: http://nova-h.in/directory?scan=true&role=vendor
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const isScan = urlParams.get('scan') === 'true' || urlParams.get('source') === 'pamphlet' || hash.includes('scan=true');
    const roleParam = urlParams.get('role');

    if (isScan || roleParam === 'vendor') {
      setRoleFilter('vendor');
      setIsPamphletScanActive(true);
      triggerLocationDetection();
    }
  }, []);
  
  const categories = [
    'All',
    'Hospital Consulting',
    'Architecture & Design',
    'MEP & HVAC',
    'Medical Equipment & Devices',
    'Healthcare IT & HIS',
    'Turnkey Infrastructure & MEP',
    'Accreditation & Quality / NABH'
  ];

  const stages = [
    'All',
    'Planning & Feasibility',
    'Design & Architecture',
    'Civil Construction & MEP',
    'Equipment Procurement',
    'Commissioning & Pre-op',
    'Operational Expansion'
  ];

  // Filtering logic
  const filteredBusinesses = useMemo(() => {
    return DIRECTORY_DATA.filter((item) => {
      // Location filter
      if (selectedLocation !== 'All') {
        const matchesLocation = item.location.toLowerCase() === selectedLocation.toLowerCase() ||
          item.serviceLocations.some(loc => loc.toLowerCase() === selectedLocation.toLowerCase() || loc === 'All India');
        if (!matchesLocation) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Project Stage filter
      if (selectedStage !== 'All' && !item.projectStages.includes(selectedStage)) {
        return false;
      }

      // Role filter
      if (roleFilter !== 'all' && item.role !== roleFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesService = item.productsAndServices.some(s => s.toLowerCase().includes(query));
        const matchesCat = item.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesService && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [selectedLocation, selectedCategory, selectedStage, searchQuery, roleFilter]);

  const resetFilters = () => {
    setSelectedLocation('All');
    setSelectedCategory('All');
    setSelectedStage('All');
    setSearchQuery('');
    setRoleFilter('all');
  };

  return (
    <section id="directory-section" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="text-center md:text-left max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Location-Based Search / Directory
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              Find the Right Partners Near You
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-1.5">
              Search verified vendors, advisors, and hospital infrastructure partners across Indian metros.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="open-pamphlet-qr-btn"
              onClick={onOpenPamphletQr}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
              title="Generate printable pamphlet with smart QR code"
            >
              <QrCode className="w-4 h-4 text-blue-400" />
              <span>Pamphlet & QR Code</span>
            </button>
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
              <label htmlFor="select-location" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Location</span>
                </span>
                {detectedCity && (
                  <span className="text-[10px] text-emerald-700 font-bold">
                    📍 {detectedCity}
                  </span>
                )}
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  id="select-location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-white border border-slate-300 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc === 'All' ? 'Select Location (All Regions)' : loc}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={triggerLocationDetection}
                  disabled={isDetectingLocation}
                  title="Detect my current location"
                  className="h-11 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Compass className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin text-blue-600' : ''}`} />
                  <span className="hidden xl:inline">{isDetectingLocation ? 'Locating...' : 'Detect'}</span>
                </button>
              </div>
            </div>

            {/* Category Select */}
            <div className="lg:col-span-3">
              <label htmlFor="select-category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Category</span>
              </label>
              <select
                id="select-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-white border border-slate-300 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'Select Category (All Disciplines)' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Stage Select */}
            <div className="lg:col-span-2">
              <label htmlFor="select-stage" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Project Stage</span>
              </label>
              <select
                id="select-stage"
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-white border border-slate-300 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {stages.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg === 'All' ? 'Select Stage (All)' : stg}
                  </option>
                ))}
              </select>
            </div>

            {/* Product / Service Input */}
            <div className="lg:col-span-3">
              <label htmlFor="search-keyword" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Product / Service</span>
              </label>
              <input
                id="search-keyword"
                type="text"
                placeholder="e.g. MRI, MGPS, NABH, Cleanroom"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-white border border-slate-300 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              />
            </div>

            {/* Search Button */}
            <div className="lg:col-span-1">
              <button
                id="directory-search-btn"
                onClick={() => {}}
                className="w-full h-11 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
              >
                <Search className="w-4 h-4" />
                <span className="lg:hidden">Search</span>
              </button>
            </div>

          </div>

          {/* Subtext and Quick Role Filter from Wireframe */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <p className="text-slate-600 font-medium">
              Browse all businesses freely. <strong>No sign up required.</strong>
            </p>

            {/* Quick role tabs */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  roleFilter === 'all' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({DIRECTORY_DATA.length})
              </button>
              <button
                onClick={() => setRoleFilter('advisor')}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  roleFilter === 'advisor' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Advisors
              </button>
              <button
                onClick={() => setRoleFilter('vendor')}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  roleFilter === 'vendor' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vendors
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
          <button
            onClick={onPostRequirement}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
          >
            Can&apos;t find what you need? Post a requirement &rarr;
          </button>
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
                      {item.role === 'advisor' ? 'Healthcare Advisor' : 'Verified Vendor'}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.location}</span>
                    </div>
                  </div>

                  {/* Name & Verification */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                    <span>{item.name}</span>
                    {item.verified && (
                      <span title="Verified NOVA Partner">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      </span>
                    )}
                  </h3>

                  {/* Category & Rating */}
                  <div className="flex items-center gap-3 my-2 text-xs text-slate-600">
                    <span className="font-semibold text-blue-800">{item.category}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800">{item.rating.toFixed(1)}</span>
                      <span className="text-slate-400">({item.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Products & Services Tags */}
                  <div className="space-y-1.5 mb-4">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Key Offerings:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.productsAndServices.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.productsAndServices.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-semibold">
                          +{item.productsAndServices.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {item.yearsOfExperience}+ yrs experience
                  </span>
                  <button
                    onClick={() => onSelectVendor(item)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Profile</span>
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
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 cursor-pointer"
              >
                Post Your Requirement
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
