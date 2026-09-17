import React, { useState, useRef } from 'react';
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
  Bot,
  Tag,
  Gift,
  Sparkles,
  CreditCard,
  Users
} from 'lucide-react';
import { DirectoryItem, AuthUser, StageItem, ProjectRequirement, Coupon, CouponRedemption } from '../types';
import { 
  parseDirectoryCSV, 
  generateSampleDirectoryCSV, 
  saveStoredDirectory, 
  resetDirectoryToDefault 
} from '../utils/directoryStorage';
import { getStoredRequirements } from '../utils/requirementsStorage';
import { getStoredCouponRedemptions, PRESET_COUPONS } from '../utils/couponService';
import { AdminToolkitEditor } from './AdminToolkitEditor';
import { AdminRequirementsManager } from './AdminRequirementsManager';
import { AdminUsersManager } from './AdminUsersManager';
import { getAllUsers } from '../utils/userManagement';

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
  onImpersonateUser
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'manage' | 'requirements' | 'import_csv' | 'add_vendor' | 'toolkit_stages' | 'coupons'>('users');
  const [requirements, setRequirements] = useState<ProjectRequirement[]>(() => getStoredRequirements());
  const [couponRedemptions, setCouponRedemptions] = useState<CouponRedemption[]>(() => getStoredCouponRedemptions());
  const [customCoupons, setCustomCoupons] = useState<Coupon[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('novah_custom_coupons') || '[]');
    } catch {
      return [];
    }
  });
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('100');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'vendor' | 'advisor'>('all');

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
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
                  Slug: /admin
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
            {onNavigate && (
              <button
                onClick={() => onNavigate('rfp')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <FileText className="w-4 h-4" />
                <span>RFP &amp; Procurement Hub</span>
              </button>
            )}

            {onNavigate && (
              <button
                onClick={() => onNavigate('whatsapp-flow')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Bot className="w-4 h-4" />
                <span>WhatsApp Flow Builder</span>
              </button>
            )}

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

        {/* Quick Tab Switcher */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center gap-3 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('users'); setEditingItemId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users &amp; Plans ({getAllUsers().length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('manage'); setEditingItemId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'manage'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Active Listings ({directoryItems.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('requirements'); setEditingItemId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'requirements'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Submitted Requirements ({requirements.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('import_csv'); setEditingItemId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'import_csv'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Bulk CSV Import</span>
          </button>

          <button
            onClick={() => {
              if (activeTab !== 'add_vendor') {
                setEditingItemId(null);
                setVendorForm({
                  name: '',
                  role: 'vendor',
                  category: 'Biomedical Equipment',
                  location: 'Mumbai',
                  serviceLocations: ['All India'],
                  projectStages: ['Medical Equipment & Technology'],
                  productsAndServices: ['Critical Care Solutions'],
                  description: '',
                  phone: '+91 98200 11223',
                  contactEmail: 'partner@domain.in',
                  website: 'https://domain.in',
                  yearsOfExperience: 10,
                  rating: 4.8,
                  reviewsCount: 15,
                  verified: true,
                  gstin: '27AAACP1234K1Z2',
                  priceRange: 'Commercial Terms on Inquiry',
                  turnaroundTime: '2 - 4 Weeks',
                  certifications: ['ISO 9001'],
                  clientPortfolio: ['City Multispecialty Hospital'],
                  headquartersAddress: 'Mumbai, India'
                });
              }
              setActiveTab('add_vendor');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'add_vendor'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingItemId ? 'Edit Listing' : 'Add New Listing'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('toolkit_stages');
              setEditingItemId(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'toolkit_stages'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>15 Stages Toolkit Editor ({toolkitStages.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('coupons');
              setEditingItemId(null);
              setCouponRedemptions(getStoredCouponRedemptions());
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Coupons &amp; Free Redemptions ({couponRedemptions.length})</span>
          </button>
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

        {/* TAB 6: COUPONS, BNI CODES & FREE REDEMPTIONS AUDIT */}
        {activeTab === 'coupons' && (
          <div className="p-6 sm:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <Tag className="w-5 h-5" />
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    Coupon, BNI Code &amp; Complimentary Redemptions
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Configure 100% waiver codes for direct ₹0 membership activation without payment gateway, and monitor live redemptions.
                </p>
              </div>

              <button
                onClick={() => {
                  setCouponRedemptions(getStoredCouponRedemptions());
                  onNotify('Refreshed latest coupon redemptions log.');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Logs</span>
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
                  {PRESET_COUPONS.length + customCoupons.length}
                </span>
              </div>
            </div>

            {/* Code Directory & Generator */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Active Codes List (2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-emerald-600" />
                  <span>Configured Promotional &amp; BNI Codes</span>
                </h4>

                <div className="space-y-2.5">
                  {[...PRESET_COUPONS, ...customCoupons].map((cpn) => (
                    <div 
                      key={cpn.code} 
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
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
                        </div>
                        <p className="text-slate-600 text-[11px] mt-1.5 font-medium">
                          {cpn.description}
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-500 shrink-0">
                        <span className="font-semibold text-slate-700">Roles:</span>{' '}
                        {cpn.applicableRoles ? cpn.applicableRoles.join(', ') : 'All Roles'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Custom Promo Code Form (1 col) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-purple-600" />
                  <span>Issue New Promo / BNI Code</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Instantly publish a code for partners, launch campaigns, or chapter invites.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCouponCode.trim()) return;
                    const val = Number(newCouponDiscount);
                    if (isNaN(val) || val <= 0) return;

                    const newCpn: Coupon = {
                      code: newCouponCode.trim().toUpperCase(),
                      discountType: 'percentage',
                      discountValue: val,
                      description: newCouponDesc.trim() || `${val}% Promotional Discount Code`,
                      applicableRoles: ['vendor', 'advisor', 'owner']
                    };

                    const updated = [newCpn, ...customCoupons];
                    setCustomCoupons(updated);
                    localStorage.setItem('novah_custom_coupons', JSON.stringify(updated));
                    setNewCouponCode('');
                    setNewCouponDiscount('100');
                    setNewCouponDesc('');
                    onNotify(`Published code "${newCpn.code}" (${val}% discount).`);
                  }}
                  className="space-y-2.5 pt-1"
                >
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Coupon Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BNIEXPO100"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono uppercase font-bold focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Discount Percentage (%) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      100% discount skips gateway and activates profile directly at ₹0.
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Campaign Description</label>
                    <input
                      type="text"
                      placeholder="e.g. BNI Healthcare Conclave Free Access"
                      value={newCouponDesc}
                      onChange={(e) => setNewCouponDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500"
                    />
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
      </div>
    </div>
  );
};
