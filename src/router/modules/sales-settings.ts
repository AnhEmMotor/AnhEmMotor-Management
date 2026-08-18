import { AppRouteRecord } from '@/types/router';
import { Permissions } from '@/domain/constants/permissions';

export const salesSettingsRoutes: AppRouteRecord = {
  name: 'SalesSettings',
  path: '/sales-settings',
  component: '/index/index',
  meta: {
    title: 'Cài đặt bán hàng',
    icon: 'ri:settings-4-line',
    roles: ['R_SUPER', 'R_ADMIN'],
    permissions: [Permissions.SettingsView],
  },
  children: [
    {
      path: 'deposit',
      name: 'SalesDepositSettings',
      component: '/sales-settings/deposit/index',
      meta: {
        title: 'Cài đặt đặt cọc',
        icon: 'ri:secure-payment-line',
        permissions: [Permissions.SettingsView],
      },
    },
    {
      path: 'inventory',
      name: 'SalesInventorySettings',
      component: '/sales-settings/inventory/index',
      meta: {
        title: 'Cài đặt tồn kho',
        icon: 'ri:alarm-warning-line',
        permissions: ['Permissions.Warehouse.InventorySettingManagement.View'],
      },
    },
    {
      path: 'returns',
      name: 'ReturnManagement',
      component: '/sales-settings/returns/index',
      meta: {
        title: 'Quản lý trả hàng',
        icon: 'ri:arrow-go-back-line',
        permissions: [Permissions.SettingsView],
      },
    },
  ],
};
