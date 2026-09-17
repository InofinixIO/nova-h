import React, { useState } from 'react';
import { X, Bot, Sparkles, Send, CheckCircle2, Building, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

interface AiConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreDirectory: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  tags?: string[];
}

export const AiConsultantModal: React.FC<AiConsultantModalProps> = ({
  isOpen,
  onClose,
  onExploreDirectory,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your NOVA AI Healthcare Infrastructure Advisor. I can assist you with bed capacity planning, statutory licenses, AERB radiation layouts, MEP airflow norms, and vendor procurement stages. What hospital project question can I help you with?",
      tags: ["Area Estimation", "AERB / Radiation", "NABH 5th Edition", "MEP & MGPS"]
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    "What area per bed is recommended for NABH 5th edition compliance?",
    "What are the mandatory statutory licenses before starting hospital civil works?",
    "What is the recommended ratio of ICU beds and Modular OTs for 100 beds?",
    "How does the Liquid Medical Oxygen (LMO) tank cryogenic setup work?"
  ];

  const generateAnswer = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('area') || q.includes('sq ft') || q.includes('square')) {
      return `For a modern multispecialty hospital adhering to NABH & Indian Public Health Standards (IPHS):

1. **Recommended Built-up Area Benchmark:** 
   • Tertiary Care Hospital: **850 – 1,100 sq. ft. per bed** (including circulation, plant rooms, parking, and diagnostics).
   • Secondary Care: **650 – 800 sq. ft. per bed**.

2. **Departmental Space Distribution:**
   • Inpatient Wards: 25 - 30%
   • Critical Care (ICUs & Stepdown): 10 - 12% (min. 100 - 120 sq. ft. per bed)
   • Surgical Suite & CSSD: 8 - 10%
   • Radiology & Imaging: 6 - 8% (requires 35cm - 50cm barite/concrete radiation shielding)
   • OPD & Reception: 10 - 12%
   • MEP, HVAC & Biomedical Engineering: 15 - 18%

Would you like to connect with a verified Healthcare Architect in the NOVA directory for a customized departmental area schedule?`;
    }

    if (q.includes('license') || q.includes('approval') || q.includes('statutory') || q.includes('clearance')) {
      return `Before starting hospital civil construction and operations, you need clearances across 3 distinct phases:

**Phase A: Pre-Construction Sanctions**
• Municipal / Town Planning Building Layout Sanction
• State Pollution Control Board CTE (Consent to Establish)
• Provisional Fire Department NOC (setback, access roads ≥12m, hydrant layout)
• AERB Site & Layout Clearance (for MRI, CT, Cath Lab bunkers)

**Phase B: Pre-Operational Licenses**
• Clinical Establishments Act Registration (District CMO)
• State Pollution Control Board CTO (Consent to Operate) + Bio-Medical Waste Authorization
• Final Fire Safety Certificate & Occupancy Certificate
• AERB License to Operate radiation emitting equipment (with designated RSO)
• Retail & In-house Hospital Drug License (State FDA)
• PNDT Registration (for Ultrasound machines)

Explore our **Statutory Approvals Advisors** in the NOVA directory to fast-track your clearances.`;
    }

    if (q.includes('icu') || q.includes('ot') || q.includes('ratio')) {
      return `For a standard 100-bed multispecialty hospital, clinical best practices specify:

• **ICU Beds:** 15% to 20% of total bed capacity (15 to 20 ICU beds, split between MICU, SICU, and HDU).
• **Modular Operation Theatres (OT):** 3 to 4 major OTs (typically 1 OT per 25-30 acute surgical beds).
  - 1 Ultra-Clean Ortho / Neuro OT (ISO Class 5, laminar flow ceiling)
  - 1 General / Laparoscopic OT
  - 1 Septic / Emergency OT
  - 1 Cath Lab or Daycare procedure suite
• **Air Handling:** Minimum 20 - 25 Air Changes per Hour (ACH) with positive air pressure gradient relative to dirty corridors.

You can inspect our 15-stage toolkit Stage 7 (MEP / Engineering) and Stage 8 (Interiors) for complete modular theatre and cleanroom specifications!`;
    }

    return `Thank you for your project query regarding "${query}". 

In the NOVA framework, this requirement aligns with the hospital development milestone lifecycle. We recommend:
1. Reviewing **Stage 7 & Stage 10** of the Hospital Owners Toolkit.
2. Formulating a structured Request for Proposal (RFP) with exact clinical throughput expectations.
3. Engaging verified domain specialists in our directory to evaluate equipment warranties (minimum 5-year CMC uptime >98%).

Would you like to search verified vendors and advisors specializing in this area?`;
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim()) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAnswer(text);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">NOVA AI Hospital Consultant</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Live Preview
                </span>
              </div>
              <p className="text-xs text-slate-300">
                AI-assisted clinical planning, area benchmarks, and statutory advisory
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                }`}
              >
                {m.content}

                {m.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-100">
                    {m.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl p-3 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                <span>Synthesizing hospital infrastructure recommendations...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt suggestions */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Suggested Consultation Inquiries:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[11px] text-slate-700 font-medium transition-colors text-left cursor-pointer border border-slate-200/80"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Ask about hospital area norms, licenses, OTs, equipment sizing..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputPrompt.trim() || isTyping}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Consult</span>
          </button>
        </div>

      </div>
    </div>
  );
};
