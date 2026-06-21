import { AppRouteRecord } from '@/types/router'

export const marketingRoutes: AppRouteRecord = {
  path: '/marketing',
  name: 'Marketing',
  component: '/index/index',
  meta: {
    title: 'Quản lý Banner',
    icon: 'ri:advertisement-line',
    roles: ['R_SUPER', 'R_ADMIN'],
  },
  children: [
    {
      path: 'banner',
      name: 'MarketingBanner',
      component: '/Marketing/view/banner/index',
      meta: {
        title: 'Danh sách Banner',
        icon: 'ri:image-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
      },
    },
    {
      path: 'conversion',
      name: 'MarketingConversion',
      component: '/Marketing/view/conversion/index',
      meta: {
        title: 'Công cụ chuyển đổi',
        icon: 'ri:magic-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
      },
    },
  ],
}
