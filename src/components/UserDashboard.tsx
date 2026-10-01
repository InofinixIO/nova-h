import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Mail, 
  Phone, 
  Send, 
  MapPin, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  FileText, 
  Users, 
  Layers, 
  Briefcase,
  ChevronRight,
  TrendingUp,
  Inbox,
  SendHorizontal
} from 'lucide-react';
import { AuthUser, EnquiryItem, EnquiryStatus, ProjectRequirement, DirectoryItem } from '../types';
import { 
  getStoredEnquiries, 
  saveStoredEnquiries, 
  addEnquiry, 
  updateEnquiryStatus, 
  deleteEnquiry 
} from '../utils/enquiriesStorage';
import { getStoredRequirements, addRequirement } from '../utils/requirementsStorage';

interface UserDashboardProps {
  currentUser: AuthUser;
  directoryItems: DirectoryItem[];
  onOpenRequirementModal: () => void;
  onNavigate: (slug: any) => void;
  onNotify: (msg: string) => void;
  externalActiveTab?: 'received_enquiries' | 'sent_enquiries' | 'project_leads' | 'profile';
  onTabChange?: (tab: 'received_enquiries' | 'sent_enquiries' | 'project_leads' | 'profile') => void;
  isFullWidth?: boolean;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  directoryItems,
  onOpenRequirementModal,
  onNavigate,
  onNotify,
  externalActiveTab,
  onTabChange,
  isFullWidth = false
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'received_enquiries' | 'sent_enquiries' | 'project_leads' | 'profile'>('received_enquiries');
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = (tab: 'received_enquiries' | 'sent_enquiries' | 'project_leads' | 'profile') => {
    setInternalActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>(() => getStoredEnquiries());
  const [requirements, setRequirements] = useState<ProjectRequirement[]>(() => getStoredRequirements());

  const [statusFilter, setStatusFilter] = useState<'all' | EnquiryStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Proposal modal for vendors/advisors replying to an open hospital requirement
  const [proposalModalReq, setProposalModalReq] = useState<ProjectRequirement | null>(null);
  const [proposalMessage, setProposalMessage] = useState('');

  const userRole = currentUser.role;

  // Filter enquiries relevant to this user:
  // 1. Received Enquiries:
  // For vendor: enquiries targeted to vendor, or where targetRole is 'vendor'
  // For advisor: enquiries targeted to advisor, or where targetRole is 'advisor'
  // For owner: enquiries targeted to owner, or received proposals
  const receivedEnquiries = enquiries.filter(enq => {
    if (userRole === 'admin') return true;
    if (userRole === 'vendor') {
      return enq.targetRole === 'vendor' || enq.targetEmail === currentUser.email;
    }
    if (userRole === 'advisor') {
      return enq.targetRole === 'advisor' || enq.targetEmail === currentUser.email;
    }
    // For hospital owner: enquiries received from partners or targeted to owner
    return enq.targetRole === 'owner' || enq.targetEmail === currentUser.email;
  });

  // 2. Sent Enquiries:
  const sentEnquiries = enquiries.filter(enq => {
    return enq.senderEmail === currentUser.email || (currentUser.name && enq.senderName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]));
  });

  // Filtered received enquiries based on status and search:
  const displayedReceived = receivedEnquiries.filter(enq => {
    const matchesStatus = statusFilter === 'all' || enq.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      enq.subject.toLowerCase().includes(q) ||
      enq.message.toLowerCase().includes(q) ||
      enq.senderName.toLowerCase().includes(q) ||
      enq.senderEmail.toLowerCase().includes(q) ||
      (enq.hospitalName && enq.hospitalName.toLowerCase().includes(q)) ||
      (enq.projectLocation && enq.projectLocation.toLowerCase().includes(q))
    );
    return matchesStatus && matchesSearch;
  });

  // Counters
  const totalReceived = receivedEnquiries.length;
  const newReceived = receivedEnquiries.filter(e => e.status === 'new').length;
  const inReviewReceived = receivedEnquiries.filter(e => e.status === 'in_review').length;
  const proposalSentReceived = receivedEnquiries.filter(e => e.status === 'proposal_sent').length;
  const closedReceived = receivedEnquiries.filter(e => e.status === 'closed').length;

  const handleUpdateStatus = (id: string, newStatus: EnquiryStatus) => {
    const updated = updateEnquiryStatus(id, newStatus);
    setEnquiries(updated);
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
    }
    onNotify(`Enquiry status updated to "${newStatus.replace('_', ' ').toUpperCase()}".`);
  };

  const handleSaveReplyNote = (id: string) => {
    if (!replyDraft.trim()) return;
    const updated = updateEnquiryStatus(id, 'proposal_sent', replyDraft);
    setEnquiries(updated);
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, status: 'proposal_sent', replyNote: replyDraft });
    }
    setIsReplying(false);
    setReplyDraft('');
    onNotify('Response logged and status transitioned to "Proposal Sent".');
  };

  const handleDeleteEnquiry = (id: string) => {
    if (window.confirm('Delete this inquiry record from your inbox?')) {
      const updated = deleteEnquiry(id);
      setEnquiries(updated);
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry(null);
      }
      onNotify('Enquiry removed.');
    }
  };

  const handleSubmitProposalToReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalModalReq) return;

    // Send proposal as an enquiry to the hospital promoter
    const newEnq = addEnquiry({
      targetId: proposalModalReq.id,
      targetName: proposalModalReq.hospitalName,
      targetEmail: proposalModalReq.email,
      targetRole: 'owner',
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      senderPhone: currentUser.phone || '+91 98200 00000',
      senderRole: currentUser.role,
      senderCompany: currentUser.company || 'Healthcare Network Partner',
      subject: `Proposal for ${proposalModalReq.categoryNeeded} (${proposalModalReq.hospitalName})`,
      message: proposalMessage,
      hospitalName: proposalModalReq.hospitalName,
      projectLocation: proposalModalReq.location,
      bedCapacity: proposalModalReq.bedCapacity,
      projectStage: proposalModalReq.stage
    });

    setEnquiries(getStoredEnquiries());
    setProposalModalReq(null);
    setProposalMessage('');
    onNotify(`Proposal dispatched to ${proposalModalReq.contactPerson} at ${proposalModalReq.hospitalName}!`);
  };

  // Helper title based on user role
  const getRoleHeaderInfo = () => {
    switch (userRole) {
      case 'vendor':
        return {
          title: 'Healthcare Vendor & Contractor Workspace',
          subtitle: 'Manage client RFQs, respond to hospital promoters, and browse active project opportunities.',
          badge: 'Verified Healthcare Vendor',
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          leadsTitle: 'Active Hospital Project RFQs (Network Leads)'
        };
      case 'advisor':
        return {
          title: 'Healthcare Advisory & Consulting Console',
          subtitle: 'Track incoming project DPR requests, statutory advisory inquiries, and hospital promoter consultations.',
          badge: 'Empanelled Healthcare Advisor',
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
          leadsTitle: 'Open Advisory & DPR Opportunities'
        };
      case 'owner':
      default:
        return {
          title: 'Hospital Promoter & Owner Command Hub',
          subtitle: 'Review proposals from verified turnkey contractors, track project inquiries, and manage hospital requirements.',
          badge: 'Certified Hospital Promoter',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          leadsTitle: 'My Submitted Hospital Requirements'
        };
    }
  };

  const roleInfo = getRoleHeaderInfo();

  const dashboardSlugMap: Record<string, string> = {
    received_enquiries: '/dashboard/inquiries',
    sent_enquiries: '/dashboard/sent',
    project_leads: '/dashboard/leads',
    profile: '/dashboard/profile'
  };

  return (
    <div className={`space-y-8 animate-fadeIn ${isFullWidth ? 'w-full' : 'py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
      {/* Top Greeting & Role Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${roleInfo.badgeColor}`}>
                {roleInfo.badge}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {dashboardSlugMap[activeTab] || '/dashboard'}
              </span>
              {currentUser.status === 'pending' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Pending Admin Activation
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Active Subscription
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              {roleInfo.subtitle}
            </p>

            {currentUser.company && (
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-300">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  {currentUser.company}
                </span>
                <span>•</span>
                <span className="text-slate-400 font-mono">{currentUser.email}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('rfp')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>RFP &amp; Procurement Hub</span>
            </button>

            {userRole === 'owner' ? (
              <button
                onClick={onOpenRequirementModal}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post Hospital Requirement</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('project_leads')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                <span>Browse Hospital Leads ({requirements.length})</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('directory')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
            >
              Search Directory
            </button>
          </div>
        </div>

        {/* Pending Advisor Notification Banner */}
        {currentUser.status === 'pending' && (
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-start gap-3 bg-amber-500/10 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-4 sm:p-5 text-amber-200 text-xs">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">Specialist Advisor Application Under Review</p>
              <p className="text-amber-200/80 text-[11px] mt-0.5">
                Your advisor registration is currently awaiting verification by the NOVA Administrative Council. Your profile will be activated directly from the administrator console. You can browse inquiries and explore project leads in the meantime.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => { setActiveTab('received_enquiries'); setStatusFilter('all'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'received_enquiries' && statusFilter === 'all'
              ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Received</span>
            <Inbox className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalReceived}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Customer &amp; Partner Inquiries</div>
        </div>

        <div 
          onClick={() => { setActiveTab('received_enquiries'); setStatusFilter('new'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'received_enquiries' && statusFilter === 'new'
              ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>New / Action Needed</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          </div>
          <div className="text-2xl font-black text-amber-900 dark:text-amber-300 mt-1">{newReceived}</div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-0.5">Unanswered RFQs</div>
        </div>

        <div 
          onClick={() => { setActiveTab('received_enquiries'); setStatusFilter('proposal_sent'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'received_enquiries' && statusFilter === 'proposal_sent'
              ? 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Proposals Sent</span>
            <SendHorizontal className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-900 dark:text-purple-300 mt-1">{proposalSentReceived}</div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400/80 mt-0.5">Quotes in Discussion</div>
        </div>

        <div 
          onClick={() => setActiveTab('project_leads')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'project_leads'
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Hospital Leads</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-900 dark:text-emerald-300 mt-1">
            {userRole === 'owner' ? requirements.length : requirements.filter(r => r.status === 'approved').length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-0.5">Active Network RFQs</div>
        </div>
      </div>

      {/* Main Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('received_enquiries')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'received_enquiries'
              ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 rounded-t-lg'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Received Enquiries ({totalReceived})</span>
          {newReceived > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black">
              {newReceived}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sent_enquiries')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sent_enquiries'
              ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 rounded-t-lg'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <SendHorizontal className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Outbox &amp; Sent Inquiries ({sentEnquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('project_leads')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'project_leads'
              ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 rounded-t-lg'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{roleInfo.leadsTitle} ({requirements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 rounded-t-lg'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span>Business Profile &amp; Membership</span>
        </button>
      </div>

      {/* TAB 1: RECEIVED ENQUIRIES MANAGEMENT (Primary requested feature) */}
      {activeTab === 'received_enquiries' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by hospital name, contact, city, or inquiry message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Filter:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">All Enquiries ({totalReceived})</option>
                <option value="new">New ({newReceived})</option>
                <option value="in_review">In Review ({inReviewReceived})</option>
                <option value="proposal_sent">Proposal Sent ({proposalSentReceived})</option>
                <option value="closed">Closed ({closedReceived})</option>
              </select>
            </div>
          </div>

          {/* Enquiries List */}
          {displayedReceived.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
              <Inbox className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Enquiries Found in this Filter</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                Promoter RFQs and direct technical inquiries will automatically appear here as hospital developers discover your profile.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedReceived.map((enq) => {
                const isSelected = selectedEnquiry?.id === enq.id;
                return (
                  <div
                    key={enq.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-5 shadow-xs ${
                      isSelected 
                        ? 'border-blue-400 ring-2 ring-blue-50 dark:ring-blue-900/30' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            enq.status === 'new'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                              : enq.status === 'in_review'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                              : enq.status === 'proposal_sent'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                          }`}>
                            {enq.status.replace('_', ' ')}
                          </span>

                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                            #{enq.id}
                          </span>

                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            • {enq.createdAt}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                          {enq.subject}
                        </h4>

                        {/* Project Details Pill Bar */}
                        {(enq.hospitalName || enq.projectLocation || enq.bedCapacity || enq.projectStage) && (
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {enq.hospitalName && (
                              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                <Building2 className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                {enq.hospitalName}
                              </span>
                            )}
                            {enq.projectLocation && (
                              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                <MapPin className="w-3 h-3 text-red-500" />
                                {enq.projectLocation}
                              </span>
                            )}
                            {enq.bedCapacity && (
                              <span className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                {enq.bedCapacity}
                              </span>
                            )}
                            {enq.projectStage && (
                              <span className="text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md font-medium">
                                Stage: {enq.projectStage}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Inquiry Body */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          {enq.message}
                        </p>

                        {/* Submitter Contact Row */}
                        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                          <span className="font-bold text-slate-900 dark:text-slate-200">
                            From: {enq.senderName} ({enq.senderRole.toUpperCase()})
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                            <a href={`mailto:${enq.senderEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                              {enq.senderEmail}
                            </a>
                          </span>
                          {enq.senderPhone && (
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                              <a href={`tel:${enq.senderPhone}`} className="text-slate-700 dark:text-slate-300 hover:underline">
                                {enq.senderPhone}
                              </a>
                            </span>
                          )}
                        </div>

                        {/* Stored Reply Note / Draft */}
                        {enq.replyNote && (
                          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-300 mt-2">
                            <span className="font-bold block text-[10px] uppercase text-purple-700 dark:text-purple-400 tracking-wider">Internal Action Note:</span>
                            <span>{enq.replyNote}</span>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Status Transition and Actions */}
                      <div className="flex lg:flex-col items-end justify-between lg:justify-start gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                        {/* Status Transition Dropdown */}
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Update Status</span>
                          <select
                            value={enq.status}
                            onChange={(e) => handleUpdateStatus(enq.id, e.target.value as EnquiryStatus)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 cursor-pointer shadow-2xs focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="new">🟡 Mark New</option>
                            <option value="in_review">🔵 In Review</option>
                            <option value="proposal_sent">🟣 Proposal Sent</option>
                            <option value="closed">⚪ Closed</option>
                          </select>
                        </div>

                        {/* Quick Contact & Action Buttons */}
                        <div className="flex items-center gap-1.5 mt-2">
                          {enq.senderPhone && (
                            <a
                              href={`https://wa.me/${enq.senderPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${enq.senderName}, regarding your inquiry for ${enq.hospitalName || 'hospital project'}:`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                              title="Chat on WhatsApp"
                            >
                              WhatsApp
                            </a>
                          )}

                          <a
                            href={`mailto:${enq.senderEmail}?subject=${encodeURIComponent(`Re: ${enq.subject}`)}`}
                            className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-colors cursor-pointer"
                            title="Send Email"
                          >
                            Email
                          </a>

                          <button
                            onClick={() => {
                              setSelectedEnquiry(isSelected ? null : enq);
                              setIsReplying(true);
                              setReplyDraft(enq.replyNote || '');
                            }}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                            title="Add Note or Proposal Details"
                          >
                            Log Note
                          </button>

                          <button
                            onClick={() => handleDeleteEnquiry(enq.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs transition-colors cursor-pointer"
                            title="Delete Enquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inline Reply Note Box */}
                    {isSelected && isReplying && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-fadeIn">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          Log Follow-up Note or Proposal Delivery:
                        </label>
                        <textarea
                          rows={2}
                          value={replyDraft}
                          onChange={(e) => setReplyDraft(e.target.value)}
                          placeholder="e.g., Conducted initial Zoom call, shared architectural catalog and standard pricing schedule..."
                          className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setIsReplying(false)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveReplyNote(enq.id)}
                            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                          >
                            Save Note &amp; Update
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SENT ENQUIRIES / OUTBOX */}
      {activeTab === 'sent_enquiries' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Inquiries You Sent Out</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track responses from vendors, hospital planners, and healthcare equipment providers.</p>
            </div>
            <button
              onClick={() => onNavigate('directory')}
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 cursor-pointer"
            >
              Browse Directory
            </button>
          </div>

          {sentEnquiries.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
              <SendHorizontal className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Sent Inquiries in Outbox</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                Whenever you send an RFQ or contact a provider in the directory, your dispatched messages will be logged here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentEnquiries.map(enq => (
                <div key={enq.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-200">
                      To: {enq.targetName} ({enq.targetEmail})
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{enq.createdAt}</span>
                  </div>
                  <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300">{enq.subject}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">{enq.message}</p>
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      enq.status === 'proposal_sent' 
                        ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800' 
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    }`}>
                      Status: {enq.status.replace('_', ' ')}
                    </span>
                    {enq.replyNote && (
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] italic">
                        Response Note: "{enq.replyNote}"
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HOSPITAL PROJECT OPPORTUNITIES / LEADS FEED */}
      {activeTab === 'project_leads' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-base text-white">
                {userRole === 'owner' ? 'Your Submitted Hospital Projects & RFQs' : 'Live Hospital Requirements from Promoters'}
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                {userRole === 'owner' 
                  ? 'Track verification status, admin matchmaking notes, and contractor interest.'
                  : 'Directly submit proposals or expressions of interest to hospital promoters across India.'}
              </p>
            </div>
            {userRole === 'owner' && (
              <button
                onClick={onOpenRequirementModal}
                className="px-4 py-2 rounded-xl bg-white text-blue-900 font-extrabold text-xs hover:bg-blue-50 cursor-pointer shrink-0 shadow-sm"
              >
                + Post New Requirement
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requirements.map((req) => (
              <div key={req.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                          #{req.id}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          req.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' :
                          req.status === 'matched' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300' :
                          'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}>
                          {req.status?.replace('_', ' ') || 'pending review'}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                        {req.hospitalName}
                      </h4>
                    </div>

                    <div className="text-right whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span>{req.location}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{req.bedCapacity}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                    <div><strong className="text-slate-700 dark:text-slate-300">Category Needed:</strong> <span className="font-semibold text-blue-700 dark:text-blue-400">{req.categoryNeeded}</span></div>
                    <div><strong className="text-slate-700 dark:text-slate-300">Project Stage:</strong> <span className="text-slate-700 dark:text-slate-300">{req.stage}</span></div>
                    {req.estimatedBudget && (
                      <div><strong className="text-slate-700 dark:text-slate-300">Budget:</strong> <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{req.estimatedBudget}</span></div>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {req.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Promoter: <span className="font-bold text-slate-800 dark:text-slate-200">{req.contactPerson}</span>
                  </div>

                  {userRole !== 'owner' ? (
                    <button
                      onClick={() => {
                        setProposalModalReq(req);
                        setProposalMessage(`Dear ${req.contactPerson},\n\nWe are writing from ${currentUser.company || currentUser.name}. We specialize in ${req.categoryNeeded} and would like to present our credentials, turn-key delivery schedule, and past hospital case studies for ${req.hospitalName}.`);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>Submit Proposal</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                      {(req.assignedVendors || []).length} Matched Partners
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BUSINESS PROFILE & MEMBERSHIP */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Organization &amp; Account Profile</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your credentials, verification badges, and listing data.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Authorized Contact Name</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.name}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Organization / Trust Name</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.company || 'Not Specified'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Official Email</label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Platform Role</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.role.toUpperCase()}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-black"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Direct Contact Phone</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.phone || '+91 98200 00000'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>

              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">Verified Network Partner</span>
                <p className="text-emerald-900 dark:text-emerald-300 text-xs">
                  Your profile has verified status on the NOVA National Healthcare Network. Full unmasked directory contacts are activated.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Submission Modal for Vendors/Advisors */}
      {proposalModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 dark:bg-slate-950/85 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                  Submit Proposal
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  Response to {proposalModalReq.hospitalName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Category: <strong className="text-slate-800 dark:text-slate-200">{proposalModalReq.categoryNeeded}</strong> ({proposalModalReq.location})
                </p>
              </div>
              <button
                onClick={() => setProposalModalReq(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProposalToReq} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Recipient Promoter:</label>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium">
                  {proposalModalReq.contactPerson} ({proposalModalReq.email})
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Proposal / Cover Note *</label>
                <textarea
                  rows={4}
                  required
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 text-[11px]">
                This proposal will be logged in your Sent Inquiries outbox and dispatched to the promoter's inbox with your verified contact information.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setProposalModalReq(null)}
                  className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  Dispatch Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
