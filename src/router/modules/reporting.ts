import { RouteRecordRaw } from 'vue-router'

export const reportingRoutes: RouteRecordRaw = {
  path: '/reporting',
  name: 'Reporting',
  component: '/index', // Sử dụng đường dẫn tương đối cho ComponentLoader
  meta: { title: 'Thống kê & Báo cáo', icon: 'trend-charts', permission: 'Statistical.View' },
  children: [
    {
      path: '/reporting/dashboard',
      name: 'ReportingDashboard',
      component: '/analytics-reporting/dashboard',
      meta: {
        title: 'Dashboard Tổng quan',
        icon: 'ri:dashboard-line',
        permission: 'Statistical.View',
      },
    },
    {
      path: '/reporting/expense',
      name: 'ExpenseManagement',
      component: '/analytics-reporting/expense',
      meta: {
        title: 'Chi phí vận hành',
        icon: 'ri:money-dollar-circle-line',
        permission: 'Statistical.View',
      },
    },
    {
      path: '/reporting/pnl',
      name: 'PnLReport',
      component: '/analytics-reporting/pnl',
      meta: { title: 'Báo cáo P&L', icon: 'ri:file-chart-line', permission: 'Statistical.View' },
    },
    {
      path: '/reporting/employee',
      name: 'EmployeeReport',
      component: '/analytics-reporting/employee',
      meta: { title: 'Thống kê nhân viên', icon: 'ri:team-line', permission: 'Statistical.View' },
    },
  ],
}

// Removed default export
