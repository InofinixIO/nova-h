import React, { useState } from 'react';
import { WhatsAppFlow, WhatsAppNode } from '../../types';
import { X, Copy, Check, Code, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

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
  const generateMetaPayload = (node: WhatsAppNode): Record<string, unknown> => {
    // 1. Text Buttons (Quick Reply)
    if (node.type === 'text_buttons' || node.type === 'button') {
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

    // 2. Media Buttons (Header Image/Doc + Quick Reply Buttons)
    if (node.type === 'media_buttons') {
      return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '{{RECIPIENT_PHONE_NUMBER}}',
        type: 'interactive',
        interactive: {
          type: 'button',
          header: {
            type: node.headerType === 'document' ? 'document' : 'image',
            [node.headerType === 'document' ? 'document' : 'image']: {
              link: node.headerContent || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80'
            }
          },
          body: {
            text: node.bodyText
          },
          footer: node.footerText ? { text: node.footerText } : undefined,
          action: {
            buttons: (node.buttons || []).map((b, idx) => ({
              type: 'reply',
              reply: {
                id: b.id || `mbtn_${idx}`,
                title: b.title
              }
            }))
          }
        }
      };
    }

    // 3. Interactive List Menu
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

    // 4. Catalogue Message
    if (node.type === 'catalogue') {
      return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '{{RECIPIENT_PHONE_NUMBER}}',
        type: 'interactive',
        interactive: {
          type: 'catalog_message',
          body: {
            text: node.catalogConfig?.bodyText || node.bodyText
          },
          footer: node.footerText ? { text: node.footerText } : undefined,
          action: {
            name: 'catalog_message',
            parameters: {
              thumbnail_product_retailer_id: 'SKU-OT-MOD-01'
            }
          }
        }
      };
    }

    // 5. Single Product SKU Message
    if (node.type === 'single_product') {
      return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '{{RECIPIENT_PHONE_NUMBER}}',
        type: 'interactive',
        interactive: {
          type: 'product',
          action: {
            catalog_id: node.singleProduct?.catalogId || 'meta-cat-nova-01',
            product_retailer_id: node.singleProduct?.retailerId || 'SKU-001'
          },
          body: {
            text: node.bodyText
          },
          footer: node.footerText ? { text: node.footerText } : undefined
        }
      };
    }

    // 6. Multi Product Showcase (Product List)
    if (node.type === 'multi_product') {
      return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '{{RECIPIENT_PHONE_NUMBER}}',
        type: 'interactive',
        interactive: {
          type: 'product_list',
          header: {
            type: 'text',
            text: node.headerContent || 'NOVA Medical Equipment Catalog'
          },
          body: {
            text: node.bodyText
          },
          footer: node.footerText ? { text: node.footerText } : undefined,
          action: {
            catalog_id: 'meta-cat-nova-01',
            sections: (node.productSections || []).map((sec) => ({
              title: sec.title,
              product_items: sec.products.map(p => ({
                product_retailer_id: p.retailerId
              }))
            }))
          }
        }
      };
    }

    // 7. Meta Approved Template
    if (node.type === 'template') {
      return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '{{RECIPIENT_PHONE_NUMBER}}',
        type: 'template',
        template: {
          name: node.templateConfig?.templateName || 'nova_intake_notice',
          language: {
            code: node.templateConfig?.language || 'en'
          },
          components: [
            ...(node.headerType === 'text' && node.headerContent ? [{
              type: 'header',
              parameters: [{ type: 'text', text: node.headerContent }]
            }] : []),
            {
              type: 'body',
              parameters: (node.templateConfig?.bodyVariables || []).map((val) => ({
                type: 'text',
                text: val
              }))
            },
            ...(node.templateConfig?.buttons && node.templateConfig.buttons.length > 0 ? [{
              type: 'button',
              sub_type: 'quick_reply',
              index: '0',
              parameters: [{
                type: 'payload',
                payload: node.templateConfig.buttons[0].id
              }]
            }] : [])
          ]
        }
      };
    }

    // WhatsApp Native Flow Screen
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

    // Default text
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Meta Cloud API Payload</h3>
              <p className="text-xs text-slate-400">Standard Graph API POST /v21.0/&lt;PHONE_NUMBER_ID&gt;/messages</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Payload</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Bar */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('active_node')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'active_node'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Current Node ({activeNode?.title || 'Node'})
            </button>
            <button
              onClick={() => setViewMode('full_flow')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'full_flow'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Interactive Journey ({flow.nodes.length} Steps)
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Meta Official Graph API v21.0 Compliant</span>
          </div>
        </div>

        {/* JSON Code Viewer */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-xs text-emerald-400 leading-relaxed">
          <pre className="whitespace-pre-wrap">{jsonString}</pre>
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Ready for curl, Postman, or webhook backend automation</span>
          </span>
          <a
            href="https://developers.facebook.com/docs/whatsapp/cloud-api/messages"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
          >
            <span>Meta Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};
