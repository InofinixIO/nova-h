import { MjmlTemplate } from './types';

export const PRESET_TEMPLATES: MjmlTemplate[] = [
  {
    id: 'hospital-rfp-alert',
    settings: {
      templateName: 'Hospital Project RFP Invitation',
      subject: 'New RFP: 250-Bed Multispecialty Hospital Project in Pune',
      previewText: 'Metro Health invites technical and commercial bids for Medical Gas Pipeline & Cleanroom HVAC.',
      backgroundColor: '#f1f5f9',
      containerWidth: 600,
      fontFamily: 'Plus Jakarta Sans',
      defaultTextColor: '#334155',
      primaryBrandColor: '#2563eb'
    },
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: 'header-1',
        type: 'header',
        label: 'Brand Header',
        logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=320&auto=format&fit=crop&q=80',
        logoWidth: 130,
        logoAlign: 'left',
        sectionBgColor: '#ffffff',
        paddingTop: 24,
        paddingBottom: 16,
        paddingLeft: 24,
        paddingRight: 24
      },
      {
        id: 'hero-1',
        type: 'hero',
        label: 'Hero Announcement',
        imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
        title: 'New Hospital RFP Opportunity',
        titleColor: '#0f172a',
        titleSize: 26,
        titleAlign: 'center',
        subtitle: 'You have been shortlisted to submit a quotation for this upcoming tertiary care facility.',
        subtitleColor: '#475569',
        subtitleSize: 15,
        sectionBgColor: '#ffffff',
        paddingTop: 10,
        paddingBottom: 20
      },
      {
        id: 'rfp-card-1',
        type: 'rfp-card',
        label: 'Hospital Project Scope Card',
        hospitalName: 'Metro Super Specialty Hospital',
        projectStage: 'Stage 6: Medical Gas Pipeline System & Cleanroom HVAC',
        bedCapacity: '250 Beds (Tertiary Care)',
        location: 'Pune, Maharashtra',
        budgetEst: '₹85 - 120 Lakhs',
        submissionDeadline: '14 Days Remaining',
        buttonText: 'Submit Technical RFP Proposal →',
        buttonUrl: 'https://nova-h.in/rfp',
        sectionBgColor: '#ffffff',
        paddingTop: 12,
        paddingBottom: 20
      },
      {
        id: 'two-col-1',
        type: 'two-column',
        label: 'Project Specifications',
        sectionBgColor: '#ffffff',
        paddingTop: 16,
        paddingBottom: 20,
        columns: [
          {
            id: 'c1',
            title: 'Technical Requirements',
            text: 'HTM 02-01 & ISO 7396-1 compliance mandatory. Full copper tubing with degreased medical fittings.',
            buttonText: 'View BoQ Specs',
            buttonUrl: '#'
          },
          {
            id: 'c2',
            title: 'Commercial Terms',
            text: 'Direct promoter escrow payment with zero platform fees. Milestone releases against inspection certificates.',
            buttonText: 'Payment Milestones',
            buttonUrl: '#'
          }
        ]
      },
      {
        id: 'three-col-1',
        type: 'three-column',
        label: 'NOVA Trust Metrics',
        sectionBgColor: '#f8fafc',
        paddingTop: 20,
        paddingBottom: 20,
        columns: [
          { id: 'stat-1', title: '100%', text: 'Verified Promoters' },
          { id: 'stat-2', title: '₹0', text: 'Platform Commission' },
          { id: 'stat-3', title: '14 Days', text: 'Bidding Window' }
        ]
      },
      {
        id: 'footer-1',
        type: 'footer',
        label: 'Compliance Footer',
        companyName: 'NOVA-H Healthcare Procurement & Infrastructure Network',
        address: 'BKC Healthcare Towers, Level 8, Bandra Kurla Complex, Mumbai 400051',
        supportEmail: 'rfp-desk@nova-h.in',
        copyrightText: '© 2026 NOVA-H Network. Empowering hospital owners, verified vendors and biomedical advisors.',
        unsubscribeUrl: '#',
        sectionBgColor: '#0f172a',
        paddingTop: 32,
        paddingBottom: 32
      }
    ]
  },
  {
    id: 'vendor-quote-proposal',
    settings: {
      templateName: 'Vendor Quotation Submission Notification',
      subject: 'Quotation Received: Apex Biomedical for 12 ICU Ventilators',
      previewText: 'Apex Biomedical Systems has submitted a technical quotation of ₹42.5 Lakhs for your review.',
      backgroundColor: '#f8fafc',
      containerWidth: 600,
      fontFamily: 'Inter',
      defaultTextColor: '#334155',
      primaryBrandColor: '#059669'
    },
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: 'hdr-q',
        type: 'header',
        label: 'Brand Header',
        logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=320&auto=format&fit=crop&q=80',
        logoWidth: 120,
        logoAlign: 'left',
        sectionBgColor: '#ffffff',
        paddingTop: 20,
        paddingBottom: 16
      },
      {
        id: 'quote-card-1',
        type: 'quote-card',
        label: 'Quotation Overview Card',
        vendorName: 'Apex Biomedical Systems Pvt Ltd',
        quoteAmount: '₹42,50,000 (Excl. GST)',
        deliveryTime: '3 Weeks from PO confirmation',
        warrantyPeriod: '24 Months Comprehensive On-site',
        quotationRef: '#QT-2026-8902',
        buttonText: 'Compare with Other Vendor Bids →',
        buttonUrl: 'https://nova-h.in/procurement',
        sectionBgColor: '#ffffff',
        paddingTop: 16,
        paddingBottom: 24
      },
      {
        id: 'txt-q',
        type: 'text',
        label: 'Executive Note',
        title: 'Vendor Compliance & Accreditations',
        titleSize: 18,
        contentHtml: 'Apex Biomedical Systems holds ISO 13485 certification and has supplied ICU infrastructure to over 35 hospitals across Western India. Their quotation includes installation, commissioning, and staff training.',
        sectionBgColor: '#ffffff',
        paddingTop: 10,
        paddingBottom: 20
      },
      {
        id: 'btn-q',
        type: 'button',
        label: 'Accept / Negotiate Action',
        buttonText: 'Open Commercial Negotiation Room',
        buttonUrl: '#',
        buttonBgColor: '#059669',
        buttonTextColor: '#ffffff',
        buttonRadius: 10,
        buttonAlign: 'center',
        sectionBgColor: '#ffffff',
        paddingTop: 10,
        paddingBottom: 24
      },
      {
        id: 'ftr-q',
        type: 'footer',
        label: 'Footer',
        companyName: 'NOVA-H Direct Procurement Engine',
        address: 'NOVA-H Tech Hub, Mumbai, India',
        supportEmail: 'support@nova-h.in',
        sectionBgColor: '#0f172a'
      }
    ]
  },
  {
    id: 'partner-welcome',
    settings: {
      templateName: 'Verified Partner Onboarding Welcome',
      subject: 'Welcome to NOVA-H: Your Partner Profile is Live!',
      previewText: 'Your healthcare vendor listing is now verified and visible to over 240+ hospital promoters.',
      backgroundColor: '#f1f5f9',
      containerWidth: 600,
      fontFamily: 'Plus Jakarta Sans',
      defaultTextColor: '#334155',
      primaryBrandColor: '#7c3aed'
    },
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: 'hdr-w',
        type: 'header',
        label: 'Brand Header',
        logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=320&auto=format&fit=crop&q=80',
        logoWidth: 130,
        logoAlign: 'center',
        sectionBgColor: '#ffffff',
        paddingTop: 24,
        paddingBottom: 16
      },
      {
        id: 'hero-w',
        type: 'hero',
        label: 'Welcome Hero',
        title: 'Welcome to the NOVA Network',
        titleSize: 26,
        titleColor: '#0f172a',
        subtitle: 'Your verified partner badge is now activated. Hospital promoters can now discover your track record and request direct technical quotations.',
        subtitleColor: '#64748b',
        buttonText: 'Complete Your Equipment Showcase',
        buttonUrl: '#',
        buttonBgColor: '#7c3aed',
        sectionBgColor: '#ffffff',
        paddingTop: 12,
        paddingBottom: 24
      },
      {
        id: 'divider-w',
        type: 'divider',
        label: 'Divider',
        dividerColor: '#e2e8f0',
        dividerWidth: 1,
        sectionBgColor: '#ffffff',
        paddingTop: 10,
        paddingBottom: 10
      },
      {
        id: 'three-col-w',
        type: 'three-column',
        label: 'Next Steps Checklist',
        sectionBgColor: '#ffffff',
        paddingTop: 16,
        paddingBottom: 24,
        columns: [
          { id: 'w1', title: 'Step 1', text: 'Upload Product Catalog' },
          { id: 'w2', title: 'Step 2', text: 'Set Notification Cities' },
          { id: 'w3', title: 'Step 3', text: 'Respond to Open RFPs' }
        ]
      },
      {
        id: 'footer-w',
        type: 'footer',
        label: 'Footer',
        companyName: 'NOVA-H Partner Ecosystem',
        address: 'Bandra Kurla Complex, Mumbai, India',
        supportEmail: 'partner-desk@nova-h.in',
        sectionBgColor: '#0f172a'
      }
    ]
  },
  {
    id: 'blank-slate',
    settings: {
      templateName: 'Blank Custom Template',
      subject: 'Custom Healthcare Communication',
      previewText: 'Summary preview line for email inbox...',
      backgroundColor: '#f8fafc',
      containerWidth: 600,
      fontFamily: 'Plus Jakarta Sans',
      defaultTextColor: '#334155',
      primaryBrandColor: '#2563eb'
    },
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: 'hdr-blank',
        type: 'header',
        label: 'Header',
        logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=320&auto=format&fit=crop&q=80',
        logoWidth: 130,
        sectionBgColor: '#ffffff'
      },
      {
        id: 'txt-blank',
        type: 'text',
        label: 'Editorial Body',
        title: 'Start Crafting Your Email',
        titleSize: 22,
        contentHtml: 'Drag and drop blocks from the left palette to construct responsive MJML emails with live code generation.',
        sectionBgColor: '#ffffff',
        paddingTop: 20,
        paddingBottom: 20
      },
      {
        id: 'footer-blank',
        type: 'footer',
        label: 'Footer',
        companyName: 'NOVA-H Healthcare Procurement',
        address: 'Mumbai, India',
        sectionBgColor: '#0f172a'
      }
    ]
  }
];
