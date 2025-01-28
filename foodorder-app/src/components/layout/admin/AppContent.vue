<template>
  <div class="content-wrapper">
    <!-- Content Header -->
    <section class="content-header">
      <h1>
        {{ title }}
        <small>{{ subtitle }}</small>
      </h1>
      <ol class="breadcrumb">
        <li><a href="#"><i class="fa fa-dashboard"></i> Home</a></li>
        <li class="active">{{ activePage }}</li>
      </ol>
    </section>

    <!-- Main Content -->
    <section class="content">
      <slot></slot>
    </section>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Blank Page',
  },
  subtitle: {
    type: String,
    default: 'it all starts here',
  },
  activePage: {
    type: String,
    default: 'Blank page',
  },
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
