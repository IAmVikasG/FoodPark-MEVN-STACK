import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/authStore';

const routes = [
    {
        path: '/admin',
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
            {
                path: 'dashboard',
                name: 'admin.dashboard',
                component: () => import('@/views/admin/Dashboard.vue'),
                meta: {
                    title: 'Admin Dashboard',
                    description: 'Awesome Description',
                }
            },
        ],
    },
    {
        path: '/admin/login',
        name: 'admin.login',
        component: () => import('@/views/admin/auth/Login.vue'),
        meta: {
            title: 'Admin Login',
            description: 'Admin Login Page'
        }
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
    const { title, description } = to.meta;
    const defaultTitle = 'Food order';
    const defaultDescription = 'Default Description';

    document.title = title || defaultTitle

    const descriptionElement = document.querySelector('head meta[name="description"]')

    descriptionElement.setAttribute('content', description || defaultDescription)

    const authStore = useAuthStore();
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);

    if (requiresAuth && !authStore.isAuthenticated)
    {
        next('/admin/login');
    } else if (requiresAdmin && !authStore.isAdmin)
    {
        next('/admin/login');
    } else
    {
        next();
    }
});

export default router;
