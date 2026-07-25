import { AppRouteRecordRaw } from "@/common/utils/router";

export const staticRoutes: AppRouteRecordRaw[] = [
  {
    path: "/",
    name: "RootRedirect",
    redirect: "/workspace",
  },
  {
    path: "/auth/login",
    name: "Login",
    component: () => import("@view/auth/login/index.vue"),
    meta: { title: "menus.login.title", isHideTab: true },
  },
  {
    path: "/auth/portal",
    name: "WorkspacePortal",
    component: () => import("@view/workspace.vue"),
    meta: { title: "Workspace Portal", isHideTab: true },
  },
  {
    path: "/auth/forget-password",
    name: "ForgetPassword",
    component: () => import("@view/auth/forgot-password/index.vue"),
    meta: { title: "menus.forgetPassword.title", isHideTab: true },
  },
  {
    path: "/auth/reset-password",
    name: "ResetPassword",
    component: () => import("@view/auth/reset-password/index.vue"),
    meta: { title: "Đặt lại mật khẩu", isHideTab: true },
  },
  {
    path: "/workspace",
    name: "WorkspacePortal",
    component: () => import("@view/workspace.vue"),
    meta: { title: "Workspace", isHideTab: true },
  },
  {
    path: "/manual",
    name: "ManualIndex",
    component: () => import("@view/manual/index.vue"),
    meta: { title: "Hướng dẫn sử dụng", isHideTab: true },
  },
  {
    path: "/403",
    name: "Exception403",
    component: () => import("@view/error/403.vue"),
    meta: { title: "403", isHideTab: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "Exception404",
    component: () => import("@view/error/404.vue"),
    meta: { title: "404", isHideTab: true },
  },
  {
    path: "/500",
    name: "Exception500",
    component: () => import("@view/error/500.vue"),
    meta: { title: "500", isHideTab: true },
  },
  {
    path: "/outside",
    component: () => import("@/modules/index/index.vue"),
    name: "Outside",
    meta: { title: "menus.outside.title" },
    children: [
      {
        path: "/outside/iframe/:path",
        name: "Iframe",
        component: () => import("@/modules/outside/Iframe.vue"),
        meta: { title: "iframe" },
      },
    ],
  },
];
