import api from '@/utils/axios.js';

const permissionService = {

    async fetchPermissions(params)
    {
        const response = await api.get(`/permissions`, { params });
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
