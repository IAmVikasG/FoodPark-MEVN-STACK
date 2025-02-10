<template>
    <AdminLayout title="Create/Edit Product Category" subtitle="Create or edit a product category"
        activePage="Product Categories">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">{{ isEditing ? 'Edit Product Category' : 'Create Product Category' }}</h3>
            </div>
            <div class="box-body">
                <form @submit.prevent="saveProductCategory">
                    <div class="form-group">
                        <label>Name</label>
                        <Field name="name" type="text" class="form-control" />
                        <ErrorMessage name="name" class="text-danger" />
                    </div>
                    <div class="form-group">
                        <label>Slug</label>
                        <Field name="slug" type="text" class="form-control" />
                        <ErrorMessage name="slug" class="text-danger" />
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <Field name="description" type="textarea" class="form-control" />
                        <ErrorMessage name="description" class="text-danger" />
                    </div>
                    <div class="form-group">
                        <label>Parent Category</label>
                        <Field name="parent_id" as="select" class="form-control">
                            <option value="null">Select Parent Category</option>
                            <!-- You need to populate this with your categories data -->
                            <option v-for="p_category in parentCategories" :value="p_category.id">{{ p_category.name }}</option>
                        </Field>
                        <ErrorMessage name="parent_id" class="text-danger" />
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <Field name="status" as="select" class="form-control">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </Field>
                        <ErrorMessage name="status" class="text-danger" />
                    </div>
                    <button type="submit" class="btn btn-primary">{{ isEditing ? 'Update Product Category' : 'Create Product Category'
                    }}</button>
                </form>
            </div>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProductCategoryStore } from '@/store/productCategoryStore';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { Field, ErrorMessage, useForm } from 'vee-validate';
import * as yup from 'yup';
import { useRoute } from 'vue-router';

const productCategoryStore = useProductCategoryStore();
const route = useRoute();
const isEditing = ref(false);
const categoryID = ref(null);
const parentCategories = ref(null);

const { handleSubmit, resetForm, setFieldValue } = useForm({
    validationSchema: yup.object({
        name: yup.string().required('Name is required').min(3).max(20),
        slug: yup.string().required('Slug is required').min(3).max(20),
        description: yup.string().required('Description is required').min(10).max(100),
        // parent_id: yup.string().optional('Parent Category is required'),
        status: yup.string().required('Status is required'),
    }),
    initialValues: {
        name: '',
        slug: '',
        description: '',
        parent_id: '',
        status: 'active',
    }
});

onMounted(async () =>
{
    parentCategories.value = await productCategoryStore.fetchParentCategories()

    if (route.name === 'admin.productCategories.edit')
    {
        isEditing.value = true;
        categoryID.value = route.params.id;

        const category = productCategoryStore.selectedProductCategory;
        if (category)
        {
            populateForm(category);
        }
    }
});

function populateForm(category)
{
    setFieldValue('name', category.name);
    setFieldValue('slug', category.slug);
    setFieldValue('description', category.description);
    setFieldValue('parent_id', category.parent_id);
    setFieldValue('status', category.status);
}

const saveProductCategory = handleSubmit(async (formValues) =>
{
    if (isEditing.value)
    {
        await productCategoryStore.updateProductCategory(categoryID.value, formValues);
    } else
    {
        if (formValues.parent_id == '' || formValues.parent_id == 'null') {
            formValues.parent_id = null;
        }

        await productCategoryStore.createProductCategory(formValues);
        resetForm();
    }
});
</script>
