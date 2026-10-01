import React, { useState } from 'react';
import { WhatsAppFlow, WhatsAppNodeType } from '../../types';
import { 
  Sparkles, 
  X, 
  Check, 
  Zap, 
  Image as ImageIcon, 
  ListFilter, 
  Store, 
  ShoppingCart, 
  ShoppingBag, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  RefreshCw, 
  Wand2, 
  Info,
  HelpCircle
} from 'lucide-react';
import { 
  generateWhatsAppFlowWithAi, 
  PRESET_AI_PROMPTS, 
  PresetAiPrompt 
} from './aiFlowGenerator';
import { SUPPORTED_MESSAGE_TYPES } from './MessageTypesPalette';

interface AiFlowBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFlow: (flow: WhatsAppFlow) => void;
}

export const AiFlowBuilderModal: React.FC<AiFlowBuilderModalProps> = ({
  isOpen,
  onClose,
  onApplyFlow
}) => {
  const [promptText, setPromptText] = useState('');
  const [flowName, setFlowName] = useState('');
  const [category, setCategory] = useState<'healthcare' | 'rfq' | 'vendor' | 'support'>('healthcare');
  const [selectedTypes, setSelectedTypes] = useState<WhatsAppNodeType[]>([
    'text_buttons',
    'media_buttons',
    'list',
    'catalogue',
    'single_product',
    'multi_product',
    'template'
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFlow, setGeneratedFlow] = useState<WhatsAppFlow | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: PresetAiPrompt) => {
    setActivePresetId(preset.id);
    setPromptText(preset.prompt);
    setFlowName(preset.title);
    setSelectedTypes(preset.recommendedTypes);
    setGeneratedFlow(null);
    setStatusMessage(null);
  };

  const handleToggleType = (type: WhatsAppNodeType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length <= 1) {
        return; // keep at least one
      }
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleSelectAllTypes = () => {
    setSelectedTypes([
      'text_buttons',
      'media_buttons',
      'list',
      'catalogue',
      'single_product',
      'multi_product',
      'template'
    ]);
  };

  const handleGenerate = async () => {
    if (!promptText.trim()) return;

    setIsGenerating(true);
    setStatusMessage('Synthesizing journey across selected WhatsApp message types...');
    try {
      const flow = await generateWhatsAppFlowWithAi({
        prompt: promptText,
        flowName: flowName.trim() || undefined,
        category,
        supportedTypes: selectedTypes
      });

      setGeneratedFlow(flow);
      setStatusMessage(`Successfully generated ${flow.nodes.length}-step interactive WhatsApp journey!`);
    } catch (err: any) {
      console.error('Generation error:', err);
      setStatusMessage('Error during generation. Please adjust your prompt and retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmAndLoad = () => {
    if (generatedFlow) {
      onApplyFlow(generatedFlow);
      onClose();
    }
  };

  const getTypeIcon = (type: WhatsAppNodeType) => {
    switch (type) {
      case 'text_buttons':
      case 'button':
        return <Zap className="w-3.5 h-3.5 text-emerald-500" />;
      case 'media_buttons':
        return <ImageIcon className="w-3.5 h-3.5 text-teal-500" />;
      case 'list':
        return <ListFilter className="w-3.5 h-3.5 text-blue-500" />;
      case 'catalogue':
        return <Store className="w-3.5 h-3.5 text-indigo-500" />;
      case 'single_product':
        return <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />;
      case 'multi_product':
        return <ShoppingBag className="w-3.5 h-3.5 text-cyan-500" />;
      case 'template':
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 dark:bg-black/85 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      id="ai-flow-builder-modal"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-950 dark:via-slate-900 dark:to-teal-950 border-b border-emerald-500/20 dark:border-slate-800 flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 dark:bg-emerald-500/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-md">
              <Sparkles className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  AI Flow Builder
                </h2>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-200 font-bold px-2 py-0.5 rounded-full border border-emerald-300/30">
                  Meta Graph API
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 dark:text-slate-300">
                Generate interactive multi-step WhatsApp flows supporting all 7 official message types
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close AI Flow Builder"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick Prompts Presets Strip */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. Healthcare Flow Archetypes (Quick Select)
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-400">
                Click to load pre-configured journey
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {PRESET_AI_PROMPTS.map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-slate-50/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/70 hover:bg-slate-100/80 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md">
                          {preset.badge}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {preset.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      <span>{preset.recommendedTypes.length} types supported</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt & Customization */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>2. Describe Flow Journey or Instructions</span>
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-400">
                Natural language prompt
              </span>
            </div>

            <textarea
              rows={3}
              value={promptText}
              onChange={(e) => {
                setPromptText(e.target.value);
                setActivePresetId(null);
              }}
              placeholder="e.g., Create a 4-step procurement journey for ICU Ventilators: start with media buttons showcase, link to Meta catalog, display a single product SKU with price, and end with a verified template confirmation..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none transition-all"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Flow Name (Optional)
                </label>
                <input
                  type="text"
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  placeholder="e.g., ICU Ventilator Procurement Journey"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="healthcare">Healthcare & Clinical</option>
                  <option value="rfq">Procurement & RFQ</option>
                  <option value="vendor">Vendor & OEM Sales</option>
                  <option value="support">Service Desk & AMC</option>
                </select>
              </div>
            </div>
          </div>

          {/* Supported Message Types Matrix */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>3. Supported Message Types to Include in Flow ({selectedTypes.length}/7)</span>
              </label>

              <button
                type="button"
                onClick={handleSelectAllTypes}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Select All 7 Types
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {SUPPORTED_MESSAGE_TYPES.map((typeDef) => {
                const isSelected = selectedTypes.includes(typeDef.type);
                const Icon = typeDef.icon;

                return (
                  <button
                    key={typeDef.type}
                    type="button"
                    onClick={() => handleToggleType(typeDef.type)}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500/80 text-slate-900 dark:text-white shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    }`}>
                      {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">
                        {typeDef.label}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        {typeDef.metaType}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action to Generate */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !promptText.trim()}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing WhatsApp Journey with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Generate Flow Supporting Selected Message Types</span>
                </>
              )}
            </button>
          </div>

          {/* Status message */}
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              generatedFlow 
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                : 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
            }`}>
              <Info className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedFlow && (
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Generated Flow Preview ({generatedFlow.nodes.length} Steps)
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Ready to Load into Canvas
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {generatedFlow.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    Keyword: {generatedFlow.triggerKeyword}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {generatedFlow.description}
                </p>

                {/* Steps sequence strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
                  {generatedFlow.nodes.map((node, i) => (
                    <div 
                      key={node.id}
                      className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-slate-400">
                          Step {i + 1}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          {getTypeIcon(node.type)}
                          <span>{node.type.replace('_', ' ')}</span>
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {node.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {node.bodyText}
                      </p>

                      {/* Message type specific micro-preview */}
                      {node.type === 'single_product' && node.singleProduct && (
                        <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                          SKU: {node.singleProduct.price} • {node.singleProduct.title}
                        </div>
                      )}
                      {node.type === 'catalogue' && (
                        <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded">
                          Meta Catalog Action: "View Catalog"
                        </div>
                      )}
                      {node.type === 'multi_product' && node.productSections && (
                        <div className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/50 px-1.5 py-0.5 rounded">
                          {node.productSections.length} Sections • Multi-Item In-Chat Cart
                        </div>
                      )}
                      {node.type === 'list' && node.listSections && (
                        <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">
                          List Menu • {node.listSections.reduce((acc, s) => acc + s.rows.length, 0)} Items
                        </div>
                      )}
                      {node.type === 'text_buttons' && node.buttons && (
                        <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded truncate">
                          {node.buttons.map(b => b.title).join(' | ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {generatedFlow ? (
            <button
              type="button"
              onClick={handleConfirmAndLoad}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Load Generated Flow into Canvas &amp; Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !promptText.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Flow</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
