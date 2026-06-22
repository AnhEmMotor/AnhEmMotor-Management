import { AppRouteRecord } from "@/types/router";

export const authorizationRoutes: AppRouteRecord = {
  path: "/auth-manage",
  name: "Authorization",
  component: "/index/index",
  meta: {
    title: "menus.auth.title",
    icon: "ri:shield-user-line",
    roles: ["R_SUPER", "R_ADMIN"],
  },
  children: [
    {
      path: "user",
      name: "User",
      component: "/system/user",
      meta: {
        title: "menus.auth.user",
        icon: "ri:user-shared-line",
        keepAlive: true,
        roles: ["R_SUPER", "R_ADMIN"],
      },
    },
    {
      path: "role",
      name: "Role",
      component: "/system/role",
      meta: {
        title: "menus.auth.role",
        icon: "ri:shield-keyhole-line",
        keepAlive: true,
        roles: ["R_SUPER", "R_ADMIN"],
      },
    },
  ],
};
