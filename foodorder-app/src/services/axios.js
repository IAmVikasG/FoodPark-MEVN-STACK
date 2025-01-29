import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { handleApiError } from '../utils/helpers';

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
    (response) => response, // Return successful responses as they are
    (error) =>
    {
        // Handle network errors
        if (error.code === 'ERR_NETWORK')
        {
            handleApiError(error);
        }

        // Handle other errors (no retry logic here)
        return Promise.reject(error);
    }
);

export default api;
