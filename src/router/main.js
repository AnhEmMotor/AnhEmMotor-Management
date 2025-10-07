import { createRouter, createWebHistory } from 'vue-router'
import TheHome from '@/views/TheHome.vue'
import OrdersManager from '@/views/OrdersManager.vue'
import CustomerManager from '@/views/CustomerManager.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'home',
      path: '/',
      component: TheHome,
    },
    {
      name: 'product-manager',
      path: '/orders',
      component: OrdersManager,
    },
    {
      name: 'customer-manager',
      path: '/customers',
      component: CustomerManager,
    },
  ],
})

export default router
