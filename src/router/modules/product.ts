import { AppRouteRecord } from '@/types/router'

export const productRoutes: AppRouteRecord = {
  name: 'ProductManagement',
  path: '/product',
  component: '/index/index',
  meta: {
    title: 'menus.product.title',
    icon: 'ri:shopping-bag-3-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'brand',
      name: 'ProductBrand',
      component: '/product/brand/index',
      meta: {
        title: 'menus.product.brand.title',
        icon: 'ri:medal-line',
        permissions: ['Permissions.Brands.View']
      }
    },
    {
      path: 'type',
      name: 'ProductType',
      component: '/product/type/index',
      meta: {
        title: 'menus.product.type.title',
        icon: 'ri:apps-2-line'
      }
    },
    {
      path: 'list',
      name: 'ProductList',
      component: '/product/list/index',
      meta: {
        title: 'menus.product.list.title',
        icon: 'ri:list-unordered'
      }
    }
  ]
}
