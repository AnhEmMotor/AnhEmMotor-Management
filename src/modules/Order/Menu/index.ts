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
    },
    redirect: "/Order/list",
    children: [
      {
        path: "list",
        name: "OrderList",
        meta: {
          title: "Quản lý đơn hàng",
          icon: "ri:list-check",
          keepAlive: true,
        },
        redirect: "/Order/list/draft",
        children: [
          {
            path: "draft",
            name: "OrderDraft",
            component: "/sales/draft/index",
            meta: {
              title: "Phiếu tạm",
              icon: "ri:draft-line",
              keepAlive: true,
            },
          },
          {
            path: "order",
            name: "OrderSales",
            component: "/sales/order/index",
            meta: {
              title: "Phiếu bán hàng",
              icon: "ri:file-list-3-line",
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
        path: "contract",
        name: "OrderContract",
        component: "/Order/view/order/contract/index",
        meta: {
          title: "Hợp đồng mua xe",
          icon: "ri:file-contract-line",
          keepAlive: true,
        },
      },
      {
        path: "product",
        name: "OrderProduct",
        meta: {
          title: "Quản lý sản phẩm",
          icon: "ri:shopping-bag-3-line",
          roles: ["Admin", "SuperAdmin"],
        },
        redirect: "/Order/product/type",
        children: [
          {
            path: "type",
            name: "OrderProductType",
            component: "/Order/view/product/type/index",
            meta: {
              title: "Danh mục sản phẩm",
              icon: "ri:folders-line",
              keepAlive: true,
            },
          },
          {
            path: "brand",
            name: "OrderProductBrand",
            component: "/Order/view/product/brand/index",
            meta: {
              title: "Thương hiệu",
              icon: "ri:price-tag-3-line",
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
    ],
  },
];

export default orderMenu;
