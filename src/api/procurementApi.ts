import { 
  RFPItem, 
  RFPQuote, 
  RFPClarification, 
  RFPAuditEvent, 
  AdvisorObservation, 
  RFPLifecycleStatus, 
  UserRole 
} from '../types';

export interface DatabaseStatus {
  configured: boolean;
  provider: string;
  urlMasked?: string | null;
  error?: string;
}

/**
 * Checks PostgreSQL health & connectivity from backend
 */
export async function checkDatabaseHealth(): Promise<DatabaseStatus> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      return { configured: false, provider: 'Disconnected', error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return data.database || { configured: false, provider: 'Unknown' };
  } catch (err: any) {
    return { configured: false, provider: 'Network Error', error: err.message };
  }
}

/**
 * Fetch all RFPs from PostgreSQL
 */
export async function fetchRfpsApi(params?: { category?: string; status?: string; search?: string }): Promise<RFPItem[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`/api/rfps?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch RFPs (HTTP ${res.status})`);
  }
  const body = await res.json();
  return body.data || [];
}

/**
 * Fetch a single RFP by ID
 */
export async function fetchRfpByIdApi(id: string): Promise<RFPItem> {
  const res = await fetch(`/api/rfps/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `RFP ${id} not found`);
  }
  const body = await res.json();
  return body.data;
}

/**
 * Register a new RFP tender in PostgreSQL
 */
export async function createRfpApi(rfp: RFPItem): Promise<RFPItem> {
  const res = await fetch('/api/rfps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rfp)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create RFP (HTTP ${res.status})`);
  }
  const body = await res.json();
  return body.data;
}

/**
 * Update an existing RFP in PostgreSQL
 */
export async function updateRfpApi(id: string, rfp: Partial<RFPItem>): Promise<RFPItem> {
  const res = await fetch(`/api/rfps/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rfp)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update RFP ${id}`);
  }
  const body = await res.json();
  return body.data;
}

/**
 * Advance RFP lifecycle status with automated audit log
 */
export async function transitionRfpStatusApi(
  id: string,
  status: RFPLifecycleStatus,
  performedBy: string = 'Hospital Procurement Team',
  userRole: UserRole = 'owner',
  notes?: string
): Promise<RFPItem> {
  const res = await fetch(`/api/rfps/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, performedBy, userRole, notes })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to advance status to ${status}`);
  }
  const body = await res.json();
  return body.data;
}

/**
 * Delete an RFP from PostgreSQL
 */
export async function deleteRfpApi(id: string): Promise<void> {
  const res = await fetch(`/api/rfps/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to delete RFP ${id}`);
  }
}

/**
 * Fetch all quotations submitted for an RFP
 */
export async function fetchQuotesApi(rfpId: string): Promise<RFPQuote[]> {
  const res = await fetch(`/api/rfps/${encodeURIComponent(rfpId)}/quotes`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch quotes for RFP ${rfpId}`);
  }
  const body = await res.json();
  return body.data || [];
}

/**
 * Submit or upsert a vendor quotation in PostgreSQL
 */
export async function submitQuoteApi(rfpId: string, quote: RFPQuote): Promise<RFPQuote> {
  const res = await fetch(`/api/rfps/${encodeURIComponent(rfpId)}/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quote)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to persist quotation (HTTP ${res.status})`);
  }
  const body = await res.json();
  return body.data;
}

/**
 * Update quotation status (shortlisted, awarded, rejected)
 */
export async function updateQuoteStatusApi(
  rfpId: string,
  quoteId: string,
  status: string,
  decisionRationale?: string,
  poReference?: string
): Promise<RFPQuote> {
  const res = await fetch(`/api/rfps/${encodeURIComponent(rfpId)}/quotes/${encodeURIComponent(quoteId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, decisionRationale, poReference })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update quote status`);
  }
  const body = await res.json();
  return body.data;
}

/**
 * Fetch clarifications for an RFP
 */
export async function fetchClarificationsApi(rfpId: string): Promise<RFPClarification[]> {
  const res = await fetch(`/api/rfps/${encodeURIComponent(rfpId)}/clarifications`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch clarifications`);
  }
  const body = await res.json();
  return body.data || [];
}

/**
 * Post a clarification inquiry to a vendor
 */
export async function submitClarificationApi(rfpId: string, payload: {
  quoteId?: string;
  vendorName: string;
  lineItemId?: string;
  parameterName?: string;
  category?: string;
  question: string;
  askedBy?: string;
  isAiDrafted?: boolean;
  vendorEmail?: string;
}): Promise<RFPClarification> {
  const res = await fetch(`/api/rfps/${encodeURIComponent(rfpId)}/clarifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to submit clarification`);
  }
  const body = await res.json();
  return body.data;
}

/**
 * Respond to a clarification
 */
export async function respondClarificationApi(rfpId: string, id: string, response: string, revisionResulted: boolean = false): Promise<any> {
  const res = await fetch(`/api/rfps/${encodeURIComponent(rfpId)}/clarifications/${encodeURIComponent(id)}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ response, revisionResulted })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to post response`);
  }
  const body = await res.json();
  return body.data;
}

/**
 * Resolve a clarification
 */
export async function resolveClarificationApi(rfpId: string, id: string): Promise<any> {
  const res = await fetch(`/api/rfps/${encodeURIComponent(rfpId)}/clarifications/${encodeURIComponent(id)}/resolve`, {
    method: 'PATCH'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to resolve clarification`);
  }
  const body = await res.json();
  return body.data;
}

/**
 * Fetch audits from PostgreSQL
 */
export async function fetchAuditsApi(rfpId: string): Promise<RFPAuditEvent[]> {
  const res = await fetch(`/api/rfps/${encodeURIComponent(rfpId)}/audits`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch audit events`);
  }
  const body = await res.json();
  return body.data || [];
}

/**
 * Log an audit event in PostgreSQL
 */
export async function logAuditApi(rfpId: string, action: string, performedBy: string, userRole: UserRole, details?: any): Promise<RFPAuditEvent> {
  const res = await fetch(`/api/rfps/${encodeURIComponent(rfpId)}/audits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, performedBy, userRole, details })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to record audit event`);
  }
  const body = await res.json();
  return body.data;
}

/**
 * Fetch advisor observations from PostgreSQL
 */
export async function fetchObservationsApi(rfpId: string): Promise<AdvisorObservation[]> {
  const res = await fetch(`/api/rfps/${encodeURIComponent(rfpId)}/observations`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch advisor observations`);
  }
  const body = await res.json();
  return body.data || [];
}

/**
 * Add an advisor observation in PostgreSQL
 */
export async function submitObservationApi(rfpId: string, obs: AdvisorObservation): Promise<AdvisorObservation> {
  const res = await fetch(`/api/rfps/${encodeURIComponent(rfpId)}/observations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obs)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to record advisor observation`);
  }
  const body = await res.json();
  return body.data;
}
