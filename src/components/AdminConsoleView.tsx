import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  ShieldCheck, 
  Building2, 
  HardHat, 
  UserCheck, 
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Check,
  ArrowLeft,
  LogOut,
  BookOpen,
  Tag,
  Gift,
  Sparkles,
  CreditCard,
  Users,
  QrCode,
  Server,
  Database,
  Sliders,
  AlertTriangle,
  Layers,
  X
} from 'lucide-react';
import { DirectoryItem, AuthUser, StageItem, ProjectRequirement, Coupon, CouponRedemption, UserRole } from '../types';
import { 
  parseDirectoryCSV, 
  generateSampleDirectoryCSV, 
  saveStoredDirectory, 
  resetDirectoryToDefault 
} from '../utils/directoryStorage';
import { getStoredRequirements } from '../utils/requirementsStorage';
import { 
  getStoredCouponRedemptions, 
  getAllCoupons, 
  updateCouponLimits, 
  createCoupon, 
  resetCouponLimits, 
  deleteCustomCoupon,
  PRESET_COUPONS 
} from '../utils/couponService';
import { AdminToolkitEditor } from './AdminToolkitEditor';
import { AdminRequirementsManager } from './AdminRequirementsManager';
import { AdminUsersManager } from './AdminUsersManager';
import { AdminAccreditationManager } from './admin/AdminAccreditationManager';
import { AdminClaimsManager } from './admin/AdminClaimsManager';
import { PamphletSection } from './PamphletSection';
import { getAllUsers } from '../utils/userManagement';
import { MjmlTemplateBuilder } from './mjml/MjmlTemplateBuilder';
import { isFeatureEnabled } from '../utils/featureFlags';

export type AdminTabType = 'users' | 'manage' | 'claims' | 'requirements' | 'import_csv' | 'add_vendor' | 'toolkit_stages' | 'accreditation_programmes' | 'coupons' | 'pamphlet' | 'mjml_builder';

interface AdminConsoleViewProps {
  directoryItems: DirectoryItem[];
  onUpdateDirectory: (updatedList: DirectoryItem[]) => void;
  toolkitStages: StageItem[];
  onUpdateToolkitStages: (updatedStages: StageItem[]) => void;
  onNotify: (msg: string) => void;
  currentUser: AuthUser | null;
  onLogout?: () => void;
  onBackToHome?: () => void;
  onNavigate?: (slug: any) => void;
  onImpersonateUser?: (user: AuthUser) => void;
  externalActiveTab?: AdminTabType;
  onTabChange?: (tab: AdminTabType) => void;
  isFullWidth?: boolean;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  directoryItems,
  onUpdateDirectory,
  toolkitStages,
  onUpdateToolkitStages,
  onNotify,
  currentUser,
  onLogout,
  onBackToHome,
  onNavigate,
  onImpersonateUser,
  externalActiveTab,
  onTabChange,
  isFullWidth = false
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<AdminTabType>('users');
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = (tab: AdminTabType) => {
    setInternalActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };
  const [requirements, setRequirements] = useState<ProjectRequirement[]>(() => getStoredRequirements());
  const [couponsList, setCouponsList] = useState<Coupon[]>(() => getAllCoupons());
  const [couponRedemptions, setCouponRedemptions] = useState<CouponRedemption[]>(() => getStoredCouponRedemptions());

  // Edit Coupon Limit modal/drawer state
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editMaxTotalUses, setEditMaxTotalUses] = useState<string>(''); // blank = unlimited
  const [editMaxUsesPerUser, setEditMaxUsesPerUser] = useState<number>(1);
  const [editDescription, setEditDescription] = useState<string>('');

  // Create new coupon form state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'flat'>('percentage');
  const [newCouponDiscount, setNewCouponDiscount] = useState('100');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponMaxTotal, setNewCouponMaxTotal] = useState<string>(''); // blank = unlimited
  const [newCouponMaxPerUser, setNewCouponMaxPerUser] = useState<number>(1);
  const [newCouponRoles, setNewCouponRoles] = useState<UserRole[]>(['vendor', 'advisor', 'owner']);

  // Sync coupons with backend & storage
  useEffect(() => {
    const handleCouponsChange = () => {
      setCouponsList(getAllCoupons());
    };
    window.addEventListener('nova_coupons_updated', handleCouponsChange);

    fetch('/api/coupons')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCouponsList(data);
        }
      })
      .catch(() => {});

    return () => window.removeEventListener('nova_coupons_updated', handleCouponsChange);
  }, []);

  const handleRefreshCoupons = async () => {
    setCouponRedemptions(getStoredCouponRedemptions());
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const apiCoupons = await res.json();
        if (Array.isArray(apiCoupons) && apiCoupons.length > 0) {
          setCouponsList(apiCoupons);
          onNotify('Refreshed coupon limits & redemptions from database.');
          return;
        }
      }
    } catch {
      // fallback
    }
    setCouponsList(getAllCoupons());
    onNotify('Refreshed latest coupon limits & redemptions log.');
  };

  const handleOpenLimitEditor = (cpn: Coupon) => {
    setEditingCoupon(cpn);
    setEditMaxTotalUses(cpn.maxTotalUses !== null && cpn.maxTotalUses !== undefined ? String(cpn.maxTotalUses) : '');
    setEditMaxUsesPerUser(cpn.maxUsesPerUser !== undefined && cpn.maxUsesPerUser !== null ? cpn.maxUsesPerUser : 1);
    setEditDescription(cpn.description || '');
  };

  const handleSaveCouponLimits = () => {
    if (!editingCoupon) return;
    const cleanTotal = editMaxTotalUses.trim() === '' ? null : Number(editMaxTotalUses);
    const cleanPerUser = Math.max(1, Number(editMaxUsesPerUser) || 1);

    const updated = updateCouponLimits(editingCoupon.code, {
      maxTotalUses: cleanTotal,
      maxUsesPerUser: cleanPerUser,
      description: editDescription.trim() || editingCoupon.description
    });
    setCouponsList(updated);
    setEditingCoupon(null);
    onNotify(`Saved usage limits for coupon "${editingCoupon.code}": Global Limit: ${cleanTotal !== null ? cleanTotal : 'Unlimited'}, Per-User: ${cleanPerUser}.`);
  };

  const handleResetLimits = (code: string) => {
    if (window.confirm(`Reset limits for preset code "${code}" to default (Unlimited global pool, 1 use per user)?`)) {
      const updated = resetCouponLimits(code);
      setCouponsList(updated);
      onNotify(`Reset coupon "${code}" to default single redemption per user with unlimited global pool.`);
    }
  };

  const handleDeleteCustomCoupon = (code: string) => {
    if (window.confirm(`Permanently delete coupon code "${code}"?`)) {
      const updated = deleteCustomCoupon(code);
      setCouponsList(updated);
      onNotify(`Deleted custom coupon code "${code}".`);
    }
  };

  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const val = Number(newCouponDiscount);
    if (isNaN(val) || val <= 0) return;

    const parsedMaxTotal = newCouponMaxTotal.trim() === '' ? null : Number(newCouponMaxTotal);
    const parsedMaxPerUser = Math.max(1, Number(newCouponMaxPerUser) || 1);

    const newCpn: Coupon = {
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      discountValue: val,
      description: newCouponDesc.trim() || `${val}${newCouponType === 'percentage' ? '%' : ' INR'} Promotional Discount Code`,
      applicableRoles: newCouponRoles.length > 0 ? newCouponRoles : ['vendor', 'advisor', 'owner'],
      maxTotalUses: parsedMaxTotal,
      maxUsesPerUser: parsedMaxPerUser
    };

    const updated = createCoupon(newCpn);
    setCouponsList(updated);
    setNewCouponCode('');
    setNewCouponDiscount('100');
    setNewCouponDesc('');
    setNewCouponMaxTotal('');
    setNewCouponMaxPerUser(1);
    onNotify(`Published coupon "${newCpn.code}" with ${parsedMaxTotal !== null ? parsedMaxTotal + ' global limit' : 'unlimited pool'} and ${parsedMaxPerUser} per user.`);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'vendor' | 'advisor'>('all');

  // Database Connection Health State
  const [dbStatus, setDbStatus] = useState<{
    configured: boolean;
    provider: string;
    urlMasked: string | null;
  } | null>(null);
  const [showDbModal, setShowDbModal] = useState(false);
  const [isTestingDb, setIsTestingDb] = useState(false);

  const checkDbHealth = async (showNotification = false) => {
    setIsTestingDb(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        if (data && data.database) {
          setDbStatus(data.database);
          if (showNotification) {
            onNotify(data.database.configured 
              ? `Connected to ${data.database.provider} (${data.database.urlMasked || 'Active'})`
              : 'Operating in Local Storage fallback mode. DATABASE_URL not set.'
            );
          }
        }
      }
    } catch (err) {
      if (showNotification) {
        onNotify('Could not connect to health API. Running offline.');
      }
    } finally {
      setIsTestingDb(false);
    }
  };

  useEffect(() => {
    checkDbHealth();
  }, []);

  // CSV Import states
  const [csvText, setCsvText] = useState('');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [previewParsedItems, setPreviewParsedItems] = useState<DirectoryItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Add / Edit Single Vendor state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [vendorForm, setVendorForm] = useState<Partial<DirectoryItem>>({
    name: '',
    role: 'vendor',
    category: 'Biomedical Equipment',
    location: 'Mumbai',
    serviceLocations: ['Mumbai', 'All India'],
    projectStages: ['Medical Equipment & Technology'],
    productsAndServices: ['Critical Care Devices'],
    description: '',
    phone: '+91 98200 11223',
    contactEmail: 'contact@partner.in',
    website: 'https://www.partner.in',
    yearsOfExperience: 10,
    rating: 4.8,
    reviewsCount: 12,
    verified: true,
    gstin: '27AAACP1234K1Z2',
    priceRange: 'Standard Project Pricing',
    turnaroundTime: '2 - 4 Weeks',
    certifications: ['ISO 9001', 'NABH Compliant'],
    clientPortfolio: ['City Hospital'],
    headquartersAddress: 'Mumbai, India'
  });

  // Filter directory items for the management table
  const filteredItems = directoryItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.gstin && item.gstin.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = filterRole === 'all' ? true : item.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleFile = (file: File) => {
    if (!file) return;
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setImportErrors(['Please select a valid .csv spreadsheet file.']);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setCsvText(content);
        const { items, errors } = parseDirectoryCSV(content);
        setPreviewParsedItems(items);
        setImportErrors(errors);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCSV = () => {
    const sample = generateSampleDirectoryCSV();
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'nova_directory_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('Downloaded sample CSV template (nova_directory_template.csv)');
  };

  const handleApplyCsvImport = (mode: 'append' | 'replace') => {
    if (previewParsedItems.length === 0) {
      onNotify('No valid entries parsed to import.');
      return;
    }

    let newList: DirectoryItem[];
    if (mode === 'replace') {
      newList = previewParsedItems;
      onNotify(`Replaced directory with ${previewParsedItems.length} imported listings.`);
    } else {
      // Append mode: deduplicate by id/name
      const existingIds = new Set(directoryItems.map(i => i.id));
      const additions = previewParsedItems.filter(p => !existingIds.has(p.id));
      newList = [...additions, ...directoryItems];
      onNotify(`Appended ${additions.length} new listings to the directory.`);
    }

    saveStoredDirectory(newList);
    onUpdateDirectory(newList);
    setPreviewParsedItems([]);
    setCsvText('');
    setImportErrors([]);
    setActiveTab('manage');
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the live directory?`)) {
      const updated = directoryItems.filter(item => item.id !== id);
      saveStoredDirectory(updated);
      onUpdateDirectory(updated);
      onNotify(`Removed "${name}" from directory.`);
    }
  };

  const handleStartEdit = (item: DirectoryItem) => {
    setEditingItemId(item.id);
    setVendorForm({ ...item });
    setActiveTab('add_vendor');
  };

  const handleSaveVendorForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name) {
      alert('Please provide a partner name.');
      return;
    }

    if (editingItemId) {
      const updated = directoryItems.map(i => {
        if (i.id === editingItemId) {
          return { ...i, ...vendorForm } as DirectoryItem;
        }
        return i;
      });
      saveStoredDirectory(updated);
      onUpdateDirectory(updated);
      onNotify(`Successfully updated listing for "${vendorForm.name}".`);
      setEditingItemId(null);
    } else {
      const newItem: DirectoryItem = {
        id: `dir-manual-${Date.now()}`,
        name: vendorForm.name || 'New Healthcare Partner',
        role: vendorForm.role || 'vendor',
        category: vendorForm.category || 'Hospital Consulting',
        rating: vendorForm.rating || 4.9,
        reviewsCount: vendorForm.reviewsCount || 10,
        location: vendorForm.location || 'Mumbai',
        serviceLocations: vendorForm.serviceLocations || ['All India'],
        projectStages: vendorForm.projectStages || ['Civil Construction & MEP'],
        productsAndServices: vendorForm.productsAndServices || ['Hospital Infrastructure Solutions'],
        description: vendorForm.description || 'Verified healthcare solutions provider in the NOVA ecosystem.',
        verified: true,
        yearsOfExperience: vendorForm.yearsOfExperience || 8,
        contactEmail: vendorForm.contactEmail || 'partner@nova-h.in',
        phone: vendorForm.phone || '+91 98200 12345',
        website: vendorForm.website || 'https://www.nova-h.in',
        gstin: vendorForm.gstin || '27AAACG1234K1Z1',
        priceRange: vendorForm.priceRange || 'Commercial Terms on Inquiry',
        turnaroundTime: vendorForm.turnaroundTime || '2 - 4 Weeks',
        certifications: vendorForm.certifications || ['ISO 9001'],
        clientPortfolio: vendorForm.clientPortfolio || ['Metro Multispecialty Hospital'],
        headquartersAddress: vendorForm.headquartersAddress || 'India',
        complianceBadges: ['Verified Administrative Partner']
      };

      const updated = [newItem, ...directoryItems];
      saveStoredDirectory(updated);
      onUpdateDirectory(updated);
      onNotify(`Added "${newItem.name}" to directory.`);
    }

    setActiveTab('manage');
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset directory back to original curated seed listings? Any custom additions will be cleared.')) {
      const resetList = resetDirectoryToDefault();
      onUpdateDirectory(resetList);
      onNotify('Directory restored to default curated list.');
    }
  };

  const adminSlugMap: Record<AdminTabType, string> = {
    users: '/admin/users',
    manage: '/admin/directory',
    claims: '/admin/claims',
    requirements: '/admin/requirements',
    import_csv: '/admin/import-csv',
    add_vendor: '/admin/add-partner',
    toolkit_stages: '/admin/toolkit',
    accreditation_programmes: '/admin/accreditation',
    coupons: '/admin/coupons',
    pamphlet: '/admin/pamphlet',
    mjml_builder: '/admin/mjml'
  };

  return (
    <div className={`animate-fadeIn ${isFullWidth ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
      {/* Top Banner with Navigation */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-md font-black shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  NOVA Administrative Console
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {adminSlugMap[activeTab] || '/admin'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {currentUser?.email || 'admin@nova-h.in'}
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                Dedicated management portal to inspect verified hospital partners, perform bulk CSV imports, and configure live listings across the network.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isFeatureEnabled('mjml_studio') && onNavigate && (
              <button
                onClick={() => onNavigate('mjml-builder')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Mail className="w-4 h-4 text-purple-200" />
                <span>MJML Email Studio</span>
              </button>
            )}

            {onNavigate && (
              <button
                onClick={() => onNavigate('rfp')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <FileText className="w-4 h-4" />
                <span>RFP &amp; Procurement Hub</span>
              </button>
            )}

            {isFeatureEnabled('architecture') && onNavigate && (
              <button
                onClick={() => onNavigate('architecture')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700 shadow-md"
              >
                <Server className="w-4 h-4 text-blue-400" />
                <span>Backend &amp; Cost Specs</span>
              </button>
            )}

            <button
              onClick={() => setShowDbModal(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-md ${
                dbStatus?.configured 
                  ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-300 hover:bg-emerald-900/80' 
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
              title="View Neon PostgreSQL Database status & configuration"
            >
              <Database className={`w-3.5 h-3.5 ${dbStatus?.configured ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span>{dbStatus?.configured ? 'Neon DB (Active)' : 'Database Setup'}</span>
            </button>

            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Portal</span>
              </button>
            )}

            <button
              onClick={handleResetToDefaults}
              title="Reset directory to initial seed data"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* TAB 0: USERS & MEMBERSHIP PLANS */}
        {activeTab === 'users' && (
          <div className="p-6 sm:p-8">
            <AdminUsersManager
              currentUser={currentUser}
              onImpersonate={onImpersonateUser}
              onNotify={onNotify}
            />
          </div>
        )}

        {/* TAB 1: MANAGE LISTINGS */}
        {activeTab === 'manage' && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search by name, category, GSTIN, city or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs">
                  <button
                    onClick={() => setFilterRole('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      filterRole === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    All ({directoryItems.length})
                  </button>
                  <button
                    onClick={() => setFilterRole('vendor')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      filterRole === 'vendor' ? 'bg-white shadow-xs text-indigo-900' : 'text-slate-600'
                    }`}
                  >
                    Vendors ({directoryItems.filter(i => i.role === 'vendor').length})
                  </button>
                  <button
                    onClick={() => setFilterRole('advisor')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      filterRole === 'advisor' ? 'bg-white shadow-xs text-sky-900' : 'text-slate-600'
                    }`}
                  >
                    Advisors ({directoryItems.filter(i => i.role === 'advisor').length})
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Partner Entity</th>
                    <th className="p-4">Community Role</th>
                    <th className="p-4">Primary Category</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">GSTIN &amp; Verification</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No directory listings match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{item.contactEmail}</span>
                            <span>&bull;</span>
                            <span>{item.phone}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            item.role === 'vendor'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}>
                            {item.role === 'vendor' ? <HardHat className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                            <span>{item.role}</span>
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-800">
                          {item.category}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.location}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-mono text-[11px] font-semibold text-slate-800">
                            {item.gstin || 'GSTIN Pending'}
                          </div>
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified Profile</span>
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                              title="Edit listing details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remove from directory"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CLAIMS: PROFILE OWNERSHIP AUDIT QUEUE */}
        {activeTab === 'claims' && (
          <div className="p-6 sm:p-8">
            <AdminClaimsManager
              directoryItems={directoryItems}
              onUpdateDirectory={onUpdateDirectory}
              onNotify={onNotify}
            />
          </div>
        )}

        {/* TAB 2: BULK CSV IMPORT */}
        {activeTab === 'import_csv' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-purple-50/70 border border-purple-200">
              <div>
                <h3 className="text-sm font-extrabold text-purple-950">
                  Bulk CSV Ingestion Specification
                </h3>
                <p className="text-xs text-purple-800 mt-1 max-w-xl">
                  Upload standard CSV files matching columns: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-purple-200">Name, Role, Category, Location, Phone, ContactEmail, GSTIN, PriceRange</code>.
                </p>
              </div>

              <button
                onClick={handleDownloadSampleCSV}
                className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download Sample Template</span>
              </button>
            </div>

            {/* Drag and drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFile(e.dataTransfer.files[0]);
                }
              }}
              className={`p-8 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer ${
                dragOver ? 'border-purple-600 bg-purple-50/50' : 'border-slate-300 hover:border-purple-400 bg-slate-50/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <UploadCloud className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">
                Click to browse or drop CSV spreadsheet file here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports UTF-8 CSV exports from Excel, Google Sheets, or CRM databases.
              </p>
            </div>

            {/* Raw CSV Text Paste Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Or Paste CSV Text Directly:
              </label>
              <textarea
                rows={5}
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  if (e.target.value.trim()) {
                    const { items, errors } = parseDirectoryCSV(e.target.value);
                    setPreviewParsedItems(items);
                    setImportErrors(errors);
                  } else {
                    setPreviewParsedItems([]);
                    setImportErrors([]);
                  }
                }}
                placeholder="Name,Role,Category,Location,Phone,ContactEmail,Website,GSTIN,PriceRange..."
                className="w-full p-3 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>

            {/* Error notifications */}
            {importErrors.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Validation Notices ({importErrors.length}):</span>
                </div>
                <ul className="list-disc pl-5 text-xs text-amber-700 space-y-0.5">
                  {importErrors.slice(0, 4).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                  {importErrors.length > 4 && <li>...and {importErrors.length - 4} more warnings.</li>}
                </ul>
              </div>
            )}

            {/* Preview Parsed Items */}
            {previewParsedItems.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Successfully parsed {previewParsedItems.length} listings from CSV</span>
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleApplyCsvImport('append')}
                      className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Append to Existing Directory</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Replace all existing directory listings with this CSV batch?')) {
                          handleApplyCsvImport('replace');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace Entire Directory</span>
                    </button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3">GSTIN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {previewParsedItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{item.name}</td>
                          <td className="p-3 uppercase text-[10px] font-bold text-slate-600">{item.role}</td>
                          <td className="p-3">{item.category}</td>
                          <td className="p-3">{item.location}</td>
                          <td className="p-3 text-slate-600">{item.contactEmail}</td>
                          <td className="p-3 font-mono text-[11px]">{item.gstin || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADD / EDIT LISTING */}
        {activeTab === 'add_vendor' && (
          <form onSubmit={handleSaveVendorForm} className="p-6 sm:p-8 space-y-5">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingItemId ? `Edit Listing: ${vendorForm.name}` : 'Add New Healthcare Partner'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure GSTIN and contact details are verified before publishing to the live network.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Entity / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Biomedical Systems Pvt Ltd"
                  value={vendorForm.name || ''}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Community Role *
                </label>
                <select
                  value={vendorForm.role || 'vendor'}
                  onChange={(e) => setVendorForm({ ...vendorForm, role: e.target.value as 'vendor' | 'advisor' })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="vendor">Vendor (Equipment &amp; Technology)</option>
                  <option value="advisor">Advisor (Specialist &amp; Consultant)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Healthcare Category *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Medical Gas Pipeline (MGPS)"
                  value={vendorForm.category || ''}
                  onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Base City / Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad"
                  value={vendorForm.location || ''}
                  onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Contact Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="partner@company.com"
                  value={vendorForm.contactEmail || ''}
                  onChange={(e) => setVendorForm({ ...vendorForm, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone / Contact Desk *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98200 11223"
                  value={vendorForm.phone || ''}
                  onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Corporate GSTIN (Verification)
                </label>
                <input
                  type="text"
                  placeholder="27AAACP1234K1Z2"
                  value={vendorForm.gstin || ''}
                  onChange={(e) => setVendorForm({ ...vendorForm, gstin: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Commercial Terms / Price Band
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹5,00,000 – ₹15,00,000 per ICU wing"
                  value={vendorForm.priceRange || ''}
                  onChange={(e) => setVendorForm({ ...vendorForm, priceRange: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Public Overview &amp; Summary *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe key hospital projects executed, NABH compliance capabilities, and equipment ranges..."
                value={vendorForm.description || ''}
                onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('manage')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingItemId ? 'Update Listing' : 'Publish Listing to Directory'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: TOOLKIT 15 STAGES EDITOR */}
        {activeTab === 'toolkit_stages' && (
          <div className="p-6 sm:p-8">
            <AdminToolkitEditor
              stages={toolkitStages}
              onUpdateStages={onUpdateToolkitStages}
              onNotify={onNotify}
            />
          </div>
        )}

        {/* TAB 4.5: ACCREDITATION PROGRAMMES & STAGE MAPPING */}
        {activeTab === 'accreditation_programmes' && (
          <div className="p-6 sm:p-8">
            <AdminAccreditationManager
              toolkitStages={toolkitStages}
              onNotify={onNotify}
            />
          </div>
        )}

        {/* TAB 5: SUBMITTED PROJECT REQUIREMENTS MANAGEMENT */}
        {activeTab === 'requirements' && (
          <div className="p-6 sm:p-8">
            <AdminRequirementsManager
              requirements={requirements}
              onUpdateRequirements={(updated) => setRequirements(updated)}
              directoryItems={directoryItems}
              onNotify={onNotify}
            />
          </div>
        )}

        {/* TAB 6: COUPONS, BNI CODES & USAGE LIMIT CONFIGURATION */}
        {activeTab === 'coupons' && (
          <div className="p-6 sm:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <Tag className="w-5 h-5" />
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    Coupon, BNI Code &amp; Usage Limit Configuration
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Configure promotional &amp; BNI codes, enforce global pool and per-user redemption caps, and audit member activations.
                </p>
              </div>

              <button
                onClick={handleRefreshCoupons}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer self-start md:self-auto transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Codes &amp; Quotas</span>
              </button>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Redemptions</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{couponRedemptions.length}</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">100% Free Activations (₹0)</span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">
                  {couponRedemptions.filter(r => r.isComplimentary || r.finalPayable === 0).length}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Razorpay Paid Redemptions</span>
                <span className="text-2xl font-black text-blue-700 mt-1 block">
                  {couponRedemptions.filter(r => !r.isComplimentary && r.finalPayable > 0).length}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">Active Coupon Codes</span>
                <span className="text-2xl font-black text-purple-700 mt-1 block">
                  {couponsList.length}
                </span>
              </div>
            </div>

            {/* Code Directory & Generator */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Active Codes List (2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-emerald-600" />
                    <span>Configured Codes &amp; Usage Limits</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {couponsList.length} active promo codes
                  </span>
                </div>

                <div className="space-y-3">
                  {couponsList.map((cpn) => {
                    const isPreset = PRESET_COUPONS.some(p => p.code.toUpperCase() === cpn.code.toUpperCase());
                    const redemptionsCount = cpn.totalRedemptions || 0;
                    const hasGlobalCap = cpn.maxTotalUses !== null && cpn.maxTotalUses !== undefined && cpn.maxTotalUses > 0;
                    const isLimitReached = hasGlobalCap && redemptionsCount >= (cpn.maxTotalUses as number);
                    const remainingGlobal = hasGlobalCap ? Math.max(0, (cpn.maxTotalUses as number) - redemptionsCount) : null;
                    const percentUsed = hasGlobalCap ? Math.min(100, Math.round((redemptionsCount / (cpn.maxTotalUses as number)) * 100)) : 0;

                    return (
                      <div 
                        key={cpn.code} 
                        className={`p-4 rounded-xl border transition-all ${
                          isLimitReached 
                            ? 'border-red-200 bg-red-50/30' 
                            : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50'
                        } text-xs space-y-3`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-300 font-mono font-black text-slate-900 tracking-wider text-xs shadow-2xs">
                                {cpn.code}
                              </span>
                              {cpn.discountValue === 100 && cpn.discountType === 'percentage' ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-emerald-600" />
                                  100% Complimentary (Direct ₹0)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-200 flex items-center gap-1">
                                  <CreditCard className="w-3 h-3 text-blue-600" />
                                  {cpn.discountType === 'percentage' ? `${cpn.discountValue}% Off` : `₹${cpn.discountValue} Off`} (Razorpay)
                                </span>
                              )}

                              {isLimitReached ? (
                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px] border border-red-300 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-red-600" />
                                  Limit Reached (Blocked)
                                </span>
                              ) : hasGlobalCap && remainingGlobal !== null && remainingGlobal <= 5 ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300">
                                  {remainingGlobal} remaining
                                </span>
                              ) : null}
                            </div>
                            <p className="text-slate-600 text-[11px] mt-1.5 font-medium leading-relaxed">
                              {cpn.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <button
                              onClick={() => handleOpenLimitEditor(cpn)}
                              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                              title="Configure usage limits"
                            >
                              <Sliders className="w-3 h-3 text-blue-600" />
                              <span>Configure Limits</span>
                            </button>

                            {isPreset ? (
                              <button
                                onClick={() => handleResetLimits(cpn.code)}
                                className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 text-[11px] font-medium transition-colors cursor-pointer"
                                title="Reset to preset defaults"
                              >
                                Reset
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDeleteCustomCoupon(cpn.code)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete custom code"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Quota and Usage Limits Breakdown */}
                        <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                          <div className="flex flex-wrap items-center gap-3">
                            {/* Global Quota */}
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-500">Global Pool:</span>
                              {hasGlobalCap ? (
                                <span className={`font-bold ${isLimitReached ? 'text-red-700' : 'text-slate-800'}`}>
                                  {redemptionsCount} / {cpn.maxTotalUses} used ({remainingGlobal} remaining)
                                </span>
                              ) : (
                                <span className="font-bold text-emerald-700">
                                  Unlimited Pool ({redemptionsCount} redeemed)
                                </span>
                              )}
                            </div>

                            {/* Per-User Cap */}
                            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                              <span className="font-semibold text-slate-500">Per-User Limit:</span>
                              <span className="font-bold text-indigo-700">
                                {cpn.maxUsesPerUser || 1} {Number(cpn.maxUsesPerUser) === 1 ? 'redemption / account' : 'redemptions / account'}
                              </span>
                            </div>
                          </div>

                          <div className="text-slate-500 text-[10px]">
                            <span className="font-medium text-slate-600">Roles:</span>{' '}
                            {cpn.applicableRoles ? cpn.applicableRoles.join(', ') : 'All Roles'}
                          </div>
                        </div>

                        {/* Visual Progress Bar for Global Cap */}
                        {hasGlobalCap && (
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                isLimitReached 
                                  ? 'bg-red-500' 
                                  : percentUsed > 75 
                                    ? 'bg-amber-500' 
                                    : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percentUsed}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Promo Code Form (1 col) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-purple-600" />
                  <span>Issue New Promo / BNI Code</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Instantly publish a coupon with custom discount, global pool cap, and per-user limits.
                </p>

                <form
                  onSubmit={handleCreateCouponSubmit}
                  className="space-y-3 pt-1"
                >
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Coupon Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BNIEXPO100"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono uppercase font-bold focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Discount Type</label>
                      <select
                        value={newCouponType}
                        onChange={(e) => setNewCouponType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:ring-2 focus:ring-purple-500 bg-white"
                      >
                        <option value="percentage">% Percentage</option>
                        <option value="flat">₹ Flat INR</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {newCouponType === 'percentage' ? 'Percentage (%) *' : 'Amount (₹) *'}
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={newCouponType === 'percentage' ? 100 : 100000}
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold focus:ring-2 focus:ring-purple-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* Usage Limits Configuration */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5">
                    <span className="font-bold text-slate-800 text-[11px] block flex items-center gap-1 text-purple-900">
                      <Sliders className="w-3.5 h-3.5 text-purple-600" />
                      Usage Limit Quotas
                    </span>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-700 text-[11px]">Total Global Redemption Limit</label>
                        <span className="text-[10px] text-slate-400">Empty = Unlimited</span>
                      </div>
                      <input
                        type="number"
                        min={1}
                        placeholder="e.g. 50 (leave empty for unlimited)"
                        value={newCouponMaxTotal}
                        onChange={(e) => setNewCouponMaxTotal(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 text-[11px] block mb-1">Per-User Redemption Limit</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={newCouponMaxPerUser}
                        onChange={(e) => setNewCouponMaxPerUser(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 text-xs font-bold"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Default: 1 redemption per account/phone.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Campaign Description</label>
                    <input
                      type="text"
                      placeholder="e.g. BNI Healthcare Conclave Free Access"
                      value={newCouponDesc}
                      onChange={(e) => setNewCouponDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>

                  {/* Applicable Roles */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Applicable Roles</label>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {(['vendor', 'advisor', 'owner'] as UserRole[]).map((r) => {
                        const isChecked = newCouponRoles.includes(r);
                        return (
                          <label key={r} className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1 rounded-md border border-slate-200">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewCouponRoles([...newCouponRoles, r]);
                                } else {
                                  setNewCouponRoles(newCouponRoles.filter(role => role !== r));
                                }
                              }}
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span className="capitalize">{r === 'owner' ? 'Hospital' : r}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Create &amp; Activate Code</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Recorded Coupon Redemptions Table */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Coupon Redemptions &amp; Member Activations Audit Log</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Records every membership activation where a promo or BNI waiver code was redeemed.
                  </p>
                </div>

                {couponRedemptions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const csvHeader = 'Redemption ID,Member Name,Role,Company,Plan,Coupon Code,Original Fee,Discount,Final Payable,Mode,Redeemed At,Transaction ID\n';
                        const csvRows = couponRedemptions.map(r => 
                          `"${r.id}","${r.userName}","${r.userRole}","${r.companyName}","${r.planTitle}","${r.couponCode}",${r.originalAmount},${r.discountAmount},${r.finalPayable},"${r.isComplimentary ? '100% Free' : 'Razorpay'}",${r.redeemedAt},"${r.transactionId}"`
                        ).join('\n');
                        const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `nova_coupon_redemptions_${Date.now()}.csv`;
                        link.click();
                        onNotify('Exported coupon redemptions CSV.');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Clear all recorded coupon redemptions?')) {
                          localStorage.removeItem('novah_coupon_redemptions');
                          setCouponRedemptions([]);
                          onNotify('Coupon redemptions log cleared.');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Log</span>
                    </button>
                  </div>
                )}
              </div>

              {couponRedemptions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <Tag className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-slate-800 text-sm">No Coupon Redemptions Recorded Yet</h5>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    When a vendor, advisor, or hospital owner inputs a code like <strong>BNI100</strong> or <strong>NOVA20</strong> at checkout, their redemption and direct activation will be logged here with complete timestamps.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-3">Member &amp; Organization</th>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Enrolled Plan</th>
                        <th className="py-3 px-3">Coupon Code</th>
                        <th className="py-3 px-3">Original Fee</th>
                        <th className="py-3 px-3">Discount</th>
                        <th className="py-3 px-3">Final Paid</th>
                        <th className="py-3 px-3">Activation Mode</th>
                        <th className="py-3 px-3">Redeemed At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {couponRedemptions.map((rdm) => (
                        <tr key={rdm.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">{rdm.userName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{rdm.companyName}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                              {rdm.userRole}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-800">
                            {rdm.planTitle}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {rdm.couponCode}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 line-through">
                            ₹{rdm.originalAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 font-bold text-emerald-600">
                            -₹{rdm.discountAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 font-black">
                            {rdm.finalPayable === 0 ? (
                              <span className="text-emerald-700">₹0</span>
                            ) : (
                              <span className="text-blue-700">₹{rdm.finalPayable.toLocaleString('en-IN')}</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {rdm.isComplimentary || rdm.finalPayable === 0 ? (
                              <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full font-bold text-[10px]">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                100% Free Direct
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-full font-bold text-[10px]">
                                <CreditCard className="w-3 h-3 text-blue-600" />
                                Razorpay
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                            {new Date(rdm.redeemedAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 7: PRINTABLE PAMPHLET & SMART QR CODE (ADMIN ONLY) */}
        {activeTab === 'pamphlet' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-purple-50/80 border border-purple-200/90 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-700 text-white">
                  Admin Exclusive Asset
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  Printable Pamphlet &amp; Smart Geo-Location QR Code
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Generate, preview, print, or download vector QR codes and marketing pamphlets for physical distribution and hospital events.
                </p>
              </div>
            </div>

            <PamphletSection
              isDirectPage={true}
              onNavigate={onNavigate}
              onSimulateScan={() => {
                if (onNavigate) onNavigate('directory');
                onNotify('Redirecting to directory in scan simulation mode...');
              }}
            />
          </div>
        )}

        {/* TAB 8: MJML EMAIL BUILDER */}
        {activeTab === 'mjml_builder' && (
          <div className="h-[840px] w-full overflow-hidden">
            <MjmlTemplateBuilder
              onBack={() => setActiveTab('users')}
              onNotify={onNotify}
            />
          </div>
        )}
      </div>

      {/* Database Connection & Architecture Status Modal */}
      {showDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    PostgreSQL Database &amp; Express API
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live relational storage engine powered by Neon &amp; Drizzle ORM
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDbModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Connection Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                dbStatus?.configured 
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                      dbStatus?.configured ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      dbStatus?.configured ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'
                    }`}>
                      {dbStatus?.configured ? 'Connected & Migrated' : 'Operating in Hybrid Local Mode'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Provider: {dbStatus?.provider || 'Neon Serverless PostgreSQL / Local Store'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {dbStatus?.configured 
                      ? `Live PostgreSQL connection active. Endpoint: ${dbStatus.urlMasked || 'neon.tech'}`
                      : 'DATABASE_URL is not yet set in environment. The platform is running smoothly using durable local fallback, and will instantly connect as soon as DATABASE_URL is supplied.'}
                  </p>
                </div>

                <button
                  onClick={() => checkDbHealth(true)}
                  disabled={isTestingDb}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin' : ''}`} />
                  <span>{isTestingDb ? 'Testing...' : 'Test Health'}</span>
                </button>
              </div>

              {/* How to Connect to Neon */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    How to Connect to your Neon Project
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  1. Create a free PostgreSQL project at <span className="font-semibold text-slate-800 dark:text-slate-200">neon.tech</span>.<br />
                  2. Copy your connection string from the Neon dashboard.<br />
                  3. Add it as <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[11px] text-slate-800 dark:text-slate-200">DATABASE_URL</code> in your environment or Secrets panel:
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto select-all">
                  DATABASE_URL="postgresql://user:password@ep-xyz-123.region.aws.neon.tech/neondb?sslmode=require"
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  On server startup, NOVA automatically creates all tables and seeds the database without requiring manual SQL executions.
                </p>
              </div>

              {/* Relational Tables Monitored */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Relational Schema Tables
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">users</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold">RBAC &amp; Profiles</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">directory_items</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 font-bold">Vendors &amp; Advisors</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">accreditation_programmes</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 font-bold">NABH, JCI, NABL</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">project_requirements</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 font-bold">Hospital RFQs</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">enquiries</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300 font-bold">B2B Messaging</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">coupons &amp; redemptions</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 font-bold">Promos &amp; Audits</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
              <button
                onClick={() => setShowDbModal(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COUPON USAGE LIMITS EDIT MODAL */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                  <Sliders className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Usage Limits:</span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 font-mono text-xs">
                      {editingCoupon.code}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure global total redemption cap and per-user redemption limit.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingCoupon(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* Summary Banner */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-xs">
                    {editingCoupon.discountValue === 100 && editingCoupon.discountType === 'percentage'
                      ? '100% Complimentary Waiver (₹0 Payable)'
                      : `${editingCoupon.discountType === 'percentage' ? editingCoupon.discountValue + '%' : '₹' + editingCoupon.discountValue} Discount`}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    Recorded Redemptions: <strong className="text-slate-800 dark:text-slate-200">{editingCoupon.totalRedemptions || 0}</strong>
                  </span>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Active
                </span>
              </div>

              {/* 1. Global Total Limit */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    Total Global Redemption Limit
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Leave blank for unlimited global pool
                  </span>
                </div>
                <input
                  type="number"
                  min={editingCoupon.totalRedemptions || 0}
                  placeholder="Unlimited (no global cap)"
                  value={editMaxTotalUses}
                  onChange={(e) => setEditMaxTotalUses(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => setEditMaxTotalUses('')}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    Unlimited
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMaxTotalUses('25')}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    25 Uses
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMaxTotalUses('50')}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    50 Uses
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMaxTotalUses('100')}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    100 Uses
                  </button>
                </div>
              </div>

              {/* 2. Per-User Limit */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Per-User Redemption Limit *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={editMaxUsesPerUser}
                  onChange={(e) => setEditMaxUsesPerUser(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Maximum number of times an individual member account (email or phone) can redeem this code. Default: 1.
                </p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-slate-500">Presets:</span>
                  <button
                    type="button"
                    onClick={() => setEditMaxUsesPerUser(1)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    1 (Single Use)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMaxUsesPerUser(2)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    2 Uses
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMaxUsesPerUser(5)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    5 Uses
                  </button>
                </div>
              </div>

              {/* 3. Campaign Description */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Campaign Description
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCouponLimits}
                className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Save Limit Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
