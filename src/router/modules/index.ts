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
import { contactRoutes } from './contact'
import { contractRoutes } from './contract'
import { marketingRoutes } from './marketing'
import { hrRoutes } from './hr'
import { helpRoutes } from './help'
import { inventoryRoutes } from './inventory'
import { serviceRoutes } from './service'
import { reportingRoutes } from './reporting'

export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  productRoutes,
  serviceRoutes,
  inventoryRoutes,
  authorizationRoutes,
  hrRoutes,
  customerRoutes,
  contactRoutes,
  contractRoutes,
  articleRoutes,
  marketingRoutes,
  templateRoutes,
  widgetsRoutes,
  examplesRoutes,
  systemRoutes,
  resultRoutes,
  exceptionRoutes,
  safeguardRoutes,
  reportingRoutes,
  ...helpRoutes,
]
