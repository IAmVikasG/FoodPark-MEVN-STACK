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
                <div class="form-inline">
                    <TableControls v-model:searchBoxInputValue="searchBox" v-model:perPageValue="perPage"
                        :perPageOptions="[10, 25, 50, 100]" @perPageFn="handlePerPageChange" />

                    <DataTable :columns="columns" :data="couponStore.coupons.data" :sortKey="sortKey"
                        :sortDirection="sortDirection" @sortFn="handleSort" class="table-bordered table-striped">
                        <template #actions="{ data }">
                            <button class="btn btn-sm btn-info mr-2" @click="editCoupon(data)">
                                <i class="fa fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger" @click="openDeleteModal(data)">
                                <i class="fa fa-trash"></i> Delete
                            </button>
                        </template>
                    </DataTable>

                    <PaginationControls :currentPage="currentPage" :perPage="perPage"
                        :total="couponStore.coupons.totalRecords" @pageChangeFn="handlePageChange" />
                </div>
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
import { ref, onMounted, watch } from 'vue';
import { useCouponStore } from '@/store/couponStore';
import AdminLayout from '@/layouts/AdminLayout.vue';
import BaseModal from '@/components/layout/admin/modal/BaseModal.vue';
import DataTable from '@/components/layout/admin/table/DataTable.vue';
import PaginationControls from '@/components/layout/admin/table/PaginationControls.vue';
import TableControls from '@/components/layout/admin/table/TableControls.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const couponStore = useCouponStore();

const couponToDelete = ref(null);
const showDeleteModal = ref(false);

// Table Reactive state
const currentPage = ref(1);
const perPage = ref(10);
const searchBox = ref('');
const sortKey = ref('id');
const sortDirection = ref('asc');

const columns = ref([
    { key: 'id', label: '#', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: true },
    { key: 'minimum_purchase_price', label: 'Minimum Purchase Price', sortable: true },
    { key: 'expiry', label: 'Expiry', sortable: true },
    { key: 'discount_type', label: 'Discount Type', sortable: true },
    { key: 'discount_amount', label: 'Discount Amount', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'created_at', label: 'Created At', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
]);

// Watchers
watch([currentPage, perPage, sortKey, sortDirection], fetchCoupons);
watch(searchBox, (newVal) =>
{
    setTimeout(() =>
    {
        currentPage.value = 1;
        fetchCoupons();
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

async function fetchCoupons()
{
    await couponStore.fetchCoupons({
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
    await fetchCoupons();
});

function editCoupon(coupon)
{
    couponStore.setSelectedCoupon(coupon); // Save coupon data in the store
    router.push({ name: 'admin.coupons.edit', params: { id: coupon.id } });
}

const openDeleteModal = (coupon) =>
{
    couponToDelete.value = coupon;
    showDeleteModal.value = true;
};

// Handle Coupon deletion
const handleDelete = async (coupon) =>
{
    try
    {
        await couponStore.deleteCoupon(couponToDelete.value.id);
        showDeleteModal.value = false;
        couponToDelete.value = null;
        await couponStore.fetchCoupons();
    } catch (error)
    {
        console.error('Error deleting coupon:', error);
    }
};
</script>
