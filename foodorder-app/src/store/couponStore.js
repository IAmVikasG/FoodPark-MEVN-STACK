import { defineStore } from 'pinia';
import couponService from '@/services/couponService';
import { handleSuccess, handleError } from '@/utils/helpers.js';
import { formatDate } from '@/utils/helpers';

export const useCouponStore = defineStore('coupon', {
    state: () => ({
        selectedCoupon: null,
        coupons: null
    }),

    persist: [
        {
            pick: ['selectedCoupon'],
            storage: localStorage,
        },
    ],

    actions: {
        setSelectedCoupon(coupon)
        {
            this.selectedCoupon = {
                ...coupon,
                expiry: coupon.expiry ? formatDate(coupon.expiry) : null
            };
        },

        async fetchCoupons(params = {})
        {
            try
            {
                const { data } = await couponService.fetchCoupons(params);
                this.coupons = data;
                handleSuccess('Coupons fetched successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },

        async createCoupon(couponData)
        {
            try
            {
                await couponService.createCoupon(couponData);
                handleSuccess('Coupon created successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },

        async updateCoupon(id, couponData)
        {
            try
            {
                await couponService.updateCoupon(id, couponData);
                handleSuccess('Coupon updated successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },

        async deleteCoupon(id)
        {
            try
            {
                await couponService.deleteCoupon(id);
                handleSuccess('Coupon deleted successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },
    },
});
