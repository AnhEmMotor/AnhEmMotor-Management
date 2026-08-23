import { AppRouteRecord } from '@/types/router';

export const marketingRoutes: AppRouteRecord[] = [
  {
    path: '/marketing',
    name: 'Marketing',
    component: 'LAYOUT',
    meta: {
      title: 'Marketing',
      icon: 'ri:pie-chart-line',
      sort: 80,
    },
    children: [
      {
        path: 'visitor-history',
        name: 'VisitorHistory',
        component: '/Marketing/view/visitor-history/index',
        meta: {
          title: 'Lịch sử truy cập',
          icon: 'ri:history-line',
          keepAlive: true,
        },
      },
      {
        path: 'google-ads',
        name: 'GoogleAds',
        component: '/Marketing/view/google-ads/index',
        meta: {
          title: 'Google Ads',
          icon: 'ri:google-line',
          keepAlive: true,
        },
      },
      {
        path: 'google-analytics',
        name: 'GoogleAnalytics',
        component: '/Marketing/view/google-analytics/index',
        meta: {
          title: 'Google Analytics',
          icon: 'ri:bar-chart-2-line',
          keepAlive: true,
        },
      },
    ],
  },
];
