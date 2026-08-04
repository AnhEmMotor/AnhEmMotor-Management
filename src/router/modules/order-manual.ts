import { AppRouteRecord } from "@/types/router"

export const orderManualRoutes: AppRouteRecord[] = [
  {
    path: "manual",
    name: "OrderManual",
    component: "/Order/view/manual/overview/OverviewPage",
    meta: {
      title: "Hướng dẫn sử dụng",
      icon: "ri:book-open-line",
      keepAlive: true,
    },
  },
  {
    path: "manual/:id",
    name: "OrderManualSection",
    component: "/Order/view/manual/index",
    meta: {
      title: "Chi tiết",
      isHide: true,
      isHideTab: true,
      activePath: "/Order/manual",
    },
  },
]
