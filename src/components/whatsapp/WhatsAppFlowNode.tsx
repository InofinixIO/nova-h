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
  Settings2,
  Check,
  Store,
  ShoppingCart,
  ShoppingBag,
  Image as ImageIcon
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
      case 'text_buttons':
      case 'button':
        return { label: 'Text Buttons', color: 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', icon: Zap };
      case 'media_buttons':
        return { label: 'Media Buttons', color: 'bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30', icon: ImageIcon };
      case 'list':
        return { label: 'List Menu', color: 'bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30', icon: ListFilter };
      case 'catalogue':
        return { label: 'Catalogue Message', color: 'bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30', icon: Store };
      case 'single_product':
        return { label: 'Single Product', color: 'bg-emerald-500/20 dark:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border-emerald-500/40', icon: ShoppingCart };
      case 'multi_product':
        return { label: 'Multi Product', color: 'bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30', icon: ShoppingBag };
      case 'template':
        return { label: 'Meta Template', color: 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', icon: Zap };
      case 'flow_screen':
        return { label: 'Meta WhatsApp Form', color: 'bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30', icon: Sparkles };
      case 'media_cta':
        return { label: 'Media + Call/URL', color: 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', icon: ExternalLink };
      case 'agent_handover':
        return { label: 'Agent Escalation', color: 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', icon: ShieldCheck };
      default:
        return { label: 'Message Step', color: 'bg-slate-200/70 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600', icon: MessageSquare };
    }
  };

  const badge = getNodeTypeBadge(node.type);
  const Icon = badge.icon;
  const isButtonType = node.type === 'text_buttons' || node.type === 'button' || node.type === 'media_buttons';

  return (
    <div 
      onClick={() => onSelectNode(node.id)}
      className={`w-72 sm:w-80 rounded-2xl transition-all select-none text-left font-sans cursor-pointer relative ${
        isActive 
          ? 'bg-white dark:bg-slate-900/95 border-2 border-emerald-500 dark:border-emerald-400 shadow-2xl shadow-emerald-500/20 ring-4 ring-emerald-500/20' 
          : 'bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-500/90 shadow-lg dark:shadow-xl'
      }`}
    >
      {/* Target Inbound Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        className="!w-3.5 !h-3.5 !bg-emerald-500 dark:!bg-emerald-400 !border-2 !border-white dark:!border-slate-900 !rounded-full shadow-md !-top-2 transition-transform hover:!scale-125"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        className="!w-3.5 !h-3.5 !bg-emerald-500 dark:!bg-emerald-400 !border-2 !border-white dark:!border-slate-900 !rounded-full shadow-md !-left-2 transition-transform hover:!scale-125"
      />

      {/* Node Top Header */}
      <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 rounded-t-2xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
            isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-white truncate">
            {node.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isStart ? (
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
              Trigger
            </span>
          ) : (
            onDeleteNode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNode(node.id);
                }}
                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
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
        {(node.headerType === 'image' || node.type === 'media_buttons') && node.headerContent && (
          <div className="w-full h-20 rounded-lg overflow-hidden relative border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
            <img 
              src={node.headerContent} 
              alt="Header Preview" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer" 
            />
            <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded font-bold">
              Media Attachment
            </span>
          </div>
        )}

        {node.headerType === 'text' && node.headerContent && (
          <div className="px-2.5 py-1 bg-amber-50 dark:bg-slate-800/80 rounded border border-amber-200 dark:border-slate-700/60 text-[11px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider truncate">
            {node.headerContent}
          </div>
        )}

        {/* Message Body Preview */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
          <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line font-normal">
            {node.bodyText}
          </p>
          {node.footerText && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800/60 truncate">
              {node.footerText}
            </p>
          )}
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE MESSAGE TYPE BRANCHING PREVIEWS & HANDLES */}
        {/* ========================================================================= */}
        <div className="space-y-1.5 pt-1">
          
          {/* TYPE 1 & 2: Text Buttons / Media Buttons */}
          {isButtonType && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                Quick Reply Options (Drag to Link):
              </div>
              {node.buttons && node.buttons.length > 0 ? (
                node.buttons.map((btn, idx) => (
                  <div
                    key={btn.id}
                    className="relative flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/40 hover:border-emerald-400 dark:hover:border-emerald-500/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 pr-4">
                      <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                        {btn.title || `Button ${idx + 1}`}
                      </span>
                    </div>

                    {btn.nextNodeId ? (
                      <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-600/40 shrink-0">
                        Linked
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 italic shrink-0">
                        Drop to link
                      </span>
                    )}

                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`btn-${btn.id}`}
                      className="!w-3.5 !h-3.5 !bg-emerald-500 dark:!bg-emerald-400 !border-2 !border-white dark:!border-slate-900 !rounded-full shadow-md !-right-2 transition-transform hover:!scale-125 hover:!bg-emerald-300"
                    />
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 dark:text-slate-500 italic p-2 bg-slate-50 dark:bg-slate-950/40 rounded border border-slate-200 dark:border-slate-800">
                  No buttons configured
                </div>
              )}
            </div>
          )}

          {/* TYPE 3: Interactive List Menu */}
          {node.type === 'list' && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                List Menu Options:
              </div>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700/30 text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <ListFilter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{node.listButtonText || 'Select Option'}</span>
              </div>

              {node.listSections?.flatMap(s => s.rows).map((row) => (
                <div 
                  key={row.id}
                  className="relative flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 transition-colors"
                >
                  <div className="min-w-0 pr-4">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {row.title}
                    </div>
                    {row.description && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {row.description}
                      </div>
                    )}
                  </div>

                  {row.nextNodeId ? (
                    <span className="text-[9px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-300 dark:border-blue-600/40 shrink-0">
                      Linked
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 italic shrink-0">
                      Unlinked
                    </span>
                  )}

                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`row-${row.id}`}
                    className="!w-3.5 !h-3.5 !bg-blue-500 dark:!bg-blue-400 !border-2 !border-white dark:!border-slate-900 !rounded-full shadow-md !-right-2 transition-transform hover:!scale-125"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TYPE 4: Catalogue Message */}
          {node.type === 'catalogue' && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                Meta Commerce Catalog:
              </div>
              <div className="relative p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-700/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 block truncate">
                      {node.catalogConfig?.actionButtonText || 'View Catalog'}
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-300/80 block truncate">
                      ID: {node.catalogConfig?.catalogId || 'meta-cat-01'}
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded border border-indigo-300 dark:border-indigo-600/40 shrink-0">
                  {node.catalogConfig?.nextNodeId || node.nextNodeId ? 'Linked' : 'On Click'}
                </span>

                <Handle
                  type="source"
                  position={Position.Right}
                  id="cat-action"
                  className="!w-3.5 !h-3.5 !bg-indigo-500 dark:!bg-indigo-400 !border-2 !border-white dark:!border-slate-900 !rounded-full shadow-md !-right-2 transition-transform hover:!scale-125"
                />
              </div>
            </div>
          )}

          {/* TYPE 5: Single Product */}
          {node.type === 'single_product' && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                Product SKU Card:
              </div>
              <div className="relative p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700/40 flex items-center gap-2.5">
                {node.singleProduct?.imageUrl ? (
                  <img 
                    src={node.singleProduct.imageUrl} 
                    alt="Product" 
                    className="w-11 h-11 rounded-lg object-cover border border-emerald-300 dark:border-emerald-700/50 shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                )}
                
                <div className="min-w-0 flex-1 pr-4">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {node.singleProduct?.title || 'Healthcare Product'}
                  </div>
                  <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                    {node.singleProduct?.price || '₹0'}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    {node.singleProduct?.retailerId || 'SKU-001'}
                  </div>
                </div>

                <Handle
                  type="source"
                  position={Position.Right}
                  id="prod-view"
                  className="!w-3.5 !h-3.5 !bg-emerald-500 dark:!bg-emerald-400 !border-2 !border-white dark:!border-slate-900 !rounded-full shadow-md !-right-2 transition-transform hover:!scale-125"
                />
              </div>
            </div>
          )}

          {/* TYPE 6: Multi Product */}
          {node.type === 'multi_product' && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                Multi-Product Sections:
              </div>
              <div className="relative p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-700/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-cyan-950 dark:text-cyan-200 block">
                      {node.productSections?.length || 0} Product Categories
                    </span>
                    <span className="text-[10px] text-cyan-700 dark:text-cyan-300/80">
                      {node.productSections?.reduce((acc, s) => acc + s.products.length, 0) || 0} Total items
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-900/60 px-1.5 py-0.5 rounded border border-cyan-300 dark:border-cyan-600/40">
                  {node.nextNodeId ? 'Linked' : 'View Items'}
                </span>

                <Handle
                  type="source"
                  position={Position.Right}
                  id="multi-prod"
                  className="!w-3.5 !h-3.5 !bg-cyan-500 dark:!bg-cyan-400 !border-2 !border-white dark:!border-slate-900 !rounded-full shadow-md !-right-2 transition-transform hover:!scale-125"
                />
              </div>
            </div>
          )}

          {/* TYPE 7: Meta Approved Template */}
          {node.type === 'template' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Meta Template Buttons:
                </span>
                <span className="text-[9px] bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-300 dark:border-amber-500/30">
                  {node.templateConfig?.category || 'UTILITY'}
                </span>
              </div>

              {node.templateConfig?.buttons && node.templateConfig.buttons.length > 0 ? (
                node.templateConfig.buttons.map((tbtn, idx) => (
                  <div
                    key={tbtn.id}
                    className="relative flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/40 hover:border-amber-400 dark:hover:border-amber-500/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 pr-4">
                      <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-amber-950 dark:text-amber-200 truncate">
                        {tbtn.text || `Action ${idx + 1}`}
                      </span>
                    </div>

                    <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-300/80 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-600/40 shrink-0">
                      {tbtn.type}
                    </span>

                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`tbtn-${tbtn.id}`}
                      className="!w-3.5 !h-3.5 !bg-amber-500 dark:!bg-amber-400 !border-2 !border-white dark:!border-slate-900 !rounded-full shadow-md !-right-2 transition-transform hover:!scale-125 hover:!bg-amber-300"
                    />
                  </div>
                ))
              ) : (
                <div className="relative p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/40 flex items-center justify-between">
                  <span className="text-xs text-amber-950 dark:text-amber-200 font-bold truncate">
                    {node.templateConfig?.templateName || 'template_message'}
                  </span>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id="template-next"
                    className="!w-3.5 !h-3.5 !bg-amber-500 dark:!bg-amber-400 !border-2 !border-white dark:!border-slate-900 !rounded-full shadow-md !-right-2"
                  />
                </div>
              )}
            </div>
          )}

          {/* ADVANCED: WhatsApp Native Form Screen */}
          {node.type === 'flow_screen' && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                Meta Screen Submission:
              </div>
              <div className="relative p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-700/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <span className="text-xs font-bold text-purple-950 dark:text-purple-200 block">
                      {node.flowScreen?.submitButtonTitle || 'Submit & Proceed'}
                    </span>
                    <span className="text-[10px] text-purple-700 dark:text-purple-300/80">
                      {node.flowScreen?.fields.length || 0} intake form fields
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-1.5 py-0.5 rounded border border-purple-300 dark:border-purple-600/40">
                  {node.flowScreen?.nextNodeId ? 'Linked' : 'On Submit'}
                </span>

                <Handle
                  type="source"
                  position={Position.Right}
                  id="submit"
                  className="!w-3.5 !h-3.5 !bg-purple-500 dark:!bg-purple-400 !border-2 !border-white dark:!border-slate-900 !rounded-full shadow-md !-right-2 transition-transform hover:!scale-125"
                />
              </div>
            </div>
          )}

          {/* FALLBACK CONTINUATION HANDLE for other node types */}
          {node.type !== 'text_buttons' && 
           node.type !== 'button' && 
           node.type !== 'media_buttons' && 
           node.type !== 'list' && 
           node.type !== 'flow_screen' && 
           node.type !== 'catalogue' && 
           node.type !== 'single_product' && 
           node.type !== 'multi_product' && 
           node.type !== 'template' && (
            <div className="pt-1">
              <div className="relative flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Next Step Continuation
                </span>

                {node.nextNodeId ? (
                  <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-600/40">
                    Linked
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 italic">
                    Drag handle
                  </span>
                )}

                <Handle
                  type="source"
                  position={Position.Right}
                  id="next"
                  className="!w-3.5 !h-3.5 !bg-emerald-500 dark:!bg-emerald-400 !border-2 !border-white dark:!border-slate-900 !rounded-full shadow-md !-right-2 transition-transform hover:!scale-125"
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Node Footer Actions */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/70 flex items-center justify-between text-[11px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode(node.id);
            }}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Configure</span>
          </button>

          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {node.id}
          </span>
        </div>
      </div>

      {/* Bottom Fallback Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        className="!w-3.5 !h-3.5 !bg-emerald-500 dark:!bg-emerald-400 !border-2 !border-white dark:!border-slate-900 !rounded-full shadow-md !-bottom-2 transition-transform hover:!scale-125"
      />
    </div>
  );
});

WhatsAppFlowNode.displayName = 'WhatsAppFlowNode';

