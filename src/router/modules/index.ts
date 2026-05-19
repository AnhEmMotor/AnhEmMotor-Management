import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { templateRoutes } from './template'
import { widgetsRoutes } from './widgets'
import { examplesRoutes } from './examples'
import { systemRoutes } from './system'
import { authorizationRoutes } from './authorization'
import { articleRoutes } from './article'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'
import { safeguardRoutes } from './safeguard'
import { productRoutes } from './product'
import { customerRoutes } from './customer'
import { marketingRoutes } from './marketing'
import { hrRoutes } from './hr'
import { helpRoutes } from './help'
import { inventoryRoutes } from './inventory'

export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  productRoutes,
  inventoryRoutes,
  authorizationRoutes,
  hrRoutes,
  customerRoutes,
  articleRoutes,
  marketingRoutes,
  templateRoutes,
  widgetsRoutes,
  examplesRoutes,
  systemRoutes,
  resultRoutes,
  exceptionRoutes,
  safeguardRoutes,
  ...helpRoutes
]
