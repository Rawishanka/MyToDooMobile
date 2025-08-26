import { create } from 'zustand'
import { CreateTask } from './create-task-type'

type CreateTaskStore = {
  myTask: CreateTask;
  updateMyTask: (newTask: Partial<CreateTask>) => void;
  resetTask: () => void;
}

const defaultTask: CreateTask = {
  mainGoal: '',
  title: '',
  description: '',
  budget: 0,
  date: '',
  time: '',
  photo: '',
} as CreateTask;

export const useCreateTaskStore = create<CreateTaskStore>((set) => ({
  myTask: defaultTask,
  
  updateMyTask: (newTask: Partial<CreateTask>) => 
    set((state) => ({ 
      myTask: { ...state.myTask, ...newTask } 
    })),
    
  resetTask: () => set({ myTask: defaultTask }),
}));