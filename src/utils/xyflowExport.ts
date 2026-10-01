import { toPng, toSvg, toJpeg, toBlob } from 'html-to-image';
import { getNodesBounds, getViewportForBounds, Node, Edge } from '@xyflow/react';

export type ExportTheme = 'dark' | 'light' | 'blueprint' | 'midnight' | 'transparent';

export interface ExportFlowOptions {
  fileName?: string;
  scope?: 'full' | 'viewport';
  theme?: ExportTheme;
  pixelRatio?: number;
  includeWatermark?: boolean;
  watermarkTitle?: string;
  watermarkSubtitle?: string;
  nodes?: Node[];
}

export function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, fileName);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Resolves background color based on selected theme
 */
function resolveBgColor(theme?: ExportTheme): string | undefined {
  if (theme === 'light') return '#ffffff';
  if (theme === 'transparent') return undefined;
  if (theme === 'blueprint') return '#071324';
  if (theme === 'midnight') return '#000000';
  return '#020617'; // slate-950 dark theme
}

/**
 * Filter function to exclude floating interactive UI widgets from the downloaded snapshot
 */
function defaultNodeFilter(domNode: HTMLElement): boolean {
  if (!domNode || !domNode.classList) return true;
  // Exclude ReactFlow controls panel and minimap if desired, or interactive modals
  if (domNode.classList.contains('export-exclude')) return false;
  if (domNode.classList.contains('react-flow__controls')) return false;
  return true;
}

/**
 * Export XYFlow Canvas as High-Resolution PNG
 */
export async function exportFlowAsPng(
  containerEl: HTMLElement,
  options: ExportFlowOptions = {}
): Promise<string> {
  const {
    fileName = 'nova-h-architecture-diagram.png',
    scope = 'full',
    theme = 'dark',
    pixelRatio = 2,
    nodes = []
  } = options;

  const bgColor = resolveBgColor(theme);
  const viewportEl = containerEl.querySelector('.react-flow__viewport') as HTMLElement | null;

  // If full architecture scope is selected and nodes are available
  if (scope === 'full' && nodes.length > 0 && viewportEl) {
    try {
      const bounds = getNodesBounds(nodes);
      const padding = 100;
      const imageWidth = Math.max(1400, Math.round(bounds.width + padding * 2));
      const imageHeight = Math.max(900, Math.round(bounds.height + padding * 2));
      const transform = getViewportForBounds(
        bounds,
        imageWidth,
        imageHeight,
        0.1,
        2,
        0.12
      );

      const dataUrl = await toPng(viewportEl, {
        backgroundColor: bgColor,
        width: imageWidth,
        height: imageHeight,
        pixelRatio,
        skipFonts: true,
        cacheBust: true,
        filter: defaultNodeFilter,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`
        }
      });

      downloadDataUrl(dataUrl, fileName);
      return dataUrl;
    } catch (err) {
      console.warn('Full bounds export failed, falling back to container snapshot:', err);
    }
  }

  // Viewport / fallback capture
  const targetEl = containerEl;
  const dataUrl = await toPng(targetEl, {
    backgroundColor: bgColor,
    pixelRatio,
    skipFonts: true,
    cacheBust: true,
    filter: defaultNodeFilter
  });

  downloadDataUrl(dataUrl, fileName);
  return dataUrl;
}

/**
 * Export XYFlow Canvas as Scalable Vector Graphics (SVG)
 */
export async function exportFlowAsSvg(
  containerEl: HTMLElement,
  options: ExportFlowOptions = {}
): Promise<string> {
  const {
    fileName = 'nova-h-architecture-diagram.svg',
    scope = 'full',
    theme = 'dark',
    nodes = []
  } = options;

  const bgColor = resolveBgColor(theme);
  const viewportEl = containerEl.querySelector('.react-flow__viewport') as HTMLElement | null;

  if (scope === 'full' && nodes.length > 0 && viewportEl) {
    try {
      const bounds = getNodesBounds(nodes);
      const padding = 100;
      const imageWidth = Math.max(1400, Math.round(bounds.width + padding * 2));
      const imageHeight = Math.max(900, Math.round(bounds.height + padding * 2));
      const transform = getViewportForBounds(
        bounds,
        imageWidth,
        imageHeight,
        0.1,
        2,
        0.12
      );

      const dataUrl = await toSvg(viewportEl, {
        backgroundColor: bgColor,
        width: imageWidth,
        height: imageHeight,
        skipFonts: true,
        cacheBust: true,
        filter: defaultNodeFilter,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`
        }
      });

      downloadDataUrl(dataUrl, fileName);
      return dataUrl;
    } catch (err) {
      console.warn('SVG full bounds export failed, falling back to container snapshot:', err);
    }
  }

  const dataUrl = await toSvg(containerEl, {
    backgroundColor: bgColor,
    skipFonts: true,
    cacheBust: true,
    filter: defaultNodeFilter
  });

  downloadDataUrl(dataUrl, fileName);
  return dataUrl;
}

/**
 * Export XYFlow Canvas as JPEG
 */
export async function exportFlowAsJpeg(
  containerEl: HTMLElement,
  options: ExportFlowOptions = {}
): Promise<string> {
  const {
    fileName = 'nova-h-architecture-diagram.jpg',
    scope = 'full',
    theme = 'dark',
    pixelRatio = 2,
    nodes = []
  } = options;

  const bgColor = theme === 'light' ? '#ffffff' : '#020617'; // JPEG requires opaque background
  const viewportEl = containerEl.querySelector('.react-flow__viewport') as HTMLElement | null;

  if (scope === 'full' && nodes.length > 0 && viewportEl) {
    try {
      const bounds = getNodesBounds(nodes);
      const padding = 100;
      const imageWidth = Math.max(1400, Math.round(bounds.width + padding * 2));
      const imageHeight = Math.max(900, Math.round(bounds.height + padding * 2));
      const transform = getViewportForBounds(bounds, imageWidth, imageHeight, 0.1, 2, 0.12);

      const dataUrl = await toJpeg(viewportEl, {
        quality: 0.95,
        backgroundColor: bgColor,
        width: imageWidth,
        height: imageHeight,
        pixelRatio,
        skipFonts: true,
        cacheBust: true,
        filter: defaultNodeFilter,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`
        }
      });

      downloadDataUrl(dataUrl, fileName);
      return dataUrl;
    } catch (err) {
      console.warn('JPEG full bounds export failed:', err);
    }
  }

  const dataUrl = await toJpeg(containerEl, {
    quality: 0.95,
    backgroundColor: bgColor,
    pixelRatio,
    skipFonts: true,
    cacheBust: true,
    filter: defaultNodeFilter
  });

  downloadDataUrl(dataUrl, fileName);
  return dataUrl;
}

/**
 * Copy diagram image directly to clipboard as PNG
 */
export async function copyFlowToClipboard(
  containerEl: HTMLElement,
  options: ExportFlowOptions = {}
): Promise<boolean> {
  const {
    theme = 'dark',
    pixelRatio = 2,
    scope = 'full',
    nodes = []
  } = options;

  const bgColor = resolveBgColor(theme);
  const viewportEl = containerEl.querySelector('.react-flow__viewport') as HTMLElement | null;

  let targetEl: HTMLElement = containerEl;
  let customOptions: Record<string, unknown> = {
    backgroundColor: bgColor,
    pixelRatio,
    skipFonts: true,
    cacheBust: true,
    filter: defaultNodeFilter
  };

  if (scope === 'full' && nodes.length > 0 && viewportEl) {
    try {
      const bounds = getNodesBounds(nodes);
      const padding = 100;
      const imageWidth = Math.max(1400, Math.round(bounds.width + padding * 2));
      const imageHeight = Math.max(900, Math.round(bounds.height + padding * 2));
      const transform = getViewportForBounds(bounds, imageWidth, imageHeight, 0.1, 2, 0.12);

      targetEl = viewportEl;
      customOptions = {
        ...customOptions,
        width: imageWidth,
        height: imageHeight,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`
        }
      };
    } catch {
      targetEl = containerEl;
    }
  }

  const blob = await toBlob(targetEl, customOptions);
  if (!blob) throw new Error('Could not create image blob');

  if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    return true;
  }
  throw new Error('ClipboardItem API not supported in this browser environment');
}

/**
 * Export XYFlow Architecture Graph as JSON
 */
export function exportFlowAsJson(
  title: string,
  nodes: Node[],
  edges: Edge[],
  nodeDetails: Record<string, unknown>,
  fileName = 'nova-h-architecture-graph.json'
) {
  const payload = {
    schemaVersion: '1.0.0',
    title,
    exportedAt: new Date().toISOString(),
    engine: '@xyflow/react',
    stats: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      tiers: 7
    },
    nodes,
    edges,
    nodeDetails
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, fileName);
}

/**
 * Export Comprehensive Markdown Technical Blueprint
 */
export function exportFlowAsMarkdown(
  title: string,
  nodes: Node[],
  edges: Edge[],
  nodeDetails: Record<string, {
    title: string;
    category: string;
    role: string;
    techStack: string;
    throughput: string;
    sla: string;
    security: string[];
    codeSample: string;
  }>,
  fileName = 'nova-h-architecture-spec.md'
) {
  const timestamp = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let md = `# ${title}\n\n`;
  md += `> **System Architecture Specification Document**  \n`;
  md += `> Generated on: ${timestamp}  \n`;
  md += `> Diagram Engine: **XYFlow (@xyflow/react)**  \n\n`;

  md += `## 1. Architecture Overview\n\n`;
  md += `The NOVA-H cloud infrastructure is structured across **7 functional tiers** engineered for zero-trust security, sub-50ms transaction latency, sealed procurement bidding, and multi-channel communication (Meta WhatsApp Cloud API + Amazon SES).\n\n`;

  md += `| Metric | Target Specification |\n`;
  md += `| :--- | :--- |\n`;
  md += `| **Primary Runtime** | Node.js 22 LTS + Fastify (TypeScript) |\n`;
  md += `| **Database** | PostgreSQL 16 (Multi-AZ with Drizzle ORM) |\n`;
  md += `| **Queue & Worker Engine** | Redis 7 + BullMQ |\n`;
  md += `| **Object Store & Vault** | Cloudflare R2 ($0 Egress Bandwidth Fees) |\n`;
  md += `| **Messaging Ingestion** | Meta WhatsApp Cloud API (Graph v21.0) |\n`;
  md += `| **Email Gateway** | Amazon SES Dedicated Relay |\n`;
  md += `| **Global Edge & WAF** | Cloudflare Enterprise (TLS 1.3 / L7 DDoS Defense) |\n\n`;

  md += `## 2. Infrastructure Components Specification\n\n`;

  nodes.forEach((n) => {
    const detail = nodeDetails[n.id];
    const label = (n.data?.label as string) || n.id;
    const category = (n.data?.category as string) || 'service';
    const tech = (n.data?.tech as string) || '';

    md += `### ${label} (${category.toUpperCase()})\n\n`;
    if (detail) {
      md += `* **Role**: ${detail.role}\n`;
      md += `* **Tech Stack**: \`${detail.techStack}\`\n`;
      md += `* **Throughput / Scale**: ${detail.throughput}\n`;
      md += `* **SLA**: ${detail.sla}\n\n`;

      if (detail.security && detail.security.length > 0) {
        md += `#### Security Safeguards:\n`;
        detail.security.forEach(s => {
          md += `- [x] ${s}\n`;
        });
        md += `\n`;
      }

      if (detail.codeSample) {
        md += `#### Implementation Reference:\n\`\`\`typescript\n${detail.codeSample}\n\`\`\`\n\n`;
      }
    } else {
      md += `* **Tech**: ${tech}\n\n`;
    }
  });

  md += `## 3. Data Pipelines & Topology Edges\n\n`;
  md += `Total active directional connections: **${edges.length} edges**.\n\n`;
  edges.forEach((e) => {
    md += `- **${e.source}** ➔ **${e.target}** (\`${e.label || 'Data Flow'}\`)\n`;
  });

  md += `\n---\n*Exported from NOVA-H Healthcare Infrastructure Engine.*`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, fileName);
}
