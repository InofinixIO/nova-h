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
  Header, 
  Footer, 
  PageNumber
} from 'docx';

export interface PlanDocumentOptions {
  fileName?: string;
  currency?: 'INR' | 'USD' | 'BOTH';
  replacementMonthsMin?: number;
  replacementMonthsMax?: number;
  blendedRateLakh?: number; // in Lakhs INR (e.g. 1.2 Lakh = 120,000 INR/month)
  pilotHospitals?: number;
  growthHospitals?: number;
  scaleHospitals?: number;
}

const cellBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
};

/**
 * Generates an executive Architecture and Estimates Plan Word document (.docx)
 * matching the 13-page NABH Pulse document structure.
 */
export async function generatePlanDocx(options: PlanDocumentOptions = {}): Promise<void> {
  const {
    fileName = 'NABH_Pulse_Architecture_and_Estimates_Plan.docx',
    replacementMonthsMin = 32,
    replacementMonthsMax = 45,
    blendedRateLakh = 1.25, // 1.25 Lakh INR / month
    pilotHospitals = 3,
    growthHospitals = 10,
    scaleHospitals = 30
  } = options;

  const minReplacementValueLakh = (replacementMonthsMin * blendedRateLakh).toFixed(1);
  const maxReplacementValueLakh = (replacementMonthsMax * blendedRateLakh).toFixed(1);

  const docChildren: (Paragraph | Table)[] = [];

  // ==========================================
  // PAGE 1: COVER
  // ==========================================
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: 'I N O F I N I X  ·  P R O D U C T   A R C H I T E C T U R E   A N D   P L A N',
          bold: true,
          size: 18,
          color: '2563EB',
          font: 'Segoe UI'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      heading: HeadingLevel.TITLE,
      spacing: { before: 140, after: 120 },
      children: [
        new TextRun({
          text: 'NABH Pulse',
          bold: true,
          size: 46,
          color: '0F172A',
          font: 'Segoe UI'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 60, after: 180 },
      children: [
        new TextRun({
          text: 'Architecture, flows and estimates',
          bold: true,
          size: 26,
          color: '334155',
          font: 'Segoe UI'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 60, after: 360 },
      children: [
        new TextRun({
          text: 'Accreditation readiness, controlled documents, evidence, reviews and approvals.',
          italics: true,
          size: 22,
          color: '475569',
          font: 'Segoe UI'
        })
      ]
    })
  );

  // Document Structure Box
  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: {
                left: { style: BorderStyle.SINGLE, size: 16, color: '1E3A8A' },
                top: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE }
              },
              shading: { fill: 'EFF6FF', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'A  Architecture: ', bold: true, size: 20, color: '1E3A8A', font: 'Segoe UI' }),
                    new TextRun({ text: 'deployed runtime, logical architecture, request flow, technology stack', size: 19, font: 'Segoe UI' })
                  ]
                }),
                new Paragraph({
                  spacing: { before: 80 },
                  children: [
                    new TextRun({ text: 'B  Estimates: ', bold: true, size: 20, color: '1E3A8A', font: 'Segoe UI' }),
                    new TextRun({ text: 'development cost (completed product) and monthly operating cost', size: 19, font: 'Segoe UI' })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { after: 320 } }),
    // Meta footer on cover
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: { top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' } },
              children: [
                new Paragraph({
                  spacing: { before: 120 },
                  children: [
                    new TextRun({ text: 'Planning horizon: ', bold: true, size: 18, color: '475569', font: 'Segoe UI' }),
                    new TextRun({ text: 'Completed-product valuation and first 12 months of operations\n', size: 18, font: 'Segoe UI' }),
                    new TextRun({ text: 'Estimate basis: ', bold: true, size: 18, color: '475569', font: 'Segoe UI' }),
                    new TextRun({ text: 'India delivery and operations team, September 2026\n', size: 18, font: 'Segoe UI' }),
                    new TextRun({ text: 'Currency: ', bold: true, size: 18, color: '475569', font: 'Segoe UI' }),
                    new TextRun({ text: 'INR (₹), excluding GST', size: 18, font: 'Segoe UI' })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { after: 480 } })
  );

  // ==========================================
  // PAGE 3: OVERVIEW & SIZING ASSUMPTIONS
  // ==========================================
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: 'Overview · NABH Pulse: Architecture and Estimates', bold: true, size: 28, color: '1E3A8A', font: 'Segoe UI' })]
    }),
    new Paragraph({
      spacing: { after: 180 },
      children: [
        new TextRun({
          text: 'NABH Pulse is one of three developed, multi-tenant Inofinix applications on a shared cloud foundation. Its main cost drivers are document storage and conversion, AI drafting, accreditation operations and expert review.',
          size: 20,
          font: 'Segoe UI'
        })
      ]
    })
  );

  // 4 Top Metric Cards Table
  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
              children: [
                new Paragraph({ children: [new TextRun({ text: 'REPLACEMENT VALUE', bold: true, size: 15, color: '64748B', font: 'Segoe UI' })] }),
                new Paragraph({ children: [new TextRun({ text: `₹ ${minReplacementValueLakh}–${maxReplacementValueLakh} L`, bold: true, size: 22, color: '0F172A', font: 'Segoe UI' })] }),
                new Paragraph({ children: [new TextRun({ text: `${replacementMonthsMin}–${replacementMonthsMax} person-months to rebuild`, size: 14, color: '475569', font: 'Segoe UI' })] })
              ]
            }),
            new TableCell({
              borders: cellBorders,
              shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
              children: [
                new Paragraph({ children: [new TextRun({ text: 'STATUS', bold: true, size: 15, color: '64748B', font: 'Segoe UI' })] }),
                new Paragraph({ children: [new TextRun({ text: 'Nearing completion', bold: true, size: 20, color: '059669', font: 'Segoe UI' })] }),
                new Paragraph({ children: [new TextRun({ text: 'no further dev in scope', size: 14, color: '475569', font: 'Segoe UI' })] })
              ]
            }),
            new TableCell({
              borders: cellBorders,
              shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
              children: [
                new Paragraph({ children: [new TextRun({ text: 'RUN COST · GROWTH', bold: true, size: 15, color: '64748B', font: 'Segoe UI' })] }),
                new Paragraph({ children: [new TextRun({ text: '₹ 72,500', bold: true, size: 22, color: '2563EB', font: 'Segoe UI' })] }),
                new Paragraph({ children: [new TextRun({ text: `per month · ${growthHospitals} hospitals`, size: 14, color: '475569', font: 'Segoe UI' })] })
              ]
            }),
            new TableCell({
              borders: cellBorders,
              shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
              children: [
                new Paragraph({ children: [new TextRun({ text: 'COST PER HOSPITAL', bold: true, size: 15, color: '64748B', font: 'Segoe UI' })] }),
                new Paragraph({ children: [new TextRun({ text: '₹ 7,250', bold: true, size: 22, color: '7C3AED', font: 'Segoe UI' })] }),
                new Paragraph({ children: [new TextRun({ text: 'per month at Growth midpoint', size: 14, color: '475569', font: 'Segoe UI' })] })
              ]
            })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { after: 240 } })
  );

  // Size and Scale Assumed Table
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 180, after: 120 },
      children: [new TextRun({ text: 'Size and Scale Assumed', bold: true, size: 22, color: '1E3A8A', font: 'Segoe UI' })]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: cellBorders,
              width: { size: 18, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'Scale Tier', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: cellBorders,
              width: { size: 16, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'Hospitals', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: cellBorders,
              width: { size: 20, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'Registered Users', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: cellBorders,
              width: { size: 20, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'Active Users/Mo', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: cellBorders,
              width: { size: 26, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'Indicative Monthly Workload', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: 'Pilot', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: String(pilotHospitals), size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: '60', size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: '36', size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: '5,000 API actions · 300 AI/doc jobs', size: 15, font: 'Segoe UI' })] })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Growth', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: String(growthHospitals), size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: '250', size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: '150', size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: '30,000 API actions · 2,000 AI/doc jobs', size: 15, font: 'Segoe UI' })] })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: 'Scale', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: String(scaleHospitals), size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: '900', size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: '540', size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: '1,20,000 API actions · 8,000 AI/doc jobs', size: 15, font: 'Segoe UI' })] })] })
          ]
        })
      ]
    }),
    new Paragraph({
      spacing: { before: 140, after: 120 },
      children: [
        new TextRun({
          text: 'Sized for a healthcare startup serving small and medium hospitals (20–150 beds): about 20–30 registered users per hospital. Monthly active users are 60% of registered users; peak concurrent use is 5–10%.',
          size: 18,
          color: '475569',
          font: 'Segoe UI'
        })
      ]
    }),
    new Paragraph({
      spacing: { after: 320 },
      children: [
        new TextRun({
          text: 'NABH Pulse workload: 800 controlled files per hospital, 1.5 MB average file size, three retained versions, and 15% of files processed by AI each month.',
          bold: true,
          size: 18,
          color: '1E3A8A',
          font: 'Segoe UI'
        })
      ]
    })
  );

  // ==========================================
  // SECTION A1: DEPLOYED RUNTIME
  // ==========================================
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: 'A1 · Deployed Runtime: Software and Infrastructure', bold: true, size: 28, color: '1E3A8A', font: 'Segoe UI' })]
    }),
    new Paragraph({
      spacing: { after: 140 },
      children: [
        new TextRun({
          text: 'A Cloudflare Worker routes through a Durable Object to a Node.js / Express container that builds, converts and stores controlled documents.',
          size: 20,
          font: 'Segoe UI'
        })
      ]
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
              children: [new Paragraph({ children: [new TextRun({ text: 'Runtime Component', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Runtime Platform & Role', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Key Libraries & Technologies', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: 'Web Application Client', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: 'Browser SPA frontend with embedded OnlyOffice editor' })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: 'React 19 · Vite 7 · Lucide React · JWT-signed check-in' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Edge & Worker Router', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: 'Cloudflare Platform Edge: DNS, TLS, CDN, WAF, rate limiting' })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: 'Cloudflare Worker request router + Durable Object container lifecycle' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: 'Application Container', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: 'Cloudflare Container: HTTP API, Vite bundle, workflow, versions, approvals, audit' })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: 'Node.js 22 · Express 5 · docx · docx-templates · pdf-lib · LibreOffice soffice' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Document Storage', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: 'Cloudflare R2 Object Storage with $0 egress fees' })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: 'AWS S3 SDK compatible; stores templates, controlled docs, evidence, versions' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: 'Relational Database', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: 'PostgreSQL: system of record for programmes, reviews, approvals, audit' })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: 'PostgreSQL 16 Multi-AZ via pg pool; ACID transactional state' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'AI & External Integrations', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: 'Governed LLM gateway for prompt refinement and document generation' })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: 'Anthropic Claude API + MJML Nodemailer SMTP delivery' })] })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { after: 320 } })
  );

  // ==========================================
  // SECTION A2: LOGICAL ARCHITECTURE
  // ==========================================
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: 'A2 · Logical Architecture: Users, Modules and Data', bold: true, size: 28, color: '1E3A8A', font: 'Segoe UI' })]
    }),
    new Paragraph({
      spacing: { after: 140 },
      children: [
        new TextRun({
          text: 'The architecture enforces strict hospital isolation and multi-role segregation across Accreditation Teams, Owners & Approvers, External Reviewers, and Platform Administrators.',
          size: 20,
          font: 'Segoe UI'
        })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'User Persona', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Responsibilities & Access', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Target Application Modules', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: 'Hospital Accreditation Team', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: 'Gap assessment, owners, evidence upload, AI draft requests' })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: 'Programme and readiness service · Template Studio' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Owners and Approvers', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: 'Review drafts, approve and release controlled documents' })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: 'Document control and approval workflow' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: 'Reviewers and Consultants', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: 'Review, comment and advise on one hospital (Web · invited scope)' })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: 'Evidence, training and audit service' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Platform Administrators', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: 'Tenants, roles, SSO, programme set-up, global compliance' })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: 'Shared Inofinix platform services & platform ops' })] })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { after: 320 } })
  );

  // ==========================================
  // SECTION A3: REQUEST FLOW (16 STEPS)
  // ==========================================
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: 'A3 · Request Flow: AI-Assisted Draft to Controlled Release', bold: true, size: 28, color: '1E3A8A', font: 'Segoe UI' })]
    }),
    new Paragraph({
      spacing: { after: 140 },
      children: [
        new TextRun({
          text: 'The prompt version, sources and confidence are recorded with every draft. Only the approver\'s release (step 14) makes a document controlled.',
          size: 20,
          font: 'Segoe UI'
        })
      ]
    })
  );

  const requestFlowSteps = [
    { step: '01', actor: 'Accreditation Team', action: 'Request AI-assisted draft for a requirement' },
    { step: '02', actor: 'Worker Router', action: 'Route request to active container instance at the edge' },
    { step: '03', actor: 'Durable Object', action: 'Forward request and coordinate container lifecycle' },
    { step: '04', actor: 'Express Container', action: 'Load programme, template, and hospital context from PostgreSQL' },
    { step: '05', actor: 'Anthropic Claude API', action: 'Refine prompt and generate draft (prompt version logged)' },
    { step: '06', actor: 'Express Container', action: 'Receive draft with placeholders and clinical schema tokens' },
    { step: '07', actor: 'Document Builder', action: 'Build DOCX (docx-templates) and PDF preview (LibreOffice soffice)' },
    { step: '08', actor: 'Cloudflare R2', action: 'Save generated DOCX + PDF as new version in R2 vault' },
    { step: '09', actor: 'PostgreSQL', action: 'Record version, sources, confidence, and audit trail in DB' },
    { step: '10', actor: 'Express Container', action: 'Mark draft ready for clinical owner review' },
    { step: '11', actor: 'Owner', action: 'Open and edit draft in-browser via OnlyOffice Document Server' },
    { step: '12', actor: 'OnlyOffice Server', action: 'Send check-in callback with JWT-signed payload upon save' },
    { step: '13', actor: 'Cloudflare R2', action: 'Save revised version to R2 object storage' },
    { step: '14', actor: 'Hospital Approver', action: 'Formally review, approve and execute controlled release' },
    { step: '15', actor: 'PostgreSQL', action: 'Set release state to controlled and append immutable audit log' },
    { step: '16', actor: 'Email Relay', action: 'Dispatch release notice (MJML + Nodemailer) to all stakeholders' }
  ];

  const flowRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
          borders: cellBorders,
          width: { size: 12, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Step', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
        }),
        new TableCell({
          shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
          borders: cellBorders,
          width: { size: 28, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Participant / Component', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
        }),
        new TableCell({
          shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
          borders: cellBorders,
          width: { size: 60, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Action / Data Transition', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
        })
      ]
    })
  ];

  requestFlowSteps.forEach((s, idx) => {
    const isAlt = idx % 2 === 1;
    flowRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: s.step, bold: true, size: 16, color: '2563EB', font: 'Segoe UI' })] })]
          }),
          new TableCell({
            borders: cellBorders,
            shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: s.actor, bold: true, size: 16, font: 'Segoe UI' })] })]
          }),
          new TableCell({
            borders: cellBorders,
            shading: { fill: isAlt ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: s.action, size: 16, font: 'Segoe UI' })] })]
          })
        ]
      })
    );
  });

  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: flowRows
    }),
    new Paragraph({ spacing: { after: 320 } })
  );

  // ==========================================
  // SECTION A4: TECHNOLOGY STACK
  // ==========================================
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: 'A4 · Technology Stack & Verified Libraries', bold: true, size: 28, color: '1E3A8A', font: 'Segoe UI' })]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Layer', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'NABH Pulse Technology Specification', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: 'Web Frontend', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: 'React 19 · Vite 7 · JavaScript / TypeScript · Lucide React' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Mobile', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: 'Responsive web application optimized for tablets and mobile devices' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: 'API and Runtime', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: 'Node.js 22 and Express 5 in a Cloudflare Container, fronted by a Worker' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Database', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: 'PostgreSQL through pg; relational application store with ACID consistency' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: 'File Storage', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: 'Cloudflare R2 through the S3-compatible AWS SDK ($0 egress bandwidth)' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Cloud Platform', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: 'Cloudflare Worker · Containers · Durable Objects · R2 · Wrangler · Observability' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: 'AI & LLM', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: 'Anthropic Claude API for prompt refinement and clinical document generation' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Documents & Media', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: 'DOCX generation & templates · LibreOffice conversion · OnlyOffice editing · PDF/Excel/ZIP processing' })] })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { after: 320 } })
  );

  // ==========================================
  // SECTION B1: DEVELOPMENT COST ESTIMATE
  // ==========================================
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: 'B1 · Development Cost (Completed Product)', bold: true, size: 28, color: '1E3A8A', font: 'Segoe UI' })]
    }),
    new Paragraph({
      spacing: { after: 140 },
      children: [
        new TextRun({
          text: 'NABH Pulse is developed and nearing completion; no further development work is included in this document. The figure below is what a lean India-based team would spend to build it today (replacement value), shown for valuation and business-case purposes, not actual historical spend.',
          size: 20,
          font: 'Segoe UI'
        })
      ]
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
              children: [new Paragraph({ children: [new TextRun({ text: 'Estimate Component', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Cost Band (INR)', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Basis & Inclusions', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: 'Developed Software Replacement Value', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: `₹ ${minReplacementValueLakh}–${maxReplacementValueLakh} Lakh`, bold: true, size: 16, color: '059669', font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: 'Hospital workspace, controlled documents, versions, reviews, Template Studio, AI drafting, conversion and storage' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Share of Shared-Platform Replacement Value (1/3)', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: '₹ 12.5–18.0 Lakh', bold: true, size: 16, color: '2563EB', font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: 'Only for a standalone business case; count the ₹ 45 Lakh foundation once across the portfolio.' })] })
          ]
        })
      ]
    }),
    new Paragraph({
      spacing: { before: 140, after: 240 },
      children: [
        new TextRun({
          text: `How the replacement value is derived: ${replacementMonthsMin}–${replacementMonthsMax} person-months × ₹ ${blendedRateLakh} lakh blended, fully loaded rate (product, UX, frontend, backend, QA, DevOps/security, part-time domain review) = ₹ ${minReplacementValueLakh}–${maxReplacementValueLakh} Lakh.`,
          bold: true,
          size: 18,
          color: '334155',
          font: 'Segoe UI'
        })
      ]
    })
  );

  // ==========================================
  // SECTION B2: MONTHLY OPERATING COST
  // ==========================================
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: 'B2 · Monthly Operating Cost', bold: true, size: 28, color: '1E3A8A', font: 'Segoe UI' })]
    }),
    new Paragraph({
      spacing: { after: 140 },
      children: [
        new TextRun({
          text: 'Monthly run cost = cloud infrastructure + tools and LLM usage + support operations team. Infrastructure scales with users, requests, database size, stored files and data transfer; LLM cost with documents or cases processed; support in steps as each tier adds people.',
          size: 20,
          font: 'Segoe UI'
        })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Scale', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Infra & Cloud', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Tools & LLM', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Support Team', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Total / Month', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '0F172A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: '+ ⅓ Platform', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: 'Pilot', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: '₹ 8,500' })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: '₹ 6,200' })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: '₹ 22,000' })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: '₹ 36,700', bold: true, color: '1E3A8A', size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: '₹ 45,500' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: 'Growth', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: '₹ 19,500' })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: '₹ 16,000' })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: '₹ 37,000' })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: '₹ 72,500', bold: true, color: '1E3A8A', size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: '₹ 88,000' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: 'Scale', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: '₹ 54,000' })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: '₹ 48,000' })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: '₹ 85,000' })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: '₹ 1,87,000', bold: true, color: '1E3A8A', size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: '₹ 2,20,000' })] })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { after: 240 } })
  );

  // Market Sanity Check Table
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 180, after: 120 },
      children: [new TextRun({ text: 'Market Sanity Check · Per Hospital, Per Month', bold: true, size: 22, color: '1E3A8A', font: 'Segoe UI' })]
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
              children: [new Paragraph({ children: [new TextRun({ text: 'Benchmark Metric', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            }),
            new TableCell({
              shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Amount (INR)', bold: true, color: 'FFFFFF', size: 16, font: 'Segoe UI' })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: 'NABH Pulse delivery cost (Growth midpoint)', bold: true, size: 16, font: 'Segoe UI' })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: '₹ 7,250 / hospital', bold: true, size: 16, color: '059669', font: 'Segoe UI' })] })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: 'Cloud HMS, 20–60 beds market benchmark' })] }),
            new TableCell({ borders: cellBorders, shading: { fill: 'F8FAFC', type: ShadingType.CLEAR }, children: [new Paragraph({ text: '₹ 15,000 – ₹ 25,000 / hospital' })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: 'Cloud HMS, small/mid hospital benchmark' })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ text: '₹ 35,000 – ₹ 60,000 / hospital' })] })
          ]
        })
      ]
    }),
    new Paragraph({
      spacing: { before: 140, after: 320 },
      children: [
        new TextRun({
          text: 'HMS figures are market selling prices for broad hospital systems (Indian Hospital Management Software Market Guide, September 2026), used only to check that lean software operations stay well inside achievable subscription budgets.',
          size: 17,
          color: '475569',
          font: 'Segoe UI'
        })
      ]
    })
  );

  // ==========================================
  // SECTION B3: EXCLUSIONS & COST CONTROLS
  // ==========================================
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: 'B3 · Exclusions, Decisions and Cost Controls', bold: true, size: 28, color: '1E3A8A', font: 'Segoe UI' })]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 120, after: 80 },
      children: [new TextRun({ text: 'Not Included in These Estimates', bold: true, size: 20, color: 'DC2626', font: 'Segoe UI' })]
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: '• GST, cloud marketplace taxes, payment-gateway charges and foreign-exchange movement.\n', size: 18, font: 'Segoe UI' }),
        new TextRun({ text: '• NABH consultant or assessor fees, legal opinions and certification fees.\n', size: 18, font: 'Segoe UI' }),
        new TextRun({ text: '• Enterprise OnlyOffice / Microsoft 365 licensing.\n', size: 18, font: 'Segoe UI' }),
        new TextRun({ text: '• Bulk legacy-document cleansing and manual indexing.\n', size: 18, font: 'Segoe UI' }),
        new TextRun({ text: '• SMS/WhatsApp message charges, penetration-testing vendor fees, cyber-insurance and native mobile apps.', size: 18, font: 'Segoe UI' })
      ]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 180, after: 80 },
      children: [new TextRun({ text: 'Decisions Needed to Firm Up the Estimate', bold: true, size: 20, color: '2563EB', font: 'Segoe UI' })]
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: '1. Go-live channel: web only at launch, with mobile apps treated as a separate future scope.\n', size: 18, font: 'Segoe UI' }),
        new TextRun({ text: '2. First-year hospital count, users per hospital, document volume and growth.\n', size: 18, font: 'Segoe UI' }),
        new TextRun({ text: '3. Support window: business hours, extended hours or staffed 24x7.\n', size: 18, font: 'Segoe UI' }),
        new TextRun({ text: '4. Data residency, retention, disaster-recovery targets, SSO and compliance scope.\n', size: 18, font: 'Segoe UI' }),
        new TextRun({ text: '5. Preferred LLM providers and the human-review policy for AI drafts.\n', size: 18, font: 'Segoe UI' }),
        new TextRun({ text: '6. Paid third-party systems: OnlyOffice or Microsoft 365, SMS/WhatsApp, email, monitoring and security tools.\n', size: 18, font: 'Segoe UI' }),
        new TextRun({ text: '7. Price the software subscription separately from document-control and consultant services.', size: 18, font: 'Segoe UI' })
      ]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 180, after: 80 },
      children: [new TextRun({ text: 'Cost Controls Implemented in Architecture', bold: true, size: 20, color: '059669', font: 'Segoe UI' })]
    }),
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({ text: '• Per-tenant AI budgets, rate limits and model routing, with alerts at 50%, 75% and 90% of budget.\n', size: 18, font: 'Segoe UI' }),
        new TextRun({ text: '• Cache safe derived results; never re-process unchanged documents.\n', size: 18, font: 'Segoe UI' }),
        new TextRun({ text: '• Queue conversions, reports, bulk imports and AI background jobs.\n', size: 18, font: 'Segoe UI' }),
        new TextRun({ text: '• Track cost per hospital, active user, document, AI job and released report.\n', size: 18, font: 'Segoe UI' }),
        new TextRun({ text: '• Meter premium AI, expert review, data migration, physical audits and 24x7 support as separate add-ons.', size: 18, font: 'Segoe UI' })
      ]
    })
  );

  // Document Assembly
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
                  new TextRun({ text: 'INOFINIX  ·  NABH Pulse  ·  Architecture and Estimates Plan', size: 15, color: '94A3B8', font: 'Segoe UI' })
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
                  new TextRun({ text: 'Inofinix · NABH Pulse · Architecture and estimates  ·  Page ', size: 15, color: '94A3B8', font: 'Segoe UI' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 15, color: '94A3B8', font: 'Segoe UI' }),
                  new TextRun({ text: ' of ', size: 15, color: '94A3B8', font: 'Segoe UI' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 15, color: '94A3B8', font: 'Segoe UI' })
                ]
              })
            ]
          })
        },
        children: docChildren
      }
    ]
  });

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
