import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
const DashboardLayout = () => import('@/components/layout/DashboardLayout.vue')
const TheHome = () => import('@/views/TheHome.vue')
const LoginView = () => import('@/views/LoginView.vue')
const OrdersManager = () => import('@/views/OrdersManager.vue')
const CustomerManager = () => import('@/views/UserManager.vue')
const ProductsManager = () => import('@/views/ProductsManager.vue')
const ProductReport = () => import('@/views/ProductReport.vue')
const RevenueAnalysis = () => import('@/views/RevenueAnalysis.vue')
const WarehouseReport = () => import('@/views/WarehouseReport.vue')
const InventoryInputManager = () => import('@/views/InventoryInputManager.vue')
const SupplierManager = () => import('@/views/SupplierManager.vue')
const UserManager = () => import('@/views/UserManager.vue')
const RolePermissionManager = () => import('@/views/RolePermissionManager.vue')
const PriceManagement = () => import('@/views/PriceManagement.vue')
const SettingsView = () => import('@/views/SettingsView.vue')
const UserProfile = () => import('@/views/UserProfile.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'login',
      path: '/login',
      component: LoginView,
      meta: { guest: true },
    },
    {
      path: '/',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          name: 'home',
          path: '',
          component: TheHome,
          meta: { requiresAuth: true },
        },
        {
          name: 'orders-manager',
          path: 'orders',
          component: OrdersManager,
          meta: { requiresAuth: true },
        },
        {
          name: 'customer-manager',
          path: 'customers',
          component: CustomerManager,
          meta: { requiresAuth: true },
        },
        {
          name: 'product-manager',
          path: 'products',
          component: ProductsManager,
          meta: { requiresAuth: true },
        },
        {
          name: 'report-product',
          path: 'report-product',
          component: ProductReport,
          meta: { requiresAuth: true },
        },
        {
          name: 'revenue-analysis',
          path: 'report-revenue',
          component: RevenueAnalysis,
          meta: { requiresAuth: true },
        },
        {
          name: 'warehouse-report',
          path: 'report-warehouse',
          component: WarehouseReport,
          meta: { requiresAuth: true },
        },
        {
          name: 'inventory-input',
          path: 'inputs',
          component: InventoryInputManager,
          meta: { requiresAuth: true },
        },
        {
          name: 'supplier',
          path: 'suppliers',
          component: SupplierManager,
          meta: { requiresAuth: true },
        },
        {
          name: 'users',
          path: 'users',
          component: UserManager,
          meta: { requiresAuth: true },
        },
        {
          name: 'permissions',
          path: 'permissions',
          component: RolePermissionManager,
          meta: { requiresAuth: true },
        },
        {
          name: 'price-management',
          path: 'price-management',
          component: PriceManagement,
          meta: { requiresAuth: true },
        },
        {
          name: 'settings',
          path: 'settings',
          component: SettingsView,
          meta: { requiresAuth: true },
        },
        {
          name: 'user-profile',
          path: 'profile',
          component: UserProfile,
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      name: 'not-found',
      path: '/:pathMatch(.*)*',
      component: NotFoundView,
    },
  ],
})


router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.initAuth()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    if (to.path === '/') {
      return next({ name: 'login' })
    }
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.permission) {
    const user = authStore.user
    const permissions = user?.permissions || []
    const hasAccess = permissions.includes('ADMIN') || permissions.includes(to.meta.permission)
    if (!hasAccess) return next('/')
  }

  if (to.meta.permissions) {
    const user = authStore.user
    const permissions = user?.permissions || []
    const hasAccess =
      permissions.includes('ADMIN') || to.meta.permissions.some((p) => permissions.includes(p))
    if (!hasAccess) return next('/')
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    return next('/')
  }

  next()
})

export default router
