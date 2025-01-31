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

    // Handle login route access
    if (to.name === 'admin.login')
    {
        if (authStore.accessToken)
        {
            return next({ name: 'admin.dashboard' });
        }
        return next();
    }

    if (!requiresAuth) return next();

    try
    {
        if (!authStore.user && authStore.refreshToken)
        {
            await authStore.fetchUserInfo();
        }

        if (requiresAdminOrVendor)
        {
            const roles = authStore.user?.roles || [];
            if (!roles.includes('admin') && !roles.includes('vendor'))
            {
                await authStore.logout();
                return next({ name: 'admin.login' });
            }
        }

        return next();
    } catch (error)
    {
        await authStore.logout();
        return next({ name: 'admin.login' });
    }
});

export default router;
