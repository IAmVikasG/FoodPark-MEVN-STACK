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
                <div class="form-inline">
                    <TableControls v-model:searchBoxInputValue="searchBox" v-model:perPageValue="perPage"
                        :perPageOptions="[10, 25, 50, 100]" @perPageFn="handlePerPageChange" />

                    <DataTable :columns="columns" :data="permissionStore.permissions.data" :sortKey="sortKey"
                        :sortDirection="sortDirection" @sortFn="handleSort" class="table-bordered table-striped">
                        <template #actions="{ data }">
                            <button class="btn btn-sm btn-info mr-2" @click="openEditModal(data)">
                                <i class="fa fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger" @click="openDeleteModal(data)">
                                <i class="fa fa-trash"></i> Delete
                            </button>
                        </template>
                    </DataTable>

                    <PaginationControls :currentPage="currentPage" :perPage="perPage"
                        :total="permissionStore.permissions.totalRecords" @pageChangeFn="handlePageChange" />
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
import { ref, onMounted, watch } from 'vue';
import { usePermissionStore } from '@/store/permissionStore';
import AdminLayout from '@/layouts/AdminLayout.vue';
import BaseModal from '@/components/layout/admin/modal/BaseModal.vue';
import { Field, ErrorMessage, useForm } from 'vee-validate';
import * as yup from 'yup';
import DataTable from '@/components/layout/admin/table/DataTable.vue';
import PaginationControls from '@/components/layout/admin/table/PaginationControls.vue';
import TableControls from '@/components/layout/admin/table/TableControls.vue';

const permissionStore = usePermissionStore();
const showFormModal = ref(false);
const showDeleteModal = ref(false);
const editingPermission = ref(null);
const permissionToDelete = ref(null);

// Table Reactive state
const currentPage = ref(1);
const perPage = ref(10);
const searchBox = ref('');
const sortKey = ref('id');
const sortDirection = ref('asc');

const columns = ref([
    { key: 'id', label: '#', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'created_at', label: 'Created At', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
]);

// Watchers
watch([currentPage, perPage, sortKey, sortDirection], fetchPermissions);
watch(searchBox, (newVal) =>
{
    setTimeout(() =>
    {
        currentPage.value = 1;
        fetchPermissions();
    }, 300);
});

// Methods
function handleSort(key)
{
    if (sortKey.value === key)
    {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else
    {
        sortKey.value = key;
        sortDirection.value = 'asc';
    }
}

function handlePageChange(page)
{
    currentPage.value = page;
}

function handlePerPageChange(newPerPage)
{
    perPage.value = newPerPage;
    currentPage.value = 1;
}

async function fetchPermissions()
{
    await permissionStore.fetchPermissions({
        page: currentPage.value,
        perPage: perPage.value,
        search: searchBox.value,
        sortBy: sortKey.value,
        sortDirection: sortDirection.value
    });
}

// Initial fetch
onMounted(async () =>
{
    await fetchPermissions();
});

// Form schema validation
const permissionSchema = yup.object({
    name: yup.string().required('Name is required').min(3).max(20),
    description: yup.string().required('Description is required').max(255),
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
