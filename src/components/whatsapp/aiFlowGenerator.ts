import { WhatsAppFlow, WhatsAppNode, WhatsAppNodeType } from '../../types';

export interface AiFlowGenerationOptions {
  prompt: string;
  flowName?: string;
  category?: 'healthcare' | 'rfq' | 'vendor' | 'support';
  supportedTypes: WhatsAppNodeType[];
  targetStepCount?: number;
}

export interface PresetAiPrompt {
  id: string;
  title: string;
  badge: string;
  prompt: string;
  recommendedTypes: WhatsAppNodeType[];
  description: string;
}

export const PRESET_AI_PROMPTS: PresetAiPrompt[] = [
  {
    id: 'turnkey-hospital-admission',
    title: 'Hospital Patient Admissions & Bed Booking',
    badge: 'Clinical Care',
    prompt: 'Create a comprehensive WhatsApp patient intake and bed admission journey. Welcome with interactive text buttons, present a list of departments (Emergency, ICU, Maternity, Daycare), show a single product showcase for Private Deluxe Room package with pricing, and a final template confirmation.',
    recommendedTypes: ['text_buttons', 'list', 'single_product', 'template'],
    description: 'Patient admission, room tier selection, and immediate booking receipt'
  },
  {
    id: 'medical-equipment-procurement',
    title: 'Medical Devices & OT Equipment Showcase',
    badge: 'Procurement & OEM',
    prompt: 'Design an interactive procurement journey for hospital promoters purchasing ICU and Operation Theatre equipment. Use media buttons with clinical photos, an interactive catalog message connecting to Meta Commerce, a multi-product catalog showcasing ventilators and monitors, and a quick-reply RFP submission.',
    recommendedTypes: ['media_buttons', 'catalogue', 'multi_product', 'single_product', 'text_buttons'],
    description: 'Direct OEM device showcases, catalog browsing, and quotation requests'
  },
  {
    id: 'turnkey-consultant-rfp',
    title: 'Hospital Turnkey Advisory & Architect RFP',
    badge: 'Infrastructure',
    prompt: 'Generate an RFP intake journey for hospital owners seeking turnkey healthcare architects, MEP engineers, and AERB radiation consultants. Feature an interactive list menu of project stages, pre-approved Meta template with compliance variables, and text buttons for scheduling a site audit.',
    recommendedTypes: ['template', 'list', 'media_buttons', 'text_buttons'],
    description: 'Stage-by-stage consultant inquiry, AERB vetting, and site audits'
  },
  {
    id: 'diagnostic-lab-packages',
    title: 'Diagnostic Lab Tests & Preventive Health Checkups',
    badge: 'Diagnostics',
    prompt: 'Build a diagnostic lab booking journey for pathology and MRI/CT scans. Start with an image banner, list of diagnostic packages (Executive Health, Cardiac Screening, Diabetic Profile), a multi-product catalog with test prices, and a single product booking for Home Sample Collection.',
    recommendedTypes: ['media_buttons', 'list', 'multi_product', 'single_product', 'text_buttons'],
    description: 'Full body checkup packages, home collection slots, and instant price cards'
  },
  {
    id: 'hospital-amc-maintenance',
    title: 'Hospital Biomedical AMC & Maintenance Support',
    badge: 'Engineering & MEP',
    prompt: 'Create an Annual Maintenance Contract (AMC/CMC) service desk on WhatsApp for biomedical equipment, MGPS medical gas pipelines, and HVAC chillers. Include verified template notifications, interactive department lists, and emergency escalation buttons.',
    recommendedTypes: ['template', 'list', 'text_buttons', 'single_product'],
    description: 'Preventive service requests, breakdown logging, and SLA compliance'
  }
];

export async function generateWhatsAppFlowWithAi(
  options: AiFlowGenerationOptions
): Promise<WhatsAppFlow> {
  const { prompt, flowName, category = 'healthcare', supportedTypes } = options;

  // 1. Try server-side Gemini API route first
  try {
    const res = await fetch('/api/ai/generate-flow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        flowName,
        category,
        supportedTypes
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.flow && Array.isArray(data.flow.nodes) && data.flow.nodes.length > 0) {
        return normalizeGeneratedFlow(data.flow, options);
      }
    }
  } catch (e) {
    console.warn('[AI Flow Builder] Server API call bypassed, switching to intelligent local synthesizer:', e);
  }

  // 2. Intelligent client-side synthesizer supporting all selected message types
  return synthesizeFlowLocally(options);
}

function normalizeGeneratedFlow(
  rawFlow: any,
  options: AiFlowGenerationOptions
): WhatsAppFlow {
  const timestamp = Date.now();
  const flowId = `flow-ai-${timestamp}`;
  const nodes: WhatsAppNode[] = (rawFlow.nodes || []).map((node: any, idx: number) => {
    const nodeId = node.id || `node-ai-${timestamp}-${idx + 1}`;
    const xPos = 80 + idx * 390;
    const yPos = 120 + (idx % 2) * 40;

    return {
      ...node,
      id: nodeId,
      title: node.title || `${idx + 1}. Step: ${node.type?.replace('_', ' ')}`,
      type: (node.type as WhatsAppNodeType) || 'text_buttons',
      position: node.position || { x: xPos, y: yPos }
    };
  });

  // Ensure button branches connect to next sequential node if unassigned
  nodes.forEach((node, idx) => {
    const nextNode = nodes[idx + 1];
    if (nextNode) {
      if (node.buttons && node.buttons.length > 0) {
        node.buttons.forEach((b) => {
          if (!b.nextNodeId) b.nextNodeId = nextNode.id;
        });
      }
      if (node.listSections) {
        node.listSections.forEach((sec) => {
          sec.rows.forEach((r) => {
            if (!r.nextNodeId) r.nextNodeId = nextNode.id;
          });
        });
      }
      if (node.templateConfig?.buttons) {
        node.templateConfig.buttons.forEach((tb) => {
          if (!tb.nextNodeId) tb.nextNodeId = nextNode.id;
        });
      }
      if (node.catalogConfig && !node.catalogConfig.nextNodeId) {
        node.catalogConfig.nextNodeId = nextNode.id;
      }
      if (node.singleProduct && !node.singleProduct.nextNodeId) {
        node.singleProduct.nextNodeId = nextNode.id;
      }
      if (!node.nextNodeId && node.type !== 'text_buttons' && node.type !== 'list') {
        node.nextNodeId = nextNode.id;
      }
    }
  });

  return {
    id: flowId,
    name: rawFlow.name || options.flowName || 'AI Generated Healthcare WhatsApp Flow',
    description: rawFlow.description || `Generated from prompt: "${options.prompt.slice(0, 100)}..."`,
    category: options.category || 'healthcare',
    triggerKeyword: rawFlow.triggerKeyword || 'START',
    startNodeId: nodes[0]?.id || `node-${timestamp}-1`,
    nodes
  };
}

function synthesizeFlowLocally(options: AiFlowGenerationOptions): WhatsAppFlow {
  const { prompt, flowName, category = 'healthcare', supportedTypes } = options;
  const timestamp = Date.now();
  const flowId = `flow-ai-${timestamp}`;
  const pLower = prompt.toLowerCase();

  // Determine domain context from prompt
  const isEquipment = pLower.includes('equipment') || pLower.includes('device') || pLower.includes('icu') || pLower.includes('ot') || pLower.includes('ventilator') || pLower.includes('procure');
  const isAdmission = pLower.includes('admission') || pLower.includes('bed') || pLower.includes('patient') || pLower.includes('hospital');
  const isDiagnostic = pLower.includes('diagnostic') || pLower.includes('lab') || pLower.includes('scan') || pLower.includes('mri') || pLower.includes('blood');
  const isService = pLower.includes('service') || pLower.includes('amc') || pLower.includes('maintenance') || pLower.includes('repair');

  // Filter which types to include: strictly respect user's selected supported types
  const typesToInclude: WhatsAppNodeType[] = supportedTypes.length > 0
    ? supportedTypes
    : ['text_buttons', 'media_buttons', 'list', 'catalogue', 'single_product', 'multi_product', 'template'];

  const nodes: WhatsAppNode[] = [];
  let stepIndex = 1;

  // Helper node creator by type
  const buildNodeForType = (type: WhatsAppNodeType, index: number): WhatsAppNode => {
    const nodeId = `node-ai-${timestamp}-${index}`;
    const xPos = 80 + (index - 1) * 390;
    const yPos = 120 + ((index - 1) % 2) * 45;

    switch (type) {
      case 'template':
        return {
          id: nodeId,
          title: `${index}. Meta Verified Intake Template`,
          type: 'template',
          position: { x: xPos, y: yPos },
          headerType: 'text',
          headerContent: isEquipment ? 'HEALTHCARE PROCUREMENT ALERT' : 'NOVA HEALTHCARE VERIFIED DESK',
          bodyText: `Namaste {{1}}! Your inquiry for ${isEquipment ? 'Hospital OT & ICU Equipment' : isDiagnostic ? 'Diagnostic Scan & Pathology Services' : 'Turnkey Healthcare Infrastructure'} has been received by NOVA Network. Ref ID: {{2}}.\n\nPlease confirm your preferred consultation mode below:`,
          footerText: 'Meta Verified WhatsApp Template • Instant Delivery',
          templateConfig: {
            templateName: 'nova_healthcare_intake_v2',
            category: 'UTILITY',
            language: 'en_US',
            bodyVariables: ['Dr. Sharma / Hospital Director', `NOVA-${Math.floor(10000 + Math.random() * 90000)}`],
            buttons: [
              { id: `tbtn-1`, type: 'QUICK_REPLY', text: '🏥 Continue on WhatsApp', nextNodeId: '' },
              { id: `tbtn-2`, type: 'URL', text: '🌐 View Web Portal', value: 'https://nova-h.org' }
            ]
          }
        };

      case 'media_buttons':
        return {
          id: nodeId,
          title: `${index}. Interactive Media Showcase`,
          type: 'media_buttons',
          position: { x: xPos, y: yPos },
          headerType: 'image',
          headerContent: isEquipment
            ? 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80'
            : isDiagnostic
            ? 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
          bodyText: `Explore verified ${isEquipment ? 'NABH-compliant modular OT & ICU technology' : isDiagnostic ? 'NABH & NABL accredited diagnostic testing packages' : 'clinical hospital facilities and specialist infrastructure'}.\n\nVerified by NOVA Healthcare Network Quality Council:`,
          footerText: 'Official Media Broadcast',
          buttons: [
            { id: `btn-m1`, title: '📑 View Specifications', nextNodeId: '' },
            { id: `btn-m2`, title: '⚡ Request Institutional Quote', nextNodeId: '' }
          ]
        };

      case 'text_buttons':
        return {
          id: nodeId,
          title: `${index}. Quick Action Reply Buttons`,
          type: 'text_buttons',
          position: { x: xPos, y: yPos },
          headerType: 'none',
          bodyText: `Welcome to NOVA Healthcare Desk. How would you like to proceed with your ${isEquipment ? 'procurement request' : isDiagnostic ? 'test booking' : 'project inquiry'} today?\n\nSelect an option to immediately connect with verified partners:`,
          footerText: 'Tap a button below to proceed',
          buttons: [
            { id: `btn-t1`, title: '🏥 Build / Expand Project', nextNodeId: '' },
            { id: `btn-t2`, title: '📦 Browse Verified Catalog', nextNodeId: '' },
            { id: `btn-t3`, title: '📞 Speak with Advisor', nextNodeId: '' }
          ]
        };

      case 'list':
        return {
          id: nodeId,
          title: `${index}. Interactive Department Menu`,
          type: 'list',
          position: { x: xPos, y: yPos },
          headerType: 'text',
          headerContent: 'SELECT DEPARTMENT / SPECIALTY',
          bodyText: 'Please choose your exact requirement from our organized clinical and engineering specialty directory:',
          footerText: 'Select one option below',
          listButtonText: 'Choose Department',
          listSections: [
            {
              title: isEquipment ? 'Critical Care & OR' : 'Clinical Facilities',
              rows: [
                { id: `row-1`, title: 'Modular Operation Theatres', description: 'ISO Class 5 cleanroom & laminar airflow', nextNodeId: '' },
                { id: `row-2`, title: 'Intensive Care Unit (ICU)', description: 'Turbine ventilators & multi-para telemetry', nextNodeId: '' }
              ]
            },
            {
              title: isEquipment ? 'Imaging & MEP Systems' : 'Diagnostics & Advisory',
              rows: [
                { id: `row-3`, title: 'Radiology / CT & MRI Bunkers', description: 'AERB layout clearances & lead shielding', nextNodeId: '' },
                { id: `row-4`, title: 'Turnkey Hospital Architecture', description: 'NABH 5th edition layout & MEP master planning', nextNodeId: '' }
              ]
            }
          ]
        };

      case 'catalogue':
        return {
          id: nodeId,
          title: `${index}. Meta Commerce Catalogue Message`,
          type: 'catalogue',
          position: { x: xPos, y: yPos },
          headerType: 'none',
          bodyText: 'Access our complete Meta verified healthcare catalog with live stock availability, direct institutional wholesale pricing, and verified OEM warranty certificates.',
          footerText: 'Powered by Meta Cloud API & Commerce Manager',
          catalogConfig: {
            catalogId: 'meta-cat-nova-verified-01',
            thumbnailUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
            headerText: 'NOVA Certified Healthcare Catalog',
            bodyText: '250+ Certified Medical Devices & Hospital Packages',
            footerText: 'Direct OEM Pricing • AERB & CE Certified',
            actionButtonText: 'View Catalog',
            nextNodeId: ''
          }
        };

      case 'single_product':
        return {
          id: nodeId,
          title: `${index}. Single Product SKU Card`,
          type: 'single_product',
          position: { x: xPos, y: yPos },
          headerType: 'none',
          bodyText: 'High-precision turbine critical care ICU ventilator designed for pediatric through adult respiratory support with integrated turbine air source and battery backup.',
          footerText: 'Available for immediate dispatch • Institutional Warranty',
          singleProduct: {
            id: `prod-sku-1`,
            retailerId: 'NOVA-MED-VENT-500X',
            title: 'NOVA Turbine ICU Ventilator Pro-500',
            price: '₹4,50,000',
            currency: 'INR',
            description: 'Invasive & Non-Invasive ventilation with 12.1" touch display, high-pressure O2 blender, and 3-year comprehensive CMC guarantee.',
            imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
            category: 'Critical Care Equipment',
            nextNodeId: ''
          }
        };

      case 'multi_product':
        return {
          id: nodeId,
          title: `${index}. Multi-Product Catalog Showcase`,
          type: 'multi_product',
          position: { x: xPos, y: yPos },
          headerType: 'text',
          headerContent: 'VERIFIED HEALTHCARE BUNDLE',
          bodyText: 'Select certified equipment packages with consolidated GST invoicing, site installation, and biomedical calibration certificates:',
          footerText: 'Tap below to browse items and add to in-chat cart',
          productSections: [
            {
              title: 'ICU Critical Care Package',
              products: [
                {
                  id: `prod-multi-1`,
                  retailerId: 'NOVA-ICU-BED-ELEC',
                  title: '5-Function Motorized ICU Bed with Weighing Scale',
                  price: '₹1,25,000',
                  currency: 'INR',
                  description: 'CPR quick release, Linak motors, central locking wheels, and X-ray translucent backrest.',
                  imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=600&q=80',
                  category: 'Hospital Furniture',
                  nextNodeId: ''
                },
                {
                  id: `prod-multi-2`,
                  retailerId: 'NOVA-MON-12P',
                  title: '12.1" Modular Multipara Patient Monitor',
                  price: '₹68,000',
                  currency: 'INR',
                  description: 'ECG, SpO2, NIBP, Dual Temp, Resp, and IBP with central station networking.',
                  imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
                  category: 'Critical Care Monitors',
                  nextNodeId: ''
                }
              ]
            },
            {
              title: 'Operation Theatre & CSSD',
              products: [
                {
                  id: `prod-multi-3`,
                  retailerId: 'NOVA-OT-LIGHT-DUAL',
                  title: 'Dual Dome LED Surgical OT Light (160,000 Lux)',
                  price: '₹2,10,000',
                  currency: 'INR',
                  description: 'Color temperature adjustment 3800K-5000K with shadowless German optical lenses.',
                  imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
                  category: 'Surgical Equipment',
                  nextNodeId: ''
                }
              ]
            }
          ]
        };

      default:
        return {
          id: nodeId,
          title: `${index}. Interactive Message`,
          type: 'text_buttons',
          position: { x: xPos, y: yPos },
          headerType: 'none',
          bodyText: 'Thank you for connecting with NOVA Healthcare Network.',
          buttons: [{ id: 'b1', title: 'Continue', nextNodeId: '' }]
        };
    }
  };

  // Build sequential nodes for each included message type
  typesToInclude.forEach((type) => {
    nodes.push(buildNodeForType(type, stepIndex));
    stepIndex++;
  });

  // Link button branches sequentially so the flow graph renders smoothly
  nodes.forEach((node, idx) => {
    const nextNode = nodes[idx + 1];
    if (nextNode) {
      if (node.buttons && node.buttons.length > 0) {
        node.buttons.forEach((b) => {
          if (!b.nextNodeId) b.nextNodeId = nextNode.id;
        });
      }
      if (node.listSections) {
        node.listSections.forEach((sec) => {
          sec.rows.forEach((r) => {
            if (!r.nextNodeId) r.nextNodeId = nextNode.id;
          });
        });
      }
      if (node.templateConfig?.buttons) {
        node.templateConfig.buttons.forEach((tb) => {
          if (!tb.nextNodeId) tb.nextNodeId = nextNode.id;
        });
      }
      if (node.catalogConfig && !node.catalogConfig.nextNodeId) {
        node.catalogConfig.nextNodeId = nextNode.id;
      }
      if (node.singleProduct && !node.singleProduct.nextNodeId) {
        node.singleProduct.nextNodeId = nextNode.id;
      }
      if (!node.nextNodeId && node.type !== 'text_buttons' && node.type !== 'list') {
        node.nextNodeId = nextNode.id;
      }
    }
  });

  const generatedTitle = flowName || (
    isEquipment ? 'ICU & OT Equipment Procurement Journey' :
    isAdmission ? 'Hospital Patient Admission & Bed Flow' :
    isDiagnostic ? 'Diagnostic Imaging & Lab Packages Flow' :
    isService ? 'Hospital Biomedical AMC & Maintenance Desk' :
    'Interactive Healthcare WhatsApp Journey'
  );

  return {
    id: flowId,
    name: generatedTitle,
    description: `AI-synthesized interactive WhatsApp flow supporting ${typesToInclude.length} message types: ${typesToInclude.join(', ')}.`,
    category,
    triggerKeyword: isEquipment ? 'EQUIPMENT' : isAdmission ? 'ADMIT' : isDiagnostic ? 'TESTS' : 'HELLO',
    startNodeId: nodes[0]?.id || `node-${timestamp}-1`,
    nodes
  };
}
