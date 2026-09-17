import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { UserRole, AuthUser } from '../types';
import { getSampleLogins } from '../utils/sampleLogins';
import { registerOrUpdateUser, isUserDisabled } from '../utils/userManagement';

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

  // Synchronize active tab whenever dialog is triggered or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setMode(initialMode);
      if (initialRole) {
        setSelectedRole(initialRole);
      }
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const sampleAccounts = getSampleLogins();

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = (email || '').trim().toLowerCase();

    // Check if account has been disabled by administrator
    if (isUserDisabled(normalizedEmail)) {
      setError('This account has been disabled by an administrator. Please contact support@nova-h.in for assistance.');
      return;
    }

    const adminSample = sampleAccounts.find(a => a.role === 'admin');
    const isAdmin = (adminSample && normalizedEmail === adminSample.email.toLowerCase()) || normalizedEmail === 'admin@nova-h.in' || normalizedEmail.startsWith('admin') || selectedRole === 'admin';

    const defaultName = mode === 'signin'
      ? (isAdmin 
          ? 'NOVA System Administrator' 
          : (email.includes('@') 
              ? (email.split('@')[0] === 'codesandboxrepository' 
                  ? 'Dr. Rajesh Sharma' 
                  : (email.split('@')[0].toLowerCase().includes('promoter') || email.split('@')[0].toLowerCase().includes('owner')
                      ? 'Dr. Rajesh / Promoter'
                      : `Dr. ${email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)}`))
              : 'Dr. Rajesh / Promoter'))
      : (name || (selectedRole === 'owner' ? 'Dr. Rajesh / Promoter' : 'Healthcare Partner'));
    const userName = name ? name : defaultName;
    const userEmail = email || (isAdmin ? 'admin@nova-h.in' : 'promoter@hospital.com');

    // Sensible defaults for company and phone if not entered in signin mode
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

    // Default plan assignment (Direct free registration, no payment required)
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
      status: 'active'
    };

    // Register or update in user database
    const savedUser = registerOrUpdateUser(normalUser);

    onSuccess(savedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switchers: Sign In vs Sign Up */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-5 border border-slate-200/80">
          <button
            type="button"
            id="tab-signin-btn"
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            id="tab-signup-btn"
            onClick={() => { 
              setMode('signup'); 
              if (selectedRole === 'admin') setSelectedRole('owner');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Title */}
        <div className="mb-5 text-center">
          <h3 className="text-xl font-extrabold text-slate-900">
            {mode === 'signup' ? 'Join the NOVA Healthcare Network' : 'Welcome Back to NOVA'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'signup'
              ? 'Connect directly with hospital owners, equipment vendors, and specialists.'
              : 'Access project dashboards, verified directory details, and direct RFQs.'}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Role Selection Tabs for Sign Up only */}
        {mode === 'signup' && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Select Your Community Role:
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('owner')}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedRole === 'owner'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/30'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] font-bold">Owner</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('vendor')}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedRole === 'vendor'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/30'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <HardHat className="w-4 h-4 text-indigo-600" />
                <span className="text-[11px] font-bold">Vendor</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('advisor')}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedRole === 'advisor'
                    ? 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-500/30'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <UserCheck className="w-4 h-4 text-sky-600" />
                <span className="text-[11px] font-bold">Advisor</span>
              </button>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {selectedRole === 'owner' ? 'Hospital / Trust Name' : 'Company / Practice Name'}
              </label>
              <input
                type="text"
                placeholder={selectedRole === 'owner' ? 'e.g. City Life Multispecialty Hospital' : 'e.g. MedVance Engineering Ltd.'}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone / Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Free Signup Assurance in Signup Mode */}
          {mode === 'signup' && (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-xs space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between text-emerald-950 font-bold">
                <span className="flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Free Instant Registration</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900">
                  ₹0 / Free Access
                </span>
              </div>
              <p className="text-[11px] text-emerald-800">
                {selectedRole === 'owner' && 'Full founder access: explore the 15-stage hospital toolkit, post project requirements, and connect with verified partners.'}
                {selectedRole === 'vendor' && 'Direct supplier onboarding: list products, respond to hospital RFPs, and receive inquiries.'}
                {selectedRole === 'advisor' && 'Direct advisory onboarding: join hospital consultancy panels and review promoter RFPs.'}
              </p>
              <div className="pt-1.5 border-t border-emerald-200/60 flex items-center justify-between text-[10px] text-emerald-700">
                <span>✓ No payment or credit card required</span>
                <span className="font-semibold text-emerald-800">Instant Activation</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-md mt-2 flex items-center justify-center gap-1.5"
          >
            {mode === 'signup' ? (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Create Free Account (No Payment Required)</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign In as Member</span>
              </>
            )}
          </button>
        </form>

        {/* Footer switch between Sign In and Sign Up */}
        <div className="text-center mt-4 pt-3 border-t border-slate-100 text-xs">
          {mode === 'signin' ? (
            <p className="text-slate-500">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setSelectedRole('owner'); }}
                className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
