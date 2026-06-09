import { AppRouteRecord } from '@/types/router'

export const contactRoutes: AppRouteRecord = {
  name: 'ContactManagement',
  path: '/contacts/index',
  component: '/contact-management/index',
  meta: {
    title: 'menus.contact.title',
    icon: 'ri:message-2-line',
    roles: ['R_SUPER', 'R_ADMIN'],
  },
}
