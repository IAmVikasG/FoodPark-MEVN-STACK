<template>
  <aside class="main-sidebar">
    <section class="sidebar">
      <!-- User Panel -->
      <div class="user-panel">
        <div class="pull-left image">
          <img :src="userImage" class="img-circle" alt="User Image">
        </div>
        <div class="pull-left info">
          <p>Alexander Pierce</p>
          <a href="#"><i class="fa fa-circle text-success"></i> Online</a>
        </div>
      </div>
      <!-- Search Form -->
      <form action="#" method="get" class="sidebar-form">
        <div class="input-group">
          <input type="text" name="q" class="form-control" placeholder="Search...">
          <span class="input-group-btn">
            <button type="submit" name="search" id="search-btn" class="btn btn-flat">
              <i class="fa fa-search"></i>
            </button>
          </span>
        </div>
      </form>
      <!-- Sidebar Menu -->
      <ul class="sidebar-menu tree" data-widget="tree">
        <li class="header">MAIN NAVIGATION</li>
        <li>
          <router-link :to="{ name: 'admin.dashboard' }">
            <i class="fa fa-dashboard"></i> <span>Dashboard</span>
          </router-link>
        </li>
        <!-- Add more menu items here -->
      </ul>
    </section>
  </aside>
</template>

<script setup>
import userImage from '@/assets/admin/dist/img/user2-160x160.jpg';
</script>

<style scoped>
/* Add custom styles if needed */
</style>
