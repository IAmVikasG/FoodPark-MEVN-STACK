import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { jwtDecode } from 'jwt-decode';

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

const checkTokenExpiry = (token) =>
{
    if (!token) return true;
    try
    {
        const decoded = jwtDecode(token);
        return decoded.exp < Date.now() / 1000;
    } catch
    {
        return true;
    }
};

router.beforeEach(async (to, from, next) =>
{
    const authStore = useAuthStore();
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresAdminOrVendor = to.matched.some(record => record.meta.requiresAdminOrVendor);

    // Handle login route access
    if (to.name === 'admin.login')
    {
        if (authStore.accessToken && !checkTokenExpiry(authStore.accessToken))
        {
            return next({ name: 'admin.dashboard' });
        }
        return next();
    }

    if (!requiresAuth) return next();

    try
    {
        const isAccessTokenExpired = checkTokenExpiry(authStore.accessToken);
        const isRefreshTokenExpired = checkTokenExpiry(authStore.refreshToken);

        // Logout if both tokens are expired
        if (isAccessTokenExpired && isRefreshTokenExpired)
        {
            await authStore.logout();
            return next({ name: 'admin.login' });
        }

        // Refresh token if the access token is expired but the refresh token is valid
        if (isAccessTokenExpired)
        {
            await authStore.refreshAccessToken();
        }

        // Fetch user info if not already loaded
        if (!authStore.user)
        {
            await authStore.fetchUserInfo();
        }

        // Check for role-based access
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
