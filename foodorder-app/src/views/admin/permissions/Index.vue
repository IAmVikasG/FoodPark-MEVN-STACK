<template>
    <AdminLayout title="Permission Management" subtitle="Manage user permission" activePage="Permissions">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">Permissions</h3>
                <div class="box-tools">
                    <button class="btn btn-primary btn-sm" @click="openCreateModal">
                        Add New Permission
                    </button>
                </div>
            </div>

            <!-- Permission List Table -->
            <div class="box-body">
                <div v-if="!permissionStore.permissions.length" class="text-center">
                    No permission available. Please add new permission.
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
                            <tr v-for="permission in permissionStore.permissions" :key="permission.id">
                                <td>{{ permission.name }}</td>
                                <td>{{ permission.description }}</td>
                                <td>
                                    <button class="btn btn-sm btn-info" @click="openEditModal(permission)">
                                        <i class="fa fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" @click="openDeleteModal(permission)">
                                        <i class="fa fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Permission Form Modal -->
        <BaseModal v-model="showFormModal" :title="editingPermission ? 'Edit Permission' : 'Create New Permission'"
            @confirm="createOrUpdatePermission">
            <form @submit.prevent="createOrUpdatePermission">
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
            Are you sure you want to delete this permission?
        </BaseModal>
    </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePermissionStore } from '@/store/permissionStore';
import AdminLayout from '@/layouts/AdminLayout.vue';
import BaseModal from '@/components/layout/admin/modal/BaseModal.vue';
import { Field, ErrorMessage, useForm } from 'vee-validate';
import * as yup from 'yup';

const permissionStore = usePermissionStore();
const showFormModal = ref(false);
const showDeleteModal = ref(false);
const editingPermission = ref(null);
const permissionToDelete = ref(null);

// Form schema validation
const permissionSchema = yup.object({
    name: yup.string().required('Name is required').min(3).max(20),
    description: yup.string().required('Description is required').max(255),
});

// Fetch Permissions data when component is mounted
onMounted(async () =>
{
    await permissionStore.fetchPermissions();
});

// Open modals
const openCreateModal = () =>
{
    editingPermission.value = null;
    showFormModal.value = true;
};

const openEditModal = (permission) =>
{
    setFieldValue('name', permission?.name);
    setFieldValue('description', permission?.description);
    editingPermission.value = permission;
    showFormModal.value = true;
};

const openDeleteModal = (permission) =>
{
    permissionToDelete.value = permission;
    showDeleteModal.value = true;
};

const { handleSubmit, values, resetForm, setFieldValue } = useForm({
    validationSchema: permissionSchema,
    initialValues: {
        name: '',
        description: '',
    },
});

// Handle Permission creation or update
const createOrUpdatePermission = handleSubmit(async (formValues) =>
{
    try
    {
        if (editingPermission.value)
        {
            await permissionStore.updatePermission(editingPermission.value.id, formValues);
        } else
        {
            await permissionStore.createPermission(formValues);
        }
        showFormModal.value = false;
        resetForm(); // Clear form on success
        await permissionStore.fetchPermissions();
    } catch (error)
    {
        console.error('Error saving Permission:', error);
    }
});

// Handle Permission deletion
const handleDelete = async () =>
{
    try
    {
        await permissionStore.deletePermission(permissionToDelete.value.id);
        showDeleteModal.value = false;
        permissionToDelete.value = null;
        await permissionStore.fetchPermissions();
    } catch (error)
    {
        console.error('Error deleting Permission:', error);
    }
};
</script>
