import { AppRouteRecord } from "@/types/router";

export const accountantManualRoutes: AppRouteRecord[] = [
  {
    path: "manual",
    name: "AccountantManual",
    component: "/Accountant/view/manual/overview/OverviewPage",
    meta: {
      title: "Hướng dẫn sử dụng",
      icon: "ri:book-open-line",
      keepAlive: true,
    },
  },
  {
    path: "manual/:id",
    name: "AccountantManualSection",
    component: "/Accountant/view/manual/index",
    meta: {
      title: "Chi tiết",
      isHide: true,
      isHideTab: true,
      activePath: "/Accountant/manual",
    },
  },
];
