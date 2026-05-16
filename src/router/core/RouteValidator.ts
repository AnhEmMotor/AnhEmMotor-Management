import type { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export class RouteValidator {
  private warnedRoutes = new Set<string>()

  validate(routes: AppRouteRecord[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    this.checkDuplicates(routes, errors, warnings)

    this.checkComponents(routes, errors, warnings)

    this.checkNestedIndexComponent(routes)

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  private checkDuplicates(
    routes: AppRouteRecord[],
    errors: string[],
    warnings: string[],
    parentPath = ''
  ): void {
    const routeNameMap = new Map<string, string>()
    const componentPathMap = new Map<string, string>()

    const checkRoutes = (routes: AppRouteRecord[], parentPath = '') => {
      routes.forEach((route) => {
        const currentPath = route.path || ''
        const fullPath = this.resolvePath(parentPath, currentPath)

        if (route.name) {
          const routeName = String(route.name)
          if (routeNameMap.has(routeName)) {
            warnings.push(`Routingthựctênlàm lạilời: "${routeName}" (${fullPath})`)
          } else {
            routeNameMap.set(routeName, fullPath)
          }
        }

        if (route.component && typeof route.component === 'string') {
          const componentPath = route.component
          if (componentPath !== RoutesAlias.Layout) {
            const componentKey = `${parentPath}:${componentPath}`
            if (componentPathMap.has(componentKey)) {
              warnings.push(`Componentđườnglàm lạilời: "${componentPath}" (${fullPath})`)
            } else {
              componentPathMap.set(componentKey, fullPath)
            }
          }
        }

        if (route.children?.length) {
          checkRoutes(route.children, fullPath)
        }
      })
    }

    checkRoutes(routes, parentPath)
  }

  private checkComponents(
    routes: AppRouteRecord[],
    errors: string[],
    warnings: string[],
    parentPath = ''
  ): void {
    routes.forEach((route) => {
      const hasExternalLink = !!route.meta?.link?.trim()
      const hasChildren = Array.isArray(route.children) && route.children.length > 0
      const routePath = route.path || '[ChưaĐịnh nghĩađường]'
      const isIframe = route.meta?.isIframe

      if (route.component) {
        if (route.children?.length) {
          const fullPath = this.resolvePath(parentPath, route.path || '')
          this.checkComponents(route.children, errors, warnings, fullPath)
        }
        return
      }

      if (parentPath === '' && !hasExternalLink && !isIframe) {
        errors.push(
          `mộtcấpMenu(${routePath}) thiếuthiểu component，tấtphảihướng ${RoutesAlias.Layout}`
        )
        return
      }

      if (!hasExternalLink && !isIframe && !hasChildren) {
        errors.push(`Routing(${routePath}) thiếuthiểu component CauHinh`)
      }

      if (route.children?.length) {
        const fullPath = this.resolvePath(parentPath, route.path || '')
        this.checkComponents(route.children, errors, warnings, fullPath)
      }
    })
  }

  private checkNestedIndexComponent(routes: AppRouteRecord[], level = 1): void {
    routes.forEach((route) => {
      if (level > 1 && route.component === RoutesAlias.Layout) {
        this.logLayoutError(route, level)
      }

      if (route.children?.length) {
        this.checkNestedIndexComponent(route.children, level + 1)
      }
    })
  }

  private logLayoutError(route: AppRouteRecord, level: number): void {
    const routeName = String(route.name || route.path || 'ChưabáoRouting')
    const routeKey = `${routeName}_${route.path}`

    if (this.warnedRoutes.has(routeKey)) return
    this.warnedRoutes.add(routeKey)

    const menuTitle = route.meta?.title || routeName
    const routePath = route.path || '/'

    console.error(
      `[RoutingCauHinhLỗi] Menu "${menuTitle}" (name: ${routeName}, path: ${routePath}) CauHinhLỗi\n` +
        `  hỏiđề: ${level}cấpMenuKhôngnăngkhiếndùng ${RoutesAlias.Layout} làmvì component\n` +
        `  Mô tả: chỉcómộtcấpMenumớinăngkhiếndùng ${RoutesAlias.Layout}，haicấpvàlấydướiMenuứngnênhướngcụthểcủaComponentđường\n` +
        `  khitrướcCauHinh: component: '${RoutesAlias.Layout}'\n` +
        `  ứngnênsửavì: component: '/your/component/path' hoặcgiữkhông ''（nếuquảlàmụclụcMenu）`
    )
  }

  private resolvePath(parent: string, child: string): string {
    return [parent.replace(/\/$/, ''), child.replace(/^\//, '')].filter(Boolean).join('/')
  }
}
