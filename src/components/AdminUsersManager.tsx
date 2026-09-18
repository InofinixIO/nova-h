import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  Building2, 
  HardHat, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Edit2, 
  Check, 
  X, 
  Plus, 
  Terminal,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import { 
  getAllUsers, 
  toggleUserStatus, 
  updateUserPlan, 
  registerOrUpdateUser, 
  isDevModeActive, 
  setDevMode,
  approveUser
} from '../utils/userManagement';

interface AdminUsersManagerProps {
  currentUser: AuthUser | null;
  onImpersonate?: (user: AuthUser) => void;
  onNotify: (msg: string) => void;
}

export const AdminUsersManager: React.FC<AdminUsersManagerProps> = ({
  currentUser,
  onImpersonate,
  onNotify
}) => {
  const [users, setUsers] = useState<AuthUser[]>(() => getAllUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled' | 'pending'>('all');
  const [devMode, setDevModeState] = useState<boolean>(() => isDevModeActive());

  // Plan editing modal / inline state
  const [editingPlanEmail, setEditingPlanEmail] = useState<string | null>(null);
  const [selectedPlanValue, setSelectedPlanValue] = useState<string>('');

  // Add User Dialog state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState<{
    name: string;
    email: string;
    role: UserRole;
    company: string;
    phone: string;
    plan: string;
  }>({
    name: '',
    email: '',
    role: 'owner',
    company: '',
    phone: '',
    plan: 'Owner Free Starter'
  });

  // Keep devMode in sync with localStorage
  useEffect(() => {
    const checkDevMode = () => {
      setDevModeState(isDevModeActive());
    };
    checkDevMode();
    window.addEventListener('storage', checkDevMode);
    return () => window.removeEventListener('storage', checkDevMode);
  }, []);

  const handleToggleDevMode = () => {
    const nextVal = !devMode;
    setDevMode(nextVal);
    setDevModeState(nextVal);
    if (nextVal) {
      onNotify('Developer Mode (dev=1) enabled in localStorage. User impersonation unlocked!');
    } else {
      onNotify('Developer Mode (dev=1) disabled in localStorage.');
    }
  };

  const handleToggleStatus = (targetUser: AuthUser) => {
    if (currentUser && targetUser.email.toLowerCase() === currentUser.email.toLowerCase()) {
      onNotify('Safety guard: You cannot disable your currently active administrator account.');
      return;
    }

    const updated = toggleUserStatus(targetUser.email);
    setUsers(updated);
    const newStatus = targetUser.status === 'disabled' ? 'active' : 'disabled';
    onNotify(`User "${targetUser.name}" (${targetUser.email}) is now ${newStatus.toUpperCase()}.`);
  };

  const handleSavePlan = (email: string) => {
    if (!selectedPlanValue.trim()) {
      setEditingPlanEmail(null);
      return;
    }
    const updated = updateUserPlan(email, selectedPlanValue);
    setUsers(updated);
    setEditingPlanEmail(null);
    onNotify(`Updated plan for ${email} to "${selectedPlanValue}".`);
  };

  const handleApproveUser = (targetUser: AuthUser) => {
    const updated = approveUser(targetUser.email);
    setUsers(updated);
    onNotify(`Approved user "${targetUser.name}" (${targetUser.email}) and set to Active.`);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.email.trim()) {
      return;
    }

    const created = registerOrUpdateUser({
      name: newUserForm.name.trim(),
      email: newUserForm.email.trim().toLowerCase(),
      role: newUserForm.role,
      company: newUserForm.company.trim() || 'Healthcare Partner',
      phone: newUserForm.phone.trim() || '+91 98765 43210',
      plan: newUserForm.plan,
      status: 'active'
    });

    setUsers(getAllUsers());
    setIsAddUserOpen(false);
    setNewUserForm({
      name: '',
      email: '',
      role: 'owner',
      company: '',
      phone: '',
      plan: 'Owner Free Starter'
    });
    onNotify(`Successfully registered user "${created.name}" with plan "${created.plan}" (No payment needed).`);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.company && user.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.plan && user.plan.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (user.status || 'active') === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeCount = users.filter(u => (u.status || 'active') === 'active').length;
  const disabledCount = users.filter(u => u.status === 'disabled').length;
  const pendingCount = users.filter(u => u.status === 'pending').length;
  const ownersCount = users.filter(u => u.role === 'owner').length;
  const vendorsCount = users.filter(u => u.role === 'vendor').length;
  const advisorsCount = users.filter(u => u.role === 'advisor').length;

  return (
    <div className="space-y-6">
      {/* Dev Mode Banner with localStorage indicator */}
      <div className={`rounded-2xl p-4 sm:p-5 border transition-all ${
        devMode 
          ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-xs' 
          : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 ${
              devMode ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
            }`}>
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider">
                  Developer Impersonation Mode:
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono tracking-wider ${
                  devMode 
                    ? 'bg-emerald-600 text-white animate-pulse' 
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  localStorage dev={devMode ? '1 (ACTIVE)' : '0 (OFF)'}
                </span>
              </div>
              <p className="text-xs mt-0.5 text-slate-600">
                {devMode ? (
                  <span className="text-amber-900 font-medium">
                    ⚡ Impersonation is <strong>ACTIVE</strong>. Click <strong>Impersonate</strong> next to any user in the table below to browse, test, and post from their perspective.
                  </span>
                ) : (
                  <span>
                    When <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px] font-bold">localStorage dev=1</code> is set, you can impersonate any user account directly.
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleDevMode}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-2xs ${
              devMode 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{devMode ? 'Disable Dev Mode' : 'Enable Dev Mode (dev=1)'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{users.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">All registered accounts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{activeCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Accounts in good standing</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Disabled</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600 mt-1">{disabledCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Revoked access</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting approval</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hidden sm:block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Hospital Owners</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900 mt-1">{ownersCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Promoters &amp; CEOs</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Vendors &amp; Advisors</span>
            <HardHat className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-900 mt-1">{vendorsCount + advisorsCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{vendorsCount} Vendors • {advisorsCount} Advisors</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by user name, email, company, or plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="owner">Hospital Owners</option>
              <option value="vendor">Vendors</option>
              <option value="advisor">Advisors</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'disabled' | 'pending')}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="pending">Pending Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsAddUserOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ml-auto sm:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">User &amp; Contact</th>
                <th className="py-3.5 px-4">Role &amp; Organization</th>
                <th className="py-3.5 px-4">Membership Plan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold">No users found matching current filters.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try changing your search query or reset filters.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrentAdmin = currentUser && u.email.toLowerCase() === currentUser.email.toLowerCase();
                  const userStatus = u.status || 'active';
                  const isEditingPlan = editingPlanEmail === u.email;

                  return (
                    <tr key={u.email} className={`hover:bg-slate-50/70 transition-colors ${userStatus === 'disabled' ? 'bg-red-50/30' : userStatus === 'pending' ? 'bg-amber-50/30' : ''}`}>
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            u.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : u.role === 'owner' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : u.role === 'vendor' 
                                      ? 'bg-indigo-100 text-indigo-800' 
                                      : 'bg-sky-100 text-sky-800'
                          }`}>
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrentAdmin && (
                                <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{u.email}</span>
                            </div>
                            {u.phone && (
                              <div className="text-slate-400 text-[10px] flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-slate-300" />
                                <span>{u.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role & Company */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                              : u.role === 'owner' 
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                  : u.role === 'vendor' 
                                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                                      : 'bg-sky-100 text-sky-800 border border-sky-200'
                          }`}>
                            {u.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                            {u.role === 'owner' && <Building2 className="w-3 h-3" />}
                            {u.role === 'vendor' && <HardHat className="w-3 h-3" />}
                            {u.role === 'advisor' && <User className="w-3 h-3" />}
                            <span>{u.role}</span>
                          </span>
                          <div className="font-medium text-slate-700 text-[11px]">
                            {u.company || 'Healthcare Organization'}
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-4">
                        {isEditingPlan ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={selectedPlanValue}
                              onChange={(e) => setSelectedPlanValue(e.target.value)}
                              className="p-1 rounded text-xs border border-purple-300 bg-white"
                            >
                              <option value="Owner Free Starter">Owner Free Starter</option>
                              <option value="Owner Annual (₹1,000/yr)">Owner Annual (₹1,000/yr)</option>
                              <option value="Vendor Free Starter">Vendor Free Starter</option>
                              <option value="Vendor Standard (₹2,000/yr)">Vendor Standard (₹2,000/yr)</option>
                              <option value="Advisor Free Starter">Advisor Free Starter</option>
                              <option value="Advisor Specialist (₹1,000/yr)">Advisor Specialist (₹1,000/yr)</option>
                              <option value="Administrator Master Access">Administrator Master Access</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleSavePlan(u.email)}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                              title="Save Plan"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPlanEmail(null)}
                              className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-600 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 group">
                            <span className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${
                              (u.plan || '').toLowerCase().includes('annual') || (u.plan || '').toLowerCase().includes('paid') || (u.plan || '').toLowerCase().includes('standard')
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                                : (u.plan || '').toLowerCase().includes('master')
                                    ? 'bg-purple-50 text-purple-800 border-purple-200 font-bold'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {u.plan || (u.role === 'owner' ? 'Owner Free Starter' : u.role === 'vendor' ? 'Vendor Free Starter' : 'Advisor Free Starter')}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPlanEmail(u.email);
                                setSelectedPlanValue(u.plan || 'Owner Free Starter');
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-purple-600 transition-opacity cursor-pointer"
                              title="Change Plan"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {userStatus === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>Active</span>
                          </span>
                        ) : userStatus === 'pending' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                            <span>Pending</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            <span>Disabled</span>
                          </span>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Verified Seed'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve Button for pending */}
                          {userStatus === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleApproveUser(u)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Approve User"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                          )}

                          {/* Enable / Disable Button */}
                          {userStatus !== 'pending' && (
                            <button
                              type="button"
                              disabled={isCurrentAdmin}
                              onClick={() => handleToggleStatus(u)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                                isCurrentAdmin
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                  : userStatus === 'active'
                                      ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              }`}
                              title={isCurrentAdmin ? 'Cannot disable self' : userStatus === 'active' ? 'Disable account' : 'Re-enable account'}
                            >
                              {userStatus === 'active' ? (
                                <>
                                  <UserX className="w-3 h-3" />
                                  <span>Disable</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3" />
                                  <span>Enable</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Impersonate Button (when localStorage dev=1) */}
                          {devMode ? (
                            <button
                              type="button"
                              onClick={() => onImpersonate?.(u)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              title={`Impersonate ${u.name} (dev=1 active)`}
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Impersonate</span>
                            </button>
                          ) : (
                            <span 
                              className="text-[10px] text-slate-400 cursor-help"
                              title="Set localStorage dev=1 to unlock user impersonation"
                            >
                              [dev=1 req]
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsAddUserOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                Direct Provisioning
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Add User (No Payment Required)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Create an active account instantly. Assigned plans are unlocked immediately without requiring checkout.
              </p>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Community Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['owner', 'vendor', 'advisor'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setNewUserForm({
                          ...newUserForm,
                          role: r,
                          plan: r === 'owner' ? 'Owner Free Starter' : r === 'vendor' ? 'Vendor Free Starter' : 'Advisor Free Starter'
                        });
                      }}
                      className={`py-2 px-2 rounded-xl border text-center font-bold capitalize transition-all cursor-pointer ${
                        newUserForm.role === r
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Anand Verma"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@hospital.in"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hospital / Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Verma Multispecialty Hospital"
                  value={newUserForm.company}
                  onChange={(e) => setNewUserForm({ ...newUserForm, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Membership Plan</label>
                <select
                  value={newUserForm.plan}
                  onChange={(e) => setNewUserForm({ ...newUserForm, plan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                >
                  <option value="Owner Free Starter">Owner Free Starter (Free ₹0)</option>
                  <option value="Owner Annual (₹1,000/yr)">Owner Annual (₹1,000/yr - Activated)</option>
                  <option value="Vendor Free Starter">Vendor Free Starter (Free ₹0)</option>
                  <option value="Vendor Standard (₹2,000/yr)">Vendor Standard (₹2,000/yr - Activated)</option>
                  <option value="Advisor Free Starter">Advisor Free Starter (Free ₹0)</option>
                  <option value="Advisor Specialist (₹1,000/yr)">Advisor Specialist (₹1,000/yr - Activated)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  Create User (No Payment)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
