import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/authStore';

const routes = [
    {
        path: '/admin',
        meta: { requiresAuth: true, requiresAdminOrVendor: true },
        children: [
            {
                path: 'dashboard',
                name: 'admin.dashboard',
                component: () => import('@/views/admin/Dashboard.vue'),
            },
            {
                path: 'roles',
                name: 'admin.roles.index',
                component: () => import('@/views/admin/roles/Index.vue'),
            },
            {
                path: 'permissions',
                name: 'admin.permissions.index',
                component: () => import('@/views/admin/permissions/Index.vue'),
            },
            {
                path: 'coupons',
                name: 'admin.coupons.index',
                component: () => import('@/views/admin/coupons/Index.vue'),
            },
            {
                path: 'coupons/create',
                name: 'admin.coupons.create',
                component: () => import('@/views/admin/coupons/Create.vue'),
            },
            {
                path: 'coupons/:id/edit',
                name: 'admin.coupons.edit',
                component: () => import('@/views/admin/coupons/Create.vue'),
            },
            {
                path: 'sliders',
                name: 'admin.sliders.index',
                component: () => import('@/views/admin/sliders/Index.vue'),
            },
            {
                path: 'sliders/create',
                name: 'admin.sliders.create',
                component: () => import('@/views/admin/sliders/Create.vue'),
            },
            {
                path: 'sliders/:id/edit',
                name: 'admin.sliders.edit',
                component: () => import('@/views/admin/sliders/Create.vue'),
            },
            {
                path: 'products',
                name: 'admin.products.index',
                component: () => import('@/views/admin/products/Index.vue'),
            },
            {
                path: 'products/create',
                name: 'admin.products.create',
                component: () => import('@/views/admin/products/Create.vue'),
            },
            {
                path: 'products/:id/edit',
                name: 'admin.products.edit',
                component: () => import('@/views/admin/products/Create.vue'),
            },
            {
                path: 'product-categories',
                name: 'admin.productCategories.index',
                component: () => import('@/views/admin/productCategories/Index.vue'),
            },
            {
                path: 'product-categories/create',
                name: 'admin.productCategories.create',
                component: () => import('@/views/admin/productCategories/Create.vue'),
            },
            {
                path: 'product-categories/:id/edit',
                name: 'admin.productCategories.edit',
                component: () => import('@/views/admin/productCategories/Create.vue'),
            },
        ],
    },
    {
        path: '/admin/login',
        name: 'admin.login',
        component: () => import('@/views/admin/auth/Login.vue'),
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue'),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from, next) =>
{
    const authStore = useAuthStore();
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresAdminOrVendor = to.matched.some(record => record.meta.requiresAdminOrVendor);

    // Handle the login route
    if (to.name === 'admin.login')
    {
        if (authStore.accessToken)
        {
            return next({ name: 'admin.dashboard' });
        }
        return next();
    }

    if (!requiresAuth)
    {
        return next(); // No auth required
    }

    // Fetch user info if only refreshToken is available
    if (!authStore.user && authStore.refreshToken)
    {
        await authStore.fetchUserInfo();
    }

    // Handle Admin or Vendor role-based access
    if (requiresAdminOrVendor)
    {
        const roles = authStore.user?.roles || [];
        if (!roles.includes('admin') && !roles.includes('vendor'))
        {
            await authStore.logout();
            return next({ name: 'admin.login' });
        }
    }

    next();
});


export default router;
