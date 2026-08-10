import { AppRouteRecord } from '@/types/router';
import type { Component } from 'vue';
import { Permissions } from '@/domain/constants/permissions';
import { factoryManualRoutes } from '@/router/modules/factory-manual';

export const factoryMenu: AppRouteRecord[] = [
  {
    path: '/factory',
    name: 'Factory',
    component: '/index/index',
    meta: {
      title: 'Dịch vụ xưởng',
      icon: 'ri:tools-line',
      permissions: ['Permissions.Factory'],
    },
    redirect: '/factory/workshop/banner',
    children: [
      {
        path: 'workshop',
        name: 'Workshop',
        meta: {
          title: 'Dịch vụ xưởng',
          icon: 'ri:tools-line',
        },
        children: [
          {
            path: 'banner',
            name: 'WorkshopBanner',
            component: '/Factory/view/service/workshop/banner/index',
            meta: {
              title: 'Giới thiệu xưởng',
              icon: 'ri:image-line',
              isHide: true,
            },
          },
          {
            path: 'dashboard',
            name: 'WorkshopDashboard',
            component: '/Factory/view/service/workshop/dashboard/index',
            meta: {
              title: 'Dashboard xưởng',
              icon: 'ri:dashboard-line',
              permissions: [Permissions.Factory.DashboardManagement.View],
            },
          },
          {
            path: 'appointments',
            name: 'WorkshopAppointments',
            component: '/Factory/view/service/workshop/appointments/index',
            meta: {
              title: 'Lịch sửa chữa',
              icon: 'ri:calendar-check-line',
            },
          },
          {
            path: 'warranty-catalog',
            name: 'FactoryWarrantyCatalog',
            component: '/Factory/view/service/warranty-category/index',
            meta: {
              title: 'Danh mục bảo hành',
              icon: 'ri:shield-check-line',
            },
          },
          {
            path: 'repair',
            name: 'WorkshopRepair',
            component: '/Factory/view/service/workshop/repair-orders/index',
            meta: {
              title: 'Sửa chữa',
              icon: 'ri:wrench-line',
              permissions: [Permissions.Factory.RepairOrderManagement.View],
            },
          },
          {
            path: 'repair/:id',
            name: 'WorkshopRepairDetail',
            component: '/Factory/view/service/workshop/repair-orders/repair-order-detail',
            meta: {
              title: 'Chi tiết phiếu sửa chữa',
              isHide: true,
              activePath: '/factory/workshop/repair',
            },
          },
          {
            path: 'warranty',
            name: 'WorkshopWarranty',
            component: '/Factory/view/service/warranty-and-complaints/warranty-requests/index',
            meta: {
              title: 'Bảo hành',
              icon: 'ri:shield-check-line',
            },
          },
          {
            path: 'warranty/:id',
            name: 'WorkshopWarrantyDetail',
            component: '/Factory/view/service/warranty-and-complaints/warranty-claim-detail/index',
            meta: {
              title: 'Chi tiết bảo hành',
              isHide: true,
              activePath: '/factory/workshop/warranty',
            },
          },
          {
            path: 'history',
            name: 'WorkshopHistory',
            component: '/Factory/view/service/workshop/history/index',
            meta: {
              title: 'Tra cứu hồ sơ xe',
              icon: 'ri:search-eye-line',
            },
          },
          {
            path: 'repair-history',
            name: 'WorkshopRepairHistory',
            component: '/Factory/view/service/workshop/repair-history/index',
            meta: {
              title: 'Lịch sử sửa chữa xưởng',
              icon: 'ri:tools-line',
              keepAlive: true,
            },
          },
          {
            path: 'repair-history/create',
            name: 'WorkshopRepairHistoryCreate',
            component: '/Factory/view/service/workshop/repair-history/repair-order-form',
            meta: {
              title: 'Lịch sử sửa chữa xưởng',
              isHide: true,
              isHideTab: true,
              keepAlive: true,
              activePath: '/factory/workshop/repair-history',
            },
          },
          {
            path: 'repair-history/repair/:id',
            name: 'WorkshopRepairHistoryDetail',
            component: '/Factory/view/service/workshop/repair-history/repair-order-detail',
            meta: {
              title: 'Lịch sử sửa chữa xưởng',
              isHide: true,
              isHideTab: true,
              keepAlive: true,
              activePath: '/factory/workshop/repair-history',
            },
          },
        ],
      },

      {
        path: 'workshop/counter',
        name: 'WorkshopCounter',
        redirect: '/factory/workshop/counter/payment',
        meta: {
          title: 'menus.service.workshop.counter.title',
          icon: 'ri:money-dollar-circle-line',
        },
        children: [
          {
            path: 'payment',
            name: 'CounterPaymentList',
            component: '/Factory/view/service/workshop/counter/payment-list/index',
            meta: {
              title: 'Phiếu thu xưởng',
              icon: 'ri:receipt-line',
            },
          },
        ],
      },
      {
        path: 'statistics',
        name: 'FactoryStatistics',
        component: '/Factory/view/service/workshop/statistics/index',
        meta: {
          title: 'Thống kê xưởng',
          icon: 'ri:bar-chart-line',
          permissions: [Permissions.Factory.DashboardManagement.View],
        },
      },
      ...factoryManualRoutes,
    ],
  },
];

export default factoryMenu;
