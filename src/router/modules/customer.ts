import { AppRouteRecord } from "@/types/router";

export const customerRoutes: AppRouteRecord = {
  name: "CustomerManagement",
  path: "/customer",
  component: "/index/index",
  meta: {
    title: "menus.customer.title",
    icon: "ri:user-heart-line",
    roles: ["Admin", "SuperAdmin"],
  },
  children: [
    {
      path: "potential",
      name: "CustomerPotential",
      component: "/Marketing/view/customer/potential/index",
      meta: {
        title: "menus.customer.potential",
        icon: "ri:user-search-line",
      },
    },
    {
      path: "profile",
      name: "CustomerProfile",
      component: "/Marketing/view/customer/profile/index",
      meta: {
        title: "menus.customer.profile",
        icon: "ri:profile-line",
      },
    },
    {
      path: "asset",
      name: "CustomerAsset",
      component: "/Marketing/view/customer/asset/index",
      meta: {
        title: "menus.customer.asset",
        icon: "ri:car-line",
      },
    },
    {
      path: "care",
      name: "CustomerCare",
      component: "/Marketing/view/customer/care/index",
      meta: {
        title: "menus.customer.care",
        icon: "ri:gift-line",
      },
    },
    {
      path: "progress",
      name: "CustomerProgress",
      component: "/Marketing/view/customer/progress/index",
      meta: {
        title: "menus.customer.progress",
        icon: "ri:git-commit-line",
      },
    },
  ],
};
