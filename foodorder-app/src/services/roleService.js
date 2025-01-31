import api from '@/services/axios.js';

const roleService = {

    async fetchRoles(params)
    {
        const response = await api.get(`/roles`, { params });
        return response.data;
    },
    async createRole(data)
    {
        const response = await api.post(`/roles`, data);
        return response.data;
    },
    async updateRole(id, data)
    {
        const response = await api.put(`/roles/${id}`, data);
        return response.data;
    },
    async deleteRole(id)
    {
        const response = await api.delete(`/roles/${id}`);
        return response.data;
    }
};

export default roleService;
