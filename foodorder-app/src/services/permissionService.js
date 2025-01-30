import api from '@/services/axios.js';

const permissionService = {

    async fetchPermissions()
    {
        const response = await api.get(`/permissions`);
        return response.data;
    },
    async createPermission(data)
    {
        const response = await api.post(`/permissions`, data);
        return response.data;
    },
    async updatePermission(id, data)
    {
        const response = await api.put(`/permissions/${id}`, data);
        return response.data;
    },
    async deletePermission(id)
    {
        const response = await api.delete(`/permissions/${id}`);
        return response.data;
    }
};

export default permissionService;
