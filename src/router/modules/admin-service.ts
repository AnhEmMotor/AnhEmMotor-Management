import { AppRouteRecord } from '@/types/router';
import { Permissions } from '@/domain/constants/permissions';

export const adminServiceRoutes: AppRouteRecord = {
  path: '/admin/service',
  name: 'AdminService',
  component: '/index/index',
  meta: {
    title: 'Xưởng sửa chữa',
    icon: 'ri:bar-chart-grouped-line',
  },
  children: [
    {
      path: 'service-dashboard',
      name: 'AdminServiceDashboard',
      component: '/Admin/view/service/workshop/dashboard/index',
      meta: {
        title: 'Thống kê xưởng',
        icon: 'ri:dashboard-line',
        keepAlive: true,
      },
    },
    {
      path: 'repair-history',
      name: 'AdminServiceRepairHistory',
      component: '/Admin/view/service/workshop/repair-history/index',
      meta: {
        title: 'Lịch sử sửa chữa xưởng',
        icon: 'ri:history-line',
        keepAlive: true,
      },
    },
    {
      path: 'repair-history/create',
      name: 'AdminServiceRepairHistoryCreate',
      component: '/Admin/view/service/workshop/repair-history/repair-order-form',
      meta: {
        title: 'Lịch sử sửa chữa xưởng',
        isHide: true,
        isHideTab: true,
        keepAlive: true,
        activePath: '/admin/service/repair-history',
      },
    },
    {
      path: 'repair-history/repair/:id',
      name: 'AdminServiceRepairHistoryDetail',
      component: '/Admin/view/service/workshop/repair-history/repair-order-detail',
      meta: {
        title: 'Lịch sử sửa chữa xưởng',
        isHide: true,
        isHideTab: true,
        keepAlive: true,
        activePath: '/admin/service/repair-history',
      },
    },
    {
      path: 'workshop-report',
      name: 'AdminServiceWorkshopReport',
      component: '/Accountant/view/reporting/workshop',
      meta: {
        title: 'Báo cáo xưởng dịch vụ',
        icon: 'ri:tools-line',
        keepAlive: true,
        permission: Permissions.StatisticalView,
      },
    },
  ],
};
