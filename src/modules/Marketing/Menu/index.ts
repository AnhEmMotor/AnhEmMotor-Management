import { AppRouteRecord } from "@/types/router";

export const marketingMenu: AppRouteRecord[] = [
  {
    path: "/Marketing",
    name: "Marketing",
    component: "/index/index",
    meta: {
      title: "menus.marketing.title",
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
          title: "menus.marketing.banner",
          icon: "ri:advertisement-line",
          keepAlive: true,
        },
      },
      {
        path: "article",
        name: "ArticleList",
        component: "/Marketing/article/list",
        meta: {
          title: "menus.marketing.article",
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
        component: "/Marketing/article/publish",
        meta: {
          title: "menus.marketing.articlePublish",
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
        component: "/Marketing/article/publish",
        meta: {
          title: "menus.marketing.articleEdit",
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
        component: "/Marketing/article/detail",
        meta: {
          title: "menus.marketing.articleDetail",
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
          title: "menus.marketing.comment",
          icon: "ri:chat-1-line",
          keepAlive: true,
        },
      },
      {
        path: "contact",
        name: "ContactManagement",
        component: "/Marketing/view/contact/index",
        meta: {
          title: "menus.marketing.contact",
          icon: "ri:message-2-line",
          keepAlive: true,
        },
      },
      {
        path: "customer",
        name: "CustomerManagement",
        component: "/Marketing/view/customer/index",
        meta: {
          title: "menus.marketing.customer",
          icon: "ri:user-heart-line",
          roles: ["Admin", "SuperAdmin"],
        },
        children: [
          {
            path: "potential",
            name: "CustomerPotential",
            component: "/Marketing/view/customer/potential/index",
            meta: {
              title: "menus.marketing.customerPotential",
              icon: "ri:user-search-line",
            },
          },
          {
            path: "profile",
            name: "CustomerProfile",
            component: "/Marketing/view/customer/profile/index",
            meta: {
              title: "menus.marketing.customerProfile",
              icon: "ri:profile-line",
            },
          },
          {
            path: "asset",
            name: "CustomerAsset",
            component: "/Marketing/view/customer/asset/index",
            meta: {
              title: "menus.marketing.customerAsset",
              icon: "ri:car-line",
            },
          },
          {
            path: "care",
            name: "CustomerCare",
            component: "/Marketing/view/customer/care/index",
            meta: {
              title: "menus.marketing.customerCare",
              icon: "ri:gift-line",
            },
          },
          {
            path: "progress",
            name: "CustomerProgress",
            component: "/Marketing/view/customer/progress/index",
            meta: {
              title: "menus.marketing.customerProgress",
              icon: "ri:git-commit-line",
            },
          },
          {
            path: "/customer/pipeline",
            name: "CustomerPipeline",
            component: "/Marketing/view/customer/pipeline/index",
            meta: {
              title: "menus.marketing.customerPipeline",
              icon: "ri:git-repository-line",
              keepAlive: true,
            },
          },
          {
            path: "/customer/workshop",
            name: "CustomerWorkshop",
            component: "/Marketing/view/customer/workshop/index",
            meta: {
              title: "menus.marketing.customerWorkshop",
              icon: "ri:tools-line",
              keepAlive: true,
            },
          },
          {
            path: "/customer/workshop/create",
            name: "CustomerWorkshopCreate",
            component: "/Marketing/view/customer/workshop/repair-order-form",
            meta: {
              title: "menus.marketing.customerWorkshop",
              isHide: true,
              isHideTab: true,
              keepAlive: true,
              activePath: "/customer/workshop",
            },
          },
          {
            path: "/customer/workshop/repair/:id",
            name: "CustomerWorkshopDetail",
            component: "/Marketing/view/customer/workshop/repair-order-detail",
            meta: {
              title: "menus.marketing.customerWorkshop",
              isHide: true,
              isHideTab: true,
              keepAlive: true,
              activePath: "/customer/workshop",
            },
          },
          {
            path: "/customer/contact",
            name: "CustomerContactSupport",
            component: "/Marketing/view/customer/contact/index",
            meta: {
              title: "menus.marketing.customerContact",
              icon: "ri:customer-service-2-line",
              keepAlive: true,
            },
          },
        ],
      },
      {
        path: "booking",
        name: "CustomerBooking",
        component: "/Marketing/view/customer/booking/index",
        meta: {
          title: "menus.marketing.booking",
          icon: "ri:calendar-event-line",
          keepAlive: true,
        },
      },
      {
        path: "conversion",
        name: "MarketingConversion",
        component: "/Marketing/view/conversion/index",
        meta: {
          title: "menus.marketing.conversion",
          icon: "ri:magic-line",
          keepAlive: true,
        },
      },
    ],
  },
];

export default marketingMenu;
