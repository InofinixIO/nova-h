import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  HardHat, 
  UserCheck, 
  Lock, 
  Mail, 
  User, 
  Phone 
} from 'lucide-react';
import { UserRole, AuthUser } from '../types';

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

  // Synchronize active tab whenever dialog is triggered or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      if (initialRole) {
        setSelectedRole(initialRole);
      }
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const defaultName = mode === 'signin'
      ? (email.includes('@') ? email.split('@')[0] : 'Healthcare User')
      : (name || (selectedRole === 'owner' ? 'Dr. Sharma (Promoter)' : 'Healthcare Partner'));
    const userName = name ? name : defaultName;
    const userEmail = email || 'user@nova-h.in';

    const normalUser: AuthUser = {
      name: userName,
      role: selectedRole,
      email: userEmail,
      company: company || undefined,
      phone: phone || undefined,
      isSubscribed: mode === 'signin'
    };

    onSuccess(normalUser);

    if (mode === 'signup' && onProceedToPayment) {
      if (selectedRole === 'owner') {
        onProceedToPayment('owner', {
          planId: 'owner_annual',
          title: 'Hospital Owner Membership',
          amount: 1000,
          billingBasis: 'Per hospital / project'
        });
      } else if (selectedRole === 'advisor') {
        onProceedToPayment('advisor', {
          planId: 'advisor_annual',
          title: 'Advisor Membership',
          amount: 1000,
          billingBasis: 'Per advisor specialist'
        });
      } else if (selectedRole === 'vendor') {
        onProceedToPayment('vendor', {
          planId: 'vendor_2l_to_5l',
          title: 'Healthcare Vendor Membership (Standard)',
          amount: 2000,
          billingBasis: 'Order value: ₹2 Lakhs – ₹5 Lakhs'
        });
      }
    }

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

          {/* Membership Pricing Preview in Signup Mode */}
          {mode === 'signup' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Annual Membership:</span>
                <span className="font-bold text-blue-700">
                  {selectedRole === 'vendor' ? '₹1,000 - ₹5,000 /yr' : '₹1,000 /yr'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {selectedRole === 'owner' && 'Flat annual fee per hospital project. Access the complete 15-stage toolkit.'}
                {selectedRole === 'vendor' && 'Auto-mapped based on typical 50-bed order value. Includes verified directory listing.'}
                {selectedRole === 'advisor' && 'Annual platform membership. Eligible for Macula Healthcare project delivery.'}
              </p>
              <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>Supported Gateways:</span>
                <span className="flex items-center gap-2 font-medium text-slate-600">
                  <span className="text-blue-700 font-bold">Razorpay</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">PayU</span>
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs mt-2 flex items-center justify-center gap-1.5"
          >
            {mode === 'signup' ? (
              `Register & Subscribe as ${selectedRole.toUpperCase()}`
            ) : (
              `Sign In as Member`
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
