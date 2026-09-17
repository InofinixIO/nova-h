import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Archive, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Phone, 
  Mail, 
  MapPin, 
  Download, 
  RefreshCw, 
  Layers, 
  Users, 
  MessageSquare,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { ProjectRequirement, ProjectRequirementStatus, DirectoryItem } from '../types';
import { 
  saveStoredRequirements, 
  addRequirement, 
  updateRequirement, 
  deleteRequirement, 
  resetRequirementsToDefault 
} from '../utils/requirementsStorage';

interface AdminRequirementsManagerProps {
  requirements: ProjectRequirement[];
  onUpdateRequirements: (updated: ProjectRequirement[]) => void;
  directoryItems: DirectoryItem[];
  onNotify: (msg: string) => void;
}

export const AdminRequirementsManager: React.FC<AdminRequirementsManagerProps> = ({
  requirements,
  onUpdateRequirements,
  directoryItems,
  onNotify
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectRequirementStatus>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [selectedReq, setSelectedReq] = useState<ProjectRequirement | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [adminNotesDraft, setAdminNotesDraft] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  // New Requirement Form state
  const [newReqForm, setNewReqForm] = useState({
    hospitalName: '',
    location: 'Mumbai',
    bedCapacity: '100 - 250 Beds',
    stage: 'Planning & Feasibility',
    categoryNeeded: 'Modular Operation Theatres & Turnkey MEP',
    description: '',
    contactPerson: '',
    email: '',
    phone: '',
    estimatedBudget: '',
    status: 'approved' as ProjectRequirementStatus
  });

  // Filtered requirements
  const filteredRequirements = requirements.filter(req => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      req.hospitalName.toLowerCase().includes(q) ||
      req.location.toLowerCase().includes(q) ||
      req.contactPerson.toLowerCase().includes(q) ||
      req.email.toLowerCase().includes(q) ||
      req.categoryNeeded.toLowerCase().includes(q) ||
      req.id.toLowerCase().includes(q)
    );

    const matchesStatus = statusFilter === 'all' || (req.status || 'pending_review') === statusFilter;
    const matchesStage = stageFilter === 'all' || req.stage === stageFilter;

    return matchesSearch && matchesStatus && matchesStage;
  });

  // Stats calculation
  const totalCount = requirements.length;
  const pendingCount = requirements.filter(r => (r.status || 'pending_review') === 'pending_review').length;
  const approvedCount = requirements.filter(r => r.status === 'approved').length;
  const matchedCount = requirements.filter(r => r.status === 'matched').length;
  const closedCount = requirements.filter(r => r.status === 'closed').length;

  const handleStatusChange = (id: string, newStatus: ProjectRequirementStatus) => {
    const updated = updateRequirement(id, { status: newStatus });
    onUpdateRequirements(updated);
    if (selectedReq && selectedReq.id === id) {
      setSelectedReq({ ...selectedReq, status: newStatus });
    }
    onNotify(`Project requirement status updated to "${newStatus.replace('_', ' ').toUpperCase()}".`);
  };

  const handleSaveNotes = (id: string) => {
    const updated = updateRequirement(id, { adminNotes: adminNotesDraft });
    onUpdateRequirements(updated);
    if (selectedReq && selectedReq.id === id) {
      setSelectedReq({ ...selectedReq, adminNotes: adminNotesDraft });
    }
    setIsEditingNotes(false);
    onNotify('Administrative internal notes saved.');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the requirement for "${name}"?`)) {
      const updated = deleteRequirement(id);
      onUpdateRequirements(updated);
      if (selectedReq && selectedReq.id === id) {
        setSelectedReq(null);
      }
      onNotify(`Requirement for "${name}" removed.`);
    }
  };

  const handleCreateRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqForm.hospitalName || !newReqForm.contactPerson || !newReqForm.email) {
      alert('Please fill all required fields.');
      return;
    }
    const created = addRequirement({
      hospitalName: newReqForm.hospitalName,
      location: newReqForm.location,
      bedCapacity: newReqForm.bedCapacity,
      stage: newReqForm.stage,
      categoryNeeded: newReqForm.categoryNeeded,
      description: newReqForm.description || 'Hospital project requirement registered via administrator console.',
      contactPerson: newReqForm.contactPerson,
      email: newReqForm.email,
      phone: newReqForm.phone,
      estimatedBudget: newReqForm.estimatedBudget || '₹5 - 10 Crores',
      status: newReqForm.status
    });
    const updatedList = [created, ...requirements];
    onUpdateRequirements(updatedList);
    setIsAddModalOpen(false);
    setNewReqForm({
      hospitalName: '',
      location: 'Mumbai',
      bedCapacity: '100 - 250 Beds',
      stage: 'Planning & Feasibility',
      categoryNeeded: 'Modular Operation Theatres & Turnkey MEP',
      description: '',
      contactPerson: '',
      email: '',
      phone: '',
      estimatedBudget: '',
      status: 'approved'
    });
    onNotify(`New project requirement for "${created.hospitalName}" created and published!`);
  };

  const handleToggleVendorMatch = (vendorId: string) => {
    if (!selectedReq) return;
    const currentMatches = selectedReq.assignedVendors || [];
    let updatedMatches: string[];
    if (currentMatches.includes(vendorId)) {
      updatedMatches = currentMatches.filter(id => id !== vendorId);
    } else {
      updatedMatches = [...currentMatches, vendorId];
    }
    const updated = updateRequirement(selectedReq.id, { 
      assignedVendors: updatedMatches,
      status: updatedMatches.length > 0 ? 'matched' : (selectedReq.status || 'approved')
    });
    onUpdateRequirements(updated);
    setSelectedReq({ 
      ...selectedReq, 
      assignedVendors: updatedMatches,
      status: updatedMatches.length > 0 ? 'matched' : (selectedReq.status || 'approved')
    });
    onNotify('Partner matching assignments updated.');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Hospital Name', 'Location', 'Beds', 'Stage', 'Category Needed', 'Contact Person', 'Email', 'Phone', 'Status', 'Estimated Budget', 'Admin Notes', 'Date Submitted'];
    const rows = requirements.map(r => [
      `"${r.id}"`,
      `"${r.hospitalName.replace(/"/g, '""')}"`,
      `"${r.location}"`,
      `"${r.bedCapacity}"`,
      `"${r.stage}"`,
      `"${r.categoryNeeded.replace(/"/g, '""')}"`,
      `"${r.contactPerson.replace(/"/g, '""')}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.status || 'pending_review'}"`,
      `"${r.estimatedBudget || ''}"`,
      `"${(r.adminNotes || '').replace(/"/g, '""')}"`,
      `"${r.createdAt}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nova_project_requirements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('Exported project requirements CSV successfully.');
  };

  const handleReset = () => {
    if (window.confirm('Reset all project requirements to default verified dataset?')) {
      const reset = resetRequirementsToDefault();
      onUpdateRequirements(reset);
      setSelectedReq(null);
      onNotify('Project requirements reset to default demo dataset.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
              Procurement &amp; RFQ Oversight
            </span>
            <span className="text-xs text-slate-300 font-medium">Live Hospital Inflow</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black mt-1 tracking-tight">
            Submitted Project Requirements Management
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Review hospital promoter RFQs, vet bed plans, broadcast to verified turnkey vendors, and track partner matchmaking.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post Requirement</span>
          </button>
          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title="Reset to Sample Requirements"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'all' 
              ? 'bg-blue-50/80 border-blue-300 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total RFQs</div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{totalCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across All States</div>
        </div>

        <div 
          onClick={() => setStatusFilter('pending_review')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'pending_review' 
              ? 'bg-amber-50/80 border-amber-300 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-0.5">{pendingCount}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Awaiting Verification</div>
        </div>

        <div 
          onClick={() => setStatusFilter('approved')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'approved' 
              ? 'bg-emerald-50/80 border-emerald-300 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved Active</span>
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-0.5">{approvedCount}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Broadcasted to Network</div>
        </div>

        <div 
          onClick={() => setStatusFilter('matched')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'matched' 
              ? 'bg-purple-50/80 border-purple-300 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Partner Matched</span>
          </div>
          <div className="text-2xl font-black text-purple-900 mt-0.5">{matchedCount}</div>
          <div className="text-[10px] text-purple-600 mt-0.5">Assigned to Vendors</div>
        </div>

        <div 
          onClick={() => setStatusFilter('closed')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'closed' 
              ? 'bg-slate-100 border-slate-300 shadow-xs' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Archive className="w-3 h-3" />
            <span>Closed / Completed</span>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-0.5">{closedCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Executed Projects</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hospital name, promoter, city, category, or REQ-ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700 cursor-pointer"
          >
            <option value="all">All Statuses ({requirements.length})</option>
            <option value="pending_review">Pending Review ({pendingCount})</option>
            <option value="approved">Approved &amp; Active ({approvedCount})</option>
            <option value="matched">Partner Matched ({matchedCount})</option>
            <option value="closed">Closed ({closedCount})</option>
          </select>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700 cursor-pointer"
          >
            <option value="all">All Hospital Stages</option>
            <option value="Planning & Feasibility">Planning &amp; Feasibility</option>
            <option value="Architectural Planning & Layout">Architectural Planning</option>
            <option value="Civil Construction">Civil Construction</option>
            <option value="Equipment Procurement">Equipment Procurement</option>
            <option value="Commissioning & Pre-op">Commissioning &amp; Pre-op</option>
            <option value="Operational Expansion">Operational Expansion</option>
          </select>
        </div>
      </div>

      {/* Main Requirements Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredRequirements.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-sm">No hospital project requirements found.</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Requirement &amp; Hospital</th>
                  <th className="py-3 px-3">Location &amp; Beds</th>
                  <th className="py-3 px-3">Stage &amp; Category</th>
                  <th className="py-3 px-3">Promoter Contact</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Matched Partners</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequirements.map((req) => {
                  const status = req.status || 'pending_review';
                  const matchedCount = (req.assignedVendors || []).length;

                  return (
                    <tr 
                      key={req.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        selectedReq?.id === req.id ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Hospital & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                            {req.hospitalName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{req.hospitalName}</span>
                              <span className="text-[10px] font-mono text-slate-400 font-normal">#{req.id}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs mt-0.5">
                              {req.description}
                            </p>
                            {req.estimatedBudget && (
                              <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mt-1">
                                Est. Budget: {req.estimatedBudget}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Location & Beds */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                          <span>{req.location}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {req.bedCapacity}
                        </span>
                      </td>

                      {/* Stage & Category */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-800 block text-[11px]">
                          {req.categoryNeeded}
                        </span>
                        <span className="inline-block text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-medium mt-1">
                          {req.stage}
                        </span>
                      </td>

                      {/* Submitter */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-900">{req.contactPerson}</div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Mail className="w-2.5 h-2.5 text-slate-400" />
                          <span>{req.email}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 text-slate-400" />
                          <span>{req.phone}</span>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <select
                          value={status}
                          onChange={(e) => handleStatusChange(req.id, e.target.value as ProjectRequirementStatus)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                            status === 'pending_review'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : status === 'approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : status === 'matched'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="pending_review">Pending Review</option>
                          <option value="approved">Approved (Active)</option>
                          <option value="matched">Partner Matched</option>
                          <option value="closed">Closed / Archived</option>
                        </select>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {req.createdAt}
                        </span>
                      </td>

                      {/* Matched Partners */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {matchedCount > 0 ? (
                          <button
                            onClick={() => {
                              setSelectedReq(req);
                              setIsMatchModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 font-bold text-[11px] cursor-pointer"
                          >
                            <Users className="w-3 h-3 text-purple-600" />
                            <span>{matchedCount} Partners Matched</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedReq(req);
                              setIsMatchModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 text-[10px] font-semibold cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Assign Partners</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedReq(req);
                              setAdminNotesDraft(req.adminNotes || '');
                              setIsEditingNotes(false);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Inspect Details & Internal Notes"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(req.id, req.hospitalName)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Requirement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail & Notes Inspector Drawer / Card */}
      {selectedReq && (
        <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-md animate-fadeIn space-y-4">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  #{selectedReq.id}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  selectedReq.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                  selectedReq.status === 'matched' ? 'bg-purple-100 text-purple-800' :
                  selectedReq.status === 'closed' ? 'bg-slate-200 text-slate-700' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {selectedReq.status?.replace('_', ' ') || 'pending review'}
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900 mt-1">
                {selectedReq.hospitalName} ({selectedReq.location})
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMatchModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Match Vendors &amp; Advisors</span>
              </button>
              <button
                onClick={() => setSelectedReq(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Promoter Information</span>
              <div className="font-bold text-slate-900">{selectedReq.contactPerson}</div>
              <div className="flex items-center gap-1 text-slate-600">
                <Mail className="w-3 h-3 text-slate-400" />
                <a href={`mailto:${selectedReq.email}`} className="text-blue-600 hover:underline">{selectedReq.email}</a>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <Phone className="w-3 h-3 text-slate-400" />
                <a href={`tel:${selectedReq.phone}`} className="text-slate-700 hover:underline">{selectedReq.phone}</a>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hospital Scope &amp; Scale</span>
              <div><strong className="text-slate-700">Bed Capacity:</strong> {selectedReq.bedCapacity}</div>
              <div><strong className="text-slate-700">Project Stage:</strong> {selectedReq.stage}</div>
              <div><strong className="text-slate-700">Category Needed:</strong> {selectedReq.categoryNeeded}</div>
              {selectedReq.estimatedBudget && (
                <div><strong className="text-slate-700">Estimated Budget:</strong> {selectedReq.estimatedBudget}</div>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned / Matched Partners</span>
              {(selectedReq.assignedVendors || []).length > 0 ? (
                <div className="space-y-1">
                  {(selectedReq.assignedVendors || []).map(vid => {
                    const item = directoryItems.find(d => d.id === vid);
                    return (
                      <div key={vid} className="p-1.5 bg-white rounded border border-purple-200 text-[11px] font-semibold text-purple-900 flex items-center justify-between">
                        <span>{item ? item.name : vid}</span>
                        <span className="text-[9px] uppercase font-bold text-purple-600 bg-purple-100 px-1 py-0.2 rounded">
                          {item?.role || 'Partner'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-400 text-[11px] italic">No partners assigned yet. Click "Match Vendors &amp; Advisors" to assign.</p>
              )}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-700 block mb-1">Full Requirement Brief:</span>
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {selectedReq.description}
            </div>
          </div>

          {/* Admin Internal Notes Box */}
          <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span>Confidential Administrative Notes &amp; Verification Audit</span>
              </span>
              {!isEditingNotes ? (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                >
                  Edit Notes
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveNotes(selectedReq.id)}
                    className="px-2.5 py-1 rounded bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] cursor-pointer"
                  >
                    Save Notes
                  </button>
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="px-2 py-1 text-slate-600 hover:text-slate-800 text-[11px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {isEditingNotes ? (
              <textarea
                value={adminNotesDraft}
                onChange={(e) => setAdminNotesDraft(e.target.value)}
                rows={3}
                placeholder="Log promoter verification details, statutory approval checks, land title status, or partner outreach logs..."
                className="w-full p-2.5 text-xs rounded-lg border border-purple-300 bg-white focus:ring-2 focus:ring-purple-500 font-sans"
              />
            ) : (
              <p className="text-xs text-purple-800 italic">
                {selectedReq.adminNotes || 'No administrative notes recorded for this requirement yet.'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Matchmaking Modal */}
      {isMatchModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Partner Recommendation Engine
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Match Directory Partners to {selectedReq.hospitalName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Category: <strong className="text-slate-800">{selectedReq.categoryNeeded}</strong> ({selectedReq.location})
                </p>
              </div>
              <button
                onClick={() => setIsMatchModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select verified vendors and healthcare advisors from the directory to connect with this project requirement:
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {directoryItems.map((vendor) => {
                const isMatched = (selectedReq.assignedVendors || []).includes(vendor.id);
                return (
                  <div
                    key={vendor.id}
                    onClick={() => handleToggleVendorMatch(vendor.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isMatched 
                        ? 'bg-purple-50/80 border-purple-300 shadow-xs' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                        isMatched ? 'bg-purple-700 border-purple-700 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isMatched && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>{vendor.name}</span>
                          <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                            {vendor.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">{vendor.category} • {vendor.location}</div>
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono text-slate-400">
                      {vendor.phone}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {(selectedReq.assignedVendors || []).length} partner(s) selected
              </span>
              <button
                onClick={() => setIsMatchModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs cursor-pointer"
              >
                Done Matching
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Requirement Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Register Hospital Project Requirement</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequirement} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hospital / Trust Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sterling Care Super Specialty"
                    value={newReqForm.hospitalName}
                    onChange={(e) => setNewReqForm({ ...newReqForm, hospitalName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location (City / State) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Pune, Maharashtra"
                    value={newReqForm.location}
                    onChange={(e) => setNewReqForm({ ...newReqForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bed Capacity *</label>
                  <select
                    value={newReqForm.bedCapacity}
                    onChange={(e) => setNewReqForm({ ...newReqForm, bedCapacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Under 50 Beds">Under 50 Beds (Daycare / Clinic)</option>
                    <option value="50 - 100 Beds">50 - 100 Beds (Community / Secondary)</option>
                    <option value="100 - 250 Beds">100 - 250 Beds (Tertiary Care)</option>
                    <option value="250+ Beds">250+ Beds (Quaternary / Med College)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Current Hospital Stage *</label>
                  <select
                    value={newReqForm.stage}
                    onChange={(e) => setNewReqForm({ ...newReqForm, stage: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Planning & Feasibility">1. Planning &amp; Feasibility</option>
                    <option value="Architectural Planning & Layout">2. Architectural Planning &amp; Layout</option>
                    <option value="Civil Construction">3. Civil Construction &amp; Structure</option>
                    <option value="Equipment Procurement">4. Equipment Procurement &amp; OT</option>
                    <option value="Commissioning & Pre-op">5. Commissioning &amp; Pre-op</option>
                    <option value="Operational Expansion">6. Operational Expansion</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category Needed *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modular OT & Turnkey MEP"
                    value={newReqForm.categoryNeeded}
                    onChange={(e) => setNewReqForm({ ...newReqForm, categoryNeeded: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimated Budget (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., ₹8 - 12 Crores"
                    value={newReqForm.estimatedBudget}
                    onChange={(e) => setNewReqForm({ ...newReqForm, estimatedBudget: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Technical Scope / Brief</label>
                <textarea
                  rows={3}
                  placeholder="Outline clinical specialties, equipment specifications, statutory deadlines, or specific consultant expectations..."
                  value={newReqForm.description}
                  onChange={(e) => setNewReqForm({ ...newReqForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Promoter / Contact Person Details</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-0.5 text-[11px]">Contact Person *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Dr. Sharma"
                      value={newReqForm.contactPerson}
                      onChange={(e) => setNewReqForm({ ...newReqForm, contactPerson: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-0.5 text-[11px]">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="promoter@hospital.in"
                      value={newReqForm.email}
                      onChange={(e) => setNewReqForm({ ...newReqForm, email: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-0.5 text-[11px]">Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98200..."
                      value={newReqForm.phone}
                      onChange={(e) => setNewReqForm({ ...newReqForm, phone: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  Save &amp; Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
