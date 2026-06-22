import { AppRouteRecord } from "@/types/router";

export const salesRoutes: AppRouteRecord = {
  name: "SalesManagement",
  path: "/sales",
  component: "/index/index",
  meta: {
    title: "Quản lý bán hàng",
    icon: "ri:bill-line",
    roles: ["R_SUPER", "R_ADMIN"],
  },
  children: [
    {
      path: "draft-orders",
      name: "DraftSalesOrders",
      component: "/sales/draft/index",
      meta: {
        title: "Phiếu tạm",
        icon: "ri:file-list-3-line",
        keepAlive: true,
      },
    },
    {
      path: "orders",
      name: "SalesOrders",
      component: "/sales/order/index",
      meta: {
        title: "Phiếu bán hàng",
        icon: "ri:file-list-3-line",
        keepAlive: true,
      },
    },
  ],
};
