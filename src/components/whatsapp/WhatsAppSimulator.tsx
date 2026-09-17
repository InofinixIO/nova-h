import React, { useState, useEffect, useRef } from 'react';
import { 
  WhatsAppFlow, 
  WhatsAppNode, 
  WhatsAppButton, 
  WhatsAppListItem 
} from '../../types';
import { 
  Phone, 
  Video, 
  MoreVertical, 
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
  CheckCircle2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  nodeData?: WhatsAppNode;
  userSelection?: string;
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
    ref_id: '8942'
  }
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeListSheet, setActiveListSheet] = useState<WhatsAppNode | null>(null);
  const [activeFlowScreen, setActiveFlowScreen] = useState<WhatsAppNode | null>(null);
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
    setFormInputs({});
  };

  useEffect(() => {
    startFlow();
  }, [flow.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, activeListSheet, activeFlowScreen]);

  // Handle user clicking an interactive button
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
    if (targetNodeId) {
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
    }
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
    if (targetNodeId) {
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
        }, 700);
      }
    }
  };

  // Handle submitting the WhatsApp native flow form
  const handleFlowFormSubmit = (e: React.FormEvent, node: WhatsAppNode) => {
    e.preventDefault();
    setActiveFlowScreen(null);

    const summaryText = Object.entries(formInputs)
      .map(([k, v]) => `${v}`)
      .filter(Boolean)
      .join(' • ') || 'Form Details Submitted';

    const userMsg: ChatMessage = {
      id: `user-form-${Date.now()}`,
      sender: 'user',
      text: `📋 ${node.flowScreen?.title || 'Form Submission'}:\n${summaryText}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    const targetNodeId = node.flowScreen?.nextNodeId || node.nextNodeId;
    if (targetNodeId) {
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
        }, 750);
      }
    }
  };

  // Handle typing a message in the bottom chat bar
  const handleSendCustomText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputText.trim()) return;

    const userText = customInputText.trim();
    setCustomInputText('');

    const userMsg: ChatMessage = {
      id: `user-text-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    // Check if input matches trigger keyword
    if (userText.toUpperCase().includes(flow.triggerKeyword)) {
      startFlow();
      return;
    }

    // Check if last bot message was an input capture
    const lastBotMsg = [...messages].reverse().find(m => m.sender === 'bot');
    if (lastBotMsg?.nodeData?.type === 'input_capture') {
      const nextNodeId = lastBotMsg.nodeData.nextNodeId;
      if (nextNodeId) {
        const nextNode = flow.nodes.find(n => n.id === nextNodeId);
        if (nextNode) {
          onSelectNode(nextNodeId);
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
          }, 600);
          return;
        }
      }
    }

    // Fallback general response
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
  const renderFormattedText = (rawText: string) => {
    const text = interpolateText(rawText);
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // replace *text* with <strong>text</strong>
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
                <span className="text-[10px] text-emerald-100 block">online • WhatsApp Flow</span>
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
                    className={`max-w-[85%] rounded-2xl p-2.5 shadow-xs text-xs relative ${
                      isBot 
                        ? 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/60' 
                        : 'bg-[#D9FDD3] text-slate-900 rounded-tr-xs border border-emerald-200/70'
                    }`}
                  >
                    {/* Header preview if bot */}
                    {isBot && node && node.headerType !== 'none' && (
                      <div className="mb-2 rounded-lg overflow-hidden border border-slate-100">
                        {node.headerType === 'image' && (
                          <img 
                            src={node.headerContent || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80'} 
                            alt="Header" 
                            className="w-full h-32 object-cover"
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

                    {/* Main Body Text */}
                    <div className="leading-relaxed text-[12px] break-words">
                      {renderFormattedText(msg.text)}
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

                  {/* Interactive Buttons / Action Buttons below bot bubble */}
                  {isBot && node && (
                    <div className="w-[85%] mt-1.5 space-y-1.5">
                      
                      {/* 1. Quick Reply Buttons (Up to 3) */}
                      {node.type === 'button' && node.buttons && node.buttons.length > 0 && (
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
                          <span>{node.listButtonText || 'Select Option'}</span>
                        </button>
                      )}

                      {/* 3. WhatsApp Flow Native Screen Trigger */}
                      {node.type === 'flow_screen' && (
                        <button
                          onClick={() => setActiveFlowScreen(node)}
                          className="w-full py-2.5 px-3 bg-[#075E54] hover:bg-[#064e46] text-white font-bold text-xs rounded-xl shadow-xs text-center transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>{node.flowScreen?.submitButtonTitle || 'Open Project Intake Form'}</span>
                        </button>
                      )}

                      {/* 4. Media CTA Button (URL or Phone Call) */}
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

                      {/* 5. Agent Handover indicator */}
                      {node.type === 'agent_handover' && (
                        <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl p-2 text-[10px] flex items-center gap-2 font-medium">
                          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>NOVA Concierge Liaison has been notified on WhatsApp.</span>
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

          {/* Interactive List Menu Bottom Sheet (WhatsApp Style) */}
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

          {/* WhatsApp Native Flow Form Modal Sheet (WhatsApp Style) */}
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
        <span className="font-semibold text-slate-700">Live Simulator:</span> Click buttons or trigger keywords to test flow.
      </div>
    </div>
  );
};
