import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  WhatsAppNode, 
  WhatsAppNodeType 
} from '../../types';
import { 
  Zap, 
  ListFilter, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  MessageSquare,
  Trash2,
  Eye,
  Settings2,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Check
} from 'lucide-react';

export interface WhatsAppFlowNodeData extends Record<string, unknown> {
  node: WhatsAppNode;
  isActive: boolean;
  isStart: boolean;
  onSelectNode: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
}

export const WhatsAppFlowNode = memo(({ data }: NodeProps) => {
  const { node, isActive, isStart, onSelectNode, onDeleteNode } = data as unknown as WhatsAppFlowNodeData;

  const getNodeTypeBadge = (type: WhatsAppNodeType) => {
    switch (type) {
      case 'button':
        return { label: 'Quick Reply (Buttons)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Zap };
      case 'list':
        return { label: 'Interactive List Menu', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: ListFilter };
      case 'flow_screen':
        return { label: 'Meta WhatsApp Form', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Sparkles };
      case 'media_cta':
        return { label: 'Media + Call/URL', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: ExternalLink };
      case 'agent_handover':
        return { label: 'Agent Escalation', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: ShieldCheck };
      default:
        return { label: 'Message Step', color: 'bg-slate-700/50 text-slate-300 border-slate-600', icon: MessageSquare };
    }
  };

  const badge = getNodeTypeBadge(node.type);
  const Icon = badge.icon;

  return (
    <div 
      onClick={() => onSelectNode(node.id)}
      className={`w-72 sm:w-80 rounded-2xl transition-all select-none text-left font-sans cursor-pointer relative ${
        isActive 
          ? 'bg-slate-900/95 border-2 border-emerald-400 shadow-2xl shadow-emerald-500/20 ring-4 ring-emerald-500/20' 
          : 'bg-slate-900/90 border border-slate-700/80 hover:border-slate-500/90 shadow-xl'
      }`}
    >
      {/* Target Inbound Connection Handles */}
      {/* Top Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-900 !rounded-full shadow-md !-top-2 transition-transform hover:!scale-125"
      />
      {/* Left Target Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-900 !rounded-full shadow-md !-left-2 transition-transform hover:!scale-125"
      />

      {/* Node Top Header */}
      <div className="px-3.5 py-2.5 bg-slate-950/70 border-b border-slate-800 rounded-t-2xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
            isActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
          }`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-black text-white truncate">
            {node.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isStart ? (
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Trigger
            </span>
          ) : (
            onDeleteNode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNode(node.id);
                }}
                className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                title="Delete Step"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Node Body Card */}
      <div className="p-3.5 space-y-2.5">
        {/* Type Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${badge.color}`}>
            <Icon className="w-3 h-3" />
            <span>{badge.label}</span>
          </span>

          {isActive && (
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
              <Check className="w-3 h-3" /> Active
            </span>
          )}
        </div>

        {/* Header Preview if image or document */}
        {node.headerType === 'image' && node.headerContent && (
          <div className="w-full h-20 rounded-lg overflow-hidden relative border border-slate-800 bg-slate-950">
            <img 
              src={node.headerContent} 
              alt="Header Preview" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer" 
            />
            <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded font-bold">
              Image Banner
            </span>
          </div>
        )}

        {node.headerType === 'text' && node.headerContent && (
          <div className="px-2.5 py-1 bg-slate-800/80 rounded border border-slate-700/60 text-[11px] font-black text-amber-300 uppercase tracking-wider truncate">
            {node.headerContent}
          </div>
        )}

        {/* Message Body Preview */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line font-normal">
            {node.bodyText}
          </p>
          {node.footerText && (
            <p className="text-[10px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-800/60 truncate">
              {node.footerText}
            </p>
          )}
        </div>

        {/* Interactive Elements / Branching Handles */}
        <div className="space-y-1.5 pt-1">
          {/* CASE 1: Quick Reply Buttons */}
          {node.type === 'button' && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Quick Reply Options (Drag to Link):
              </div>
              {node.buttons && node.buttons.length > 0 ? (
                node.buttons.map((btn, idx) => (
                  <div
                    key={btn.id}
                    className="relative flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-700/40 hover:border-emerald-500/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 pr-4">
                      <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-emerald-200 truncate">
                        {btn.title || `Button ${idx + 1}`}
                      </span>
                    </div>

                    {btn.nextNodeId ? (
                      <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-600/40 shrink-0">
                        Linked
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-500 italic shrink-0">
                        Drop to link
                      </span>
                    )}

                    {/* Dedicated Source Handle on Right */}
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`btn-${btn.id}`}
                      className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-900 !rounded-full shadow-md !-right-2 transition-transform hover:!scale-125 hover:!bg-emerald-300"
                    />
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic p-2 bg-slate-950/40 rounded">
                  No buttons configured
                </div>
              )}
            </div>
          )}

          {/* CASE 2: Interactive List Menu */}
          {node.type === 'list' && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                List Menu Options:
              </div>
              <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-700/30 text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <ListFilter className="w-3.5 h-3.5 text-blue-400" />
                <span>{node.listButtonText || 'Select Option'}</span>
              </div>

              {node.listSections?.flatMap(s => s.rows).map((row) => (
                <div 
                  key={row.id}
                  className="relative flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-blue-500/50 transition-colors"
                >
                  <div className="min-w-0 pr-4">
                    <div className="text-xs font-bold text-slate-200 truncate">
                      {row.title}
                    </div>
                    {row.description && (
                      <div className="text-[10px] text-slate-400 truncate">
                        {row.description}
                      </div>
                    )}
                  </div>

                  {row.nextNodeId ? (
                    <span className="text-[9px] font-semibold text-blue-400 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-600/40 shrink-0">
                      Linked
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-500 italic shrink-0">
                      Unlinked
                    </span>
                  )}

                  {/* Handle for List Row */}
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`row-${row.id}`}
                    className="!w-3.5 !h-3.5 !bg-blue-400 !border-2 !border-slate-900 !rounded-full shadow-md !-right-2 transition-transform hover:!scale-125"
                  />
                </div>
              ))}
            </div>
          )}

          {/* CASE 3: WhatsApp Native Form Screen */}
          {node.type === 'flow_screen' && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Meta Screen Submission:
              </div>
              <div className="relative p-2.5 rounded-lg bg-purple-950/40 border border-purple-700/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <div>
                    <span className="text-xs font-bold text-purple-200 block">
                      {node.flowScreen?.submitButtonTitle || 'Submit & Proceed'}
                    </span>
                    <span className="text-[10px] text-purple-300/80">
                      {node.flowScreen?.fields.length || 0} intake form fields
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-bold text-purple-300 bg-purple-900/60 px-1.5 py-0.5 rounded border border-purple-600/40">
                  {node.flowScreen?.nextNodeId ? 'Linked' : 'On Submit'}
                </span>

                <Handle
                  type="source"
                  position={Position.Right}
                  id="submit"
                  className="!w-3.5 !h-3.5 !bg-purple-400 !border-2 !border-slate-900 !rounded-full shadow-md !-right-2 transition-transform hover:!scale-125"
                />
              </div>
            </div>
          )}

          {/* CASE 4: Media CTA or Agent Handover or default Next Step */}
          {node.type !== 'button' && node.type !== 'list' && node.type !== 'flow_screen' && (
            <div className="pt-1">
              <div className="relative flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-500 transition-colors">
                <span className="text-xs font-bold text-slate-200">
                  Next Step Continuation
                </span>

                {node.nextNodeId ? (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-600/40">
                    Linked
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-500 italic">
                    Drag handle
                  </span>
                )}

                <Handle
                  type="source"
                  position={Position.Right}
                  id="next"
                  className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-900 !rounded-full shadow-md !-right-2 transition-transform hover:!scale-125"
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Node Footer Actions */}
        <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode(node.id);
            }}
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Configure</span>
          </button>

          <span className="text-[10px] text-slate-500 font-mono">
            {node.id}
          </span>
        </div>
      </div>

      {/* Bottom Fallback Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-900 !rounded-full shadow-md !-bottom-2 transition-transform hover:!scale-125"
      />
    </div>
  );
});

WhatsAppFlowNode.displayName = 'WhatsAppFlowNode';
