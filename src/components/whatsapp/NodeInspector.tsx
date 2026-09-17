import React from 'react';
import { 
  WhatsAppNode, 
  WhatsAppNodeType, 
  WhatsAppButton, 
  WhatsAppListItem, 
  WhatsAppFormField 
} from '../../types';
import { 
  Trash2, 
  Plus, 
  Sparkles, 
  Layers, 
  FileText, 
  Phone, 
  ExternalLink, 
  HelpCircle,
  Hash,
  ChevronRight,
  Info
} from 'lucide-react';

interface NodeInspectorProps {
  node: WhatsAppNode | null;
  allNodes: WhatsAppNode[];
  onUpdateNode: (updated: WhatsAppNode) => void;
  onDeleteNode: (nodeId: string) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  allNodes,
  onUpdateNode,
  onDeleteNode
}) => {
  if (!node) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
        <Layers className="w-12 h-12 text-slate-300 mb-3" />
        <h4 className="font-bold text-slate-700 text-sm">No Node Selected</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Select any node from the visual flow canvas on the left to edit its interactive buttons, text, or Meta Flow screens.
        </p>
      </div>
    );
  }

  // Quick variable inserter
  const insertVariable = (varName: string) => {
    const placeholder = `{{${varName}}}`;
    onUpdateNode({
      ...node,
      bodyText: `${node.bodyText} ${placeholder}`
    });
  };

  // Button handlers
  const handleAddButton = () => {
    if ((node.buttons?.length || 0) >= 3) return;
    const newBtn: WhatsAppButton = {
      id: `btn-${Date.now()}`,
      title: `Button ${(node.buttons?.length || 0) + 1}`,
      nextNodeId: allNodes.find(n => n.id !== node.id)?.id || ''
    };
    onUpdateNode({
      ...node,
      buttons: [...(node.buttons || []), newBtn]
    });
  };

  const handleUpdateButton = (index: number, updated: Partial<WhatsAppButton>) => {
    const updatedButtons = [...(node.buttons || [])];
    updatedButtons[index] = { ...updatedButtons[index], ...updated };
    onUpdateNode({
      ...node,
      buttons: updatedButtons
    });
  };

  const handleDeleteButton = (index: number) => {
    const updatedButtons = [...(node.buttons || [])];
    updatedButtons.splice(index, 1);
    onUpdateNode({
      ...node,
      buttons: updatedButtons
    });
  };

  // List Row handlers
  const handleAddListRow = (sIndex: number) => {
    const sections = [...(node.listSections || [])];
    if (!sections[sIndex]) return;

    const newRow: WhatsAppListItem = {
      id: `row-${Date.now()}`,
      title: 'New Service Item',
      description: 'Short description for user',
      nextNodeId: allNodes.find(n => n.id !== node.id)?.id || ''
    };

    sections[sIndex].rows.push(newRow);
    onUpdateNode({
      ...node,
      listSections: sections
    });
  };

  const handleUpdateListRow = (sIndex: number, rIndex: number, updated: Partial<WhatsAppListItem>) => {
    const sections = [...(node.listSections || [])];
    if (!sections[sIndex] || !sections[sIndex].rows[rIndex]) return;
    sections[sIndex].rows[rIndex] = { ...sections[sIndex].rows[rIndex], ...updated };
    onUpdateNode({
      ...node,
      listSections: sections
    });
  };

  const handleDeleteListRow = (sIndex: number, rIndex: number) => {
    const sections = [...(node.listSections || [])];
    if (!sections[sIndex]) return;
    sections[sIndex].rows.splice(rIndex, 1);
    onUpdateNode({
      ...node,
      listSections: sections
    });
  };

  // Form Field handlers (Native WhatsApp Flow)
  const handleAddFormField = () => {
    if (!node.flowScreen) return;
    const newField: WhatsAppFormField = {
      id: `fld-${Date.now()}`,
      label: 'New Field Label',
      type: 'text',
      required: true,
      placeholder: 'Enter details...'
    };
    onUpdateNode({
      ...node,
      flowScreen: {
        ...node.flowScreen,
        fields: [...node.flowScreen.fields, newField]
      }
    });
  };

  const handleUpdateFormField = (fIndex: number, updated: Partial<WhatsAppFormField>) => {
    if (!node.flowScreen) return;
    const fields = [...node.flowScreen.fields];
    fields[fIndex] = { ...fields[fIndex], ...updated };
    onUpdateNode({
      ...node,
      flowScreen: {
        ...node.flowScreen,
        fields
      }
    });
  };

  const handleDeleteFormField = (fIndex: number) => {
    if (!node.flowScreen) return;
    const fields = [...node.flowScreen.fields];
    fields.splice(fIndex, 1);
    onUpdateNode({
      ...node,
      flowScreen: {
        ...node.flowScreen,
        fields
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 overflow-y-auto max-h-[85vh] space-y-5">
      
      {/* Node Header Info */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Node Inspector
          </span>
          <h3 className="text-base font-black text-slate-900 mt-1">
            {node.title}
          </h3>
        </div>

        <button
          onClick={() => onDeleteNode(node.id)}
          title="Delete Node"
          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Node Title & Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Step Title
          </label>
          <input
            type="text"
            value={node.title}
            onChange={(e) => onUpdateNode({ ...node, title: e.target.value })}
            className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Interactive Message Type
          </label>
          <select
            value={node.type}
            onChange={(e) => {
              const newType = e.target.value as WhatsAppNodeType;
              let updated: WhatsAppNode = { ...node, type: newType };
              if (newType === 'button' && (!node.buttons || node.buttons.length === 0)) {
                updated.buttons = [{ id: 'btn-1', title: 'Yes, Proceed', nextNodeId: '' }];
              } else if (newType === 'list' && (!node.listSections || node.listSections.length === 0)) {
                updated.listButtonText = 'Select Option';
                updated.listSections = [
                  {
                    title: 'Category 1',
                    rows: [{ id: 'row-1', title: 'Option 1', description: 'Details here', nextNodeId: '' }]
                  }
                ];
              } else if (newType === 'flow_screen' && !node.flowScreen) {
                updated.flowScreen = {
                  title: 'Project Intake Form',
                  subtitle: 'Fill details inside WhatsApp',
                  submitButtonTitle: 'Submit to Desk',
                  fields: [{ id: 'f-1', label: 'Hospital Name', type: 'text', required: true }]
                };
              }
              onUpdateNode(updated);
            }}
            className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none bg-white font-medium text-slate-800"
          >
            <option value="button">Quick Reply (Up to 3 Buttons)</option>
            <option value="list">Interactive List Menu (Sections & Items)</option>
            <option value="flow_screen">WhatsApp Flow (Native Form Screen)</option>
            <option value="media_cta">Media Message + Call / URL Button</option>
            <option value="input_capture">User Input Capture (Text/Number)</option>
            <option value="agent_handover">Live Agent Handover</option>
          </select>
        </div>
      </div>

      {/* Header Media Settings */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800">
            Header Attachment (Optional)
          </label>
          <span className="text-[10px] text-slate-500">Meta Cloud API Header</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {(['none', 'text', 'image', 'document', 'video'] as const).map((hType) => (
            <button
              key={hType}
              type="button"
              onClick={() => onUpdateNode({ ...node, headerType: hType })}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border capitalize cursor-pointer transition-all ${
                node.headerType === hType
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {hType}
            </button>
          ))}
        </div>

        {node.headerType !== 'none' && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {node.headerType === 'text' && 'Header Text Title (Max 60 chars)'}
              {node.headerType === 'image' && 'Image URL (Hospital / Equipment)'}
              {node.headerType === 'document' && 'Document Filename / PDF URL'}
              {node.headerType === 'video' && 'Video MP4 URL'}
            </label>
            <input
              type="text"
              value={node.headerContent || ''}
              onChange={(e) => onUpdateNode({ ...node, headerContent: e.target.value })}
              placeholder={
                node.headerType === 'text' ? 'e.g. NOVA HEALTHCARE ADVISORY' :
                node.headerType === 'image' ? 'https://images.unsplash.com/...' :
                'Hospital-Project-Toolkit.pdf'
              }
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* Body Message Text & Variables */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800">
            Message Body Text <span className="text-rose-600">*</span>
          </label>
          <span className="text-[10px] text-slate-400">
            {node.bodyText.length} / 1024 chars
          </span>
        </div>

        <textarea
          rows={5}
          value={node.bodyText}
          onChange={(e) => onUpdateNode({ ...node, bodyText: e.target.value })}
          placeholder="Write your interactive message text here. Use *bold* for bold and _italic_ for italics..."
          className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none font-sans leading-relaxed"
        />

        {/* Dynamic Variable Pills (AiSensy Style) */}
        <div className="pt-1">
          <span className="text-[10px] font-bold text-slate-500 block mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Click to Insert Dynamic Variable Tag:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'User Name', val: 'user_name' },
              { label: 'Hospital Name', val: 'hospital_name' },
              { label: 'City', val: 'city' },
              { label: 'Bed Count', val: 'bed_count' },
              { label: 'Ref ID', val: 'ref_id' }
            ].map((tag) => (
              <button
                key={tag.val}
                type="button"
                onClick={() => insertVariable(tag.val)}
                className="py-1 px-2 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
              >
                <span>+</span>
                <span>{`{{${tag.val}}}`}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Footer Text (Optional)
        </label>
        <input
          type="text"
          value={node.footerText || ''}
          onChange={(e) => onUpdateNode({ ...node, footerText: e.target.value })}
          placeholder="e.g. Official NOVA Healthcare Advisory &bull; Reply STOP to unsubscribe"
          className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none"
        />
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE CONTROLS CONFIGURATION BY TYPE                                 */}
      {/* ========================================================================= */}

      {/* 1. QUICK REPLY BUTTONS */}
      {node.type === 'button' && (
        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-emerald-900">
                Interactive Quick Reply Buttons ({node.buttons?.length || 0} / 3)
              </h4>
              <p className="text-[10px] text-emerald-700">Meta allows up to 3 interactive reply buttons per message.</p>
            </div>
            {(node.buttons?.length || 0) < 3 && (
              <button
                type="button"
                onClick={handleAddButton}
                className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Button</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {node.buttons?.map((btn, idx) => (
              <div key={btn.id} className="p-2.5 bg-white rounded-xl border border-emerald-200 shadow-2xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                
                <input
                  type="text"
                  value={btn.title}
                  maxLength={20}
                  onChange={(e) => handleUpdateButton(idx, { title: e.target.value })}
                  placeholder="Button Title (max 20 chars)"
                  className="flex-1 text-xs p-1.5 border border-slate-300 rounded-lg outline-none font-bold text-slate-800"
                />

                {/* Target Next Node */}
                <div className="flex items-center gap-1 shrink-0">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={btn.nextNodeId || ''}
                    onChange={(e) => handleUpdateButton(idx, { nextNodeId: e.target.value })}
                    className="text-xs p-1.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-medium max-w-[150px]"
                  >
                    <option value="">Next Step...</option>
                    {allNodes.map((n) => (
                      <option key={n.id} value={n.id}>{n.title}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteButton(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. INTERACTIVE LIST MESSAGE */}
      {node.type === 'list' && (
        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-blue-900">
                Interactive List Menu
              </h4>
              <p className="text-[10px] text-blue-700">Tap below to configure menu header & row items.</p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-900 mb-1">
              Menu Trigger Button Label (Max 20 chars)
            </label>
            <input
              type="text"
              value={node.listButtonText || ''}
              maxLength={20}
              onChange={(e) => onUpdateNode({ ...node, listButtonText: e.target.value })}
              placeholder="e.g. Select Hospital Category"
              className="w-full text-xs p-2 rounded-lg border border-blue-200 bg-white font-bold text-blue-900"
            />
          </div>

          {/* List Sections */}
          <div className="space-y-3">
            {node.listSections?.map((sec, sIdx) => (
              <div key={sIdx} className="p-3 bg-white rounded-xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => {
                      const sections = [...(node.listSections || [])];
                      sections[sIdx].title = e.target.value;
                      onUpdateNode({ ...node, listSections: sections });
                    }}
                    placeholder="Section Title (e.g. Tertiary Care)"
                    className="text-xs font-bold text-slate-800 p-1 border-b border-transparent focus:border-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddListRow(sIdx)}
                    className="text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-0.5 rounded cursor-pointer"
                  >
                    + Add Item
                  </button>
                </div>

                {/* Rows */}
                <div className="space-y-1.5 pl-2 border-l-2 border-blue-200">
                  {sec.rows.map((row, rIdx) => (
                    <div key={row.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={row.title}
                          maxLength={24}
                          onChange={(e) => handleUpdateListRow(sIdx, rIdx, { title: e.target.value })}
                          placeholder="Row Item Title (max 24 chars)"
                          className="flex-1 text-xs font-bold text-slate-800 p-1 border border-slate-300 rounded bg-white"
                        />
                        <select
                          value={row.nextNodeId || ''}
                          onChange={(e) => handleUpdateListRow(sIdx, rIdx, { nextNodeId: e.target.value })}
                          className="text-xs p-1 border border-slate-300 rounded bg-white max-w-[140px]"
                        >
                          <option value="">Route Step...</option>
                          {allNodes.map((n) => (
                            <option key={n.id} value={n.id}>{n.title}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleDeleteListRow(sIdx, rIdx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={row.description || ''}
                        maxLength={72}
                        onChange={(e) => handleUpdateListRow(sIdx, rIdx, { description: e.target.value })}
                        placeholder="Description (max 72 chars)"
                        className="w-full text-[11px] text-slate-600 p-1 border border-slate-200 rounded bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. WHATSAPP FLOW NATIVE SCREEN */}
      {node.type === 'flow_screen' && node.flowScreen && (
        <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-purple-900">
                Meta WhatsApp Flow Form Screen
              </h4>
              <p className="text-[10px] text-purple-700">Users fill these fields directly inside WhatsApp.</p>
            </div>
            <button
              type="button"
              onClick={handleAddFormField}
              className="py-1 px-2.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Field</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-purple-900 mb-0.5">Screen Title</label>
              <input
                type="text"
                value={node.flowScreen.title}
                onChange={(e) => onUpdateNode({
                  ...node,
                  flowScreen: { ...node.flowScreen!, title: e.target.value }
                })}
                className="w-full text-xs p-1.5 border border-purple-200 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-purple-900 mb-0.5">Submit Button Title</label>
              <input
                type="text"
                value={node.flowScreen.submitButtonTitle}
                onChange={(e) => onUpdateNode({
                  ...node,
                  flowScreen: { ...node.flowScreen!, submitButtonTitle: e.target.value }
                })}
                className="w-full text-xs p-1.5 border border-purple-200 rounded-lg bg-white"
              />
            </div>
          </div>

          {/* Form Fields List */}
          <div className="space-y-2 pt-1">
            <label className="block text-[11px] font-bold text-purple-900">Form Inputs & Questions:</label>
            {node.flowScreen.fields.map((field, fIdx) => (
              <div key={field.id} className="p-2.5 bg-white rounded-xl border border-purple-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => handleUpdateFormField(fIdx, { label: e.target.value })}
                    placeholder="Field Question / Label"
                    className="flex-1 text-xs font-bold text-slate-800 p-1 border border-slate-300 rounded"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => handleUpdateFormField(fIdx, { type: e.target.value as any })}
                    className="text-xs p-1 border border-slate-300 rounded bg-slate-50"
                  >
                    <option value="text">Text Input</option>
                    <option value="number">Number</option>
                    <option value="select">Dropdown</option>
                  </select>
                  <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => handleUpdateFormField(fIdx, { required: e.target.checked })}
                    />
                    Req
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteFormField(fIdx)}
                    className="text-slate-400 hover:text-rose-600 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {field.type === 'select' && (
                  <div>
                    <input
                      type="text"
                      value={field.options?.join(', ') || ''}
                      onChange={(e) => handleUpdateFormField(fIdx, { options: e.target.value.split(',').map(s => s.trim()) })}
                      placeholder="Comma separated options (e.g. 50 Beds, 100 Beds, 200+ Beds)"
                      className="w-full text-[11px] text-slate-600 p-1 border border-slate-200 rounded"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-purple-900 mb-1">
              Destination Step After Submission:
            </label>
            <select
              value={node.flowScreen.nextNodeId || ''}
              onChange={(e) => onUpdateNode({
                ...node,
                flowScreen: { ...node.flowScreen!, nextNodeId: e.target.value }
              })}
              className="w-full text-xs p-2 rounded-lg border border-purple-300 bg-white font-semibold text-slate-800"
            >
              <option value="">Select Confirmation Step...</option>
              {allNodes.map((n) => (
                <option key={n.id} value={n.id}>{n.title}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 4. MEDIA CTA BUTTON */}
      {node.type === 'media_cta' && (
        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
          <h4 className="text-xs font-black text-amber-900">
            Call to Action (CTA) Button
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-amber-900 mb-0.5">CTA Action</label>
              <select
                value={node.ctaType || 'url'}
                onChange={(e) => onUpdateNode({ ...node, ctaType: e.target.value as any })}
                className="w-full text-xs p-1.5 border border-amber-300 rounded-lg bg-white"
              >
                <option value="url">Open Website URL</option>
                <option value="call">Call Phone Number</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-amber-900 mb-0.5">Button Label</label>
              <input
                type="text"
                value={node.ctaLabel || ''}
                onChange={(e) => onUpdateNode({ ...node, ctaLabel: e.target.value })}
                placeholder="e.g. Call Project Desk"
                className="w-full text-xs p-1.5 border border-amber-300 rounded-lg bg-white font-bold text-slate-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-amber-900 mb-0.5">
              {node.ctaType === 'call' ? 'Phone Number (+91...)' : 'Web URL (https://...)'}
            </label>
            <input
              type="text"
              value={node.ctaValue || ''}
              onChange={(e) => onUpdateNode({ ...node, ctaValue: e.target.value })}
              placeholder={node.ctaType === 'call' ? '+91 22 4982 1000' : 'https://nova-h.in'}
              className="w-full text-xs p-2 border border-amber-300 rounded-lg bg-white"
            />
          </div>
        </div>
      )}

      {/* 5. USER INPUT CAPTURE */}
      {node.type === 'input_capture' && (
        <div className="p-4 bg-slate-100 rounded-2xl border border-slate-300 space-y-3">
          <h4 className="text-xs font-black text-slate-800">
            Store User Response to Variable
          </h4>
          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Variable Name</label>
            <input
              type="text"
              value={node.inputVariable || ''}
              onChange={(e) => onUpdateNode({ ...node, inputVariable: e.target.value })}
              placeholder="e.g. bed_capacity or promoter_city"
              className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Next Step After Receiving Input</label>
            <select
              value={node.nextNodeId || ''}
              onChange={(e) => onUpdateNode({ ...node, nextNodeId: e.target.value })}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="">Select Next Step...</option>
              {allNodes.map((n) => (
                <option key={n.id} value={n.id}>{n.title}</option>
              ))}
            </select>
          </div>
        </div>
      )}

    </div>
  );
};
