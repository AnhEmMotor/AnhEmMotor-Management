import { AppRouteRecord } from "@/types/router";

export const marketingMenu: AppRouteRecord[] = [
  {
    path: "/Marketing",
    name: "Marketing",
    component: "",
    meta: {
      title: "Marketing",
      icon: "ri:market-line",
      roles: ["Admin", "SuperAdmin"],
    },
    redirect: "/Marketing/banner",
    children: [
      {
        path: "banner",
        name: "MarketingBanner",
        component: "/Marketing/view/banner/index",
        meta: {
          title: "Quản lý Banner",
          icon: "ri:advertisement-line",
          keepAlive: true,
        },
      },
      {
        path: "article",
        name: "ArticleList",
        component: "/article/list",
        meta: {
          title: "Quản lý Bài viết",
          icon: "ri:book-2-line",
          keepAlive: true,
          authList: [
            { title: "Thêm mới", authMark: "add" },
            { title: "Chỉnh sửa", authMark: "edit" },
          ],
        },
      },
      {
        path: "article/publish",
        name: "ArticlePublish",
        component: "/article/publish",
        meta: {
          title: "Đăng bài",
          isHide: true,
          isHideTab: true,
          keepAlive: true,
          activePath: "/Marketing/article",
          authList: [{ title: "Đăng tải", authMark: "add" }],
        },
      },
      {
        path: "article/publish/:id",
        name: "ArticleEdit",
        component: "/article/publish",
        meta: {
          title: "Sửa bài viết",
          isHide: true,
          isHideTab: true,
          keepAlive: true,
          activePath: "/Marketing/article",
          authList: [{ title: "Sửa", authMark: "edit" }],
        },
      },
      {
        path: "article/detail/:id",
        name: "ArticleDetail",
        component: "/article/detail",
        meta: {
          title: "Chi tiết bài viết",
          isHide: true,
          keepAlive: true,
          activePath: "/Marketing/article",
        },
      },
      {
        path: "comment",
        name: "MarketingComment",
        component: "/Marketing/view/comment/index",
        meta: {
          title: "Quản lý Bình luận",
          icon: "ri:chat-1-line",
          keepAlive: true,
        },
      },
      {
        path: "contact",
        name: "ContactManagement",
        component: "/Marketing/view/contact/index",
        meta: {
          title: "Quản lý Liên hệ",
          icon: "ri:message-2-line",
          keepAlive: true,
        },
      },
      {
        path: "customer",
        name: "CustomerManagement",
        component: "/Marketing/view/customer/index",
        meta: {
          title: "Quản lý Khách hàng",
          icon: "ri:user-heart-line",
          roles: ["Admin", "SuperAdmin"],
        },
        children: [
          {
            path: "potential",
            name: "CustomerPotential",
            component: "/Marketing/view/customer/potential/index",
            meta: {
              title: "Khách hàng tiềm năng",
              icon: "ri:user-search-line",
            },
          },
          {
            path: "profile",
            name: "CustomerProfile",
            component: "/Marketing/view/customer/profile/index",
            meta: {
              title: "Hồ sơ khách hàng",
              icon: "ri:profile-line",
            },
          },
          {
            path: "asset",
            name: "CustomerAsset",
            component: "/Marketing/view/customer/asset/index",
            meta: {
              title: "Tài sản",
              icon: "ri:car-line",
            },
          },
          {
            path: "care",
            name: "CustomerCare",
            component: "/Marketing/view/customer/care/index",
            meta: {
              title: "Chăm sóc",
              icon: "ri:gift-line",
            },
          },
          {
            path: "progress",
            name: "CustomerProgress",
            component: "/Marketing/view/customer/progress/index",
            meta: {
              title: "Tiến độ",
              icon: "ri:git-commit-line",
            },
          },
        ],
      },
      {
        path: "booking",
        name: "CustomerBooking",
        component: "/Marketing/view/customer/booking/index",
        meta: {
          title: "Quản lý Lịch hẹn",
          icon: "ri:calendar-event-line",
          keepAlive: true,
        },
      },
    ],
  },
];

export default marketingMenu;
