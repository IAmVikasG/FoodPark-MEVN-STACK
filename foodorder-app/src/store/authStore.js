import { defineStore } from 'pinia';
import authService from '@/services/authService';
import { handleSuccess, handleError } from '@/utils/helpers.js';

const TOKEN_KEYS = {
    ACCESS: 'accessToken',
    REFRESH: 'refreshToken',
};

const setTokens = (accessToken, refreshToken) =>
{
    if (accessToken) localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
    if (refreshToken) localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
};

const clearTokens = () =>
{
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
};

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        accessToken: localStorage.getItem(TOKEN_KEYS.ACCESS) || null,
        refreshToken: localStorage.getItem(TOKEN_KEYS.REFRESH) || null,
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

                setTokens(accessToken, refreshToken);
                handleSuccess('Successfully logged in!');
            } catch (error)
            {
                handleError(error, 'Login failed');
                throw error;
            }
        },

        async refreshAccessToken()
        {
            if (!this.refreshToken)
            {
                handleError(new Error('No refresh token available.'));
                this.logout();
                return;
            }

            try
            {
                const { data: { accessToken, refreshToken } } = await authService.refreshToken(this.refreshToken);

                this.accessToken = accessToken;
                this.refreshToken = refreshToken;

                setTokens(accessToken, refreshToken);
            } catch (error)
            {
                handleError(error, 'Token refresh failed');
                this.logout();
            }
        },

        async fetchUserInfo()
        {
            try
            {
                const { data: user } = await authService.getUserInfo();
                this.user = user;
            } catch (error)
            {
                handleError(error, 'Failed to fetch user information');
                this.logout();
            }
        },

        async logout()
        {
            try
            {
                if (this.refreshToken)
                {
                    await authService.logout(this.refreshToken);
                    handleSuccess('Successfully logged out.');
                }
            } catch (error)
            {
                handleError(error, 'Logout failed');
            } finally
            {
                this.accessToken = null;
                this.refreshToken = null;
                this.user = null;
                clearTokens();
            }
        },
    }
});
