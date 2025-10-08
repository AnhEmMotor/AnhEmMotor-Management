import { createRouter, createWebHistory } from 'vue-router'
import TheHome from '@/views/TheHome.vue'
import OrdersManager from '@/views/OrdersManager.vue'
import CustomerManager from '@/views/CustomerManager.vue'
import ProductsManager from '@/views/ProductsManager.vue'
import ProductReport from '@/views/ProductReport.vue'
import RevenueAnalysis from '@/views/RevenueAnalysis.vue'

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
      path: '/revenue',
      component: RevenueAnalysis,
    },
  ],
})

export default router
