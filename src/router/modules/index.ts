import { AppRouteRecord } from "@/types/router";
import { dashboardRoutes } from "./dashboard";
import { templateRoutes } from "./template";
import { widgetsRoutes } from "./widgets";
import { examplesRoutes } from "./examples";
import { systemRoutes } from "./system";
import { authorizationRoutes } from "./authorization";
import { contentRoutes } from "./content";
import { resultRoutes } from "./result";
import { exceptionRoutes } from "./exception";
import { safeguardRoutes } from "./safeguard";
import { productRoutes } from "./product";
import { customerRoutes } from "./customer";
import { contactRoutes } from "./contact";
import { contractRoutes } from "./contract";

import { serviceRoutes } from "./service";
import { reportingRoutes } from "./reporting";
import { logisticsRoutes } from "./logistics";
import { hrRoutes } from "./hr";
import { helpRoutes } from "./help";
import { inventoryRoutes } from "./inventory";
import { salesRoutes } from "./sales";

import { factoryMenu } from "@/modules/Factory/Menu";

const coreRoutes: AppRouteRecord[] = [
  dashboardRoutes,
  ...productRoutes,
  serviceRoutes,
  ...factoryMenu,
  inventoryRoutes,
  salesRoutes,
  authorizationRoutes,
  hrRoutes,
  customerRoutes,
  contactRoutes,
  contractRoutes,
  contentRoutes,
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
  logisticsRoutes,
  ...helpRoutes,
];

export const routeModules: AppRouteRecord[] = [
  ...coreRoutes,
  ...(import.meta.env.DEV ? developmentRoutes : []),
];
