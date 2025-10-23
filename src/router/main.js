import { createRouter, createWebHistory } from 'vue-router'
const TheHome = () => import('@/views/TheHome.vue')
const OrdersManager = () => import('@/views/OrdersManager.vue')
const CustomerManager = () => import('@/views/UserManager.vue')
const ProductsManager = () => import('@/views/ProductsManager.vue')
const ProductReport = () => import('@/views/ProductReport.vue')
const RevenueAnalysis = () => import('@/views/RevenueAnalysis.vue')
const InventoryInputManager = () => import('@/views/InventoryInputManager.vue')
const SupplierManager = () => import('@/views/SupplierManager.vue')
const UserManager = () => import('@/views/UserManager.vue')
const RolePermissionManager = () => import('@/views/RolePermissionManager.vue')
const PriceManagement = () => import('@/views/PriceManagement.vue')
const SettingsView = () => import('@/views/SettingsView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'home',
      path: '/',
      component: TheHome,
    },
    {
      name: 'orders-manager',
      path: '/orders',
      component: OrdersManager,
    },
    {
      name: 'customer-manager',
      path: '/customers',
      component: CustomerManager,
    },
    {
      name: 'product-manager',
      path: '/products',
      component: ProductsManager,
    },
    {
      name: 'report-product',
      path: '/report-product',
      component: ProductReport,
    },
    {
      name: 'revenue-analysis',
      path: '/report-revenue',
      component: RevenueAnalysis,
    },
    {
      name: 'inventory-input',
      path: '/inputs',
      component: InventoryInputManager,
    },
    {
      name: 'supplier',
      path: '/suppliers',
      component: SupplierManager,
    },
    {
      name: 'users',
      path: '/users',
      component: UserManager,
    },
    {
      name: 'permissions',
      path: '/permissions',
      component: RolePermissionManager,
    },
    {
      name: 'price-management',
      path: '/price-management',
      component: PriceManagement,
    },
    {
      name: 'settings',
      path: '/settings',
      component: SettingsView,
    },
  ],
})

export default router
