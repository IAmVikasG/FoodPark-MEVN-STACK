<template>
    <AdminLayout title="Create/Edit Slider" subtitle="Create or edit a slider" activePage="Slider">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">{{ isEditing ? 'Edit Slider' : 'Create Slider' }}</h3>
            </div>
            <div class="box-body">
                <form @submit.prevent="saveSlider">
                    <div class="form-group">
                        <label>Offer</label>
                        <Field name="offer" type="text" class="form-control" />
                        <ErrorMessage name="offer" class="text-danger" />
                    </div>
                    <div class="form-group">
                        <label>Title</label>
                        <Field name="title" type="text" class="form-control" />
                        <ErrorMessage name="title" class="text-danger" />
                    </div>
                    <div class="form-group">
                        <label>Subtitle</label>
                        <Field name="subtitle" type="text" class="form-control" />
                        <ErrorMessage name="subtitle" class="text-danger" />
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <Field name="description" type="textarea" class="form-control" />
                        <ErrorMessage name="description" class="text-danger" />
                    </div>
                    <div class="form-group">
                        <label>Button Link</label>
                        <Field name="button_link" type="url" class="form-control" />
                        <ErrorMessage name="button_link" class="text-danger" />
                    </div>
                    <div class="form-group">
                        <label>Image</label>
                        <input type="file" @change="handleImageChange" class="form-control" />
                        <ErrorMessage name="image" class="text-danger" />
                        <div v-if="imagePreview" class="image-preview mt-2">
                            <img :src="imagePreview" alt="Offer Image" width="100" height="100" />
                            <button type="button" class="btn btn-danger mt-2" @click="removeImage">Remove</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <Field name="status" as="select" class="form-control">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </Field>
                        <ErrorMessage name="status" class="text-danger" />
                    </div>
                    <button type="submit" class="btn btn-primary">{{ isEditing ? 'Update Slider' : 'Create Slider'
                        }}</button>
                </form>
            </div>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSliderStore } from '@/store/sliderStore';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { Field, ErrorMessage, useForm } from 'vee-validate';
import * as yup from 'yup';
import { useRoute } from 'vue-router';

const sliderStore = useSliderStore();
const route = useRoute();
const isEditing = ref(false);
const offerId = ref(null);
const imageFile = ref(null);
const imagePreview = ref(null);

const { handleSubmit, resetForm, setFieldValue } = useForm({
    validationSchema: yup.object({
        offer: yup.string().required('Offer is required').min(3).max(20),
        title: yup.string().required('Title is required').min(3).max(20),
        subtitle: yup.string().required('Subtitle is required').min(3).max(20),
        description: yup.string().required('Description is required').min(10).max(100),
        button_link: yup.string().required('Button Link is required').min(5).max(50),
        status: yup.string().required('Status is required'),
    }),
    initialValues: {
        offer: '',
        title: '',
        subtitle: '',
        description: '',
        button_link: '',
        status: 'active',
    }
});

onMounted(async () =>
{
    if (route.name === 'admin.sliders.edit')
    {
        isEditing.value = true;
        offerId.value = route.params.id;

        const coupon = sliderStore.selectedSlider;
        if (coupon)
        {
            populateForm(coupon);
        }
    }
});

function populateForm(offer)
{
    setFieldValue('offer', offer.offer);
    setFieldValue('title', offer.title);
    setFieldValue('subtitle', offer.subtitle);
    setFieldValue('description', offer.description);
    setFieldValue('button_link', offer.button_link);
    setFieldValue('status', offer.status);
    imagePreview.value = offer.images; // Assuming backend provides image URL
}

const handleImageChange = (event) =>
{
    const file = event.target.files[0];
    if (file)
    {
        imageFile.value = file;
        const reader = new FileReader();
        reader.onload = () =>
        {
            imagePreview.value = reader.result;
        };
        reader.readAsDataURL(file);
    }
};

const removeImage = () =>
{
    imageFile.value = null;
    imagePreview.value = null;
};

const saveSlider = handleSubmit(async (formValues) =>
{
    const formData = new FormData();
    for (const key in formValues)
    {
        formData.append(key, formValues[key]);
    }

    if (imageFile.value)
    {
        formData.append('image', imageFile.value);
    }

    if (isEditing.value)
    {
        await sliderStore.updateSlider(offerId.value, formData);
    } else
    {
        await sliderStore.createSlider(formData);
        resetForm();
        removeImage();
        imageFile.value = null;
    }
});
</script>

<style scoped>
.image-preview img {
    margin-right: 10px;
    border: 1px solid #ddd;
}
</style>
