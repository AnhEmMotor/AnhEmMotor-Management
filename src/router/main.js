import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { Permissions } from '@/constants/permissions'
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
const BrandManager = () => import('@/views/BrandManager.vue')
const CategoryManager = () => import('@/views/CategoryManager.vue')
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
      meta: { guest: true, title: 'Đăng nhập' },
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
          meta: { requiresAuth: true, title: 'Trang chủ' },
        },
        {
          name: 'orders-manager',
          path: 'orders',
          component: OrdersManager,
          meta: {
            requiresAuth: true,
            title: 'Quản lý đơn hàng',
            permission: Permissions.OutputsView,
          },
        },
        {
          name: 'customer-manager',
          path: 'customers',
          component: CustomerManager,
          meta: {
            requiresAuth: true,
            title: 'Quản lý khách hàng',
            permission: Permissions.UsersView,
          },
        },
        {
          name: 'product-manager',
          path: 'products',
          component: ProductsManager,
          meta: {
            requiresAuth: true,
            title: 'Quản lý sản phẩm',
            permission: Permissions.ProductsView,
          },
        },
        {
          name: 'report-product',
          path: 'report-product',
          component: ProductReport,
          meta: {
            requiresAuth: true,
            title: 'Báo cáo sản phẩm',
            permission: Permissions.StatisticalView,
          },
        },
        {
          name: 'revenue-analysis',
          path: 'report-revenue',
          component: RevenueAnalysis,
          meta: {
            requiresAuth: true,
            title: 'Báo cáo doanh thu',
            permission: Permissions.StatisticalView,
          },
        },
        {
          name: 'warehouse-report',
          path: 'report-warehouse',
          component: WarehouseReport,
          meta: {
            requiresAuth: true,
            title: 'Báo cáo kho',
            permission: Permissions.StatisticalView,
          },
        },
        {
          name: 'inventory-input',
          path: 'inputs',
          component: InventoryInputManager,
          meta: {
            requiresAuth: true,
            title: 'Quản lý nhập kho',
            permission: Permissions.InputsView,
          },
        },
        {
          name: 'category-manager',
          path: 'categories',
          component: CategoryManager,
          meta: {
            requiresAuth: true,
            title: 'Quản lý thể loại sản phẩm',
            permission: Permissions.ProductCategoriesView,
          },
        },
        {
          name: 'brand-manager',
          path: 'brands',
          component: BrandManager,
          meta: {
            requiresAuth: true,
            title: 'Quản lý thương hiệu',
            permission: Permissions.BrandsView,
          },
        },
        {
          name: 'supplier',
          path: 'suppliers',
          component: SupplierManager,
          meta: {
            requiresAuth: true,
            title: 'Quản lý nhà cung cấp',
            permission: Permissions.SuppliersView,
          },
        },
        {
          name: 'users',
          path: 'users',
          component: UserManager,
          meta: {
            requiresAuth: true,
            title: 'Quản lý người dùng',
            permission: Permissions.UsersView,
          },
        },
        {
          name: 'permissions',
          path: 'permissions',
          component: RolePermissionManager,
          meta: {
            requiresAuth: true,
            title: 'Quyền & Vai trò',
            permission: Permissions.RolesView,
          },
        },
        {
          name: 'price-management',
          path: 'price-management',
          component: PriceManagement,
          meta: {
            requiresAuth: true,
            title: 'Quản lý giá',
            permission: Permissions.ProductsEditPrice,
          },
        },
        {
          name: 'settings',
          path: 'settings',
          component: SettingsView,
          meta: {
            requiresAuth: true,
            title: 'Cài đặt',
            permission: Permissions.SettingsView,
          },
        },
        {
          name: 'user-profile',
          path: 'profile',
          component: UserProfile,
          meta: { requiresAuth: true, title: 'Hồ sơ người dùng' },
        },
      ],
    },
    {
      name: 'not-found',
      path: '/:pathMatch(.*)*',
      component: NotFoundView,
      meta: { title: 'Không tìm thấy trang' },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.initAuth()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    if (to.path === '/') {
      return { name: 'login' }
    }
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const permissions = authStore.user?.permissions || []

  if (to.meta.permission) {
    const hasAccess = permissions.includes(to.meta.permission)
    if (!hasAccess) return '/'
  }

  if (to.meta.permissions) {
    const hasAccess = to.meta.permissions.some((p) => permissions.includes(p))
    if (!hasAccess) return '/'
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    return '/'
  }
})

router.afterEach((to) => {
  const defaultTitle = 'AnhEmMotor'
  if (to.meta.title) {
    document.title = `${defaultTitle} | ${to.meta.title}`
  } else {
    document.title = defaultTitle
  }
})

export default router
