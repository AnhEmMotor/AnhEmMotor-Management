/**
 * Routingtoànbộtrướcđặtgiữvệmôkhối
 *
 * gợicungĐầy đủcủaRoutingĐiều hướnggiữvệcôngnăng
 *
 * ## chủcầncôngnăng
 *
 * - DangNhapTrạng tháinghiệmtínhvàtrùngđịnhhướng
 * - Hoạt độngRoutingDangKyvàQuyenHankhốngchế
 * - MenuDữ liệuHủyvàlý（trướcđầu/sauđầumôthức）
 * - NguoiDungThongTinLấyvàCache
 * - trangmặtTieuDeCaiDat
 * - cônglàmThẻ TabQuản lý
 * - Thanh tiến trìnhvàLoadingHoatAnhkhốngchế
 * - tĩnhtháiRoutingtínhvàXuLy
 * - XuLy lỗivàBất thườngnhảychuyển
 *
 * ## khiếndùngtrườngcảnh
 *
 * - RoutingnhảychuyểntrướccủaQuyenHannghiệmtính
 * - Hoạt độngMenuLoadingvàRoutingDangKy
 * - NguoiDungDangNhapTrạng tháiQuản lý
 * - trangmặtTruy cậpkhốngchế
 * - RoutingcấptínhcủaLoadingTrạng tháiQuản lý
 *
 * ## cônglàmchuyểntrình
 *
 * 1. TìmDangNhapTrạng thái，ChưaDangNhapnhảychuyểnđếnDangNhaptrang
 * 2. đầulầnTruy cậpgiờLấyNguoiDungThongTinvàMenuDữ liệu
 * 3. liệuQuyenHanHoạt độngDangKyRouting
 * 4. CaiDattrangmặtTieuDevàcônglàmThẻ Tab
 * 5. XuLyđườngtrùngđịnhhướngđếnTrangChu
 * 6. ChưangựaPhânRoutingnhảychuyểnđến 404 trangmặt
 *
 * @module router/guards/beforeEach
 * @author Art Design Pro Team
 */
import type { Router, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
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

// RoutingDangKythiết bịthựcví dụ
let routeRegistry: RouteRegistry | null = null

// MenuXuLythiết bịthựcví dụ
const menuProcessor = new MenuProcessor()

// theovếtlàphủcầncầnđóngđóng loading
let pendingLoading = false

// Routingban đầuđầuhóaThatBaitiêughi，PhòngthúcchếtVòng lặp
// mộtsángCaiDatvì true，chỉcóLàm mớitrangmặthoặctrùngmớiDangNhapmớinăngĐặt lại
let routeInitFailed = false

// Routingban đầuđầuhóavàodòngtrongtiêughi，Phòngthúcđồng thờiphátVui lòngcầu
let routeInitInProgress = false

/**
 * Lấy pendingLoading Trạng thái
 */
export function getPendingLoading(): boolean {
  return pendingLoading
}

/**
 * Đặt lại pendingLoading Trạng thái
 */
export function resetPendingLoading(): void {
  pendingLoading = false
}

/**
 * LấyRoutingban đầuđầuhóaThatBaiTrạng thái
 */
export function getRouteInitFailed(): boolean {
  return routeInitFailed
}

/**
 * Đặt lạiRoutingban đầuđầuhóaTrạng thái（dùngởtrùngmớiDangNhaptrườngcảnh）
 */
export function resetRouteInitState(): void {
  routeInitFailed = false
  routeInitInProgress = false
}

/**
 * CaiDatRoutingtoànbộtrướcđặtgiữvệ
 */
export function setupBeforeEachGuard(router: Router): void {
  // ban đầuđầuhóaRoutingDangKythiết bị
  routeRegistry = new RouteRegistry(router)

  router.beforeEach(
    async (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      try {
        await handleRouteGuard(to, from, next, router)
      } catch (error) {
        console.error('[RouteGuard] RoutinggiữvệXuLyThatBai:', error)
        closeLoading()
        next({ name: 'Exception500' })
      }
    }
  )
}

/**
 * đóngđóng loading Hiệu quả
 */
function closeLoading(): void {
  if (pendingLoading) {
    nextTick(() => {
      loadingService.hideLoading()
      pendingLoading = false
    })
  }
}

/**
 * XuLyRoutinggiữvệLogic
 */
async function handleRouteGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
  router: Router
): Promise<void> {
  const settingStore = useSettingStore()
  const userStore = useUserStore()

  // bậtđộngThanh tiến trình
  if (settingStore.showNprogress) {
    NProgress.start()
  }

  // 1. TìmDangNhapTrạng thái
  if (!handleLoginStatus(to, userStore, next)) {
    return
  }

  // 2. TìmRoutingban đầuđầuhóalàphủĐãThatBai（PhòngthúcchếtVòng lặp）
  if (routeInitFailed) {
    // ĐãquaThatBaiqua，thẳngtiếpphóngdòngđếnTrang lỗimặt，Khônglạitrùngthử
    if (to.matched.length > 0) {
      next()
    } else {
      // ChưangựaPhânđếnRouting，nhảychuyểnđến 500trangmặt
      next({ name: 'Exception500', replace: true })
    }
    return
  }

  // 3. XuLyHoạt độngRoutingDangKy
  if (!routeRegistry?.isRegistered() && userStore.isLogin) {
    // Phòngthúcđồng thờiphátVui lòngcầu（khoáiliềntiếpĐiều hướngtrườngcảnh）
    if (routeInitInProgress) {
      // Đangban đầuđầuhóatrong，bằngđợihoànthànhsautrùngmớiĐiều hướng
      next(false)
      return
    }
    await handleDynamicRoutes(to, next, router)
    return
  }

  // 4. XuLyđườngtrùngđịnhhướng
  if (handleRootPathRedirect(to, next)) {
    return
  }

  // 5. XuLyĐãngựaPhâncủaRouting
  if (to.matched.length > 0) {
    setWorktab(to)
    setPageTitle(to)
    next()
    return
  }

  // 6. ChưangựaPhânđếnRouting，nhảychuyểnđến 404 Không tìm thấy Không tìm thấy Không tìm thấy Không tìm thấy Không tìm thấy
  next({ name: 'Exception404' })
}

/**
 * XuLyDangNhapTrạng thái
 * @returns true bảngthịCó thểlấytiếptiếp，false bảngthịĐãXuLynhảychuyển
 */
function handleLoginStatus(
  to: RouteLocationNormalized,
  userStore: ReturnType<typeof useUserStore>,
  next: NavigationGuardNext
): boolean {
  // ĐãDangNhaphoặcTruy cậpDangNhaptranghoặctĩnhtháiRouting，thẳngtiếpphóngdòng
  if (userStore.isLogin || to.path === RoutesAlias.Login || isStaticRoute(to.path)) {
    return true
  }

  // ChưaDangNhapvừaTruy cậpcầncầnQuyenHancủatrangmặt，nhảychuyểnđếnDangNhaptrangđồng thờimangmang redirect Tham số
  userStore.logOut()
  next({
    name: 'Login',
    query: { redirect: to.fullPath }
  })
  return false
}

/**
 * TìmRoutinglàphủvìtĩnhtháiRouting
 */
function isStaticRoute(path: string): boolean {
  const checkRoute = (routes: any[], targetPath: string): boolean => {
    return routes.some((route) => {
      // 404 Không tìm thấy Không tìm thấy Không tìm thấy Không tìm thấy Không tìm thấy catch-all RoutingKhôngứngthịvìCó thểẩndanhTruy cậpcủatĩnhtháitrang，
      // Nếu khôngChưaDangNhapgiờtayđộngNhậpnhiệmýDiaChisẽthẳngtiếprơiđến 404 Không tìm thấy Không tìm thấy Không tìm thấy Không tìm thấy Không tìm thấy Không tìm thấy，vôphápnhảychuyểnDangNhaptrang。
      if (route.name === 'Exception404') {
        return false
      }

      // XuLyHoạt độngRoutingTham sốngựaPhân
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

/**
 * XuLyHoạt độngRoutingDangKy
 */
async function handleDynamicRoutes(
  to: RouteLocationNormalized,
  next: NavigationGuardNext,
  router: Router
): Promise<void> {
  // tiêughiban đầuđầuhóavàodòngtrong
  routeInitInProgress = true

  // Hiển thị loading
  pendingLoading = true
  loadingService.showLoading()

  try {
    // 1. Lấy NguoiDungThongTin và Menu cùng lúc để tăng tốc
    const [_, menuList] = await Promise.all([
      fetchUserInfo(),
      menuProcessor.getMenuList()
    ])

    // 3. nghiệmtínhMenuDữ liệu
    if (!menuProcessor.validateMenuList(menuList)) {
      throw new Error('LấyMenuDanh sáchThatBai，Vui lòngtrùngmớiDangNhap')
    }

    // 4. DangKyHoạt độngRouting
    routeRegistry?.register(menuList)

    // 5. LưutồnMenuDữ liệuđến store
    const menuStore = useMenuStore()
    menuStore.setMenuList(menuList)
    menuStore.addRemoveRouteFns(routeRegistry?.getRemoveRouteFns() || [])

    // 6. Lưutồn iframe Routing
    IframeRouteManager.getInstance().save()

    // 7. nghiệmtínhcônglàmThẻ Tab
    useWorktabStore().validateWorktabs(router)

    // 8. tĩnhtháiRoutingKhôngylạiMenuQuyenHan，ban đầuđầuhóasauthẳngtiếpkhôiphụcmụctiêuDiaChi。
    if (isStaticRoute(to.path)) {
      routeInitInProgress = false
      next({
        path: to.path,
        query: to.query,
        hash: to.hash,
        replace: true
      })
      return
    }

    // 8. nghiệmtínhmụctiêuđườngQuyenHan
    const { homePath } = useCommon()
    const { path: validatedPath, hasPermission } = RoutePermissionValidator.validatePath(
      to.path,
      menuList,
      homePath.value || '/'
    )

    // ban đầuđầuhóaThanhCong，Đặt lạivàodòngtrongtiêughi
    routeInitInProgress = false

    // 9. trùngmớiĐiều hướngđếnmụctiêuRouting
    if (!hasPermission) {
      // vôQuyenHanTruy cập，nhảychuyểnđếnTrangChu
      closeLoading()

      // nhậpraCanhBaoThongTin
      console.warn(`[RouteGuard] NguoiDungvôQuyenHanTruy cậpđường: ${to.path}，ĐãnhảychuyểnđếnTrangChu`)

      // thẳngtiếpnhảychuyểnđếnTrangChu
      next({
        path: validatedPath,
        replace: true
      })
    } else {
      // cóQuyenHan，Bình thườngĐiều hướng
      next({
        path: to.path,
        query: to.query,
        hash: to.hash,
        replace: true
      })
    }
  } catch (error) {
    console.error('[RouteGuard] Hoạt độngRoutingDangKyThatBai:', error)

    // đóngđóng loading
    closeLoading()

    // 401 Lỗi：axios chặncắtthiết bịĐãXuLyĐăng xuất，HủykhitrướcĐiều hướng
    if (isUnauthorizedError(error)) {
      // Đặt lạiTrạng thái，cho phéphứatrùngmớiDangNhapsaulạilầnban đầuđầuhóa
      routeInitInProgress = false
      next(false)
      return
    }

    // tiêughiban đầuđầuhóaThatBai，PhòngthúcchếtVòng lặp
    routeInitFailed = true
    routeInitInProgress = false

    // nhậpraChiTietLỗiThongTin，tiệnởxếpTìm
    if (isHttpError(error)) {
      console.error(`[RouteGuard] Lỗimã: ${error.code}, TinNhan: ${error.message}`)
    }

    // nhảychuyểnđến 500trangmặt，khiếndùng replace tránhmiễnsinhsinhLịchsửGhi chép
    next({ name: 'Exception500', replace: true })
  }
}

/**
 * LấyNguoiDungThongTin
 */
async function fetchUserInfo(): Promise<void> {
  const userStore = useUserStore()
  const data = await fetchGetUserInfo()

  // Chuyển đổi dữ liệu từ backend sang cấu trúc của template
  const userInfo: Api.Auth.UserInfo = {
    userId: data.id || '',
    userName: data.userName || '',
    email: data.email || '',
    avatar: data.avatarUrl || '',
    roles: (data.roles || []).map((r: string) => {
      const lower = r.toLowerCase()
      if (lower.includes('super')) return 'R_SUPER'
      if (lower.includes('admin')) return 'R_ADMIN'
      return r
    }),
    buttons: data.permissions || []
  }

  userStore.setUserInfo(userInfo)
  // Tìmđồng thờixóalýBàn làm việcThẻ Tab（nếuquảlàKhôngcùngNguoiDungDangNhap）
  userStore.checkAndClearWorktabs()
}

/**
 * Đặt lạiRoutingđóngTrạng thái
 */
export function resetRouterState(delay: number): void {
  setTimeout(() => {
    routeRegistry?.unregister()
    IframeRouteManager.getInstance().clear()

    const menuStore = useMenuStore()
    menuStore.removeAllDynamicRoutes()
    menuStore.setMenuList([])

    // Đặt lạiRoutingban đầuđầuhóaTrạng thái，cho phéphứatrùngmớiDangNhapsaulạilầnban đầuđầuhóa
    resetRouteInitState()
  }, delay)
}

/**
 * XuLyđườngtrùngđịnhhướngđếnTrangChu
 * @returns true bảngthịĐãXuLynhảychuyển，false bảngthịvôcầnnhảychuyển
 */
function handleRootPathRedirect(to: RouteLocationNormalized, next: NavigationGuardNext): boolean {
  if (to.path !== '/') {
    return false
  }

  const { homePath } = useCommon()
  if (homePath.value && homePath.value !== '/') {
    next({ path: homePath.value, replace: true })
    return true
  }

  return false
}

/**
 * đoánlàphủvìChưatraoquyềnLỗi（401）
 */
function isUnauthorizedError(error: unknown): boolean {
  return isHttpError(error) && error.code === ApiStatus.unauthorized
}
