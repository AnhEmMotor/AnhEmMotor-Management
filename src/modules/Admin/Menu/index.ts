import { AppRouteRecord } from '@/types/router';
import { dashboardRoutes } from '@/router/modules/dashboard';
import { salesRoutes } from '@/router/modules/sales';
import { contractRoutes } from '@/router/modules/contract';
import { adminServiceRoutes } from '@/router/modules/admin-service';
import { reportingRoutes } from '@/router/modules/reporting';
import { hrRoutes } from '@/router/modules/hr';
import { authorizationRoutes } from '@/router/modules/authorization';
import { adminManualRoutes } from '@/router/modules/admin-manual';

export const adminMenu: AppRouteRecord[] = [
  adminManualRoutes,
  dashboardRoutes,
  salesRoutes,
  contractRoutes,
  adminServiceRoutes,
  reportingRoutes,
  hrRoutes,
  authorizationRoutes,
];

export default adminMenu;
