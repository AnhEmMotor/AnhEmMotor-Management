import type { Router, RouteLocationNormalized } from 'vue-router'
import { nextTick } from 'vue'
import NProgress from 'nprogress'
import { useSettingStore } from '@/application/store/setting'
import { useUserStore } from '@/application/store/user'
import { useMenuStore } from '@/application/store/menu'
import { setWorktab } from '@/utils/navigation'
import { setPageTitle } from '@/utils/router'
import { RoutesAlias } from '../routesAlias'
import { staticRoutes } from '../routes/staticRoutes'
import { loadingService } from '@/utils/ui'
import { useCommon } from '@/hooks/core/useCommon'
import { useWorktabStore } from '@/application/store/worktab'
import { fetchGetUserInfo } from '@/infrastructure/api/auth'
import { ApiStatus } from '@/utils/http/status'
import { isHttpError } from '@/utils/http/error'
import { RouteRegistry, MenuProcessor, IframeRouteManager, RoutePermissionValidator } from '../core'

let routeRegistry: RouteRegistry | null = null

const menuProcessor = new MenuProcessor()

let pendingLoading = false

let routeInitFailed = false

let routeInitInProgress = false

export function getPendingLoading(): boolean {
  return pendingLoading
}

export function resetPendingLoading(): void {
  pendingLoading = false
}

export function getRouteInitFailed(): boolean {
  return routeInitFailed
}

export function resetRouteInitState(): void {
  routeInitFailed = false
  routeInitInProgress = false
}

export function setupBeforeEachGuard(router: Router): void {
  routeRegistry = new RouteRegistry(router)

  window.addEventListener('auth:permissions-changed', async () => {
    try {
      const menuList = await menuProcessor.getMenuList()
      const menuStore = useMenuStore()
      menuStore.setMenuList(menuList)

      const currentRoute = router.currentRoute.value
      if (currentRoute.matched.length > 0) {
        const hasAccess = RoutePermissionValidator.hasPermission(currentRoute.path, menuList)
        if (!hasAccess) {
          const { homePath } = useCommon()
          router.push(homePath.value || '/')
        }
      }
    } catch (err) {
      console.error('Failed to regenerate menus on permission change:', err)
    }
  })

  router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    try {
      return await handleRouteGuard(to, from, router)
    } catch (error) {
      console.error('[RouteGuard] Routing error:', error)
      closeLoading()
      return { name: 'Exception500' }
    }
  })
}

function closeLoading(): void {
  if (pendingLoading) {
    nextTick(() => {
      loadingService.hideLoading()
      pendingLoading = false
    })
  }
}

async function handleRouteGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  router: Router,
): Promise<any> {
  const settingStore = useSettingStore()
  const userStore = useUserStore()

  if (settingStore.showNprogress) {
    NProgress.start()
  }

  const loginRedirect = handleLoginStatus(to, userStore)
  if (loginRedirect) {
    return loginRedirect
  }

  if (routeInitFailed) {
    if (to.matched.length > 0) {
      return true
    } else {
      return { name: 'Exception500', replace: true }
    }
  }

  if (!routeRegistry?.isRegistered() && userStore.isLogin) {
    if (routeInitInProgress) {
      return false
    }
    return await handleDynamicRoutes(to, router)
  }

  const rootRedirect = handleRootPathRedirect(to)
  if (rootRedirect) {
    return rootRedirect
  }

  if (to.matched.length > 0) {
    setWorktab(to)
    setPageTitle(to)
    return true
  }

  return { name: 'Exception404' }
}

function handleLoginStatus(
  to: RouteLocationNormalized,
  userStore: ReturnType<typeof useUserStore>,
): any {
  if (userStore.isLogin || to.path === RoutesAlias.Login || isStaticRoute(to.path)) {
    return null
  }

  userStore.logOut()
  return {
    name: 'Login',
    query: { redirect: to.fullPath },
  }
}

function isStaticRoute(path: string): boolean {
  const checkRoute = (routes: any[], targetPath: string): boolean => {
    return routes.some((route) => {
      if (route.name === 'Exception404') {
        return true
      }

      const routePath = route.path
      const pattern = routePath.replace(/:[^/]+/g, '[^/]+').replace(/\*/g, '.*')
      const regex = new RegExp(`^${pattern}$`)

      if (regex.test(targetPath)) {
        return true
      }
      if (route.children && route.children.length > 0) {
        return checkRoute(route.children, targetPath)
      }
      return false
    })
  }

  return checkRoute(staticRoutes, path)
}

async function handleDynamicRoutes(to: RouteLocationNormalized, router: Router): Promise<any> {
  routeInitInProgress = true

  pendingLoading = true
  loadingService.showLoading()

  try {
    const [, menuListRaw] = await Promise.all([fetchUserInfo(), menuProcessor.getMenuList()])

    let menuList = (() => {
      try {
        if (!Array.isArray(menuListRaw)) return menuListRaw as any

        const ensureReporting = (items: any[]): any[] => {
          if (!Array.isArray(items)) return items

          const hasReporting = items.some(
            (x) =>
              x?.path === '/reporting' || x?.children?.some((c: any) => c?.path === '/reporting'),
          )

          if (hasReporting) return items

          const injectedNode = {
            path: '/reporting',
            name: 'Reporting',
            component: '@/views/index/index.vue',
            meta: {
              title: 'menus.dashboard.analytics',
              icon: 'trend-charts',
              permission: 'Reporting.View',
            },
            children: [
              {
                path: 'dashboard',
                name: 'ReportingDashboard',
                component: () => import('@/views/analytics-reporting/dashboard/index.vue'),
                meta: {
                  title: 'Dashboard Tổng quan',
                  icon: 'ri:dashboard-line',
                  permission: 'Reporting.Dashboard',
                },
              },
              {
                path: 'expense',
                name: 'ExpenseManagement',
                component: () => import('@/views/analytics-reporting/expense/index.vue'),
                meta: {
                  title: 'Chi phí vận hành',
                  icon: 'ri:money-dollar-circle-line',
                  permission: 'Reporting.Expense',
                },
              },
              {
                path: 'pnl',
                name: 'PnLReport',
                component: () => import('@/views/analytics-reporting/pnl/index.vue'),
                meta: {
                  title: 'Báo cáo P&L',
                  icon: 'ri:file-chart-line',
                  permission: 'Reporting.PnL',
                },
              },
              {
                path: 'employee',
                name: 'EmployeeReport',
                component: () => import('@/views/analytics-reporting/employee/index.vue'),
                meta: {
                  title: 'Thống kê nhân viên',
                  icon: 'ri:team-line',
                  permission: 'Reporting.Employee',
                },
              },
            ],
          }

          return [...items, injectedNode]
        }

        return ensureReporting(menuListRaw as any[])
      } catch {
        return menuListRaw as any
      }
    })()

    const fixReportingParentIcon = (items: any[]): any[] => {
      return items.map((item) => {
        if (item.path === '/reporting' && item.meta) {
          return {
            ...item,
            meta: {
              ...item.meta,
              icon: item.meta.icon === 'trend-charts' ? 'ri:pie-chart-line' : item.meta.icon,
            },
          }
        }
        if (item.children && item.children.length > 0) {
          return { ...item, children: fixReportingParentIcon(item.children) }
        }
        return item
      })
    }

    menuList = fixReportingParentIcon(menuList as any)

    if (!menuProcessor.validateMenuList(menuList)) {
      throw new Error('Lấy Menu list that bai, vui long refresh login')
    }

    routeRegistry?.register(menuList)

    const menuStore = useMenuStore()
    menuStore.setMenuList(menuList)
    menuStore.addRemoveRouteFns(routeRegistry?.getRemoveRouteFns() || [])

    IframeRouteManager.getInstance().save()

    useWorktabStore().validateWorktabs(router)

    if (isStaticRoute(to.path)) {
      routeInitInProgress = false
      return {
        path: to.path,
        query: to.query,
        hash: to.hash,
        replace: true,
      }
    }

    const { homePath } = useCommon()
    const { path: validatedPath, hasPermission } = RoutePermissionValidator.validatePath(
      to.path,
      menuList,
      homePath.value || '/',
    )

    routeInitInProgress = false

    if (!hasPermission) {
      closeLoading()

      console.warn(
        `[RouteGuard] User khong co quyen truy cap duong: ${to.path}, da chuyen den Trang Chu`,
      )

      return {
        path: validatedPath,
        replace: true,
      }
    } else {
      return {
        path: to.path,
        query: to.query,
        hash: to.hash,
        replace: true,
      }
    }
  } catch (error) {
    console.error('[RouteGuard] Route registration failed:', error)

    closeLoading()

    if (isUnauthorizedError(error)) {
      routeInitInProgress = false
        return { name: 'Login', query: { redirect: to.fullPath }, replace: true }
    }

    routeInitFailed = true
    routeInitInProgress = false

    if (isHttpError(error)) {
      console.error(`[RouteGuard] Error code: ${error.code}, Message: ${error.message}`)
    }

    return { name: 'Exception500', replace: true }
  }
}

async function fetchUserInfo(): Promise<void> {
  const userStore = useUserStore()
  const data = await fetchGetUserInfo()

  const userInfo: Api.Auth.UserInfo = {
    userId: data.id || '',
    userName: data.fullName || data.nickName || data.userName || '',
    email: data.email || '',
    avatar: data.avatarUrl || '',
    roles: data.roles || [],
    buttons: data.permissions || [],
  }

  userStore.setUserInfo(userInfo)

  userStore.checkAndClearWorktabs()
}

export function resetRouterState(delay: number): void {
  setTimeout(() => {
    routeRegistry?.unregister()
    IframeRouteManager.getInstance().clear()

    const menuStore = useMenuStore()
    menuStore.removeAllDynamicRoutes()
    menuStore.setMenuList([])

    resetRouteInitState()
  }, delay)
}

function handleRootPathRedirect(to: RouteLocationNormalized): any {
  if (to.path !== '/') {
    return null
  }

  const { homePath } = useCommon()
  if (homePath.value && homePath.value !== '/') {
    return { path: homePath.value, replace: true }
  }

  return null
}

function isUnauthorizedError(error: unknown): boolean {
  return isHttpError(error) && error.code === ApiStatus.unauthorized
}
