import React, { useState } from 'react';
import { WhatsAppNodeType } from '../../types';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  LayoutList, 
  Store, 
  ShoppingCart, 
  ShoppingBag, 
  Zap, 
  MousePointerClick,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface MessageTypeDefinition {
  type: WhatsAppNodeType;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  tag?: string;
  metaType: string;
}

export const SUPPORTED_MESSAGE_TYPES: MessageTypeDefinition[] = [
  {
    type: 'text_buttons',
    label: 'Text Buttons',
    description: 'Text message with up to 3 quick-reply or link buttons',
    icon: (props) => (
      <div className="relative inline-flex items-center justify-center">
        <MessageSquare {...props} />
        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-600 rounded-full border border-white"></span>
      </div>
    ),
    metaType: 'interactive/button'
  },
  {
    type: 'media_buttons',
    label: 'Media Buttons',
    description: 'Image, video or document header with interactive buttons',
    icon: (props) => (
      <div className="relative inline-flex items-center justify-center">
        <ImageIcon {...props} />
        <MousePointerClick className="w-2.5 h-2.5 absolute -bottom-1 -right-1 text-emerald-700" />
      </div>
    ),
    metaType: 'interactive/media_button'
  },
  {
    type: 'list',
    label: 'List',
    description: 'Interactive menu with organized sections and up to 10 options',
    icon: (props) => <LayoutList {...props} />,
    metaType: 'interactive/list'
  },
  {
    type: 'catalogue',
    label: 'Catalogue Message',
    description: 'Connect Meta commerce catalog with a View Catalog button',
    icon: (props) => <Store {...props} />,
    metaType: 'interactive/catalog_message'
  },
  {
    type: 'single_product',
    label: 'Single Product',
    description: 'Showcase one specific product SKU with price, photo & buy action',
    icon: (props) => (
      <div className="relative inline-flex items-center justify-center">
        <ShoppingCart {...props} />
        <span className="absolute -top-1 -right-1 text-[8px] font-black bg-emerald-600 text-white rounded-full w-3 h-3 flex items-center justify-center">1</span>
      </div>
    ),
    metaType: 'interactive/product'
  },
  {
    type: 'multi_product',
    label: 'Multi Product',
    description: 'Multi-item catalog showcase with sectioned products & cart',
    icon: (props) => (
      <div className="relative inline-flex items-center justify-center">
        <ShoppingBag {...props} />
        <span className="absolute -top-1 -right-1 text-[8px] font-black bg-emerald-600 text-white rounded-full w-3 h-3 flex items-center justify-center">+</span>
      </div>
    ),
    metaType: 'interactive/product_list'
  },
  {
    type: 'template',
    label: 'Template',
    description: 'Pre-approved Meta WhatsApp Template with variables & CTAs',
    icon: (props) => <Zap {...props} />,
    tag: 'Meta Verified',
    metaType: 'template'
  }
];

interface MessageTypesPaletteProps {
  onSelectType: (type: WhatsAppNodeType) => void;
  className?: string;
  isFloating?: boolean;
}

export const MessageTypesPalette: React.FC<MessageTypesPaletteProps> = ({
  onSelectType,
  className = '',
  isFloating = false
}) => {
  const [hoveredType, setHoveredType] = useState<WhatsAppNodeType | null>('media_buttons');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDragStart = (e: React.DragEvent, type: WhatsAppNodeType) => {
    e.dataTransfer.setData('application/reactflow-type', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-md p-3.5 select-none font-sans transition-colors ${className}`}
      id="whatsapp-message-types-palette"
    >
      {/* Palette Header matching screenshot */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight">
            Message types
          </h3>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {SUPPORTED_MESSAGE_TYPES.length}
          </span>
        </div>

        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium hidden sm:inline">
          Tap or drag to canvas
        </span>
      </div>

      {/* Grid of Message Types - Exactly matching screenshot 2-column layout */}
      <div className="grid grid-cols-2 gap-2.5">
        {SUPPORTED_MESSAGE_TYPES.map((item) => {
          const Icon = item.icon;
          const isHovered = hoveredType === item.type;

          return (
            <div
              key={item.type}
              id={`palette-item-${item.type}`}
              draggable
              onDragStart={(e) => handleDragStart(e, item.type)}
              onClick={() => onSelectType(item.type)}
              onMouseEnter={() => setHoveredType(item.type)}
              onMouseLeave={() => setHoveredType(null)}
              className="group relative flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-800/80 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/40 transition-all cursor-grab active:cursor-grabbing hover:shadow-sm"
              title={item.description}
            >
              {/* Tooltip matching screenshot "Drag to add or tap" on hover */}
              {isHovered && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-950 text-white text-[10px] font-medium px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap z-30 pointer-events-none animate-fadeIn border border-slate-700 dark:border-slate-800">
                  Drag to add or tap
                </div>
              )}

              {/* Icon in distinctive WhatsApp green / teal */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                <Icon className="w-5 h-5 text-[#00A884]" />
              </div>

              {/* Label */}
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white text-center mt-1 leading-tight tracking-tight">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Optional Advanced Step Types: Flow Screen & Agent Handover */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors py-1 cursor-pointer"
        >
          <span>More Interactive Actions</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-2 gap-2 mt-2 pt-1 animate-fadeIn">
            <button
              type="button"
              onClick={() => onSelectType('flow_screen')}
              draggable
              onDragStart={(e) => handleDragStart(e, 'flow_screen')}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/30 hover:bg-purple-50 dark:hover:bg-purple-900/40 text-center transition-all cursor-grab"
            >
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-0.5" />
              <span className="text-[10px] font-bold text-purple-900 dark:text-purple-200">Meta Form</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectType('agent_handover')}
              draggable
              onDragStart={(e) => handleDragStart(e, 'agent_handover')}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/30 hover:bg-rose-50 dark:hover:bg-rose-900/40 text-center transition-all cursor-grab"
            >
              <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400 mb-0.5" />
              <span className="text-[10px] font-bold text-rose-900 dark:text-rose-200">Agent Handover</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
