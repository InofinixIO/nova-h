import { ProfileClaim, DirectoryItem } from '../types';
import { dispatchEmail, generateClaimSubmittedEmailHtml, generateClaimApprovedEmailHtml, generateClaimRejectedEmailHtml } from './emailService';
import { getStoredDirectory, saveStoredDirectory } from './directoryStorage';
import { getAllUsers, saveAllUsers } from './userManagement';

/**
 * Retrieve all profile ownership claims
 */
export const getStoredClaims = (): ProfileClaim[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('novah_profile_claims');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored claims:', e);
    return [];
  }
};

export const saveStoredClaims = (claims: ProfileClaim[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('novah_profile_claims', JSON.stringify(claims));
    window.dispatchEvent(new CustomEvent('nova_claims_updated', { detail: claims }));
  } catch (e) {
    console.error('Failed to save profile claims:', e);
  }
};

/**
 * Submit a new profile ownership claim
 */
export async function submitProfileClaim(params: {
  directoryId: string;
  directoryName: string;
  directoryRole: 'vendor' | 'advisor';
  claimantUserId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  claimantCompany?: string;
  designation?: string;
  proofNotes: string;
}): Promise<ProfileClaim> {
  const claimId = `CLM_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const newClaim: ProfileClaim = {
    id: claimId,
    directoryId: params.directoryId,
    directoryName: params.directoryName,
    directoryRole: params.directoryRole,
    claimantUserId: params.claimantUserId,
    claimantName: params.claimantName.trim(),
    claimantEmail: params.claimantEmail.trim().toLowerCase(),
    claimantPhone: params.claimantPhone.trim(),
    claimantCompany: params.claimantCompany?.trim(),
    designation: params.designation?.trim(),
    proofNotes: params.proofNotes.trim(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // 1. Save to local claims store
  const existingClaims = getStoredClaims();
  const updatedClaims = [newClaim, ...existingClaims];
  saveStoredClaims(updatedClaims);

  // 2. Mark directory item as pending claim in local store
  const directory = getStoredDirectory();
  const dirIdx = directory.findIndex(d => d.id === params.directoryId);
  if (dirIdx >= 0) {
    directory[dirIdx] = {
      ...directory[dirIdx],
      claimStatus: 'pending'
    };
    saveStoredDirectory(directory);
  }

  // 3. Dispatch confirmation email to claimant
  const userEmailData = generateClaimSubmittedEmailHtml(newClaim.claimantName, newClaim.directoryName, newClaim.id);
  dispatchEmail({
    toEmail: newClaim.claimantEmail,
    recipientName: newClaim.claimantName,
    subject: userEmailData.subject,
    type: 'claim_submitted',
    bodyHtml: userEmailData.bodyHtml,
    bodyText: userEmailData.bodyText
  });

  // 4. Dispatch alert email to Administrator
  dispatchEmail({
    toEmail: 'admin@nova-h.in',
    recipientName: 'NOVA Compliance Board',
    subject: `[Admin Alert] New ownership claim for "${newClaim.directoryName}" by ${newClaim.claimantName}`,
    type: 'claim_admin_alert',
    bodyHtml: `
      <h2>New Ownership Claim Submitted</h2>
      <p><strong>Listing:</strong> ${newClaim.directoryName} (${newClaim.directoryRole})</p>
      <p><strong>Claimant:</strong> ${newClaim.claimantName} (${newClaim.claimantEmail}, ${newClaim.claimantPhone})</p>
      <p><strong>Company:</strong> ${newClaim.claimantCompany || 'Not stated'} - Role: ${newClaim.designation || 'Owner'}</p>
      <p><strong>Verification Proof / Justification:</strong><br>${newClaim.proofNotes}</p>
      <p>Please review and approve/reject in the NOVA Admin Console.</p>
    `.trim(),
    bodyText: `New claim for ${newClaim.directoryName} by ${newClaim.claimantName}. Review in Admin Console.`
  });

  // 5. Send to backend API
  if (typeof window !== 'undefined') {
    try {
      await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClaim)
      });
    } catch (e) {
      console.warn('Backend claim submission deferred:', e);
    }
  }

  return newClaim;
}

/**
 * Approve a profile ownership claim
 */
export async function approveProfileClaim(claimId: string, reviewerNotes?: string): Promise<{ success: boolean; claim: ProfileClaim | null }> {
  const claims = getStoredClaims();
  const claimIdx = claims.findIndex(c => c.id === claimId);
  if (claimIdx === -1) return { success: false, claim: null };

  const claim = claims[claimIdx];
  const updatedClaim: ProfileClaim = {
    ...claim,
    status: 'approved',
    reviewedAt: new Date().toISOString(),
    reviewerNotes: reviewerNotes || 'Approved by administrator upon verification of business credentials.'
  };
  claims[claimIdx] = updatedClaim;
  saveStoredClaims(claims);

  // 1. Link directory profile to claimant user in local store
  const directory = getStoredDirectory();
  const dirIdx = directory.findIndex(d => d.id === claim.directoryId);
  if (dirIdx >= 0) {
    directory[dirIdx] = {
      ...directory[dirIdx],
      isClaimed: true,
      claimedByUserId: claim.claimantUserId,
      claimStatus: 'claimed',
      contactEmail: claim.claimantEmail,
      phone: claim.claimantPhone || directory[dirIdx].phone,
      verified: true
    };
    saveStoredDirectory(directory);
  }

  // 2. Link claimedDirectoryId to user record
  const users = getAllUsers();
  const userIdx = users.findIndex(u => u.id === claim.claimantUserId || (u.email && u.email.toLowerCase() === claim.claimantEmail.toLowerCase()));
  if (userIdx >= 0) {
    users[userIdx] = {
      ...users[userIdx],
      claimedDirectoryId: claim.directoryId,
      company: claim.directoryName,
      status: 'active'
    };
    saveAllUsers(users);

    // If current session belongs to claimant, update session
    if (typeof window !== 'undefined') {
      try {
        const cur = JSON.parse(localStorage.getItem('nova_h_current_user') || '{}');
        if (cur.id === users[userIdx].id || cur.email?.toLowerCase() === users[userIdx].email?.toLowerCase()) {
          localStorage.setItem('nova_h_current_user', JSON.stringify({ ...cur, claimedDirectoryId: claim.directoryId }));
        }
      } catch (e) {}
    }
  }

  // 3. Dispatch approval email to claimant
  const approvalEmailData = generateClaimApprovedEmailHtml(claim.claimantName, claim.directoryName);
  dispatchEmail({
    toEmail: claim.claimantEmail,
    recipientName: claim.claimantName,
    subject: approvalEmailData.subject,
    type: 'claim_approved',
    bodyHtml: approvalEmailData.bodyHtml,
    bodyText: approvalEmailData.bodyText
  });

  // 4. Sync to backend API
  if (typeof window !== 'undefined') {
    try {
      await fetch(`/api/claims/${encodeURIComponent(claimId)}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerNotes })
      });
    } catch (e) {
      console.warn('Backend claim approval deferred:', e);
    }
  }

  return { success: true, claim: updatedClaim };
}

/**
 * Reject a profile ownership claim
 */
export async function rejectProfileClaim(claimId: string, reviewerNotes?: string): Promise<{ success: boolean; claim: ProfileClaim | null }> {
  const claims = getStoredClaims();
  const claimIdx = claims.findIndex(c => c.id === claimId);
  if (claimIdx === -1) return { success: false, claim: null };

  const claim = claims[claimIdx];
  const updatedClaim: ProfileClaim = {
    ...claim,
    status: 'rejected',
    reviewedAt: new Date().toISOString(),
    reviewerNotes: reviewerNotes || 'Declined: Unable to substantiate official authorization.'
  };
  claims[claimIdx] = updatedClaim;
  saveStoredClaims(claims);

  // 1. Release directory profile back to unclaimed status
  const directory = getStoredDirectory();
  const dirIdx = directory.findIndex(d => d.id === claim.directoryId);
  if (dirIdx >= 0) {
    directory[dirIdx] = {
      ...directory[dirIdx],
      claimStatus: 'unclaimed'
    };
    saveStoredDirectory(directory);
  }

  // 2. Dispatch rejection email to claimant
  const rejectionEmailData = generateClaimRejectedEmailHtml(claim.claimantName, claim.directoryName, reviewerNotes);
  dispatchEmail({
    toEmail: claim.claimantEmail,
    recipientName: claim.claimantName,
    subject: rejectionEmailData.subject,
    type: 'claim_rejected',
    bodyHtml: rejectionEmailData.bodyHtml,
    bodyText: rejectionEmailData.bodyText
  });

  // 3. Sync to backend API
  if (typeof window !== 'undefined') {
    try {
      await fetch(`/api/claims/${encodeURIComponent(claimId)}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerNotes })
      });
    } catch (e) {
      console.warn('Backend claim rejection deferred:', e);
    }
  }

  return { success: true, claim: updatedClaim };
}
