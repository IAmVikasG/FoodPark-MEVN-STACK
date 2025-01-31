<template>
    <div class="row">
        <div class="col-sm-6">
                Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} entries
        </div>

        <div class="col-sm-6 text-right">
            <ul class="pagination">
                <li class="paginate_button previous" :class="{ disabled: currentPage === 1 }">
                    <a href="#" @click.prevent="handlePageChange(currentPage - 1)">Previous</a>
                </li>

                <li v-for="page in pages" :key="page" class="paginate_button"
                    :class="{ active: page === currentPage }">
                    <a href="#" @click.prevent="handlePageChange(page)">{{ page }}</a>
                </li>

                <li class="paginate_button next" :class="{ disabled: currentPage === totalPages }">
                    <a href="#" @click.prevent="handlePageChange(currentPage + 1)">Next</a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    currentPage: Number,
    perPage: Number,
    total: Number,
    maxVisiblePages: {
        type: Number,
        default: 5
    }
});

const emit = defineEmits(['pageChangeFn']);

const totalPages = computed(() => Math.ceil(props.total / props.perPage));
const pages = computed(() =>
{
    const range = [];
    let start = Math.max(1, props.currentPage - Math.floor(props.maxVisiblePages / 2));
    const end = Math.min(start + props.maxVisiblePages - 1, totalPages.value);

    if (end - start < props.maxVisiblePages - 1)
    {
        start = Math.max(1, end - props.maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++)
    {
        range.push(i);
    }
    return range;
});

const pagination = computed(() => ({
    from: (props.currentPage - 1) * props.perPage + 1,
    to: Math.min(props.currentPage * props.perPage, props.total),
    total: props.total
}));

function handlePageChange(page)
{
    if (page >= 1 && page <= totalPages.value)
    {
        emit('pageChangeFn', page);
    }
}
</script>
