import React, { useMemo, useCallback, useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
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
import { MessageTypesPalette, SUPPORTED_MESSAGE_TYPES } from './MessageTypesPalette';
import { useTheme } from '../../context/ThemeContext';
import { 
  Plus, 
  LayoutDashboard, 
  Maximize2,
  Minimize2,
  Info,
  Layers,
  X,
  Zap,
  Store,
  ShoppingCart,
  ShoppingBag,
  ListFilter,
  Download
} from 'lucide-react';
import { exportFlowAsPng } from '../../utils/xyflowExport';

const nodeTypes = {
  whatsappStep: WhatsAppFlowNode,
};

interface FlowCanvasProps {
  flow: WhatsAppFlow;
  activeNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onUpdateFlow: (flow: WhatsAppFlow) => void;
  onAddNode: (type: WhatsAppNodeType, position?: { x: number; y: number }) => void;
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
    if (node.catalogConfig?.nextNodeId) {
      targets.push(node.catalogConfig.nextNodeId);
    }
    if (node.singleProduct?.nextNodeId) {
      targets.push(node.singleProduct.nextNodeId);
    }
    if (node.templateConfig?.buttons) {
      node.templateConfig.buttons.forEach(tb => {
        if (tb.nextNodeId) targets.push(tb.nextNodeId);
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
        x: 120 + depth * 440,
        y: 200 + startY + idx * 380
      };

      const targets = childrenMap.get(nodeId) || [];
      targets.forEach(t => {
        if (!visited.has(t) && !nextLayer.includes(t)) {
          nextLayer.push(t);
        }
      });
    });

    depth++;
    currentLayer = nextLayer;
  }

  // Position any remaining unlinked / orphan nodes
  flow.nodes.forEach((node, idx) => {
    if (!positions[node.id]) {
      positions[node.id] = {
        x: 120 + depth * 440,
        y: 100 + idx * 360
      };
    }
  });

  return positions;
}

// Inner Canvas Component wrapped in ReactFlowProvider
const FlowCanvasInner: React.FC<FlowCanvasProps> = ({
  flow,
  activeNodeId,
  onSelectNode,
  onUpdateFlow,
  onAddNode,
  onDeleteNode
}) => {
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isDark } = useTheme();

  // Fullscreen Toggle Handler
  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      try {
        if (reactFlowWrapper.current && reactFlowWrapper.current.requestFullscreen) {
          reactFlowWrapper.current.requestFullscreen().catch(() => {});
        }
      } catch {}
      setIsFullscreen(true);
    } else {
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {}
      setIsFullscreen(false);
    }
    setTimeout(() => reactFlowInstance.fitView({ padding: 0.25, duration: 400 }), 180);
  };

  // Convert WhatsAppFlow nodes into ReactFlow Nodes
  const initialNodes: Node<WhatsAppFlowNodeData>[] = useMemo(() => {
    return flow.nodes.map((node, index) => {
      const pos = node.position || {
        x: 100 + index * 420,
        y: 120 + (index % 2) * 80
      };

      return {
        id: node.id,
        type: 'whatsappStep',
        position: pos,
        dragHandle: '.drag-handle',
        data: {
          node,
          isActive: node.id === activeNodeId,
          isStart: node.id === flow.startNodeId,
          onSelectNode,
          onDeleteNode
        } as unknown as WhatsAppFlowNodeData,
      };
    });
  }, [flow, activeNodeId, onSelectNode, onDeleteNode]);

  // Convert WhatsAppFlow connections into ReactFlow Edges
  const initialEdges = useMemo(() => {
    const edges: Edge[] = [];

    flow.nodes.forEach(node => {
      const isNodeActive = node.id === activeNodeId;

      // 1. Text Buttons / Media Buttons / Buttons
      if ((node.type === 'text_buttons' || node.type === 'button' || node.type === 'media_buttons') && node.buttons) {
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

      // 3. Catalogue Action Edge
      if (node.type === 'catalogue' && (node.catalogConfig?.nextNodeId || node.nextNodeId)) {
        const targetId = node.catalogConfig?.nextNodeId || node.nextNodeId;
        if (targetId && flow.nodes.some(n => n.id === targetId)) {
          edges.push({
            id: `edge-${node.id}-cat-${targetId}`,
            source: node.id,
            sourceHandle: 'cat-action',
            target: targetId,
            label: node.catalogConfig?.actionButtonText || 'View Catalog',
            animated: isNodeActive,
            type: ConnectionLineType.SmoothStep,
            style: {
              stroke: isNodeActive ? '#818cf8' : '#4f46e5',
              strokeWidth: 2,
            },
            labelStyle: {
              fill: '#c7d2fe',
              fontWeight: 700,
              fontSize: 11,
            },
            labelBgStyle: {
              fill: '#312e81',
              fillOpacity: 0.9,
              rx: 6,
              ry: 6,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isNodeActive ? '#818cf8' : '#4f46e5',
              width: 16,
              height: 16,
            }
          });
        }
      }

      // 4. Single Product SKU Action Edge
      if (node.type === 'single_product' && (node.singleProduct?.nextNodeId || node.nextNodeId)) {
        const targetId = node.singleProduct?.nextNodeId || node.nextNodeId;
        if (targetId && flow.nodes.some(n => n.id === targetId)) {
          edges.push({
            id: `edge-${node.id}-prod-${targetId}`,
            source: node.id,
            sourceHandle: 'prod-view',
            target: targetId,
            label: 'On Inquire',
            animated: isNodeActive,
            type: ConnectionLineType.SmoothStep,
            style: {
              stroke: isNodeActive ? '#34d399' : '#059669',
              strokeWidth: 2,
            },
            labelStyle: {
              fill: '#a7f3d0',
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
              color: isNodeActive ? '#34d399' : '#059669',
              width: 16,
              height: 16,
            }
          });
        }
      }

      // 5. Multi Product Showcase Action Edge
      if (node.type === 'multi_product' && node.nextNodeId) {
        if (flow.nodes.some(n => n.id === node.nextNodeId)) {
          edges.push({
            id: `edge-${node.id}-mprod-${node.nextNodeId}`,
            source: node.id,
            sourceHandle: 'multi-prod',
            target: node.nextNodeId,
            label: 'View Catalog Items',
            animated: isNodeActive,
            type: ConnectionLineType.SmoothStep,
            style: {
              stroke: isNodeActive ? '#22d3ee' : '#0891b2',
              strokeWidth: 2,
            },
            labelStyle: {
              fill: '#a5f3fc',
              fontWeight: 700,
              fontSize: 11,
            },
            labelBgStyle: {
              fill: '#164e63',
              fillOpacity: 0.9,
              rx: 6,
              ry: 6,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isNodeActive ? '#22d3ee' : '#0891b2',
              width: 16,
              height: 16,
            }
          });
        }
      }

      // 6. Meta Approved Template Buttons
      if (node.type === 'template' && node.templateConfig?.buttons) {
        node.templateConfig.buttons.forEach((tb) => {
          if (tb.nextNodeId && flow.nodes.some(n => n.id === tb.nextNodeId)) {
            edges.push({
              id: `edge-${node.id}-tbtn-${tb.id}-${tb.nextNodeId}`,
              source: node.id,
              sourceHandle: `tbtn-${tb.id}`,
              target: tb.nextNodeId,
              label: tb.text,
              animated: isNodeActive,
              type: ConnectionLineType.SmoothStep,
              style: {
                stroke: isNodeActive ? '#f59e0b' : '#d97706',
                strokeWidth: 2,
              },
              labelStyle: {
                fill: '#fde68a',
                fontWeight: 700,
                fontSize: 11,
              },
              labelBgStyle: {
                fill: '#78350f',
                fillOpacity: 0.9,
                rx: 6,
                ry: 6,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: isNodeActive ? '#f59e0b' : '#d97706',
                width: 16,
                height: 16,
              }
            });
          }
        });
      }

      // 7. WhatsApp Native Form Screen
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

      // 8. Default / Direct Next Step
      if (
        node.type !== 'text_buttons' && 
        node.type !== 'button' && 
        node.type !== 'media_buttons' && 
        node.type !== 'list' && 
        node.type !== 'catalogue' &&
        node.type !== 'single_product' &&
        node.type !== 'multi_product' &&
        node.type !== 'template' &&
        node.type !== 'flow_screen' && 
        node.nextNodeId
      ) {
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

  // Handle Dragging Node around Canvas - persist coordinates
  const handleNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
    const updatedNodes = flow.nodes.map(n => {
      if (n.id === node.id) {
        return {
          ...n,
          position: {
            x: Math.round(node.position.x),
            y: Math.round(node.position.y)
          }
        };
      }
      return n;
    });

    onUpdateFlow({
      ...flow,
      nodes: updatedNodes
    });
  }, [flow, onUpdateFlow]);

  // Handle Connecting an edge between steps (drag handles to steps)
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
    // If source handle is a template button handle (e.g. "tbtn-xxx")
    else if (handleId.startsWith('tbtn-') && updatedSource.templateConfig?.buttons) {
      const tbtnId = handleId.replace('tbtn-', '');
      updatedSource.templateConfig = {
        ...updatedSource.templateConfig,
        buttons: updatedSource.templateConfig.buttons.map(tb =>
          tb.id === tbtnId ? { ...tb, nextNodeId: connection.target } : tb
        )
      };
    }
    // If source handle is catalog action
    else if (handleId === 'cat-action' && updatedSource.catalogConfig) {
      updatedSource.catalogConfig = {
        ...updatedSource.catalogConfig,
        nextNodeId: connection.target
      };
      updatedSource.nextNodeId = connection.target;
    }
    // If source handle is single product inquiry
    else if (handleId === 'prod-view' && updatedSource.singleProduct) {
      updatedSource.singleProduct = {
        ...updatedSource.singleProduct,
        nextNodeId: connection.target
      };
      updatedSource.nextNodeId = connection.target;
    }
    // If source handle is multi-product showcase
    else if (handleId === 'multi-prod') {
      updatedSource.nextNodeId = connection.target;
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
      } else if (handleId.startsWith('tbtn-') && mod.templateConfig?.buttons) {
        const tbtnId = handleId.replace('tbtn-', '');
        mod.templateConfig = {
          ...mod.templateConfig,
          buttons: mod.templateConfig.buttons.map(tb => tb.id === tbtnId ? { ...tb, nextNodeId: undefined } : tb)
        };
      } else if (handleId === 'cat-action' && mod.catalogConfig) {
        mod.catalogConfig = { ...mod.catalogConfig, nextNodeId: undefined };
        mod.nextNodeId = undefined;
      } else if (handleId === 'prod-view' && mod.singleProduct) {
        mod.singleProduct = { ...mod.singleProduct, nextNodeId: undefined };
        mod.nextNodeId = undefined;
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

  // Native HTML5 Drag and Drop into React Flow canvas
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow-type') as WhatsAppNodeType;
      if (!type) return;

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onAddNode(type, position);
    },
    [reactFlowInstance, onAddNode]
  );

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

  // Download WhatsApp Flow as PNG image
  const handleDownloadFlowImage = async () => {
    if (!reactFlowWrapper.current) return;
    try {
      await exportFlowAsPng(reactFlowWrapper.current, {
        fileName: `${flow.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-flow.png`,
        scope: 'full',
        theme: isDark ? 'dark' : 'light',
        pixelRatio: 2,
        nodes: initialNodes
      });
    } catch (err) {
      console.error('Failed to download flow image:', err);
    }
  };

  return (
    <div 
      ref={reactFlowWrapper}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`w-full h-full min-h-[620px] relative bg-slate-100 dark:bg-slate-950 overflow-hidden shadow-inner transition-all duration-200 ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen rounded-none p-3'
          : 'rounded-2xl border border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Top Floating Action Panel */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 max-w-[90%]">
        
        {/* Primary Message Types Drawer Toggle */}
        <button
          onClick={() => setPaletteOpen(!paletteOpen)}
          className={`px-3 py-1.5 text-xs font-black rounded-xl border flex items-center gap-1.5 shadow-lg transition-all cursor-pointer ${
            paletteOpen 
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-950/50' 
              : 'bg-white/90 dark:bg-slate-900/90 text-emerald-700 dark:text-emerald-400 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
          title="Open WhatsApp Message Types Palette"
        >
          <Layers className="w-4 h-4" />
          <span>Message Types ({SUPPORTED_MESSAGE_TYPES.length})</span>
        </button>

        {/* Quick Add Buttons for Top Types */}
        <div className="hidden sm:flex bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 items-center gap-1 shadow-lg">
          <button
            onClick={() => onAddNode('text_buttons')}
            className="px-2 py-1 text-xs font-bold rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 flex items-center gap-1 transition-all cursor-pointer"
            title="Add Quick Reply Step (Text Buttons)"
          >
            <Zap className="w-3 h-3" />
            <span>Text Buttons</span>
          </button>

          <button
            onClick={() => onAddNode('list')}
            className="px-2 py-1 text-xs font-bold rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-500/40 flex items-center gap-1 transition-all cursor-pointer"
            title="Add Interactive List Menu"
          >
            <ListFilter className="w-3 h-3" />
            <span>List</span>
          </button>

          <button
            onClick={() => onAddNode('catalogue')}
            className="px-2 py-1 text-xs font-bold rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-500/40 flex items-center gap-1 transition-all cursor-pointer"
            title="Add Catalogue Message"
          >
            <Store className="w-3 h-3" />
            <span>Catalogue</span>
          </button>

          <button
            onClick={() => onAddNode('single_product')}
            className="px-2 py-1 text-xs font-bold rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 flex items-center gap-1 transition-all cursor-pointer"
            title="Add Single Product Showcase"
          >
            <ShoppingCart className="w-3 h-3" />
            <span>Product</span>
          </button>
        </div>

        {/* Auto Arrange, Fit View, Fullscreen & Download */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-1 shadow-lg">
          <button
            onClick={handleAutoArrange}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Auto-organize graph layout"
          >
            <LayoutDashboard className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Auto-Arrange</span>
          </button>

          <button
            onClick={() => reactFlowInstance.fitView({ padding: 0.2, duration: 600 })}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Fit view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
          </button>

          <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-700" />

          {/* Download Flow Button */}
          <button
            onClick={handleDownloadFlowImage}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Download WhatsApp Flow Canvas as PNG"
          >
            <Download className="w-3 h-3" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Floating Message Types Palette Overlay Panel */}
      {paletteOpen && (
        <div className="absolute top-14 left-3 z-30 w-80 max-h-[80vh] overflow-y-auto shadow-2xl rounded-2xl animate-fadeIn">
          <div className="relative">
            <button
              onClick={() => setPaletteOpen(false)}
              className="absolute top-3 right-3 z-40 p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              title="Close Palette"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <MessageTypesPalette 
              onSelectType={(type) => {
                onAddNode(type);
                setPaletteOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Helpful Drag Instruction Pill */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none hidden sm:flex items-center gap-2 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 shadow-sm">
        <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Drag any message type to canvas, or link handles from buttons/products to target steps</span>
      </div>

      {/* React Flow Core Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        onConnect={handleConnect}
        onEdgesDelete={handleEdgesDelete}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: '#10b981', strokeWidth: 2 }}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={1.8}
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          color={isDark ? "#334155" : "#cbd5e1"} 
          gap={24} 
          size={1.5} 
          variant={BackgroundVariant.Dots} 
        />
        <Controls 
          className="!bg-white/95 dark:!bg-slate-900/90 !border !border-slate-200 dark:!border-slate-700 !rounded-xl !shadow-xl !overflow-hidden text-slate-700 dark:text-slate-200" 
          showInteractive={false}
        />
        <MiniMap 
          nodeColor={(n) => {
            const data = n.data as unknown as WhatsAppFlowNodeData;
            if (data?.isActive) return '#10b981';
            if (data?.node?.type === 'text_buttons' || data?.node?.type === 'button') return '#059669';
            if (data?.node?.type === 'media_buttons') return '#14b8a6';
            if (data?.node?.type === 'list') return '#2563eb';
            if (data?.node?.type === 'catalogue') return '#4f46e5';
            if (data?.node?.type === 'single_product') return '#10b981';
            if (data?.node?.type === 'multi_product') return '#06b6d4';
            if (data?.node?.type === 'template') return '#f59e0b';
            if (data?.node?.type === 'flow_screen') return '#7c3aed';
            return '#475569';
          }}
          className="!bg-white dark:!bg-slate-950 !border !border-slate-200 dark:!border-slate-800 !rounded-xl hidden md:block" 
          maskColor={isDark ? "rgba(15, 23, 42, 0.75)" : "rgba(241, 245, 249, 0.75)"}
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
