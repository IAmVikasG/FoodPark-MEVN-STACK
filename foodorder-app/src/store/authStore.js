import { defineStore } from 'pinia';
import authService from '@/services/authService';
import { handleApiError, handleValidationErrors, handleSuccess } from '@/utils/helpers.js';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        accessToken: localStorage.getItem('accessToken') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
    }),
    actions: {
        async login(credentials)
        {
            try
            {
                const { data: { accessToken, refreshToken, user } } = await authService.login(credentials);
                this.accessToken = accessToken;
                this.refreshToken = refreshToken;
                this.user = user;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                handleSuccess('Successfully logged in!');
            } catch (error)
            {
                if (error.response.data.errors)
                {
                    handleValidationErrors(error.response.data.errors);
                } else
                {
                    handleApiError(error);
                }
                throw error;
            }
        },

        async refreshAccessToken()
        {
            try
            {
                const { accessToken } = await authService.refreshToken(this.refreshToken);
                this.accessToken = accessToken;
                localStorage.setItem('accessToken', accessToken);
            } catch (error)
            {
                handleApiError(error);
                this.logout();
            }
        },

        async fetchUserInfo()
        {
            try
            {
                this.user = await authService.getUserInfo();
            } catch (error)
            {
                handleApiError(error);
            }
        },

        async logout()
        {
            try
            {
                await authService.logout(this.refreshToken);
                handleSuccess('Successfully logged out.');
            } catch (error)
            {
                handleApiError(error);
            } finally
            {
                this.accessToken = null;
                this.refreshToken = null;
                this.user = null;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
        },
    },
    getters: {
        isAuthenticated: (state) => !!state.accessToken,
        isAdmin: (state) =>
        {
            return state.user?.roles?.some(role => role === 'admin') || false;
        }
    },
});
