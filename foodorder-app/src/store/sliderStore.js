import { defineStore } from 'pinia';
import sliderService from '@/services/sliderService';
import { handleSuccess, handleError } from '@/utils/helpers.js';
import { formatDate } from '@/utils/helpers';

export const useSliderStore = defineStore('slider', {
    state: () => ({
        selectedSlider: null,
        sliders: null
    }),

    persist: [
        {
            pick: ['selectedSlider'],
            storage: localStorage,
        },
    ],

    actions: {
        setSelectedSlider(slider)
        {
            this.selectedSlider = {
                ...slider,
                expiry: slider.created_at ? formatDate(slider.created_at) : null
            };
        },

        async fetchSlider(params = {})
        {
            try
            {
                const { data } = await sliderService.fetchSliders(params);
                this.sliders = data;
                handleSuccess('Sliders fetched successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },

        async createSlider(sliderData)
        {
            try
            {
                await sliderService.createSlider(sliderData);
                handleSuccess('Slider created successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },

        async updateSlider(id, sliderData)
        {
            try
            {
                await sliderService.updateSlider(id, sliderData);
                handleSuccess('Slider updated successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },

        async deleteSlider(id)
        {
            try
            {
                await sliderService.deleteSlider(id);
                handleSuccess('Slider deleted successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },
    },
});
