import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  FileText, 
  AlertCircle,
  Send,
  Eye,
  Check,
  X
} from 'lucide-react';
import { ProfileClaim, DirectoryItem } from '../../types';
import { getStoredClaims, approveProfileClaim, rejectProfileClaim } from '../../utils/claimsService';

interface AdminClaimsManagerProps {
  directoryItems: DirectoryItem[];
  onUpdateDirectory: (updated: DirectoryItem[]) => void;
  onNotify: (msg: string) => void;
}

export const AdminClaimsManager: React.FC<AdminClaimsManagerProps> = ({
  directoryItems,
  onUpdateDirectory,
  onNotify
}) => {
  const [claims, setClaims] = useState<ProfileClaim[]>(() => getStoredClaims());
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewerNotesMap, setReviewerNotesMap] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchClaims = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/claims');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setClaims(data);
          setIsRefreshing(false);
          return;
        }
      }
    } catch {}
    setClaims(getStoredClaims());
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchClaims();
    const handleClaimsUpdated = () => fetchClaims();
    window.addEventListener('nova_claims_updated', handleClaimsUpdated);
    return () => window.removeEventListener('nova_claims_updated', handleClaimsUpdated);
  }, []);

  const handleApprove = async (claim: ProfileClaim) => {
    setProcessingId(claim.id);
    const customNote = reviewerNotesMap[claim.id] || 'Verified official company representative.';
    try {
      const res = await approveProfileClaim(claim.id, customNote);
      if (res.success) {
        // Update directory in parent
        const updatedDir = directoryItems.map(item => {
          if (item.id === claim.directoryId) {
            return {
              ...item,
              isClaimed: true,
              claimedByUserId: claim.claimantUserId,
              claimStatus: 'claimed' as const,
              contactEmail: claim.claimantEmail,
              phone: claim.claimantPhone || item.phone,
              verified: true
            };
          }
          return item;
        });
        onUpdateDirectory(updatedDir);
        await fetchClaims();
        onNotify(`Approved claim for "${claim.directoryName}". Profile linked to ${claim.claimantEmail}.`);
      }
    } catch (err: any) {
      alert(`Approval error: ${err?.message || 'Failed to approve'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (claim: ProfileClaim) => {
    const customNote = reviewerNotesMap[claim.id] || prompt('Please provide reason for declining this claim:', 'Unable to substantiate official authorization for this organization.') || '';
    if (!customNote) return;

    setProcessingId(claim.id);
    try {
      const res = await rejectProfileClaim(claim.id, customNote);
      if (res.success) {
        const updatedDir = directoryItems.map(item => {
          if (item.id === claim.directoryId) {
            return {
              ...item,
              isClaimed: false,
              claimedByUserId: undefined,
              claimStatus: 'unclaimed' as const
            };
          }
          return item;
        });
        onUpdateDirectory(updatedDir);
        await fetchClaims();
        onNotify(`Declined ownership claim for "${claim.directoryName}". Notice emailed to claimant.`);
      }
    } catch (err: any) {
      alert(`Rejection error: ${err?.message || 'Failed to reject'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = claims.filter(c => c.status === 'pending').length;
  const approvedCount = claims.filter(c => c.status === 'approved').length;
  const rejectedCount = claims.filter(c => c.status === 'rejected').length;

  const filteredClaims = claims.filter(claim => {
    if (filterStatus !== 'all' && claim.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchListing = claim.directoryName.toLowerCase().includes(q);
      const matchClaimant = claim.claimantName.toLowerCase().includes(q);
      const matchEmail = claim.claimantEmail.toLowerCase().includes(q);
      const matchProof = claim.proofNotes.toLowerCase().includes(q);
      if (!matchListing && !matchClaimant && !matchEmail && !matchProof) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Summary Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>Profile Ownership Claims Review Queue</span>
            </h2>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit ownership claims for unassigned or imported healthcare directory listings. Approved claims transfer workspace management rights.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchClaims}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterStatus === 'all' ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Claims Filed</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{claims.length}</div>
        </div>

        <div 
          onClick={() => setFilterStatus('pending')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterStatus === 'pending' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">{pendingCount}</div>
        </div>

        <div 
          onClick={() => setFilterStatus('approved')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterStatus === 'approved' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved &amp; Linked</span>
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{approvedCount}</div>
        </div>

        <div 
          onClick={() => setFilterStatus('rejected')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterStatus === 'rejected' ? 'bg-red-50 border-red-300 ring-2 ring-red-500/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-red-700 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Declined</span>
          </div>
          <div className="text-2xl font-black text-red-900 mt-1">{rejectedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search claims by listing, claimant, or proof..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold w-full sm:w-auto overflow-x-auto">
          {(['pending', 'all', 'approved', 'rejected'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === st 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? 'All Claims' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
          <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No profile ownership claims found</h4>
          <p className="text-xs text-slate-500 mt-1">
            {filterStatus === 'pending'
              ? 'All pending ownership requests have been audited and resolved.'
              : 'Try changing the filter or search keywords.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClaims.map((claim) => {
            const matchedDirItem = directoryItems.find(d => d.id === claim.directoryId);

            return (
              <div 
                key={claim.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                {/* Top status bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      Ref: {claim.id}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">
                      Filed: {new Date(claim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      claim.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : claim.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {claim.status === 'pending' && 'Pending Board Audit'}
                      {claim.status === 'approved' && 'Ownership Approved'}
                      {claim.status === 'rejected' && 'Claim Declined'}
                    </span>
                  </div>
                </div>

                {/* Split Details: Listing Profile vs Claimant Identity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Target Directory Listing */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Target Business Listing (Requested Profile)
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-base text-slate-900">
                          {claim.directoryName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                            {claim.directoryRole}
                          </span>
                          {matchedDirItem && (
                            <span className="text-xs text-slate-600 font-medium">
                              {matchedDirItem.category} · {matchedDirItem.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {matchedDirItem && (
                      <div className="text-xs text-slate-500 space-y-0.5 pt-1 border-t border-slate-200/60">
                        <div>Listed Contact: <span className="font-mono text-slate-700">{matchedDirItem.contactEmail}</span></div>
                        <div>Listed Phone: <span className="font-mono text-slate-700">{matchedDirItem.phone}</span></div>
                        {matchedDirItem.gstin && <div>GSTIN: <span className="font-mono text-slate-700">{matchedDirItem.gstin}</span></div>}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Claimant Details */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Claimant Identity &amp; Authority
                    </div>
                    <div>
                      <div className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-purple-600" />
                        <span>{claim.claimantName}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {claim.designation || 'Authorized Representative'}
                        {claim.claimantCompany && ` · ${claim.claimantCompany}`}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-slate-800">{claim.claimantEmail}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-slate-800">{claim.claimantPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Authority Proof / Justification Box */}
                <div className="bg-purple-50/50 rounded-xl p-3.5 border border-purple-100 text-xs">
                  <div className="font-bold text-purple-950 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-700" />
                    <span>Submitted Legal / Authorization Proof:</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {claim.proofNotes}
                  </p>
                </div>

                {/* Audit Action Area */}
                {claim.status === 'pending' ? (
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Internal review note (e.g. GSTIN verified on portal, domain confirmed)..."
                        value={reviewerNotesMap[claim.id] || ''}
                        onChange={(e) => setReviewerNotesMap({ ...reviewerNotesMap, [claim.id]: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReject(claim)}
                        disabled={processingId === claim.id}
                        className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-red-200 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline Claim</span>
                      </button>

                      <button
                        onClick={() => handleApprove(claim)}
                        disabled={processingId === claim.id}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Ownership</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      Reviewed on: <strong>{claim.reviewedAt ? new Date(claim.reviewedAt).toLocaleDateString('en-IN') : 'Recently'}</strong>
                      {claim.reviewerNotes && <span> · Note: {claim.reviewerNotes}</span>}
                    </div>
                    {claim.status === 'approved' && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Workspace Access Activated</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
