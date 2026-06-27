import { AppRouteRecord } from "@/types/router";
import { dashboardRoutes } from "./dashboard";
import { templateRoutes } from "./template";
import { widgetsRoutes } from "./widgets";
import { examplesRoutes } from "./examples";
import { systemRoutes } from "./system";
import { authorizationRoutes } from "./authorization";
import { marketingMenu } from "@/modules/Marketing/Menu";
import { resultRoutes } from "./result";
import { exceptionRoutes } from "./exception";
import { safeguardRoutes } from "./safeguard";
import { contractRoutes } from "./contract";
import { orderMenu } from "@/modules/Order/Menu";
import { warehouseMenu } from "@/modules/Warehouse/Menu";
import { accountancyMenu } from "@/modules/Accountant/Menu";

import { serviceRoutes } from "./service";
import { reportingRoutes } from "./reporting";
import { hrRoutes } from "./hr";
import { helpRoutes } from "./help";
import { salesRoutes } from "./sales";

import { factoryMenu } from "@/modules/Factory/Menu";

const coreRoutes: AppRouteRecord[] = [
  dashboardRoutes,
  ...orderMenu,
  serviceRoutes,
  ...factoryMenu,
  ...warehouseMenu,
  ...accountancyMenu,
  salesRoutes,
  authorizationRoutes,
  hrRoutes,
  contractRoutes,
  ...marketingMenu,
  reportingRoutes,
];

const developmentRoutes: AppRouteRecord[] = [
  templateRoutes,
  widgetsRoutes,
  examplesRoutes,
  systemRoutes,
  resultRoutes,
  exceptionRoutes,
  safeguardRoutes,
  ...helpRoutes,
];

export const routeModules: AppRouteRecord[] = [
  ...coreRoutes,
  ...(import.meta.env.DEV ? developmentRoutes : []),
];
