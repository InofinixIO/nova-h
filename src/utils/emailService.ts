import { EmailLog } from '../types';

/**
 * Standard in-app email dispatcher and log store
 */
export const getStoredEmailLogs = (): EmailLog[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('novah_email_logs');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored email logs:', e);
    return [];
  }
};

export const saveEmailLogToStorage = (emailLog: EmailLog): EmailLog[] => {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredEmailLogs();
    const updated = [emailLog, ...current].slice(0, 50); // Keep last 50 emails
    localStorage.setItem('novah_email_logs', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nova_emails_updated', { detail: updated }));
    return updated;
  } catch (e) {
    console.error('Failed to save email log:', e);
    return [];
  }
};

/**
 * HTML Templates for Platform Outbound Emails
 */
export function generateOtpEmailHtml(name: string, otp: string): { subject: string; bodyHtml: string; bodyText: string } {
  const subject = `[NOVA] ${otp} is your verification code`;
  const bodyText = `Hello ${name},\n\nYour 6-digit verification code is: ${otp}\n\nThis code will expire in 10 minutes. Enter it to activate your NOVA healthcare account.`;
  const bodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f172a; padding: 24px 32px; text-align: left; }
    .header h1 { color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: -0.02em; }
    .header p { color: #94a3b8; font-size: 12px; margin: 4px 0 0 0; }
    .content { padding: 32px; }
    .greeting { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
    .lead { font-size: 13px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .otp-container { text-align: center; background: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .otp-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
    .otp-code { font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 0.25em; color: #2563eb; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>NOVA Healthcare Platform</h1>
      <p>Network for Owners, Vendors & Advisors</p>
    </div>
    <div class="content">
      <div class="greeting">Verify your email address</div>
      <p class="lead">Welcome to NOVA, <strong>${name}</strong>. Please enter the verification code below to confirm your email and access your healthcare partner workspace.</p>
      
      <div class="otp-container">
        <div class="otp-label">6-Digit Verification Code</div>
        <div class="otp-code">${otp}</div>
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5;">This security code expires in 10 minutes. If you did not initiate this registration request, please disregard this email.</p>
    </div>
    <div class="footer">
      NOVA Healthcare Infrastructure Network · Mumbai · Bangalore · New Delhi
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, bodyHtml, bodyText };
}

export function generateClaimSubmittedEmailHtml(claimantName: string, directoryName: string, claimId: string): { subject: string; bodyHtml: string; bodyText: string } {
  const subject = `[NOVA] Ownership claim submitted for "${directoryName}" (Ref: ${claimId})`;
  const bodyText = `Hello ${claimantName},\n\nYour profile ownership claim for "${directoryName}" has been received. Our compliance committee will review your request within 24 hours.\n\nClaim ID: ${claimId}`;
  const bodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #1e1b4b; padding: 24px 32px; }
    .header h1 { color: #ffffff; font-size: 18px; font-weight: 800; margin: 0; }
    .content { padding: 32px; }
    .notice { background: #fdf4ff; border: 1px solid #f0abfc; padding: 16px; border-radius: 12px; margin: 20px 0; font-size: 12px; color: #701a75; }
    .footer { padding: 16px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>NOVA Directory Ownership Verification</h1>
    </div>
    <div class="content">
      <h3 style="margin-top:0; font-size:16px;">Claim Request Received</h3>
      <p style="font-size:13px; line-height:1.6; color:#475569;">Hello <strong>${claimantName}</strong>,</p>
      <p style="font-size:13px; line-height:1.6; color:#475569;">We have received your ownership claim for the business listing <strong>${directoryName}</strong>.</p>
      
      <div class="notice">
        <strong>Review Status: Pending Administrator Verification</strong><br>
        Our verification board validates GSTIN, business credentials, and corporate identity to ensure listings remain secure. You will receive an approval confirmation once reviewed.
      </div>

      <p style="font-size:11px; color:#94a3b8;">Claim Reference ID: ${claimId}</p>
    </div>
    <div class="footer">NOVA Healthcare Platform · Business Listing Compliance</div>
  </div>
</body>
</html>
  `.trim();

  return { subject, bodyHtml, bodyText };
}

export function generateClaimApprovedEmailHtml(claimantName: string, directoryName: string): { subject: string; bodyHtml: string; bodyText: string } {
  const subject = `[NOVA] Congratulations! Your claim for "${directoryName}" has been approved`;
  const bodyText = `Hello ${claimantName},\n\nYour profile claim for "${directoryName}" has been approved! The listing is now linked to your account. You can manage inquiries and edit your portfolio directly from your workspace.`;
  const bodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #064e3b; padding: 24px 32px; }
    .header h1 { color: #ffffff; font-size: 18px; font-weight: 800; margin: 0; }
    .content { padding: 32px; }
    .badge { display: inline-block; background: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px; }
    .footer { padding: 16px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Listing Ownership Verified</h1>
    </div>
    <div class="content">
      <span class="badge">Verified Ownership Approved</span>
      <h3 style="margin-top:0; font-size:16px;">Welcome to Your Official Profile</h3>
      <p style="font-size:13px; line-height:1.6; color:#475569;">Hello <strong>${claimantName}</strong>,</p>
      <p style="font-size:13px; line-height:1.6; color:#475569;">The NOVA compliance team has approved your ownership claim for <strong>${directoryName}</strong>. This listing is now linked to your verified account.</p>
      
      <p style="font-size:13px; line-height:1.6; color:#475569;">You can now log into your workspace to respond to hospital project inquiries, update turnaround times, and manage your verified credentials.</p>
    </div>
    <div class="footer">NOVA Healthcare Platform · Verified Business Network</div>
  </div>
</body>
</html>
  `.trim();

  return { subject, bodyHtml, bodyText };
}

export function generateClaimRejectedEmailHtml(claimantName: string, directoryName: string, notes?: string): { subject: string; bodyHtml: string; bodyText: string } {
  const subject = `[NOVA] Update on your ownership claim for "${directoryName}"`;
  const bodyText = `Hello ${claimantName},\n\nYour claim for "${directoryName}" could not be approved at this time.\nReason: ${notes || 'Unable to verify corporate affiliation'}`;
  const bodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #7f1d1d; padding: 24px 32px; }
    .header h1 { color: #ffffff; font-size: 18px; font-weight: 800; margin: 0; }
    .content { padding: 32px; }
    .footer { padding: 16px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Profile Claim Update</h1>
    </div>
    <div class="content">
      <h3 style="margin-top:0; font-size:16px;">Claim Not Approved</h3>
      <p style="font-size:13px; line-height:1.6; color:#475569;">Hello <strong>${claimantName}</strong>,</p>
      <p style="font-size:13px; line-height:1.6; color:#475569;">Your ownership claim for <strong>${directoryName}</strong> could not be approved at this time.</p>
      
      <div style="background:#fef2f2; border:1px solid #fecaca; padding:14px; border-radius:10px; font-size:12px; color:#991b1b; margin:16px 0;">
        <strong>Reviewer Feedback:</strong><br>
        ${notes || 'We were unable to substantiate official authorization or affiliation with the listed organization. Please contact compliance@nova-h.in with official documentation.'}
      </div>
    </div>
    <div class="footer">NOVA Healthcare Platform · Compliance & Verification</div>
  </div>
</body>
</html>
  `.trim();

  return { subject, bodyHtml, bodyText };
}

/**
 * Dispatch an email to the backend API & local store
 */
export async function dispatchEmail(params: {
  toEmail: string;
  recipientName?: string;
  subject: string;
  type: EmailLog['type'];
  bodyHtml: string;
  bodyText?: string;
  otpCode?: string;
}): Promise<EmailLog> {
  const log: EmailLog = {
    id: `EML_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    toEmail: params.toEmail.trim().toLowerCase(),
    recipientName: params.recipientName,
    subject: params.subject,
    type: params.type,
    bodyHtml: params.bodyHtml,
    bodyText: params.bodyText,
    otpCode: params.otpCode,
    sentAt: new Date().toISOString()
  };

  // 1. Immediately save to browser local storage for instant reactivity
  saveEmailLogToStorage(log);

  // 2. Dispatch to backend API
  if (typeof window !== 'undefined') {
    try {
      await fetch('/api/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
    } catch (e) {
      console.warn('Backend email dispatch deferred:', e);
    }
  }

  return log;
}
