import { AuthUser, UserRole } from '../types';

const STORAGE_KEY = 'nova_h_all_users';

export const DEFAULT_USERS: AuthUser[] = [
  {
    id: 'user-admin-1',
    name: 'NOVA System Administrator',
    role: 'admin',
    email: 'admin@nova-h.in',
    phone: '+91 22 4982 1000',
    company: 'NOVA Executive Council',
    isSubscribed: true,
    plan: 'Administrator Master Access',
    status: 'active',
    createdAt: '2026-01-15T10:00:00Z',
    lastLoginAt: '2026-09-17T04:30:00Z'
  },
  {
    id: 'user-owner-1',
    name: 'Dr. Rajesh Sharma',
    role: 'owner',
    email: 'dr.sharma@apexhealth.in',
    phone: '+91 98765 43210',
    company: 'Apex Multispecialty Hospital',
    isSubscribed: false,
    plan: 'Owner Free Starter',
    status: 'active',
    createdAt: '2026-02-10T14:20:00Z',
    lastLoginAt: '2026-09-16T18:15:00Z'
  },
  {
    id: 'user-owner-2',
    name: 'Dr. Meera Patel',
    role: 'owner',
    email: 'promoter@cityhospital.in',
    phone: '+91 98221 55667',
    company: 'City Life Care & Research Institute',
    isSubscribed: true,
    plan: 'Owner Annual (₹1,000/yr)',
    status: 'active',
    createdAt: '2026-02-28T11:45:00Z',
    lastLoginAt: '2026-09-15T09:12:00Z'
  },
  {
    id: 'user-vendor-1',
    name: 'Vikram Malhotra',
    role: 'vendor',
    email: 'vendor@medtechdevices.in',
    phone: '+91 98111 22334',
    company: 'MedTech Solutions Pvt Ltd',
    isSubscribed: true,
    plan: 'Vendor Standard (₹2,000/yr)',
    status: 'active',
    createdAt: '2026-03-05T08:30:00Z',
    lastLoginAt: '2026-09-16T16:40:00Z'
  },
  {
    id: 'user-vendor-2',
    name: 'Anil Deshmukh',
    role: 'vendor',
    email: 'cleanroom@biomax.in',
    phone: '+91 98334 77889',
    company: 'BioMax MGPS & Cleanroom Engineering',
    isSubscribed: false,
    plan: 'Vendor Free Starter',
    status: 'active',
    createdAt: '2026-03-14T12:00:00Z',
    lastLoginAt: '2026-09-14T11:20:00Z'
  },
  {
    id: 'user-advisor-1',
    name: 'Dr. Sanjeev Kapoor',
    role: 'advisor',
    email: 'advisor@maculahealth.in',
    phone: '+91 98220 54321',
    company: 'Macula Healthcare Consulting',
    isSubscribed: true,
    plan: 'Advisor Specialist (₹1,000/yr)',
    status: 'active',
    createdAt: '2026-01-20T15:10:00Z',
    lastLoginAt: '2026-09-17T02:05:00Z'
  },
  {
    id: 'user-advisor-2',
    name: 'Priya Nair',
    role: 'advisor',
    email: 'ar.nair@healthbuild.in',
    phone: '+91 97440 33221',
    company: 'HealthBuild Architects & Planners',
    isSubscribed: false,
    plan: 'Advisor Free Starter',
    status: 'active',
    createdAt: '2026-04-02T16:45:00Z',
    lastLoginAt: '2026-09-13T14:30:00Z'
  },
  {
    id: 'user-vendor-disabled',
    name: 'Kavita Sundaram',
    role: 'vendor',
    email: 'kavita@sundaramsurgical.com',
    phone: '+91 98660 12345',
    company: 'Sundaram Surgical Disposables',
    isSubscribed: false,
    plan: 'Vendor Free Starter',
    status: 'disabled',
    createdAt: '2026-05-18T09:15:00Z',
    lastLoginAt: '2026-08-01T10:00:00Z'
  }
];

export const getAllUsers = (): AuthUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
};

export const saveAllUsers = (users: AuthUser[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    saveUsersToServer(users);
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
};

export const fetchUsersFromServer = async (): Promise<void> => {
  try {
    const res = await fetch('/api/users');
    const users = await res.json();
    if (users && Array.isArray(users)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
  } catch (e) {
    console.error('Failed to fetch users from server:', e);
  }
};

export const saveUsersToServer = async (users: AuthUser[]): Promise<void> => {
  try {
    for (const user of users) {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
    }
  } catch (e) {
    console.error('Failed to save users to server:', e);
  }
};

/**
 * Register or update a user upon signup or signin
 */
export const registerOrUpdateUser = (userData: AuthUser): AuthUser => {
  const users = getAllUsers();
  const emailNorm = (userData.email || '').trim().toLowerCase();
  const existingIndex = users.findIndex(u => (u.email || '').trim().toLowerCase() === emailNorm);

  const defaultPlanForRole = (role: UserRole) => {
    switch (role) {
      case 'owner': return 'Owner Free Starter';
      case 'vendor': return 'Vendor Free Starter';
      case 'advisor': return 'Advisor Free Starter';
      case 'admin': return 'Administrator Master Access';
    }
  };

  if (existingIndex >= 0) {
    const existing = users[existingIndex];
    const updated: AuthUser = {
      ...existing,
      name: userData.name || existing.name,
      role: userData.role || existing.role,
      company: userData.company || existing.company,
      phone: userData.phone || existing.phone,
      plan: userData.plan || existing.plan || defaultPlanForRole(userData.role),
      status: existing.status || 'active',
      lastLoginAt: new Date().toISOString()
    };
    users[existingIndex] = updated;
    saveAllUsers(users);
    return updated;
  } else {
    const newUser: AuthUser = {
      id: userData.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: userData.name || 'Healthcare User',
      role: userData.role,
      email: userData.email,
      phone: userData.phone || '+91 98765 43210',
      company: userData.company || 'Healthcare Organization',
      isSubscribed: userData.isSubscribed ?? false,
      plan: userData.plan || defaultPlanForRole(userData.role),
      status: userData.status || 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    const updatedList = [newUser, ...users];
    saveAllUsers(updatedList);
    return newUser;
  }
};

/**
 * Toggle user status between active and disabled
 */
export const toggleUserStatus = (email: string): AuthUser[] => {
  const users = getAllUsers();
  const emailNorm = email.trim().toLowerCase();
  const updated = users.map(u => {
    if ((u.email || '').trim().toLowerCase() === emailNorm) {
      const nextStatus: 'active' | 'disabled' | 'pending' = u.status === 'disabled' ? 'active' : 'disabled';
      return { ...u, status: nextStatus };
    }
    return u;
  });
  saveAllUsers(updated);
  return updated;
};

/**
 * Approve a pending user (Admin only)
 */
export const approveUser = (email: string): AuthUser[] => {
  const users = getAllUsers();
  const emailNorm = email.trim().toLowerCase();
  const updated = users.map(u => {
    if ((u.email || '').trim().toLowerCase() === emailNorm && u.status === 'pending') {
      return { ...u, status: 'active', plan: 'Advisor Active Access' } as AuthUser;
    }
    return u;
  });
  saveAllUsers(updated);
  return updated;
};

/**
 * Check if a user is pending
 */
export const isUserPending = (email: string): boolean => {
  const users = getAllUsers();
  const emailNorm = (email || '').trim().toLowerCase();
  const user = users.find(u => (u.email || '').trim().toLowerCase() === emailNorm);
  return user ? user.status === 'pending' : false;
};

/**
 * Update plan for a user
 */
export const updateUserPlan = (email: string, newPlan: string): AuthUser[] => {
  const users = getAllUsers();
  const emailNorm = email.trim().toLowerCase();
  const updated = users.map(u => {
    if ((u.email || '').trim().toLowerCase() === emailNorm) {
      return { ...u, plan: newPlan };
    }
    return u;
  });
  saveAllUsers(updated);
  return updated;
};

/**
 * Check if a user is disabled
 */
export const isUserDisabled = (email: string): boolean => {
  if (!email) return false;
  const users = getAllUsers();
  const emailNorm = email.trim().toLowerCase();
  const user = users.find(u => (u.email || '').trim().toLowerCase() === emailNorm);
  return user?.status === 'disabled';
};

/**
 * Check if localStorage dev mode is active (`dev=1`)
 */
export const isDevModeActive = (): boolean => {
  try {
    return localStorage.getItem('dev') === '1';
  } catch {
    return false;
  }
};

/**
 * Set localStorage dev mode
 */
export const setDevMode = (enabled: boolean): void => {
  try {
    if (enabled) {
      localStorage.setItem('dev', '1');
    } else {
      localStorage.removeItem('dev');
    }
  } catch {}
};
