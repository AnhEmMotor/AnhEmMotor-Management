/**
 * RoutingDangKyCốt lõiloại
 *
 * tráchHoạt độngRoutingcủaDangKy、nghiệmtínhvàQuản lý
 *
 * @module router/core/RouteRegistry
 * @author Art Design Pro Team
 */

import type { Router, RouteRecordRaw } from 'vue-router'
import type { AppRouteRecord } from '@/types/router'
import { ComponentLoader } from './ComponentLoader'
import { RouteValidator } from './RouteValidator'
import { RouteTransformer } from './RouteTransformer'

export class RouteRegistry {
  private router: Router
  private componentLoader: ComponentLoader
  private validator: RouteValidator
  private transformer: RouteTransformer
  private removeRouteFns: (() => void)[] = []
  private registered = false

  constructor(router: Router) {
    this.router = router
    this.componentLoader = new ComponentLoader()
    this.validator = new RouteValidator()
    this.transformer = new RouteTransformer(this.componentLoader)
  }

  /**
   * DangKyHoạt độngRouting
   */
  register(menuList: AppRouteRecord[]): void {
    if (this.registered) {
      console.warn('[RouteRegistry] RoutingĐãDangKy，nhảyquatrùngphụcDangKy')
      return
    }

    // nghiệmtínhRoutingCauHinh
    const validationResult = this.validator.validate(menuList)
    if (!validationResult.valid) {
      throw new Error(`RoutingCauHinhnghiệmtínhThatBai: ${validationResult.errors.join(', ')}`)
    }

    // chuyểnđổiđồng thờiDangKyRouting
    const removeRouteFns: (() => void)[] = []

    menuList.forEach((route) => {
      if (route.name && !this.router.hasRoute(route.name)) {
        const routeConfig = this.transformer.transform(route)
        const removeRouteFn = this.router.addRoute(routeConfig as RouteRecordRaw)
        removeRouteFns.push(removeRouteFn)
      }
    })

    this.removeRouteFns = removeRouteFns
    this.registered = true
  }

  /**
   * DichianêncóHoạt độngRouting
   */
  unregister(): void {
    this.removeRouteFns.forEach((fn) => fn())
    this.removeRouteFns = []
    this.registered = false
  }

  /**
   * TìmlàphủĐãDangKy
   */
  isRegistered(): boolean {
    return this.registered
  }

  /**
   * LấyDichiaHàmDanh sách（dùngở store Quản lý）
   */
  getRemoveRouteFns(): (() => void)[] {
    return this.removeRouteFns
  }

  /**
   * tiêughivìĐãDangKy（dùngởXuLy lỗitrườngcảnh，tránhmiễntrùngphụcVui lòngcầu）
   */
  markAsRegistered(): void {
    this.registered = true
  }
}
