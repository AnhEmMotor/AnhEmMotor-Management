import { AppRouteRecord } from "@/types/router";
import { Permissions } from "@/domain/constants/permissions";

export const salesRoutes: AppRouteRecord = {
  name: "SalesManagement",
  path: "/sales",
  component: "/index/index",
  meta: {
    title: "Quản lý bán hàng",
    icon: "ri:bill-line",
    roles: ["Admin", "SuperAdmin"],
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
    {
      path: "sales-report",
      name: "SalesAnalyticsReport",
      component: "/Accountant/view/reporting/revenue",
      meta: {
        title: "Báo cáo bán hàng",
        icon: "ri:money-cny-circle-line",
        keepAlive: true,
        permission: Permissions.StatisticalView,
      },
    },
  ],
};
