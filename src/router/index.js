import { createRouter, createWebHistory } from 'vue-router'
import StartView from '../views/StartView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL),
    routes: [{
            path: '/',
            name: 'start',
            component: StartView,
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () =>
                import ('../views/DashboardView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/camera',
            name: 'camera',
            component: () =>
                import ('../views/CameraManagementView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/monitor',
            name: 'monitor',
            component: () =>
                import ('../views/MonitorView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/about',
            name: 'about',
            component: () =>
                import ('../views/AboutView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/notification-settings',
            name: 'notification-settings',
            component: () =>
                import ('../views/NotificationSettingsView.vue'),
            meta: { requiresAuth: true },
        },
        // เพิ่มเส้นทางสำหรับหน้า 404
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () =>
                import ('../views/NotFoundView.vue'),
        },
    ],
})

// ตรวจสอบการล็อกอินก่อนเข้าหน้าที่ต้องการสิทธิ์
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
        next('/')
    } else {
        next()
    }
})

export default router
