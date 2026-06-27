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
      path: "online-orders",
      name: "OnlineOrders",
      component: "/Admin/view/sales/online-orders/index",
      meta: {
        title: "Đơn đặt hàng Online",
        icon: "ri:shopping-cart-line",
        keepAlive: true,
      },
    },
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
      component: "/sales/invoices/index",
      meta: {
        title: "Hóa đơn bán hàng",
        icon: "ri:receipt-line",
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
