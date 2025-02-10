import { defineStore } from 'pinia';
import productCategoryService from '@/services/productCategoryService';
import { handleSuccess, handleError } from '@/utils/helpers.js';
import { formatDate } from '@/utils/helpers';

export const useProductCategoryStore = defineStore('product-category', {
    state: () => ({
        selectedProductCategory: null,
        productCategories: null,
        parentCategories: null
    }),

    persist: [
        {
            pick: ['selectedProductCategory'],
            storage: localStorage,
        },
    ],

    actions: {
        setSelectedProductCategory(productCategory)
        {
            this.selectedProductCategory = {
                ...productCategory,
                expiry: productCategory.created_at ? formatDate(productCategory.created_at) : null
            };
        },

        async fetchParentCategories()
        {
            try
            {
                const { data } = await productCategoryService.fetchParentCategory();
                return data;
            } catch (error)
            {
                handleError(error);
            }
        },

        async fetchProductCategories(params = {})
        {
            try
            {
                const { data } = await productCategoryService.fetchProductCategory(params);
                this.productCategories = data;
                handleSuccess('Product Category fetched successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },

        async createProductCategory(productCategoryData)
        {
            try
            {
                await productCategoryService.createProductCategory(productCategoryData);
                handleSuccess('Product Category created successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },

        async updateProductCategory(id, productCategoryData)
        {
            try
            {
                await productCategoryService.updateProductCategory(id, productCategoryData);
                handleSuccess('Product Category updated successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },

        async deleteProductCategory(id)
        {
            try
            {
                await productCategoryService.deleteProductCategory(id);
                handleSuccess('Product Category deleted successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },
    },
});
