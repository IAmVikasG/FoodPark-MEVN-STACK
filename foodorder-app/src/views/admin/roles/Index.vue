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
                <div class="form-inline">
                    <TableControls v-model:searchBoxInputValue="searchBox" v-model:perPageValue="perPage"
                        :perPageOptions="[10, 25, 50, 100]" @perPageFn="handlePerPageChange" />

                    <DataTable :columns="columns" :data="roleStore.roles.data" :sortKey="sortKey"
                        :sortDirection="sortDirection" @sortFn="handleSort" class="table-bordered table-striped">
                        <template #actions="{roleData}">
                            <button class="btn btn-sm btn-info mr-2" @click="openEditModal(roleData)">
                                <i class="fa fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger" @click="openDeleteModal(roleData)">
                                <i class="fa fa-trash"></i> Delete
                            </button>
                        </template>
                    </DataTable>

                    <PaginationControls :currentPage="currentPage" :perPage="perPage"
                        :total="roleStore.roles.totalRecords" @pageChangeFn="handlePageChange" />
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
import { ref, onMounted, watch } from 'vue';
import { useRoleStore } from '@/store/roleStore';
import AdminLayout from '@/layouts/AdminLayout.vue';
import BaseModal from '@/components/layout/admin/modal/BaseModal.vue';
import { Field, ErrorMessage, useForm } from 'vee-validate';
import * as yup from 'yup';
import DataTable from '@/components/layout/admin/table/DataTable.vue';
import PaginationControls from '@/components/layout/admin/table/PaginationControls.vue';
import TableControls from '@/components/layout/admin/table/TableControls.vue';

const roleStore = useRoleStore();
const showFormModal = ref(false);
const showDeleteModal = ref(false);
const editingRole = ref(null);
const roleToDelete = ref(null);

// Reactive state
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
watch([currentPage, perPage, sortKey, sortDirection], fetchRoles);
watch(searchBox, (newVal) =>
{
    setTimeout(() =>
    {
        currentPage.value = 1;
        fetchRoles();
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

async function fetchRoles()
{
    await roleStore.fetchRoles({
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
    await fetchRoles();
});


// Form schema validation
const roleSchema = yup.object({
    name: yup.string().required('Name is required').min(3).max(20),
    description: yup.string().required('Description is required').max(255),
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
