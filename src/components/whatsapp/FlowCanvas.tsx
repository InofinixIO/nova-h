import React, { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  MarkerType,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  WhatsAppFlow, 
  WhatsAppNode, 
  WhatsAppNodeType 
} from '../../types';
import { WhatsAppFlowNode, WhatsAppFlowNodeData } from './WhatsAppFlowNode';
import { 
  Plus, 
  LayoutDashboard, 
  Sparkles, 
  Zap, 
  ListFilter, 
  ShieldCheck, 
  ExternalLink,
  Maximize2,
  RefreshCw,
  Info
} from 'lucide-react';

const nodeTypes = {
  whatsappStep: WhatsAppFlowNode,
};

interface FlowCanvasProps {
  flow: WhatsAppFlow;
  activeNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onUpdateFlow: (flow: WhatsAppFlow) => void;
  onAddNode: (type: WhatsAppNodeType) => void;
  onDeleteNode?: (nodeId: string) => void;
}

// Layout helper: Computes clean hierarchical positions if coordinates aren't set
export function computeAutoLayout(flow: WhatsAppFlow): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const visited = new Set<string>();

  // Map graph adjacency
  const childrenMap = new Map<string, string[]>();
  flow.nodes.forEach(node => {
    const targets: string[] = [];
    if (node.buttons) {
      node.buttons.forEach(b => {
        if (b.nextNodeId) targets.push(b.nextNodeId);
      });
    }
    if (node.listSections) {
      node.listSections.forEach(s => {
        s.rows.forEach(r => {
          if (r.nextNodeId) targets.push(r.nextNodeId);
        });
      });
    }
    if (node.flowScreen?.nextNodeId) {
      targets.push(node.flowScreen.nextNodeId);
    }
    if (node.nextNodeId) {
      targets.push(node.nextNodeId);
    }
    childrenMap.set(node.id, targets);
  });

  // Start with trigger node
  const startId = flow.startNodeId || flow.nodes[0]?.id;
  
  // Layer-based BFS
  let currentLayer = [startId];
  let depth = 0;

  while (currentLayer.length > 0) {
    const nextLayer: string[] = [];
    const totalInLayer = currentLayer.length;
    const startY = -((totalInLayer - 1) * 380) / 2;

    currentLayer.forEach((nodeId, idx) => {
      if (!nodeId || visited.has(nodeId)) return;
      visited.add(nodeId);

      positions[nodeId] = {
        x: 60 + depth * 430,
        y: 100 + startY + idx * 390
      };

      const children = childrenMap.get(nodeId) || [];
      children.forEach(c => {
        if (!visited.has(c) && !nextLayer.includes(c)) {
          nextLayer.push(c);
        }
      });
    });

    currentLayer = nextLayer;
    depth++;
  }

  // Any unreached nodes placed in a secondary column
  let unreachedY = 100;
  flow.nodes.forEach(node => {
    if (!positions[node.id]) {
      positions[node.id] = {
        x: 60 + depth * 430,
        y: unreachedY
      };
      unreachedY += 390;
    }
  });

  return positions;
}

const FlowCanvasInner: React.FC<FlowCanvasProps> = ({
  flow,
  activeNodeId,
  onSelectNode,
  onUpdateFlow,
  onAddNode,
  onDeleteNode
}) => {
  const reactFlowInstance = useReactFlow();

  // Convert WhatsAppFlow nodes into ReactFlow Nodes
  const initialNodes = useMemo<Node[]>(() => {
    // If nodes lack coordinates, generate them
    const autoPositions = computeAutoLayout(flow);

    return flow.nodes.map((node, index) => {
      const pos = node.position || autoPositions[node.id] || {
        x: 80 + index * 420,
        y: 120 + (index % 2) * 100
      };

      return {
        id: node.id,
        type: 'whatsappStep',
        position: pos,
        data: {
          node,
          isActive: node.id === activeNodeId,
          isStart: node.id === flow.startNodeId,
          onSelectNode,
          onDeleteNode
        } as unknown as Record<string, unknown>,
      };
    });
  }, [flow, activeNodeId, onSelectNode, onDeleteNode]);

  // Convert WhatsAppFlow connections into ReactFlow Edges
  const initialEdges = useMemo(() => {
    const edges: Edge[] = [];

    flow.nodes.forEach(node => {
      const isNodeActive = node.id === activeNodeId;

      // 1. Quick Reply Buttons
      if (node.type === 'button' && node.buttons) {
        node.buttons.forEach((btn, idx) => {
          if (btn.nextNodeId && flow.nodes.some(n => n.id === btn.nextNodeId)) {
            edges.push({
              id: `edge-${node.id}-btn-${btn.id}-${btn.nextNodeId}`,
              source: node.id,
              sourceHandle: `btn-${btn.id}`,
              target: btn.nextNodeId,
              label: btn.title || `Button ${idx + 1}`,
              animated: isNodeActive,
              type: ConnectionLineType.SmoothStep,
              style: {
                stroke: isNodeActive ? '#10b981' : '#059669',
                strokeWidth: 2,
              },
              labelStyle: {
                fill: '#6ee7b7',
                fontWeight: 700,
                fontSize: 11,
              },
              labelBgStyle: {
                fill: '#064e3b',
                fillOpacity: 0.9,
                rx: 6,
                ry: 6,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: isNodeActive ? '#10b981' : '#059669',
                width: 16,
                height: 16,
              }
            });
          }
        });
      }

      // 2. List Menu Rows
      if (node.type === 'list' && node.listSections) {
        node.listSections.forEach(sec => {
          sec.rows.forEach(row => {
            if (row.nextNodeId && flow.nodes.some(n => n.id === row.nextNodeId)) {
              edges.push({
                id: `edge-${node.id}-row-${row.id}-${row.nextNodeId}`,
                source: node.id,
                sourceHandle: `row-${row.id}`,
                target: row.nextNodeId,
                label: row.title,
                animated: isNodeActive,
                type: ConnectionLineType.SmoothStep,
                style: {
                  stroke: isNodeActive ? '#3b82f6' : '#2563eb',
                  strokeWidth: 2,
                },
                labelStyle: {
                  fill: '#93c5fd',
                  fontWeight: 700,
                  fontSize: 11,
                },
                labelBgStyle: {
                  fill: '#1e3a8a',
                  fillOpacity: 0.9,
                  rx: 6,
                  ry: 6,
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: isNodeActive ? '#3b82f6' : '#2563eb',
                  width: 16,
                  height: 16,
                }
              });
            }
          });
        });
      }

      // 3. WhatsApp Native Form Screen
      if (node.type === 'flow_screen' && node.flowScreen?.nextNodeId) {
        if (flow.nodes.some(n => n.id === node.flowScreen?.nextNodeId)) {
          edges.push({
            id: `edge-${node.id}-submit-${node.flowScreen.nextNodeId}`,
            source: node.id,
            sourceHandle: 'submit',
            target: node.flowScreen.nextNodeId,
            label: 'On Form Submit',
            animated: isNodeActive,
            type: ConnectionLineType.SmoothStep,
            style: {
              stroke: isNodeActive ? '#a855f7' : '#7c3aed',
              strokeWidth: 2,
            },
            labelStyle: {
              fill: '#d8b4fe',
              fontWeight: 700,
              fontSize: 11,
            },
            labelBgStyle: {
              fill: '#581c87',
              fillOpacity: 0.9,
              rx: 6,
              ry: 6,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isNodeActive ? '#a855f7' : '#7c3aed',
              width: 16,
              height: 16,
            }
          });
        }
      }

      // 4. Default / Direct Next Step
      if (node.type !== 'button' && node.type !== 'list' && node.type !== 'flow_screen' && node.nextNodeId) {
        if (flow.nodes.some(n => n.id === node.nextNodeId)) {
          edges.push({
            id: `edge-${node.id}-next-${node.nextNodeId}`,
            source: node.id,
            sourceHandle: 'next',
            target: node.nextNodeId,
            label: 'Next Step',
            animated: isNodeActive,
            type: ConnectionLineType.SmoothStep,
            style: {
              stroke: isNodeActive ? '#10b981' : '#64748b',
              strokeWidth: 2,
            },
            labelStyle: {
              fill: '#cbd5e1',
              fontWeight: 700,
              fontSize: 11,
            },
            labelBgStyle: {
              fill: '#1e293b',
              fillOpacity: 0.9,
              rx: 6,
              ry: 6,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isNodeActive ? '#10b981' : '#64748b',
              width: 16,
              height: 16,
            }
          });
        }
      }
    });

    return edges;
  }, [flow, activeNodeId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync internal state when flow or active node changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Handle Dragging / Moving nodes -> Persist coordinates
  const handleNodeDragStop = useCallback((_: any, draggedNode: Node) => {
    const updatedNodes = flow.nodes.map(n => {
      if (n.id === draggedNode.id) {
        return {
          ...n,
          position: draggedNode.position
        };
      }
      return n;
    });

    onUpdateFlow({
      ...flow,
      nodes: updatedNodes
    });
  }, [flow, onUpdateFlow]);

  // Handle Connecting an edge between steps (aiSensy / bot builder style)
  const handleConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    const sourceNode = flow.nodes.find(n => n.id === connection.source);
    if (!sourceNode) return;

    let updatedSource = { ...sourceNode };
    const handleId = connection.sourceHandle || '';

    // If source handle is a button handle (e.g. "btn-xxx")
    if (handleId.startsWith('btn-') && updatedSource.buttons) {
      const btnId = handleId.replace('btn-', '');
      updatedSource.buttons = updatedSource.buttons.map(b => 
        b.id === btnId ? { ...b, nextNodeId: connection.target } : b
      );
    } 
    // If source handle is a list row handle (e.g. "row-xxx")
    else if (handleId.startsWith('row-') && updatedSource.listSections) {
      const rowId = handleId.replace('row-', '');
      updatedSource.listSections = updatedSource.listSections.map(sec => ({
        ...sec,
        rows: sec.rows.map(r => r.id === rowId ? { ...r, nextNodeId: connection.target } : r)
      }));
    }
    // If source handle is form screen submit
    else if (handleId === 'submit' && updatedSource.flowScreen) {
      updatedSource.flowScreen = {
        ...updatedSource.flowScreen,
        nextNodeId: connection.target
      };
    }
    // Otherwise generic next step
    else {
      updatedSource.nextNodeId = connection.target;
    }

    const updatedFlowNodes = flow.nodes.map(n => n.id === updatedSource.id ? updatedSource : n);
    onUpdateFlow({
      ...flow,
      nodes: updatedFlowNodes
    });
  }, [flow, onUpdateFlow]);

  // Handle Edge Delete / Disconnection
  const handleEdgesDelete = useCallback((deletedEdges: Edge[]) => {
    let updatedNodes = [...flow.nodes];

    deletedEdges.forEach(edge => {
      const sourceNode = updatedNodes.find(n => n.id === edge.source);
      if (!sourceNode) return;

      const handleId = edge.sourceHandle || '';
      let mod = { ...sourceNode };

      if (handleId.startsWith('btn-') && mod.buttons) {
        const btnId = handleId.replace('btn-', '');
        mod.buttons = mod.buttons.map(b => b.id === btnId ? { ...b, nextNodeId: undefined } : b);
      } else if (handleId.startsWith('row-') && mod.listSections) {
        const rowId = handleId.replace('row-', '');
        mod.listSections = mod.listSections.map(s => ({
          ...s,
          rows: s.rows.map(r => r.id === rowId ? { ...r, nextNodeId: undefined } : r)
        }));
      } else if (handleId === 'submit' && mod.flowScreen) {
        mod.flowScreen = { ...mod.flowScreen, nextNodeId: undefined };
      } else {
        mod.nextNodeId = undefined;
      }

      updatedNodes = updatedNodes.map(n => n.id === mod.id ? mod : n);
    });

    onUpdateFlow({
      ...flow,
      nodes: updatedNodes
    });
  }, [flow, onUpdateFlow]);

  // Auto-arrange layout
  const handleAutoArrange = () => {
    const layout = computeAutoLayout(flow);
    const updated = flow.nodes.map(n => ({
      ...n,
      position: layout[n.id] || { x: 100, y: 100 }
    }));

    onUpdateFlow({
      ...flow,
      nodes: updated
    });

    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    }, 50);
  };

  return (
    <div className="w-full h-full min-h-[620px] relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
      
      {/* Top Floating Action Panel */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 max-w-[90%]">
        <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 flex items-center gap-1.5 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
            <Plus className="w-3 h-3 text-emerald-400" />
            <span>Add:</span>
          </span>

          <button
            onClick={() => onAddNode('button')}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 transition-all cursor-pointer"
            title="Add Quick Reply Step (Buttons)"
          >
            <Zap className="w-3 h-3" />
            <span className="hidden sm:inline">Quick Reply</span>
          </button>

          <button
            onClick={() => onAddNode('list')}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 flex items-center gap-1 transition-all cursor-pointer"
            title="Add Interactive List Menu Step"
          >
            <ListFilter className="w-3 h-3" />
            <span className="hidden sm:inline">List Menu</span>
          </button>

          <button
            onClick={() => onAddNode('flow_screen')}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 flex items-center gap-1 transition-all cursor-pointer"
            title="Add Native WhatsApp Form Screen"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Meta Form</span>
          </button>

          <button
            onClick={() => onAddNode('agent_handover')}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1 transition-all cursor-pointer"
            title="Add Live Agent Escalation Step"
          >
            <ShieldCheck className="w-3 h-3" />
            <span className="hidden sm:inline">Agent Handover</span>
          </button>
        </div>

        {/* Auto Arrange & Fit View Button */}
        <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 flex items-center gap-1 shadow-lg">
          <button
            onClick={handleAutoArrange}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Auto-organize graph layout"
          >
            <LayoutDashboard className="w-3 h-3 text-emerald-400" />
            <span>Auto-Arrange</span>
          </button>

          <button
            onClick={() => reactFlowInstance.fitView({ padding: 0.2, duration: 600 })}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Fit view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Helpful Drag Instruction Pill */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-emerald-400" />
        <span>Drag handles from buttons/options to target steps to connect interactive branches</span>
      </div>

      {/* React Flow Core Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onEdgesDelete={handleEdgesDelete}
        onNodeDragStop={handleNodeDragStop}
        onNodeClick={(_, node) => onSelectNode(node.id)}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: '#10b981', strokeWidth: 2 }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.8}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        className="react-flow-dark"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1.5} 
          color="#334155" 
        />
        <Controls 
          className="!bg-slate-900 !border !border-slate-800 !rounded-xl !shadow-xl !fill-slate-300 [&>button]:!bg-slate-900 [&>button]:!border-b-slate-800 [&>button:hover]:!bg-slate-800 [&>button]:!text-slate-300" 
        />
        <MiniMap 
          nodeColor={(n) => {
            const data = n.data as unknown as WhatsAppFlowNodeData;
            if (data?.isActive) return '#10b981';
            if (data?.isStart) return '#34d399';
            return '#475569';
          }}
          maskColor="rgba(15, 23, 42, 0.75)"
          className="!bg-slate-900 !border !border-slate-800 !rounded-xl overflow-hidden shadow-2xl !w-36 !h-28" 
        />
      </ReactFlow>

    </div>
  );
};

export const FlowCanvas: React.FC<FlowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
};
