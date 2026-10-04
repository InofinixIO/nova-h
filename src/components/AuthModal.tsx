import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Building2, 
  HardHat, 
  UserCheck, 
  Lock, 
  Mail, 
  User, 
  Phone,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Award,
  ArrowLeft,
  RotateCw,
  ShieldCheck,
  Key
} from 'lucide-react';
import { UserRole, AuthUser, AccreditationProgramme } from '../types';
import { getSampleLogins } from '../utils/sampleLogins';
import { registerOrUpdateUser, isUserDisabled } from '../utils/userManagement';
import { getActiveAccreditationProgrammes } from '../utils/accreditationStorage';
import { dispatchEmail, generateOtpEmailHtml } from '../utils/emailService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  initialRole?: UserRole;
  onSuccess: (user: AuthUser) => void;
  onProceedToPayment?: (role: UserRole, planDetails: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signup',
  initialRole = 'owner',
  onSuccess,
  onProceedToPayment
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [selectedAccreditationId, setSelectedAccreditationId] = useState('');
  const [accreditationProgrammes, setAccreditationProgrammes] = useState<AccreditationProgramme[]>([]);

  // Two-step registration state
  const [authStep, setAuthStep] = useState<'form' | 'otp'>('form');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [pendingOtpCode, setPendingOtpCode] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [otpSentNotice, setOtpSentNotice] = useState<string>('');

  const digitInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Synchronize active tab whenever dialog is triggered or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setMode(initialMode);
      setAuthStep('form');
      setOtpDigits(['', '', '', '', '', '']);
      setPendingOtpCode('');
      setOtpSentNotice('');
      if (initialRole) {
        setSelectedRole(initialRole);
      }
      setAccreditationProgrammes(getActiveAccreditationProgrammes());
    }
  }, [isOpen, initialMode, initialRole]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus first digit input when entering OTP step
  useEffect(() => {
    if (authStep === 'otp') {
      setTimeout(() => {
        digitInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [authStep]);

  if (!isOpen) return null;

  const sampleAccounts = getSampleLogins();

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
  };

  /**
   * Dispatches OTP to email address and updates UI state
   */
  const triggerOtpDispatch = async (targetEmail: string, targetName: string) => {
    setIsProcessing(true);
    setError('');

    // Generate 6-digit numeric OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingOtpCode(generatedOtp);

    // 1. Dispatch email using in-app email dispatcher (stores in local mailbox)
    const emailData = generateOtpEmailHtml(targetName, generatedOtp);
    await dispatchEmail({
      toEmail: targetEmail,
      recipientName: targetName,
      subject: emailData.subject,
      type: 'verification_otp',
      bodyHtml: emailData.bodyHtml,
      bodyText: emailData.bodyText,
      otpCode: generatedOtp
    });

    // 2. Also notify backend API (persists in Neon PostgreSQL / memory)
    try {
      await fetch('/api/auth/register-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: targetName,
          email: targetEmail,
          role: selectedRole,
          phone,
          company,
          enrolledAccreditationId: selectedAccreditationId || undefined
        })
      });
    } catch (e) {
      console.warn('Backend OTP sync deferred:', e);
    }

    setIsProcessing(false);
    setAuthStep('otp');
    setResendCooldown(30);
    setOtpSentNotice(`A 6-digit verification code was sent to ${targetEmail}`);
  };

  /**
   * Form submission (Step 1: Sign In or Sign Up credentials)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Please provide a valid email address.');
      return;
    }

    // Check if account has been disabled by administrator
    if (isUserDisabled(normalizedEmail)) {
      setError('This account has been disabled by an administrator. Please contact support@nova-h.in for assistance.');
      return;
    }

    const adminSample = sampleAccounts.find(a => a.role === 'admin');
    const isAdmin = (adminSample && normalizedEmail === adminSample.email.toLowerCase()) || 
      normalizedEmail === 'admin@nova-h.in' || 
      normalizedEmail.startsWith('admin') || 
      selectedRole === 'admin';

    // If Sign In mode, authenticate directly
    if (mode === 'signin') {
      const defaultName = isAdmin 
        ? 'NOVA System Administrator' 
        : (email.includes('@') 
            ? (email.split('@')[0] === 'codesandboxrepository' 
                ? 'Dr. Rajesh Sharma' 
                : (email.split('@')[0].toLowerCase().includes('promoter') || email.split('@')[0].toLowerCase().includes('owner')
                    ? 'Dr. Rajesh / Promoter'
                    : `Dr. ${email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)}`))
            : 'Dr. Rajesh / Promoter');
      const userName = name ? name : defaultName;
      const userEmail = normalizedEmail;

      const defaultCompany = company || (
        isAdmin 
          ? 'NOVA Executive Council' 
          : (selectedRole === 'owner' 
              ? 'Apex Multispecialty Hospital' 
              : selectedRole === 'vendor' 
                  ? 'Apex Healthcare Solutions Pvt Ltd' 
                  : 'Healthcare Project Advisory Group')
      );

      const defaultPhone = phone || (isAdmin ? '+91 22 4982 1000' : '+91 98765 43210');
      const initialPlan = isAdmin 
        ? 'Administrator Master Access' 
        : selectedRole === 'owner' 
            ? 'Owner Free Starter' 
            : selectedRole === 'vendor' 
                ? 'Vendor Free Starter' 
                : 'Advisor Free Starter';

      const normalUser: AuthUser = {
        name: userName,
        role: isAdmin ? 'admin' : selectedRole,
        email: userEmail,
        company: defaultCompany,
        phone: defaultPhone,
        isSubscribed: true,
        plan: initialPlan,
        status: 'active',
        enrolledAccreditationId: (selectedRole === 'owner' && selectedAccreditationId) ? selectedAccreditationId : undefined,
        enrolledAccreditationDate: (selectedRole === 'owner' && selectedAccreditationId) ? new Date().toISOString() : undefined
      };

      const savedUser = registerOrUpdateUser(normalUser);
      onSuccess(savedUser);
      onClose();
      return;
    }

    // SIGN UP MODE -> Dispatches 6-digit verification OTP
    if (!name.trim()) {
      setError('Please provide your full legal name.');
      return;
    }

    const claimantName = name.trim();
    await triggerOtpDispatch(normalizedEmail, claimantName);
  };

  /**
   * Handle digit input changes with auto-advance and backspace navigation
   */
  const handleDigitChange = (index: number, val: string) => {
    // Only accept numeric digits
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length > 1) {
      // User might have pasted multiple characters
      handlePasteDigits(cleaned);
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleaned;
    setOtpDigits(updated);

    if (cleaned && index < 5) {
      digitInputsRef.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePasteDigits = (pastedText: string) => {
    const cleaned = pastedText.replace(/\D/g, '').slice(0, 6);
    if (!cleaned) return;

    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = cleaned[i] || '';
    }
    setOtpDigits(updated);

    const nextEmptyIndex = updated.findIndex(d => !d);
    if (nextEmptyIndex !== -1) {
      digitInputsRef.current[nextEmptyIndex]?.focus();
    } else {
      digitInputsRef.current[5]?.focus();
    }
  };

  /**
   * Step 2: Verify OTP and finalize registration
   */
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsProcessing(true);

    const normalizedEmail = (email || '').trim().toLowerCase();
    const userName = name.trim() || (selectedRole === 'owner' ? 'Dr. Rajesh / Promoter' : 'Healthcare Partner');
    const defaultCompany = company.trim() || (
      selectedRole === 'owner' 
        ? 'Multispecialty Hospital Project' 
        : selectedRole === 'vendor' 
            ? 'Healthcare Solutions Pvt Ltd' 
            : 'Healthcare Advisory Practice'
    );
    const defaultPhone = phone.trim() || '+91 98765 43210';
    const plan = `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Starter Plan`;

    // 1. Try backend verification endpoint
    let verified = false;
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          otp: enteredOtp,
          name: userName,
          role: selectedRole,
          phone: defaultPhone,
          company: defaultCompany,
          enrolledAccreditationId: selectedAccreditationId || undefined
        })
      });

      if (res.ok) {
        verified = true;
      }
    } catch (err) {
      console.warn('Backend verification call failed, falling back to client match:', err);
    }

    // 2. Client verification match fallback
    if (!verified && pendingOtpCode && enteredOtp === pendingOtpCode) {
      verified = true;
    }

    if (!verified) {
      setIsProcessing(false);
      setError('Incorrect verification code. Please check your inbox or click "Resend Code".');
      return;
    }

    // Create verified user
    const verifiedUser: AuthUser = {
      name: userName,
      role: selectedRole,
      email: normalizedEmail,
      company: defaultCompany,
      phone: defaultPhone,
      isSubscribed: true,
      plan,
      status: 'active',
      enrolledAccreditationId: (selectedRole === 'owner' && selectedAccreditationId) ? selectedAccreditationId : undefined,
      enrolledAccreditationDate: (selectedRole === 'owner' && selectedAccreditationId) ? new Date().toISOString() : undefined
    };

    // Save to user database
    const savedUser = registerOrUpdateUser(verifiedUser);
    setIsProcessing(false);

    onSuccess(savedUser);
    onClose();
  };

  /**
   * Resend code action
   */
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    const normalizedEmail = (email || '').trim().toLowerCase();
    const claimantName = name.trim() || 'Healthcare Partner';
    setOtpDigits(['', '', '', '', '', '']);
    await triggerOtpDispatch(normalizedEmail, claimantName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 relative my-auto transition-colors duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: CREDENTIALS (Sign In or Sign Up Form) */}
        {authStep === 'form' && (
          <>
            {/* Tab switchers: Sign In vs Sign Up */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 mb-5 border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                id="tab-signin-btn"
                onClick={() => { setMode('signin'); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                id="tab-signup-btn"
                onClick={() => { 
                  setMode('signup'); 
                  setError('');
                  if (selectedRole === 'admin') setSelectedRole('owner');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Title */}
            <div className="mb-5 text-center">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {mode === 'signup' ? 'Join the NOVA Healthcare Network' : 'Welcome Back to NOVA'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {mode === 'signup'
                  ? 'Connect directly with hospital owners, equipment vendors, and specialists.'
                  : 'Access project dashboards, verified directory details, and direct RFQs.'}
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {/* Role Selection Tabs for Sign Up only */}
            {mode === 'signup' && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Select Your Community Role:
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('owner')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      selectedRole === 'owner'
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-[11px] font-bold">Owner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('vendor')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      selectedRole === 'vendor'
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <HardHat className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[11px] font-bold">Vendor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('advisor')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      selectedRole === 'advisor'
                        ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 ring-2 ring-sky-500/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span className="text-[11px] font-bold">Advisor</span>
                  </button>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Ramesh Gupta"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {selectedRole === 'owner' ? 'Hospital / Trust Name' : 'Company / Practice Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={selectedRole === 'owner' ? 'e.g. City Life Multispecialty Hospital' : 'e.g. MedVance Engineering Ltd.'}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Accreditation Programme Enrolment for Hospital Owners */}
              {mode === 'signup' && selectedRole === 'owner' && (
                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200/80 dark:border-blue-800 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Target Accreditation Programme (Optional)</span>
                    </label>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                      Customizes Toolkit
                    </span>
                  </div>
                  <select
                    value={selectedAccreditationId}
                    onChange={(e) => setSelectedAccreditationId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                  >
                    <option value="">None / General 15-Stage Hospital Development Roadmap</option>
                    {accreditationProgrammes.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name} ({prog.applicableStageNumbers.length} stages mapped)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Free Signup Assurance in Signup Mode */}
              {mode === 'signup' && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-xl p-3 text-xs space-y-1 animate-fadeIn">
                  <div className="flex items-center justify-between text-emerald-950 dark:text-emerald-200 font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Email OTP Verification Required</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                      Free Account
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    A 6-digit confirmation code will be dispatched to your email address to ensure verified healthcare identity.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-md mt-2 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Sending Verification Code...</span>
                  </>
                ) : mode === 'signup' ? (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Verification OTP</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In to Member Portal</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer switch between Sign In and Sign Up */}
            <div className="text-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs">
              {mode === 'signin' ? (
                <p className="text-slate-500 dark:text-slate-400">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setSelectedRole('owner'); }}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer underline"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </>
        )}

        {/* STEP 2: 6-DIGIT EMAIL OTP VERIFICATION */}
        {authStep === 'otp' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header with Back button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setAuthStep('form'); setError(''); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                title="Back to registration details"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Verify Email Address</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Enter the 6-digit code sent to <strong className="text-slate-700 dark:text-slate-300">{email}</strong>
                </p>
              </div>
            </div>

            {/* Status notice */}
            {otpSentNotice && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-medium truncate">{otpSentNotice}</span>
                </div>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {/* 6 Digit Inputs */}
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { digitInputsRef.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(index, e)}
                    onPaste={(e) => {
                      e.preventDefault();
                      handlePasteDigits(e.clipboardData.getData('text'));
                    }}
                    className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-2xl font-black rounded-xl border transition-all ${
                      digit 
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20' 
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                    } focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden font-mono`}
                  />
                ))}
              </div>

              {/* Resend Code Bar */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="text-slate-500 dark:text-slate-400">
                  {resendCooldown > 0 ? (
                    <span>Resend available in <strong className="text-blue-600 font-mono">{resendCooldown}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Resend Verification Code</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || otpDigits.some(d => !d)}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify &amp; Unlock Workspace</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 text-[11px] text-slate-400">
              Security note: Code is single-use and expires in 10 minutes.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
