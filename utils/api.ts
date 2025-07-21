// utils/api.ts
import { useAuthStore } from '@/store/auth-task-store';
import axios from 'axios';


export function createApi(baseURL: string) {
    const axiosInstance = axios.create({
        baseURL: baseURL,
    });

    axiosInstance.interceptors.request.use((config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
    return axiosInstance;
}
