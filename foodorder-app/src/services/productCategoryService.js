import api from '@/utils/axios.js';

const URL = 'product-categories';

const productCategoryService = {

    async fetchParentCategory()
    {
        const response = await api.get(`${URL}/only-parents`);
        return response.data;
    },
    async fetchProductCategory(params)
    {
        const response = await api.get(`${URL}`, { params });
        return response.data;
    },
    async createProductCategory(data)
    {
        const response = await api.post(`${URL}`, data);
        return response.data;
    },
    async updateProductCategory(id, data)
    {
        const response = await api.put(`${URL}/${id}`, data);
        return response.data;
    },
    async deleteProductCategory(id)
    {
        const response = await api.delete(`${URL}/${id}`);
        return response.data;
    }
};

export default productCategoryService;
