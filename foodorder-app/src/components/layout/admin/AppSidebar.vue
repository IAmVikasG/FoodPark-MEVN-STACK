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
        <li :class="{ active: isActive('admin.dashboard') }">
          <router-link :to="{ name: 'admin.dashboard' }">
            <i class="fa fa-dashboard"></i> <span>Dashboard</span>
          </router-link>
        </li>
        <li class="treeview"
          :class="{ active: isTreeviewActive(['admin.roles.index', 'admin.permissions.index', 'admin.users.index']) }">
          <a href="#">
            <i class="fa fa-users"></i>
            <span>User Management</span>
            <span class="pull-right-container">
              <i class="fa fa-angle-left pull-right"></i>
            </span>
          </a>
          <ul class="treeview-menu">
            <li :class="{ active: isActive('admin.roles.index') }">
              <router-link :to="{ name: 'admin.roles.index' }">
                <i class="fa fa-circle-o"></i> Roles
              </router-link>
            </li>
            <li :class="{ active: isActive('admin.permissions.index') }">
              <router-link :to="{ name: 'admin.permissions.index' }">
                <i class="fa fa-circle-o"></i> Permissions
              </router-link>
            </li>
          </ul>
        </li>
        <li class="treeview"
          :class="{ active: isTreeviewActive(['admin.coupons.index', 'admin.coupons.create', 'admin.coupons.edit']) }">
          <a href="#">
            <i class="fa fa-gift"></i>
            <span>Coupon Management</span>
            <span class="pull-right-container">
              <i class="fa fa-angle-left pull-right"></i>
            </span>
          </a>
          <ul class="treeview-menu">
            <li :class="{ active: isActive('admin.coupons.index') }">
              <router-link :to="{ name: 'admin.coupons.index' }">
                <i class="fa fa-circle-o"></i> Coupons
              </router-link>
            </li>
            <li :class="{ active: isActive('admin.coupons.create') || isActive('admin.coupons.edit') }">
              <router-link
                :to="{ name: editingId ? 'admin.coupons.edit' : 'admin.coupons.create', params: editingId ? { id: editingId } : {} }">
                <i class="fa fa-circle-o"></i> {{ editingId ? 'Edit Coupon' : 'Create Coupon' }}
              </router-link>
            </li>
          </ul>
        </li>
        <li class="treeview"
          :class="{ active: isTreeviewActive(['admin.sliders.index', 'admin.sliders.create', 'admin.sliders.edit']) }">
          <a href="#">
            <i class="fa fa-gift"></i>
            <span>Slider Management</span>
            <span class="pull-right-container">
              <i class="fa fa-angle-left pull-right"></i>
            </span>
          </a>
          <ul class="treeview-menu">
            <li :class="{ active: isActive('admin.sliders.index') }">
              <router-link :to="{ name: 'admin.sliders.index' }">
                <i class="fa fa-circle-o"></i> Sliders
              </router-link>
            </li>
            <li :class="{ active: isActive('admin.sliders.create') || isActive('admin.sliders.edit') }">
              <router-link
                :to="{ name: editingId ? 'admin.sliders.edit' : 'admin.sliders.create', params: editingId ? { id: editingId } : {} }">
                <i class="fa fa-circle-o"></i> {{ editingId ? 'Edit Slider' : 'Create Slider' }}
              </router-link>
            </li>
          </ul>
        </li>
        <li class="treeview"
          :class="{ active: isTreeviewActive(['admin.products.index', 'admin.products.create', 'admin.products.edit', 'admin.productCategories.index', 'admin.productCategories.create', 'admin.productCategories.edit']) }">
          <a href="#">
            <i class="fa fa-shopping-bag"></i>
            <span>Product Management</span>
            <span class="pull-right-container">
              <i class="fa fa-angle-left pull-right"></i>
            </span>
          </a>
          <ul class="treeview-menu">
            <li class="treeview"
              :class="{ active: isTreeviewActive(['admin.productCategories.index', 'admin.productCategories.create', 'admin.productCategories.edit']) }">
              <a href="#">
                <i class="fa fa-list"></i>
                <span>Product Categories</span>
                <span class="pull-right-container">
                  <i class="fa fa-angle-left pull-right"></i>
                </span>
              </a>
              <ul class="treeview-menu">
                <li :class="{ active: isActive('admin.productCategories.index') }">
                  <router-link :to="{ name: 'admin.productCategories.index' }">
                    <i class="fa fa-circle-o"></i> Product Categories
                  </router-link>
                </li>
                <li
                  :class="{ active: isActive('admin.productCategories.create') || isActive('admin.productCategories.edit') }">
                  <router-link
                    :to="{ name: editingId ? 'admin.productCategories.edit' : 'admin.productCategories.create', params: editingId ? { id: editingId } : {} }">
                    <i class="fa fa-circle-o"></i> {{ editingId ? 'Edit Product Category' : 'Create Product Category' }}
                  </router-link>
                </li>
              </ul>
            </li>
            <li :class="{ active: isActive('admin.products.index') }">
              <router-link :to="{ name: 'admin.products.index' }">
                <i class="fa fa-circle-o"></i> Products
              </router-link>
            </li>
            <li :class="{ active: isActive('admin.products.create') || isActive('admin.products.edit') }">
              <router-link
                :to="{ name: editingId ? 'admin.products.edit' : 'admin.products.create', params: editingId ? { id: editingId } : {} }">
                <i class="fa fa-circle-o"></i> {{ editingId ? 'Edit Product' : 'Create Product' }}
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </section>
  </aside>
</template>

<script setup>
import userImage from '@/assets/admin/dist/img/user2-160x160.jpg';
import { onMounted } from 'vue';
import useEditingId from '@/composables/useEditingId';
import useRouteHelpers from '@/composables/useRouteHelpers';

const { editingId } = useEditingId(['admin.coupons.edit', 'admin.sliders.edit', 'admin.products.edit', 'admin.productCategories.edit']);
const { isActive, isTreeviewActive } = useRouteHelpers();

onMounted(() =>
{
  $(document).ready(function ()
  {
    $(".sidebar-menu").tree();
  });
});
</script>

<style scoped>
/* Add your custom styles for active links and treeview items */
.router-link-active {
  background-color: #1e282c;
  color: #fff;
}

.treeview.active>a {
  background-color: #1e282c;
  color: #fff;
}

.treeview-menu>li.active>a {
  background-color: #2c3b41;
  color: #fff;
}
</style>
