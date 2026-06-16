import { AppRouteRecord } from '@/types/router'
import { Permissions } from '@/domain/constants/permissions'

export const reportingRoutes: AppRouteRecord = {
  path: '/reporting',
  name: 'Reporting',
  component: '/index/index',
  meta: {
    title: 'Thống kê & Báo cáo',
    icon: 'ri:bar-chart-grouped-line',
    permission: Permissions.StatisticalView,
  },
  children: [
    {
      path: 'executive-dashboard',
      name: 'ExecutiveDashboard',
      component: '/analytics-reporting/dashboard',
      meta: {
        title: 'Tổng quan điều hành',
        icon: 'ri:dashboard-line',
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: 'sales',
      name: 'SalesAnalytics',
      component: '/analytics-reporting/revenue',
      meta: {
        title: 'Báo cáo bán hàng',
        icon: 'ri:money-cny-circle-line',
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: 'financial',
      name: 'FinancialAnalytics',
      component: '/analytics-reporting/financial',
      meta: {
        title: 'Báo cáo tài chính',
        icon: 'ri:file-chart-line',
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: 'financing',
      name: 'FinancingAnalytics',
      component: '/analytics-reporting/financing',
      meta: {
        title: 'Báo cáo trả góp',
        icon: 'ri:bank-line',
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: 'inventory',
      name: 'InventoryAnalytics',
      component: '/analytics-reporting/inventory',
      meta: {
        title: 'Báo cáo tồn kho',
        icon: 'ri:archive-line',
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: 'workshop',
      name: 'WorkshopAnalytics',
      component: '/analytics-reporting/workshop',
      meta: {
        title: 'Báo cáo xưởng dịch vụ',
        icon: 'ri:tools-line',
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: 'customer',
      name: 'CustomerAnalytics',
      component: '/analytics-reporting/customer',
      meta: {
        title: 'Báo cáo khách hàng',
        icon: 'ri:user-heart-line',
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: 'hr-commission',
      name: 'HRCommissionAnalytics',
      component: '/analytics-reporting/employee',
      meta: {
        title: 'Báo cáo nhân sự & hoa hồng',
        icon: 'ri:team-line',
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: 'customer-service',
      name: 'CustomerServiceAnalytics',
      component: '/analytics-reporting/customer-service',
      meta: {
        title: 'Báo cáo chăm sóc khách hàng',
        icon: 'ri:customer-service-2-line',
        permission: Permissions.StatisticalView,
      },
    },
  ],
}

// Removed default export
