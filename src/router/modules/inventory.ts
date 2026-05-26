import { AppRouteRecord } from '@/types/router'

export const inventoryRoutes: AppRouteRecord = {
  name: 'InventoryManagement',
  path: '/inventory',
  component: '/index/index',
  meta: {
    title: 'menus.inventory.title',
    icon: 'ri:archive-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'supplier',
      name: 'InventorySupplier',
      component: '/inventory/supplier/index',
      meta: {
        title: 'menus.inventory.supplier',
        icon: 'ri:team-line'
      }
    },
    {
      path: 'quotation',
      name: 'InventoryQuotation',
      component: '/inventory/quotation/index',
      meta: {
        title: 'menus.inventory.quotation',
        icon: 'ri:file-text-line'
      }
    },
    {
      path: 'input',
      name: 'InventoryInput',
      component: '/inventory/input/index',
      meta: {
        title: 'menus.inventory.input',
        icon: 'ri:file-list-3-line'
      }
    },
    {
      path: 'debt',
      name: 'InventoryDebt',
      component: '/inventory/debt/index',
      meta: {
        title: 'menus.inventory.debt',
        icon: 'ri:money-cny-box-line'
      }
    }
  ]
}
