import type { Router, RouteLocationNormalized } from 'vue-router'
import { nextTick } from 'vue'
import NProgress from 'nprogress'
import { useSettingStore } from '@/store/modules/setting'
import { useUserStore } from '@/store/modules/user'
import { useMenuStore } from '@/store/modules/menu'
import { setWorktab } from '@/utils/navigation'
import { setPageTitle } from '@/utils/router'
import { RoutesAlias } from '../routesAlias'
import { staticRoutes } from '../routes/staticRoutes'
import { loadingService } from '@/utils/ui'
import { useCommon } from '@/hooks/core/useCommon'
import { useWorktabStore } from '@/store/modules/worktab'
import { fetchGetUserInfo } from '@/api/auth'
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

  router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    try {
      return await handleRouteGuard(to, from, router)
    } catch (error) {
      console.error('[RouteGuard] RoutinggiữvệXuLyThatBai:', error)
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
  router: Router
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
  userStore: ReturnType<typeof useUserStore>
): any {
  if (userStore.isLogin || to.path === RoutesAlias.Login || isStaticRoute(to.path)) {
    return null
  }

  userStore.logOut()
  return {
    name: 'Login',
    query: { redirect: to.fullPath }
  }
}

function isStaticRoute(path: string): boolean {
  const checkRoute = (routes: any[], targetPath: string): boolean => {
    return routes.some((route) => {
      if (route.name === 'Exception404') {
        return false
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
    const [, menuList] = await Promise.all([fetchUserInfo(), menuProcessor.getMenuList()])

    if (!menuProcessor.validateMenuList(menuList)) {
      throw new Error('LấyMenuDanh sáchThatBai，Vui lòngtrùngmớiĐăng nhập')
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
        replace: true
      }
    }

    const { homePath } = useCommon()
    const { path: validatedPath, hasPermission } = RoutePermissionValidator.validatePath(
      to.path,
      menuList,
      homePath.value || '/'
    )

    routeInitInProgress = false

    if (!hasPermission) {
      closeLoading()

      console.warn(
        `[RouteGuard] NguoiDungvôQuyenHanTruy cậpđường: ${to.path}，ĐãnhảychuyểnđếnTrangChu`
      )

      return {
        path: validatedPath,
        replace: true
      }
    } else {
      return {
        path: to.path,
        query: to.query,
        hash: to.hash,
        replace: true
      }
    }
  } catch (error) {
    console.error('[RouteGuard] Hoạt độngRoutingDangKyThatBai:', error)

    closeLoading()

    if (isUnauthorizedError(error)) {
      routeInitInProgress = false
      return false
    }

    routeInitFailed = true
    routeInitInProgress = false

    if (isHttpError(error)) {
      console.error(`[RouteGuard] Lỗimã: ${error.code}, TinNhan: ${error.message}`)
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
    buttons: data.permissions || []
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
