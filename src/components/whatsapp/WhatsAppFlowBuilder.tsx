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
import { 
  Sparkles, 
  Plus, 
  Code, 
  Save, 
  RotateCcw, 
  Layers, 
  Smartphone, 
  Settings2, 
  HelpCircle, 
  ArrowLeft, 
  Check, 
  ChevronRight, 
  MessageSquare, 
  FileText, 
  ListFilter, 
  Zap, 
  ShieldCheck, 
  Bot,
  ExternalLink,
  Trash2,
  Copy,
  Network,
  Split,
  Maximize2,
  Sliders,
  Eye
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
    } catch (e) {}
    return PRESET_WHATSAPP_FLOWS;
  });

  const [activeFlowId, setActiveFlowId] = useState<string>(() => flows[0]?.id || 'flow-hospital-rfq');
  const currentFlow = flows.find(f => f.id === activeFlowId) || flows[0];

  const [activeNodeId, setActiveNodeId] = useState<string>(() => currentFlow?.startNodeId || currentFlow?.nodes[0]?.id || '');
  const activeNode = currentFlow?.nodes.find(n => n.id === activeNodeId) || currentFlow?.nodes[0] || null;

  // View mode: 'canvas' (React Flow graph) or 'sequence' (step list)
  const [viewMode, setViewMode] = useState<'canvas' | 'sequence'>('canvas');

  // Desktop side panel: 'both' | 'editor' | 'preview' | 'collapsed'
  const [sidePanel, setSidePanel] = useState<'both' | 'editor' | 'preview' | 'collapsed'>('both');

  // View tabs on mobile/smaller screens: 'canvas' | 'sequence' | 'editor' | 'preview'
  const [mobileTab, setMobileTab] = useState<'canvas' | 'sequence' | 'editor' | 'preview'>('canvas');

  // Meta Cloud API JSON Modal state
  const [jsonModalOpen, setJsonModalOpen] = useState(false);

  // Save to localStorage whenever flows change
  const saveFlowsToStorage = (updatedFlows: WhatsAppFlow[]) => {
    setFlows(updatedFlows);
    try {
      localStorage.setItem('nova_whatsapp_flows', JSON.stringify(updatedFlows));
    } catch (e) {}
  };

  const handleUpdateCurrentFlow = (updated: WhatsAppFlow) => {
    const updatedFlows = flows.map(f => f.id === updated.id ? updated : f);
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

  const handleAddNode = (type: WhatsAppNodeType = 'button') => {
    if (!currentFlow) return;
    const newId = `node-${Date.now()}`;
    
    // Sensible default coordinate in React Flow
    const lastNode = currentFlow.nodes[currentFlow.nodes.length - 1];
    const newPos = {
      x: (lastNode?.position?.x || 100) + 400,
      y: (lastNode?.position?.y || 120)
    };

    const newNode: WhatsAppNode = {
      id: newId,
      title: `${currentFlow.nodes.length + 1}. Interactive Step`,
      type,
      position: newPos,
      headerType: 'none',
      bodyText: 'Hello! Please select your response:',
      footerText: 'NOVA Official Bot',
      buttons: type === 'button' ? [
        { id: `btn-${Date.now()}-1`, title: 'Option 1', nextNodeId: '' },
        { id: `btn-${Date.now()}-2`, title: 'Option 2', nextNodeId: '' }
      ] : undefined,
      listButtonText: type === 'list' ? 'Select Option' : undefined,
      listSections: type === 'list' ? [
        {
          title: 'Department Categories',
          rows: [
            { id: `r-${Date.now()}-1`, title: 'Hospital Consultation', description: 'Consult with healthcare architects', nextNodeId: '' }
          ]
        }
      ] : undefined
    };

    const updatedFlow: WhatsAppFlow = {
      ...currentFlow,
      nodes: [...currentFlow.nodes, newNode]
    };
    handleUpdateCurrentFlow(updatedFlow);
    setActiveNodeId(newId);
    if (mobileTab === 'sequence') setMobileTab('editor');
    if (onNotify) onNotify(`Added new step to React Flow canvas: "${newNode.title}"`);
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
          type: 'button',
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
      case 'button':
        return { label: 'Quick Reply (3 Buttons)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Zap };
      case 'list':
        return { label: 'Interactive List Menu', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: ListFilter };
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Top Control Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-2.5 shrink-0 z-20">
        <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-2.5">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
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
                  <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                    WhatsApp Flow Builder
                  </h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    React Flow Powered
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Drag, connect, and customize interactive WhatsApp quick replies, list menus, and Meta forms.
                </p>
              </div>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="flex lg:hidden bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setMobileTab('canvas')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  mobileTab === 'canvas' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                Canvas
              </button>
              <button
                onClick={() => setMobileTab('editor')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  mobileTab === 'editor' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => setMobileTab('preview')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  mobileTab === 'preview' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                Phone
              </button>
            </div>
          </div>

          {/* View Mode Toggle & Side Panels Controls */}
          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            
            {/* View Mode Pill Switcher (React Flow Canvas vs Step List) */}
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('canvas')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'canvas' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Interactive React Flow Graph Canvas"
              >
                <Network className="w-3.5 h-3.5" />
                <span>React Flow</span>
              </button>
              <button
                onClick={() => setViewMode('sequence')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'sequence' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Linear Sequence List"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Step List</span>
              </button>
            </div>

            {/* Side Panel Toggle (Editor / Phone Simulator / Both) */}
            <div className="hidden xl:flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setSidePanel('both')}
                className={`px-2 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                  sidePanel === 'both' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Show Canvas, Inspector, and Phone"
              >
                Full Studio
              </button>
              <button
                onClick={() => setSidePanel('editor')}
                className={`px-2 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                  sidePanel === 'editor' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Canvas + Step Inspector"
              >
                Inspector
              </button>
              <button
                onClick={() => setSidePanel('preview')}
                className={`px-2 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                  sidePanel === 'preview' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Canvas + Phone Simulator"
              >
                Simulator
              </button>
              <button
                onClick={() => setSidePanel('collapsed')}
                className={`px-2 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                  sidePanel === 'collapsed' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Maximize Canvas"
              >
                Canvas Only
              </button>
            </div>

            {/* Template Selector Dropdown */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Flow:</span>
              <select
                value={activeFlowId}
                onChange={(e) => {
                  if (e.target.value === 'NEW_FLOW') {
                    handleCreateNewBlankFlow();
                  } else {
                    setActiveFlowId(e.target.value);
                    const chosen = flows.find(f => f.id === e.target.value);
                    if (chosen) setActiveNodeId(chosen.startNodeId || chosen.nodes[0]?.id || '');
                  }
                }}
                className="bg-transparent text-xs font-bold text-emerald-400 outline-none cursor-pointer"
              >
                {flows.map((f) => (
                  <option key={f.id} value={f.id} className="bg-slate-900 text-slate-200">
                    {f.name}
                  </option>
                ))}
                <option value="NEW_FLOW" className="bg-slate-900 text-emerald-400 font-bold">
                  + Create New Flow...
                </option>
              </select>
            </div>

            {/* Keyword Trigger Input */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs shrink-0">
              <span className="text-slate-400 text-[11px] font-bold">Trigger:</span>
              <input
                type="text"
                value={currentFlow.triggerKeyword}
                onChange={(e) => handleUpdateCurrentFlow({
                  ...currentFlow,
                  triggerKeyword: e.target.value.toUpperCase()
                })}
                placeholder="KEYWORD"
                className="w-20 bg-transparent text-xs font-mono font-bold text-amber-400 outline-none uppercase"
                title="Inbound keyword that starts this flow"
              />
            </div>

            {/* View Meta JSON Cloud API payload */}
            <button
              onClick={() => setJsonModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
              title="Export Meta Cloud API Payload"
            >
              <Code className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Meta JSON</span>
            </button>

            {/* Reset Flow Defaults */}
            <button
              onClick={handleResetToDefaults}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer transition-colors shrink-0"
              title="Reset to Default Healthcare Flows"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Save Button */}
            <button
              onClick={() => {
                saveFlowsToStorage(flows);
                if (onNotify) onNotify('Flow configuration saved successfully.');
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-4 flex flex-col">
        
        {/* VIEW 1: REACT FLOW INTERACTIVE CANVAS WORKSPACE (Default) */}
        {viewMode === 'canvas' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-[660px]">
            
            {/* React Flow Visual Canvas Area */}
            <div className={`transition-all duration-200 flex flex-col ${
              mobileTab === 'canvas' ? 'block' : 'hidden lg:flex'
            } ${
              sidePanel === 'collapsed' 
                ? 'lg:col-span-12' 
                : sidePanel === 'both' 
                  ? 'lg:col-span-6 xl:col-span-7' 
                  : 'lg:col-span-8'
            }`}>
              <FlowCanvas
                flow={currentFlow}
                activeNodeId={activeNodeId}
                onSelectNode={(id) => {
                  setActiveNodeId(id);
                  if (mobileTab === 'canvas') setMobileTab('editor');
                }}
                onUpdateFlow={handleUpdateCurrentFlow}
                onAddNode={handleAddNode}
                onDeleteNode={handleDeleteNode}
              />
            </div>

            {/* Side Panel: Step Inspector & Phone Simulator */}
            {sidePanel !== 'collapsed' && (
              <div className={`grid gap-4 ${
                sidePanel === 'both' 
                  ? 'lg:col-span-6 xl:col-span-5 grid-cols-1 xl:grid-cols-12' 
                  : 'lg:col-span-4 grid-cols-1'
              }`}>
                
                {/* Node Inspector */}
                {(sidePanel === 'both' || sidePanel === 'editor') && (
                  <div className={`${sidePanel === 'both' ? 'xl:col-span-6' : 'col-span-1'} ${
                    mobileTab === 'editor' ? 'block' : 'hidden lg:block'
                  }`}>
                    <div className="h-full max-h-[82vh] overflow-y-auto pr-1">
                      <NodeInspector
                        node={activeNode}
                        allNodes={currentFlow.nodes}
                        onUpdateNode={handleUpdateActiveNode}
                        onDeleteNode={handleDeleteNode}
                      />
                    </div>
                  </div>
                )}

                {/* Phone Simulator */}
                {(sidePanel === 'both' || sidePanel === 'preview') && (
                  <div className={`flex justify-center ${sidePanel === 'both' ? 'xl:col-span-6' : 'col-span-1'} ${
                    mobileTab === 'preview' ? 'block' : 'hidden lg:flex'
                  }`}>
                    <div className="w-full flex justify-center sticky top-2">
                      <WhatsAppSimulator
                        flow={currentFlow}
                        activeNodeId={activeNodeId}
                        onSelectNode={(nodeId) => setActiveNodeId(nodeId)}
                      />
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* VIEW 2: LINEAR SEQUENCE STEP TREE WORKSPACE */}
        {viewMode === 'sequence' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* COLUMN 1: STEP LIST (3 cols) */}
            <div className={`lg:col-span-3 space-y-4 ${mobileTab === 'sequence' ? 'block' : 'hidden lg:block'}`}>
              
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/50">
                    Interactive Journey
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {currentFlow.nodes.length} Steps
                  </span>
                </div>

                <h2 className="text-sm font-black text-white leading-tight">
                  {currentFlow.name}
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {currentFlow.description}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-700/60 text-center">
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block font-semibold">Avg Read Rate</span>
                    <span className="text-sm font-black text-emerald-400">98.4%</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block font-semibold">Button Click Rate</span>
                    <span className="text-sm font-black text-blue-400">54.2%</span>
                  </div>
                </div>
              </div>

              {/* Step list items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Message Sequence</span>
                  </h3>
                  
                  <button
                    onClick={() => handleAddNode('button')}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>

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
                            ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                            : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        {isStart && (
                          <span className="absolute top-2 right-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Trigger
                          </span>
                        )}

                        <div className="flex items-start gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isActive ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0 pr-12">
                            <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                              {node.title}
                            </h4>
                            
                            <span className={`inline-block text-[10px] font-semibold mt-1 px-1.5 py-0.5 rounded border ${badge.color}`}>
                              {badge.label}
                            </span>

                            <p className="text-[11px] text-slate-400 mt-1 truncate">
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
              <div className="sticky top-4">
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

    </div>
  );
};
