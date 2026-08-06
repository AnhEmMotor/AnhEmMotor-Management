import { AppRouteRecord } from "@/types/router";

export const warehouseManualRoutes: AppRouteRecord[] = [
  {
    path: "manual",
    name: "WarehouseManual",
    component: "/Warehouse/view/manual/overview/OverviewPage",
    meta: {
      title: "Hướng dẫn sử dụng",
      icon: "ri:book-open-line",
      keepAlive: true,
    },
  },
  {
    path: "manual/:id",
    name: "WarehouseManualSection",
    component: "/Warehouse/view/manual/index",
    meta: {
      title: "Chi tiết",
      isHide: true,
      isHideTab: true,
      activePath: "/Warehouse/manual",
    },
  },
];
