<template>
  <div class="login-box">
    <div class="login-logo">
      <router-link :to="{ name: 'admin.login' }">
        <b>Admin</b>LTE
      </router-link>
    </div>
    <!-- /.login-logo -->
    <div class="login-box-body">
      <p class="login-box-msg">Sign in to start your session</p>

      <form @submit.prevent="login">
        <div class="form-group has-feedback">
          <Field name="email" type="email" class="form-control" placeholder="Email" />
          <ErrorMessage name="email" class="text-danger" />
          <span class="glyphicon glyphicon-envelope form-control-feedback"></span>
        </div>
        <div class="form-group has-feedback">
          <Field name="password" type="password" class="form-control" placeholder="Password" />
          <ErrorMessage name="password" class="text-danger" />
          <span class="glyphicon glyphicon-lock form-control-feedback"></span>
        </div>
        <div class="row">
          <div class="col-xs-12">
            <button type="submit" class="btn btn-primary btn-block btn-flat" :disabled="isSubmitting">Sign In</button>
          </div>
          <!-- /.col -->
        </div>
      </form>
    </div>
    <!-- /.login-box-body -->
  </div>
</template>

<script setup>
/* Import AdminLTE and Bootstrap CSS */
import '@/assets/admin/bower_components/bootstrap/dist/css/bootstrap.min.css'
import '@/assets/admin/dist/css/AdminLTE.min.css'
import '@/assets/admin/bower_components/jquery/dist/jquery.min.js'
import '@/assets/admin/bower_components/bootstrap/dist/js/bootstrap.min.js'

import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore'; // For Pinia
import { Field, ErrorMessage, useForm } from 'vee-validate';
import * as yup from 'yup';

// Router instance
const router = useRouter();
// Auth store instance
const authStore = useAuthStore();

// Validation Schema
const loginSchema = yup.object({
  email: yup.string().required('Email is required').email('Must be a valid email'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: loginSchema,
  initialValues: {
    email: "admin@example.com",
    password: "12345678Vv"
  }
});

// Login function
const login = handleSubmit(async (values) =>
{
  await authStore.login(values);
  router.push({ name: 'admin.dashboard' });

});

// Add classes to <body> on mount
onMounted(() =>
{
  document.body.classList.add('hold-transition', 'login-page');
});

// Remove classes from <body> on unmount
onUnmounted(() =>
{
  document.body.classList.remove('hold-transition', 'login-page');
});
</script>
