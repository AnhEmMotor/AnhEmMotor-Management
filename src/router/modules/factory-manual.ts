import { AppRouteRecord } from '@/types/router';

export const factoryManualRoutes: AppRouteRecord[] = [
  {
    path: 'manual',
    name: 'FactoryManual',
    component: '/Factory/view/manual/overview/OverviewPage',
    meta: {
      title: 'Hướng dẫn sử dụng',
      icon: 'ri:book-open-line',
      keepAlive: true,
    },
  },
  {
    path: 'manual/:id',
    name: 'FactoryManualSection',
    component: '/Factory/view/manual/index',
    meta: {
      title: 'Chi tiết',
      isHide: true,
      isHideTab: true,
      activePath: '/factory/manual',
    },
  },
];
