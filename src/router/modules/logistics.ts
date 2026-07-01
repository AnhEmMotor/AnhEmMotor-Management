import { AppRouteRecord } from "@/types/router";

export const logisticsRoutes: AppRouteRecord = {
  path: "/logistics",
  name: "LogisticsManagement",
  component: "/index/index",
  meta: {
    title: "menus.logistics.title",
    icon: "ri:truck-line",
  },
  children: [
    {
      path: "dashboard",
      name: "LogisticsDashboard",
      component: "/logistics/dashboard/index",
      meta: {
        title: "menus.logistics.dashboard",
        icon: "ri:dashboard-line",
      },
    },
    {
      path: "fulfillment",
      name: "ParcelFulfillment",
      component: "/logistics/fulfillment/index",
      meta: {
        title: "menus.logistics.fulfillment",
        icon: "ri:box-3-line",
        showBadge: true,
        showTextBadge: "5",
      },
    },
    {
      path: "tracking",
      name: "ShipmentTracking",
      component: "/logistics/tracking/index",
      meta: {
        title: "menus.logistics.tracking",
        icon: "ri:map-pin-time-line",
      },
    },
    {
      path: "returns",
      name: "ReverseLogistics",
      component: "/logistics/returns/index",
      meta: {
        title: "menus.logistics.returns",
        icon: "ri:arrow-go-back-line",
        showBadge: true,
        showTextBadge: "1",
      },
    },
    {
      path: "returns/:id",
      name: "ReturnDetail",
      component: "/logistics/returns/detail",
      meta: {
        title: "Chi tiết đơn hoàn",
        hidden: true,
        activeMenu: "/logistics/returns",
      },
    },
    {
      path: "carrier-settings",
      name: "CarrierSettings",
      component: "/logistics/carrier-settings/index",
      meta: {
        title: "menus.logistics.carrierSettings",
        icon: "ri:settings-4-line",
      },
    },
  ],
};
