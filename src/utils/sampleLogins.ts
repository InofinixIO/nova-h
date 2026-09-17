import { UserRole } from '../types';

export interface SampleLoginAccount {
  role: UserRole;
  label: string;
  icon: string;
  email: string;
  password?: string;
  adminKey?: string;
  styling: {
    border: string;
    bg: string;
    hoverBg: string;
    text: string;
    titleColor: string;
    emailColor: string;
  };
}

// Safely access env vars
const getEnvVal = (keys: string[]): string | undefined => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    for (const key of keys) {
      const val = (import.meta.env as Record<string, any>)[key];
      if (typeof val === 'string' && val.trim().length > 0) {
        return val.trim();
      }
    }
  }
  return undefined;
};

export const getSampleLogins = (): SampleLoginAccount[] => {
  const sampleAccounts: SampleLoginAccount[] = [];

  const defaultPassword = getEnvVal([
    'VITE_SAMPLE_DEFAULT_PASSWORD',
    'SAMPLE_DEFAULT_PASSWORD',
    'VITE_DEMO_PASSWORD',
    'DEMO_PASSWORD'
  ]) || 'admin123';

  // 1. Check individual role env variables
  const adminEmail = getEnvVal([
    'VITE_SAMPLE_ADMIN_EMAIL',
    'SAMPLE_ADMIN_EMAIL',
    'VITE_DEMO_ADMIN_EMAIL',
    'DEMO_ADMIN_EMAIL'
  ]);

  const ownerEmail = getEnvVal([
    'VITE_SAMPLE_OWNER_EMAIL',
    'SAMPLE_OWNER_EMAIL',
    'VITE_DEMO_OWNER_EMAIL',
    'DEMO_OWNER_EMAIL'
  ]);

  const vendorEmail = getEnvVal([
    'VITE_SAMPLE_VENDOR_EMAIL',
    'SAMPLE_VENDOR_EMAIL',
    'VITE_DEMO_VENDOR_EMAIL',
    'DEMO_VENDOR_EMAIL'
  ]);

  const advisorEmail = getEnvVal([
    'VITE_SAMPLE_ADVISOR_EMAIL',
    'SAMPLE_ADVISOR_EMAIL',
    'VITE_DEMO_ADVISOR_EMAIL',
    'DEMO_ADVISOR_EMAIL'
  ]);

  // 2. Also check combined list variable: e.g. "admin@domain.com,owner@domain.com" or "admin:a@b.com,owner:c@d.com"
  const combinedEmails = getEnvVal([
    'VITE_SAMPLE_LOGIN_EMAILS',
    'SAMPLE_LOGIN_EMAILS',
    'VITE_DEMO_LOGIN_EMAILS',
    'DEMO_LOGIN_EMAILS'
  ]);

  let parsedCombined: Record<string, string> = {};
  if (combinedEmails) {
    const parts = combinedEmails.split(',').map(s => s.trim()).filter(Boolean);
    parts.forEach((part, index) => {
      if (part.includes(':')) {
        const [roleKey, mail] = part.split(':');
        if (roleKey && mail) {
          parsedCombined[roleKey.trim().toLowerCase()] = mail.trim();
        }
      } else {
        // Position-based mapping: 0=admin, 1=owner, 2=vendor, 3=advisor
        const roles: UserRole[] = ['admin', 'owner', 'vendor', 'advisor'];
        const targetRole = roles[index];
        if (targetRole && !parsedCombined[targetRole]) {
          parsedCombined[targetRole] = part;
        }
      }
    });
  }

  const resolvedAdmin = adminEmail || parsedCombined['admin'];
  const resolvedOwner = ownerEmail || parsedCombined['owner'];
  const resolvedVendor = vendorEmail || parsedCombined['vendor'];
  const resolvedAdvisor = advisorEmail || parsedCombined['advisor'];

  const adminKey = getEnvVal(['VITE_SAMPLE_ADMIN_KEY', 'SAMPLE_ADMIN_KEY', 'ADMIN_KEY']) || 'NOVA-ADMIN-2026';

  if (resolvedAdmin) {
    sampleAccounts.push({
      role: 'admin',
      label: 'Admin Console',
      icon: '🛡️',
      email: resolvedAdmin,
      password: defaultPassword === 'admin123' ? 'admin123' : defaultPassword,
      adminKey,
      styling: {
        border: 'border-purple-200',
        bg: 'bg-purple-50/80',
        hoverBg: 'hover:bg-purple-100',
        text: 'text-purple-900',
        titleColor: 'text-purple-700',
        emailColor: 'text-purple-600'
      }
    });
  }

  if (resolvedOwner) {
    sampleAccounts.push({
      role: 'owner',
      label: 'Hospital Owner',
      icon: '🏥',
      email: resolvedOwner,
      password: defaultPassword === 'admin123' ? 'owner123' : defaultPassword,
      styling: {
        border: 'border-blue-200',
        bg: 'bg-blue-50/80',
        hoverBg: 'hover:bg-blue-100',
        text: 'text-blue-900',
        titleColor: 'text-blue-700',
        emailColor: 'text-blue-600'
      }
    });
  }

  if (resolvedVendor) {
    sampleAccounts.push({
      role: 'vendor',
      label: 'Vendor Partner',
      icon: '🏗️',
      email: resolvedVendor,
      password: defaultPassword === 'admin123' ? 'vendor123' : defaultPassword,
      styling: {
        border: 'border-indigo-200',
        bg: 'bg-indigo-50/80',
        hoverBg: 'hover:bg-indigo-100',
        text: 'text-indigo-900',
        titleColor: 'text-indigo-700',
        emailColor: 'text-indigo-600'
      }
    });
  }

  if (resolvedAdvisor) {
    sampleAccounts.push({
      role: 'advisor',
      label: 'Healthcare Advisor',
      icon: '📋',
      email: resolvedAdvisor,
      password: defaultPassword === 'admin123' ? 'advisor123' : defaultPassword,
      styling: {
        border: 'border-sky-200',
        bg: 'bg-sky-50/80',
        hoverBg: 'hover:bg-sky-100',
        text: 'text-sky-900',
        titleColor: 'text-sky-700',
        emailColor: 'text-sky-600'
      }
    });
  }

  return sampleAccounts;
};

export const hasSampleLogins = (): boolean => {
  return getSampleLogins().length > 0;
};

export const getAdminSampleLogin = (): SampleLoginAccount | undefined => {
  return getSampleLogins().find(a => a.role === 'admin');
};
