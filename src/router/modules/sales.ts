import { AppRouteRecord } from "@/types/router";
import { Permissions } from "@/domain/constants/permissions";

export const salesRoutes: AppRouteRecord = {
  name: "SalesManagement",
  path: "/sales",
  component: "/index/index",
  meta: {
    title: "Quản lý đơn hàng",
    icon: "ri:bill-line",
    roles: ["Admin", "SuperAdmin"],
  },
  children: [
    {
      path: "returns",
      name: "SalesReturns",
      component: "/sales/returns/index",
      meta: {
        title: "Quản lý Hủy đơn / Trả hàng",
        icon: "ri:arrow-go-back-line",
        keepAlive: true,
      },
    },
    {
      path: "invoices",
      name: "SalesInvoices",
      component: "/Admin/view/sales/invoices/index",
      meta: {
        title: "Hóa đơn bán hàng",
        icon: "ri:receipt-line",
        keepAlive: true,
      },
    },
    {
      path: "sales-report",
      name: "SalesAnalyticsReport",
      component: "/Admin/view/sales/sales-report/index",
      meta: {
        title: "Báo cáo bán hàng",
        icon: "ri:money-cny-circle-line",
        keepAlive: true,
        permission: Permissions.StatisticalView,
      },
    },
  ],
};
