import { AppRouteRecord } from '@/types/router';
import { Permissions } from '@/domain/constants/permissions';
import { marketingManualRoutes } from '@/router/modules/marketing-manual';

export const marketingMenu: AppRouteRecord[] = [
  {
    path: '/Marketing',
    name: 'Marketing',
    component: '/index/index',
    meta: {
      title: 'menus.marketing.title',
      icon: 'ri:market-line',
      roles: ['Admin', 'SuperAdmin'],
      permissions: ['Permissions.Marketing'],
    },
    redirect: '/Marketing/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'MarketingDashboard',
        component: '/Marketing/view/dashboard/index',
        meta: {
          title: 'Dashboard tiếp thị',
          icon: 'ri:dashboard-3-line',
          keepAlive: true,
        },
      },
      {
        path: 'intro',
        name: 'MarketingIntro',
        component: '/Marketing/view/intro/index',
        meta: {
          title: 'Giới thiệu Marketing',
          icon: 'ri:image-line',
          isHide: true,
        },
      },
      {
        path: 'banner',
        name: 'MarketingBanner',
        component: '/Marketing/view/banner/index',
        meta: {
          title: 'menus.marketing.banner',
          icon: 'ri:advertisement-line',
          keepAlive: true,
          permissions: [Permissions.Marketing.BannerManagement.View],
        },
      },
      {
        path: 'article',
        name: 'ArticleList',
        component: '/Marketing/article/list',
        meta: {
          title: 'menus.marketing.article',
          icon: 'ri:book-2-line',
          keepAlive: true,
          permissions: [Permissions.Marketing.NewsManagement.View],
          authList: [
            { title: 'Thêm mới', authMark: 'add' },
            { title: 'Chỉnh sửa', authMark: 'edit' },
          ],
        },
      },
      {
        path: 'article/publish',
        name: 'ArticlePublish',
        component: '/Marketing/article/publish',
        meta: {
          title: 'menus.marketing.articlePublish',
          isHide: true,
          isHideTab: true,
          keepAlive: true,
          activePath: '/Marketing/article',
          authList: [{ title: 'Đăng tải', authMark: 'add' }],
        },
      },
      {
        path: 'article/publish/:id',
        name: 'ArticleEdit',
        component: '/Marketing/article/publish',
        meta: {
          title: 'menus.marketing.articleEdit',
          isHide: true,
          isHideTab: true,
          keepAlive: true,
          activePath: '/Marketing/article',
          authList: [{ title: 'Sửa', authMark: 'edit' }],
        },
      },
      {
        path: 'article/detail/:id',
        name: 'ArticleDetail',
        component: '/Marketing/article/detail',
        meta: {
          title: 'menus.marketing.articleDetail',
          isHide: true,
          keepAlive: true,
          activePath: '/Marketing/article',
        },
      },
      {
        path: 'comment',
        name: 'MarketingComment',
        component: '/Marketing/view/comment/index',
        meta: {
          title: 'menus.marketing.comment',
          icon: 'ri:chat-1-line',
          keepAlive: true,
          permissions: [Permissions.Marketing.CustomerManagement.View],
        },
      },
      {
        path: 'contact',
        name: 'ContactManagement',
        component: '/Marketing/view/contact/index',
        meta: {
          title: 'menus.marketing.contact',
          icon: 'ri:message-2-line',
          keepAlive: true,
          permissions: [Permissions.Marketing.ContactManagement.View],
        },
      },
      {
        path: 'customer',
        name: 'CustomerManagement',
        component: '',
        meta: {
          title: 'menus.marketing.customer',
          icon: 'ri:user-heart-line',
          roles: ['Admin', 'SuperAdmin'],
        },
        children: [
          {
            path: '',
            name: 'CustomerManagementHome',
            component: '/Marketing/view/customer/index',
            meta: {
              title: 'menus.marketing.customer',
              isHide: true,
            },
          },
          {
            path: 'potential',
            name: 'CustomerPotential',
            component: '/Marketing/view/customer/potential/index',
            meta: {
              title: 'menus.marketing.customerPotential',
              icon: 'ri:user-search-line',
              permissions: [Permissions.Marketing.LeadManagement.View],
            },
          },
          {
            path: 'profile',
            name: 'CustomerProfile',
            component: '/Marketing/view/customer/profile/index',
            meta: {
              title: 'menus.marketing.customerProfile',
              icon: 'ri:profile-line',
              permissions: [Permissions.Marketing.CustomerManagement.View],
            },
          },
          {
            path: 'profile/:leadId',
            name: 'CustomerProfile360',
            component: '/Marketing/view/customer/profile/360',
            meta: {
              title: 'menus.marketing.customerProfile360',
              isHide: true,
              isHideTab: true,
              keepAlive: true,
              activePath: '/Marketing/customer/profile',
            },
          },
          {
            path: 'asset',
            name: 'CustomerAsset',
            component: '/Marketing/view/customer/asset/index',
            meta: {
              title: 'menus.marketing.customerAsset',
              icon: 'ri:car-line',
              permissions: [Permissions.Marketing.CustomerAssetManagement.View],
            },
          },
          {
            path: 'care',
            name: 'CustomerCare',
            component: '/Marketing/view/customer/care/index',
            meta: {
              title: 'menus.marketing.customerCare',
              icon: 'ri:gift-line',
              permissions: [Permissions.Marketing.CustomerCareManagement.View],
            },
          },
          {
            path: 'voucher',
            name: 'CustomerVoucher',
            component: '/Marketing/view/customer/voucher/index',
            meta: {
              title: 'menus.marketing.customerVoucher',
              icon: 'ri:coupon-3-line',
              permissions: [Permissions.Marketing.CustomerVoucherManagement.View],
            },
          },
          {
            path: 'voucher/save',
            name: 'CustomerVoucherSave',
            component: '/Marketing/view/customer/voucher/save',
            meta: {
              title: 'Tạo/Sửa Voucher',
              isHide: true,
              isHideTab: true,
              keepAlive: true,
              activePath: '/Marketing/customer/voucher',
            },
          },
          {
            path: 'voucher/detail/:id',
            name: 'CustomerVoucherDetail',
            component: '/Marketing/view/customer/voucher/detail',
            meta: {
              title: 'Chi tiết Voucher',
              isHide: true,
              isHideTab: true,
              keepAlive: false,
              activePath: '/Marketing/customer/voucher',
            },
          },
          {
            path: 'store-chat',
            name: 'CustomerStoreChat',
            component: '/Marketing/view/customer/store-chat/index',
            meta: {
              title: 'menus.marketing.customerStoreChat',
              icon: 'ri:customer-service-2-line',
              permissions: [Permissions.Marketing.StoreChatManagement.View],
            },
          },
        ],
      },
      {
        path: 'booking',
        name: 'CustomerBooking',
        component: '/Marketing/view/customer/booking/index',
        meta: {
          title: 'menus.marketing.booking',
          icon: 'ri:calendar-event-line',
          keepAlive: true,
          permissions: [Permissions.Marketing.BookingManagement.View],
        },
      },
      {
        path: 'visitor-tracking',
        name: 'VisitorTracking',
        component: '/Marketing/view/visitor-tracking/index',
        meta: {
          title: 'Theo dõi truy cập',
          icon: 'ri:eye-line',
          keepAlive: true,
        },
      },
      {
        path: 'google-ads',
        name: 'GoogleAdsIntegration',
        component: '/Marketing/view/google-ads/index',
        meta: {
          title: 'Google Ads',
          icon: 'ri:google-fill',
          keepAlive: true,
          isHide: true,
        },
      },
      {
        path: 'google-analytics',
        name: 'GoogleAnalyticsDashboard',
        component: '/Marketing/view/google-analytics/index',
        meta: {
          title: 'Google Analytics',
          icon: 'ri:bar-chart-fill',
          keepAlive: true,
        },
      },
      ...marketingManualRoutes,
    ],
  },
];

export default marketingMenu;
