import { 
  Document, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  HeadingLevel, 
  BorderStyle, 
  ShadingType, 
  Packer, 
  ImageRun, 
  Header, 
  Footer, 
  PageNumber
} from 'docx';
import { toPng } from 'html-to-image';

export interface CostCalculationParams {
  mau: number;
  rfpCount: number;
  whatsappConversations: number;
  emailVolume: number;
  storageGb: number;
  currency: 'USD' | 'INR' | 'BOTH';
  fxRate?: number;
}

export interface CalculatedCosts {
  computeCost: number;
  dbCost: number;
  redisCost: number;
  storageCost: number;
  emailCost: number;
  whatsappCost: number;
  opsCost: number;
  totalUsd: number;
  costPerMau: string;
  containerCount: number;
}

export interface ArchNodeDocSpec {
  id: string;
  title: string;
  category: string;
  role: string;
  techStack: string;
  throughput: string;
  sla: string;
  security: string[];
}

export interface ArchitectureDocxOptions {
  fileName?: string;
  documentTitle?: string;
  costParams?: CostCalculationParams;
  calculatedCosts?: CalculatedCosts;
  includeDiagramImage?: boolean;
  diagramImageBase64?: string;
  canvasContainerEl?: HTMLElement | null;
  includeNodeSpecs?: boolean;
  includeCostBreakdown?: boolean;
  includeTimeline?: boolean;
  includeDatabaseSchema?: boolean;
  includeSecurityCompliance?: boolean;
  customNodeSpecs?: Record<string, ArchNodeDocSpec>;
}

const DEFAULT_NODE_SPECS: Record<string, ArchNodeDocSpec> = {
  client_web: {
    id: 'client_web',
    title: 'Web Application Clients',
    category: 'Client Tier',
    role: 'Responsive React 19 Single Page App used by Hospital Promoters, Medical Vendors, Architects, and Admins.',
    techStack: 'React 19 + TypeScript + Vite + Tailwind CSS',
    throughput: 'Client-side SPA caching; zero server rendering latency',
    sla: '100% via Global Edge CDN',
    security: ['Content Security Policy (CSP)', 'JWT stored in HttpOnly secure cookies', 'Client-side XSS sanitization']
  },
  client_whatsapp: {
    id: 'client_whatsapp',
    title: 'WhatsApp Mobile Clients',
    category: 'Client Tier',
    role: 'Medical vendors and hospital owners receiving instant RFQs, submitting bids, and managing leads on WhatsApp.',
    techStack: 'Native WhatsApp iOS & Android Client (Meta WABA)',
    throughput: '80+ messages/second batch throughput',
    sla: '99.9% Meta Global Uptime',
    security: ['End-to-End Encryption on client-to-Meta leg', 'Meta Verified Business Badge', 'Strict 24h conversation timeout']
  },
  edge_cloudflare: {
    id: 'edge_cloudflare',
    title: 'Cloudflare Enterprise Edge & WAF',
    category: 'Edge Network',
    role: 'Global reverse proxy, DDoS mitigation, SSL termination, and static asset caching across 310+ cities.',
    techStack: 'Cloudflare Enterprise + TLS 1.3 + Anycast DNS',
    throughput: 'Unmetered L7 DDoS defense up to 50+ Gbps',
    sla: '100% Edge SLA',
    security: ['Automated L3/L4/L7 DDoS mitigation', 'TLS 1.3 strict cipher suites', 'Bot mitigation for pricing databases']
  },
  api_gateway: {
    id: 'api_gateway',
    title: 'Fastify API Gateway',
    category: 'Gateway',
    role: 'High-speed Node.js API Gateway handling user authentication, CORS policies, rate limiting, and request validation.',
    techStack: 'Node.js 22 LTS + Fastify + TypeScript + Zod',
    throughput: '35,000+ requests/sec per 4-core container',
    sla: '99.95% High Availability',
    security: ['@fastify/helmet hardened headers', 'Redis sliding window rate limiting', 'JSON Schema validation']
  },
  webhook_ingest: {
    id: 'webhook_ingest',
    title: 'Meta Webhook Receiver',
    category: 'Gateway',
    role: 'Receives and authenticates incoming WhatsApp events, status updates, and interactive button clicks from Meta.',
    techStack: 'Fastify raw body hook + HMAC SHA-256 verification',
    throughput: '1,500 webhooks/second burst ingestion',
    sla: '99.99%',
    security: ['X-Hub-Signature-256 verification', 'Idempotency tokens in Redis', 'Immediate HTTP 200 with BullMQ offload']
  },
  service_procurement: {
    id: 'service_procurement',
    title: 'Procurement & Sealed BoQ Engine',
    category: 'Microservices',
    role: 'Core business logic for 15 hospital construction stages, multi-vendor equipment tenders, sealed bids, and comparative matrices.',
    techStack: 'TypeScript + Drizzle ORM + PostgreSQL ACID transactions',
    throughput: 'Sub-40ms execution time for tender comparisons',
    sla: '99.95%',
    security: ['Cryptographic sealed bidding escrow', 'Multi-tenant project isolation', 'Immutable revision audit logs']
  },
  service_whatsapp: {
    id: 'service_whatsapp',
    title: 'WhatsApp Flow Executor',
    category: 'Microservices',
    role: 'Executes interactive node trees designed in the WhatsApp Flow Builder, maintaining session states and conversation transitions.',
    techStack: 'Node.js Graph State Machine + Redis Session Store',
    throughput: '5,000 active state transitions/min',
    sla: '99.9%',
    security: ['24-hour session expiration', 'Input sanitization against injection', 'Outbound rate-limiting per user']
  },
  service_mjml: {
    id: 'service_mjml',
    title: 'MJML Email Transpiler & Studio',
    category: 'Microservices',
    role: 'Transpiles dynamic email schema blocks into compliant, bulletproof responsive HTML with Outlook MSO fallbacks.',
    techStack: 'mjml-core + Cheerio HTML minifier + Handlebars',
    throughput: '120 emails transpiled / sec per worker core',
    sla: '99.95%',
    security: ['HTML & CSS sanitization', 'RFC 8058 compliant unsubscribe headers', 'Dynamic token escaping']
  },
  service_auth: {
    id: 'service_auth',
    title: 'Multi-Role RBAC & Auth Service',
    category: 'Microservices',
    role: 'Manages identity, authentication credentials, permission matrices, and organization workspaces for 4 key roles.',
    techStack: 'Argon2id password hashing + JWT + Redis Blacklist',
    throughput: 'Sub-5ms token verification with in-memory caching',
    sla: '99.99%',
    security: ['Argon2id password hashing', 'Granular RBAC role matrices', 'Admin impersonation audit stamps']
  },
  queue_bullmq: {
    id: 'queue_bullmq',
    title: 'Redis 7 & BullMQ Async Queue',
    category: 'Queues & Caches',
    role: 'Asynchronous task queue managing delayed jobs, rate-limited email dispatches, WhatsApp outbound throttlers, and background processing.',
    techStack: 'Redis 7 Cluster + BullMQ + Node.js Worker Threads',
    throughput: '10,000+ jobs processed / minute with concurrency controls',
    sla: '99.95%',
    security: ['TLS encrypted Redis connections', 'Exponential backoff retry policy (5 retries)', 'Dead-letter queue isolation']
  },
  db_postgres: {
    id: 'db_postgres',
    title: 'PostgreSQL 16 Multi-AZ',
    category: 'Data Storage',
    role: 'Primary ACID transactional database storing hospital projects, equipment specifications, sealed bids, user accounts, and audit events.',
    techStack: 'PostgreSQL 16 + Drizzle ORM + pgBouncer connection pooling',
    throughput: '8,000 queries/sec with read replicas & index optimization',
    sla: '99.99% Multi-AZ with automatic failover in < 30s',
    security: ['AES-256 storage encryption at rest (AWS KMS)', '30-day Point-in-Time Recovery (PITR)', 'Encrypted payment & quote terms']
  },
  storage_r2: {
    id: 'storage_r2',
    title: 'Cloudflare R2 Object Vault',
    category: 'Data Storage',
    role: 'Stores hospital architectural CAD drawings, vendor equipment catalogs, compliance certificates (NABH/ISO), and generated MJML HTML assets.',
    techStack: 'Cloudflare R2 + AWS S3 API SDK + Pre-Signed URLs',
    throughput: 'Zero egress fees; up to 10 Gbps global download speed',
    sla: '99.999999999% (11 9s) Data Durability',
    security: ['Browser-to-R2 pre-signed PUT URLs', 'Temporary 15-minute time-restricted GET URLs', 'Server-side AES-256 encryption']
  },
  ext_ses: {
    id: 'ext_ses',
    title: 'Amazon SES Email Relay',
    category: 'External Integrations',
    role: 'Dispatches high-volume transactional notifications, RFP invitations, and broadcast newsletters designed in MJML Studio.',
    techStack: 'Amazon Simple Email Service (SES) + Dedicated IP + DKIM/SPF/DMARC',
    throughput: 'Up to 200 emails / second; $0.10 per 1,000 emails',
    sla: '99.9% AWS Deliverability',
    security: ['DKIM 2048-bit domain signing', 'DMARC policy (p=reject) anti-spoofing', 'Automated bounce feedback loop']
  },
  ext_meta: {
    id: 'ext_meta',
    title: 'Meta WhatsApp Cloud API',
    category: 'External Integrations',
    role: 'Official WhatsApp Business Platform sending interactive flows, dynamic templates, catalog messages, and vendor notifications.',
    techStack: 'Meta Graph API v21.0 + Official Business Account (WABA)',
    throughput: '80 messages / second official Cloud API throughput',
    sla: '99.9% Meta Core Infrastructure',
    security: ['Permanent System User Access Tokens', 'End-to-end webhook validation', 'Pre-registered approved templates']
  },
  ext_sentry: {
    id: 'ext_sentry',
    title: 'Sentry & APM Observability',
    category: 'External Integrations',
    role: 'Real-time distributed tracing, performance monitoring, uncaught error tracking, and database query latency profiling.',
    techStack: 'Sentry Node.js SDK + OpenTelemetry + BetterStack Uptime Alerts',
    throughput: '100% trace sampling on errors; 10% on high-volume HTTP',
    sla: '99.9%',
    security: ['Automated PII scrubbing for healthcare privacy', 'Data residency compliance', 'Real-time Slack & PagerDuty alerting']
  }
};

const cellBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
};

function base64ToUint8Array(base64: string): Uint8Array {
  const pureBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
  const binaryString = atob(pureBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generates an executive Microsoft Word (.docx) document detailing system architecture,
 * node specifications, cost calculations, timeline roadmap, database schema, and security.
 */
export async function generateArchitectureAndCostDocx(options: ArchitectureDocxOptions = {}): Promise<void> {
  const {
    fileName = 'NOVA-H_Backend_Architecture_and_Cost_Plan.docx',
    documentTitle = 'NOVA-H: Backend Architecture & Infrastructure Cost Specification',
    costParams = {
      mau: 25000,
      rfpCount: 350,
      whatsappConversations: 50000,
      emailVolume: 200000,
      storageGb: 250,
      currency: 'BOTH',
      fxRate: 84
    },
    includeDiagramImage = true,
    diagramImageBase64,
    canvasContainerEl,
    includeNodeSpecs = true,
    includeCostBreakdown = true,
    includeTimeline = true,
    includeDatabaseSchema = true,
    includeSecurityCompliance = true,
    customNodeSpecs = DEFAULT_NODE_SPECS
  } = options;

  const fxRate = costParams.fxRate || 84;

  // Sizing and cost calculation
  const containerCount = Math.max(2, Math.ceil(costParams.mau / 6000));
  const computeCost = containerCount * 28;

  let dbCost = 35;
  if (costParams.mau > 15000 && costParams.mau <= 60000) dbCost = 140;
  else if (costParams.mau > 60000) dbCost = 420;

  let redisCost = 15;
  if (costParams.mau > 15000 && costParams.mau <= 60000) redisCost = 55;
  else if (costParams.mau > 60000) redisCost = 175;

  const storageCost = Math.max(5, Math.ceil(costParams.storageGb * 0.015) + 5);
  const emailCost = Math.max(3, Math.ceil((costParams.emailVolume / 1000) * 0.10));
  const whatsappCost = Math.ceil(costParams.whatsappConversations * 0.0078);

  let opsCost = 15;
  if (costParams.mau > 15000 && costParams.mau <= 60000) opsCost = 65;
  else if (costParams.mau > 60000) opsCost = 190;

  const totalUsd = computeCost + dbCost + redisCost + storageCost + emailCost + whatsappCost + opsCost;
  const totalInr = Math.round(totalUsd * fxRate);
  const costPerMau = (totalUsd / Math.max(1, costParams.mau)).toFixed(3);
  const costPerMauInr = (Number(costPerMau) * fxRate).toFixed(2);

  // Capture diagram image if needed and not already provided
  let imageBytes: Uint8Array | null = null;
  if (includeDiagramImage) {
    if (diagramImageBase64) {
      try {
        imageBytes = base64ToUint8Array(diagramImageBase64);
      } catch (err) {
        console.warn('Failed to parse diagramImageBase64:', err);
      }
    } else if (canvasContainerEl) {
      try {
        const viewportEl = (canvasContainerEl.querySelector('.react-flow__viewport') as HTMLElement) || canvasContainerEl;
        const capturedDataUrl = await toPng(viewportEl, {
          backgroundColor: '#071324',
          pixelRatio: 1.5,
          skipFonts: true,
          cacheBust: true
        });
        imageBytes = base64ToUint8Array(capturedDataUrl);
      } catch (err) {
        console.warn('Could not capture canvas container for Word doc:', err);
      }
    }
  }

  // Build Document Sections
  const docChildren: (Paragraph | Table)[] = [];

  // ==========================================
  // COVER / DOCUMENT HEADER
  // ==========================================
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: 'NOVA-H HEALTHCARE NETWORK',
          bold: true,
          size: 20,
          color: '2563EB',
          font: 'Segoe UI'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { before: 60, after: 120 },
      children: [
        new TextRun({
          text: documentTitle,
          bold: true,
          size: 38,
          color: '0F172A',
          font: 'Segoe UI'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 360 },
      children: [
        new TextRun({
          text: 'High-Availability Modular Monolith, Multi-Tenant Database Schema, Operational Cost Projections & Engineering Roadmap',
          italics: true,
          size: 22,
          color: '475569',
          font: 'Segoe UI'
        })
      ]
    })
  );

  // Metadata Box Table
  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'DOCUMENT METADATA & REVISION CONTROL', bold: true, color: 'FFFFFF', size: 18, font: 'Segoe UI' })
                  ]
                })
              ],
              columnSpan: 2
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'Target Application:', bold: true, size: 18, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'NOVA-H Healthcare Infrastructure & Equipment Procurement Network', size: 18, font: 'Segoe UI' })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: 'Core Architecture:', bold: true, size: 18, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Node.js 22 LTS (Fastify) + PostgreSQL 16 Multi-AZ + Redis 7 / BullMQ + Cloudflare R2', size: 18, font: 'Segoe UI' })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: 'Target Scale Scenario:', bold: true, size: 18, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: `${costParams.mau.toLocaleString()} MAU | ${costParams.rfpCount.toLocaleString()} Monthly RFPs | ${costParams.whatsappConversations.toLocaleString()} WhatsApp Chats`, size: 18, font: 'Segoe UI' })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: 'Published Date & Version:', bold: true, size: 18, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: `${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} — Production v2.4`, size: 18, font: 'Segoe UI' })] })]
            })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { after: 360 } })
  );

  // ==========================================
  // SECTION 1: EXECUTIVE SUMMARY
  // ==========================================
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 140 },
      children: [new TextRun({ text: '1. Executive Summary & Design Principles', bold: true, size: 28, color: '1E3A8A', font: 'Segoe UI' })]
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'NOVA-H is a multi-sided healthcare infrastructure network connecting hospital promoters, turnkey healthcare architects, medical equipment vendors (e.g. MRI, CT, cath labs), and clinical advisors across 15 distinct development lifecycle stages.',
          size: 20,
          font: 'Segoe UI'
        })
      ]
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'To ensure commercial confidentiality and prevent bid tampering during tender periods, the system adopts a Cryptographic Sealed Bidding paradigm. Quotation amounts submitted by competitive manufacturers remain encrypted with an asymmetric escrow key until the RFP deadline passes.',
          size: 20,
          font: 'Segoe UI'
        })
      ]
    }),
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: 'Operational efficiency is maximized through zero-egress file storage via Cloudflare R2 for AutoCAD drawings and Bill of Quantities (BoQ) spreadsheets, automated WhatsApp Cloud API conversational flows, and high-deliverability Amazon SES relays compiled with the MJML transactional template engine.',
          size: 20,
          font: 'Segoe UI'
        })
      ]
    })
  );

  // Key Architectural Highlights Box
  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'EFF6FF', type: ShadingType.CLEAR },
              borders: {
                left: { style: BorderStyle.SINGLE, size: 12, color: '2563EB' },
                top: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE }
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'CORE ARCHITECTURAL PILLARS', bold: true, color: '1E40AF', size: 19, font: 'Segoe UI' })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: '• Sub-50ms Response Latency: Fastify engine provides 35,000+ req/sec throughput with minimal memory footprint.\n', size: 18, font: 'Segoe UI' }),
                    new TextRun({ text: '• Zero Egress Storage Economics: Cloudflare R2 provides S3-compatible APIs without punishing $0.09/GB egress bandwidth fees.\n', size: 18, font: 'Segoe UI' }),
                    new TextRun({ text: '• High Reliability Message Queues: Redis 7 and BullMQ handle delayed webhook processing with 5-stage exponential retry backoff.\n', size: 18, font: 'Segoe UI' }),
                    new TextRun({ text: '• Data Sovereignty: Hosted exclusively in AWS Mumbai (ap-south-1) for compliance with Indian healthcare IT regulations.', size: 18, font: 'Segoe UI' })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { after: 360 } })
  );

  // ==========================================
  // SECTION 2: SYSTEM ARCHITECTURE & TOPOLOGY
  // ==========================================
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 140 },
      children: [new TextRun({ text: '2. High-Level Architecture Topology & Node Specifications', bold: true, size: 28, color: '1E3A8A', font: 'Segoe UI' })]
    }),
    new Paragraph({
      spacing: { after: 140 },
      children: [
        new TextRun({
          text: 'The NOVA-H backend adopts an asynchronous, event-driven modular architecture organized into seven distinct operational tiers: Client Interfaces, Edge & CDN, API Gateway, Microservice Business Logic, Task Queues, Persistent Data Stores, and External Integration Gateways.',
          size: 20,
          font: 'Segoe UI'
        })
      ]
    })
  );

  // Embedded Diagram Image (if available)
  if (imageBytes && imageBytes.length > 0) {
    try {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 60 },
          children: [
            new ImageRun({
              data: imageBytes,
              transformation: {
                width: 620,
                height: 360
              },
              type: 'png'
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: 'Figure 1: NOVA-H End-to-End System Topology (XYFlow Interactive Architecture Schema)',
              italics: true,
              size: 17,
              color: '64748B',
              font: 'Segoe UI'
            })
          ]
        })
      );
    } catch (err) {
      console.warn('Could not add image run to Word doc:', err);
    }
  }

  // Component Specifications Table
  if (includeNodeSpecs) {
    const specRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            borders: cellBorders,
            width: { size: 18, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Tier / Node', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
          }),
          new TableCell({
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            borders: cellBorders,
            width: { size: 22, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Tech Stack', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
          }),
          new TableCell({
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            borders: cellBorders,
            width: { size: 38, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Core Responsibility & Features', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
          }),
          new TableCell({
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            borders: cellBorders,
            width: { size: 22, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Throughput & SLA', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
          })
        ]
      })
    ];

    Object.values(customNodeSpecs).forEach((spec, idx) => {
      const isAlt = idx % 2 === 1;
      specRows.push(
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
              children: [
                new Paragraph({ children: [new TextRun({ text: spec.title, bold: true, size: 17, color: '1E293B', font: 'Segoe UI' })] }),
                new Paragraph({ children: [new TextRun({ text: spec.category, size: 15, color: '2563EB', font: 'Segoe UI' })] })
              ]
            }),
            new TableCell({
              borders: cellBorders,
              shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: spec.techStack, size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              borders: cellBorders,
              shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
              children: [
                new Paragraph({ children: [new TextRun({ text: spec.role, size: 16, font: 'Segoe UI' })] }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Security: ${spec.security[0]}`, size: 15, color: '059669', font: 'Segoe UI' })
                  ]
                })
              ]
            }),
            new TableCell({
              borders: cellBorders,
              shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
              children: [
                new Paragraph({ children: [new TextRun({ text: spec.throughput, size: 15, font: 'Segoe UI' })] }),
                new Paragraph({ children: [new TextRun({ text: `SLA: ${spec.sla}`, bold: true, size: 15, color: 'D97706', font: 'Segoe UI' })] })
              ]
            })
          ]
        })
      );
    });

    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: specRows
      }),
      new Paragraph({ spacing: { after: 360 } })
    );
  }

  // ==========================================
  // SECTION 3: CLOUD OPEX & INFRASTRUCTURE BUDGET
  // ==========================================
  if (includeCostBreakdown) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 140 },
        children: [new TextRun({ text: '3. Cloud Infrastructure Cost Projections & Unit Economics', bold: true, size: 28, color: '1E3A8A', font: 'Segoe UI' })]
      }),
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: `The following operational expense (OpEx) forecast is dynamically modeled for an active workload of ${costParams.mau.toLocaleString()} Monthly Active Users, ${costParams.rfpCount.toLocaleString()} hospital procurement RFPs, ${costParams.whatsappConversations.toLocaleString()} automated WhatsApp conversations, and ${costParams.storageGb} GB of medical blueprint storage.`,
            size: 20,
            font: 'Segoe UI'
          })
        ]
      })
    );

    // Summary OpEx Card Table
    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: '0F172A', type: ShadingType.CLEAR },
                borders: cellBorders,
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'TOTAL ESTIMATED MONTHLY CLOUD & API OPEX', bold: true, size: 18, color: '93C5FD', font: 'Segoe UI' })
                    ]
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: `$${totalUsd.toLocaleString()} USD `, bold: true, size: 40, color: 'FFFFFF', font: 'Segoe UI' }),
                      new TextRun({ text: `/ month (approx. ₹${totalInr.toLocaleString('en-IN')} INR)`, size: 24, color: 'CBD5E1', font: 'Segoe UI' })
                    ]
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: `Unit Economics: $${costPerMau} USD (₹${costPerMauInr} INR) per active user / month`, size: 18, color: '34D399', font: 'Segoe UI' })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }),
      new Paragraph({ spacing: { after: 200 } })
    );

    // Itemized Line Items Table
    const costBreakdownItems = [
      {
        item: 'Compute Tier (Fastify / Node API)',
        sizing: `${containerCount} containers (1 vCPU, 2GB RAM each) on ECS/Fly.io`,
        usd: computeCost,
        share: `${Math.round((computeCost / totalUsd) * 100)}%`
      },
      {
        item: 'Managed PostgreSQL Database',
        sizing: costParams.mau > 60000 ? 'Multi-AZ 32GB RAM + Read Replica' : (costParams.mau > 15000 ? '4 vCPU, 16GB RAM + Auto-Backups' : '2 vCPU, 4GB RAM Dedicated RDS'),
        usd: dbCost,
        share: `${Math.round((dbCost / totalUsd) * 100)}%`
      },
      {
        item: 'Redis 7 & BullMQ Queue Workers',
        sizing: costParams.mau > 15000 ? 'Cluster node with persistence & failover' : 'Single high-memory Redis 7 cache',
        usd: redisCost,
        share: `${Math.round((redisCost / totalUsd) * 100)}%`
      },
      {
        item: 'Cloudflare R2 Storage & Global CDN',
        sizing: `${costParams.storageGb} GB stored (Zero Egress Bandwidth fees)`,
        usd: storageCost,
        share: `${Math.round((storageCost / totalUsd) * 100)}%`
      },
      {
        item: 'Meta WhatsApp Business Cloud API',
        sizing: `${costParams.whatsappConversations.toLocaleString()} conversations (avg $0.0078 blended)`,
        usd: whatsappCost,
        share: `${Math.round((whatsappCost / totalUsd) * 100)}%`
      },
      {
        item: 'Amazon SES Email Relay',
        sizing: `${costParams.emailVolume.toLocaleString()} transactional & marketing emails ($0.10/1k)`,
        usd: emailCost,
        share: `${Math.round((emailCost / totalUsd) * 100)}%`
      },
      {
        item: 'Sentry Observability & APM',
        sizing: 'Error tracking, performance spans, health checks & alerts',
        usd: opsCost,
        share: `${Math.round((opsCost / totalUsd) * 100)}%`
      }
    ];

    const costTableRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            borders: cellBorders,
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Infrastructure Line Item', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
          }),
          new TableCell({
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            borders: cellBorders,
            width: { size: 36, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Allocated Sizing & Description', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
          }),
          new TableCell({
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            borders: cellBorders,
            width: { size: 18, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Monthly (USD)', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
          }),
          new TableCell({
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            borders: cellBorders,
            width: { size: 16, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Monthly (INR)', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
          })
        ]
      })
    ];

    costBreakdownItems.forEach((c, idx) => {
      const isAlt = idx % 2 === 1;
      costTableRows.push(
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: c.item, bold: true, size: 17, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              borders: cellBorders,
              shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: c.sizing, size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              borders: cellBorders,
              shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: `$${c.usd} / mo (${c.share})`, bold: true, size: 16, color: '1E3A8A', font: 'Segoe UI' })] })]
            }),
            new TableCell({
              borders: cellBorders,
              shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: `₹${(c.usd * fxRate).toLocaleString('en-IN')}`, size: 16, font: 'Segoe UI' })] })]
            })
          ]
        })
      );
    });

    // Grand Total Row
    costTableRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            shading: { fill: 'E2E8F0', type: ShadingType.CLEAR },
            columnSpan: 2,
            children: [new Paragraph({ children: [new TextRun({ text: 'GRAND TOTAL ESTIMATED OPERATIONAL EXPENSE (OpEx)', bold: true, size: 18, color: '0F172A', font: 'Segoe UI' })] })]
          }),
          new TableCell({
            borders: cellBorders,
            shading: { fill: 'E2E8F0', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: `$${totalUsd.toLocaleString()} / mo`, bold: true, size: 18, color: '1E3A8A', font: 'Segoe UI' })] })]
          }),
          new TableCell({
            borders: cellBorders,
            shading: { fill: 'E2E8F0', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: `₹${totalInr.toLocaleString('en-IN')} / mo`, bold: true, size: 18, color: '047857', font: 'Segoe UI' })] })]
          })
        ]
      })
    );

    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: costTableRows
      }),
      new Paragraph({ spacing: { after: 240 } })
    );

    // Multi-Stage Scenario Comparison Table
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 180, after: 120 },
        children: [new TextRun({ text: 'Scale Benchmark Scenarios (Seed Pilot vs Growth vs Enterprise)', bold: true, size: 24, color: '1E3A8A', font: 'Segoe UI' })]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: 'Stage Scenario', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
              }),
              new TableCell({
                shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: 'Workload Parameters', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
              }),
              new TableCell({
                shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: 'Monthly OpEx (USD)', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
              }),
              new TableCell({
                shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: 'Monthly OpEx (INR)', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
              }),
              new TableCell({
                shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: 'Unit Cost / MAU', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: 'Seed Pilot Stage', bold: true, size: 16, font: 'Segoe UI' })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: '2,500 MAU, 45 RFPs, 8k WA chats', size: 15, font: 'Segoe UI' })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: '$198 / month', bold: true, size: 16, font: 'Segoe UI' })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: '₹16,632 / month', size: 15, font: 'Segoe UI' })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: '$0.079 / user', color: '059669', bold: true, size: 15, font: 'Segoe UI' })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: 'Growth Stage (Baseline)', bold: true, size: 16, font: 'Segoe UI' })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: '25,000 MAU, 350 RFPs, 50k WA chats', size: 15, font: 'Segoe UI' })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: '$808 / month', bold: true, size: 16, font: 'Segoe UI' })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: '₹67,872 / month', size: 15, font: 'Segoe UI' })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: '$0.032 / user', color: '059669', bold: true, size: 15, font: 'Segoe UI' })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: 'National Enterprise Scale', bold: true, size: 16, font: 'Segoe UI' })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: '120,000 MAU, 2,400 RFPs, 250k WA chats', size: 15, font: 'Segoe UI' })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: '$3,485 / month', bold: true, size: 16, font: 'Segoe UI' })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: '₹292,740 / month', size: 15, font: 'Segoe UI' })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: '$0.029 / user', color: '059669', bold: true, size: 15, font: 'Segoe UI' })] })]
              })
            ]
          })
        ]
      }),
      new Paragraph({ spacing: { after: 360 } })
    );
  }

  // ==========================================
  // SECTION 4: DEVELOPMENT TIMELINE & BUDGET
  // ==========================================
  if (includeTimeline) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 140 },
        children: [new TextRun({ text: '4. 15-Week Implementation Roadmap & Engineering Budget', bold: true, size: 28, color: '1E3A8A', font: 'Segoe UI' })]
      }),
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: 'The full software delivery lifecycle is structured across five sequential milestone phases spanning 15 calendar weeks, executed by a dedicated squad of 2 Senior Full-Stack Engineers, 0.5 DevOps/SRE Engineer, and 0.5 Healthcare QA Specialist.',
            size: 20,
            font: 'Segoe UI'
          })
        ]
      })
    );

    const timelinePhases = [
      {
        phase: 'Phase 1: Foundations & Auth',
        weeks: 'Weeks 1 – 3',
        scope: 'PostgreSQL schema migrations (Drizzle ORM), multi-role RBAC (Hospital Owner, Vendor, Advisor, Admin), JWT session handling, Cloudflare R2 pre-signed uploads.',
        indiaBudget: '$3,500 – $5,000',
        usBudget: '$15,000 – $22,000'
      },
      {
        phase: 'Phase 2: Procurement & Sealed RFP Engine',
        weeks: 'Weeks 4 – 7',
        scope: 'Hospital project milestone tracking across 15 stages, sealed BoQ bidding, quotation comparison matrices, quotation acceptance, revision audit trails.',
        indiaBudget: '$5,000 – $7,500',
        usBudget: '$20,000 – $30,000'
      },
      {
        phase: 'Phase 3: WhatsApp Engine & Webhooks',
        weeks: 'Weeks 8 – 10',
        scope: 'Meta WhatsApp Cloud API webhook ingestion, idempotency handlers, dynamic graph execution engine, Redis session timeout handling.',
        indiaBudget: '$4,000 – $6,000',
        usBudget: '$16,000 – $24,000'
      },
      {
        phase: 'Phase 4: MJML Studio Backend & Email Relay',
        weeks: 'Weeks 11 – 12',
        scope: 'Server-side MJML compilation endpoint, template versioning, Amazon SES integration, BullMQ batched delivery queue with open/click tracking.',
        indiaBudget: '$3,000 – $4,500',
        usBudget: '$12,000 – $18,000'
      },
      {
        phase: 'Phase 5: Security Hardening & Launch',
        weeks: 'Weeks 13 – 15',
        scope: 'Load testing (10,000 concurrent requests), OWASP Top 10 vulnerability audit, ClamAV antivirus file scanning, CI/CD automated deployment pipelines.',
        indiaBudget: '$3,000 – $4,500',
        usBudget: '$12,000 – $16,000'
      }
    ];

    const timelineRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            borders: cellBorders,
            width: { size: 26, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Phase & Timeline', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
          }),
          new TableCell({
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            borders: cellBorders,
            width: { size: 44, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Scope & Key Deliverables', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
          }),
          new TableCell({
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            borders: cellBorders,
            width: { size: 15, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Cost (India/Remote)', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
          }),
          new TableCell({
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            borders: cellBorders,
            width: { size: 15, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Cost (US/EU Agency)', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
          })
        ]
      })
    ];

    timelinePhases.forEach((p, idx) => {
      const isAlt = idx % 2 === 1;
      timelineRows.push(
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
              children: [
                new Paragraph({ children: [new TextRun({ text: p.phase, bold: true, size: 17, font: 'Segoe UI' })] }),
                new Paragraph({ children: [new TextRun({ text: p.weeks, size: 15, color: '2563EB', font: 'Segoe UI' })] })
              ]
            }),
            new TableCell({
              borders: cellBorders,
              shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: p.scope, size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              borders: cellBorders,
              shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: p.indiaBudget, bold: true, size: 16, color: '059669', font: 'Segoe UI' })] })]
            }),
            new TableCell({
              borders: cellBorders,
              shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: p.usBudget, size: 16, color: '64748B', font: 'Segoe UI' })] })]
            })
          ]
        })
      );
    });

    // Total Engineering Investment
    timelineRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            shading: { fill: 'F3E8FF', type: ShadingType.CLEAR },
            columnSpan: 2,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'TOTAL 15-WEEK ESTIMATED ENGINEERING INVESTMENT', bold: true, size: 17, color: '6B21A8', font: 'Segoe UI' })
                ]
              })
            ]
          }),
          new TableCell({
            borders: cellBorders,
            shading: { fill: 'F3E8FF', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: '$18,500 – $27,500', bold: true, size: 18, color: '6B21A8', font: 'Segoe UI' })] })]
          }),
          new TableCell({
            borders: cellBorders,
            shading: { fill: 'F3E8FF', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: '$75,000 – $110,000', bold: true, size: 17, color: '64748B', font: 'Segoe UI' })] })]
          })
        ]
      })
    );

    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: timelineRows
      }),
      new Paragraph({ spacing: { after: 360 } })
    );
  }

  // ==========================================
  // SECTION 5: DATABASE SCHEMA & DATA FLOW
  // ==========================================
  if (includeDatabaseSchema) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 140 },
        children: [new TextRun({ text: '5. PostgreSQL Relational Schema & Storage Architecture', bold: true, size: 28, color: '1E3A8A', font: 'Segoe UI' })]
      }),
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: 'The database tier is architected for strict ACID transactional consistency, relational referential integrity, and high-performance querying on semi-structured medical equipment attributes via JSONB columns.',
            size: 20,
            font: 'Segoe UI'
          })
        ]
      })
    );

    const schemaTables = [
      {
        table: 'users',
        description: 'Identity accounts for Hospital Owners, Medical Vendors, Turnkey Advisors, and Super Admins.',
        columns: 'id (UUID PK), role (enum), email (varchar unique), phone (varchar E.164), company_name (varchar), verification_status (enum), created_at (timestamptz)'
      },
      {
        table: 'project_rfps',
        description: 'Hospital construction & equipment tenders, stages 1 through 15 with BoQ requirements.',
        columns: 'id (UUID PK), promoter_id (UUID FK), hospital_name (varchar), stage_id (varchar), bed_capacity (int), budget_min/max (bigint), status (varchar), boq_schema (JSONB)'
      },
      {
        table: 'vendor_quotations',
        description: 'Commercial quotes submitted by verified manufacturers, with cryptographic sealed bidding flags.',
        columns: 'id (UUID PK), rfp_id (UUID FK), vendor_id (UUID FK), bid_amount (bigint), delivery_weeks (int), is_sealed (boolean), sealed_until (timestamptz), quote_items (JSONB)'
      },
      {
        table: 'mjml_templates',
        description: 'Visual email designs authored in the MJML Studio and compiled to cross-client responsive HTML.',
        columns: 'id (varchar PK), title (varchar), subject_line (varchar), blocks_ast (JSONB), compiled_html (text), created_by (UUID FK)'
      },
      {
        table: 'whatsapp_sessions',
        description: 'Persistent conversation state machines tracking hospital owners and vendor interactive replies.',
        columns: 'id (UUID PK), phone_hash (varchar indexed), current_node_id (varchar), flow_state (JSONB), last_message_at (timestamptz)'
      },
      {
        table: 'document_attachments',
        description: 'Metadata records for architectural drawings, equipment catalogs, and NABH compliance documents.',
        columns: 'id (UUID PK), r2_object_key (text), file_name (varchar), file_size_bytes (bigint), mime_type (varchar), is_virus_scanned (boolean)'
      }
    ];

    const schemaRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            borders: cellBorders,
            width: { size: 22, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Table Name', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
          }),
          new TableCell({
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            borders: cellBorders,
            width: { size: 36, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Business Role & Relationships', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
          }),
          new TableCell({
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            borders: cellBorders,
            width: { size: 42, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Core Columns & Types', bold: true, color: 'FFFFFF', size: 17, font: 'Segoe UI' })] })]
          })
        ]
      })
    ];

    schemaTables.forEach((st, idx) => {
      const isAlt = idx % 2 === 1;
      schemaRows.push(
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: st.table, bold: true, size: 16, font: 'Consolas' })] })]
            }),
            new TableCell({
              borders: cellBorders,
              shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: st.description, size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              borders: cellBorders,
              shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: st.columns, size: 14, color: '475569', font: 'Consolas' })] })]
            })
          ]
        })
      );
    });

    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: schemaRows
      }),
      new Paragraph({ spacing: { after: 360 } })
    );
  }

  // ==========================================
  // SECTION 6: HEALTHCARE SECURITY & COMPLIANCE
  // ==========================================
  if (includeSecurityCompliance) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 140 },
        children: [new TextRun({ text: '6. Healthcare Compliance, Sealed Bidding & Security Governance', bold: true, size: 28, color: '1E3A8A', font: 'Segoe UI' })]
      }),
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: 'Given the sensitive commercial valuation of multi-crore medical equipment tenders and hospital architectural blueprints, NOVA-H implements defense-in-depth protections aligned with NABH, ISO 27001, and Indian Digital Personal Data Protection (DPDP) standards.',
            size: 20,
            font: 'Segoe UI'
          })
        ]
      })
    );

    const securityItems = [
      {
        title: 'Cryptographic Sealed Bidding',
        body: 'Quotation amounts submitted by equipment manufacturers are encrypted with an asymmetric public key upon submission. Private decryption keys are stored in hardware security module (HSM) escrow and only unlocked when the tender window officially closes, eliminating bid-leakage and favoritism.'
      },
      {
        title: 'Zero-Trust File Uploads & Antivirus Pipeline',
        body: 'Uploaded CAD drawings, equipment BoQ Excel sheets, and vendor compliance certificates stream directly to an isolated temporary bucket via pre-signed URLs. An asynchronous ClamAV scanner inspects all binaries before promoting files to the production Cloudflare R2 bucket.'
      },
      {
        title: 'Sovereign Indian Cloud Residency & Encryption',
        body: 'All database records and file artifacts reside exclusively within the AWS Mumbai (ap-south-1) region. Data at rest is encrypted via AES-256 with customer-managed keys (AWS KMS), and in-transit traffic is secured via modern TLS 1.3 ciphers with strict HSTS enforcement.'
      },
      {
        title: 'Immutable Append-Only Audit Trail',
        body: 'Every quotation submission, administrative user impersonation, price change, and WhatsApp webhook event is recorded in an immutable audit ledger with caller IP addresses, timestamps, and SHA-256 hash chains, ensuring evidentiary traceability.'
      }
    ];

    securityItems.forEach((si) => {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({ text: `✔ ${si.title}`, bold: true, size: 20, color: '059669', font: 'Segoe UI' })
          ]
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: si.body, size: 18, color: '334155', font: 'Segoe UI' })
          ]
        })
      );
    });

    docChildren.push(new Paragraph({ spacing: { after: 240 } }));
  }

  // ==========================================
  // DOCUMENT FOOTER / SIGN-OFF
  // ==========================================
  docChildren.push(
    new Paragraph({
      spacing: { before: 200, after: 60 },
      children: [
        new TextRun({
          text: 'Prepared by NOVA-H Systems Architecture & Cloud Infrastructure Working Group.',
          bold: true,
          size: 18,
          color: '475569',
          font: 'Segoe UI'
        })
      ]
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: 'Confidential — For Internal Engineering & Hospital Executive Planning.',
          italics: true,
          size: 16,
          color: '94A3B8',
          font: 'Segoe UI'
        })
      ]
    })
  );

  // Create docx Document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Segoe UI', size: 20, color: '1E293B' },
          paragraph: { spacing: { after: 120, line: 276 } }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'NOVA-H Architecture & Cost Specification', size: 16, color: '94A3B8', font: 'Segoe UI' })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'Page ', size: 16, color: '94A3B8', font: 'Segoe UI' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '94A3B8', font: 'Segoe UI' }),
                  new TextRun({ text: ' of ', size: 16, color: '94A3B8', font: 'Segoe UI' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: '94A3B8', font: 'Segoe UI' })
                ]
              })
            ]
          })
        },
        children: docChildren
      }
    ]
  });

  // Pack to Blob and Trigger Browser Download
  const blob = await Packer.toBlob(doc);
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}
