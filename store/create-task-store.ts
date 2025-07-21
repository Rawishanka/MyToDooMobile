import { create } from 'zustand'
import { CreateTask } from './create-task-type'

type CreateTaskStore = {
  myTask: CreateTask;
  updateMyTask: (newTask: CreateTask) => void;
}

export const useCreateTaskStore = create<CreateTaskStore>((set) => ({
  myTask: {
    title: '',
    description: '',
    budget: 0,
    date: '',
    time: '',
    photo: '',
  } as CreateTask,
  updateMyTask: (newTask: CreateTask) => set({ myTask: newTask }),
}));
