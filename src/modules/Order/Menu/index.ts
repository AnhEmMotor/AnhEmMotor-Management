import { AppRouteRecord } from "@/types/router";

export const orderMenu: AppRouteRecord[] = [
  {
    path: "/Order",
    name: "Order",
    component: "/index/index",
    meta: {
      title: "Order",
      icon: "ri:file-list-3-line",
      roles: ["Admin", "SuperAdmin"],
      permissions: ["Permissions.Order"],
    },
    redirect: "/Order/management/list",
    children: [
      {
        path: "management",
        name: "OrderManagement",
        meta: {
          title: "Quản lý đơn hàng",
          icon: "ri:file-list-3-line",
        },
        redirect: "/Order/management/list",
        children: [
          {
            path: "list",
            name: "OrderList",
            component: "/Order/view/order/list/index",
            meta: {
              title: "Đơn đặt hàng Online",
              icon: "ri:shopping-cart-line",
              keepAlive: true,
            },
          },
          {
            path: "deposit-settings",
            name: "OrderDepositSettings",
            component: "/sales-settings/deposit/index",
            meta: {
              title: "Cài đặt đặt cọc",
              icon: "ri:secure-payment-line",
              keepAlive: true,
            },
          },
          {
            path: "invoice",
            name: "OrderProductInvoice",
            component: "/Order/view/product/invoice/index",
            meta: {
              title: "Hóa đơn mua hàng",
              icon: "ri:bill-line",
              keepAlive: true,
              roles: ["Admin", "SuperAdmin"],
            },
          },
          {
            path: "returns",
            name: "OrderLogisticsReturns",
            component: "/Order/view/logistics/returns/index",
            meta: {
              title: "Trả hàng - Hoàn trả",
              icon: "ri:arrow-go-back-line",
              keepAlive: true,
              showBadge: true,
              showTextBadge: "1",
            },
          },
          {
            path: "contract",
            name: "OrderContract",
            component: "/Order/view/order/contract/index",
            meta: {
              title: "Hợp đồng mua xe",
              icon: "ri:file-paper-2-line",
              keepAlive: true,
            },
          },
          {
            path: "contract/preview/:id?",
            name: "SalesContractPreview",
            component: "/Order/view/order/contract/contract-preview",
            meta: {
              title: "Chi tiết Hợp đồng",
              icon: "ri:file-search-line",
              isHide: true,
            },
          },
        ],
      },
      {
        path: "product",
        name: "OrderProduct",
        meta: {
          title: "Quản lý sản phẩm",
          icon: "ri:shopping-bag-3-line",
          roles: ["Admin", "SuperAdmin"],
        },
        redirect: "/Order/product/list",
        children: [
          {
            path: "list",
            name: "OrderProductList",
            component: "/Order/view/product/list/index",
            meta: {
              title: "Danh sách sản phẩm",
              icon: "ri:list-unordered",
              keepAlive: true,
            },
          },
        ],
      },
      {
        path: "logistics",
        name: "OrderLogistics",
        meta: {
          title: "Quản lý vận chuyển",
          icon: "ri:truck-line",
          roles: ["Admin", "SuperAdmin"],
        },
        redirect: "/Order/logistics/dashboard",
        children: [
          {
            path: "dashboard",
            name: "OrderLogisticsDashboard",
            component: "/Order/view/logistics/dashboard/index",
            meta: {
              title: "Dashboard",
              icon: "ri:dashboard-line",
              keepAlive: true,
            },
          },
          {
            path: "tracking",
            name: "OrderLogisticsTracking",
            component: "/Order/view/logistics/tracking/index",
            meta: {
              title: "Theo dõi vận chuyển",
              icon: "ri:map-pin-time-line",
              keepAlive: true,
            },
          },
          {
            path: "fulfillment",
            name: "OrderLogisticsFulfillment",
            component: "/Order/view/logistics/fulfillment/index",
            meta: {
              title: "Hoàn thành đơn hàng",
              icon: "ri:box-3-line",
              keepAlive: true,
              showBadge: true,
              showTextBadge: "5",
            },
          },
          {
            path: "carrier-settings",
            name: "OrderLogisticsCarrierSettings",
            component: "/Order/view/logistics/carrier-settings/index",
            meta: {
              title: "Cài đặt nhà vận chuyển",
              icon: "ri:settings-4-line",
              keepAlive: true,
            },
          },
        ],
      },
      {
        path: "statistics",
        name: "OrderStatistics",
        component: "/Order/view/order/statistics/index",
        meta: {
          title: "Thống kê đơn hàng",
          icon: "ri:bar-chart-line",
          keepAlive: true,
        },
      },
    ],
  },
];

export default orderMenu;
