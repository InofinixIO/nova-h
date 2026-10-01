import React, { useState, useEffect, useRef } from 'react';
import { 
  WhatsAppFlow, 
  WhatsAppNode, 
  WhatsAppButton, 
  WhatsAppListItem,
  WhatsAppProductItem,
  WhatsAppTemplateButton
} from '../../types';
import { 
  Phone, 
  Video, 
  ArrowLeft, 
  CheckCheck, 
  RotateCcw, 
  Send, 
  ExternalLink, 
  ListFilter, 
  Sparkles, 
  X, 
  FileText, 
  ShieldCheck,
  CheckCircle2,
  Store,
  ShoppingCart,
  ShoppingBag,
  Zap,
  Tag,
  ChevronRight,
  Info
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  nodeData?: WhatsAppNode;
  userSelection?: string;
  productPayload?: WhatsAppProductItem;
}

interface WhatsAppSimulatorProps {
  flow: WhatsAppFlow;
  activeNodeId: string;
  onSelectNode: (nodeId: string) => void;
  previewVariables?: Record<string, string>;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
  flow,
  activeNodeId,
  onSelectNode,
  previewVariables = {
    user_name: 'Dr. Vivek Sharma',
    hospital_name: 'Apollo Greenfield Hospital',
    city: 'Pune',
    bed_count: '150 Beds',
    ref_id: '8942'
  }
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeListSheet, setActiveListSheet] = useState<WhatsAppNode | null>(null);
  const [activeFlowScreen, setActiveFlowScreen] = useState<WhatsAppNode | null>(null);
  const [activeCatalogSheet, setActiveCatalogSheet] = useState<WhatsAppNode | null>(null);
  const [activeMultiProductSheet, setActiveMultiProductSheet] = useState<WhatsAppNode | null>(null);
  const [customInputText, setCustomInputText] = useState('');
  const [formInputs, setFormInputs] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to replace {{variables}} with preview values
  const interpolateText = (text: string): string => {
    let result = text;
    Object.entries(previewVariables).forEach(([key, val]) => {
      result = result.replaceAll(`{{${key}}}`, val);
    });
    return result;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Transition to a target node
  const transitionToNode = (targetNodeId?: string) => {
    if (!targetNodeId) return;
    const nextNode = flow.nodes.find(n => n.id === targetNodeId);
    if (nextNode) {
      onSelectNode(targetNodeId);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: nextNode.bodyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            nodeData: nextNode
          }
        ]);
      }, 650);
    }
  };

  // Reset chat flow to beginning
  const startFlow = () => {
    const startNode = flow.nodes.find(n => n.id === flow.startNodeId) || flow.nodes[0];
    if (!startNode) return;

    setMessages([
      {
        id: `bot-start-${Date.now()}`,
        sender: 'bot',
        text: startNode.bodyText,
        timestamp: '10:42 AM',
        nodeData: startNode
      }
    ]);
    setActiveListSheet(null);
    setActiveFlowScreen(null);
    setActiveCatalogSheet(null);
    setActiveMultiProductSheet(null);
    setFormInputs({});
  };

  useEffect(() => {
    startFlow();
  }, [flow.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, activeListSheet, activeFlowScreen, activeCatalogSheet, activeMultiProductSheet]);

  // Handle user clicking an interactive button (Text Buttons, Media Buttons)
  const handleButtonClick = (button: WhatsAppButton, currentNode: WhatsAppNode) => {
    const userMsg: ChatMessage = {
      id: `user-btn-${Date.now()}`,
      sender: 'user',
      text: button.title,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userSelection: button.title
    };

    setMessages(prev => [...prev, userMsg]);
    const targetNodeId = button.nextNodeId || currentNode.nextNodeId;
    transitionToNode(targetNodeId);
  };

  // Handle user selecting an item from the Interactive List Menu
  const handleListItemSelect = (item: WhatsAppListItem, currentNode: WhatsAppNode) => {
    setActiveListSheet(null);

    const userMsg: ChatMessage = {
      id: `user-list-${Date.now()}`,
      sender: 'user',
      text: item.title,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userSelection: item.title
    };

    setMessages(prev => [...prev, userMsg]);
    const targetNodeId = item.nextNodeId || currentNode.nextNodeId;
    transitionToNode(targetNodeId);
  };

  // Handle Single Product card inquiry
  const handleProductInquiry = (product: WhatsAppProductItem, currentNode: WhatsAppNode) => {
    const userMsg: ChatMessage = {
      id: `user-prod-${Date.now()}`,
      sender: 'user',
      text: `Inquiring about ${product.title} (${product.price})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userSelection: product.title,
      productPayload: product
    };

    setMessages(prev => [...prev, userMsg]);
    const targetNodeId = product.nextNodeId || currentNode.nextNodeId;
    transitionToNode(targetNodeId);
  };

  // Handle Multi Product selection
  const handleMultiProductSelect = (product: WhatsAppProductItem, currentNode: WhatsAppNode) => {
    setActiveMultiProductSheet(null);

    const userMsg: ChatMessage = {
      id: `user-mprod-${Date.now()}`,
      sender: 'user',
      text: `Requested quote for: ${product.title} • ${product.price}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userSelection: product.title,
      productPayload: product
    };

    setMessages(prev => [...prev, userMsg]);
    const targetNodeId = product.nextNodeId || currentNode.nextNodeId;
    transitionToNode(targetNodeId);
  };

  // Handle Meta Template button click
  const handleTemplateButtonClick = (btn: WhatsAppTemplateButton, currentNode: WhatsAppNode) => {
    if (btn.type === 'URL' && btn.value) {
      window.open(btn.value, '_blank');
      return;
    }
    if (btn.type === 'PHONE_NUMBER' && btn.value) {
      window.location.href = `tel:${btn.value}`;
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-tbtn-${Date.now()}`,
      sender: 'user',
      text: btn.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userSelection: btn.text
    };

    setMessages(prev => [...prev, userMsg]);
    const targetNodeId = btn.nextNodeId || currentNode.nextNodeId;
    transitionToNode(targetNodeId);
  };

  // Handle submitting the WhatsApp native flow form
  const handleFlowFormSubmit = (e: React.FormEvent, node: WhatsAppNode) => {
    e.preventDefault();
    setActiveFlowScreen(null);

    const summaryText = Object.entries(formInputs)
      .map(([, v]) => `${v}`)
      .filter(Boolean)
      .join(' • ') || 'Form Details Submitted';

    const userMsg: ChatMessage = {
      id: `user-flow-${Date.now()}`,
      sender: 'user',
      text: `📋 ${node.flowScreen?.title || 'Form'}: ${summaryText}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userSelection: 'form_submitted'
    };

    setMessages(prev => [...prev, userMsg]);
    const targetNodeId = node.flowScreen?.nextNodeId || node.nextNodeId;
    transitionToNode(targetNodeId);
  };

  // Free-form user text test reply
  const handleSendCustomText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputText.trim()) return;

    const userText = customInputText.trim();
    setCustomInputText('');

    const userMsg: ChatMessage = {
      id: `user-custom-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    // Check if user entered trigger keyword
    if (userText.toUpperCase() === flow.triggerKeyword.toUpperCase()) {
      startFlow();
      return;
    }

    // Default conversational echo
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-echo-${Date.now()}`,
          sender: 'bot',
          text: `Thank you for your message: "${userText}". Our healthcare desk has captured this note. Tap any interactive button above to continue the guided workflow.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 600);
  };

  // Formatter for WhatsApp markup (*bold*, _italic_)
  const renderFormattedText = (rawText: string, node?: WhatsAppNode) => {
    let text = interpolateText(rawText);

    // If template, replace {{1}}, {{2}}, {{3}}
    if (node?.type === 'template' && node.templateConfig?.bodyVariables) {
      node.templateConfig.bodyVariables.forEach((val, idx) => {
        text = text.replaceAll(`{{${idx + 1}}}`, val);
      });
    }

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/(\*[^*]+\*|_[^_]+_)/g);
      return (
        <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('*') && part.endsWith('*')) {
              return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(1, -1)}</strong>;
            }
            if (part.startsWith('_') && part.endsWith('_')) {
              return <em key={pIdx} className="italic text-slate-800">{part.slice(1, -1)}</em>;
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col items-center">
      {/* Mobile Device Mockup Frame */}
      <div className="w-[330px] sm:w-[360px] h-[670px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden ring-1 ring-slate-700/50">
        
        {/* Device Top Speaker & Camera Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-full flex items-center justify-center z-30">
          <div className="w-10 h-1.5 bg-slate-700 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-slate-900 rounded-full ml-3 border border-slate-700"></div>
        </div>

        {/* Screen Area */}
        <div className="w-full h-full bg-[#E5DDD5] rounded-[34px] overflow-hidden flex flex-col relative z-20 shadow-inner">
          
          {/* WhatsApp Header Bar */}
          <div className="bg-[#075E54] text-white pt-8 pb-2.5 px-3 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <button 
                onClick={startFlow} 
                title="Restart Chat" 
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              {/* Profile picture with verified check */}
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs text-white border border-white/30">
                  NH
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                </div>
              </div>

              <div className="text-left leading-tight">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-xs text-white tracking-wide">NOVA Healthcare</span>
                  <span className="text-[10px] bg-emerald-600/60 px-1 rounded text-emerald-100 font-semibold">Official</span>
                </div>
                <span className="text-[10px] text-emerald-100 block">online &bull; WhatsApp Flow</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-white/90">
              <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
              <Video className="w-4 h-4 cursor-pointer hover:text-white" />
              <button onClick={startFlow} title="Reset Test Conversation" className="hover:text-white cursor-pointer">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body Area */}
          <div 
            className="flex-1 overflow-y-auto p-3 space-y-3 relative"
            style={{
              backgroundImage: `radial-gradient(#d1c4b8 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
              backgroundColor: '#EFEAE2'
            }}
          >
            {/* Encryption Notice */}
            <div className="flex justify-center my-1">
              <div className="bg-[#FFF4C4] text-[#54656F] text-[10px] py-1 px-3 rounded-lg shadow-2xs max-w-[260px] text-center border border-amber-200/60 font-medium">
                🔒 Messages are end-to-end encrypted with Meta Business API.
              </div>
            </div>

            {/* Conversation Messages */}
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              const node = msg.nodeData;

              return (
                <div key={msg.id} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                  {/* Message Bubble */}
                  <div 
                    className={`max-w-[88%] rounded-2xl p-2.5 shadow-xs text-xs relative ${
                      isBot 
                        ? 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/60' 
                        : 'bg-[#D9FDD3] text-slate-900 rounded-tr-xs border border-emerald-200/70'
                    }`}
                  >
                    {/* Meta Template Header & Category Badge */}
                    {isBot && node && node.type === 'template' && (
                      <div className="mb-2 pb-1.5 border-b border-amber-100 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          {node.templateConfig?.category || 'UTILITY'} TEMPLATE
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {node.templateConfig?.templateName || 'meta_template'}
                        </span>
                      </div>
                    )}

                    {/* Header attachment preview if bot (Media Buttons, Text Buttons, or Generic Header) */}
                    {isBot && node && (node.headerType !== 'none' || node.type === 'media_buttons') && (
                      <div className="mb-2 rounded-lg overflow-hidden border border-slate-100">
                        {(node.headerType === 'image' || node.type === 'media_buttons') && (
                          <img 
                            src={node.headerContent || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80'} 
                            alt="Header" 
                            className="w-full h-32 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        {node.headerType === 'text' && (
                          <div className="bg-slate-100 px-2.5 py-1 text-[11px] font-black tracking-wider text-slate-700 uppercase">
                            {node.headerContent}
                          </div>
                        )}
                        {node.headerType === 'document' && (
                          <div className="bg-emerald-50 border border-emerald-200 p-2 flex items-center gap-2 rounded-lg text-[11px] text-emerald-900 font-semibold">
                            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate">{node.headerContent || 'Brochure.pdf'}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Single Product Card Preview inside bubble */}
                    {isBot && node && node.type === 'single_product' && node.singleProduct && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-emerald-100 bg-slate-50">
                        <img 
                          src={node.singleProduct.imageUrl || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80'}
                          alt={node.singleProduct.title}
                          className="w-full h-32 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="p-2 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-500 uppercase">{node.singleProduct.retailerId}</span>
                            <span className="text-xs font-black text-emerald-700">{node.singleProduct.price}</span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900">{node.singleProduct.title}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-2">{node.singleProduct.description}</p>
                        </div>
                      </div>
                    )}

                    {/* Catalogue Card Preview inside bubble */}
                    {isBot && node && node.type === 'catalogue' && node.catalogConfig && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-indigo-100 bg-indigo-50/50">
                        {node.catalogConfig.thumbnailUrl && (
                          <img 
                            src={node.catalogConfig.thumbnailUrl}
                            alt="Catalog"
                            className="w-full h-28 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="p-2">
                          <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider block">Meta Catalog Showcase</span>
                          <h4 className="font-black text-xs text-indigo-950">{node.catalogConfig.headerText || 'Medical Catalog'}</h4>
                        </div>
                      </div>
                    )}

                    {/* Main Body Text */}
                    <div className="leading-relaxed text-[12px] break-words">
                      {renderFormattedText(msg.text, node)}
                    </div>

                    {/* Footer text if configured */}
                    {isBot && node?.footerText && (
                      <div className="mt-1.5 pt-1 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                        {node.footerText}
                      </div>
                    )}

                    {/* Timestamp & double tick */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      {!isBot && (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* INTERACTIVE ACTIONS RENDERED OUTSIDE/BELOW BOT BUBBLE      */}
                  {/* ========================================================= */}
                  {isBot && node && (
                    <div className="w-[88%] mt-1.5 space-y-1.5">
                      
                      {/* 1. Quick Reply Buttons (text_buttons, button, media_buttons) */}
                      {(node.type === 'text_buttons' || node.type === 'button' || node.type === 'media_buttons') && node.buttons && node.buttons.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          {node.buttons.map((btn) => (
                            <button
                              key={btn.id}
                              onClick={() => handleButtonClick(btn, node)}
                              className="w-full py-2 px-3 bg-white hover:bg-emerald-50 active:bg-emerald-100 text-[#00A884] font-bold text-xs rounded-xl shadow-xs border border-slate-200/80 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span>{btn.title}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* 2. Interactive List Menu Trigger */}
                      {node.type === 'list' && (
                        <button
                          onClick={() => setActiveListSheet(node)}
                          className="w-full py-2.5 px-3 bg-white hover:bg-emerald-50 text-[#00A884] font-bold text-xs rounded-xl shadow-xs border border-slate-200/80 text-center transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <ListFilter className="w-3.5 h-3.5" />
                          <span>{node.listButtonText || 'Select Department'}</span>
                        </button>
                      )}

                      {/* 3. Catalogue Message Action */}
                      {node.type === 'catalogue' && (
                        <button
                          onClick={() => setActiveCatalogSheet(node)}
                          className="w-full py-2.5 px-3 bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl shadow-xs border border-indigo-200 text-center transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Store className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{node.catalogConfig?.actionButtonText || 'View Catalog'}</span>
                        </button>
                      )}

                      {/* 4. Single Product Card Action */}
                      {node.type === 'single_product' && node.singleProduct && (
                        <button
                          onClick={() => handleProductInquiry(node.singleProduct!, node)}
                          className="w-full py-2.5 px-3 bg-[#00A884] hover:bg-[#009172] text-white font-bold text-xs rounded-xl shadow-xs text-center transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Inquire on WhatsApp</span>
                        </button>
                      )}

                      {/* 5. Multi Product Showcase Action */}
                      {node.type === 'multi_product' && (
                        <button
                          onClick={() => setActiveMultiProductSheet(node)}
                          className="w-full py-2.5 px-3 bg-white hover:bg-cyan-50 text-cyan-800 font-bold text-xs rounded-xl shadow-xs border border-cyan-200 text-center transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-cyan-700" />
                          <span>
                            View Products ({node.productSections?.reduce((acc, s) => acc + s.products.length, 0) || 0} items)
                          </span>
                        </button>
                      )}

                      {/* 6. Meta Pre-Approved Template Buttons */}
                      {node.type === 'template' && node.templateConfig?.buttons && (
                        <div className="flex flex-col gap-1.5">
                          {node.templateConfig.buttons.map((tbtn) => (
                            <button
                              key={tbtn.id}
                              onClick={() => handleTemplateButtonClick(tbtn, node)}
                              className="w-full py-2 px-3 bg-white hover:bg-amber-50 active:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl shadow-xs border border-amber-200 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              {tbtn.type === 'URL' && <ExternalLink className="w-3.5 h-3.5 text-amber-600" />}
                              {tbtn.type === 'PHONE_NUMBER' && <Phone className="w-3.5 h-3.5 text-amber-600" />}
                              {tbtn.type === 'QUICK_REPLY' && <Zap className="w-3.5 h-3.5 text-amber-600" />}
                              <span>{tbtn.text}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* 7. WhatsApp Flow Native Screen Trigger */}
                      {node.type === 'flow_screen' && (
                        <button
                          onClick={() => setActiveFlowScreen(node)}
                          className="w-full py-2.5 px-3 bg-[#075E54] hover:bg-[#064e46] text-white font-bold text-xs rounded-xl shadow-xs text-center transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>{node.flowScreen?.submitButtonTitle || 'Open Project Intake Form'}</span>
                        </button>
                      )}

                      {/* 8. Media CTA Button */}
                      {node.type === 'media_cta' && node.ctaLabel && (
                        <a
                          href={node.ctaType === 'call' ? `tel:${node.ctaValue}` : node.ctaValue || '#'}
                          target={node.ctaType === 'url' ? '_blank' : undefined}
                          rel="noreferrer"
                          className="w-full py-2 px-3 bg-white hover:bg-slate-50 text-[#00A884] font-bold text-xs rounded-xl shadow-xs border border-slate-200 text-center transition-colors flex items-center justify-center gap-1.5"
                        >
                          {node.ctaType === 'call' ? <Phone className="w-3.5 h-3.5 text-emerald-600" /> : <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />}
                          <span>{node.ctaLabel}</span>
                        </a>
                      )}

                      {/* 9. Agent Handover indicator */}
                      {node.type === 'agent_handover' && (
                        <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl p-2 text-[10px] flex items-center gap-2 font-medium">
                          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>NOVA Concierge Specialist has joined this WhatsApp chat.</span>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-2xl shadow-xs w-16 text-slate-500 text-[10px]">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ========================================================= */}
          {/* BOTTOM SHEETS FOR INTERACTIVE MENUS                       */}
          {/* ========================================================= */}

          {/* 1. Interactive List Menu Bottom Sheet (WhatsApp Style) */}
          {activeListSheet && (
            <div className="absolute inset-x-0 bottom-0 top-16 bg-white z-40 rounded-t-2xl shadow-2xl flex flex-col animate-slideUp">
              <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                <div>
                  <h4 className="font-black text-xs text-slate-800">
                    {activeListSheet.headerContent || 'Select an Option'}
                  </h4>
                  <p className="text-[10px] text-slate-500">{activeListSheet.footerText || 'Tap to choose'}</p>
                </div>
                <button 
                  onClick={() => setActiveListSheet(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {activeListSheet.listSections?.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.rows.map((row) => (
                        <button
                          key={row.id}
                          onClick={() => handleListItemSelect(row, activeListSheet)}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100 flex flex-col cursor-pointer"
                        >
                          <span className="text-xs font-bold text-slate-800">{row.title}</span>
                          {row.description && (
                            <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{row.description}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Meta Commerce Catalogue Sheet */}
          {activeCatalogSheet && (
            <div className="absolute inset-x-0 bottom-0 top-12 bg-white z-40 rounded-t-3xl shadow-2xl flex flex-col animate-slideUp">
              <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-indigo-900 text-white rounded-t-3xl">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-indigo-300" />
                  <div>
                    <h4 className="font-black text-xs">{activeCatalogSheet.catalogConfig?.headerText || 'NOVA Catalog'}</h4>
                    <p className="text-[10px] text-indigo-200">Catalog ID: {activeCatalogSheet.catalogConfig?.catalogId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveCatalogSheet(null)}
                  className="p-1 text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-left">
                <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">WhatsApp Verified Storefront</span>
                  <p className="text-xs text-indigo-950 font-medium">{activeCatalogSheet.catalogConfig?.bodyText}</p>
                </div>

                <div className="space-y-2">
                  {[
                    { title: 'Modular OT Turnkey Suite', price: '₹18,50,000', sku: 'SKU-OT-MOD-01' },
                    { title: 'Turbine ICU Ventilator X5', price: '₹4,50,000', sku: 'SKU-VENT-02' },
                    { title: '5-Function Motorized ICU Bed', price: '₹1,25,000', sku: 'SKU-BED-03' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">{item.sku}</span>
                        <h5 className="text-xs font-bold text-slate-900">{item.title}</h5>
                        <span className="text-xs font-black text-emerald-700">{item.price}</span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveCatalogSheet(null);
                          handleProductInquiry({
                            id: `cat-prod-${idx}`,
                            retailerId: item.sku,
                            title: item.title,
                            price: item.price,
                            currency: 'INR',
                            nextNodeId: activeCatalogSheet.catalogConfig?.nextNodeId || activeCatalogSheet.nextNodeId || ''
                          }, activeCatalogSheet);
                        }}
                        className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                      >
                        Inquire
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Multi-Product Showcase Sheet */}
          {activeMultiProductSheet && (
            <div className="absolute inset-x-0 bottom-0 top-12 bg-white z-40 rounded-t-3xl shadow-2xl flex flex-col animate-slideUp">
              <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-cyan-950 text-white rounded-t-3xl">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-cyan-400" />
                  <div>
                    <h4 className="font-black text-xs">Medical Equipment Catalog</h4>
                    <p className="text-[10px] text-cyan-200">Select any product to inquire or purchase</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveMultiProductSheet(null)}
                  className="p-1 text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4 text-left">
                {activeMultiProductSheet.productSections?.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-2">
                    <h5 className="text-[11px] font-black uppercase text-cyan-900 bg-cyan-50 px-2 py-1 rounded">
                      {section.title}
                    </h5>

                    <div className="space-y-2">
                      {section.products.map((prod) => (
                        <div key={prod.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                          {prod.imageUrl ? (
                            <img 
                              src={prod.imageUrl} 
                              alt={prod.title} 
                              className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                              <ShoppingBag className="w-6 h-6" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">{prod.retailerId}</span>
                            <h6 className="text-xs font-bold text-slate-900 truncate">{prod.title}</h6>
                            <span className="text-xs font-black text-emerald-700 block">{prod.price}</span>
                          </div>

                          <button
                            onClick={() => handleMultiProductSelect(prod, activeMultiProductSheet)}
                            className="py-1.5 px-2.5 rounded-lg bg-[#00A884] hover:bg-[#009172] text-white font-bold text-[10px] cursor-pointer shrink-0 shadow-2xs"
                          >
                            Inquire
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. WhatsApp Native Flow Form Modal Sheet */}
          {activeFlowScreen && (
            <div className="absolute inset-x-0 bottom-0 top-12 bg-white z-40 rounded-t-3xl shadow-2xl flex flex-col animate-slideUp">
              <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-[#075E54] text-white rounded-t-3xl">
                <div>
                  <h4 className="font-black text-xs tracking-wide">
                    {activeFlowScreen.flowScreen?.title || 'Project Intake'}
                  </h4>
                  <p className="text-[10px] text-emerald-100">
                    {activeFlowScreen.flowScreen?.subtitle || 'Meta Native Flow Form'}
                  </p>
                </div>
                <button 
                  onClick={() => setActiveFlowScreen(null)}
                  className="p-1 text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form 
                onSubmit={(e) => handleFlowFormSubmit(e, activeFlowScreen)} 
                className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {activeFlowScreen.flowScreen?.fields.map((field) => (
                    <div key={field.id} className="text-left">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {field.label} {field.required && <span className="text-rose-600">*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={formInputs[field.id] || ''}
                          onChange={(e) => setFormInputs({ ...formInputs, [field.id]: e.target.value })}
                          required={field.required}
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none"
                        >
                          <option value="">Select option...</option>
                          {field.options?.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          placeholder={field.placeholder || ''}
                          value={formInputs[field.id] || ''}
                          onChange={(e) => setFormInputs({ ...formInputs, [field.id]: e.target.value })}
                          required={field.required}
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#00A884] hover:bg-[#009172] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{activeFlowScreen.flowScreen?.submitButtonTitle || 'Submit to NOVA'}</span>
                  </button>
                  <p className="text-[9px] text-center text-slate-400 mt-1">
                    Powered by WhatsApp Flows &bull; Meta Cloud API
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Bottom Chat Input Bar */}
          <form 
            onSubmit={handleSendCustomText}
            className="p-2 bg-[#F0F2F5] border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder={`Type "${flow.triggerKeyword}" or test reply...`}
              value={customInputText}
              onChange={(e) => setCustomInputText(e.target.value)}
              className="flex-1 bg-white text-slate-800 rounded-full py-1.5 px-3 text-xs border border-slate-300 outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!customInputText.trim()}
              className="w-7 h-7 rounded-full bg-[#00A884] text-white flex items-center justify-center disabled:opacity-40 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5 -ml-0.5" />
            </button>
          </form>

        </div>

        {/* Device Bottom Home Indicator Bar */}
        <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-2 shrink-0"></div>
      </div>

      {/* Simulator Quick Helper Pill */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 bg-white/80 py-1 px-3 rounded-full border border-slate-200 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-semibold text-slate-700">Live Simulator:</span> Interactive test of all 7 WhatsApp message types.
      </div>
    </div>
  );
};
