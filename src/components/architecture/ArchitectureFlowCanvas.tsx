import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Edge,
  Node,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ArchitectureNode, ArchCategory, ArchNodeData, CanvasThemeMode } from './ArchitectureNode';
import { DownloadDiagramModal } from './DownloadDiagramModal';
import { exportFlowAsPng, ExportTheme } from '../../utils/xyflowExport';
import { generateArchitectureAndCostDocx } from '../../utils/generateArchitectureDocx';
import { useTheme } from '../../context/ThemeContext';
import { 
  Filter, 
  Maximize2, 
  Minimize2,
  RotateCcw, 
  ShieldCheck, 
  Layers, 
  Info, 
  Check, 
  Copy, 
  ExternalLink, 
  Terminal,
  Activity,
  Zap,
  Sparkles,
  Server,
  Database,
  HardDrive,
  Mail,
  MessageSquare,
  Globe,
  Download,
  FileImage,
  FileText,
  Loader2,
  Sun,
  Moon,
  Palette,
  Monitor,
  PanelRightClose,
  PanelRightOpen,
  ChevronDown,
  X
} from 'lucide-react';

const nodeTypes = {
  archNode: ArchitectureNode,
};

export interface NodeDetailSpec {
  id: string;
  title: string;
  category: ArchCategory;
  role: string;
  techStack: string;
  throughput: string;
  sla: string;
  security: string[];
  codeSample: string;
}

const NODE_DETAILS: Record<string, NodeDetailSpec> = {
  client_web: {
    id: 'client_web',
    title: 'Web Application Clients',
    category: 'client',
    role: 'Responsive React 19 Single Page App used by Hospital Promoters, Vendors, Architects, and System Admins.',
    techStack: 'React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons',
    throughput: 'Client-side SPA caching; zero server rendering latency',
    sla: '100% via Global CDN',
    security: [
      'Content Security Policy (CSP) headers',
      'JWT tokens stored in HttpOnly secure cookies',
      'Client-side sanitization against XSS attacks'
    ],
    codeSample: `// Client-side authenticated fetch wrapper
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(\`/api/v1\${endpoint}\`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // HttpOnly cookie exchange
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}`
  },
  client_whatsapp: {
    id: 'client_whatsapp',
    title: 'WhatsApp Mobile Clients',
    category: 'client',
    role: 'Medical vendors and hospital owners receiving instant RFQs, submitting quote confirmations, and managing leads directly on WhatsApp.',
    techStack: 'Native WhatsApp iOS & Android Client (Meta WABA)',
    throughput: '80+ messages/second batch throughput',
    sla: '99.9% Meta Global Uptime',
    security: [
      'End-to-End Encryption on client-to-Meta leg',
      'Meta Business Verified Account (Green Tick Badge)',
      'Strict 24-hour customer service window timeout'
    ],
    codeSample: `// Sample interactive WhatsApp message sent to Hospital Owner
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "919876543210",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "header": { "type": "text", "text": "New Vendor Quotation Received" },
    "body": { "text": "Siemens Healthineers submitted a sealed bid for MRI 3.0T Tender #RFP-2026-08." },
    "action": {
      "buttons": [
        { "type": "reply", "reply": { "id": "view_quote", "title": "View Comparison" } },
        { "type": "reply", "reply": { "id": "schedule_call", "title": "Request Demo" } }
      ]
    }
  }
}`
  },
  edge_cloudflare: {
    id: 'edge_cloudflare',
    title: 'Cloudflare Enterprise Edge & WAF',
    category: 'edge',
    role: 'Global reverse proxy, DDoS mitigation layer, SSL termination, and static asset caching across 310+ cities.',
    techStack: 'Cloudflare Enterprise + TLS 1.3 + Anycast DNS + Page Shield',
    throughput: 'Unmetered L7 DDoS defense up to 50+ Gbps',
    sla: '100% Cloudflare Edge SLA',
    security: [
      'Automated Layer 3/4/7 DDoS attack filtering',
      'TLS 1.3 with strict modern cipher suites (HSTS enforced)',
      'Scraping bot mitigation for medical equipment pricing databases'
    ],
    codeSample: `// Cloudflare WAF Ruleset Configuration
// 1. Block malicious scrapers targeting /api/v1/directory
(http.request.uri.path contains "/api/v1/directory" and cf.threat_score gt 25) => Block

// 2. Strict Rate Limiting on authentication endpoints
(http.request.uri.path eq "/api/v1/auth/login") => RateLimit(10 req / 60 sec per IP)`
  },
  api_gateway: {
    id: 'api_gateway',
    title: 'Fastify API Gateway',
    category: 'gateway',
    role: 'High-speed Node.js API Gateway handling user authentication, CORS policies, request validation, and micro-routing.',
    techStack: 'Node.js 22 LTS + Fastify + TypeScript + Zod schema validation',
    throughput: '35,000+ requests/sec per 4-core container',
    sla: '99.95% High Availability',
    security: [
      '@fastify/helmet with hardened headers',
      '@fastify/rate-limit with sliding window Redis counter',
      'JSON Schema validation preventing injection payloads'
    ],
    codeSample: `import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';

const server = Fastify({ logger: true });

await server.register(rateLimit, {
  max: 200,
  timeWindow: '1 minute',
  redis: redisClient
});

server.register(jwt, { secret: process.env.JWT_SECRET! });

server.get('/api/v1/healthz', async () => ({ status: 'healthy', timestamp: Date.now() }));`
  },
  webhook_ingest: {
    id: 'webhook_ingest',
    title: 'Meta Webhook Receiver',
    category: 'gateway',
    role: 'Receives and authenticates incoming WhatsApp events, status updates, and interactive button clicks from Meta Cloud API.',
    techStack: 'Fastify raw body hook + HMAC SHA-256 signature verification',
    throughput: '1,500 webhooks/second burst ingestion',
    sla: '99.99%',
    security: [
      'X-Hub-Signature-256 cryptographic verification',
      'Idempotency tokens stored in Redis to prevent replay attacks',
      'Immediate HTTP 200 response with async job offload to BullMQ'
    ],
    codeSample: `// Verify Meta Webhook cryptographic signature
function verifyMetaSignature(payload: string, signature: string, appSecret: string): boolean {
  const hash = crypto.createHmac('sha256', appSecret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(\`sha256=\${hash}\`), Buffer.from(signature));
}`
  },
  service_procurement: {
    id: 'service_procurement',
    title: 'Procurement & Sealed BoQ Engine',
    category: 'service',
    role: 'Core business logic for 15 hospital construction stages, multi-vendor equipment tenders, sealed bids, and comparative price matrices.',
    techStack: 'TypeScript + Drizzle ORM + PostgreSQL ACID transactions',
    throughput: 'Sub-40ms execution time for tender comparisons',
    sla: '99.95%',
    security: [
      'Sealed Bidding Encryption: Vendor quotes cryptographically hidden until tender deadline passes',
      'Multi-tenant project isolation (promoter_id scoping)',
      'Immutable audit trail for all quotation revisions'
    ],
    codeSample: `// Sealed quotation submission with cryptographic deadline enforcement
export async function submitVendorBid(rfpId: string, vendorId: string, boqItems: BoqQuote[]) {
  return await db.transaction(async (tx) => {
    const rfp = await tx.query.rfps.findFirst({ where: eq(rfps.id, rfpId) });
    if (new Date() > rfp.deadline) throw new Error("RFP bidding window closed");
    
    return await tx.insert(quotations).values({
      rfpId,
      vendorId,
      status: 'sealed_bid',
      boqData: boqItems,
      sealedUntil: rfp.deadline
    });
  });
}`
  },
  service_whatsapp: {
    id: 'service_whatsapp',
    title: 'WhatsApp Flow Executor',
    category: 'service',
    role: 'Executes interactive node trees designed in the WhatsApp Flow Builder, maintaining session states and conversation transitions.',
    techStack: 'Node.js Graph State Machine + Redis Session Store',
    throughput: '5,000 active state transitions/min',
    sla: '99.9%',
    security: [
      'Session expiration after 24 hours of inactivity',
      'Sanitized user text inputs against prompt injection',
      'Rate-limiting outbound replies per user'
    ],
    codeSample: `// WhatsApp Flow Node Graph State Machine
export async function handleWhatsAppMessage(from: string, userText: string, buttonId?: string) {
  const session = await redis.get(\`wa:session:\${from}\`);
  const currentNode = session ? JSON.parse(session).currentNodeId : 'start_welcome';
  
  // Transition logic based on user input
  const nextNode = resolveNextNode(currentNode, buttonId || userText);
  await redis.setex(\`wa:session:\${from}\`, 86400, JSON.stringify({ currentNodeId: nextNode.id }));
  
  // Enqueue dispatch to Meta Cloud API
  await whatsappQueue.add('send_message', { to: from, node: nextNode });
}`
  },
  service_mjml: {
    id: 'service_mjml',
    title: 'MJML Email Transpiler & Studio',
    category: 'service',
    role: 'Transpiles dynamic email schema blocks into compliant, bulletproof responsive HTML with Outlook MSO fallbacks.',
    techStack: 'mjml-core + Cheerio HTML minifier + Handlebars template engine',
    throughput: '120 emails transpiled / second per worker core',
    sla: '99.95%',
    security: [
      'Strict CSS and HTML sanitization preventing XSS in email clients',
      'Unsubscribe header injection (RFC 8058 compliant)',
      'Dynamic token injection with escaped parameters'
    ],
    codeSample: `import mjml2html from 'mjml';

export function compileHospitalEmail(blocks: MjmlBlock[], variables: Record<string, string>) {
  const mjmlXml = generateMjmlXml(blocks, variables);
  const { html, errors } = mjml2html(mjmlXml, {
    keepComments: false,
    minify: true,
    validationLevel: 'soft'
  });
  if (errors.length > 0) console.warn('MJML compilation warnings:', errors);
  return html;
}`
  },
  service_auth: {
    id: 'service_auth',
    title: 'Multi-Role RBAC & Auth Service',
    category: 'service',
    role: 'Manages identity, authentication credentials, permission matrices, and organization workspaces for 4 key roles.',
    techStack: 'Argon2id password hashing + JWT + Redis Token Blacklist',
    throughput: 'Sub-5ms token verification with in-memory caching',
    sla: '99.99%',
    security: [
      'Argon2id password hashing (OWASP recommended)',
      'Role-based Access Control (Promoters, Vendors, Advisors, Admins)',
      'Impersonation audit trails with admin session stamps'
    ],
    codeSample: `// Role-based Access Control middleware
export function requireRole(allowedRoles: UserRole[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as AuthUser;
    if (!allowedRoles.includes(user.role)) {
      return reply.status(403).send({ error: 'Unauthorized: insufficient permissions' });
    }
  };
}`
  },
  queue_bullmq: {
    id: 'queue_bullmq',
    title: 'Redis 7 & BullMQ Async Queue',
    category: 'queue',
    role: 'Asynchronous task queue managing delayed jobs, rate-limited email dispatches, WhatsApp outbound throttlers, and PDF thumbnail generation.',
    techStack: 'Redis 7 Cluster + BullMQ + Node.js Worker Threads',
    throughput: '10,000+ jobs processed / minute with concurrency controls',
    sla: '99.95%',
    security: [
      'TLS encrypted Redis connections (in-transit encryption)',
      'Exponential backoff retry policy (5 retries with dead-letter queue)',
      'Job data sanitation preventing secret leakage in failure logs'
    ],
    codeSample: `import { Queue, Worker } from 'bullmq';

export const emailQueue = new Queue('email_dispatch', { connection: redisConfig });

// Worker with rate-limiting (max 50 emails/sec to protect Amazon SES sender reputation)
const emailWorker = new Worker('email_dispatch', async (job) => {
  const { to, subject, html } = job.data;
  await sesClient.send(new SendEmailCommand({ ... }));
}, {
  connection: redisConfig,
  limiter: { max: 50, duration: 1000 }
});`
  },
  db_postgres: {
    id: 'db_postgres',
    title: 'PostgreSQL 16 Multi-AZ',
    category: 'database',
    role: 'Primary ACID transactional database storing hospital projects, equipment specifications, sealed bids, user accounts, and audit events.',
    techStack: 'PostgreSQL 16 + Drizzle ORM + pgBouncer connection pooling',
    throughput: '8,000 queries/sec with read replicas & index optimization',
    sla: '99.99% Multi-AZ with automatic failover in < 30s',
    security: [
      'AES-256 storage encryption at rest (AWS KMS)',
      'Daily automated snapshots + 30-day Point-in-Time Recovery (PITR)',
      'Column-level encryption for sensitive commercial payment terms'
    ],
    codeSample: `// Drizzle ORM Schema definition for Hospital Equipment BoQ
export const projectRfps = pgTable('project_rfps', {
  id: uuid('id').defaultRandom().primaryKey(),
  promoterId: uuid('promoter_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  stage: varchar('stage', { length: 50 }).notNull(),
  boqSpecs: jsonb('boq_specs').notNull(), // JSONB allows flexible medical equipment line items
  budgetEstimated: numeric('budget_estimated', { precision: 12, scale: 2 }),
  status: varchar('status', { length: 30 }).default('draft'),
  deadline: timestamp('deadline').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});`
  },
  storage_r2: {
    id: 'storage_r2',
    title: 'Cloudflare R2 Object Vault',
    category: 'storage',
    role: 'Stores hospital architectural CAD drawings, vendor equipment catalogs, compliance certificates (NABH/ISO), and generated MJML HTML assets.',
    techStack: 'Cloudflare R2 + AWS S3 API SDK + Pre-Signed URLs',
    throughput: 'Zero egress fees; up to 10 Gbps global download speed',
    sla: '99.999999999% (11 9s) Data Durability',
    security: [
      'Direct browser-to-R2 pre-signed PUT URLs (bypasses application server)',
      'Temporary time-restricted pre-signed GET URLs (15-minute expiry)',
      'Server-side AES-256 object encryption'
    ],
    codeSample: `import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: \`https://\${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com\`,
  credentials: { accessKeyId: process.env.R2_KEY!, secretAccessKey: process.env.R2_SECRET! }
});

// Generate pre-signed URL for direct browser upload
export async function getUploadUrl(hospitalId: string, filename: string) {
  const key = \`hospitals/\${hospitalId}/drawings/\${Date.now()}-\${filename}\`;
  const command = new PutObjectCommand({ Bucket: 'novah-vault', Key: key });
  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 900 });
  return { uploadUrl, fileKey: key };
}`
  },
  ext_ses: {
    id: 'ext_ses',
    title: 'Amazon SES Email Relay',
    category: 'external',
    role: 'Dispatches high-volume transactional notifications, RFP invitations, and broadcast newsletters designed in MJML Studio.',
    techStack: 'Amazon Simple Email Service (SES) + Dedicated IP + DKIM/SPF/DMARC',
    throughput: 'Up to 200 emails / second; $0.10 per 1,000 emails',
    sla: '99.9% AWS Deliverability',
    security: [
      'DKIM 2048-bit cryptographic domain signing',
      'DMARC policy (p=reject) preventing email spoofing',
      'Automated bounce and spam complaint webhook feedback loops'
    ],
    codeSample: `// Amazon SES v2 SendEmailCommand payload
const params = {
  FromEmailAddress: 'NOVA-H Procurement <procurement@nova-h.in>',
  Destination: { ToAddresses: ['promoter@apollo-health.com'] },
  Content: {
    Simple: {
      Subject: { Data: 'New Quotation Received for 128-Slice CT Scanner' },
      Body: { Html: { Data: compiledMjmlHtml } }
    }
  }
};`
  },
  ext_meta: {
    id: 'ext_meta',
    title: 'Meta WhatsApp Cloud API',
    category: 'external',
    role: 'Official WhatsApp Business Platform sending interactive flows, dynamic templates, catalog messages, and vendor notifications.',
    techStack: 'Meta Graph API v21.0 + Official Business Account (WABA)',
    throughput: '80 messages / second official Cloud API throughput',
    sla: '99.9% Meta Core Infrastructure',
    security: [
      'System User Permanent Access Tokens with granular permissions',
      'End-to-end webhook validation',
      'Meta-approved template pre-registration'
    ],
    codeSample: `// Outbound interactive message to Meta Graph API
await fetch(\`https://graph.facebook.com/v21.0/\${process.env.WABA_PHONE_ID}/messages\`, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.META_ACCESS_TOKEN}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(whatsappInteractivePayload)
});`
  },
  ext_sentry: {
    id: 'ext_sentry',
    title: 'Sentry & APM Observability',
    category: 'external',
    role: 'Real-time distributed tracing, performance monitoring, uncaught error tracking, and database query latency profiling.',
    techStack: 'Sentry Node.js SDK + OpenTelemetry + BetterStack Uptime Alerts',
    throughput: '100% trace sampling on errors; 10% on high-volume HTTP',
    sla: '99.9%',
    security: [
      'Automated PII scrubbing (removes passwords, credit cards, patient data)',
      'Data residency in compliance with healthcare data protection',
      'Immediate Slack & PagerDuty alerts for fatal API exceptions'
    ],
    codeSample: `import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Scrub sensitive hospital promoter contact numbers
    if (event.request?.data) {
      delete event.request.data.password;
    }
    return event;
  }
});`
  }
};

// Initial layout nodes for XYFlow
const INITIAL_NODES: Node[] = [
  // LAYER 0: Clients (Y: 30)
  {
    id: 'client_web',
    type: 'archNode',
    position: { x: 140, y: 30 },
    data: {
      label: 'Web Application Clients',
      sublabel: 'React 19 SPA for Promoters, Vendors & Admins',
      category: 'client',
      tech: 'React 19 + Vite',
      throughput: 'SPA Cache',
      badge: 'Tier 0',
      flowTags: ['rfp', 'mjml', 'storage'],
      activeFlowFilter: 'all',
      isSelected: false
    }
  },
  {
    id: 'client_whatsapp',
    type: 'archNode',
    position: { x: 540, y: 30 },
    data: {
      label: 'WhatsApp Mobile Clients',
      sublabel: 'Promoters & Vendors receiving RFP leads',
      category: 'client',
      tech: 'WhatsApp Mobile App',
      throughput: '80 msgs/sec',
      badge: 'Tier 0',
      flowTags: ['whatsapp'],
      activeFlowFilter: 'all',
      isSelected: false
    }
  },

  // LAYER 1: Edge & Ingestion (Y: 190)
  {
    id: 'edge_cloudflare',
    type: 'archNode',
    position: { x: 340, y: 190 },
    data: {
      label: 'Cloudflare WAF & Edge',
      sublabel: 'DDoS Shield, TLS 1.3, Rate Limiting & CDN',
      category: 'edge',
      tech: 'Cloudflare Enterprise',
      throughput: '50+ Gbps Shield',
      badge: 'Edge Layer',
      flowTags: ['rfp', 'whatsapp', 'mjml', 'storage'],
      activeFlowFilter: 'all',
      isSelected: false
    }
  },

  // LAYER 2: API Gateways (Y: 350)
  {
    id: 'api_gateway',
    type: 'archNode',
    position: { x: 140, y: 350 },
    data: {
      label: 'Fastify API Gateway',
      sublabel: 'Auth, CORS, Zod validation & micro-routing',
      category: 'gateway',
      tech: 'Node.js 22 + Fastify',
      throughput: '35,000 req/s',
      badge: 'API Gateway',
      flowTags: ['rfp', 'mjml', 'storage'],
      activeFlowFilter: 'all',
      isSelected: false
    }
  },
  {
    id: 'webhook_ingest',
    type: 'archNode',
    position: { x: 540, y: 350 },
    data: {
      label: 'Meta Webhook Receiver',
      sublabel: 'HMAC signature verification & idempotency',
      category: 'gateway',
      tech: 'Fastify Webhook Hook',
      throughput: '1,500 hook/s',
      badge: 'Webhooks',
      flowTags: ['whatsapp'],
      activeFlowFilter: 'all',
      isSelected: false
    }
  },

  // LAYER 3: Core Domain Engines (Y: 520)
  {
    id: 'service_procurement',
    type: 'archNode',
    position: { x: 20, y: 520 },
    data: {
      label: 'Procurement & BoQ Engine',
      sublabel: 'Sealed bidding, quotation matrix & audits',
      category: 'service',
      tech: 'TypeScript + Drizzle',
      throughput: 'Sub-40ms queries',
      badge: 'Core RFP',
      flowTags: ['rfp'],
      activeFlowFilter: 'all',
      isSelected: false
    }
  },
  {
    id: 'service_auth',
    type: 'archNode',
    position: { x: 300, y: 520 },
    data: {
      label: 'Multi-Role RBAC & Auth',
      sublabel: 'Promoter, Vendor, Advisor & Admin sessions',
      category: 'service',
      tech: 'JWT + Argon2id',
      throughput: 'Sub-5ms verify',
      badge: 'Identity',
      flowTags: ['rfp', 'mjml', 'storage'],
      activeFlowFilter: 'all',
      isSelected: false
    }
  },
  {
    id: 'service_whatsapp',
    type: 'archNode',
    position: { x: 580, y: 520 },
    data: {
      label: 'WhatsApp Flow Executor',
      sublabel: 'Dynamic node state machine & 24h window',
      category: 'service',
      tech: 'State Machine + Redis',
      throughput: '5k state/min',
      badge: 'Automations',
      flowTags: ['whatsapp'],
      activeFlowFilter: 'all',
      isSelected: false
    }
  },
  {
    id: 'service_mjml',
    type: 'archNode',
    position: { x: 860, y: 520 },
    data: {
      label: 'MJML Email Transpiler',
      sublabel: 'Schema blocks to responsive HTML with MSO',
      category: 'service',
      tech: 'mjml-core + Cheerio',
      throughput: '120 emails/s',
      badge: 'Email Engine',
      flowTags: ['mjml'],
      activeFlowFilter: 'all',
      isSelected: false
    }
  },

  // LAYER 4: Queues & Async Processing (Y: 700)
  {
    id: 'queue_bullmq',
    type: 'archNode',
    position: { x: 580, y: 700 },
    data: {
      label: 'Redis 7 & BullMQ Workers',
      sublabel: 'Async batch emails, WhatsApp dispatch & throttling',
      category: 'queue',
      tech: 'Redis 7 + BullMQ',
      throughput: '10k jobs/min',
      badge: 'Async Workers',
      flowTags: ['whatsapp', 'mjml'],
      activeFlowFilter: 'all',
      isSelected: false
    }
  },

  // LAYER 5: Data & Storage Tier (Y: 880)
  {
    id: 'db_postgres',
    type: 'archNode',
    position: { x: 160, y: 880 },
    data: {
      label: 'PostgreSQL 16 (Multi-AZ)',
      sublabel: 'ACID transactions, JSONB BoQ specs, read replicas',
      category: 'database',
      tech: 'Postgres 16 + Drizzle',
      throughput: '8,000 QPS',
      badge: 'Primary DB',
      flowTags: ['rfp', 'whatsapp', 'mjml'],
      activeFlowFilter: 'all',
      isSelected: false
    }
  },
  {
    id: 'storage_r2',
    type: 'archNode',
    position: { x: 440, y: 880 },
    data: {
      label: 'Cloudflare R2 Object Store',
      sublabel: 'Hospital CAD blueprints, BoQ PDFs ($0 egress)',
      category: 'storage',
      tech: 'Cloudflare R2 + S3 API',
      throughput: 'Zero Egress Fees',
      badge: 'File Vault',
      flowTags: ['rfp', 'storage'],
      activeFlowFilter: 'all',
      isSelected: false
    }
  },

  // LAYER 6: External Third-Party Gateways (Y: 1060)
  {
    id: 'ext_meta',
    type: 'archNode',
    position: { x: 740, y: 1060 },
    data: {
      label: 'Meta WhatsApp Cloud API',
      sublabel: 'Official WABA Gateway for outbound interactive flows',
      category: 'external',
      tech: 'Meta Graph API v21',
      throughput: '80 msgs/s',
      badge: 'Meta Gateway',
      flowTags: ['whatsapp'],
      activeFlowFilter: 'all',
      isSelected: false
    }
  },
  {
    id: 'ext_ses',
    type: 'archNode',
    position: { x: 440, y: 1060 },
    data: {
      label: 'Amazon SES Email Relay',
      sublabel: 'High deliverability transactional & broadcast email',
      category: 'external',
      tech: 'AWS SES v2 + DKIM',
      throughput: '$0.10 / 1k emails',
      badge: 'Email Gateway',
      flowTags: ['mjml'],
      activeFlowFilter: 'all',
      isSelected: false
    }
  },
  {
    id: 'ext_sentry',
    type: 'archNode',
    position: { x: 140, y: 1060 },
    data: {
      label: 'Sentry APM & Observability',
      sublabel: 'Distributed tracing, latency profiling & error alerts',
      category: 'external',
      tech: 'Sentry SDK + APM',
      throughput: 'Real-time Alerts',
      badge: 'Observability',
      flowTags: ['rfp', 'whatsapp', 'mjml', 'storage'],
      activeFlowFilter: 'all',
      isSelected: false
    }
  }
];

// Initial edges connecting the system topology
const INITIAL_EDGES: Edge[] = [
  // Web client to Cloudflare Edge
  {
    id: 'e_web_edge',
    source: 'client_web',
    target: 'edge_cloudflare',
    animated: true,
    label: 'HTTPS / TLS 1.3',
    style: { stroke: '#0284c7', strokeWidth: 2 },
    data: { flowTags: ['rfp', 'mjml', 'storage'] },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0284c7' }
  },
  // WhatsApp client to Meta and Cloudflare
  {
    id: 'e_wa_meta',
    source: 'client_whatsapp',
    target: 'edge_cloudflare',
    animated: true,
    label: 'Meta Webhooks',
    style: { stroke: '#10b981', strokeWidth: 2 },
    data: { flowTags: ['whatsapp'] },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }
  },
  // Cloudflare to Fastify API Gateway
  {
    id: 'e_edge_api',
    source: 'edge_cloudflare',
    target: 'api_gateway',
    animated: true,
    label: 'Filtered Traffic',
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    data: { flowTags: ['rfp', 'mjml', 'storage'] },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
  },
  // Cloudflare to Webhook Receiver
  {
    id: 'e_edge_webhook',
    source: 'edge_cloudflare',
    target: 'webhook_ingest',
    animated: true,
    label: 'Signed POST',
    style: { stroke: '#10b981', strokeWidth: 2 },
    data: { flowTags: ['whatsapp'] },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }
  },
  // API Gateway to Procurement Service
  {
    id: 'e_api_procurement',
    source: 'api_gateway',
    target: 'service_procurement',
    animated: true,
    label: 'RFP & Quotes',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    data: { flowTags: ['rfp'] },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
  },
  // API Gateway to Auth
  {
    id: 'e_api_auth',
    source: 'api_gateway',
    target: 'service_auth',
    animated: true,
    label: 'JWT Session',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    data: { flowTags: ['rfp', 'mjml', 'storage'] },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
  },
  // API Gateway to MJML Service
  {
    id: 'e_api_mjml',
    source: 'api_gateway',
    target: 'service_mjml',
    animated: true,
    label: 'Email AST',
    style: { stroke: '#8b5cf6', strokeWidth: 2 },
    data: { flowTags: ['mjml'] },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' }
  },
  // Webhook Receiver to WhatsApp Executor
  {
    id: 'e_webhook_wa',
    source: 'webhook_ingest',
    target: 'service_whatsapp',
    animated: true,
    label: 'Validated Event',
    style: { stroke: '#10b981', strokeWidth: 2 },
    data: { flowTags: ['whatsapp'] },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }
  },
  // Procurement to PostgreSQL
  {
    id: 'e_proc_db',
    source: 'service_procurement',
    target: 'db_postgres',
    animated: true,
    label: 'ACID Transactions',
    style: { stroke: '#10b981', strokeWidth: 2.5 },
    data: { flowTags: ['rfp'] },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }
  },
  // Procurement to Cloudflare R2 (Signed URLs)
  {
    id: 'e_proc_r2',
    source: 'service_procurement',
    target: 'storage_r2',
    animated: true,
    label: 'Presigned URLs',
    style: { stroke: '#06b6d4', strokeWidth: 2 },
    data: { flowTags: ['rfp', 'storage'] },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' }
  },
  // Auth to PostgreSQL
  {
    id: 'e_auth_db',
    source: 'service_auth',
    target: 'db_postgres',
    animated: true,
    label: 'User Credentials',
    style: { stroke: '#10b981', strokeWidth: 1.5 },
    data: { flowTags: ['rfp', 'mjml', 'storage'] },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }
  },
  // WhatsApp Service to BullMQ Queue
  {
    id: 'e_wa_queue',
    source: 'service_whatsapp',
    target: 'queue_bullmq',
    animated: true,
    label: 'Outbound Queue',
    style: { stroke: '#f59e0b', strokeWidth: 2 },
    data: { flowTags: ['whatsapp'] },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' }
  },
  // MJML Service to BullMQ Queue
  {
    id: 'e_mjml_queue',
    source: 'service_mjml',
    target: 'queue_bullmq',
    animated: true,
    label: 'Batch Jobs',
    style: { stroke: '#f59e0b', strokeWidth: 2 },
    data: { flowTags: ['mjml'] },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' }
  },
  // BullMQ to Amazon SES
  {
    id: 'e_queue_ses',
    source: 'queue_bullmq',
    target: 'ext_ses',
    animated: true,
    label: 'Rate-Limited Relay',
    style: { stroke: '#ec4899', strokeWidth: 2 },
    data: { flowTags: ['mjml'] },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' }
  },
  // BullMQ to Meta WhatsApp API
  {
    id: 'e_queue_meta',
    source: 'queue_bullmq',
    target: 'ext_meta',
    animated: true,
    label: 'Graph API Calls',
    style: { stroke: '#10b981', strokeWidth: 2 },
    data: { flowTags: ['whatsapp'] },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }
  },
  // API Gateway to Sentry APM
  {
    id: 'e_api_sentry',
    source: 'api_gateway',
    target: 'ext_sentry',
    animated: false,
    label: 'Tracing & Telemetry',
    style: { stroke: '#f43f5e', strokeWidth: 1.5, strokeDasharray: '4 4' },
    data: { flowTags: ['rfp', 'whatsapp', 'mjml', 'storage'] },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' }
  }
];

export type XYFlowThemeOption = 'dark' | 'light' | 'blueprint' | 'midnight' | 'system';

interface ThemeDefinition {
  canvasBg: string;
  canvasBgHex: string;
  gridColor: string;
  gridVariant: BackgroundVariant;
  gridGap: number;
  gridSize: number;
  headerBg: string;
  headerBorder: string;
  headerText: string;
  subText: string;
  panelBg: string;
  panelBorder: string;
  panelText: string;
  controlsClass: string;
  minimapBg: string;
  minimapMask: string;
  nodeMode: CanvasThemeMode;
  exportTheme: ExportTheme;
  accentBadge: string;
}

const THEME_DEFINITIONS: Record<CanvasThemeMode, ThemeDefinition> = {
  dark: {
    canvasBg: 'bg-slate-950',
    canvasBgHex: '#020617',
    gridColor: '#334155',
    gridVariant: BackgroundVariant.Dots,
    gridGap: 24,
    gridSize: 1,
    headerBg: 'bg-slate-950/90 border-slate-800/80',
    headerBorder: 'border-slate-800',
    headerText: 'text-white',
    subText: 'text-slate-400',
    panelBg: 'bg-slate-900/90 backdrop-blur-md',
    panelBorder: 'border-slate-800',
    panelText: 'text-slate-200',
    controlsClass: '!bg-slate-900 !border-slate-800 !text-white !fill-white shadow-xl',
    minimapBg: '#090d16',
    minimapMask: 'rgba(15, 23, 42, 0.75)',
    nodeMode: 'dark',
    exportTheme: 'dark',
    accentBadge: 'bg-emerald-950 text-emerald-400 border-emerald-800'
  },
  light: {
    canvasBg: 'bg-slate-100',
    canvasBgHex: '#f1f5f9',
    gridColor: '#cbd5e1',
    gridVariant: BackgroundVariant.Dots,
    gridGap: 24,
    gridSize: 1.2,
    headerBg: 'bg-white/95 border-slate-200 shadow-sm',
    headerBorder: 'border-slate-200',
    headerText: 'text-slate-900',
    subText: 'text-slate-500',
    panelBg: 'bg-white/95 backdrop-blur-md',
    panelBorder: 'border-slate-200',
    panelText: 'text-slate-700',
    controlsClass: '!bg-white !border-slate-200 !text-slate-700 !fill-slate-700 shadow-xl',
    minimapBg: '#ffffff',
    minimapMask: 'rgba(241, 245, 249, 0.8)',
    nodeMode: 'light',
    exportTheme: 'light',
    accentBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  blueprint: {
    canvasBg: 'bg-[#071324]',
    canvasBgHex: '#071324',
    gridColor: '#0e2a47',
    gridVariant: BackgroundVariant.Lines,
    gridGap: 28,
    gridSize: 1,
    headerBg: 'bg-[#0a1e38]/95 border-cyan-800/60 shadow-md',
    headerBorder: 'border-cyan-800/60',
    headerText: 'text-cyan-200 font-mono',
    subText: 'text-cyan-300/70 font-mono',
    panelBg: 'bg-[#0c223f]/90 backdrop-blur-md',
    panelBorder: 'border-cyan-800/60',
    panelText: 'text-cyan-300 font-mono',
    controlsClass: '!bg-[#0c223f] !border-cyan-800 !text-cyan-300 !fill-cyan-300 shadow-xl',
    minimapBg: '#050e1a',
    minimapMask: 'rgba(7, 19, 36, 0.8)',
    nodeMode: 'blueprint',
    exportTheme: 'blueprint',
    accentBadge: 'bg-cyan-950 text-cyan-300 border-cyan-700'
  },
  midnight: {
    canvasBg: 'bg-black',
    canvasBgHex: '#000000',
    gridColor: '#27272a',
    gridVariant: BackgroundVariant.Dots,
    gridGap: 24,
    gridSize: 1,
    headerBg: 'bg-zinc-950/95 border-zinc-800/80 shadow-md',
    headerBorder: 'border-zinc-800',
    headerText: 'text-white',
    subText: 'text-zinc-400',
    panelBg: 'bg-zinc-950/90 backdrop-blur-md',
    panelBorder: 'border-zinc-800',
    panelText: 'text-zinc-200',
    controlsClass: '!bg-zinc-950 !border-zinc-800 !text-zinc-100 !fill-zinc-100 shadow-xl',
    minimapBg: '#000000',
    minimapMask: 'rgba(0, 0, 0, 0.85)',
    nodeMode: 'midnight',
    exportTheme: 'midnight',
    accentBadge: 'bg-zinc-900 text-zinc-300 border-zinc-700'
  }
};

const THEME_OPTIONS: Array<{
  id: XYFlowThemeOption;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'dark',
    label: 'Dark Slate',
    description: 'Deep slate with cyber neon accents',
    icon: Moon
  },
  {
    id: 'light',
    label: 'Clean Light',
    description: 'Crisp studio white with high-contrast text',
    icon: Sun
  },
  {
    id: 'blueprint',
    label: 'CAD Blueprint',
    description: 'Technical CAD grid with glowing cyan traces',
    icon: Layers
  },
  {
    id: 'midnight',
    label: 'Midnight OLED',
    description: 'Pitch black #000 with laser jewel nodes',
    icon: Sparkles
  },
  {
    id: 'system',
    label: 'System Sync',
    description: 'Auto-sync with app light / dark mode',
    icon: Monitor
  }
];

export interface ArchitectureFlowCanvasProps {
  onNotify?: (msg: string) => void;
}

const ArchitectureFlowInner: React.FC<ArchitectureFlowCanvasProps> = ({ onNotify }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();
  const { isDark } = useTheme();

  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  // Theming State
  const [themeChoice, setThemeChoice] = useState<XYFlowThemeOption>(() => {
    try {
      const saved = localStorage.getItem('nova_xyflow_canvas_theme') as XYFlowThemeOption;
      if (saved && ['dark', 'light', 'blueprint', 'midnight', 'system'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'dark';
  });
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInspectorInFullscreen, setShowInspectorInFullscreen] = useState(false);

  const [activeFlowFilter, setActiveFlowFilter] = useState<string>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('api_gateway');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isQuickDownloading, setIsQuickDownloading] = useState(false);
  const [isDocxDownloading, setIsDocxDownloading] = useState(false);

  // Quick download complete architecture and cost plan as Microsoft Word (.docx)
  const handleDownloadDocx = async () => {
    if (!containerRef.current) return;
    setIsDocxDownloading(true);
    try {
      await generateArchitectureAndCostDocx({
        canvasContainerEl: containerRef.current,
        includeDiagramImage: true,
        includeNodeSpecs: true,
        includeCostBreakdown: true,
        includeTimeline: true,
        includeDatabaseSchema: true,
        includeSecurityCompliance: true
      });
      if (onNotify) {
        onNotify('Downloaded complete Architecture & Cost Plan as Word Document (.docx)!');
      }
    } catch (err: any) {
      console.error('Word export failed:', err);
      if (onNotify) {
        onNotify('Failed to generate Word document.');
      }
    } finally {
      setIsDocxDownloading(false);
    }
  };

  // Resolved theme mode (converts 'system' to 'dark' or 'light')
  const resolvedThemeKey: CanvasThemeMode = useMemo(() => {
    if (themeChoice === 'system') {
      return isDark ? 'dark' : 'light';
    }
    return themeChoice;
  }, [themeChoice, isDark]);

  const currentThemeDef = THEME_DEFINITIONS[resolvedThemeKey];

  // Quick 1-click download as High-Res PNG
  const handleQuickDownloadPng = async () => {
    if (!containerRef.current) return;
    setIsQuickDownloading(true);
    try {
      await exportFlowAsPng(containerRef.current, {
        fileName: `nova-h-architecture-${currentThemeDef.exportTheme}.png`,
        scope: 'full',
        theme: currentThemeDef.exportTheme,
        pixelRatio: 2,
        nodes
      });
      if (onNotify) {
        onNotify(`Architecture diagram downloaded as 2x High-Res PNG (${resolvedThemeKey.toUpperCase()} theme)!`);
      }
    } catch (err: any) {
      console.error('Quick download failed:', err);
      if (onNotify) {
        onNotify('Direct snapshot encountered an issue. Opening export dialog...');
      }
      setIsDownloadModalOpen(true);
    } finally {
      setIsQuickDownloading(false);
    }
  };

  // Fullscreen Toggle Handler
  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      try {
        if (containerRef.current && containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen().catch(() => {});
        }
      } catch {
        // Fallback handled by overlay
      }
      setIsFullscreen(true);
      if (onNotify) {
        onNotify('Entered Fullscreen Canvas (Press [Esc] to exit, [I] for specs)');
      }
    } else {
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {}
      setIsFullscreen(false);
      if (onNotify) {
        onNotify('Exited Fullscreen Canvas');
      }
    }

    // Auto fitView to adapt to the new viewport geometry
    setTimeout(() => {
      fitView({ padding: 0.15, duration: 400 });
    }, 180);
  };

  // Keyboard shortcut listener: [F] for Fullscreen, [Esc] to Exit, [I] for Inspector
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) return;

      if (e.key === 'Escape' && isFullscreen) {
        handleToggleFullscreen();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if ((e.key === 'i' || e.key === 'I') && isFullscreen) {
        e.preventDefault();
        setShowInspectorInFullscreen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Keep in sync with browser native fullscreen exit
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
        setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 150);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [isFullscreen, fitView]);

  // Close theme dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as unknown as globalThis.Node)) {
        setIsThemeDropdownOpen(false);
      }
    };
    if (isThemeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isThemeDropdownOpen]);

  // Handle Theme Selection
  const handleSelectTheme = (t: XYFlowThemeOption) => {
    setThemeChoice(t);
    setIsThemeDropdownOpen(false);
    try {
      localStorage.setItem('nova_xyflow_canvas_theme', t);
    } catch {}
    if (onNotify) {
      const label = THEME_OPTIONS.find(o => o.id === t)?.label || t;
      onNotify(`XYFlow canvas theme changed to: ${label}`);
    }
  };

  // Handle node selection
  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    if (isFullscreen) {
      setShowInspectorInFullscreen(true);
    }
    setNodes((prevNodes) =>
      prevNodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isSelected: n.id === nodeId
        }
      }))
    );
  }, [setNodes, isFullscreen]);

  // Update flow filter and synchronize edges
  const handleSetFlowFilter = (filterKey: string) => {
    setActiveFlowFilter(filterKey);
    setNodes((prevNodes) =>
      prevNodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          activeFlowFilter: filterKey
        }
      }))
    );
  };

  // Synchronize edges with active filter and theme
  useEffect(() => {
    setEdges((prevEdges) =>
      prevEdges.map((e) => {
        const edgeTags = (e.data?.flowTags as string[]) || [];
        const isMatch = activeFlowFilter === 'all' || edgeTags.includes(activeFlowFilter);

        let strokeColor = (e.style?.stroke as string) || '#3b82f6';
        if (resolvedThemeKey === 'light') {
          if (e.id.includes('wa')) strokeColor = '#059669';
          else if (e.id.includes('mjml')) strokeColor = '#7c3aed';
          else if (e.id.includes('storage') || e.id.includes('r2')) strokeColor = '#0891b2';
          else strokeColor = '#2563eb';
        } else if (resolvedThemeKey === 'blueprint') {
          if (e.id.includes('wa')) strokeColor = '#34d399';
          else if (e.id.includes('mjml')) strokeColor = '#a78bfa';
          else if (e.id.includes('storage') || e.id.includes('r2')) strokeColor = '#22d3ee';
          else strokeColor = '#38bdf8';
        }

        return {
          ...e,
          animated: isMatch,
          style: {
            ...e.style,
            stroke: strokeColor,
            opacity: isMatch ? 1 : (resolvedThemeKey === 'light' ? 0.2 : 0.15),
            strokeWidth: isMatch ? 2.5 : 1
          }
        };
      })
    );
  }, [activeFlowFilter, resolvedThemeKey, setEdges]);

  // Selected node detailed spec
  const selectedSpec = useMemo(() => {
    return NODE_DETAILS[selectedNodeId] || NODE_DETAILS.api_gateway;
  }, [selectedNodeId]);

  const handleCopyCode = async () => {
    if (!selectedSpec) return;
    try {
      await navigator.clipboard.writeText(selectedSpec.codeSample);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // ignore
    }
  };

  // Current active theme icon for top toolbar
  const ActiveThemeIcon = THEME_OPTIONS.find(o => o.id === themeChoice)?.icon || Moon;

  // Render spec drawer content helper (used in both normal and fullscreen modes)
  const renderInspectorContent = (onClose?: () => void) => {
    if (!selectedSpec) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
          <Info className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
          <p>Select any node in the XYFlow canvas to inspect technical specifications and code.</p>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {selectedSpec.category}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                SLA {selectedSpec.sla}
              </span>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {selectedSpec.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {selectedSpec.role}
          </p>
        </div>

        {/* Technical Specs Matrix */}
        <div className="space-y-2.5 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/70 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Implementation Tech
            </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block text-xs">
              {selectedSpec.techStack}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/70 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Performance &amp; Scale
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block text-xs">
              {selectedSpec.throughput}
            </span>
          </div>
        </div>

        {/* Security Safeguards */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Security &amp; Compliance Safeguards</span>
          </span>
          <ul className="space-y-1.5 text-xs">
            {selectedSpec.security.map((sec, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{sec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Code Snippet */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-500" />
              <span>Architecture Code Reference</span>
            </span>
            <button
              onClick={handleCopyCode}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-[10.5px] overflow-x-auto border border-slate-800 leading-relaxed max-h-56">
            <code>{selectedSpec.codeSample}</code>
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div
      className={
        isFullscreen
          ? `fixed inset-0 z-50 w-screen h-screen flex flex-col p-2 sm:p-4 overflow-hidden ${currentThemeDef.canvasBg}`
          : 'flex flex-col xl:flex-row gap-6 h-[850px] w-full'
      }
    >
      {/* Main Canvas Container Area */}
      <div 
        ref={containerRef}
        className={`flex-1 ${currentThemeDef.canvasBg} rounded-2xl border ${currentThemeDef.headerBorder} relative overflow-hidden flex flex-col shadow-inner transition-colors duration-200`}
      >
        {/* Top Filter & Toolbar Header */}
        <div className={`p-3 ${currentThemeDef.headerBg} backdrop-blur-md border-b ${currentThemeDef.headerBorder} z-20 flex flex-wrap items-center justify-between gap-3`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${resolvedThemeKey === 'blueprint' ? 'bg-cyan-900/40 text-cyan-300 border border-cyan-700/50' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'}`}>
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-xs font-black ${currentThemeDef.headerText} flex items-center gap-2`}>
                  <span>Interactive Cloud Architecture Diagram</span>
                </h3>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold ${currentThemeDef.accentBadge}`}>
                  XYFlow
                </span>
                {isFullscreen && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold uppercase tracking-wider animate-pulse">
                    Fullscreen Mode
                  </span>
                )}
              </div>
              <p className={`text-[10px] ${currentThemeDef.subText}`}>
                Pan, zoom, drag nodes, or click components to inspect specs &amp; code.
              </p>
            </div>
          </div>

          {/* Right Toolbar Controls: Filters, Themes, Fullscreen & Download Suite */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Flow Filter Toggles */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              <span className={`text-[10px] font-bold ${currentThemeDef.subText} uppercase tracking-wider mr-1 hidden lg:inline`}>
                Filter:
              </span>
              <button
                onClick={() => handleSetFlowFilter('all')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  activeFlowFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-black/10 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-black/20 dark:hover:bg-slate-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleSetFlowFilter('rfp')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  activeFlowFilter === 'rfp'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-black/10 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-black/20 dark:hover:bg-slate-700'
                }`}
              >
                <span>RFP</span>
              </button>
              <button
                onClick={() => handleSetFlowFilter('whatsapp')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  activeFlowFilter === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-black/10 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-black/20 dark:hover:bg-slate-700'
                }`}
              >
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => handleSetFlowFilter('mjml')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  activeFlowFilter === 'mjml'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-black/10 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-black/20 dark:hover:bg-slate-700'
                }`}
              >
                <span>MJML</span>
              </button>
              <button
                onClick={() => handleSetFlowFilter('storage')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  activeFlowFilter === 'storage'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-black/10 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-black/20 dark:hover:bg-slate-700'
                }`}
              >
                <span>R2</span>
              </button>
            </div>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 hidden sm:block" />

            {/* THEME SELECTOR DROPDOWN */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                type="button"
                onClick={() => setIsThemeDropdownOpen(prev => !prev)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  resolvedThemeKey === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : resolvedThemeKey === 'blueprint'
                    ? 'bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-200 border-cyan-800'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Select XYFlow Theme"
              >
                <ActiveThemeIcon className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden md:inline font-mono">
                  {THEME_OPTIONS.find(o => o.id === themeChoice)?.label || 'Theme'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {isThemeDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1 mb-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      XYFlow Theme
                    </span>
                  </div>
                  <div className="space-y-1">
                    {THEME_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = themeChoice === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectTheme(opt.id)}
                          className={`w-full text-left p-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                            <div>
                              <div className="font-bold leading-tight">{opt.label}</div>
                              <div className="text-[10px] text-slate-400 font-normal leading-snug">{opt.description}</div>
                            </div>
                          </div>
                          {isActive && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* FULLSCREEN TOGGLE BUTTON */}
            <button
              onClick={handleToggleFullscreen}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                isFullscreen
                  ? 'bg-rose-600/15 hover:bg-rose-600/25 text-rose-700 dark:text-rose-300 border-rose-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title={isFullscreen ? 'Exit Fullscreen (Esc or F)' : 'Enter Fullscreen (F)'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                  <span className="hidden sm:inline">Exit Fullscreen</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/30 opacity-80">Esc</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Fullscreen</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/30 opacity-80">F</span>
                </>
              )}
            </button>

            {/* If in fullscreen mode, allow toggling the inspector drawer */}
            {isFullscreen && (
              <button
                onClick={() => setShowInspectorInFullscreen(prev => !prev)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border transition-all cursor-pointer flex items-center gap-1.5 ${
                  showInspectorInFullscreen
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Toggle Specification Drawer (I)"
              >
                {showInspectorInFullscreen ? (
                  <PanelRightClose className="w-3.5 h-3.5" />
                ) : (
                  <PanelRightOpen className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span className="hidden md:inline">Specs</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/30 opacity-80">I</span>
              </button>
            )}

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 hidden sm:block" />

            {/* Download Buttons Group */}
            <div className="flex items-center gap-1.5">
              {/* Quick 1-Click PNG Download */}
              <button
                onClick={handleQuickDownloadPng}
                disabled={isQuickDownloading}
                className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                title="1-Click Download Diagram as 2x High-Res PNG"
              >
                {isQuickDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                ) : (
                  <FileImage className="w-3.5 h-3.5 text-sky-400" />
                )}
                <span className="hidden sm:inline">Quick PNG</span>
              </button>

              {/* Quick Word Document (.docx) Export */}
              <button
                onClick={handleDownloadDocx}
                disabled={isDocxDownloading}
                className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-blue-900/60 hover:bg-blue-800/80 text-blue-200 border border-blue-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                title="Download full Architecture & Cost Plan as Microsoft Word (.docx)"
              >
                {isDocxDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-blue-300" />
                )}
                <span className="hidden sm:inline">Word Doc</span>
              </button>

              {/* Full Download Options Dialog Trigger */}
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="px-3 py-1 rounded-lg font-black text-[11px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/20 ring-1 ring-blue-400/30"
                title="Download System Architecture (PNG, SVG, JSON, Markdown)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>

        {/* The XYFlow Canvas & Fullscreen Split View */}
        <div className="flex-1 relative w-full h-full flex flex-row overflow-hidden">
          <div className="flex-1 relative w-full h-full">
            <ReactFlow
              nodes={nodes.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  isSelected: node.id === selectedNodeId,
                  themeMode: currentThemeDef.nodeMode,
                  onSelectNode: handleSelectNode
                }
              }))}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.2}
              maxZoom={1.6}
              defaultViewport={{ x: 0, y: 0, zoom: 0.65 }}
              className={currentThemeDef.canvasBg}
            >
              <Background 
                color={currentThemeDef.gridColor} 
                gap={currentThemeDef.gridGap} 
                size={currentThemeDef.gridSize} 
                variant={currentThemeDef.gridVariant} 
              />
              <Controls 
                className={`${currentThemeDef.controlsClass} rounded-xl shadow-lg export-exclude`}
                showInteractive={false}
              />
              <MiniMap 
                className="rounded-xl overflow-hidden shadow-2xl export-exclude border border-slate-700/60"
                nodeColor={(node) => {
                  switch (node.data?.category) {
                    case 'client': return '#0284c7';
                    case 'edge': return '#f97316';
                    case 'gateway': return '#3b82f6';
                    case 'service': return '#6366f1';
                    case 'queue': return '#f59e0b';
                    case 'database': return '#10b981';
                    case 'storage': return '#06b6d4';
                    case 'external': return '#f43f5e';
                    default: return '#64748b';
                  }
                }}
                maskColor={currentThemeDef.minimapMask}
              />

              {/* In-canvas Floating Action Panel for Quick Controls & Download */}
              <Panel position="top-right" className="m-3 export-exclude">
                <div className={`flex items-center gap-1.5 ${currentThemeDef.panelBg} border ${currentThemeDef.panelBorder} p-1.5 rounded-xl shadow-xl`}>
                  <button
                    onClick={() => fitView({ padding: 0.15, duration: 400 })}
                    title="Fit view to show all 7 tiers"
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-black/20 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] font-bold hidden sm:inline">Fit View</span>
                  </button>

                  <div className="w-px h-3.5 bg-slate-700/60" />

                  {/* Canvas Floating Fullscreen Button */}
                  <button
                    onClick={handleToggleFullscreen}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-black/20 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span className="text-[10px] font-bold hidden sm:inline">{isFullscreen ? 'Exit' : 'Full'}</span>
                  </button>

                  <div className="w-px h-3.5 bg-slate-700/60" />

                  <button
                    onClick={handleQuickDownloadPng}
                    disabled={isQuickDownloading}
                    title="Quick PNG Download"
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-black/20 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
                  >
                    {isQuickDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" /> : <FileImage className="w-3.5 h-3.5 text-sky-400" />}
                    <span className="text-[10px] font-bold hidden sm:inline">PNG</span>
                  </button>

                  <div className="w-px h-3.5 bg-slate-700/60" />

                  <button
                    onClick={() => setIsDownloadModalOpen(true)}
                    title="Download Diagram (PNG, SVG, JSON, Markdown)"
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Download</span>
                  </button>
                </div>
              </Panel>

              {/* In-canvas legend helper */}
              <Panel position="bottom-left" className="m-4 export-exclude">
                <div className={`p-3 ${currentThemeDef.panelBg} rounded-xl border ${currentThemeDef.panelBorder} text-[10px] ${currentThemeDef.panelText} flex items-center gap-3 shadow-lg`}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span> Clients
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Gateway
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Core Engines
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> PostgreSQL
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Cloudflare R2
                  </span>
                </div>
              </Panel>
            </ReactFlow>
          </div>

          {/* Fullscreen Inspector Side-Drawer */}
          {isFullscreen && showInspectorInFullscreen && (
            <div className={`w-96 shrink-0 ${resolvedThemeKey === 'light' ? 'bg-white border-l border-slate-200 text-slate-800' : 'bg-slate-900 border-l border-slate-800 text-white'} p-5 flex flex-col shadow-2xl overflow-y-auto z-20`}>
              {renderInspectorContent(() => setShowInspectorInFullscreen(false))}
            </div>
          )}
        </div>
      </div>

      {/* Normal Mode Right Inspector Drawer */}
      {!isFullscreen && (
        <div className="w-full xl:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col shadow-xs overflow-y-auto">
          {renderInspectorContent()}
        </div>
      )}

      {/* Download Diagram Modal with active theme matching */}
      <DownloadDiagramModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        containerEl={containerRef.current}
        nodes={nodes}
        edges={edges}
        nodeDetails={NODE_DETAILS}
        initialTheme={currentThemeDef.exportTheme}
        onNotify={onNotify}
      />
    </div>
  );
};

export const ArchitectureFlowCanvas: React.FC<ArchitectureFlowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <ArchitectureFlowInner {...props} />
    </ReactFlowProvider>
  );
};
