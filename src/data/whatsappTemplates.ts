import { WhatsAppFlow } from '../types';

export const PRESET_WHATSAPP_FLOWS: WhatsAppFlow[] = [
  {
    id: 'flow-hospital-rfq',
    name: 'Hospital Promoter RFQ & Bed Qualifier',
    description: 'AiSensy-style interactive lead qualification flow with Quick Replies, List Menu, and Native WhatsApp Form Screen.',
    category: 'healthcare',
    triggerKeyword: 'HOSPITAL',
    startNodeId: 'node-welcome',
    nodes: [
      {
        id: 'node-welcome',
        title: '1. Welcome & Project Intent',
        type: 'button',
        headerType: 'image',
        headerContent: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
        bodyText: 'Namaste *{{user_name}}*! Welcome to *NOVA Hospital Project Network* 🏥.\n\nAre you planning a new hospital project, expanding beds, or looking for certified turnkey MEP/Biomedical vendors?',
        footerText: 'Official NOVA WhatsApp Verified Liaison',
        buttons: [
          { id: 'btn-new-hospital', title: '🏥 Build New Hospital', nextNodeId: 'node-category-list' },
          { id: 'btn-upgrade', title: '⚡ Upgrade / Expand', nextNodeId: 'node-category-list' },
          { id: 'btn-talk-expert', title: '📞 Speak with Advisor', nextNodeId: 'node-handover' }
        ]
      },
      {
        id: 'node-category-list',
        title: '2. Select Facility Type',
        type: 'list',
        headerType: 'text',
        headerContent: 'FACILITY SELECTION',
        bodyText: 'Please choose the type of healthcare facility you are planning to establish. This helps us route your RFQ to empanelled hospital architects and procurement consultants.',
        footerText: 'Select one option below',
        listButtonText: 'Select Facility Category',
        listSections: [
          {
            title: 'Tertiary & Multi-Specialty',
            rows: [
              { id: 'row-multi-100', title: 'Multi-Specialty (100+ Beds)', description: 'Full tertiary setup with ICU, Modular OTs & Emergency', nextNodeId: 'node-intake-form' },
              { id: 'row-super-spec', title: 'Super-Specialty (Oncology/Cardio)', description: 'Advanced oncology, catheterization labs & radiation bunker', nextNodeId: 'node-intake-form' }
            ]
          },
          {
            title: 'Secondary & Daycare',
            rows: [
              { id: 'row-secondary-50', title: 'Secondary Hospital (30-80 Beds)', description: 'General surgical, maternity and diagnostic center', nextNodeId: 'node-intake-form' },
              { id: 'row-daycare', title: 'Daycare Surgical & Dialysis', description: 'Ambulatory surgical unit with short stay recovery', nextNodeId: 'node-intake-form' }
            ]
          }
        ]
      },
      {
        id: 'node-intake-form',
        title: '3. WhatsApp Flow Native Screen',
        type: 'flow_screen',
        headerType: 'none',
        bodyText: 'Please fill out this quick project intake form right inside WhatsApp to generate your initial feasibility estimate and project brief.',
        footerText: 'Encrypted Meta Business Flow',
        flowScreen: {
          title: 'Hospital Project Intake',
          subtitle: 'NOVA Infrastructure Feasibility Desk',
          submitButtonTitle: 'Submit Project Details',
          fields: [
            { id: 'fld-hosp-name', label: 'Proposed Hospital Name', type: 'text', required: true, placeholder: 'e.g. Apex Metro Hospital' },
            { id: 'fld-city', label: 'City & State', type: 'text', required: true, placeholder: 'e.g. Pune, Maharashtra' },
            { id: 'fld-beds', label: 'Planned Bed Capacity', type: 'select', required: true, options: ['30 - 50 Beds', '51 - 100 Beds', '101 - 250 Beds', '250+ Beds'] },
            { id: 'fld-timeline', label: 'Target Commissioning', type: 'select', required: false, options: ['Within 6 Months', '6 - 12 Months', '12 - 24 Months', 'Planning Phase'] }
          ],
          nextNodeId: 'node-confirmation'
        }
      },
      {
        id: 'node-confirmation',
        title: '4. Project Qualified Confirmation',
        type: 'media_cta',
        headerType: 'document',
        headerContent: 'NOVA-Hospital-15-Stage-Toolkit.pdf',
        bodyText: '✅ *Thank you! Your project brief has been registered with NOVA.*\n\nOur healthcare planning team has assigned Reference ID *#NOV-{{ref_id}}*.\n\nWe have attached the *15-Stage Hospital Development Framework PDF* for your reference.',
        footerText: 'NOVA Hospital Advisory Desk',
        ctaType: 'call',
        ctaLabel: 'Call Project Desk',
        ctaValue: '+91 22 4982 1000'
      },
      {
        id: 'node-handover',
        title: '5. Direct Consultant Escalation',
        type: 'agent_handover',
        headerType: 'text',
        headerContent: 'CONSULTANT CONNECT',
        bodyText: 'Routing your chat to our *Senior Hospital Infrastructure Consultant* 👨‍⚕️.\n\nA specialist will join this WhatsApp thread in less than 3 minutes. Please stay online.',
        footerText: 'Live Human Support Available 9 AM - 8 PM IST'
      }
    ]
  },
  {
    id: 'flow-vendor-catalog',
    name: 'Turnkey Medical Equipment & RFQ Bot',
    description: 'Biomedical & MEP vendor automated showcase with Quick Replies and downloadable equipment catalog.',
    category: 'vendor',
    triggerKeyword: 'EQUIPMENT',
    startNodeId: 'node-vendor-start',
    nodes: [
      {
        id: 'node-vendor-start',
        title: '1. Equipment Catalog Selector',
        type: 'button',
        headerType: 'image',
        headerContent: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
        bodyText: 'Greetings from *NOVA Empanelled Biomedical Vendors*! 🔬\n\nLooking for turnkey hospital equipment packages with OEM warranty, AERB compliance, and AMC support?\n\nSelect your requirement:',
        footerText: 'Empanelled Tier-1 Indian & Global OEMs',
        buttons: [
          { id: 'btn-biomedical', title: '🩺 Biomedical Devices', nextNodeId: 'node-biomed-list' },
          { id: 'btn-cleanroom', title: '🌬️ Modular OT & HVAC', nextNodeId: 'node-cleanroom-cta' },
          { id: 'btn-rfq-quote', title: '📑 Request Rate Card', nextNodeId: 'node-vendor-input' }
        ]
      },
      {
        id: 'node-biomed-list',
        title: '2. Biomedical Equipment Categories',
        type: 'list',
        headerType: 'text',
        headerContent: 'BIOMEDICAL PACKAGES',
        bodyText: 'Select an equipment category to receive specifications, compliance certificates, and instant indicative pricing via WhatsApp:',
        footerText: 'Tap below to view categories',
        listButtonText: 'Browse Equipment List',
        listSections: [
          {
            title: 'Critical Care & OR',
            rows: [
              { id: 'row-anaesthesia', title: 'Anesthesia Workstations', description: 'Advanced workstations with integrated multigas monitors', nextNodeId: 'node-cleanroom-cta' },
              { id: 'row-icu-vent', title: 'ICU Ventilators (Invasive/NIV)', description: 'High-end turbine/pneumatic adult & pediatric ventilators', nextNodeId: 'node-cleanroom-cta' }
            ]
          },
          {
            title: 'Radiology & Imaging',
            rows: [
              { id: 'row-ct-scan', title: 'Multi-Slice CT & MRI Systems', description: '16 to 128-slice refurbished & new imaging systems', nextNodeId: 'node-cleanroom-cta' },
              { id: 'row-digital-xray', title: 'Digital X-Ray & C-Arm', description: 'High-frequency stationary & mobile C-Arm machines', nextNodeId: 'node-cleanroom-cta' }
            ]
          }
        ]
      },
      {
        id: 'node-cleanroom-cta',
        title: '3. Catalog Download & Live Enquiry',
        type: 'media_cta',
        headerType: 'document',
        headerContent: 'NOVA-Biomedical-Turnkey-Catalog-2026.pdf',
        bodyText: 'Here is your requested product brochure with technical parameters, AERB certification guides, and turnkey AMC terms.\n\nWould you like to schedule an engineer inspection or request a formal BOQ rate card?',
        footerText: 'Powered by NOVA Verified Vendors',
        ctaType: 'url',
        ctaLabel: 'Open BOQ Configurator',
        ctaValue: 'https://nova-h.in/directory'
      },
      {
        id: 'node-vendor-input',
        title: '4. Capture Hospital Bed Capacity',
        type: 'input_capture',
        headerType: 'none',
        bodyText: 'Please type your *Hospital Name* and *Planned Number of Beds* so we can generate an accurate turnkey equipment package estimate:',
        footerText: 'Example: City Care Hospital, 120 Beds',
        inputVariable: 'hospital_scale',
        inputPlaceholder: 'Type Hospital Name & Bed count...',
        nextNodeId: 'node-cleanroom-cta'
      }
    ]
  },
  {
    id: 'flow-nabh-advisory',
    name: 'NABH & Statutory Advisory Booking',
    description: 'Interactive advisory booking bot with stage qualification and calendar appointment setup.',
    category: 'rfq',
    triggerKeyword: 'ADVISOR',
    startNodeId: 'node-adv-start',
    nodes: [
      {
        id: 'node-adv-start',
        title: '1. Advisory Specialization',
        type: 'button',
        headerType: 'text',
        headerContent: 'NOVA HEALTHCARE ADVISORY',
        bodyText: 'Welcome! NOVA empanels leading healthcare management consultants, hospital planners, and NABH lead assessors.\n\nWhich milestone do you need expert guidance for?',
        footerText: 'Zero-obligation initial assessment',
        buttons: [
          { id: 'btn-nabh-audit', title: '🏆 NABH Accreditation', nextNodeId: 'node-adv-booking' },
          { id: 'btn-dpr-feasibility', title: '📊 DPR & Financial Plan', nextNodeId: 'node-adv-booking' },
          { id: 'btn-statutory', title: '⚖️ AERB / Fire NOC', nextNodeId: 'node-adv-booking' }
        ]
      },
      {
        id: 'node-adv-booking',
        title: '2. Native Flow Slot Booking',
        type: 'flow_screen',
        headerType: 'none',
        bodyText: 'Select your preferred 30-minute consultation slot with our Senior Healthcare Project Director:',
        footerText: 'Direct Video/Phone Consultation',
        flowScreen: {
          title: 'Schedule Advisor Consultation',
          subtitle: '30-Min Tele-Discovery Session',
          submitButtonTitle: 'Confirm Consultation Slot',
          fields: [
            { id: 'fld-adv-name', label: 'Doctor / Promoter Name', type: 'text', required: true, placeholder: 'Dr. Sharma' },
            { id: 'fld-adv-phone', label: 'Direct Mobile Number', type: 'text', required: true, placeholder: '+91 98XXX XXXXX' },
            { id: 'fld-adv-day', label: 'Preferred Day', type: 'select', required: true, options: ['Tomorrow, 11:00 AM IST', 'Tomorrow, 3:30 PM IST', 'Friday, 10:00 AM IST', 'Saturday, 12:00 PM IST'] }
          ],
          nextNodeId: 'node-adv-confirm'
        }
      },
      {
        id: 'node-adv-confirm',
        title: '3. Appointment Confirmed',
        type: 'media_cta',
        headerType: 'image',
        headerContent: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
        bodyText: '🎉 *Your consultation slot is locked in!*\n\nOur healthcare advisor has sent a Google Meet invite and WhatsApp calendar reminder to your number.\n\nWe look forward to helping you design, build, and license your hospital.',
        footerText: 'NOVA Empanelled Advisory Council',
        ctaType: 'url',
        ctaLabel: 'View Advisory Profiles',
        ctaValue: 'https://nova-h.in/advisors'
      }
    ]
  }
];
