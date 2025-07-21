
import { useCreateTaskStore } from "@/store/create-task-store";
import { CreateTask } from "@/store/create-task-type";
import { createApi } from "@/utils/api";
import API_CONFIG from "./config";
import { useAuthStore } from "@/store/auth-task-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStorageState } from "@/hooks/useStorageState";

const updateMyTask = useCreateTaskStore((state) => state.updateMyTask);
const setToken = useAuthStore((state) => state.setToken);
const [[isLoading, storedToken], setStoredToken] = useStorageState('token');

export async function createTask(task: CreateTask) {
  const api = createApi(API_CONFIG.BASE_URL ?? "https://localhost:3000/api");
  
  try {
    const response = await api.post('/tasks', task);
    updateMyTask(response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

export async function handleLogin (username: string, password: string) {
  const api = createApi(API_CONFIG.BASE_URL ?? "https://localhost:3000/api");
  const response = await api.post('/auth/login', { username, password });
  const token = response.data.token;
  setToken(token);
  await setStoredToken(token);
};