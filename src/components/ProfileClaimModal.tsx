import React, { useState } from 'react';
import { X, Building2, ShieldCheck, CheckCircle2, AlertCircle, FileText, Send, UserCheck } from 'lucide-react';
import { DirectoryItem, AuthUser } from '../types';
import { submitProfileClaim } from '../utils/claimsService';

interface ProfileClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DirectoryItem | null;
  currentUser: AuthUser | null;
  onClaimSuccess: (claimId: string) => void;
}

export const ProfileClaimModal: React.FC<ProfileClaimModalProps> = ({
  isOpen,
  onClose,
  item,
  currentUser,
  onClaimSuccess
}) => {
  const [claimantName, setClaimantName] = useState(currentUser?.name || '');
  const [claimantEmail, setClaimantEmail] = useState(currentUser?.email || '');
  const [claimantPhone, setClaimantPhone] = useState(currentUser?.phone || '');
  const [designation, setDesignation] = useState('Director / Authorized Representative');
  const [proofNotes, setProofNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successClaimId, setSuccessClaimId] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!claimantName.trim() || !claimantEmail.trim() || !claimantPhone.trim()) {
      setError('Please provide your name, official work email, and contact phone number.');
      return;
    }

    if (!proofNotes.trim()) {
      setError('Please provide proof of business authority (e.g. GSTIN, company website, or official role verification).');
      return;
    }

    setIsSubmitting(true);
    try {
      const claim = await submitProfileClaim({
        directoryId: item.id,
        directoryName: item.name,
        directoryRole: item.role,
        claimantUserId: currentUser?.id || `user-claimant-${Date.now()}`,
        claimantName: claimantName.trim(),
        claimantEmail: claimantEmail.trim(),
        claimantPhone: claimantPhone.trim(),
        claimantCompany: item.name,
        designation: designation.trim(),
        proofNotes: proofNotes.trim()
      });

      setSuccessClaimId(claim.id);
      onClaimSuccess(claim.id);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit ownership claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Claim Business Ownership
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Request verified management rights for this external profile.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {successClaimId ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                Ownership Claim Submitted!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                Your claim for <strong>{item.name}</strong> has been routed to the NOVA Advisory Board with reference ID <span className="font-mono font-bold text-purple-700">{successClaimId}</span>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="font-bold text-slate-800 dark:text-slate-200">What happens next:</div>
              <div>1. A confirmation receipt has been dispatched to <strong>{claimantEmail}</strong>.</div>
              <div>2. The compliance board validates your organization credentials within 24 hours.</div>
              <div>3. Once approved, this profile will appear in your Workspace for managing hospital RFQ inquiries.</div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Claim Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            
            {/* Target Profile Card */}
            <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  {item.name}
                </span>
                <span className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                  {item.category} · {item.role === 'vendor' ? 'Healthcare Equipment/Vendor' : 'Hospital Strategic Advisor'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-white border border-purple-300 text-purple-800 font-mono text-[10px] font-bold">
                Unclaimed Profile
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sundaram"
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Official Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={claimantEmail}
                  onChange={(e) => setClaimantEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Contact Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={claimantPhone}
                  onChange={(e) => setClaimantPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Your Role in Company *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Managing Director / Partner"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Authority Verification Proof &amp; Justification *
              </label>
              <textarea
                required
                rows={3}
                placeholder="State your authorization: e.g. Corporate GSTIN (29AAAAA0000A1Z5), official company domain match, trade license, or official relationship to this entity."
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 leading-relaxed"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Admin review verifies corporate credentials before unlocking editing controls.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                {isSubmitting ? (
                  <span>Submitting Claim...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Ownership Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
