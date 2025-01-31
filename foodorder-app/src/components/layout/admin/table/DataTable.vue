<template>
    <div class="row">
        <div class="col-sm-12">
            <table class="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th v-for="column in columns" :key="column.key" :class="sortClasses(column)"
                            @click="column.sortable ? $emit('sortFn', column.key) : null" role="columnheader"
                            :aria-sort="ariaSort(column)" style="cursor: pointer">
                            {{ column.label }}
                            <span v-if="column.sortable" class="sort-indicator">
                                {{ sortIndicator(column) }}
                            </span>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(item, index) in data" :key="index">
                        <td v-for="column in columns" :key="column.key">
                            <slot :name="column.key" :data="item">
                                {{ item[column.key] }}
                            </slot>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    columns: Array,
    data: Array,
    sortKey: String,
    sortDirection: String
});

defineEmits(['sortFn']);

// Helper methods
const sortClasses = (column) => ({
    'sorting_asc': column.sortable && props.sortKey === column.key && props.sortDirection === 'asc',
    'sorting_desc': column.sortable && props.sortKey === column.key && props.sortDirection === 'desc',
    'sorting': column.sortable && props.sortKey !== column.key
});

const ariaSort = (column) =>
{
    if (!column.sortable) return null;
    return props.sortKey === column.key ? (props.sortDirection === 'asc' ? 'ascending' : 'descending') : 'none';
};

const sortIndicator = (column) =>
{
    if (props.sortKey !== column.key) return '⇅';
    return props.sortDirection === 'asc' ? '↑' : '↓';
};
</script>
