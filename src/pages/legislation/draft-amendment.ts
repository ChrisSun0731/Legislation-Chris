import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { LegislationContent } from 'src/ts/models';

export type AmendmentType = 'partial' | 'full';

export interface DraftContent {
  id: string; // unique ID for dragging
  status: 'unchanged' | 'modified' | 'added' | 'deleted';
  originalIndex?: number; // to reference original content
  originalContent?: LegislationContent; // copy of original for diffing
  current: LegislationContent;
  comment: string;
}

export interface DraftDocument {
  id: string;
  name: string;
  updatedAt: number;
  amendmentType: AmendmentType;
  partialContent: DraftContent[];
  fullContent: LegislationContent[];
}

export const useDraftAmendmentStore = defineStore('draft-amendment', () => {
  const drafts = ref<DraftDocument[]>([]);
  const activeDraftId = ref<string | null>(null);

  // Active Draft Pointers (for backwards compatibility mostly, or active editor)
  const amendmentType = ref<AmendmentType | null>(null);
  const partialContent = ref<DraftContent[]>([]);
  const fullContent = ref<LegislationContent[]>([]);

  const loadDrafts = (legislationId: string) => {
    const key = `draft-amendments-${legislationId}`;
    let loadedDrafts: DraftDocument[] = [];

    const stored = window.localStorage.getItem(key);
    if (stored) {
      try {
        loadedDrafts = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse draft amendments list', e);
      }
    }

    drafts.value = loadedDrafts;
    quitDraft(); // Ensure we load into the disconnected state
  };

  const saveToLocalStorage = (legislationId: string) => {
    if (drafts.value.length === 0) {
      window.localStorage.removeItem(`draft-amendments-${legislationId}`);
    } else {
      window.localStorage.setItem(`draft-amendments-${legislationId}`, JSON.stringify(drafts.value));
    }
  };

  const createNewDraft = (
    legislationId: string,
    name: string,
    type: AmendmentType,
    initialFullContent: LegislationContent[] = [],
    initialPartialContent: DraftContent[] = [],
  ) => {
    const newDraft: DraftDocument = {
      id: generateId(),
      name,
      updatedAt: Date.now(),
      amendmentType: type,
      partialContent: initialPartialContent,
      fullContent: initialFullContent,
    };
    drafts.value.unshift(newDraft);
    saveToLocalStorage(legislationId);
    selectDraft(newDraft.id);
  };

  const selectDraft = (id: string) => {
    const draft = drafts.value.find((d) => d.id === id);
    if (draft) {
      activeDraftId.value = draft.id;
      amendmentType.value = draft.amendmentType;
      partialContent.value = JSON.parse(JSON.stringify(draft.partialContent)); // Work on a clone
      fullContent.value = JSON.parse(JSON.stringify(draft.fullContent)); // Work on a clone
    }
  };

  const saveActiveDraft = (legislationId: string) => {
    if (!activeDraftId.value || !amendmentType.value) return;

    const draftIndex = drafts.value.findIndex((d) => d.id === activeDraftId.value);
    if (draftIndex !== -1) {
      const draft = drafts.value[draftIndex]!;

      const newPartialStr = JSON.stringify(partialContent.value);
      const newFullStr = JSON.stringify(fullContent.value);
      const oldPartialStr = JSON.stringify(draft.partialContent);
      const oldFullStr = JSON.stringify(draft.fullContent);

      if (draft.amendmentType !== amendmentType.value || newPartialStr !== oldPartialStr || newFullStr !== oldFullStr) {
        // Update by pointer mutation
        draft.updatedAt = Date.now();
        draft.amendmentType = amendmentType.value;
        draft.partialContent = JSON.parse(newPartialStr);
        draft.fullContent = JSON.parse(newFullStr);
        saveToLocalStorage(legislationId);
      }
    }
  };

  const deleteDraft = (legislationId: string, id: string) => {
    drafts.value = drafts.value.filter((d) => d.id !== id);
    if (activeDraftId.value === id) {
      quitDraft();
    }
    saveToLocalStorage(legislationId);
  };

  const quitDraft = () => {
    activeDraftId.value = null;
    amendmentType.value = null;
    partialContent.value = [];
    fullContent.value = [];
  };

  const renameDraft = (legislationId: string, id: string, newName: string) => {
    const draftIndex = drafts.value.findIndex((d) => d.id === id);
    if (draftIndex !== -1) {
      drafts.value[draftIndex]!.name = newName;
      drafts.value[draftIndex]!.updatedAt = Date.now();
      saveToLocalStorage(legislationId);
    }
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  return {
    drafts,
    activeDraftId,
    amendmentType,
    partialContent,
    fullContent,
    loadDrafts,
    createNewDraft,
    selectDraft,
    saveActiveDraft,
    deleteDraft,
    quitDraft,
    renameDraft,
  };
});
