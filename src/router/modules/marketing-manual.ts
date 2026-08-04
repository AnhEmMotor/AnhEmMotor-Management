import { AppRouteRecord } from "@/types/router"

export const marketingManualRoutes: AppRouteRecord[] = [
  {
    path: "manual",
    name: "MarketingManual",
    component: "/Marketing/view/manual/overview/OverviewPage",
    meta: {
      title: "Hướng dẫn sử dụng",
      icon: "ri:book-open-line",
      keepAlive: true,
    },
  },
  {
    path: "manual/:id",
    name: "MarketingManualSection",
    component: "/Marketing/view/manual/index",
    meta: {
      title: "Chi tiết",
      isHide: true,
      isHideTab: true,
      activePath: "/Marketing/manual",
    },
  },
]
