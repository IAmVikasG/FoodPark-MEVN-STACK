<template>
    <AdminLayout title="Coupon Management" subtitle="Manage coupons" activePage="Coupons">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">Coupons</h3>
                <div class="box-tools">
                    <router-link :to="{ name: 'admin.coupons.create' }" class="btn btn-primary btn-sm">
                        Add New Coupon
                    </router-link>
                </div>
            </div>

            <!-- Coupon List Table -->
            <div class="box-body">
                <DataTable class="display table nowrap" :columns="columns" :options="options" ref="dataTableRef">
                    <template #action="props">
                        <button class="btn btn-sm btn-info mr-2" @click="editCoupon(props)">
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
            Are you sure you want to delete this coupon?
        </BaseModal>
    </AdminLayout>
</template>

<script setup>
import { ref, toRaw } from 'vue';
import { useCouponStore } from '@/store/couponStore';
import AdminLayout from '@/layouts/AdminLayout.vue';
import BaseModal from '@/components/layout/admin/modal/BaseModal.vue';
import { useRouter } from 'vue-router';
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net-dt';
import 'datatables.net-select-dt';
import 'datatables.net-responsive-dt';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import { formatDate, formatDateTime } from '@/utils/helpers';

DataTable.use(DataTablesCore);

const router = useRouter();
const couponStore = useCouponStore();
const showDeleteModal = ref(false);
const couponToDelete = ref(null);
const dataTableRef = ref(null);

const columns = [
    { data: 'id', title: 'ID', orderable: true },
    { data: 'name', title: 'Name', orderable: true },
    { data: 'code', title: 'Code', orderable: true },
    { data: 'quantity', title: 'Quantity', orderable: true },
    { data: 'minimum_purchase_price', title: 'Minimum Purchase Price', orderable: true },
    {
        data: 'expiry',
        title: 'Expiry',
        render: (data) => formatDate(data),
        orderable: true
    },
    { data: 'discount_type', title: 'Discount Type', orderable: true },
    { data: 'discount_amount', title: 'Discount Amount', orderable: true },
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
    ordering: true, // Enable column ordering
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

            await couponStore.fetchCoupons(params);
            const rawData = toRaw(couponStore.coupons);

            // Ensure draw is passed if supported by the backend
            callback({
                data: rawData.data,
                draw: rawData.draw,
                recordsTotal: rawData.recordsTotal,
                recordsFiltered: rawData.recordsFiltered,
                order: data.order
            }); // DataTables expects this format
        } catch (error)
        {
            console.error('Error fetching coupons:', error);
        }
    }
};

function editCoupon(coupon)
{
    couponStore.setSelectedCoupon(coupon.rowData); // Save coupon data in the store
    router.push({ name: 'admin.coupons.edit', params: { id: coupon.rowData.id } });
}

const openDeleteModal = (coupon) =>
{
    couponToDelete.value = coupon?.rowData?.id;
    showDeleteModal.value = true;
};

const handleDelete = async () =>
{
    if (!couponToDelete.value) return;

    try
    {
        await couponStore.deleteCoupon(couponToDelete.value);
        dataTableRef.value.dt.ajax.reload();
        showDeleteModal.value = false;
        couponToDelete.value = null;
    } catch (error)
    {
        console.error('Error deleting coupon:', error);
    }
};


</script>

<style scoped>
</style>
