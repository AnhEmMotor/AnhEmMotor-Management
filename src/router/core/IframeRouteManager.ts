/**
 * Iframe RoutingQuản lýthiết bị
 *
 * tráchQuản lý iframe loạikiểucủaRouting
 *
 * @module router/core/IframeRouteManager
 * @author Art Design Pro Team
 */

import type { AppRouteRecord } from '@/types/router'

export class IframeRouteManager {
  private static instance: IframeRouteManager
  private iframeRoutes: AppRouteRecord[] = []

  private constructor() {}

  static getInstance(): IframeRouteManager {
    if (!IframeRouteManager.instance) {
      IframeRouteManager.instance = new IframeRouteManager()
    }
    return IframeRouteManager.instance
  }

  /**
   * Thêm mới iframe Routing
   */
  add(route: AppRouteRecord): void {
    if (!this.iframeRoutes.find((r) => r.path === route.path)) {
      this.iframeRoutes.push(route)
    }
  }

  /**
   * Lấynêncó iframe Routing
   */
  getAll(): AppRouteRecord[] {
    return this.iframeRoutes
  }

  /**
   * liệuđườngTimKiem iframe Routing
   */
  findByPath(path: string): AppRouteRecord | undefined {
    return this.iframeRoutes.find((route) => route.path === path)
  }

  /**
   * xóakhôngnêncó iframe Routing
   */
  clear(): void {
    this.iframeRoutes = []
  }

  /**
   * Lưutồnđến sessionStorage
   */
  save(): void {
    if (this.iframeRoutes.length > 0) {
      sessionStorage.setItem('iframeRoutes', JSON.stringify(this.iframeRoutes))
    }
  }

  /**
   * từ sessionStorage Loading
   */
  load(): void {
    try {
      const data = sessionStorage.getItem('iframeRoutes')
      if (data) {
        this.iframeRoutes = JSON.parse(data)
      }
    } catch (error) {
      console.error('[IframeRouteManager] Loading iframe RoutingThatBai:', error)
      this.iframeRoutes = []
    }
  }
}
