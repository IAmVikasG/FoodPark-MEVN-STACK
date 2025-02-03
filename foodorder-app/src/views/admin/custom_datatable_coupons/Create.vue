<template>
    <AdminLayout title="Create/Edit Coupon" subtitle="Create or edit a coupon" activePage="Coupons">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">{{ isEditing ? 'Edit Coupon' : 'Create Coupon' }}</h3>
            </div>
            <!-- Create/Edit Coupon Form -->
            <div class="box-body">
                <form @submit.prevent="saveCoupon">
                    <div class="form-group">
                        <label>Name</label>
                        <Field name="name" type="text" class="form-control" />
                        <ErrorMessage name="name" class="text-danger" />
                    </div>
                    <div class="form-group">
                        <label>Code</label>
                        <Field name="code" type="text" class="form-control" />
                        <ErrorMessage name="code" class="text-danger" />
                    </div>
                    <div class="form-group">
                        <label>Quantity</label>
                        <Field name="quantity" type="number" class="form-control" />
                        <ErrorMessage name="quantity" class="text-danger" />
                    </div>
                    <div class="form-group">
                        <label>Minimum Purchase Price</label>
                        <Field name="minimum_purchase_price" type="number" class="form-control" />
                        <ErrorMessage name="minimum_purchase_price" class="text-danger" />
                    </div>
                    <div class="form-group">
                        <label>Expiry</label>
                        <Field name="expiry" type="date" class="form-control" />
                        <ErrorMessage name="expiry" class="text-danger" />
                    </div>
                    <div class="form-group">
                        <label>Discount Type</label>
                        <Field name="discount_type" as="select" class="form-control">
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed</option>
                        </Field>
                        <ErrorMessage name="discount_type" class="text-danger" />
                    </div>
                    <div class="form-group">
                        <label>Discount Amount</label>
                        <Field name="discount_amount" type="number" class="form-control" />
                        <ErrorMessage name="discount_amount" class="text-danger" />
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <Field name="status" as="select" class="form-control">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </Field>
                        <ErrorMessage name="status" class="text-danger" />
                    </div>
                    <button type="submit" class="btn btn-primary">{{ isEditing ? 'Update Coupon' : 'Create Coupon'
                        }}</button>
                </form>
            </div>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useCouponStore } from '@/store/couponStore';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { Field, ErrorMessage, useForm } from 'vee-validate';
import * as yup from 'yup';
import { useRoute, useRouter } from 'vue-router';

const couponStore = useCouponStore();
const route = useRoute();
const router = useRouter();
const isEditing = ref(false);
const couponId = ref(null);

const { handleSubmit, values, resetForm, setFieldValue } = useForm({
    validationSchema: yup.object({
        name: yup.string().required('Name is required').min(3).max(20),
        code: yup.string().required('Code is required').min(3).max(20),
        quantity: yup.number().required('Quantity is required').min(1),
        minimum_purchase_price: yup.number().required('Minimum Purchase Price is required').min(1),
        expiry: yup.date().required('Expiry is required'),
        discount_type: yup.string().required('Discount Type is required'),
        discount_amount: yup.number().required('Discount Amount is required').min(1),
        status: yup.string().required('Status is required')
    }),
    initialValues: {
        name: '',
        code: '',
        quantity: 1,
        minimum_purchase_price: 1,
        expiry: '',
        discount_type: 'percentage',
        discount_amount: 1,
        status: 'active'
    }
});

function populateForm(coupon)
{
    setFieldValue('name', coupon.name);
    setFieldValue('code', coupon.code);
    setFieldValue('quantity', coupon.quantity);
    setFieldValue('minimum_purchase_price', coupon.minimum_purchase_price);
    setFieldValue('expiry', coupon.expiry);
    setFieldValue('discount_type', coupon.discount_type);
    setFieldValue('discount_amount', coupon.discount_amount);
    setFieldValue('status', coupon.status);
}

onMounted(async () =>
{
    if (route.name === 'admin.coupons.edit')
    {
        isEditing.value = true;
        couponId.value = route.params.id;

        const coupon = couponStore.selectedCoupon;
        if (coupon)
        {
            populateForm(coupon);
        } else
        {
            console.warn('Coupon not found in store');
        }
    } else
    {
        isEditing.value = false;
        resetForm();
    }
});

const saveCoupon = handleSubmit(async (formValues) =>
{
    try
    {
        if (isEditing.value)
        {
            await couponStore.updateCoupon(couponId.value, formValues);
        } else
        {
            await couponStore.createCoupon(formValues);
        }
        resetForm();
        router.push({ name: 'admin.coupons.index' }); // Redirect after save
    } catch (error)
    {
        console.error('Error saving coupon:', error);
    }
});
</script>
