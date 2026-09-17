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
  | 'admin'
  | 'dashboard';

export const getSlugFromPath = (): RouteSlug => {
  if (typeof window === 'undefined') return '';
  // Check pathname first e.g. /owners or /pricing
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
    'admin',
    'dashboard'
  ];

  if (validSlugs.includes(path as RouteSlug)) {
    return path as RouteSlug;
  }
  return '';
};

export const navigateToSlug = (slug: RouteSlug, replace: boolean = false) => {
  if (typeof window === 'undefined') return;
  const newPath = slug ? `/${slug}` : '/';
  
  if (replace) {
    window.history.replaceState({ slug }, '', newPath);
  } else {
    window.history.pushState({ slug }, '', newPath);
  }

  // Dispatch custom popstate event so listeners update immediately
  window.dispatchEvent(new PopStateEvent('popstate', { state: { slug } }));
};
