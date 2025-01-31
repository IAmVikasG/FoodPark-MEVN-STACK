import { defineStore } from 'pinia';
import roleService from '@/services/roleService';
import { handleSuccess, handleError } from '@/utils/helpers.js';

export const useRoleStore = defineStore('role', {
    state: () => ({
        roles: {
            data: [],
            currentPage: 1,
            perPage: 10,
            totalRecords: 0,
            totalPages: 1
        }
    }),

    actions: {
        async fetchRoles(params = {})
        {
            try
            {
                const { data: { data, currentPage, perPage, totalRecords, totalPages }} = await roleService.fetchRoles(params);

                this.roles = {
                    data: data,
                    currentPage: currentPage,
                    perPage: perPage,
                    totalRecords: totalRecords,
                    totalPages: totalPages
                };
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
