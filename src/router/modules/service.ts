import { AppRouteRecord } from "@/types/router";

export const serviceRoutes: AppRouteRecord = {
  path: "/factory/service",
  name: "Service",
  component: "/index/index",
  meta: {
    title: "Thống kê Xưởng",
    icon: "ri:bar-chart-grouped-line",
  },
  children: [
    {
      path: "payment/:id",
      name: "ServiceWorkshopPaymentDetail",
      component:
        "/Factory/view/service/workshop/counter/payment-list/payment-detail/index",
      meta: { title: "Chi tiết phiếu thu", isHide: true, isHideTab: true },
    },
  ],
};
