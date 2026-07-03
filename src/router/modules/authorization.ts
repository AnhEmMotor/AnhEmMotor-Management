import { AppRouteRecord } from "@/types/router";

export const authorizationRoutes: AppRouteRecord = {
  path: "/auth-manage",
  name: "Authorization",
  component: "/index/index",
  meta: {
    title: "menus.auth.title",
    icon: "ri:shield-user-line",
    roles: ["Admin", "SuperAdmin"],
    permissions: ["Permissions.Admin"],
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
        roles: ["Admin", "SuperAdmin"],
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
        roles: ["Admin", "SuperAdmin"],
      },
    },
  ],
};
