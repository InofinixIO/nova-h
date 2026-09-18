import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Edit3, Plus, Trash2, ArrowUp, ArrowDown, Save, RotateCcw, 
  CheckCircle2, Clock, Users, FileText, ListChecks, Download, Upload, 
  Check, X, Eye, Building2 
} from 'lucide-react';
import { StageItem, FacilityType } from '../types';

interface AdminToolkitEditorProps {
  onNotify: (msg: string) => void;
  // keeping these for backwards compatibility, though ignored internally
  stages?: StageItem[];
  onUpdateStages?: (updatedStages: StageItem[]) => void;
}

export const AdminToolkitEditor: React.FC<AdminToolkitEditorProps> = ({ onNotify }) => {
  const [facilities, setFacilities] = useState<FacilityType[]>([]);
  const [activeFacilityId, setActiveFacilityId] = useState<string>('');
  const [stages, setStages] = useState<StageItem[]>([]);
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingStage, setEditingStage] = useState<StageItem | null>(null);

  // Temporary inputs for array fields in editor
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newStakeholder, setNewStakeholder] = useState('');

  // Facility creation state
  const [isCreatingFacility, setIsCreatingFacility] = useState(false);
  const [newFacilityName, setNewFacilityName] = useState('');
  const [newFacilityId, setNewFacilityId] = useState('');

  // Fetch facilities
  useEffect(() => {
    fetch('/api/facilities')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFacilities(data);
          if (data.length > 0) setActiveFacilityId(data[0].id);
        }
      })
      .catch(e => console.error(e));
  }, []);

  // Fetch stages for active facility
  useEffect(() => {
    if (activeFacilityId) {
      fetch(`/api/toolkit/${activeFacilityId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setStages(data);
        })
        .catch(e => console.error(e));
    }
  }, [activeFacilityId]);

  const saveToServer = async (updatedStages: StageItem[]) => {
    try {
      const res = await fetch(`/api/toolkit/${activeFacilityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stages: updatedStages })
      });
      if (res.ok) {
        setStages(updatedStages);
        onNotify('Saved to server.');
      } else {
        onNotify('Failed to save to server.');
      }
    } catch (e) {
      console.error(e);
      onNotify('Error saving to server.');
    }
  };

  const handleCreateFacility = async () => {
    if (!newFacilityName || !newFacilityId) return;
    try {
      const res = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newFacilityId, name: newFacilityName, description: `Toolkit for ${newFacilityName}` })
      });
      if (res.ok) {
        const newFacility = await res.json();
        setFacilities([...facilities, newFacility]);
        setActiveFacilityId(newFacility.id);
        setIsCreatingFacility(false);
        setNewFacilityName('');
        setNewFacilityId('');
        onNotify(`Created new facility: ${newFacility.name}`);
      } else {
        onNotify('Failed to create facility');
      }
    } catch (e) {
      console.error(e);
      onNotify('Error creating facility');
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
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
    saveToServer(updated);
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

    const renumbered = updated.map((s, idx) => ({ ...s, stageNumber: idx + 1 }));
    saveToServer(renumbered);
  };

  const handleDeleteStage = (index: number) => {
    if (stages.length <= 1) {
      alert('You must keep at least one stage in the toolkit.');
      return;
    }
    const stageToDelete = stages[index];
    if (window.confirm(`Are you sure you want to delete Stage ${stageToDelete.stageNumber}?`)) {
      const filtered = stages.filter((_, idx) => idx !== index);
      const renumbered = filtered.map((s, idx) => ({ ...s, stageNumber: idx + 1 }));
      saveToServer(renumbered);
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
      summary: 'Define objectives and implementation steps for this stage.',
      keyDeliverables: [],
      checklist: [],
      typicalTimeline: '1 - 3 Months',
      keyStakeholders: [],
      facilityTypeId: activeFacilityId
    };

    const updated = [...stages, newStage];
    setStages(updated);
    saveToServer(updated);
    setEditingIndex(updated.length - 1);
    setEditingStage(JSON.parse(JSON.stringify(newStage)));
  };

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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Facility Toolkit Manager
              </h2>
              <p className="text-xs text-slate-500">
                Edit toolkit stages per facility type.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={activeFacilityId}
              onChange={e => {
                setActiveFacilityId(e.target.value);
                setEditingIndex(null);
                setEditingStage(null);
              }}
              className="px-3 py-1.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg focus:ring-blue-500"
            >
              {facilities.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <button onClick={() => setIsCreatingFacility(true)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md" title="Add Facility Type">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleAddNewStage}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Stage</span>
          </button>
        </div>
      </div>

      {isCreatingFacility && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Add New Facility Type</h3>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Facility Name</label>
              <input type="text" value={newFacilityName} onChange={e => setNewFacilityName(e.target.value)} placeholder="e.g. Diagnostic Center" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Facility ID (slug)</label>
              <input type="text" value={newFacilityId} onChange={e => setNewFacilityId(e.target.value)} placeholder="e.g. diagnostic_center" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsCreatingFacility(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateFacility} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm">Create</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Stage Sequence ({stages.length})
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
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveStage(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStage(idx, 'down')}
                          disabled={idx === stages.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStage(idx)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {editingStage && editingIndex !== null ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {editingStage.stageNumber}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Edit Stage {editingStage.stageNumber}: {editingStage.title}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleCancelEdit} className="px-3 py-1.5 rounded-lg border text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer">
                    Cancel
                  </button>
                  <button onClick={handleSaveStage} className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs">
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-12">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stage Title *</label>
                  <input type="text" value={editingStage.title} onChange={e => setEditingStage({ ...editingStage, title: e.target.value })} className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300" />
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category / Phase</label>
                  <input type="text" value={editingStage.category} onChange={e => setEditingStage({ ...editingStage, category: e.target.value })} className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300" />
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Typical Timeline</label>
                  <input type="text" value={editingStage.typicalTimeline} onChange={e => setEditingStage({ ...editingStage, typicalTimeline: e.target.value })} className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Summary</label>
                <textarea rows={3} value={editingStage.summary} onChange={e => setEditingStage({ ...editingStage, summary: e.target.value })} className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300" />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <label className="text-xs font-bold text-slate-800">Checklist Items ({editingStage.checklist.length})</label>
                <div className="space-y-1.5">
                  {editingStage.checklist.map((item, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <input type="text" value={item} onChange={e => {
                        const updated = [...editingStage.checklist];
                        updated[cIdx] = e.target.value;
                        setEditingStage({ ...editingStage, checklist: updated });
                      }} className="flex-1 bg-transparent border-none p-0 text-xs focus:ring-0" />
                      <button onClick={() => removeChecklistItem(cIdx)} className="text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="text" value={newChecklistItem} onChange={e => setNewChecklistItem(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addChecklistItem(); }} placeholder="New checklist item..." className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
                  <button onClick={addChecklistItem} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <label className="text-xs font-bold text-slate-800">Key Deliverables ({editingStage.keyDeliverables.length})</label>
                <div className="space-y-1.5">
                  {editingStage.keyDeliverables.map((item, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                      <input type="text" value={item} onChange={e => {
                        const updated = [...editingStage.keyDeliverables];
                        updated[dIdx] = e.target.value;
                        setEditingStage({ ...editingStage, keyDeliverables: updated });
                      }} className="flex-1 bg-transparent border-none p-0 text-xs focus:ring-0" />
                      <button onClick={() => removeDeliverable(dIdx)} className="text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="text" value={newDeliverable} onChange={e => setNewDeliverable(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addDeliverable(); }} placeholder="New deliverable..." className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
                  <button onClick={addDeliverable} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center min-h-[400px] justify-center">
              <Edit3 className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-base font-bold text-slate-800 mb-2">Select a Stage</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-6">Choose a stage from the left sequence to edit its details, checklist, and deliverables.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

