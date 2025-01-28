<template>
    <div class="wrapper">
      <AppHeader />
      <AppSidebar />
      <AppContent :title="title" :subtitle="subtitle" :activePage="activePage">
        <slot></slot>
      </AppContent>
    <AppFooter />
</div>
</template >

<script setup>
/* Import AdminLTE and Bootstrap CSS */
import '@/assets/admin/bower_components/bootstrap/dist/css/bootstrap.min.css';
import '@/assets/admin/bower_components/font-awesome/css/font-awesome.min.css';
import '@/assets/admin/bower_components/Ionicons/css/ionicons.min.css';
import '@/assets/admin/dist/css/AdminLTE.min.css';
import '@/assets/admin/dist/css/skins/_all-skins.min.css';
import '@/assets/admin/bower_components/jquery/dist/jquery.min.js';
import '@/assets/admin/bower_components/bootstrap/dist/js/bootstrap.min.js';
import '@/assets/admin/bower_components/jquery-slimscroll/jquery.slimscroll.min.js';
import '@/assets/admin/bower_components/fastclick/lib/fastclick.js';
import '@/assets/admin/dist/js/adminlte.min.js';
import '@/assets/admin/dist/js/demo.js';

import { onMounted, onUnmounted } from 'vue';
import AppHeader from '@/components/layout/admin/AppHeader.vue';
import AppSidebar from '@/components/layout/admin/AppSidebar.vue';
import AppContent from '@/components/layout/admin/AppContent.vue';
import AppFooter from '@/components/layout/admin/AppFooter.vue';

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  activePage: {
    type: String,
    required: true
  },
});

// Add classes to <body> on mount
onMounted(() =>
{
  document.body.classList.add('hold-transition', 'skin-blue', 'sidebar-mini');
});

// Remove classes from <body> on unmount
onUnmounted(() =>
{
  document.body.classList.remove('hold-transition', 'skin-blue', 'sidebar-mini');
});

</script>

<style scoped>
/* Add custom styles if needed */
</style>
