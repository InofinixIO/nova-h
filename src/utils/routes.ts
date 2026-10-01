export type RouteSlug = 
  | '' 
  | 'owners' 
  | 'vendors' 
  | 'advisors' 
  | 'toolkit' 
  | 'how-it-works' 
  | 'pricing' 
  | 'directory' 
  | 'about' 
  | 'pamphlet'
  | 'compare'
  | 'admin'
  | 'admin/users'
  | 'admin/directory'
  | 'admin/listings'
  | 'admin/requirements'
  | 'admin/rfqs'
  | 'admin/import-csv'
  | 'admin/add-partner'
  | 'admin/toolkit'
  | 'admin/coupons'
  | 'admin/pamphlet'
  | 'admin/mjml'
  | 'dashboard'
  | 'dashboard/inquiries'
  | 'dashboard/sent'
  | 'dashboard/leads'
  | 'dashboard/profile'
  | 'whatsapp-flow'
  | 'flow-builder'
  | 'rfp'
  | 'procurement'
  | 'mjml-builder'
  | 'email-templates'
  | 'architecture'
  | 'backend-architecture';

export const getSlugFromPath = (): RouteSlug => {
  if (typeof window === 'undefined') return '';
  // Check pathname first e.g. /owners or /pricing or /admin/users
  let path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  
  // If running in some iframe / subfolder environments, check hash fallback if path is empty
  if (!path && window.location.hash) {
    path = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  }

  const validSlugs: RouteSlug[] = [
    'owners',
    'vendors',
    'advisors',
    'toolkit',
    'how-it-works',
    'pricing',
    'directory',
    'about',
    'pamphlet',
    'compare',
    'admin',
    'admin/users',
    'admin/directory',
    'admin/listings',
    'admin/requirements',
    'admin/rfqs',
    'admin/import-csv',
    'admin/add-partner',
    'admin/toolkit',
    'admin/coupons',
    'admin/pamphlet',
    'admin/mjml',
    'dashboard',
    'dashboard/inquiries',
    'dashboard/sent',
    'dashboard/leads',
    'dashboard/profile',
    'whatsapp-flow',
    'flow-builder',
    'rfp',
    'procurement',
    'mjml-builder',
    'email-templates',
    'architecture',
    'backend-architecture'
  ];

  if (validSlugs.includes(path as RouteSlug)) {
    return path as RouteSlug;
  }

  // Handle prefix fallback for /admin/* and /dashboard/*
  if (path.startsWith('admin/')) {
    return 'admin';
  }
  if (path.startsWith('dashboard/')) {
    return 'dashboard';
  }

  return '';
};

export const navigateToSlug = (slug: RouteSlug | string, replace: boolean = false) => {
  if (typeof window === 'undefined') return;
  const cleanSlug = slug.startsWith('/') ? slug.slice(1) : slug;
  const newPath = cleanSlug ? `/${cleanSlug}` : '/';
  
  if (replace) {
    window.history.replaceState({ slug }, '', newPath);
  } else {
    window.history.pushState({ slug }, '', newPath);
  }

  // Dispatch custom popstate event so listeners update immediately
  window.dispatchEvent(new PopStateEvent('popstate', { state: { slug } }));
};
