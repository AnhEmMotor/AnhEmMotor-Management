/**
 * RoutingQuyenHannghiệmtínhmôkhối
 *
 * gợicungRoutingQuyenHannghiệmtínhvàđườngTìmcôngnăng
 *
 * ## chủcầncôngnăng
 *
 * - nghiệmtínhđườnglàphủtạiNguoiDungMenuQuyenHantrong
 * - cấuxâyMenuđườngtậphợp（hóaXuLy）
 * - chiếctrìHoạt độngRoutingTham sốngựaPhân
 * - đườngtrướchậu tốngựaPhân
 *
 * ## khiếndùngtrườngcảnh
 *
 * - RoutinggiữvệtrongnghiệmtínhNguoiDungQuyenHan
 * - Hoạt độngRoutingDangKysaucủaQuyenHanTìm
 * - PhòngthúcNguoiDungTruy cậpvôQuyenHancủatrangmặt
 *
 * @module router/core/RoutePermissionValidator
 * @author Art Design Pro Team
 */

import type { AppRouteRecord } from '@/types/router'

/**
 * RoutingQuyenHannghiệmtínhthiết bị
 */
export class RoutePermissionValidator {
  /**
   * nghiệmtínhđườnglàphủtạiNguoiDungMenuQuyenHantrong
   * @param targetPath mụctiêuđường
   * @param menuList MenuDanh sách
   * @returns làphủcóQuyenHanTruy cập
   */
  static hasPermission(targetPath: string, menuList: AppRouteRecord[]): boolean {
    // đườngđầucuốicho phéphứaTruy cập
    if (targetPath === '/') {
      return true
    }

    return this.matchRoute(targetPath, menuList)
  }

  /**
   * cấuxâyMenuđườngtậphợp（hóaXuLy）
   * @param menuList MenuDanh sách
   * @param pathSet đườngtậphợp
   * @returns đườngtậphợp
   */
  static buildMenuPathSet(
    menuList: AppRouteRecord[],
    pathSet: Set<string> = new Set()
  ): Set<string> {
    if (!Array.isArray(menuList) || menuList.length === 0) {
      return pathSet
    }

    for (const menuItem of menuList) {
      if (!menuItem.path) {
        continue
      }

      // tiêuthuậnhóađườngđồng thờiThêm mớiđếntậphợp
      const menuPath = menuItem.path.startsWith('/') ? menuItem.path : `/${menuItem.path}`
      pathSet.add(menuPath)

      // chuyểnvềXuLytửMenu
      if (menuItem.children?.length) {
        this.buildMenuPathSet(menuItem.children, pathSet)
      }
    }

    return pathSet
  }

  /**
   * TìmmụctiêuđườnglàphủngựaPhântậphợptrongcủanào đóchiếcđườngtrướchậu tố
   * dùngởchiếctrìHoạt độngRoutingTham sốngựaPhân，nếu /user/123 ngựaPhân /user
   * @param targetPath mụctiêuđường
   * @param pathSet đườngtậphợp
   * @returns làphủngựaPhân
   */
  static checkPathPrefix(targetPath: string, pathSet: Set<string>): boolean {
    // khắpLịchđườngtậphợp，Tìmlàphủcótrướchậu tốngựaPhân
    for (const menuPath of pathSet) {
      if (targetPath.startsWith(`${menuPath}/`)) {
        return true
      }
    }
    return false
  }

  /**
   * chuyểnvềngựaPhânRoutingCauHinh，chiếctrìẨnRoutingvàHoạt độngTham sốRouting
   */
  static matchRoute(targetPath: string, routes: AppRouteRecord[]): boolean {
    if (!Array.isArray(routes) || routes.length === 0) {
      return false
    }

    for (const route of routes) {
      if (!route.path) {
        continue
      }

      const routePath = route.path.startsWith('/') ? route.path : `/${route.path}`

      if (
        routePath === targetPath ||
        this.isDynamicRouteMatch(targetPath, routePath) ||
        targetPath.startsWith(`${routePath}/`)
      ) {
        return true
      }

      if (route.children?.length && this.matchRoute(targetPath, route.children)) {
        return true
      }
    }

    return false
  }

  /**
   * TìmmụctiêuđườnglàphủngựaPhânHoạt độngTham sốRouting，nếu /demo/123 ngựaPhân /demo/:id
   */
  static isDynamicRouteMatch(targetPath: string, routePath: string): boolean {
    if (!routePath.includes(':')) {
      return false
    }

    const pattern = routePath
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/:([^/]+)/g, '[^/]+')
      .replace(/\\\*/g, '.*')

    return new RegExp(`^${pattern}$`).test(targetPath)
  }

  /**
   * nghiệmtínhđồng thờiQuay lạicóhiệucủađường
   * nếuquảmụctiêuđườngvôQuyenHan，Quay lạiTrangChuđường
   * @param targetPath mụctiêuđường
   * @param menuList MenuDanh sách
   * @param homePath TrangChuđường
   * @returns nghiệmtínhsaucủađường
   */
  static validatePath(
    targetPath: string,
    menuList: AppRouteRecord[],
    homePath: string = '/'
  ): { path: string; hasPermission: boolean } {
    const hasPermission = this.hasPermission(targetPath, menuList)

    if (hasPermission) {
      return { path: targetPath, hasPermission: true }
    }

    return { path: homePath, hasPermission: false }
  }
}
