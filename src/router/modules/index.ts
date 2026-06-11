import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { templateRoutes } from './template'
import { widgetsRoutes } from './widgets'
import { examplesRoutes } from './examples'
import { systemRoutes } from './system'
import { authorizationRoutes } from './authorization'
import { contentRoutes } from './content'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'
import { safeguardRoutes } from './safeguard'
import { productRoutes } from './product'
import { customerRoutes } from './customer'
import { hrRoutes } from './hr'
import { helpRoutes } from './help'
import { inventoryRoutes } from './inventory'
import { salesRoutes } from './sales'

const coreRoutes: AppRouteRecord[] = [
  dashboardRoutes,
  productRoutes,
  inventoryRoutes,
  salesRoutes,
  authorizationRoutes,
  hrRoutes,
  customerRoutes,
  contentRoutes
]

const developmentRoutes: AppRouteRecord[] = [
  templateRoutes,
  widgetsRoutes,
  examplesRoutes,
  systemRoutes,
  resultRoutes,
  exceptionRoutes,
  safeguardRoutes,
  ...helpRoutes
]

export const routeModules: AppRouteRecord[] = [
  ...coreRoutes,
  ...(import.meta.env.DEV ? developmentRoutes : [])
]
