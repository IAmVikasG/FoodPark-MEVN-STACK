<template>
    <AdminLayout title="Product Category Management" subtitle="Manage Product Categories"
        activePage="Product Categories">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">Product Categories</h3>
                <div class="box-tools">
                    <router-link :to="{ name: 'admin.productCategories.create' }" class="btn btn-primary btn-sm">
                        Add New Product Category
                    </router-link>
                </div>
            </div>

            <!-- Product Category List Table -->
            <div class="box-body">
                <DataTable class="display table nowrap" :columns="columns" :options="options" ref="dataTableRef">
                    <template #action="props">
                        <button class="btn btn-sm btn-info mr-2" @click="editProductCategory(props)">
                            <i class="fa fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" @click="openDeleteModal(props)">
                            <i class="fa fa-trash"></i> Delete
                        </button>
                    </template>
                </DataTable>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <BaseModal v-model="showDeleteModal" title="Confirm Delete" confirm-text="Delete"
            confirm-button-class="btn-danger" @confirm="handleDelete">
            Are you sure you want to delete this product category?
        </BaseModal>
    </AdminLayout>
</template>

<script setup>
import { ref, toRaw } from 'vue';
import { useProductCategoryStore } from '@/store/productCategoryStore';
import AdminLayout from '@/layouts/AdminLayout.vue';
import BaseModal from '@/components/layout/admin/modal/BaseModal.vue';
import { useRouter } from 'vue-router';
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net-dt';
import 'datatables.net-select-dt';
import 'datatables.net-responsive-dt';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import { formatDateTime } from '@/utils/helpers';

DataTable.use(DataTablesCore);

const router = useRouter();
const productCategoryStore = useProductCategoryStore();
const showDeleteModal = ref(false);
const productCategoryToDelete = ref(null);
const dataTableRef = ref(null);

const columns = [
    { data: 'id', title: 'ID', orderable: true },
    { data: 'name', title: 'Name', orderable: true },
    { data: 'slug', title: 'Slug', orderable: true },
    { data: 'description', title: 'Description', orderable: true },
    {
        data: 'parent_id',
        title: 'Parent Category',
        render: (data) => data ? `Category ${data}` : 'No parent category',
        orderable: true
    },
    {
        data: 'status',
        title: 'Status',
        render: (data) => `<span class="badge ${data === 'active' ? 'bg-success' : 'bg-danger'}">${data}</span>`,
        orderable: true
    },
    { data: 'created_at', title: 'Created At', render: (data) => formatDateTime(data), orderable: true },
    {
        data: null,
        render: '#action',
        title: 'Action',
        orderable: false
    },
];

const options = {
    scrollX: true,
    serverSide: true,
    processing: true,
    ordering: true,
    paging: true,
    searching: true,
    ajax: async (data, callback) =>
    {
        try
        {
            const params = {
                draw: data.draw,
                start: data.start,
                length: data.length,
                search: data.search,
                order: data.order.map(order => ({
                    column: data.columns[order.column].data,
                    dir: order.dir
                }))
            };

            await productCategoryStore.fetchProductCategories(params);
            const rawData = toRaw(productCategoryStore.productCategories);

            callback({
                data: rawData.data,
                draw: rawData.draw,
                recordsTotal: rawData.recordsTotal,
                recordsFiltered: rawData.recordsFiltered,
                order: data.order
            });
        } catch (error)
        {
            console.error('Error fetching product categories:', error);
        }
    }
};

function editProductCategory(category)
{
    productCategoryStore.setSelectedProductCategory(category.rowData);
    router.push({ name: 'admin.productCategories.edit', params: { id: category.rowData.id } });
}

const openDeleteModal = (category) =>
{
    productCategoryToDelete.value = category?.rowData?.id;
    showDeleteModal.value = true;
};

const handleDelete = async () =>
{
    if (!productCategoryToDelete.value) return;

    try
    {
        await productCategoryStore.deleteProductCategory(productCategoryToDelete.value);
        dataTableRef.value.dt.ajax.reload();
        showDeleteModal.value = false;
        productCategoryToDelete.value = null;
    } catch (error)
    {
        console.error('Error deleting product category:', error);
    }
};

</script>

<style scoped></style>
