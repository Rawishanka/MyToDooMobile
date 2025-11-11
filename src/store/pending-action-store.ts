import { create } from 'zustand';

export type PendingActionType = 
  | 'post-task'
  | 'make-offer'
  | 'complete-task'
  | null;

interface PendingAction {
  type: PendingActionType;
  data?: any;
  returnPath?: string;
}

interface PendingActionStore {
  pendingAction: PendingAction | null;
  setPendingAction: (action: PendingAction) => void;
  clearPendingAction: () => void;
  hasPendingAction: () => boolean;
}

export const usePendingActionStore = create<PendingActionStore>((set, get) => ({
  pendingAction: null,
  
  setPendingAction: (action: PendingAction) => {
    console.log("🔄 Setting pending action:", action);
    set({ pendingAction: action });
  },
  
  clearPendingAction: () => {
    console.log("🔄 Clearing pending action");
    set({ pendingAction: null });
  },
  
  hasPendingAction: () => {
    return get().pendingAction !== null;
  },
}));