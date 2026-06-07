import { AppRouteRecord } from '@/types/router'

export const contentRoutes: AppRouteRecord = {
  path: '/content',
  name: 'Content',
  component: '/index/index',
  meta: {
    title: 'Quản lý Nội dung',
    icon: 'ri:file-text-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'article',
      name: 'ArticleList',
      component: '/article/list',
      meta: {
        title: 'Bài viết',
        icon: 'ri:book-2-line',
        keepAlive: true,
        authList: [
          { title: 'Thêm mới', authMark: 'add' },
          { title: 'Chỉnh sửa', authMark: 'edit' }
        ]
      }
    },
    {
      path: 'article/publish',
      name: 'ArticlePublish',
      component: '/article/publish',
      meta: {
        title: 'Đăng bài',
        isHide: true,
        keepAlive: true,
        activePath: '/content/article',
        authList: [{ title: 'Đăng tải', authMark: 'add' }]
      }
    },
    {
      path: 'article/publish/:id',
      name: 'ArticleEdit',
      component: '/article/publish',
      meta: {
        title: 'Sửa bài viết',
        isHide: true,
        keepAlive: true,
        activePath: '/content/article',
        authList: [{ title: 'Sửa', authMark: 'edit' }]
      }
    },
    {
      path: 'article/detail/:id',
      name: 'ArticleDetail',
      component: '/article/detail',
      meta: {
        title: 'Chi tiết bài viết',
        isHide: true,
        keepAlive: true,
        activePath: '/content/article'
      }
    },
    {
      path: 'article/comment/:id',
      name: 'ArticleComment',
      component: '/article/comment',
      meta: {
        title: 'Bình luận',
        isHide: true,
        keepAlive: true,
        activePath: '/content/article'
      }
    },
    {
      path: 'marketing',
      name: 'Marketing',
      component: '',
      meta: {
        title: 'Quản lý Banner',
        icon: 'ri:advertisement-line',
        keepAlive: true
      },
      children: [
        {
          path: 'banner',
          name: 'MarketingBanner',
          component: '/marketing/banner',
          meta: {
            title: 'Danh sách Banner',
            icon: 'ri:image-line',
            keepAlive: true,
            roles: ['R_SUPER', 'R_ADMIN']
          }
        },
        {
          path: 'conversion',
          name: 'MarketingConversion',
          component: '/marketing/conversion',
          meta: {
            title: 'Công cụ chuyển đổi',
            icon: 'ri:magic-line',
            keepAlive: true,
            roles: ['R_SUPER', 'R_ADMIN']
          }
        }
      ]
    }
  ]
}
