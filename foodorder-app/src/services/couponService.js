import api from '@/utils/axios.js';

const couponService = {

    async fetchCoupons(params)
    {
        const response = await api.get(`/coupons`, { params });
        return response.data;
    },
    async createCoupon(data)
    {
        const response = await api.post(`/coupons`, data);
        return response.data;
    },
    async updateCoupon(id, data)
    {
        const response = await api.put(`/coupons/${id}`, data);
        return response.data;
    },
    async deleteCoupon(id)
    {
        const response = await api.delete(`/coupons/${id}`);
        return response.data;
    }
};

export default couponService;
