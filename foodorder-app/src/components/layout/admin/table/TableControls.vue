<template>
    <div class="row">
        <div class="col-sm-6">
            <label>
                Show
                <select class="form-control input-sm" v-model="perPage"
                    @change="$emit('perPageFn', parseInt($event.target.value, 10))">
                    <option v-for="option in perPageOptions" :key="option" :value="option">
                        {{ option }}
                    </option>
                </select>
                entries
            </label>
        </div>

        <div class="col-sm-6 text-right">
            <label>
                Search:
                <input type="search" class="form-control input-sm" placeholder=""
                    v-model.trim.lazy="search">
            </label>
        </div>
    </div>
</template>

<script setup>
const search = defineModel('searchBoxInputValue');
const perPage = defineModel('perPageValue');

defineProps({
    perPageOptions: {
        type: Array,
        default: () => [10, 20, 50, 100]
    }
});

defineEmits(['perPageFn']);
</script>
