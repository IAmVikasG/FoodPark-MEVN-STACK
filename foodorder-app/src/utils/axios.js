import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
});

// Request Interceptor to attach token
api.interceptors.request.use((config) =>
{
    const authStore = useAuthStore();
    if (authStore.accessToken)
    {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    return config;
});

// Response Interceptor to handle token expiry and refresh
api.interceptors.response.use(
    (response) => response,
    async (error) =>
    {
        const authStore = useAuthStore();

        if ((error.response.data.message === 'Token expired' && error.config.url !== "/auth/logout") && error.response.status === 401)
        {
            await authStore.refreshAccessToken();
            error.config.headers.Authorization = `Bearer ${authStore.accessToken}`;
            return api(error.config);
        } else if ((error.response.data.message === 'Invalid refresh token' && error.config.url === "/auth/refresh-token"))
        {
            await authStore.logout();
            window.location.href = '/admin/login';
            return;
        }
        throw error;
    }
);


export default api;
