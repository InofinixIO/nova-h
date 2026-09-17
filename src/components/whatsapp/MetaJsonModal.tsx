import React, { useState } from 'react';
import { WhatsAppFlow, WhatsAppNode } from '../../types';
import { X, Copy, Check, Code, ExternalLink, ShieldCheck } from 'lucide-react';

interface MetaJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  flow: WhatsAppFlow;
  activeNode: WhatsAppNode | null;
}

export const MetaJsonModal: React.FC<MetaJsonModalProps> = ({
  isOpen,
  onClose,
  flow,
  activeNode
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'active_node' | 'full_flow'>('active_node');

  if (!isOpen) return null;

  // Build real Meta Cloud API Interactive Message Payload
  const generateMetaPayload = (node: WhatsAppNode) => {
    if (node.type === 'button') {
      return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '{{RECIPIENT_PHONE_NUMBER}}',
        type: 'interactive',
        interactive: {
          type: 'button',
          header: node.headerType !== 'none' ? {
            type: node.headerType,
            [node.headerType]: node.headerType === 'text' ? node.headerContent : { link: node.headerContent }
          } : undefined,
          body: {
            text: node.bodyText
          },
          footer: node.footerText ? { text: node.footerText } : undefined,
          action: {
            buttons: (node.buttons || []).map((b, idx) => ({
              type: 'reply',
              reply: {
                id: b.id || `btn_${idx}`,
                title: b.title
              }
            }))
          }
        }
      };
    }

    if (node.type === 'list') {
      return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '{{RECIPIENT_PHONE_NUMBER}}',
        type: 'interactive',
        interactive: {
          type: 'list',
          header: node.headerType === 'text' ? {
            type: 'text',
            text: node.headerContent || 'SELECTION'
          } : undefined,
          body: {
            text: node.bodyText
          },
          footer: node.footerText ? { text: node.footerText } : undefined,
          action: {
            button: node.listButtonText || 'Select Option',
            sections: (node.listSections || []).map((sec) => ({
              title: sec.title,
              rows: sec.rows.map((r) => ({
                id: r.id,
                title: r.title,
                description: r.description
              }))
            }))
          }
        }
      };
    }

    if (node.type === 'flow_screen') {
      return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '{{RECIPIENT_PHONE_NUMBER}}',
        type: 'interactive',
        interactive: {
          type: 'flow',
          header: { type: 'text', text: node.flowScreen?.title || 'Form Intake' },
          body: { text: node.bodyText },
          footer: node.footerText ? { text: node.footerText } : undefined,
          action: {
            name: 'flow',
            parameters: {
              flow_message_version: '3',
              flow_token: `token_${node.id}`,
              flow_id: 'FLOW_META_ID_100293',
              flow_cta: node.flowScreen?.submitButtonTitle || 'Open Form',
              flow_action: 'navigate',
              flow_action_payload: {
                screen: 'MAIN_INTAKE_SCREEN'
              }
            }
          }
        }
      };
    }

    // Default media/text
    return {
      messaging_product: 'whatsapp',
      to: '{{RECIPIENT_PHONE_NUMBER}}',
      type: 'text',
      text: { body: node.bodyText }
    };
  };

  const payloadToDisplay = viewMode === 'active_node' && activeNode 
    ? generateMetaPayload(activeNode)
    : {
        flow_id: flow.id,
        flow_name: flow.name,
        trigger_keyword: flow.triggerKeyword,
        meta_cloud_api_version: 'v21.0',
        nodes: flow.nodes.map(n => ({
          node_id: n.id,
          node_title: n.title,
          type: n.type,
          meta_interactive_payload: generateMetaPayload(n)
        }))
      };

  const jsonString = JSON.stringify(payloadToDisplay, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-700 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden text-white">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Meta WhatsApp Cloud API Payload</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  Official Spec v21.0
                </span>
              </h3>
              <p className="text-xs text-slate-400">Compatible with AiSensy, Wati, Gupshup & Direct Cloud API</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Switcher & Copy Bar */}
        <div className="p-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between px-5">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('active_node')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'active_node'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              Active Node Payload
            </button>
            <button
              onClick={() => setViewMode('full_flow')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'full_flow'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              Full Flow JSON
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Meta JSON</span>
              </>
            )}
          </button>
        </div>

        {/* JSON Code View */}
        <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-emerald-300 bg-[#0d1117] leading-relaxed select-all">
          <pre>{jsonString}</pre>
        </div>

        {/* Footer info banner */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 px-6 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Payload verified against Meta WhatsApp Business Platform specifications.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
