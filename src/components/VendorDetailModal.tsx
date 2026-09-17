import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  Star, 
  Mail, 
  Phone, 
  Globe, 
  Award, 
  CheckCircle2, 
  Send, 
  Building2, 
  Lock, 
  LogIn, 
  UserCheck, 
  FileText, 
  Briefcase, 
  Clock, 
  BadgePercent, 
  Eye, 
  EyeOff, 
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { DirectoryItem, AuthUser, UserRole } from '../types';
import { addEnquiry } from '../utils/enquiriesStorage';

interface VendorDetailModalProps {
  vendor: DirectoryItem | null;
  onClose: () => void;
  onPostRequirement: () => void;
  currentUser: AuthUser | null;
  onOpenAuth: (mode: 'signin' | 'signup', role?: UserRole) => void;
}

export const VendorDetailModal: React.FC<VendorDetailModalProps> = ({
  vendor,
  onClose,
  onPostRequirement,
  currentUser,
  onOpenAuth,
}) => {
  const [messageSent, setMessageSent] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [rfqSubject, setRfqSubject] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!vendor) return null;

  const isLoggedIn = Boolean(currentUser);
  const isOwner = currentUser?.role === 'owner';
  const isVendorOrAdvisor = currentUser?.role === 'vendor' || currentUser?.role === 'advisor';

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !currentUser) {
      onOpenAuth('signin');
      return;
    }
    
    addEnquiry({
      targetId: vendor.id,
      targetName: vendor.name,
      targetEmail: vendor.contactEmail,
      targetRole: vendor.role,
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      senderPhone: currentUser.phone,
      senderRole: currentUser.role,
      senderCompany: currentUser.company,
      subject: rfqSubject || `Inquiry regarding ${vendor.category}`,
      message: messageText,
      projectLocation: vendor.location
    });

    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setMessageText('');
      setRfqSubject('');
      alert(`Message successfully routed to ${vendor.name}! Their healthcare liaison will contact you at ${currentUser?.email}.`);
    }, 900);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Helper mask for anonymous/logged-out visitors
  const maskEmail = (email: string) => {
    const [name, domain] = email.split('@');
    if (!domain) return '••••••@••••.in';
    return `${name.slice(0, 2)}••••••@${domain}`;
  };

  const maskPhone = (phone: string) => {
    return phone.slice(0, 5) + ' ••••••';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 relative my-6 max-h-[94vh] flex flex-col overflow-hidden"
        id="directory-card-detail-dialog"
      >
        {/* Modal Top Header Bar with Context & Close */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              vendor.role === 'advisor'
                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
            }`}>
              {vendor.role === 'advisor' ? 'Healthcare Advisor' : 'Verified Vendor'}
            </span>
            <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
              {vendor.category}
            </span>
            {vendor.verified && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Partner</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Status pill showing current user access */}
            <div className="text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200">
              {isLoggedIn ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="hidden sm:inline text-slate-500">Logged in as:</span>
                  <strong className="text-slate-900 capitalize">{currentUser?.name.split(' ')[0]} ({currentUser?.role})</strong>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-amber-800 font-semibold">Guest View (Limited Info)</span>
                </>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Header Identity Box */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>{vendor.name}</span>
                {vendor.verified && (
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" title="Verified by NOVA Healthcare Network" />
                )}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                <div className="flex items-center gap-1 font-medium text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>HQ: <strong>{vendor.location}</strong></span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="font-bold text-slate-900">{vendor.rating.toFixed(1)}</span>
                  <span>({vendor.reviewsCount} promoter reviews)</span>
                </div>
                <span>•</span>
                <span><strong>{vendor.yearsOfExperience}</strong> years in healthcare infra</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onPostRequirement}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Post Hospital RFQ
              </button>
            </div>
          </div>

          {/* Guest Limited Access Notice Bar */}
          {!isLoggedIn && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Guest Preview &bull; Limited Contact &amp; Pricing Data Visible
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    Direct phone numbers, commercial fee brackets, GSTIN verification, and client lists are locked for unregistered users.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In to Unlock</span>
                </button>
                <button
                  onClick={() => onOpenAuth('signup', 'owner')}
                  className="hidden md:inline-flex px-3 py-2 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Sign Up Free
                </button>
              </div>
            </div>
          )}

          {/* Business Overview Description */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Professional Overview &amp; Practice Scope:
            </h4>
            <p>{vendor.description}</p>
          </div>

          {/* Compliance & Standards Badges */}
          {vendor.complianceBadges && vendor.complianceBadges.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Industry Standards &amp; Healthcare Compliance:</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {vendor.complianceBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Services & Capabilities */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Specialized Products, Systems &amp; Capabilities:</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {vendor.productsAndServices.map((service, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-medium flex items-center gap-2 shadow-2xs hover:border-blue-300 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Stages & Geographic Service Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Applicable Toolkit Stages:</span>
              </h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {vendor.projectStages.map((stg, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-semibold"
                  >
                    {stg}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>Active Service Cities:</span>
              </h4>
              <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                {vendor.serviceLocations.join(', ')}
              </p>
            </div>
          </div>

          {/* FEATURED HOSPITAL BENCHMARK */}
          {vendor.featuredProject && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Featured Hospital Project Benchmark:
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {vendor.featuredProject}
                </p>
              </div>
            </div>
          )}

          {/* PRIVILEGED SECTION: COMMERCIALS, CLIENTS, GSTIN & VERIFICATION (LOGIN GATED) */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Commercial Details &amp; Verified Institutional Credentials
                </h4>
              </div>
              {isLoggedIn ? (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Unlocked
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Limited
                </span>
              )}
            </div>

            <div className="p-5 space-y-4 bg-white">
              {isLoggedIn ? (
                /* Full privileged details when logged in */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Price Range */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                        <BadgePercent className="w-4 h-4 text-indigo-600" />
                        <span>Commercial Engagement Sizing</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {vendor.priceRange || 'Contact for Customized Quotation'}
                      </p>
                    </div>

                    {/* Turnaround Time */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                        <Clock className="w-4 h-4 text-sky-600" />
                        <span>Execution / Delivery Timeline</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {vendor.turnaroundTime || '2 - 4 Weeks On-boarding'}
                      </p>
                    </div>

                    {/* GSTIN */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Verified Corporate GSTIN</span>
                      </div>
                      <p className="text-sm font-mono font-bold text-slate-900">
                        {vendor.gstin || '27AAACM0000K1Z0'}
                      </p>
                    </div>

                    {/* Certifications */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>Key Professional Accreditations</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        {vendor.certifications?.join(' • ') || 'ISO / Industry Compliant'}
                      </p>
                    </div>
                  </div>

                  {/* Client Portfolio */}
                  {vendor.clientPortfolio && vendor.clientPortfolio.length > 0 && (
                    <div className="pt-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Institutional Client Portfolio &amp; Past Hospital Trust Referrals:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {vendor.clientPortfolio.map((client, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                          >
                            {client}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Headquarters Full Address */}
                  {vendor.headquartersAddress && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span><strong>Corporate Address:</strong> {vendor.headquartersAddress}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Redacted / Locked preview when not logged in */
                <div className="space-y-3">
                  <div className="relative">
                    {/* Blurred mock preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs blur-[3px] select-none opacity-50 pointer-events-none">
                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                        <span className="font-bold text-slate-700">Commercial Engagement Sizing</span>
                        <p className="text-sm font-bold text-slate-900 mt-1">₹45L - ₹3.8 Cr (Turnkey Package)</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                        <span className="font-bold text-slate-700">Execution / Delivery Timeline</span>
                        <p className="text-sm font-bold text-slate-900 mt-1">30 - 45 Days Implementation</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                        <span className="font-bold text-slate-700">Verified Corporate GSTIN</span>
                        <p className="text-sm font-bold text-slate-900 mt-1">27AAACM••••K1Z0</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                        <span className="font-bold text-slate-700">Past Hospital Clients</span>
                        <p className="text-sm font-bold text-slate-900 mt-1">Fortis, Max Healthcare, Apollo Partner</p>
                      </div>
                    </div>

                    {/* Centered unlock overlay button */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75 backdrop-blur-[1px] rounded-xl p-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2 shadow-sm">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900">
                        Full Institutional Credentials Locked
                      </h5>
                      <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 mb-3">
                        Sign in as an Owner, Vendor or Advisor to view commercial pricing slabs, past hospital portfolios, and verified tax registrations.
                      </p>
                      <button
                        onClick={() => onOpenAuth('signin')}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In to Unlock Free</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CONTACT & DIRECT CONNECT BOX */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Direct Contact &amp; Inquiry Channel:
              </h4>
              {!isLoggedIn && (
                <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Contact info partially masked
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {/* Email item */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-mono text-slate-700 truncate">
                    {isLoggedIn ? vendor.contactEmail : maskEmail(vendor.contactEmail)}
                  </span>
                </div>
                {isLoggedIn && (
                  <button
                    onClick={() => copyToClipboard(vendor.contactEmail, 'email')}
                    className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer shrink-0"
                  >
                    {copiedField === 'email' ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>

              {/* Phone item */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-mono text-slate-700 truncate">
                    {isLoggedIn ? vendor.phone : maskPhone(vendor.phone)}
                  </span>
                </div>
                {isLoggedIn && (
                  <button
                    onClick={() => copyToClipboard(vendor.phone, 'phone')}
                    className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer shrink-0"
                  >
                    {copiedField === 'phone' ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>

              {/* Website */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-mono text-slate-700 truncate">
                    {vendor.website.replace('https://', '')}
                  </span>
                </div>
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer shrink-0 flex items-center gap-0.5"
                >
                  <span>Visit</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* Quick Inquiry Form */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <h5 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>Send Direct Inquiry to {vendor.name}:</span>
              </h5>
              
              {!isLoggedIn && (
                <p className="text-[11px] text-slate-500 mb-3">
                  Please log in or provide your project account details so {vendor.name} can reply with hospital technical documentation.
                </p>
              )}

              <form onSubmit={handleSendMessage} className="space-y-3">
                {isLoggedIn && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Hospital Name / Project City..."
                      value={rfqSubject}
                      onChange={(e) => setRfqSubject(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-medium truncate flex items-center gap-1">
                      <span className="text-slate-400">Replying as:</span>
                      <strong>{currentUser?.name}</strong> ({currentUser?.email})
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder={
                      isLoggedIn 
                        ? "Ask about scope, equipment specs, or request a meeting..."
                        : "Log in to send direct inquiry & receive technical catalog..."
                    }
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={!isLoggedIn}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  {isLoggedIn ? (
                    <button
                      type="submit"
                      disabled={messageSent}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{messageSent ? 'Sending...' : 'Send'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenAuth('signin')}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Log In to Send</span>
                    </button>
                  )}
                </div>
              </form>
            </div>

          </div>

        </div>

        {/* Modal Bottom Fixed Bar */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>NOVA Verified Healthcare Network</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onPostRequirement();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-2xs"
            >
              Post Project Requirement
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
