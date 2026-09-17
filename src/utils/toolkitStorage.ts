import { StageItem } from '../types';
import { TOOLKIT_15_STAGES } from '../data/mockData';

const TOOLKIT_STORAGE_KEY = 'nova_h_toolkit_stages_v1';

export function getStoredToolkitStages(): StageItem[] {
  try {
    const data = localStorage.getItem(TOOLKIT_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(TOOLKIT_STORAGE_KEY, JSON.stringify(TOOLKIT_15_STAGES));
      return TOOLKIT_15_STAGES;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return TOOLKIT_15_STAGES;
  } catch (e) {
    console.error('Failed to load toolkit stages from storage:', e);
    return TOOLKIT_15_STAGES;
  }
}

export function saveStoredToolkitStages(stages: StageItem[]): void {
  try {
    localStorage.setItem(TOOLKIT_STORAGE_KEY, JSON.stringify(stages));
    window.dispatchEvent(new CustomEvent('nova_toolkit_updated', { detail: stages }));
  } catch (e) {
    console.error('Failed to save toolkit stages:', e);
  }
}

export function resetToolkitStagesToDefault(): StageItem[] {
  try {
    localStorage.setItem(TOOLKIT_STORAGE_KEY, JSON.stringify(TOOLKIT_15_STAGES));
    window.dispatchEvent(new CustomEvent('nova_toolkit_updated', { detail: TOOLKIT_15_STAGES }));
    return TOOLKIT_15_STAGES;
  } catch (e) {
    return TOOLKIT_15_STAGES;
  }
}
