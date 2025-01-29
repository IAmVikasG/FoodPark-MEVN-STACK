<template>
    <AdminLayout title="Role Management" subtitle="Manage user roles" activePage="Roles">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">Roles</h3>
                <div class="box-tools">
                    <button class="btn btn-primary btn-sm" @click="openCreateModal">
                        Add New Role
                    </button>
                </div>
            </div>

            <!-- Role List Table -->
            <div class="box-body">
                <div v-if="!roleStore.roles.length" class="text-center">
                    No roles available. Please add new roles.
                </div>
                <div v-else>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="role in roleStore.roles" :key="role.id">
                                <td>{{ role.name }}</td>
                                <td>{{ role.description }}</td>
                                <td>
                                    <button class="btn btn-sm btn-info" @click="openEditModal(role)">
                                        <i class="fa fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" @click="openDeleteModal(role)">
                                        <i class="fa fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Role Form Modal -->
        <BaseModal v-model="showFormModal" :title="editingRole ? 'Edit Role' : 'Create New Role'"
            @confirm="createOrUpdateRole">
            <form @submit.prevent="createOrUpdateRole">
                <div class="form-group">
                    <label>Name</label>
                    <Field name="name" type="text" class="form-control" />
                    <ErrorMessage name="name" class="text-danger" />
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <Field name="description" as="textarea" class="form-control" rows="3" />
                    <ErrorMessage name="description" class="text-danger" />
                </div>
            </form>
        </BaseModal>

        <!-- Delete Confirmation Modal -->
        <BaseModal v-model="showDeleteModal" title="Confirm Delete" confirm-text="Delete"
            confirm-button-class="btn-danger" @confirm="handleDelete">
            Are you sure you want to delete this role?
        </BaseModal>
    </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoleStore } from '@/store/roleStore';
import AdminLayout from '@/layouts/AdminLayout.vue';
import BaseModal from '@/components/layout/admin/modal/BaseModal.vue';
import { Field, ErrorMessage, useForm } from 'vee-validate';
import * as yup from 'yup';

const roleStore = useRoleStore();
const showFormModal = ref(false);
const showDeleteModal = ref(false);
const editingRole = ref(null);
const roleToDelete = ref(null);

// Form schema validation
const roleSchema = yup.object({
    name: yup.string().required('Name is required').min(3).max(20),
    description: yup.string().required('Description is required').max(255),
});

// Fetch roles data when component is mounted
onMounted(async () =>
{
    await roleStore.fetchRoles();
});

// Open modals
const openCreateModal = () =>
{
    editingRole.value = null;
    showFormModal.value = true;
};

const openEditModal = (role) =>
{
    setFieldValue('name', role?.name);
    setFieldValue('description', role?.description);
    editingRole.value = role;
    showFormModal.value = true;
};

const openDeleteModal = (role) =>
{
    roleToDelete.value = role;
    showDeleteModal.value = true;
};

const { handleSubmit, values, resetForm, setFieldValue } = useForm({
    validationSchema: roleSchema,
    initialValues: {
        name: '',
        description: '',
    },
});

// Handle role creation or update
const createOrUpdateRole = handleSubmit(async (formValues) =>
{
    try
    {
        if (editingRole.value)
        {
            await roleStore.updateRole(editingRole.value.id, formValues);
        } else
        {
            await roleStore.createRole(formValues);
        }
        showFormModal.value = false;
        resetForm(); // Clear form on success
        await roleStore.fetchRoles();
    } catch (error)
    {
        console.error('Error saving role:', error);
    }
});

// Handle role deletion
const handleDelete = async () =>
{
    try
    {
        await roleStore.deleteRole(roleToDelete.value.id);
        showDeleteModal.value = false;
        roleToDelete.value = null;
        await roleStore.fetchRoles();
    } catch (error)
    {
        console.error('Error deleting role:', error);
    }
};
</script>
