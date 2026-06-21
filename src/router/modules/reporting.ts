import { AppRouteRecord } from '@/types/router'
import { Permissions } from '@/domain/constants/permissions'

export const reportingRoutes: AppRouteRecord = {
  path: '/reporting',
  name: 'Reporting',
  component: '/index/index',
  meta: {
    title: 'Thá»‘ng kÃª & BÃ¡o cÃ¡o',
    icon: 'ri:bar-chart-grouped-line',
    permission: Permissions.StatisticalView,
  },
  children: [
    {
      path: 'executive-dashboard',
      name: 'ExecutiveDashboard',
      component: '/Accountant/view/dashboard/index',
      meta: {
        title: 'Tá»•ng quan Ä‘iá»u hÃ nh',
        icon: 'ri:dashboard-line',
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: 'sales',
      name: 'SalesAnalytics',
      component: '/Accountant/view/revenue/index',
      meta: {
        title: 'BÃ¡o cÃ¡o bÃ¡n hÃ ng',
        icon: 'ri:money-cny-circle-line',
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: 'financial',
      name: 'FinancialAnalytics',
      component: '/Accountant/view/financial/index',
      meta: {
        title: 'BÃ¡o cÃ¡o tÃ i chÃ­nh',
        icon: 'ri:file-chart-line',
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: 'financing',
      name: 'FinancingAnalytics',
      component: '/Accountant/view/financing/index',
      meta: {
        title: 'BÃ¡o cÃ¡o tráº£ gÃ³p',
        icon: 'ri:bank-line',
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: 'inventory',
      name: 'InventoryAnalytics',
      component: '/Accountant/view/inventory/index',
      meta: {
        title: 'BÃ¡o cÃ¡o tá»“n kho',
        icon: 'ri:archive-line',
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: 'workshop',
      name: 'WorkshopAnalytics',
      component: '/Accountant/view/workshop/index',
      meta: {
        title: 'BÃ¡o cÃ¡o xÆ°á»Ÿng dá»‹ch vá»¥',
        icon: 'ri:tools-line',
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: 'customer',
      name: 'CustomerAnalytics',
      component: '/Accountant/view/customer/index',
      meta: {
        title: 'BÃ¡o cÃ¡o khÃ¡ch hÃ ng',
        icon: 'ri:user-heart-line',
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: 'hr-commission',
      name: 'HRCommissionAnalytics',
      component: '/Accountant/view/employee/index',
      meta: {
        title: 'BÃ¡o cÃ¡o nhÃ¢n sá»± & hoa há»“ng',
        icon: 'ri:team-line',
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: 'customer-service',
      name: 'CustomerServiceAnalytics',
      component: '/Accountant/view/customer-service/index',
      meta: {
        title: 'BÃ¡o cÃ¡o chÄƒm sÃ³c khÃ¡ch hÃ ng',
        icon: 'ri:customer-service-2-line',
        permission: Permissions.StatisticalView,
      },
    },
  ],
}

// Removed default export
