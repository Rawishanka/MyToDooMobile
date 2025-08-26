import { useStorageState } from "@/hooks/useStorageState";
import { useAuthStore } from "@/store/auth-task-store";
import { useCreateTaskStore } from "@/store/create-task-store";
import { CreateTask } from "@/store/create-task-type";
import { createApi } from "@/utils/api";
import API_CONFIG from "./config";

export function useApiFunctions() {
  const updateMyTask = useCreateTaskStore((state) => state.updateMyTask);
  const [[isLoading, storedToken], setStoredToken] = useStorageState('token');
  const setAuthData = useAuthStore((state) => state.setAuthData);

  async function createTask(task: CreateTask) {
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

  async function handleLoginUser(email: string, password: string) {
    const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
      ? API_CONFIG.BASE_URL
      : "http://192.168.8.135:5001/api";
    const api = createApi(baseUrl);
    console.log("Calling login API:", baseUrl + "/auth/login");
    console.log("With data:", { email: email, password });

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user, expiresIn } = response.data;
      setAuthData(token, user, expiresIn);
      setStoredToken(token);  // ✅ Calling returned setter function — safe
      return token;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  return {
    createTask,
    handleLoginUser,
    isLoading,
    storedToken,
  };
}

