import { MjmlTemplate, MjmlBlock } from './types';

/**
 * Escapes XML/HTML text safely
 */
function escapeXml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates standards-compliant, beautifully structured MJML code
 */
export function generateMjml(template: MjmlTemplate): string {
  const { settings, blocks } = template;
  const {
    previewText,
    backgroundColor,
    containerWidth,
    fontFamily,
    defaultTextColor,
    primaryBrandColor
  } = settings;

  let mjml = `<mjml>
  <mj-head>
    <mj-title>${escapeXml(settings.subject || settings.templateName)}</mj-title>
    ${previewText ? `<mj-preview>${escapeXml(previewText)}</mj-preview>` : ''}
    <mj-attributes>
      <mj-all font-family="${escapeXml(fontFamily)}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" />
      <mj-text font-size="14px" color="${defaultTextColor}" line-height="22px" />
      <mj-section background-color="#ffffff" padding="20px" />
      <mj-button background-color="${primaryBrandColor}" color="#ffffff" font-size="14px" font-weight="bold" border-radius="8px" />
    </mj-attributes>
    <mj-style>
      .hover-opacity:hover { opacity: 0.9 !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
    </mj-style>
  </mj-head>
  <mj-body background-color="${backgroundColor}" width="${containerWidth}px">
`;

  blocks.forEach((block) => {
    mjml += generateBlockMjml(block, settings);
  });

  mjml += `  </mj-body>
</mjml>`;

  return mjml;
}

/**
 * Generates MJML tags for an individual block
 */
function generateBlockMjml(block: MjmlBlock, settings: any): string {
  const padTop = block.paddingTop ?? 16;
  const padBottom = block.paddingBottom ?? 16;
  const padLeft = block.paddingLeft ?? 24;
  const padRight = block.paddingRight ?? 24;
  const sectionBg = block.sectionBgColor || '#ffffff';

  switch (block.type) {
    case 'header':
      return `    <!-- HEADER / BRAND LOGO -->
    <mj-section background-color="${sectionBg}" padding="${padTop}px ${padRight}px ${padBottom}px ${padLeft}px">
      <mj-column>
        <mj-image src="${escapeXml(block.logoUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=320&auto=format&fit=crop&q=80')}" alt="${escapeXml(block.altText || 'Logo')}" width="${block.logoWidth || 140}px" align="${block.logoAlign || 'left'}" padding="0px" />
      </mj-column>
    </mj-section>
`;

    case 'hero':
      return `    <!-- HERO SECTION -->
    <mj-section background-color="${sectionBg}" padding="${padTop}px ${padRight}px ${padBottom}px ${padLeft}px">
      <mj-column>
        ${block.imageUrl ? `<mj-image src="${escapeXml(block.imageUrl)}" alt="${escapeXml(block.title || 'Hero Banner')}" border-radius="${block.imageBorderRadius || 12}px" padding="0px 0px 20px 0px" />` : ''}
        <mj-text align="${block.titleAlign || 'center'}" font-size="${block.titleSize || 26}px" font-weight="800" color="${block.titleColor || '#0f172a'}" line-height="34px" padding="0px 0px 10px 0px">
          ${escapeXml(block.title || 'Headline')}
        </mj-text>
        ${block.subtitle ? `<mj-text align="${block.titleAlign || 'center'}" font-size="${block.subtitleSize || 15}px" color="${block.subtitleColor || '#475569'}" line-height="24px" padding="0px 0px 20px 0px">
          ${escapeXml(block.subtitle)}
        </mj-text>` : ''}
        ${block.buttonText ? `<mj-button href="${escapeXml(block.buttonUrl || '#')}" background-color="${block.buttonBgColor || settings.primaryBrandColor}" color="${block.buttonTextColor || '#ffffff'}" border-radius="${block.buttonRadius || 10}px" align="${block.buttonAlign || 'center'}" padding="10px 0px 0px 0px">
          ${escapeXml(block.buttonText)}
        </mj-button>` : ''}
      </mj-column>
    </mj-section>
`;

    case 'text':
      return `    <!-- EDITORIAL TEXT BLOCK -->
    <mj-section background-color="${sectionBg}" padding="${padTop}px ${padRight}px ${padBottom}px ${padLeft}px">
      <mj-column>
        ${block.title ? `<mj-text font-size="${block.titleSize || 20}px" font-weight="700" color="${block.titleColor || '#0f172a'}" padding="0px 0px 10px 0px">
          ${escapeXml(block.title)}
        </mj-text>` : ''}
        <mj-text font-size="${block.fontSize || 14}px" color="${block.textColor || '#334155'}" line-height="${block.lineHeight || 22}px" align="${block.textAlign || 'left'}" padding="0px">
          ${escapeXml(block.contentHtml || 'Add your editorial copy here...')}
        </mj-text>
      </mj-column>
    </mj-section>
`;

    case 'button':
      return `    <!-- CALL TO ACTION BUTTON -->
    <mj-section background-color="${sectionBg}" padding="${padTop}px ${padRight}px ${padBottom}px ${padLeft}px">
      <mj-column>
        <mj-button href="${escapeXml(block.buttonUrl || '#')}" background-color="${block.buttonBgColor || settings.primaryBrandColor}" color="${block.buttonTextColor || '#ffffff'}" font-size="14px" font-weight="700" border-radius="${block.buttonRadius || 10}px" align="${block.buttonAlign || 'center'}" padding="${block.buttonPaddingY || 12}px ${block.buttonPaddingX || 28}px">
          ${escapeXml(block.buttonText || 'Take Action')}
        </mj-button>
      </mj-column>
    </mj-section>
`;

    case 'image':
      return `    <!-- IMAGE SHOWCASE -->
    <mj-section background-color="${sectionBg}" padding="${padTop}px ${padRight}px ${padBottom}px ${padLeft}px">
      <mj-column>
        <mj-image src="${escapeXml(block.imageUrl || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80')}" alt="${escapeXml(block.imageAlt || 'Showcase image')}" width="${block.imageWidth || 540}px" border-radius="${block.imageBorderRadius || 8}px" padding="0px" />
      </mj-column>
    </mj-section>
`;

    case 'two-column':
      const cols2 = block.columns || [
        { id: '1', title: 'Feature Alpha', text: 'Detail regarding the first feature or hospital service offering.', buttonText: 'Learn More', buttonUrl: '#' },
        { id: '2', title: 'Feature Beta', text: 'Detail regarding the second feature or medical equipment spec.', buttonText: 'Explore', buttonUrl: '#' }
      ];
      return `    <!-- TWO COLUMN GRID -->
    <mj-section background-color="${sectionBg}" padding="${padTop}px ${padRight}px ${padBottom}px ${padLeft}px">
      <mj-column width="48%" padding="0px 10px 16px 0px">
        ${cols2[0]?.imageUrl ? `<mj-image src="${escapeXml(cols2[0].imageUrl)}" border-radius="8px" padding="0px 0px 12px 0px" />` : ''}
        <mj-text font-size="16px" font-weight="700" color="#0f172a" padding="0px 0px 6px 0px">${escapeXml(cols2[0]?.title || '')}</mj-text>
        <mj-text font-size="13px" color="#475569" line-height="20px" padding="0px 0px 12px 0px">${escapeXml(cols2[0]?.text || '')}</mj-text>
        ${cols2[0]?.buttonText ? `<mj-button href="${escapeXml(cols2[0].buttonUrl || '#')}" font-size="12px" padding="8px 16px" align="left">${escapeXml(cols2[0].buttonText)}</mj-button>` : ''}
      </mj-column>
      <mj-column width="4%"></mj-column>
      <mj-column width="48%" padding="0px 0px 16px 10px">
        ${cols2[1]?.imageUrl ? `<mj-image src="${escapeXml(cols2[1].imageUrl)}" border-radius="8px" padding="0px 0px 12px 0px" />` : ''}
        <mj-text font-size="16px" font-weight="700" color="#0f172a" padding="0px 0px 6px 0px">${escapeXml(cols2[1]?.title || '')}</mj-text>
        <mj-text font-size="13px" color="#475569" line-height="20px" padding="0px 0px 12px 0px">${escapeXml(cols2[1]?.text || '')}</mj-text>
        ${cols2[1]?.buttonText ? `<mj-button href="${escapeXml(cols2[1].buttonUrl || '#')}" font-size="12px" padding="8px 16px" align="left">${escapeXml(cols2[1].buttonText)}</mj-button>` : ''}
      </mj-column>
    </mj-section>
`;

    case 'three-column':
      const cols3 = block.columns || [
        { id: '1', title: '15+', text: 'Project Stages' },
        { id: '2', title: '100%', text: 'Verified Vendors' },
        { id: '3', title: '₹0', text: 'Platform Markup' }
      ];
      return `    <!-- THREE COLUMN METRIC STATS -->
    <mj-section background-color="${sectionBg}" padding="${padTop}px ${padRight}px ${padBottom}px ${padLeft}px">
      <mj-column width="33%" padding="8px">
        <mj-text align="center" font-size="24px" font-weight="800" color="${settings.primaryBrandColor}" padding="0px">${escapeXml(cols3[0]?.title || '')}</mj-text>
        <mj-text align="center" font-size="12px" font-weight="600" color="#64748b" padding="4px 0px 0px 0px">${escapeXml(cols3[0]?.text || '')}</mj-text>
      </mj-column>
      <mj-column width="33%" padding="8px">
        <mj-text align="center" font-size="24px" font-weight="800" color="${settings.primaryBrandColor}" padding="0px">${escapeXml(cols3[1]?.title || '')}</mj-text>
        <mj-text align="center" font-size="12px" font-weight="600" color="#64748b" padding="4px 0px 0px 0px">${escapeXml(cols3[1]?.text || '')}</mj-text>
      </mj-column>
      <mj-column width="33%" padding="8px">
        <mj-text align="center" font-size="24px" font-weight="800" color="${settings.primaryBrandColor}" padding="0px">${escapeXml(cols3[2]?.title || '')}</mj-text>
        <mj-text align="center" font-size="12px" font-weight="600" color="#64748b" padding="4px 0px 0px 0px">${escapeXml(cols3[2]?.text || '')}</mj-text>
      </mj-column>
    </mj-section>
`;

    case 'rfp-card':
      return `    <!-- HEALTHCARE RFP NOTIFICATION CARD -->
    <mj-section background-color="${sectionBg}" padding="${padTop}px ${padRight}px ${padBottom}px ${padLeft}px">
      <mj-column background-color="#f8fafc" border="1px solid #e2e8f0" border-radius="12px" padding="20px">
        <mj-text font-size="12px" font-weight="800" color="${settings.primaryBrandColor}" text-transform="uppercase" letter-spacing="1px" padding="0px 0px 6px 0px">
          NEW HOSPITAL RFP INVITATION
        </mj-text>
        <mj-text font-size="18px" font-weight="700" color="#0f172a" padding="0px 0px 10px 0px">
          ${escapeXml(block.hospitalName || 'Metro Super Specialty Hospital')}
        </mj-text>
        <mj-text font-size="13px" color="#334155" line-height="20px" padding="0px 0px 16px 0px">
          <strong>Project Stage:</strong> ${escapeXml(block.projectStage || 'Medical Gas Pipeline & Cleanroom HVAC')}<br/>
          <strong>Scale:</strong> ${escapeXml(block.bedCapacity || '250 Beds')} • <strong>Location:</strong> ${escapeXml(block.location || 'Pune, Maharashtra')}<br/>
          <strong>Estimated Scope:</strong> ${escapeXml(block.budgetEst || '₹85 - 120 Lakhs')} • <strong>Deadline:</strong> ${escapeXml(block.submissionDeadline || 'In 14 Days')}
        </mj-text>
        <mj-button href="${escapeXml(block.buttonUrl || '#')}" background-color="${settings.primaryBrandColor}" color="#ffffff" font-size="13px" font-weight="bold" border-radius="8px" align="left" padding="0px">
          ${escapeXml(block.buttonText || 'Submit Technical Quotation →')}
        </mj-button>
      </mj-column>
    </mj-section>
`;

    case 'quote-card':
      return `    <!-- VENDOR QUOTATION ALERT CARD -->
    <mj-section background-color="${sectionBg}" padding="${padTop}px ${padRight}px ${padBottom}px ${padLeft}px">
      <mj-column background-color="#f0fdf4" border="1px solid #bbf7d0" border-radius="12px" padding="20px">
        <mj-text font-size="12px" font-weight="800" color="#166534" text-transform="uppercase" letter-spacing="1px" padding="0px 0px 6px 0px">
          QUOTATION PROPOSAL RECEIVED
        </mj-text>
        <mj-text font-size="18px" font-weight="700" color="#14532d" padding="0px 0px 8px 0px">
          ${escapeXml(block.vendorName || 'Apex Biomedical Systems')}
        </mj-text>
        <mj-text font-size="13px" color="#166534" line-height="20px" padding="0px 0px 16px 0px">
          <strong>Quote Amount:</strong> ${escapeXml(block.quoteAmount || '₹42,50,000 (Excl. GST)')}<br/>
          <strong>Turnaround Lead:</strong> ${escapeXml(block.deliveryTime || '3 Weeks')} • <strong>Warranty:</strong> ${escapeXml(block.warrantyPeriod || '24 Months Comprehensive')}<br/>
          <strong>Reference ID:</strong> ${escapeXml(block.quotationRef || '#QT-2026-8902')}
        </mj-text>
        <mj-button href="${escapeXml(block.buttonUrl || '#')}" background-color="#16a34a" color="#ffffff" font-size="13px" font-weight="bold" border-radius="8px" align="left" padding="0px">
          ${escapeXml(block.buttonText || 'Review Full Specification & BOM')}
        </mj-button>
      </mj-column>
    </mj-section>
`;

    case 'divider':
      return `    <!-- DIVIDER -->
    <mj-section background-color="${sectionBg}" padding="${padTop}px ${padRight}px ${padBottom}px ${padLeft}px">
      <mj-column>
        <mj-divider border-width="${block.dividerWidth || 1}px" border-style="${block.dividerStyle || 'solid'}" border-color="${block.dividerColor || '#e2e8f0'}" padding="0px" />
      </mj-column>
    </mj-section>
`;

    case 'spacer':
      return `    <!-- SPACER -->
    <mj-section background-color="${sectionBg}" padding="0px">
      <mj-column>
        <mj-spacer height="${block.spacerHeight || 24}px" />
      </mj-column>
    </mj-section>
`;

    case 'footer':
      return `    <!-- FOOTER / LEGAL -->
    <mj-section background-color="${sectionBg || '#0f172a'}" padding="${padTop || 32}px ${padRight || 24}px ${padBottom || 32}px ${padLeft || 24}px">
      <mj-column>
        <mj-text align="center" font-size="14px" font-weight="800" color="#ffffff" padding="0px 0px 8px 0px">
          ${escapeXml(block.companyName || 'NOVA-H Healthcare Procurement Network')}
        </mj-text>
        <mj-text align="center" font-size="12px" color="#94a3b8" line-height="18px" padding="0px 0px 16px 0px">
          ${escapeXml(block.address || 'BKC Healthcare Towers, Bandra Kurla Complex, Mumbai, India 400051')}
          ${block.supportEmail ? `<br/>Inquiries: <a href="mailto:${escapeXml(block.supportEmail)}" style="color: #60a5fa; text-decoration: none;">${escapeXml(block.supportEmail)}</a>` : ''}
        </mj-text>
        <mj-divider border-width="1px" border-color="#334155" padding="0px 0px 16px 0px" />
        <mj-text align="center" font-size="11px" color="#64748b" line-height="16px" padding="0px">
          ${escapeXml(block.copyrightText || '© 2026 NOVA-H. All rights reserved. Hospital Infrastructure Marketplace.')}<br/>
          You received this because of your registered hospital account. <a href="${escapeXml(block.unsubscribeUrl || '#')}" style="color: #94a3b8; text-decoration: underline;">Manage Preferences</a> or <a href="${escapeXml(block.unsubscribeUrl || '#')}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>.
        </mj-text>
      </mj-column>
    </mj-section>
`;

    default:
      return '';
  }
}

/**
 * Transpiles the template directly into responsive, battle-tested HTML email markup
 * compatible with Outlook MSO, Apple Mail, Gmail, and mobile clients.
 */
export function generateEmailHtml(template: MjmlTemplate): string {
  const { settings, blocks } = template;
  const {
    subject,
    previewText,
    backgroundColor,
    containerWidth,
    fontFamily,
    defaultTextColor,
    primaryBrandColor
  } = settings;

  let blocksHtml = '';

  blocks.forEach((block) => {
    const padTop = block.paddingTop ?? 16;
    const padBottom = block.paddingBottom ?? 16;
    const padLeft = block.paddingLeft ?? 24;
    const padRight = block.paddingRight ?? 24;
    const sectionBg = block.sectionBgColor || '#ffffff';

    switch (block.type) {
      case 'header':
        blocksHtml += `
        <!-- HEADER -->
        <tr>
          <td style="background-color: ${sectionBg}; padding: ${padTop}px ${padRight}px ${padBottom}px ${padLeft}px;" align="${block.logoAlign || 'left'}">
            <img src="${escapeXml(block.logoUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=320&auto=format&fit=crop&q=80')}" alt="${escapeXml(block.altText || 'Brand')}" width="${block.logoWidth || 140}" style="display: block; border: 0; outline: none; text-decoration: none; max-width: 100%; height: auto;" />
          </td>
        </tr>`;
        break;

      case 'hero':
        blocksHtml += `
        <!-- HERO -->
        <tr>
          <td style="background-color: ${sectionBg}; padding: ${padTop}px ${padRight}px ${padBottom}px ${padLeft}px; text-align: ${block.titleAlign || 'center'};">
            ${block.imageUrl ? `<img src="${escapeXml(block.imageUrl)}" alt="Hero" style="width: 100%; max-width: 100%; height: auto; border-radius: ${block.imageBorderRadius || 12}px; display: block; margin-bottom: 20px;" />` : ''}
            <h1 style="margin: 0 0 10px 0; font-size: ${block.titleSize || 26}px; font-weight: 800; color: ${block.titleColor || '#0f172a'}; line-height: 1.25;">
              ${escapeXml(block.title || 'Headline')}
            </h1>
            ${block.subtitle ? `<p style="margin: 0 0 20px 0; font-size: ${block.subtitleSize || 15}px; color: ${block.subtitleColor || '#475569'}; line-height: 1.5;">${escapeXml(block.subtitle)}</p>` : ''}
            ${block.buttonText ? `
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
              <tr>
                <td align="center" style="border-radius: ${block.buttonRadius || 10}px; background-color: ${block.buttonBgColor || primaryBrandColor};">
                  <a href="${escapeXml(block.buttonUrl || '#')}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: bold; color: ${block.buttonTextColor || '#ffffff'}; text-decoration: none; border-radius: ${block.buttonRadius || 10}px;">
                    ${escapeXml(block.buttonText)}
                  </a>
                </td>
              </tr>
            </table>` : ''}
          </td>
        </tr>`;
        break;

      case 'text':
        blocksHtml += `
        <!-- TEXT -->
        <tr>
          <td style="background-color: ${sectionBg}; padding: ${padTop}px ${padRight}px ${padBottom}px ${padLeft}px; text-align: ${block.textAlign || 'left'}; font-size: ${block.fontSize || 14}px; color: ${block.textColor || defaultTextColor}; line-height: ${block.lineHeight || 22}px;">
            ${block.title ? `<h2 style="margin: 0 0 10px 0; font-size: ${block.titleSize || 20}px; font-weight: 700; color: ${block.titleColor || '#0f172a'};">${escapeXml(block.title)}</h2>` : ''}
            <p style="margin: 0;">${escapeXml(block.contentHtml || '')}</p>
          </td>
        </tr>`;
        break;

      case 'button':
        blocksHtml += `
        <!-- BUTTON -->
        <tr>
          <td style="background-color: ${sectionBg}; padding: ${padTop}px ${padRight}px ${padBottom}px ${padLeft}px;" align="${block.buttonAlign || 'center'}">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="border-radius: ${block.buttonRadius || 10}px; background-color: ${block.buttonBgColor || primaryBrandColor};">
                  <a href="${escapeXml(block.buttonUrl || '#')}" target="_blank" style="display: inline-block; padding: ${block.buttonPaddingY || 12}px ${block.buttonPaddingX || 28}px; font-size: 14px; font-weight: bold; color: ${block.buttonTextColor || '#ffffff'}; text-decoration: none; border-radius: ${block.buttonRadius || 10}px;">
                    ${escapeXml(block.buttonText || 'Take Action')}
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
        break;

      case 'image':
        blocksHtml += `
        <!-- IMAGE -->
        <tr>
          <td style="background-color: ${sectionBg}; padding: ${padTop}px ${padRight}px ${padBottom}px ${padLeft}px;" align="center">
            <img src="${escapeXml(block.imageUrl || '')}" alt="${escapeXml(block.imageAlt || 'Image')}" width="${block.imageWidth || 540}" style="display: block; border: 0; outline: none; max-width: 100%; height: auto; border-radius: ${block.imageBorderRadius || 8}px;" />
          </td>
        </tr>`;
        break;

      case 'two-column':
        const cols = block.columns || [];
        blocksHtml += `
        <!-- TWO COLUMN -->
        <tr>
          <td style="background-color: ${sectionBg}; padding: ${padTop}px ${padRight}px ${padBottom}px ${padLeft}px;">
            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td width="48%" valign="top" style="padding-right: 12px;">
                  <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: bold; color: #0f172a;">${escapeXml(cols[0]?.title || '')}</h3>
                  <p style="margin: 0 0 10px 0; font-size: 13px; color: #475569; line-height: 1.5;">${escapeXml(cols[0]?.text || '')}</p>
                </td>
                <td width="4%"></td>
                <td width="48%" valign="top" style="padding-left: 12px;">
                  <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: bold; color: #0f172a;">${escapeXml(cols[1]?.title || '')}</h3>
                  <p style="margin: 0 0 10px 0; font-size: 13px; color: #475569; line-height: 1.5;">${escapeXml(cols[1]?.text || '')}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
        break;

      case 'three-column':
        const c3 = block.columns || [];
        blocksHtml += `
        <!-- THREE COLUMN STATS -->
        <tr>
          <td style="background-color: ${sectionBg}; padding: ${padTop}px ${padRight}px ${padBottom}px ${padLeft}px;">
            <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td width="33%" align="center" valign="top">
                  <div style="font-size: 24px; font-weight: 800; color: ${primaryBrandColor};">${escapeXml(c3[0]?.title || '')}</div>
                  <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-top: 4px;">${escapeXml(c3[0]?.text || '')}</div>
                </td>
                <td width="33%" align="center" valign="top">
                  <div style="font-size: 24px; font-weight: 800; color: ${primaryBrandColor};">${escapeXml(c3[1]?.title || '')}</div>
                  <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-top: 4px;">${escapeXml(c3[1]?.text || '')}</div>
                </td>
                <td width="33%" align="center" valign="top">
                  <div style="font-size: 24px; font-weight: 800; color: ${primaryBrandColor};">${escapeXml(c3[2]?.title || '')}</div>
                  <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-top: 4px;">${escapeXml(c3[2]?.text || '')}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
        break;

      case 'rfp-card':
        blocksHtml += `
        <!-- RFP CARD -->
        <tr>
          <td style="background-color: ${sectionBg}; padding: ${padTop}px ${padRight}px ${padBottom}px ${padLeft}px;">
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
              <span style="font-size: 11px; font-weight: 800; color: ${primaryBrandColor}; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">New Hospital RFP</span>
              <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #0f172a;">${escapeXml(block.hospitalName || '')}</h2>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #334155; line-height: 1.5;">
                <strong>Stage:</strong> ${escapeXml(block.projectStage || '')}<br/>
                <strong>Scale:</strong> ${escapeXml(block.bedCapacity || '')} • <strong>Location:</strong> ${escapeXml(block.location || '')}<br/>
                <strong>Estimated Scope:</strong> ${escapeXml(block.budgetEst || '')} • <strong>Deadline:</strong> ${escapeXml(block.submissionDeadline || '')}
              </p>
              <a href="${escapeXml(block.buttonUrl || '#')}" style="display: inline-block; padding: 10px 20px; font-size: 13px; font-weight: bold; color: #ffffff; background-color: ${primaryBrandColor}; text-decoration: none; border-radius: 8px;">
                ${escapeXml(block.buttonText || 'Submit Bid')}
              </a>
            </div>
          </td>
        </tr>`;
        break;

      case 'quote-card':
        blocksHtml += `
        <!-- QUOTE CARD -->
        <tr>
          <td style="background-color: ${sectionBg}; padding: ${padTop}px ${padRight}px ${padBottom}px ${padLeft}px;">
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px;">
              <span style="font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Quotation Proposal Received</span>
              <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #14532d;">${escapeXml(block.vendorName || '')}</h2>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #166534; line-height: 1.5;">
                <strong>Quote:</strong> ${escapeXml(block.quoteAmount || '')}<br/>
                <strong>Turnaround:</strong> ${escapeXml(block.deliveryTime || '')} • <strong>Warranty:</strong> ${escapeXml(block.warrantyPeriod || '')}
              </p>
              <a href="${escapeXml(block.buttonUrl || '#')}" style="display: inline-block; padding: 10px 20px; font-size: 13px; font-weight: bold; color: #ffffff; background-color: #16a34a; text-decoration: none; border-radius: 8px;">
                ${escapeXml(block.buttonText || 'Review Quotation')}
              </a>
            </div>
          </td>
        </tr>`;
        break;

      case 'divider':
        blocksHtml += `
        <!-- DIVIDER -->
        <tr>
          <td style="background-color: ${sectionBg}; padding: ${padTop}px ${padRight}px ${padBottom}px ${padLeft}px;">
            <hr style="border: 0; border-top: ${block.dividerWidth || 1}px ${block.dividerStyle || 'solid'} ${block.dividerColor || '#e2e8f0'}; margin: 0;" />
          </td>
        </tr>`;
        break;

      case 'spacer':
        blocksHtml += `
        <!-- SPACER -->
        <tr>
          <td style="background-color: ${sectionBg}; height: ${block.spacerHeight || 24}px; font-size: 0; line-height: 0;">&nbsp;</td>
        </tr>`;
        break;

      case 'footer':
        blocksHtml += `
        <!-- FOOTER -->
        <tr>
          <td style="background-color: ${sectionBg || '#0f172a'}; padding: ${padTop || 32}px ${padRight || 24}px ${padBottom || 32}px ${padLeft || 24}px; text-align: center;">
            <div style="font-size: 14px; font-weight: 800; color: #ffffff; margin-bottom: 8px;">${escapeXml(block.companyName || 'NOVA-H Network')}</div>
            <div style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 16px;">
              ${escapeXml(block.address || '')}
            </div>
            <div style="font-size: 11px; color: #64748b; line-height: 1.5;">
              ${escapeXml(block.copyrightText || '© 2026 NOVA-H')} • <a href="${escapeXml(block.unsubscribeUrl || '#')}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
            </div>
          </td>
        </tr>`;
        break;
    }
  });

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeXml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    html, body {
      margin: 0 auto !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      background-color: ${backgroundColor};
      font-family: ${fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
    div[style*="margin: 16px 0"] { margin: 0 !important; }
    table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
    table { border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto !important; }
    img { -ms-interpolation-mode: bicubic; }
    a { text-decoration: none; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .fluid { max-width: 100% !important; height: auto !important; margin-left: auto !important; margin-right: auto !important; }
    }
  </style>
</head>
<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: ${backgroundColor};">
  <center style="width: 100%; background-color: ${backgroundColor};">
    ${previewText ? `
    <!-- Preheader Text Spacing Hack -->
    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
      ${escapeXml(previewText)}
    </div>` : ''}

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${backgroundColor};">
      <tr>
        <td align="center" style="padding: 24px 10px;">
          <!--[if mso]>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="${containerWidth}">
          <tr>
          <td>
          <![endif]-->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: ${containerWidth}px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;" class="email-container">
            ${blocksHtml}
          </table>
          <!--[if mso]>
          </td>
          </tr>
          </table>
          <![endif]-->
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}
