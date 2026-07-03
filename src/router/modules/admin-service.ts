import { AppRouteRecord } from "@/types/router";
import { Permissions } from "@/domain/constants/permissions";

export const adminServiceRoutes: AppRouteRecord = {
  path: "/admin/service",
  name: "AdminService",
  component: "/index/index",
  meta: {
    title: "Thống kê Xưởng",
    icon: "ri:bar-chart-grouped-line",
  },
  children: [
    {
      path: "service-dashboard",
      name: "AdminServiceDashboard",
      component: "/Factory/view/service/workshop/dashboard/index",
      meta: {
        title: "Dashboard xưởng",
        icon: "ri:dashboard-line",
        keepAlive: true,
      },
    },
    {
      path: "workshop-report",
      name: "AdminServiceWorkshopReport",
      component: "/Accountant/view/reporting/workshop",
      meta: {
        title: "Báo cáo xưởng dịch vụ",
        icon: "ri:tools-line",
        keepAlive: true,
        permission: Permissions.StatisticalView,
      },
    },
  ],
};
