import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { handleApiError } from '@/utils/helpers';

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

        if (error.response && error.response.status === 401)
        {
            try
            {
                // Check if refresh token is available
                if (!authStore.refreshToken)
                {
                    await authStore.logout();
                    return Promise.reject(error);
                }

                // Refresh the token
                await authStore.refreshAccessToken();

                // Retry the original request with the new access token
                error.config.headers.Authorization = `Bearer ${authStore.accessToken}`;
                return api(error.config);

            } catch (refreshError)
            {
                await authStore.logout();
                return Promise.reject(refreshError);
            }
        }

        if (error.code === 'ERR_NETWORK')
        {
            handleApiError(error);
        }

        return Promise.reject(error);
    }
);

export default api;
