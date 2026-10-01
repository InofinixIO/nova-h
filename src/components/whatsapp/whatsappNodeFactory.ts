import { 
  WhatsAppNode, 
  WhatsAppNodeType, 
  WhatsAppProductItem, 
  WhatsAppProductSection, 
  WhatsAppCatalogueConfig, 
  WhatsAppTemplateConfig 
} from '../../types';

export function createDefaultWhatsAppNode(
  type: WhatsAppNodeType, 
  stepNumber: number = 1,
  position?: { x: number; y: number }
): WhatsAppNode {
  const timestamp = Date.now();
  const id = `node-${timestamp}-${Math.random().toString(36).substring(2, 6)}`;
  const defaultPos = position || { x: 100 + (stepNumber - 1) * 360, y: 120 };

  switch (type) {
    case 'text_buttons':
    case 'button':
      return {
        id,
        title: `${stepNumber}. Text Buttons Step`,
        type: 'text_buttons',
        position: defaultPos,
        headerType: 'none',
        bodyText: 'Namaste! Welcome to NOVA Healthcare desk.\n\nPlease select your preferred option from the buttons below:',
        footerText: 'Official NOVA WhatsApp Bot',
        buttons: [
          { id: `btn-${timestamp}-1`, title: '🏥 Build New Hospital', nextNodeId: '' },
          { id: `btn-${timestamp}-2`, title: '⚡ Upgrade / Expand', nextNodeId: '' },
          { id: `btn-${timestamp}-3`, title: '📞 Speak with Advisor', nextNodeId: '' }
        ]
      };

    case 'media_buttons':
      return {
        id,
        title: `${stepNumber}. Media Buttons Step`,
        type: 'media_buttons',
        position: defaultPos,
        headerType: 'image',
        headerContent: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
        bodyText: 'Explore our latest certified hospital infrastructure catalog with verified OEM warranty and NABH compliance guidelines.\n\nSelect an action to proceed:',
        footerText: 'Tap any button to continue',
        buttons: [
          { id: `btn-${timestamp}-1`, title: '📥 Download Specs', nextNodeId: '' },
          { id: `btn-${timestamp}-2`, title: '📑 Request Rate Card', nextNodeId: '' }
        ]
      };

    case 'list':
      return {
        id,
        title: `${stepNumber}. Interactive List Menu`,
        type: 'list',
        position: defaultPos,
        headerType: 'text',
        headerContent: 'HOSPITAL CATEGORIES',
        bodyText: 'Please select your department requirement to connect with specialized procurement consultants and vetted turnkey vendors:',
        footerText: 'Select one option below',
        listButtonText: 'Select Department',
        listSections: [
          {
            title: 'Critical Care & OR',
            rows: [
              { id: `row-${timestamp}-1`, title: 'Modular OT Suites', description: 'NABH compliant cleanroom & laminar airflow', nextNodeId: '' },
              { id: `row-${timestamp}-2`, title: 'ICU Beds & Ventilators', description: 'Invasive/NIV ventilators and multi-para monitors', nextNodeId: '' }
            ]
          },
          {
            title: 'Diagnostics & Imaging',
            rows: [
              { id: `row-${timestamp}-3`, title: 'Radiology / CT & MRI', description: 'Turnkey imaging suites with radiation shielding', nextNodeId: '' },
              { id: `row-${timestamp}-4`, title: 'Pathology & Lab Devices', description: 'Automated biochemistry & hematology analyzers', nextNodeId: '' }
            ]
          }
        ]
      };

    case 'catalogue':
      return {
        id,
        title: `${stepNumber}. Catalogue Message`,
        type: 'catalogue',
        position: defaultPos,
        headerType: 'none',
        bodyText: 'Browse our complete verified healthcare equipment catalog. Over 250+ certified medical devices, turnkey OT equipment, and ICU furniture packages available directly on WhatsApp.',
        footerText: 'NOVA Verified Commerce Catalog',
        catalogConfig: {
          catalogId: 'meta-cat-nova-health-01',
          thumbnailUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
          headerText: 'NOVA Healthcare Catalog',
          bodyText: '250+ Verified Medical Equipment & Turnkey Packages',
          footerText: 'Direct OEM Pricing • AERB & CE Certified',
          actionButtonText: 'View Catalog',
          nextNodeId: ''
        }
      };

    case 'single_product':
      return {
        id,
        title: `${stepNumber}. Single Product Showcase`,
        type: 'single_product',
        position: defaultPos,
        headerType: 'none',
        bodyText: 'High-acuity ICU ventilator with advanced turbine technology, suitable for pediatric and adult critical care with comprehensive 3-year OEM warranty.',
        footerText: 'Available for immediate dispatch',
        singleProduct: {
          id: `prod-${timestamp}`,
          retailerId: 'NOVA-MED-VENT-X1',
          title: 'Turbine ICU Ventilator Pro 500',
          price: '₹4,50,000',
          currency: 'INR',
          description: 'Invasive & Non-Invasive ventilation modes with 12.1" HD touchscreen, high-pressure O2 blender, and integrated battery backup.',
          imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
          category: 'Critical Care Equipment',
          nextNodeId: ''
        }
      };

    case 'multi_product':
      return {
        id,
        title: `${stepNumber}. Multi Product Catalog`,
        type: 'multi_product',
        position: defaultPos,
        headerType: 'text',
        headerContent: 'HOSPITAL ESSENTIALS',
        bodyText: 'Explore our bundled turnkey ICU & OT package equipment with special institutional pricing and GST input credit:',
        footerText: 'Tap below to view all items and add to cart',
        productSections: [
          {
            title: 'Intensive Care Unit (ICU)',
            products: [
              {
                id: `prod-${timestamp}-1`,
                retailerId: 'ICU-BED-ELEC-01',
                title: 'Motorized 5-Function ICU Bed',
                price: '₹1,25,000',
                currency: 'INR',
                description: 'CPR quick-release, Trendelenburg & central braking system',
                imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=500&q=80',
                nextNodeId: ''
              },
              {
                id: `prod-${timestamp}-2`,
                retailerId: 'ICU-MON-12P-02',
                title: '12-Lead Multi-Parameter Monitor',
                price: '₹85,000',
                currency: 'INR',
                description: 'ECG, NIBP, SpO2, Resp, 2-Temp and arrhythmia analysis',
                imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80',
                nextNodeId: ''
              }
            ]
          },
          {
            title: 'Operation Theatre (OT)',
            products: [
              {
                id: `prod-${timestamp}-3`,
                retailerId: 'OT-LIGHT-DUAL-03',
                title: 'Dual-Dome LED Surgical OT Light',
                price: '₹2,40,000',
                currency: 'INR',
                description: '160,000 Lux high shadowless intensity with Endo mode',
                imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=500&q=80',
                nextNodeId: ''
              }
            ]
          }
        ]
      };

    case 'template':
      return {
        id,
        title: `${stepNumber}. Meta Template Message`,
        type: 'template',
        position: defaultPos,
        headerType: 'none',
        bodyText: 'Dear *{{1}}*, your hospital project requisition for *{{2}}* has received new verified quotes from *{{3}}* empanelled suppliers. Tap below to review comparative BOQ analysis.',
        footerText: 'Meta Approved Template: rfq_quote_notification',
        templateConfig: {
          templateName: 'rfq_quote_notification',
          category: 'UTILITY',
          language: 'en_US',
          headerType: 'text',
          headerText: 'NOVA PROCUREMENT UPDATE',
          bodyVariables: ['Dr. Vivek Sharma', 'Apollo Greenfield Hospital', '3 Verified Vendors'],
          buttons: [
            { id: `tbtn-${timestamp}-1`, type: 'QUICK_REPLY', text: '📊 Review Quotes', nextNodeId: '' },
            { id: `tbtn-${timestamp}-2`, type: 'URL', text: '🌐 Open Portal', value: 'https://nova-h.in/rfq/compare' }
          ]
        }
      };

    case 'flow_screen':
      return {
        id,
        title: `${stepNumber}. WhatsApp Flow Native Screen`,
        type: 'flow_screen',
        position: defaultPos,
        headerType: 'none',
        bodyText: 'Please fill out this project intake form right inside WhatsApp to generate your initial feasibility estimate:',
        footerText: 'Encrypted Meta Business Flow',
        flowScreen: {
          title: 'Hospital Project Intake',
          subtitle: 'NOVA Infrastructure Feasibility Desk',
          submitButtonTitle: 'Submit Project Details',
          fields: [
            { id: 'fld-hosp', label: 'Proposed Hospital Name', type: 'text', required: true, placeholder: 'e.g. Apex Hospital' },
            { id: 'fld-beds', label: 'Planned Bed Capacity', type: 'select', required: true, options: ['30 - 50 Beds', '51 - 100 Beds', '101 - 250 Beds', '250+ Beds'] }
          ],
          nextNodeId: ''
        }
      };

    case 'agent_handover':
      return {
        id,
        title: `${stepNumber}. Live Agent Escalation`,
        type: 'agent_handover',
        position: defaultPos,
        headerType: 'text',
        headerContent: 'CONSULTANT CONNECT',
        bodyText: 'Routing your chat to our *Senior Hospital Infrastructure Consultant* 👨‍⚕️.\n\nA specialist will join this WhatsApp thread in less than 3 minutes.',
        footerText: 'Live Human Support Available 9 AM - 8 PM IST'
      };

    case 'input_capture':
      return {
        id,
        title: `${stepNumber}. Capture User Input`,
        type: 'input_capture',
        position: defaultPos,
        headerType: 'none',
        bodyText: 'Please type your *Hospital Name* and *Planned Number of Beds* below:',
        footerText: 'Example: City Care Hospital, 120 Beds',
        inputVariable: 'hospital_scale',
        inputPlaceholder: 'Type details here...'
      };

    case 'media_cta':
      return {
        id,
        title: `${stepNumber}. Media CTA Step`,
        type: 'media_cta',
        position: defaultPos,
        headerType: 'document',
        headerContent: 'Hospital-Planning-Guide.pdf',
        bodyText: 'Here is your requested technical brief and planning document.',
        footerText: 'NOVA Hospital Advisory Desk',
        ctaType: 'call',
        ctaLabel: 'Call Project Desk',
        ctaValue: '+91 22 4982 1000'
      };

    default:
      return {
        id,
        title: `${stepNumber}. Message Step`,
        type,
        position: defaultPos,
        headerType: 'none',
        bodyText: 'Hello from NOVA WhatsApp Flow.',
        footerText: 'NOVA Bot'
      };
  }
}
