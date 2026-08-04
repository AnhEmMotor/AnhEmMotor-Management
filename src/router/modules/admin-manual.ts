import { AppRouteRecord } from "@/types/router"

export const adminManualRoutes: AppRouteRecord = {
  path: "/admin/manual",
  name: "AdminManual",
  component: "/index/index",
  meta: {
    title: "Hướng dẫn sử dụng",
    icon: "ri:book-open-line",
    keepAlive: true,
  },
  children: [
    {
      path: "",
      name: "AdminManualOverview",
      component: "/Admin/view/manual/overview/OverviewPage",
      meta: {
        title: "Tổng quan",
        isHide: true,
      },
    },
    {
      path: ":id",
      name: "AdminManualSection",
      component: "/Admin/view/manual/index",
      meta: {
        title: "Chi tiết",
        isHide: true,
        isHideTab: true,
      },
    },
  ],
}
