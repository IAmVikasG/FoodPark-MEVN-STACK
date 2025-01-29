import { defineStore } from 'pinia';
import roleService from '@/services/roleService';
import { handleSuccess, handleError } from '@/utils/helpers.js';

export const useRoleStore = defineStore('role', {
    state: () => ({
        roles: []
    }),

    actions: {
        async fetchRoles()
        {
            try
            {
                const response = await roleService.fetchRoles();
                this.roles = response.data;
                handleSuccess('Roles fetched successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },

        async createRole(roleData)
        {
            try
            {
                await roleService.createRole(roleData);
                handleSuccess('Role created successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },

        async updateRole(id, roleData)
        {
            try
            {
                await roleService.updateRole(id, roleData);
                handleSuccess('Role updated successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },

        async deleteRole(id)
        {
            try
            {
                await roleService.deleteRole(id);
                handleSuccess('Role deleted successfully.');
            } catch (error)
            {
                handleError(error);
            }
        },
    },
});
