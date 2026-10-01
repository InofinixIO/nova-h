export interface DirectorySearchParams {
  q?: string;
  role?: 'all' | 'vendor' | 'advisor';
  stage?: string;
  category?: string;
  location?: string;
}

/**
 * Parses directory search parameters from window.location.search
 */
export const getDirectoryParamsFromUrl = (): DirectorySearchParams => {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const result: DirectorySearchParams = {};

    const q = params.get('q');
    if (q && q.trim()) {
      result.q = q.trim();
    }

    const role = params.get('role') || params.get('type');
    if (role && (role === 'all' || role === 'vendor' || role === 'advisor')) {
      result.role = role as 'all' | 'vendor' | 'advisor';
    }

    const stage = params.get('stage');
    if (stage && stage !== 'All' && stage.trim()) {
      result.stage = stage.trim();
    }

    const category = params.get('category');
    if (category && category !== 'All' && category.trim()) {
      result.category = category.trim();
    }

    const location = params.get('location');
    if (location && location !== 'All' && location.trim()) {
      result.location = location.trim();
    }

    return result;
  } catch (e) {
    console.error('Failed to parse directory URL params:', e);
    return {};
  }
};

/**
 * Builds a query string or full URL from directory search parameters,
 * omitting default values to keep URLs clean.
 */
export const buildDirectoryQueryString = (criteria: DirectorySearchParams): string => {
  const params = new URLSearchParams();

  if (criteria.q && criteria.q.trim()) {
    params.set('q', criteria.q.trim());
  }

  if (criteria.role && criteria.role !== 'all') {
    params.set('role', criteria.role);
  }

  if (criteria.stage && criteria.stage !== 'All' && criteria.stage.trim()) {
    params.set('stage', criteria.stage.trim());
  }

  if (criteria.category && criteria.category !== 'All' && criteria.category.trim()) {
    params.set('category', criteria.category.trim());
  }

  if (criteria.location && criteria.location !== 'All' && criteria.location.trim()) {
    params.set('location', criteria.location.trim());
  }

  return params.toString();
};

/**
 * Builds a complete URL with directory criteria for sharing or QR code generation
 */
export const buildDirectoryUrl = (
  criteria: DirectorySearchParams,
  basePath: string = '/directory',
  origin?: string
): string => {
  const qs = buildDirectoryQueryString(criteria);
  const base = origin ? `${origin.replace(/\/+$/, '')}${basePath.startsWith('/') ? basePath : `/${basePath}`}` : basePath;
  return qs ? `${base}?${qs}` : base;
};

/**
 * Synchronizes directory search criteria into the current browser URL
 */
export const updateDirectoryUrlParams = (
  criteria: DirectorySearchParams,
  replace: boolean = false,
  targetPath?: string
) => {
  if (typeof window === 'undefined') return;

  try {
    const qs = buildDirectoryQueryString(criteria);
    const basePath = targetPath || window.location.pathname;
    const newRelativePath = `${basePath}${qs ? `?${qs}` : ''}${window.location.hash}`;

    if (replace) {
      window.history.replaceState(window.history.state, '', newRelativePath);
    } else {
      window.history.pushState(window.history.state, '', newRelativePath);
    }
  } catch (e) {
    console.error('Failed to update directory URL params:', e);
  }
};
