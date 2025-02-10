<template>
    <AdminLayout title="Slider Management" subtitle="Manage Sliders" activePage="Sliders">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">Sliders</h3>
                <div class="box-tools">
                    <router-link :to="{ name: 'admin.sliders.create' }" class="btn btn-primary btn-sm">
                        Add New Slider
                    </router-link>
                </div>
            </div>

            <!-- Slider List Table -->
            <div class="box-body">
                <DataTable class="display table nowrap" :columns="columns" :options="options" ref="dataTableRef">
                    <template #action="props">
                        <button class="btn btn-sm btn-info mr-2" @click="editSlider(props)">
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
            Are you sure you want to delete this slider?
        </BaseModal>
    </AdminLayout>
</template>

<script setup>
import { ref, toRaw } from 'vue';
import { useSliderStore } from '@/store/sliderStore';
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
const sliderStore = useSliderStore();
const showDeleteModal = ref(false);
const sliderToDelete = ref(null);
const dataTableRef = ref(null);

const columns = [
    { data: 'id', title: 'ID', orderable: true },
    { data: 'offer', title: 'Offer', orderable: true },
    { data: 'title', title: 'Title', orderable: true },
    { data: 'subtitle', title: 'Subtitle', orderable: true },
    { data: 'description', title: 'Description', orderable: true },
    { data: 'button_link', title: 'Button Link', orderable: true },
    {
        data: 'images',
        title: 'Image',
        render: (data) =>
        {
            if (data && data.length > 0)
            {
                return `<img src="${data[0]}" alt="Slider Image" width="100" height="50" />`;
            } else
            {
                return 'No image';
            }
        },
        orderable: false
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

            await sliderStore.fetchSlider(params);
            const rawData = toRaw(sliderStore.sliders);

            callback({
                data: rawData.data,
                draw: rawData.draw,
                recordsTotal: rawData.recordsTotal,
                recordsFiltered: rawData.recordsFiltered,
                order: data.order
            });
        } catch (error)
        {
            console.error('Error fetching sliders:', error);
        }
    }
};

function editSlider(slider)
{
    sliderStore.setSelectedSlider(slider.rowData);
    router.push({ name: 'admin.sliders.edit', params: { id: slider.rowData.id } });
}

const openDeleteModal = (slider) =>
{
    sliderToDelete.value = slider?.rowData?.id;
    showDeleteModal.value = true;
};

const handleDelete = async () =>
{
    if (!sliderToDelete.value) return;

    try
    {
        await sliderStore.deleteSlider(sliderToDelete.value);
        dataTableRef.value.dt.ajax.reload();
        showDeleteModal.value = false;
        sliderToDelete.value = null;
    } catch (error)
    {
        console.error('Error deleting slider:', error);
    }
};

</script>

<style scoped></style>
