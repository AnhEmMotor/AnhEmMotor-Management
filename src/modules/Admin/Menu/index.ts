import { AppRouteRecord } from "@/types/router";
import { dashboardRoutes } from "@/router/modules/dashboard";
import { salesRoutes } from "@/router/modules/sales";
import { contractRoutes } from "@/router/modules/contract";
import { serviceRoutes } from "@/router/modules/service";
import { reportingRoutes } from "@/router/modules/reporting";
import { hrRoutes } from "@/router/modules/hr";
import { authorizationRoutes } from "@/router/modules/authorization";

// Admin Menu định nghĩa menu hiển thị cho vai trò Admin
export const adminMenu: AppRouteRecord[] = [
  dashboardRoutes,
  salesRoutes,
  contractRoutes,
  serviceRoutes,
  reportingRoutes,
  hrRoutes,
  authorizationRoutes,
];

export default adminMenu;
