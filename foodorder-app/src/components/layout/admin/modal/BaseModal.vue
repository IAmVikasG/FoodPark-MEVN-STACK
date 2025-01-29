<template>
    <div class="modal fade" :class="{ 'in': modelValue }" v-if="modelValue">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" @click="$emit('update:modelValue', false)">×</button>
                    <h4 class="modal-title">{{ title }}</h4>
                </div>
                <div class="modal-body">
                    <slot></slot>
                </div>
                <div class="modal-footer">
                    <slot name="footer">
                        <button type="button" class="btn btn-default" @click="$emit('update:modelValue', false)">
                            {{ cancelText }}
                        </button>
                        <button type="button" class="btn" :class="confirmButtonClass" :disabled="disabled"
                            @click="$emit('confirm')">
                            {{ confirmText }}
                        </button>
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    confirmText: {
        type: String,
        default: 'Save'
    },
    cancelText: {
        type: String,
        default: 'Cancel'
    },
    confirmButtonClass: {
        type: String,
        default: 'btn-primary'
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

defineEmits(['update:modelValue', 'confirm']);

</script>

<style scoped>
.modal.in {
    display: block;
    background: rgba(0, 0, 0, 0.5);
}
</style>
