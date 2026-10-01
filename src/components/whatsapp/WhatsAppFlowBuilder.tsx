import React, { useState, useEffect } from 'react';
import { 
  WhatsAppFlow, 
  WhatsAppNode, 
  WhatsAppNodeType 
} from '../../types';
import { PRESET_WHATSAPP_FLOWS } from '../../data/whatsappTemplates';
import { WhatsAppSimulator } from './WhatsAppSimulator';
import { NodeInspector } from './NodeInspector';
import { MetaJsonModal } from './MetaJsonModal';
import { FlowCanvas } from './FlowCanvas';
import { MessageTypesPalette } from './MessageTypesPalette';
import { createDefaultWhatsAppNode } from './whatsappNodeFactory';
import { AiFlowBuilderModal } from './AiFlowBuilderModal';
import { ThemeToggle } from '../ThemeToggle';
import { 
  Sparkles, 
  Plus, 
  Code, 
  Save, 
  RotateCcw, 
  Layers, 
  Smartphone, 
  Settings2, 
  ArrowLeft, 
  Check, 
  MessageSquare, 
  ListFilter, 
  Zap, 
  ShieldCheck, 
  ExternalLink, 
  Network, 
  Split, 
  Maximize2, 
  Eye,
  Store,
  ShoppingCart,
  ShoppingBag,
  Image as ImageIcon,
  X,
  Wand2
} from 'lucide-react';

interface WhatsAppFlowBuilderProps {
  onBackToHome?: () => void;
  onNotify?: (msg: string) => void;
}

export const WhatsAppFlowBuilder: React.FC<WhatsAppFlowBuilderProps> = ({
  onBackToHome,
  onNotify
}) => {
  // Saved custom flows or defaults
  const [flows, setFlows] = useState<WhatsAppFlow[]>(() => {
    try {
      const saved = localStorage.getItem('nova_whatsapp_flows');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback to presets
    }
    return PRESET_WHATSAPP_FLOWS;
  });

  const [activeFlowId, setActiveFlowId] = useState<string>(() => flows[0]?.id || 'flow-hospital-turnkey');
  const [activeNodeId, setActiveNodeId] = useState<string>(() => flows[0]?.startNodeId || 'node-welcome');
  const [viewMode, setViewMode] = useState<'canvas' | 'sequence'>('canvas');
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [mobileTab, setMobileTab] = useState<'sequence' | 'editor' | 'preview'>('editor');
  const [seqPaletteOpen, setSeqPaletteOpen] = useState(false);

  // Current active flow
  const currentFlow = flows.find(f => f.id === activeFlowId) || flows[0];

  // Active node being configured
  const activeNode = currentFlow?.nodes.find(n => n.id === activeNodeId) || currentFlow?.nodes[0];

  // Ensure activeNodeId is valid when switching flows
  useEffect(() => {
    if (currentFlow) {
      if (!currentFlow.nodes.some(n => n.id === activeNodeId)) {
        setActiveNodeId(currentFlow.startNodeId || currentFlow.nodes[0]?.id || '');
      }
    }
  }, [activeFlowId, currentFlow, activeNodeId]);

  // Persist flow changes to localStorage
  const saveFlowsToStorage = (updatedFlows: WhatsAppFlow[]) => {
    setFlows(updatedFlows);
    try {
      localStorage.setItem('nova_whatsapp_flows', JSON.stringify(updatedFlows));
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2000);
    } catch (e) {
      console.error('Failed to save flows to localStorage', e);
    }
  };

  const handleUpdateCurrentFlow = (updatedFlow: WhatsAppFlow) => {
    const updatedFlows = flows.map(f => f.id === updatedFlow.id ? updatedFlow : f);
    saveFlowsToStorage(updatedFlows);
  };

  const handleUpdateActiveNode = (updatedNode: WhatsAppNode) => {
    if (!currentFlow) return;
    const updatedNodes = currentFlow.nodes.map(n => n.id === updatedNode.id ? updatedNode : n);
    handleUpdateCurrentFlow({
      ...currentFlow,
      nodes: updatedNodes
    });
  };

  const handleApplyAiFlow = (generatedFlow: WhatsAppFlow) => {
    const updatedFlows = [generatedFlow, ...flows.filter(f => f.id !== generatedFlow.id)];
    saveFlowsToStorage(updatedFlows);
    setActiveFlowId(generatedFlow.id);
    setActiveNodeId(generatedFlow.startNodeId || generatedFlow.nodes[0]?.id || '');
    if (onNotify) {
      onNotify(`AI Flow "${generatedFlow.name}" loaded with ${generatedFlow.nodes.length} steps!`);
    }
  };

  const handleAddNode = (type: WhatsAppNodeType = 'text_buttons', position?: { x: number; y: number }) => {
    if (!currentFlow) return;
    
    // Sensible default coordinate in React Flow
    const lastNode = currentFlow.nodes[currentFlow.nodes.length - 1];
    const newPos = position || {
      x: (lastNode?.position?.x || 100) + 420,
      y: (lastNode?.position?.y || 120)
    };

    const newNode = createDefaultWhatsAppNode(type, currentFlow.nodes.length + 1, newPos);

    const updatedFlow: WhatsAppFlow = {
      ...currentFlow,
      nodes: [...currentFlow.nodes, newNode]
    };
    handleUpdateCurrentFlow(updatedFlow);
    setActiveNodeId(newNode.id);
    if (mobileTab === 'sequence') setMobileTab('editor');
    if (onNotify) onNotify(`Added new step: "${newNode.title}"`);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!currentFlow || currentFlow.nodes.length <= 1) {
      if (onNotify) onNotify('Flow must contain at least one message step.');
      return;
    }
    const updatedNodes = currentFlow.nodes.filter(n => n.id !== nodeId);
    const nextActive = updatedNodes[0]?.id || '';
    handleUpdateCurrentFlow({
      ...currentFlow,
      nodes: updatedNodes,
      startNodeId: currentFlow.startNodeId === nodeId ? nextActive : currentFlow.startNodeId
    });
    setActiveNodeId(nextActive);
    if (onNotify) onNotify('Node removed from flow.');
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all flows to standard healthcare templates? Any custom edits will be reverted.')) {
      saveFlowsToStorage(PRESET_WHATSAPP_FLOWS);
      setActiveFlowId(PRESET_WHATSAPP_FLOWS[0].id);
      setActiveNodeId(PRESET_WHATSAPP_FLOWS[0].startNodeId);
      if (onNotify) onNotify('Flows reset to standard healthcare templates.');
    }
  };

  const handleCreateNewBlankFlow = () => {
    const newFlowId = `flow-custom-${Date.now()}`;
    const startNodeId = `node-start-${Date.now()}`;
    const newFlow: WhatsAppFlow = {
      id: newFlowId,
      name: 'Custom Interactive WhatsApp Flow',
      description: 'Custom multi-step interactive WhatsApp journey built with React Flow.',
      category: 'healthcare',
      triggerKeyword: 'HELLO',
      startNodeId,
      nodes: [
        {
          id: startNodeId,
          title: '1. Welcome Step',
          type: 'text_buttons',
          position: { x: 80, y: 100 },
          headerType: 'text',
          headerContent: 'NOVA HEALTHCARE NETWORK',
          bodyText: 'Namaste! Welcome to our healthcare desk. How can we help you today?',
          footerText: 'Reply via buttons below',
          buttons: [
            { id: 'b1', title: 'Post Requirement', nextNodeId: '' },
            { id: 'b2', title: 'Browse Directory', nextNodeId: '' }
          ]
        }
      ]
    };

    const updated = [...flows, newFlow];
    saveFlowsToStorage(updated);
    setActiveFlowId(newFlowId);
    setActiveNodeId(startNodeId);
    if (onNotify) onNotify('New custom flow created.');
  };

  // Node Type Icon Helper
  const getNodeTypeBadge = (type: WhatsAppNodeType) => {
    switch (type) {
      case 'text_buttons':
      case 'button':
        return { label: 'Text Buttons (Quick Reply)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Zap };
      case 'media_buttons':
        return { label: 'Media Buttons', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: ImageIcon };
      case 'list':
        return { label: 'Interactive List Menu', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: ListFilter };
      case 'catalogue':
        return { label: 'Catalogue Message', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: Store };
      case 'single_product':
        return { label: 'Single Product SKU', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: ShoppingCart };
      case 'multi_product':
        return { label: 'Multi Product Catalog', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', icon: ShoppingBag };
      case 'template':
        return { label: 'Meta Pre-Approved Template', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: Zap };
      case 'flow_screen':
        return { label: 'Native Flow Form', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Sparkles };
      case 'media_cta':
        return { label: 'Media + Call/URL', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: ExternalLink };
      case 'input_capture':
        return { label: 'Store Variable Input', color: 'bg-slate-100 text-slate-800 border-slate-300', icon: MessageSquare };
      case 'agent_handover':
        return { label: 'Live Agent Escalation', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: ShieldCheck };
      default:
        return { label: 'Message', color: 'bg-slate-100 text-slate-800 border-slate-300', icon: MessageSquare };
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Control Header Bar */}
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 shrink-0 z-20 transition-colors">
        <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-2.5">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  title="Back to Platform"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    WhatsApp Flow Builder
                  </h1>
                  <span className="text-[10px] bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>Meta Cloud API</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  Visual node-based canvas for interactive WhatsApp bot journeys &amp; commerce catalogs
                </p>
              </div>
            </div>

            {/* View Mode Switcher (Canvas vs Linear Sequence) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewMode('canvas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'canvas'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Visual React Flow Canvas"
              >
                <Split className="w-3.5 h-3.5" />
                <span>Visual Canvas</span>
              </button>

              <button
                onClick={() => setViewMode('sequence')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'sequence'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Linear Step List & Simulator"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Step Sequence</span>
              </button>
            </div>
          </div>

          {/* Flow Selector, AI Generator & Global Actions */}
          <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto justify-end">
            
            {/* AI Flow Builder Button (Supports all 7 message types) */}
            <button
              onClick={() => setAiModalOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all border border-emerald-400/30 ring-2 ring-emerald-500/20"
              title="Generate Complete WhatsApp Flow with AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>AI Flow Builder</span>
            </button>

            {/* Flow Template Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline">Flow:</span>
              <select
                value={activeFlowId}
                onChange={(e) => {
                  setActiveFlowId(e.target.value);
                  const selected = flows.find(f => f.id === e.target.value);
                  if (selected) setActiveNodeId(selected.startNodeId || selected.nodes[0]?.id || '');
                }}
                className="bg-transparent text-xs font-bold text-emerald-700 dark:text-emerald-400 focus:outline-none cursor-pointer py-1"
              >
                {flows.map((flow) => (
                  <option key={flow.id} value={flow.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {flow.name}
                  </option>
                ))}
              </select>
            </div>

            {/* New Flow Button */}
            <button
              onClick={handleCreateNewBlankFlow}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Create blank interactive flow"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">New Flow</span>
            </button>

            {/* View Meta JSON Payload */}
            <button
              onClick={() => setJsonModalOpen(true)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="View Meta Graph API JSON payload"
            >
              <Code className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span>Meta JSON</span>
            </button>

            {/* Reset to Defaults */}
            <button
              onClick={handleResetToDefaults}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Reset to standard templates"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Save indicator */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              {isSavedRecently ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400/80" />
                  <span>Synced</span>
                </>
              )}
            </div>

            {/* Dark / Light Theme Toggle */}
            <div className="pl-1 border-l border-slate-200 dark:border-slate-800">
              <ThemeToggle />
            </div>

          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col p-3 sm:p-4 max-w-[1700px] w-full mx-auto overflow-hidden">
        
        {/* ========================================================================= */}
        {/* VIEW MODE 1: VISUAL REACT FLOW CANVAS WORKSPACE                            */}
        {/* ========================================================================= */}
        {viewMode === 'canvas' ? (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-125px)] min-h-[640px]">
            
            {/* Canvas Main Viewport (Takes 7 or 8 columns on large screens) */}
            <div className="lg:col-span-8 h-full flex flex-col relative">
              <FlowCanvas
                flow={currentFlow}
                activeNodeId={activeNodeId}
                onSelectNode={(nodeId) => setActiveNodeId(nodeId)}
                onUpdateFlow={handleUpdateCurrentFlow}
                onAddNode={handleAddNode}
                onDeleteNode={handleDeleteNode}
              />
            </div>

            {/* Side-by-Side Dual Inspector & Simulator Pane (Takes 4 columns) */}
            <div className="lg:col-span-4 h-full flex flex-col gap-3 overflow-hidden">
              
              {/* Tab Selector between Node Inspector & WhatsApp Simulator */}
              <div className="bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center shrink-0 shadow-xs">
                <button
                  onClick={() => setMobileTab('editor')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mobileTab === 'editor'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Node Inspector</span>
                </button>

                <button
                  onClick={() => setMobileTab('preview')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mobileTab === 'preview'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>WhatsApp Simulator</span>
                </button>
              </div>

              {/* Dynamic Pane Body */}
              <div className="flex-1 overflow-y-auto pr-1">
                {mobileTab === 'editor' ? (
                  <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <NodeInspector
                      node={activeNode}
                      allNodes={currentFlow.nodes}
                      onUpdateNode={handleUpdateActiveNode}
                      onDeleteNode={handleDeleteNode}
                    />
                  </div>
                ) : (
                  <div className="w-full flex justify-center py-1">
                    <WhatsAppSimulator
                      flow={currentFlow}
                      activeNodeId={activeNodeId}
                      onSelectNode={(nodeId) => setActiveNodeId(nodeId)}
                    />
                  </div>
                )}
              </div>

            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW MODE 2: LINEAR SEQUENCE + 3-COLUMN WORKSPACE                          */
          /* ========================================================================= */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* COLUMN 1: STEP LIST (3 cols) */}
            <div className={`lg:col-span-3 space-y-4 ${mobileTab === 'sequence' ? 'block' : 'hidden lg:block'}`}>
              
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-700/50">
                    Interactive Journey
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    {currentFlow.nodes.length} Steps
                  </span>
                </div>

                <h2 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  {currentFlow.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {currentFlow.description}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-center">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Avg Read Rate</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">98.4%</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Button Click Rate</span>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400">54.2%</span>
                  </div>
                </div>
              </div>

              {/* Step list items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Message Sequence</span>
                  </h3>
                  
                  <button
                    onClick={() => setSeqPaletteOpen(!seqPaletteOpen)}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{seqPaletteOpen ? 'Close Palette' : 'Add Message Type'}</span>
                  </button>
                </div>

                {/* Collapsible Palette in Sequence View */}
                {seqPaletteOpen && (
                  <div className="p-2 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 animate-fadeIn shadow-lg">
                    <MessageTypesPalette 
                      onSelectType={(type) => {
                        handleAddNode(type);
                        setSeqPaletteOpen(false);
                      }}
                    />
                  </div>
                )}

                <div className="space-y-2 max-h-[58vh] overflow-y-auto pr-1">
                  {currentFlow.nodes.map((node) => {
                    const isActive = node.id === activeNodeId;
                    const isStart = node.id === currentFlow.startNodeId;
                    const badge = getNodeTypeBadge(node.type);
                    const Icon = badge.icon;

                    return (
                      <div
                        key={node.id}
                        onClick={() => {
                          setActiveNodeId(node.id);
                          setMobileTab('editor');
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative ${
                          isActive
                            ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                            : 'bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        {isStart && (
                          <span className="absolute top-2 right-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                            Trigger
                          </span>
                        )}

                        <div className="flex items-start gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0 pr-12">
                            <h4 className={`text-xs font-bold truncate ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                              {node.title}
                            </h4>
                            
                            <span className={`inline-block text-[10px] font-semibold mt-1 px-1.5 py-0.5 rounded border ${badge.color}`}>
                              {badge.label}
                            </span>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                              {node.bodyText}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* COLUMN 2: NODE INSPECTOR (5 cols) */}
            <div className={`lg:col-span-5 ${mobileTab === 'editor' ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <NodeInspector
                  node={activeNode}
                  allNodes={currentFlow.nodes}
                  onUpdateNode={handleUpdateActiveNode}
                  onDeleteNode={handleDeleteNode}
                />
              </div>
            </div>

            {/* COLUMN 3: SIMULATOR (4 cols) */}
            <div className={`lg:col-span-4 flex justify-center ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-4 w-full flex justify-center">
                <WhatsAppSimulator
                  flow={currentFlow}
                  activeNodeId={activeNodeId}
                  onSelectNode={(nodeId) => setActiveNodeId(nodeId)}
                />
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Meta Cloud API JSON Export Modal */}
      <MetaJsonModal
        isOpen={jsonModalOpen}
        onClose={() => setJsonModalOpen(false)}
        flow={currentFlow}
        activeNode={activeNode}
      />

      {/* AI WhatsApp Flow Builder Modal (Supports all 7 message types) */}
      <AiFlowBuilderModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onApplyFlow={handleApplyAiFlow}
      />

    </div>
  );
};
