import { defineStore } from 'pinia';
import permissionService from '@/services/permissionService';
import { handleSuccess, handleError } from '@/utils/helpers.js';

export const usePermissionStore = defineStore('permission', {
    state: () => ({
        permissions: []
    }),

    actions: {
        async fetchPermissions()
        {
            try
            {
                const response = await permissionService.fetchPermissions();
                this.permissions = response.data;
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
