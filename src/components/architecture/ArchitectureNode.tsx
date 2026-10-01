import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Server, 
  Database, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Cloud, 
  MessageSquare, 
  Mail, 
  FileText, 
  HardDrive, 
  Activity, 
  Users, 
  Globe, 
  Zap, 
  Lock, 
  CheckCircle2,
  LucideIcon
} from 'lucide-react';

export type ArchCategory = 
  | 'client' 
  | 'edge' 
  | 'gateway' 
  | 'service' 
  | 'queue' 
  | 'database' 
  | 'storage' 
  | 'external';

export type CanvasThemeMode = 'dark' | 'light' | 'blueprint' | 'midnight';

export interface ArchNodeData extends Record<string, unknown> {
  label: string;
  sublabel: string;
  category: ArchCategory;
  tech: string;
  throughput?: string;
  badge?: string;
  flowTags: string[]; // e.g. ['rfp', 'whatsapp', 'mjml', 'storage']
  activeFlowFilter: string; // 'all' or specific tag
  isSelected: boolean;
  themeMode?: CanvasThemeMode;
  onSelectNode: (nodeId: string) => void;
}

const CATEGORY_STYLES: Record<ArchCategory, {
  border: string;
  bg: string;
  headerBg: string;
  textColor: string;
  icon: LucideIcon;
  dotColor: string;
  lightHeaderBg: string;
  lightBorder: string;
  lightTextColor: string;
  blueprintHeaderBg: string;
  blueprintTextColor: string;
}> = {
  client: {
    border: 'border-sky-500/40 dark:border-sky-500/40',
    bg: 'bg-sky-50/70 dark:bg-sky-950/40',
    headerBg: 'bg-sky-100/90 dark:bg-sky-900/60',
    textColor: 'text-sky-700 dark:text-sky-300',
    icon: Users,
    dotColor: 'bg-sky-500',
    lightHeaderBg: 'bg-sky-100 text-sky-900 border-sky-200',
    lightBorder: 'border-sky-300 hover:border-sky-400',
    lightTextColor: 'text-sky-800',
    blueprintHeaderBg: 'bg-sky-950/90 text-sky-300 border-sky-800/60',
    blueprintTextColor: 'text-sky-300'
  },
  edge: {
    border: 'border-orange-500/40 dark:border-orange-500/40',
    bg: 'bg-orange-50/70 dark:bg-orange-950/40',
    headerBg: 'bg-orange-100/90 dark:bg-orange-900/60',
    textColor: 'text-orange-700 dark:text-orange-300',
    icon: Globe,
    dotColor: 'bg-orange-500',
    lightHeaderBg: 'bg-orange-100 text-orange-900 border-orange-200',
    lightBorder: 'border-orange-300 hover:border-orange-400',
    lightTextColor: 'text-orange-800',
    blueprintHeaderBg: 'bg-orange-950/90 text-orange-300 border-orange-800/60',
    blueprintTextColor: 'text-orange-300'
  },
  gateway: {
    border: 'border-blue-500/40 dark:border-blue-500/40',
    bg: 'bg-blue-50/70 dark:bg-blue-950/40',
    headerBg: 'bg-blue-100/90 dark:bg-blue-900/60',
    textColor: 'text-blue-700 dark:text-blue-300',
    icon: Server,
    dotColor: 'bg-blue-500',
    lightHeaderBg: 'bg-blue-100 text-blue-900 border-blue-200',
    lightBorder: 'border-blue-300 hover:border-blue-400',
    lightTextColor: 'text-blue-800',
    blueprintHeaderBg: 'bg-blue-950/90 text-blue-300 border-blue-800/60',
    blueprintTextColor: 'text-blue-300'
  },
  service: {
    border: 'border-indigo-500/40 dark:border-indigo-500/40',
    bg: 'bg-indigo-50/70 dark:bg-indigo-950/40',
    headerBg: 'bg-indigo-100/90 dark:bg-indigo-900/60',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    icon: Cpu,
    dotColor: 'bg-indigo-500',
    lightHeaderBg: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    lightBorder: 'border-indigo-300 hover:border-indigo-400',
    lightTextColor: 'text-indigo-800',
    blueprintHeaderBg: 'bg-indigo-950/90 text-indigo-300 border-indigo-800/60',
    blueprintTextColor: 'text-indigo-300'
  },
  queue: {
    border: 'border-amber-500/40 dark:border-amber-500/40',
    bg: 'bg-amber-50/70 dark:bg-amber-950/40',
    headerBg: 'bg-amber-100/90 dark:bg-amber-900/60',
    textColor: 'text-amber-700 dark:text-amber-300',
    icon: Zap,
    dotColor: 'bg-amber-500',
    lightHeaderBg: 'bg-amber-100 text-amber-900 border-amber-200',
    lightBorder: 'border-amber-300 hover:border-amber-400',
    lightTextColor: 'text-amber-800',
    blueprintHeaderBg: 'bg-amber-950/90 text-amber-300 border-amber-800/60',
    blueprintTextColor: 'text-amber-300'
  },
  database: {
    border: 'border-emerald-500/40 dark:border-emerald-500/40',
    bg: 'bg-emerald-50/70 dark:bg-emerald-950/40',
    headerBg: 'bg-emerald-100/90 dark:bg-emerald-900/60',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    icon: Database,
    dotColor: 'bg-emerald-500',
    lightHeaderBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    lightBorder: 'border-emerald-300 hover:border-emerald-400',
    lightTextColor: 'text-emerald-800',
    blueprintHeaderBg: 'bg-emerald-950/90 text-emerald-300 border-emerald-800/60',
    blueprintTextColor: 'text-emerald-300'
  },
  storage: {
    border: 'border-cyan-500/40 dark:border-cyan-500/40',
    bg: 'bg-cyan-50/70 dark:bg-cyan-950/40',
    headerBg: 'bg-cyan-100/90 dark:bg-cyan-900/60',
    textColor: 'text-cyan-700 dark:text-cyan-300',
    icon: HardDrive,
    dotColor: 'bg-cyan-500',
    lightHeaderBg: 'bg-cyan-100 text-cyan-900 border-cyan-200',
    lightBorder: 'border-cyan-300 hover:border-cyan-400',
    lightTextColor: 'text-cyan-800',
    blueprintHeaderBg: 'bg-cyan-950/90 text-cyan-300 border-cyan-800/60',
    blueprintTextColor: 'text-cyan-300'
  },
  external: {
    border: 'border-rose-500/40 dark:border-rose-500/40',
    bg: 'bg-rose-50/70 dark:bg-rose-950/40',
    headerBg: 'bg-rose-100/90 dark:bg-rose-900/60',
    textColor: 'text-rose-700 dark:text-rose-300',
    icon: Activity,
    dotColor: 'bg-rose-500',
    lightHeaderBg: 'bg-rose-100 text-rose-900 border-rose-200',
    lightBorder: 'border-rose-300 hover:border-rose-400',
    lightTextColor: 'text-rose-800',
    blueprintHeaderBg: 'bg-rose-950/90 text-rose-300 border-rose-800/60',
    blueprintTextColor: 'text-rose-300'
  }
};

export const ArchitectureNode = memo(({ id, data }: NodeProps) => {
  const nodeData = data as unknown as ArchNodeData;
  const {
    label,
    sublabel,
    category,
    tech,
    throughput,
    badge,
    flowTags,
    activeFlowFilter,
    isSelected,
    themeMode = 'dark',
    onSelectNode
  } = nodeData;

  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.service;
  const Icon = style.icon;

  // Dim node if filter is applied and this node doesn't match
  const isDimmed = activeFlowFilter !== 'all' && !flowTags.includes(activeFlowFilter);

  // Theme-specific styles
  const isLight = themeMode === 'light';
  const isBlueprint = themeMode === 'blueprint';
  const isMidnight = themeMode === 'midnight';

  // Dynamic Card Styles
  let containerThemeClass = `${style.border} ${style.bg} backdrop-blur-md shadow-md`;
  let headerThemeClass = style.headerBg;
  let headerTextClass = style.textColor;
  let titleColorClass = 'text-slate-900 dark:text-white';
  let sublabelColorClass = 'text-slate-600 dark:text-slate-300';
  let badgeThemeClass = 'bg-white/70 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 border-black/5 dark:border-white/5';
  let footerBorderClass = 'border-black/5 dark:border-white/10';
  let techTextClass = 'text-slate-700 dark:text-slate-300';
  let throughputClass = 'text-emerald-600 dark:text-emerald-400';
  let selectionClass = isSelected
    ? 'ring-3 ring-blue-500 dark:ring-blue-400 shadow-xl scale-[1.03] z-20'
    : 'hover:shadow-lg hover:scale-[1.01]';
  let handleTargetClass = '!bg-slate-400 dark:!bg-slate-600 !border-2 !border-white dark:!border-slate-900';
  let handleSourceClass = '!bg-blue-600 !border-2 !border-white dark:!border-slate-900';

  if (isLight) {
    containerThemeClass = `bg-white border-2 ${style.lightBorder} shadow-lg shadow-slate-200/60`;
    headerThemeClass = `${style.lightHeaderBg} border-b`;
    headerTextClass = style.lightTextColor;
    titleColorClass = 'text-slate-900';
    sublabelColorClass = 'text-slate-600';
    badgeThemeClass = 'bg-white text-slate-800 border-slate-200 shadow-2xs font-semibold';
    footerBorderClass = 'border-slate-200/80';
    techTextClass = 'text-slate-800 font-bold';
    throughputClass = 'text-emerald-700 font-bold';
    selectionClass = isSelected
      ? 'ring-3 ring-blue-600 shadow-2xl scale-[1.03] z-20'
      : 'hover:shadow-xl hover:scale-[1.01]';
    handleTargetClass = '!bg-slate-400 !border-2 !border-white';
    handleSourceClass = '!bg-blue-600 !border-2 !border-white';
  } else if (isBlueprint) {
    containerThemeClass = `bg-[#0c223f]/95 border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.18)]`;
    headerThemeClass = `${style.blueprintHeaderBg} border-b border-cyan-500/30`;
    headerTextClass = style.blueprintTextColor;
    titleColorClass = 'text-cyan-100 font-mono tracking-tight';
    sublabelColorClass = 'text-cyan-200/80';
    badgeThemeClass = 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60 font-mono';
    footerBorderClass = 'border-cyan-500/20';
    techTextClass = 'text-cyan-300 font-mono';
    throughputClass = 'text-teal-300 font-mono font-bold';
    selectionClass = isSelected
      ? 'ring-3 ring-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.45)] scale-[1.03] z-20'
      : 'hover:shadow-cyan-900/30 hover:scale-[1.01]';
    handleTargetClass = '!bg-cyan-700 !border-2 !border-[#071324]';
    handleSourceClass = '!bg-cyan-400 !border-2 !border-[#071324]';
  } else if (isMidnight) {
    containerThemeClass = `bg-zinc-950/95 border-2 border-zinc-800 shadow-[0_0_25px_rgba(0,0,0,0.95)]`;
    headerThemeClass = `bg-zinc-900/90 border-b border-zinc-800`;
    headerTextClass = style.textColor;
    titleColorClass = 'text-white';
    sublabelColorClass = 'text-zinc-400';
    badgeThemeClass = 'bg-zinc-900 text-zinc-200 border-zinc-700 font-mono';
    footerBorderClass = 'border-zinc-800';
    techTextClass = 'text-zinc-300 font-mono';
    throughputClass = 'text-emerald-400 font-bold';
    selectionClass = isSelected
      ? 'ring-3 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.6)] scale-[1.03] z-20'
      : 'hover:shadow-black hover:scale-[1.01]';
    handleTargetClass = '!bg-zinc-600 !border-2 !border-black';
    handleSourceClass = '!bg-blue-500 !border-2 !border-black';
  }

  return (
    <div
      onClick={() => onSelectNode && onSelectNode(id)}
      className={`relative w-64 rounded-2xl transition-all select-none text-left font-sans cursor-pointer ${
        containerThemeClass
      } ${
        selectionClass
      } ${isDimmed ? 'opacity-25 grayscale' : 'opacity-100'}`}
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className={`!w-3 !h-3 ${handleTargetClass}`}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={`!w-3 !h-3 ${handleSourceClass}`}
      />

      {/* Side Handles for Lateral Data Transfers */}
      <Handle
        type="target"
        id="left-in"
        position={Position.Left}
        className={`!w-2.5 !h-2.5 ${handleTargetClass}`}
      />
      <Handle
        type="source"
        id="right-out"
        position={Position.Right}
        className={`!w-2.5 !h-2.5 ${handleSourceClass}`}
      />

      {/* Header bar */}
      <div className={`px-3.5 py-2.5 rounded-t-2xl flex items-center justify-between ${headerThemeClass}`}>
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-white/80 dark:bg-slate-800/80 shadow-2xs">
            <Icon className={`w-3.5 h-3.5 ${headerTextClass}`} />
          </div>
          <span className={`text-[11px] font-black uppercase tracking-wider ${headerTextClass}`}>
            {category}
          </span>
        </div>
        
        {badge && (
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${badgeThemeClass}`}>
            {badge}
          </span>
        )}
      </div>

      {/* Body content */}
      <div className="p-3.5 space-y-1.5">
        <h4 className={`font-extrabold text-xs leading-tight ${titleColorClass}`}>
          {label}
        </h4>
        <p className={`text-[11px] leading-snug ${sublabelColorClass}`}>
          {sublabel}
        </p>

        {/* Tech & Throughput metadata footer */}
        <div className={`pt-2 mt-2 border-t flex items-center justify-between text-[10px] ${footerBorderClass}`}>
          <span className={`truncate max-w-[130px] ${techTextClass}`}>
            {tech}
          </span>
          {throughput && (
            <span className={throughputClass}>
              {throughput}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

ArchitectureNode.displayName = 'ArchitectureNode';
