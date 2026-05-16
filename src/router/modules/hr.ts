import { AppRouteRecord } from '@/types/router'

export const hrRoutes: AppRouteRecord = {
  name: 'HRManagement',
  path: '/hr',
  component: '/index/index',
  meta: {
    title: 'menus.hr.title',
    icon: 'ri:user-star-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'employees',
      name: 'HREmployees',
      component: '/hr/employees/index',
      meta: {
        title: 'menus.hr.employees',
        icon: 'ri:group-line'
      }
    },
    {
      path: 'commission-policy',
      name: 'HRCommissionPolicy',
      component: '/hr/policy/index',
      meta: {
        title: 'menus.hr.commissionPolicy',
        icon: 'ri:percent-line'
      }
    },
    {
      path: 'payroll',
      name: 'HRPayroll',
      component: '/hr/payroll/index',
      meta: {
        title: 'menus.hr.payroll',
        icon: 'ri:bank-card-line'
      }
    },
    {
      path: 'kpi',
      name: 'HRKPI',
      component: '/hr/kpi/index',
      meta: {
        title: 'menus.hr.kpi',
        icon: 'ri:bar-chart-box-line'
      }
    }
  ]
}
