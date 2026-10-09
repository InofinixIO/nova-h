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
  | 'admin/claims'
  | 'admin/requirements'
  | 'admin/rfqs'
  | 'admin/import-csv'
  | 'admin/add-partner'
  | 'admin/toolkit'
  | 'admin/accreditation'
  | 'admin/coupons'
  | 'admin/pamphlet'
  | 'admin/mjml'
  | 'dashboard'
  | 'dashboard/inquiries'
  | 'dashboard/sent'
  | 'dashboard/leads'
  | 'dashboard/profile'
  | 'claim'
  | 'claim-profile'
  | 'whatsapp-flow'
  | 'flow-builder'
  | 'rfp'
  | `rfp/${string}`
  | 'procurement'
  | `procurement/${string}`
  | 'mjml-builder'
  | 'email-templates'
  | 'architecture'
  | 'backend-architecture'
  | 'partner'
  | `partner/${string}`;

export const getSlugFromPath = (): RouteSlug => {
  if (typeof window === 'undefined') return '';
  // Check pathname first e.g. /owners or /pricing or /admin/users or /partner/1
  let path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  
  // If running in some iframe / subfolder environments, check hash fallback if path is empty
  if (!path && window.location.hash) {
    path = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  }

  // Handle RFP deep links (e.g. /rfp, /rfp/rfp-ct-scan-blr-0042, /rfp/rfp-ct-scan-blr-0042/comparison)
  if (path === 'rfp' || path.startsWith('rfp/')) {
    return path as RouteSlug;
  }
  if (path === 'procurement' || path.startsWith('procurement/')) {
    return path as RouteSlug;
  }

  // Handle partner item detail page (e.g. /partner/1 or /partner/apex-biomedical)
  if (path.startsWith('partner/')) {
    return path as RouteSlug;
  }
  if (path === 'partner') {
    return 'partner';
  }

  if (path === 'claim' || path === 'claim-profile' || path.startsWith('claim/')) {
    return 'claim';
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
    'claim',
    'claim-profile',
    'admin',
    'admin/users',
    'admin/directory',
    'admin/listings',
    'admin/claims',
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

/**
 * Extracts claim target ID from URL query string (?id=... or ?profileId=...) or path
 */
export const getClaimIdFromUrl = (): string => {
  if (typeof window === 'undefined') return '';
  const searchParams = new URLSearchParams(window.location.search);
  const idFromQuery = searchParams.get('id') || searchParams.get('profileId') || searchParams.get('claimId');
  if (idFromQuery) return idFromQuery;
  
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (path.toLowerCase().startsWith('claim/')) {
    return decodeURIComponent(path.slice('claim/'.length));
  }
  return '';
};

/**
 * Extracts partner ID or slug identifier from the current window path
 */
export const getPartnerIdentifierFromUrl = (): string => {
  if (typeof window === 'undefined') return '';
  let path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (!path && window.location.hash) {
    path = window.location.hash.replace(/^#\/?/, '');
  }
  if (path.toLowerCase().startsWith('partner/')) {
    return decodeURIComponent(path.slice('partner/'.length));
  }
  return '';
};

/**
 * Generates a clean URL slug for a directory partner
 */
export const createPartnerSlug = (id: string): string => {
  if (!id) return 'directory';
  return `partner/${encodeURIComponent(id.trim())}`;
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

export interface RfpRouteParams {
  rfpId: string | null;
  tab: string | null;
}

/**
 * Extracts RFP ID and active tab from current URL path or search parameters
 * Supports: /rfp/:id, /rfp/:id/:tab, /procurement/:id, and ?id=...&tab=...
 */
export const getRfpRouteParamsFromUrl = (): RfpRouteParams => {
  if (typeof window === 'undefined') return { rfpId: null, tab: null };

  // 1. Check URL query parameters (?id=... or ?rfpId=... and ?tab=...)
  const searchParams = new URLSearchParams(window.location.search);
  const queryId = searchParams.get('id') || searchParams.get('rfpId') || searchParams.get('rfp');
  const queryTab = searchParams.get('tab') || searchParams.get('section');

  // 2. Check path segments
  let path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (!path && window.location.hash) {
    path = window.location.hash.replace(/^#\/?/, '');
  }

  let pathId: string | null = null;
  let pathTab: string | null = null;

  const segments = path.split('/');
  const prefix = segments[0]?.toLowerCase();

  if (prefix === 'rfp' || prefix === 'procurement') {
    if (segments.length >= 2 && segments[1]) {
      pathId = decodeURIComponent(segments[1]);
    }
    if (segments.length >= 3 && segments[2]) {
      pathTab = decodeURIComponent(segments[2]).toLowerCase();
    }
  }

  return {
    rfpId: pathId || queryId || null,
    tab: (pathTab || queryTab || null)?.toLowerCase() || null
  };
};

/**
 * Builds clean route path for an RFP tender and tab
 * e.g., /rfp, /rfp/rfp-ct-scan-blr-0042, /rfp/rfp-ct-scan-blr-0042/comparison
 */
export const buildRfpPath = (rfpId?: string | null, tab?: string | null): string => {
  if (!rfpId) return 'rfp';
  const cleanId = encodeURIComponent(rfpId.trim());
  if (!tab) {
    return `rfp/${cleanId}`;
  }
  return `rfp/${cleanId}/${encodeURIComponent(tab.trim().toLowerCase())}`;
};

/**
 * Navigates to an RFP tender with appropriate history mode (push for tender, replace for tab)
 */
export const navigateToRfp = (rfpId?: string | null, tab?: string | null, replace: boolean = false) => {
  const path = buildRfpPath(rfpId, tab);
  navigateToSlug(path, replace);
};

