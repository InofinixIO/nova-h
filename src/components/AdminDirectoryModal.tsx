import React, { useState, useRef } from 'react';
import { 
  X, 
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
  BookOpen
} from 'lucide-react';
import { DirectoryItem, StageItem, ProjectRequirement } from '../types';
import { 
  parseDirectoryCSV, 
  generateSampleDirectoryCSV, 
  saveStoredDirectory, 
  resetDirectoryToDefault 
} from '../utils/directoryStorage';
import { getStoredRequirements } from '../utils/requirementsStorage';
import { AdminToolkitEditor } from './AdminToolkitEditor';
import { AdminRequirementsManager } from './AdminRequirementsManager';

interface AdminDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  directoryItems: DirectoryItem[];
  onUpdateDirectory: (updatedList: DirectoryItem[]) => void;
  toolkitStages?: StageItem[];
  onUpdateToolkitStages?: (updatedStages: StageItem[]) => void;
  onNotify: (msg: string) => void;
}

export const AdminDirectoryModal: React.FC<AdminDirectoryModalProps> = ({
  isOpen,
  onClose,
  directoryItems,
  onUpdateDirectory,
  toolkitStages = [],
  onUpdateToolkitStages,
  onNotify
}) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'requirements' | 'import_csv' | 'add_vendor' | 'toolkit_stages'>('manage');
  const [requirements, setRequirements] = useState<ProjectRequirement[]>(() => getStoredRequirements());
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

  if (!isOpen) return null;

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

  // Handle CSV file drop or file select
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
      newList = [...directoryItems, ...previewParsedItems];
      onNotify(`Appended ${previewParsedItems.length} new listings to the directory.`);
    }

    saveStoredDirectory(newList);
    onUpdateDirectory(newList);
    setPreviewParsedItems([]);
    setCsvText('');
    setActiveTab('manage');
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the NOVA directory?`)) {
      const updated = directoryItems.filter(i => i.id !== id);
      saveStoredDirectory(updated);
      onUpdateDirectory(updated);
      onNotify(`Removed "${name}" from the directory.`);
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
      // Edit existing
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
      // Add new
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative">
        
        {/* Modal Top Header */}
        <div className="p-5 sm:px-7 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm font-black">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  NOVA Administrative Console
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Admin Authorized
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage live directory items, inspect credentials, and import partner listings via CSV.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefaults}
              title="Reset to initial seed data"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Tabs Bar */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-5 sm:px-7 pt-3 flex items-center gap-3 shrink-0 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('manage'); setEditingItemId(null); }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'manage'
                ? 'border-blue-600 text-blue-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Manage Directory ({directoryItems.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('requirements'); setEditingItemId(null); }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'requirements'
                ? 'border-blue-600 text-blue-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Submitted Requirements ({requirements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('import_csv')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'import_csv'
                ? 'border-blue-600 text-blue-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-indigo-600" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingItemId(null);
              setVendorForm({
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
              setActiveTab('add_vendor');
            }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'add_vendor'
                ? 'border-blue-600 text-blue-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>{editingItemId ? 'Edit Listing' : 'Add New Listing'}</span>
          </button>

          <button
            onClick={() => setActiveTab('toolkit_stages')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'toolkit_stages'
                ? 'border-blue-600 text-blue-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Toolkit Stages ({toolkitStages.length})</span>
          </button>
        </div>

        {/* Tab Content View */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          
          {/* TAB 1: MANAGE DIRECTORY LISTINGS */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by name, GSTIN, city or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
                    <button
                      onClick={() => setFilterRole('all')}
                      className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                        filterRole === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      All ({directoryItems.length})
                    </button>
                    <button
                      onClick={() => setFilterRole('vendor')}
                      className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                        filterRole === 'vendor' ? 'bg-blue-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      Vendors ({directoryItems.filter(i => i.role === 'vendor').length})
                    </button>
                    <button
                      onClick={() => setFilterRole('advisor')}
                      className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                        filterRole === 'advisor' ? 'bg-blue-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      Advisors ({directoryItems.filter(i => i.role === 'advisor').length})
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveTab('import_csv')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload CSV</span>
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Partner &amp; Role</th>
                      <th className="py-3 px-4">Category &amp; City</th>
                      <th className="py-3 px-4">Commercial / GSTIN</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {filteredItems.length > 0 ? (
                      filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{item.name}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                item.role === 'advisor' ? 'bg-sky-100 text-sky-800' : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {item.role}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 block">{item.category}</span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {item.location}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-mono text-[11px] text-slate-700">
                              {item.gstin || 'GSTIN Not Set'}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[160px]" title={item.priceRange}>
                              {item.priceRange || 'Commercial on request'}
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="text-[11px] text-slate-700 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {item.phone}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {item.contactEmail}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleStartEdit(item)}
                                title="Edit Listing"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id, item.name)}
                                title="Delete Listing"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No partners found matching criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT CSV */}
          {activeTab === 'import_csv' && (
            <div className="space-y-6">
              
              {/* Banner & Instructions */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Bulk Import Healthcare Directory via CSV</span>
                  </h4>
                  <p className="text-xs text-blue-700 mt-1 max-w-xl">
                    Import equipment vendors, specialized hospital architects, biomedical suppliers, and project consultants. Columns can include Name, Role, Category, Location, Phone, Email, GSTIN, Price Range, and Certifications.
                  </p>
                </div>
                <button
                  onClick={handleDownloadSampleCSV}
                  className="px-3.5 py-2 rounded-lg bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              {/* Drag and Drop Zone */}
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
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                  dragOver
                    ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/60'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />
                <UploadCloud className="w-12 h-12 text-blue-600 mx-auto mb-3 animate-bounce" />
                <h5 className="text-sm font-bold text-slate-800">
                  Drop your CSV file here, or <span className="text-blue-600 underline">browse</span>
                </h5>
                <p className="text-xs text-slate-500 mt-1">
                  Supports comma-separated values (.csv) exported from Excel, Google Sheets, or ERPs
                </p>
              </div>

              {/* Or paste CSV text directly */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Or Paste CSV Data Directly:
                </label>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => {
                    const text = e.target.value;
                    setCsvText(text);
                    if (text.trim()) {
                      const { items, errors } = parseDirectoryCSV(text);
                      setPreviewParsedItems(items);
                      setImportErrors(errors);
                    } else {
                      setPreviewParsedItems([]);
                      setImportErrors([]);
                    }
                  }}
                  placeholder="Paste CSV rows with headers: Name, Role, Category, Location, Phone, Email, GSTIN, Price Range..."
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              {/* Errors Display if any */}
              {importErrors.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Import Parsing Warnings:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {importErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Parsed Items Preview Table */}
              {previewParsedItems.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Ready to Import {previewParsedItems.length} Healthcare Partner{previewParsedItems.length === 1 ? '' : 's'}</span>
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApplyCsvImport('append')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Append to Directory</span>
                      </button>
                      <button
                        onClick={() => handleApplyCsvImport('replace')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Replace Directory</span>
                      </button>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                        <tr>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Role</th>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Location</th>
                          <th className="p-2.5">Phone</th>
                          <th className="p-2.5">GSTIN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {previewParsedItems.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-slate-900">{p.name}</td>
                            <td className="p-2.5 uppercase font-semibold text-[10px] text-blue-700">{p.role}</td>
                            <td className="p-2.5 text-slate-600">{p.category}</td>
                            <td className="p-2.5 text-slate-600">{p.location}</td>
                            <td className="p-2.5 font-mono text-[11px] text-slate-600">{p.phone}</td>
                            <td className="p-2.5 font-mono text-[11px] text-slate-600">{p.gstin || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: ADD / EDIT VENDOR FORM */}
          {activeTab === 'add_vendor' && (
            <form onSubmit={handleSaveVendorForm} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                <h4 className="text-sm font-bold text-slate-900">
                  {editingItemId ? `Edit Listing: ${vendorForm.name}` : 'Add New Healthcare Vendor or Advisor'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Entries are immediately published to the live directory and gated according to login status.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business / Entity Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Biomedical Services Pvt Ltd"
                    value={vendorForm.name || ''}
                    onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Directory Role *
                  </label>
                  <select
                    value={vendorForm.role || 'vendor'}
                    onChange={(e) => setVendorForm({ ...vendorForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="vendor">Equipment / Solutions Vendor</option>
                    <option value="advisor">Healthcare Project Advisor / Consultant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Biomedical Equipment or Architecture & Design"
                    value={vendorForm.category || ''}
                    onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Headquarters / Base City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai, Delhi NCR, Bengaluru"
                    value={vendorForm.location || ''}
                    onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone (Gated for Members) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98200 11223"
                    value={vendorForm.phone || ''}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Email (Gated for Members) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. projects@company.in"
                    value={vendorForm.contactEmail || ''}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Corporate GSTIN (Institutional Gated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 27AAACM4821K1Z5"
                    value={vendorForm.gstin || ''}
                    onChange={(e) => setVendorForm({ ...vendorForm, gstin: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Commercial Fee Structure / Pricing (Gated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹180 - ₹350 / sq. ft or ₹24L - ₹50L per OT suite"
                    value={vendorForm.priceRange || ''}
                    onChange={(e) => setVendorForm({ ...vendorForm, priceRange: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Years of Experience &amp; Website
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Years"
                      value={vendorForm.yearsOfExperience || 10}
                      onChange={(e) => setVendorForm({ ...vendorForm, yearsOfExperience: parseInt(e.target.value, 10) || 1 })}
                      className="col-span-1 px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="Website URL"
                      value={vendorForm.website || ''}
                      onChange={(e) => setVendorForm({ ...vendorForm, website: e.target.value })}
                      className="col-span-2 px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Typical Project Turnaround
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 30 - 45 Days or 3 - 6 Months"
                    value={vendorForm.turnaroundTime || ''}
                    onChange={(e) => setVendorForm({ ...vendorForm, turnaroundTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Public Overview &amp; Summary *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize specialized capabilities, experience with 50-200 bed hospitals, etc."
                  value={vendorForm.description || ''}
                  onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('manage')}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItemId ? 'Update Listing' : 'Publish Listing to Directory'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: TOOLKIT 15 STAGES EDITOR */}
          {activeTab === 'toolkit_stages' && (
            <div className="py-2">
              <AdminToolkitEditor
                stages={toolkitStages}
                onUpdateStages={onUpdateToolkitStages || (() => {})}
                onNotify={onNotify}
              />
            </div>
          )}

          {/* TAB 5: SUBMITTED REQUIREMENTS MANAGEMENT */}
          {activeTab === 'requirements' && (
            <div className="py-2">
              <AdminRequirementsManager
                requirements={requirements}
                onUpdateRequirements={(updated) => setRequirements(updated)}
                directoryItems={directoryItems}
                onNotify={onNotify}
              />
            </div>
          )}

        </div>

        {/* Footer info banner */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 px-7 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>NOVA-H Directory Engine &bull; Storage: Local Persistent Cache with CSV Sync</span>
          </span>
          <span className="font-semibold text-slate-700">
            {directoryItems.length} Total Partners Active
          </span>
        </div>

      </div>
    </div>
  );
};
