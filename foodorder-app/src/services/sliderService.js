import api from '@/utils/axios.js';

const sliderService = {

    async fetchSliders(params)
    {
        const response = await api.get(`/sliders`, { params });
        return response.data;
    },
    async createSlider(data)
    {
        const response = await api.post(`/sliders/create`, data);
        return response.data;
    },
    async updateSlider(id, data)
    {
        const response = await api.put(`/sliders/edit/${id}`, data);
        return response.data;
    },
    async deleteSlider(id)
    {
        const response = await api.delete(`/sliders/delete/${id}`);
        return response.data;
    }
};

export default sliderService;
