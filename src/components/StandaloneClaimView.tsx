import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  AlertCircle, 
  Clock, 
  ArrowLeft, 
  Send, 
  ExternalLink,
  Lock,
  Sparkles,
  HelpCircle,
  Check
} from 'lucide-react';
import { DirectoryItem, AuthUser } from '../types';
import { submitProfileClaim, getStoredClaims } from '../utils/claimsService';

interface StandaloneClaimViewProps {
  directoryItems: DirectoryItem[];
  currentUser: AuthUser | null;
  initialTargetId?: string;
  onBackToDirectory: () => void;
  onNotify: (msg: string) => void;
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
  onUpdateDirectoryItem?: (updated: DirectoryItem) => void;
}

export const StandaloneClaimView: React.FC<StandaloneClaimViewProps> = ({
  directoryItems,
  currentUser,
  initialTargetId,
  onBackToDirectory,
  onNotify,
  onOpenAuth,
  onUpdateDirectoryItem
}) => {
  // Search and selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<DirectoryItem | null>(() => {
    if (initialTargetId) {
      return directoryItems.find(d => d.id === initialTargetId) || null;
    }
    return null;
  });

  // Claim form fields
  const [claimantName, setClaimantName] = useState(currentUser?.name || '');
  const [claimantEmail, setClaimantEmail] = useState(currentUser?.email || '');
  const [claimantPhone, setClaimantPhone] = useState(currentUser?.phone || '');
  const [designation, setDesignation] = useState('Director / Authorized Signatory');
  const [gstinOrLicense, setGstinOrLicense] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successClaimId, setSuccessClaimId] = useState<string | null>(null);

  // Sync if initialTargetId changes
  useEffect(() => {
    if (initialTargetId) {
      const match = directoryItems.find(d => d.id === initialTargetId);
      if (match) {
        setSelectedItem(match);
      }
    }
  }, [initialTargetId, directoryItems]);

  // Sync current user fields
  useEffect(() => {
    if (currentUser) {
      if (!claimantName) setClaimantName(currentUser.name || '');
      if (!claimantEmail) setClaimantEmail(currentUser.email || '');
      if (!claimantPhone) setClaimantPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  // Filter directory items for the search picker
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) {
      // Default to first 12 unclaimed items or all items
      return directoryItems
        .filter(item => !item.isClaimed && !item.claimedByUserId)
        .slice(0, 8);
    }
    const q = searchQuery.toLowerCase().trim();
    return directoryItems
      .filter(item => 
        item.name.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.city?.toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [searchQuery, directoryItems]);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedItem) {
      setError('Please search and select the organization profile you wish to claim.');
      return;
    }

    if (!claimantName.trim() || !claimantEmail.trim() || !claimantPhone.trim()) {
      setError('Please enter your full legal name, official work email, and contact phone number.');
      return;
    }

    // Basic email format validation
    if (!claimantEmail.includes('@') || !claimantEmail.includes('.')) {
      setError('Please enter a valid work email address.');
      return;
    }

    if (!proofNotes.trim() && !gstinOrLicense.trim()) {
      setError('Please provide business authority credentials such as your GSTIN, CIN, Clinical Establishment Registration number, or company website URL.');
      return;
    }

    if (!termsAccepted) {
      setError('Please acknowledge that you are an authorized representative of this organization.');
      return;
    }

    setIsSubmitting(true);
    try {
      const combinedProof = [
        gstinOrLicense.trim() ? `Official ID/GSTIN/License: ${gstinOrLicense.trim()}` : '',
        proofNotes.trim() ? `Authority notes: ${proofNotes.trim()}` : ''
      ].filter(Boolean).join('\n\n');

      const claim = await submitProfileClaim({
        directoryId: selectedItem.id,
        directoryName: selectedItem.name,
        directoryRole: selectedItem.role,
        claimantUserId: currentUser?.id || `user-claimant-${Date.now()}`,
        claimantName: claimantName.trim(),
        claimantEmail: claimantEmail.trim(),
        claimantPhone: claimantPhone.trim(),
        claimantCompany: selectedItem.name,
        designation: designation.trim(),
        proofNotes: combinedProof
      });

      // Update directory item locally to reflect pending claim
      if (onUpdateDirectoryItem) {
        onUpdateDirectoryItem({
          ...selectedItem,
          claimStatus: 'pending'
        });
      }

      setSuccessClaimId(claim.id);
      onNotify(`Ownership claim for "${selectedItem.name}" submitted successfully! Reference: ${claim.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err?.message || 'Failed to submit ownership claim. Please verify your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setSuccessClaimId(null);
    setSelectedItem(null);
    setGstinOrLicense('');
    setProofNotes('');
    setSearchQuery('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToDirectory}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-2 text-xs font-bold shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Directory</span>
            </button>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Directory</span>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-semibold">Claim Business Profile</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-200 border border-purple-400/30 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
              <span>Verified Entity Management</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Claim Your Organization Profile
            </h1>

            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Are you the promoter, medical director, or authorized representative of a listed hospital, vendor, or advisory firm? Claim ownership to manage inbound RFQ inquiries, edit catalog offerings, and access verified workspace tools.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-purple-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Free Verification</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>24-Hour Advisory Board Audit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Official Partner Badge</span>
              </div>
            </div>
          </div>
        </div>

        {/* SUCCESS CONFIRMATION VIEW */}
        {successClaimId ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Ownership Claim Submitted!
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Your claim for <strong className="text-slate-900 dark:text-white">{selectedItem?.name}</strong> has been logged and assigned reference ID:
              </p>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 font-mono font-black text-base text-purple-700 dark:text-purple-300">
                {successClaimId}
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="max-w-xl mx-auto p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-left space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>What happens next:</span>
              </div>
              <ul className="space-y-2 pl-1">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600 shrink-0">1.</span>
                  <span>Confirmation email dispatched to <strong>{claimantEmail}</strong> with audit tracking information.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600 shrink-0">2.</span>
                  <span>The NOVA Compliance Board verifies your organization credentials, domain email, and statutory registration within <strong>24 business hours</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600 shrink-0">3.</span>
                  <span>Upon approval, this listing will be linked directly to your login account, giving you full access to received enquiries and quote management.</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={onBackToDirectory}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-md cursor-pointer transition-colors"
              >
                Return to Directory
              </button>
              <button
                type="button"
                onClick={handleResetForAnother}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Claim Another Profile
              </button>
            </div>
          </div>
        ) : (
          /* WORKFLOW CONTENT: 1. SELECT PROFILE -> 2. SUBMIT VERIFICATION */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Profile Selector & Search (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Search Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-purple-600" />
                    <span>1. Find Your Organization</span>
                  </h3>
                  {selectedItem && (
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="text-[11px] text-purple-600 hover:underline font-bold cursor-pointer"
                    >
                      Change Selection
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by hospital name, vendor, or city..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Candidate Listings */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {searchQuery.trim() ? `Search Matches (${filteredCandidates.length})` : 'Popular Unclaimed Listings:'}
                  </div>

                  {filteredCandidates.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No matching listings found. Try typing another part of the organization name.
                    </div>
                  ) : (
                    filteredCandidates.map(item => {
                      const isSelected = selectedItem?.id === item.id;
                      const isPending = item.claimStatus === 'pending';
                      const isClaimed = item.isClaimed || Boolean(item.claimedByUserId);

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedItem(item);
                            setError(null);
                          }}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20'
                              : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {item.name}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                <span className="capitalize">{item.role === 'owner' ? 'Hospital Promoter' : item.role === 'vendor' ? 'Equipment/Vendor' : 'Advisor'}</span>
                                <span>·</span>
                                <span className="flex items-center gap-0.5 truncate">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  {item.location}
                                </span>
                              </div>
                            </div>

                            {isSelected ? (
                              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3" />
                              </span>
                            ) : isPending ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                                Review Pending
                              </span>
                            ) : isClaimed ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                                Managed
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                                Select
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Verification Assurance Card */}
              <div className="bg-slate-100/70 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  <span>Security &amp; Verification Protocol</span>
                </div>
                <p className="leading-relaxed">
                  To prevent unauthorized access, all claim requests are cross-checked against Indian MCA/ROC company registries, Clinical Establishment certificates, and official domain records before authorization is granted.
                </p>
                <div className="pt-1 text-[11px] text-slate-500">
                  Need assistance? Contact verification support at <strong className="text-slate-700 dark:text-slate-200">compliance@maculahealthcare.com</strong>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Claim Form (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                
                {/* Section Header */}
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>2. Verify Ownership &amp; Authority</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Provide your contact details and business proof to verify official authority.
                  </p>
                </div>

                {/* Selected Organization Snapshot */}
                {selectedItem ? (
                  <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                          Selected Entity to Claim:
                        </div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                          {selectedItem.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-1 flex-wrap">
                          <span>{selectedItem.category}</span>
                          <span>·</span>
                          <span className="capitalize">{selectedItem.role === 'owner' ? 'Hospital Facility' : selectedItem.role === 'vendor' ? 'Healthcare Equipment/Supplier' : 'Specialist Advisor'}</span>
                          <span>·</span>
                          <span>{selectedItem.location}</span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {selectedItem.claimStatus === 'pending' ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Claim Pending</span>
                          </span>
                        ) : selectedItem.isClaimed || selectedItem.claimedByUserId ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Already Managed</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Unclaimed Profile</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedItem.claimStatus === 'pending' && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2 mt-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                        <span>A verification claim is currently being audited for this profile. You may still submit supporting documentation.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
                    <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No profile selected yet
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Use the search panel on the left to locate and choose the organization you represent.
                    </p>
                  </div>
                )}

                {/* Form Fields */}
                <form onSubmit={handleSubmitClaim} className="space-y-4 text-xs">
                  
                  {error && (
                    <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-start gap-2.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={claimantName}
                        onChange={(e) => setClaimantName(e.target.value)}
                        placeholder="e.g. Dr. Rajesh Kumar"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                      />
                    </div>

                    {/* Official Role */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Official Designation / Role *
                      </label>
                      <input
                        type="text"
                        required
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Founder, CEO, Medical Superintendent"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Official Work Email */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Official Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={claimantEmail}
                        onChange={(e) => setClaimantEmail(e.target.value)}
                        placeholder="e.g. rajesh@apexmed.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Matching domain emails are auto-prioritized for same-day approval.
                      </span>
                    </div>

                    {/* Contact Phone */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Direct Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={claimantPhone}
                        onChange={(e) => setClaimantPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                      />
                    </div>
                  </div>

                  {/* GSTIN or Clinical Establishment Reg */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Statutory Identification (GSTIN, CIN, or License Number) *
                    </label>
                    <input
                      type="text"
                      value={gstinOrLicense}
                      onChange={(e) => setGstinOrLicense(e.target.value)}
                      placeholder="e.g. 27AAAAA0000A1Z5 or Clinical Reg #MH-2024-8991"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-mono"
                    />
                  </div>

                  {/* Verification Evidence & Supporting Notes */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Authority Proof Details &amp; Supporting Links *
                    </label>
                    <textarea
                      rows={3}
                      value={proofNotes}
                      onChange={(e) => setProofNotes(e.target.value)}
                      placeholder="Provide corporate website link, authorized signatory letter URL, or additional proof details proving representation rights..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                    />
                  </div>

                  {/* Terms & Attestation */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        I legally declare that I am an authorized officer or director of this organization with power of representation. False claims may result in profile suspension.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-500">
                      Receipt will be dispatched to your email immediately.
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !selectedItem}
                      className={`px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        !selectedItem
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : isSubmitting
                            ? 'bg-purple-400 text-white cursor-wait'
                            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Verifying & Submitting...' : 'Submit Ownership Claim'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
