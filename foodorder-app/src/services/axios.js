import axios from 'axios';
import { useAuthStore } from '@/store/authStore'; // For Pinia

const api = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
});

api.interceptors.request.use((config) =>
{
    const authStore = useAuthStore();
    if (authStore.accessToken)
    {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) =>
    {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry)
        {
            originalRequest._retry = true;
            const authStore = useAuthStore();
            await authStore.refreshAccessToken();
            return api(originalRequest);
        }
        return Promise.reject(error);
    }
);

export default api;
