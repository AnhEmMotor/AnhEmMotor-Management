import { AppRouteRecord } from '@/types/router'

export const hrRoutes: AppRouteRecord = {
  name: 'HRManagement',
  path: '/hr',
  component: '/index/index',
  meta: {
    title: 'menus.hr.title',
    icon: 'ri:user-star-line',
    roles: ['R_SUPER', 'R_ADMIN'],
  },
  children: [
    {
      path: 'employee',
      name: 'HREmployee',
      component: '/Admin/view/employee/employee/index',
      meta: {
        title: 'menus.hr.employee',
        icon: 'ri:group-line',
      },
    },
    {
      path: 'commission-policy',
      name: 'HRCommissionPolicy',
      component: '/Admin/view/employee/policy/index',
      meta: {
        title: 'menus.hr.commissionPolicy',
        icon: 'ri:percent-line',
      },
    },
    {
      path: 'payroll',
      name: 'HRPayroll',
      component: '/Admin/view/employee/payroll/index',
      meta: {
        title: 'menus.hr.payroll',
        icon: 'ri:bank-card-line',
      },
    },
    {
      path: 'kpi',
      name: 'HRKPI',
      component: '/Admin/view/employee/kpi/index',
      meta: {
        title: 'menus.hr.kpi',
        icon: 'ri:bar-chart-box-line',
      },
    },
  ],
}
