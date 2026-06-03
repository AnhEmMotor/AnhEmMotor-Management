import { AppRouteRecord } from '@/types/router'

export const customerRoutes: AppRouteRecord = {
  name: 'CustomerManagement',
  path: '/customer',
  component: '/index/index',
  meta: {
    title: 'menus.customer.title',
    icon: 'ri:user-heart-line',
    roles: ['R_SUPER', 'R_ADMIN'],
  },
  children: [
    {
      path: 'potential',
      name: 'CustomerPotential',
      component: '/customer/potential/index',
      meta: {
        title: 'menus.customer.potential',
        icon: 'ri:user-search-line',
      },
    },
    {
      path: 'profile',
      name: 'CustomerProfile',
      component: '/customer/profile/index',
      meta: {
        title: 'menus.customer.profile',
        icon: 'ri:profile-line',
      },
    },
    {
      path: 'asset',
      name: 'CustomerAsset',
      component: '/customer/asset/index',
      meta: {
        title: 'menus.customer.asset',
        icon: 'ri:car-line',
      },
    },
    {
      path: 'care',
      name: 'CustomerCare',
      component: '/customer/care/index',
      meta: {
        title: 'menus.customer.care',
        icon: 'ri:gift-line',
      },
    },
    {
      path: 'contact',
      name: 'CustomerContact',
      component: '/customer/contact/index',
      meta: {
        title: 'menus.customer.contact',
        icon: 'ri:message-2-line',
      },
    },
    {
      path: 'progress',
      name: 'CustomerProgress',
      component: '/customer/progress/index',
      meta: {
        title: 'menus.customer.progress',
        icon: 'ri:git-commit-line',
      },
    },
  ],
}
