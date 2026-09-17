import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthUser } from '../types';

interface AdminLoginFormProps {
  onSuccess: (user: AuthUser) => void;
  onCancel?: () => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('admin@nova-h.in');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const validAdminEmails = ['admin@nova-h.in', 'superadmin@nova-h.in', 'director@nova-h.in'];
    const normalizedEmail = email.trim().toLowerCase();
    const isAdminEmail = validAdminEmails.includes(normalizedEmail) || normalizedEmail.includes('admin');

    // Administrative access validation
    if (
      !isAdminEmail &&
      password !== 'admin123' &&
      password !== 'nova2026' &&
      adminKey !== 'NOVA-ADMIN-2026'
    ) {
      setError('Invalid administrative credentials. Use administrator email (admin@nova-h.in) and master password.');
      setLoading(false);
      return;
    }

    const adminUser: AuthUser = {
      name: 'NOVA System Administrator',
      role: 'admin',
      email: normalizedEmail || 'admin@nova-h.in',
      company: 'NOVA Executive Council',
      phone: '+91 22 4982 1000',
      isSubscribed: true
    };

    setTimeout(() => {
      setLoading(false);
      onSuccess(adminUser);
    }, 250);
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md font-black">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-white tracking-tight">Admin Console Login</h3>
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Restricted
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Authorized credentials required to inspect directory listings &amp; import CSVs.
            </p>
          </div>
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Administrator Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              placeholder="admin@nova-h.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Master Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              placeholder="Enter master admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Security Access Token (Optional)
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. NOVA-ADMIN-2026"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white font-mono"
            />
          </div>
        </div>

        {/* Demo Helper Box */}
        <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs text-purple-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-purple-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
            <span>Default Demo Credentials:</span>
          </p>
          <p className="text-[11px] font-mono text-purple-700">
            Email: <span className="font-bold">admin@nova-h.in</span> | Password: <span className="font-bold">admin123</span>
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{loading ? 'Verifying Credentials...' : 'Authenticate & Enter Admin Console'}</span>
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Portal</span>
          </button>
        )}
      </form>
    </div>
  );
};
