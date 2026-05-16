/**
 * Routingnghiệmtínhthiết bị
 *
 * tráchnghiệmtínhRoutingCauHinhcủahợppháptính
 *
 * @module router/core/RouteValidator
 * @author Art Design Pro Team
 */

import type { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export class RouteValidator {
  // dùngởGhi chépĐãquaGợi ýquacủaRouting，tránhmiễntrùngphụcGợi ý
  private warnedRoutes = new Set<string>()

  /**
   * nghiệmtínhRoutingCauHinh
   */
  validate(routes: AppRouteRecord[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // đotrùngphụcRouting
    this.checkDuplicates(routes, errors, warnings)

    // đoComponentCauHinh
    this.checkComponents(routes, errors, warnings)

    // đonhúngbộMenucủa /index/index CauHinh
    this.checkNestedIndexComponent(routes)

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * đotrùngphụcRouting
   */
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

        // danhtêntrùngphụcđo
        if (route.name) {
          const routeName = String(route.name)
          if (routeNameMap.has(routeName)) {
            warnings.push(`Routingthựctênlàm lạilời: "${routeName}" (${fullPath})`)
          } else {
            routeNameMap.set(routeName, fullPath)
          }
        }

        // Componentđườngtrùngphụcđo
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

        // chuyểnvềXuLytửRouting
        if (route.children?.length) {
          checkRoutes(route.children, fullPath)
        }
      })
    }

    checkRoutes(routes, parentPath)
  }

  /**
   * đoComponentCauHinh
   */
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

      // nếuquảCauHinhrồi component，vôcầnsoátnghiệm
      if (route.component) {
        // chuyểnvềTìmtửRouting
        if (route.children?.length) {
          const fullPath = this.resolvePath(parentPath, route.path || '')
          this.checkComponents(route.children, errors, warnings, fullPath)
        }
        return
      }

      // mộtcấpMenu：tấtphảiđịnh Layout，chiaphilàngoàiliênhoặc iframe
      if (parentPath === '' && !hasExternalLink && !isIframe) {
        errors.push(`mộtcấpMenu(${routePath}) thiếuthiểu component，tấtphảihướng ${RoutesAlias.Layout}`)
        return
      }

      // phimộtcấpMenu：nếuquảđãKhônglàngoàiliên、iframe，cũngkhôngcótửRouting，tấtphảiCauHinh component
      if (!hasExternalLink && !isIframe && !hasChildren) {
        errors.push(`Routing(${routePath}) thiếuthiểu component CauHinh`)
      }

      // chuyểnvềTìmtửRouting
      if (route.children?.length) {
        const fullPath = this.resolvePath(parentPath, route.path || '')
        this.checkComponents(route.children, errors, warnings, fullPath)
      }
    })
  }

  /**
   * đonhúngbộMenucủa Layout ComponentCauHinh
   * chỉcómộtcấpMenumớinăngkhiếndùng Layout，haicấpvàlấydướiMenuKhôngnăngkhiếndùng
   */
  private checkNestedIndexComponent(routes: AppRouteRecord[], level = 1): void {
    routes.forEach((route) => {
      // TìmhaicấpvàlấydướiMenulàphủLỗikhiếndùngrồi Layout
      if (level > 1 && route.component === RoutesAlias.Layout) {
        this.logLayoutError(route, level)
      }

      // chuyểnvềTìmtửRouting
      if (route.children?.length) {
        this.checkNestedIndexComponent(route.children, level + 1)
      }
    })
  }

  /**
   * nhậpra Layout ComponentCauHinhLỗiNhatKy
   */
  private logLayoutError(route: AppRouteRecord, level: number): void {
    const routeName = String(route.name || route.path || 'ChưabáoRouting')
    const routeKey = `${routeName}_${route.path}`

    // tránhmiễntrùngphụcGợi ý
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

  /**
   * đườnggiảiphân
   */
  private resolvePath(parent: string, child: string): string {
    return [parent.replace(/\/$/, ''), child.replace(/^\//, '')].filter(Boolean).join('/')
  }
}
