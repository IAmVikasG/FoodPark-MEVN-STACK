import api from '@/utils/axios.js';

const authService = {

    async login(credentials)
    {
        const response = await api.post(`/auth/login`, credentials);
        return response.data;
    },
    async refreshToken(refreshToken)
    {
        const response = await api.post(`/auth/refresh-token`, { refreshToken });
        return response.data;
    },
    async getUserInfo()
    {
        const response = await api.get(`/auth/profile`);
        return response.data;
    },
    async logout(refreshToken)
    {
        return await api.post(`/auth/logout`, { refreshToken });
    },
};

export default authService;
