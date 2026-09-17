import React, { useState } from 'react';
import { 
  BookOpen, 
  Edit3, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Users, 
  FileText, 
  ListChecks, 
  Download, 
  Upload, 
  Check, 
  X,
  Eye
} from 'lucide-react';
import { StageItem } from '../types';
import { resetToolkitStagesToDefault } from '../utils/toolkitStorage';

interface AdminToolkitEditorProps {
  stages: StageItem[];
  onUpdateStages: (updatedStages: StageItem[]) => void;
  onNotify: (msg: string) => void;
}

export const AdminToolkitEditor: React.FC<AdminToolkitEditorProps> = ({
  stages,
  onUpdateStages,
  onNotify
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingStage, setEditingStage] = useState<StageItem | null>(null);

  // Temporary inputs for array fields in editor
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newStakeholder, setNewStakeholder] = useState('');

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    // Deep clone the stage item to avoid accidental mutation before save
    setEditingStage(JSON.parse(JSON.stringify(stages[index])));
    setNewDeliverable('');
    setNewChecklistItem('');
    setNewStakeholder('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingStage(null);
  };

  const handleSaveStage = () => {
    if (!editingStage || editingIndex === null) return;
    if (!editingStage.title.trim()) {
      alert('Please enter a stage title.');
      return;
    }

    const updated = [...stages];
    updated[editingIndex] = editingStage;
    onUpdateStages(updated);
    onNotify(`Successfully updated Stage ${editingStage.stageNumber}: "${editingStage.title}".`);
    setEditingIndex(null);
    setEditingStage(null);
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stages.length) return;

    const updated = [...stages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Renumber stages sequentially 1..N
    const renumbered = updated.map((s, idx) => ({
      ...s,
      stageNumber: idx + 1
    }));

    onUpdateStages(renumbered);
    onNotify(`Reordered Stage ${index + 1} to position ${targetIndex + 1}.`);
  };

  const handleDeleteStage = (index: number) => {
    if (stages.length <= 1) {
      alert('You must keep at least one stage in the toolkit.');
      return;
    }
    const stageToDelete = stages[index];
    if (window.confirm(`Are you sure you want to delete Stage ${stageToDelete.stageNumber}: "${stageToDelete.title}"?`)) {
      const filtered = stages.filter((_, idx) => idx !== index);
      // Renumber stages
      const renumbered = filtered.map((s, idx) => ({
        ...s,
        stageNumber: idx + 1
      }));
      onUpdateStages(renumbered);
      onNotify(`Deleted Stage: "${stageToDelete.title}". Remaining: ${renumbered.length} stages.`);
      if (editingIndex === index) {
        setEditingIndex(null);
        setEditingStage(null);
      }
    }
  };

  const handleAddNewStage = () => {
    const newStageNumber = stages.length + 1;
    const newStage: StageItem = {
      stageNumber: newStageNumber,
      title: `New Stage ${newStageNumber}`,
      category: 'General Execution',
      summary: 'Define the objectives, regulatory procedures, and implementation steps for this hospital developmental stage.',
      keyDeliverables: ['Detailed Project Blueprint', 'Compliance Documentation'],
      checklist: ['Define stage milestones', 'Appoint key consultants and vendors'],
      typicalTimeline: '1 - 3 Months',
      keyStakeholders: ['Project Promoters', 'Healthcare Consultants']
    };

    const updated = [...stages, newStage];
    onUpdateStages(updated);
    onNotify(`Added new Stage ${newStageNumber}. Click "Edit" to configure details.`);
    // Immediately open editor for the new stage
    setEditingIndex(updated.length - 1);
    setEditingStage(JSON.parse(JSON.stringify(newStage)));
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all toolkit stages back to the default 15 stages from the master guide? Any custom edits will be reverted.')) {
      const defaults = resetToolkitStagesToDefault();
      onUpdateStages(defaults);
      setEditingIndex(null);
      setEditingStage(null);
      onNotify('Reset toolkit to standard 15 stages.');
    }
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(stages, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-toolkit-15-stages-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Exported toolkit stages JSON.');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
          const validated: StageItem[] = parsed.map((item, idx) => ({
            stageNumber: item.stageNumber || idx + 1,
            title: item.title || `Stage ${idx + 1}`,
            category: item.category || 'Hospital Development',
            summary: item.summary || '',
            keyDeliverables: Array.isArray(item.keyDeliverables) ? item.keyDeliverables : [],
            checklist: Array.isArray(item.checklist) ? item.checklist : [],
            typicalTimeline: item.typicalTimeline || '2 - 4 Months',
            keyStakeholders: Array.isArray(item.keyStakeholders) ? item.keyStakeholders : []
          }));
          onUpdateStages(validated);
          onNotify(`Successfully imported ${validated.length} stages from JSON file.`);
        } else {
          alert('Invalid JSON structure. Please ensure the file contains an array of StageItem objects.');
        }
      } catch (err) {
        alert('Failed to parse JSON file: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Helper methods for array fields inside the active editor
  const addDeliverable = () => {
    if (!newDeliverable.trim() || !editingStage) return;
    setEditingStage({
      ...editingStage,
      keyDeliverables: [...editingStage.keyDeliverables, newDeliverable.trim()]
    });
    setNewDeliverable('');
  };

  const removeDeliverable = (idx: number) => {
    if (!editingStage) return;
    setEditingStage({
      ...editingStage,
      keyDeliverables: editingStage.keyDeliverables.filter((_, i) => i !== idx)
    });
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim() || !editingStage) return;
    setEditingStage({
      ...editingStage,
      checklist: [...editingStage.checklist, newChecklistItem.trim()]
    });
    setNewChecklistItem('');
  };

  const removeChecklistItem = (idx: number) => {
    if (!editingStage) return;
    setEditingStage({
      ...editingStage,
      checklist: editingStage.checklist.filter((_, i) => i !== idx)
    });
  };

  const addStakeholder = () => {
    if (!newStakeholder.trim() || !editingStage) return;
    setEditingStage({
      ...editingStage,
      keyStakeholders: [...editingStage.keyStakeholders, newStakeholder.trim()]
    });
    setNewStakeholder('');
  };

  const removeStakeholder = (idx: number) => {
    if (!editingStage) return;
    setEditingStage({
      ...editingStage,
      keyStakeholders: editingStage.keyStakeholders.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar with actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Hospital Development Stages Manager ({stages.length} Stages)
              </h2>
              <p className="text-xs text-slate-500">
                Edit stage titles, milestones, critical checklists, timelines, and stakeholder requirements in real time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportJSON} 
              className="hidden" 
            />
          </label>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleResetToDefaults}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset 15 Stages</span>
          </button>

          <button
            onClick={handleAddNewStage}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Stage</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Stages list & Editor Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Stage List (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Stage Sequence (Click to Edit)
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {stages.length} Stages Configured
              </span>
            </div>

            <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
              {stages.map((st, idx) => {
                const isSelected = editingIndex === idx;
                return (
                  <div
                    key={st.stageNumber}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(idx)}
                        className="flex items-start gap-2.5 text-left flex-1 cursor-pointer"
                      >
                        <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {st.stageNumber}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {st.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                            <span className="font-medium text-blue-600">{st.category}</span>
                            <span>•</span>
                            <span>{st.typicalTimeline}</span>
                          </div>
                        </div>
                      </button>

                      {/* Reorder and Delete controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveStage(idx, 'up')}
                          disabled={idx === 0}
                          title="Move stage up"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStage(idx, 'down')}
                          disabled={idx === stages.length - 1}
                          title="Move stage down"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(idx)}
                          title="Edit stage details"
                          className={`p-1 rounded cursor-pointer ${
                            isSelected ? 'text-blue-600 bg-blue-100' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStage(idx)}
                          title="Delete stage"
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{st.checklist.length} checklist items</span>
                      <span>{st.keyDeliverables.length} deliverables</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Stage Editor Form (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {editingStage && editingIndex !== null ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-fadeIn">
              
              {/* Form Title & Top Controls */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {editingStage.stageNumber}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Edit Stage {editingStage.stageNumber}: {editingStage.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Make your changes and press Save Stage to update live across the portal.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveStage}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Stage</span>
                  </button>
                </div>
              </div>

              {/* Basic Details: Title, Stage Number, Category, Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stage Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingStage.stageNumber}
                    onChange={(e) => setEditingStage({ ...editingStage, stageNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-9">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stage Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStage.title}
                    onChange={(e) => setEditingStage({ ...editingStage, title: e.target.value })}
                    placeholder="e.g. Concept & Feasibility"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category / Phase
                  </label>
                  <input
                    type="text"
                    value={editingStage.category}
                    onChange={(e) => setEditingStage({ ...editingStage, category: e.target.value })}
                    placeholder="e.g. Feasibility & Strategy"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Typical Timeline
                  </label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={editingStage.typicalTimeline}
                      onChange={(e) => setEditingStage({ ...editingStage, typicalTimeline: e.target.value })}
                      placeholder="e.g. 1 - 2 Months"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Stage Summary / Scope */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Stage Summary & Purpose
                </label>
                <textarea
                  rows={3}
                  value={editingStage.summary}
                  onChange={(e) => setEditingStage({ ...editingStage, summary: e.target.value })}
                  placeholder="Summarize the key developmental focus, clinical scope, and operational targets for this stage..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Critical Checklist Manager */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-emerald-600" />
                    <label className="text-xs font-bold text-slate-800">
                      Critical Checklist Items ({editingStage.checklist.length})
                    </label>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Checked by founders during execution
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {editingStage.checklist.map((item, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...editingStage.checklist];
                          updated[cIdx] = e.target.value;
                          setEditingStage({ ...editingStage, checklist: updated });
                        }}
                        className="flex-1 bg-transparent border-none p-0 text-xs focus:ring-0 text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(cIdx)}
                        className="text-slate-400 hover:text-red-500 p-0.5 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addChecklistItem(); } }}
                    placeholder="Type new checklist item and press Enter..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Key Deliverables Manager */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <label className="text-xs font-bold text-slate-800">
                      Key Deliverables & Documentation ({editingStage.keyDeliverables.length})
                    </label>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Tangible project reports & approvals
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {editingStage.keyDeliverables.map((item, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...editingStage.keyDeliverables];
                          updated[dIdx] = e.target.value;
                          setEditingStage({ ...editingStage, keyDeliverables: updated });
                        }}
                        className="flex-1 bg-transparent border-none p-0 text-xs focus:ring-0 text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => removeDeliverable(dIdx)}
                        className="text-slate-400 hover:text-red-500 p-0.5 cursor-pointer"
                        title="Remove deliverable"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDeliverable(); } }}
                    placeholder="Type key deliverable and press Enter..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={addDeliverable}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Key Stakeholders Manager */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-600" />
                    <label className="text-xs font-bold text-slate-800">
                      Key Stakeholders & Vendor Disciplines ({editingStage.keyStakeholders.length})
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {editingStage.keyStakeholders.map((sh, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs"
                    >
                      <span>{sh}</span>
                      <button
                        type="button"
                        onClick={() => removeStakeholder(sIdx)}
                        className="text-slate-400 hover:text-red-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newStakeholder}
                    onChange={(e) => setNewStakeholder(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStakeholder(); } }}
                    placeholder="Add stakeholder discipline (e.g. Healthcare Architects, MEP Contractors)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={addStakeholder}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Tag</span>
                  </button>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Reader Preview: How Founders Will See This Stage</span>
                </div>
                
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-xl p-5 text-white shadow-md border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold text-[11px] uppercase tracking-wider border border-blue-400/30">
                      Stage {editingStage.stageNumber} • {editingStage.category}
                    </span>
                    <span className="text-[11px] text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full font-mono">
                      ⏱ {editingStage.typicalTimeline}
                    </span>
                  </div>

                  <h4 className="text-lg font-extrabold text-white">
                    {editingStage.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {editingStage.summary || 'Stage summary will appear here.'}
                  </p>

                  <div className="bg-slate-800/70 rounded-lg p-3 border border-slate-700/60 space-y-1.5">
                    <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wide">
                      Critical Stage Checklist:
                    </p>
                    <ul className="space-y-1 text-xs text-slate-200">
                      {editingStage.checklist.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                      {editingStage.checklist.length > 3 && (
                        <li className="text-[10px] text-slate-400 italic">
                          +{editingStage.checklist.length - 3} more items in full checklist
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveStage}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Stage Changes</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Edit3 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Select a Stage to Edit
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-6">
                Click on any of the {stages.length} stages on the left or click "Add New Stage" to configure title, summary, deliverables, and checklist items.
              </p>
              <button
                type="button"
                onClick={() => handleStartEdit(0)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Stage 1: {stages[0]?.title || 'First Stage'}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
