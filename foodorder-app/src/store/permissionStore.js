import { defineStore } from 'pinia';
import permissionService from '@/services/permissionService';
import { handleSuccess, handleError } from '@/utils/helpers.js';

export const usePermissionStore = defineStore('permission', {
    state: () => ({
        permissions: {
            data: [],
            currentPage: 1,
            perPage: 10,
            totalRecords: 0,
            totalPages: 1
        }
    }),

    actions: {
        async fetchPermissions(params = {})
        {
            try
            {
                const { data: { data, currentPage, perPage, totalRecords, totalPages } } = await permissionService.fetchPermissions(params);
                this.permissions = {
                    data: data,
                    currentPage: currentPage,
                    perPage: perPage,
                    totalRecords: totalRecords,
                    totalPages: totalPages
                };
                handleSuccess('Permission fetched successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },

        async createPermission(permissionData)
        {
            try
            {
                await permissionService.createPermission(permissionData);
                handleSuccess('Permission created successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },

        async updatePermission(id, permissionData)
        {
            try
            {
                await permissionService.updatePermission(id, permissionData);
                handleSuccess('Permission updated successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },

        async deletePermission(id)
        {
            try
            {
                await permissionService.deletePermission(id);
                handleSuccess('Permission deleted successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },
    },
});
