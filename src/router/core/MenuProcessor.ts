/**
 * MenuXuLythiết bị
 *
 * tráchMenuDữ liệucủaLấy、qualọcvàXuLy
 *
 * @module router/core/MenuProcessor
 * @author Art Design Pro Team
 */

import type { AppRouteRecord } from '@/types/router'
import { useUserStore } from '@/store/modules/user'
import { useAppMode } from '@/hooks/core/useAppMode'
import { fetchGetMenuList } from '@/api/system-manage'
import { asyncRoutes } from '../routes/asyncRoutes'
import { RoutesAlias } from '../routesAlias'
import { formatMenuTitle } from '@/utils'

export class MenuProcessor {
  /**
   * LấyMenuDữ liệu
   */
  async getMenuList(): Promise<AppRouteRecord[]> {
    const { isFrontendMode } = useAppMode()

    let menuList: AppRouteRecord[]
    if (isFrontendMode.value) {
      menuList = await this.processFrontendMenu()
    } else {
      menuList = await this.processBackendMenu()
    }

    // tạiquyphạmhóađườngcủatrước，nghiệmtínhnguyênđầuđườngCauHinh
    this.validateMenuPaths(menuList)

    // quyphạmhóađường（tươngđốiđườngchuyểnđổivìĐầy đủđường）
    return this.normalizeMenuPaths(menuList)
  }

  /**
   * XuLytrướcđầukhốngchếmôkiểucủaMenu
   */
  private async processFrontendMenu(): Promise<AppRouteRecord[]> {
    const userStore = useUserStore()
    const roles = userStore.info?.roles

    let menuList = [...asyncRoutes]

    // liệuVaiTroqualọcMenu
    if (roles && roles.length > 0) {
      menuList = this.filterMenuByRoles(menuList, roles)
    }

    return this.filterEmptyMenus(menuList)
  }

  /**
   * XuLysauđầukhốngchếmôkiểucủaMenu
   */
  private async processBackendMenu(): Promise<AppRouteRecord[]> {
    const list = await fetchGetMenuList()
    return this.filterEmptyMenus(list)
  }

  /**
   * liệuVaiTroqualọcMenu
   */
  private filterMenuByRoles(menu: AppRouteRecord[], roles: string[]): AppRouteRecord[] {
    return menu.reduce((acc: AppRouteRecord[], item) => {
      const itemRoles = item.meta?.roles
      const hasPermission = !itemRoles || itemRoles.some((role) => roles?.includes(role))

      if (hasPermission) {
        const filteredItem = { ...item }
        if (filteredItem.children?.length) {
          filteredItem.children = this.filterMenuByRoles(filteredItem.children, roles)
        }
        acc.push(filteredItem)
      }

      return acc
    }, [])
  }

  /**
   * chuyểnvềqualọckhôngMenumục
   */
  private filterEmptyMenus(menuList: AppRouteRecord[]): AppRouteRecord[] {
    return menuList
      .map((item) => {
        // nếuquảcótửMenu，chuyểnvềqualọctửMenu
        if (item.children && item.children.length > 0) {
          const filteredChildren = this.filterEmptyMenus(item.children)
          return {
            ...item,
            children: filteredChildren
          }
        }
        return item
      })
      .filter((item) => {
        // nếuquảĐịnh nghĩarồi children ThuocTinh（làkhiếnlàkhôngMảng），Mô tảnàylàmộtchiếcmụclụcMenu，ứngnênLưugiữ
        if ('children' in item) {
          return true
        }

        // nếuquảcóngoàiliênhoặc iframe，Lưugiữ
        if (item.meta?.isIframe === true || item.meta?.link) {
          return true
        }

        // nếuquảcócóhiệucủa component，Lưugiữ
        if (item.component && item.component !== '' && item.component !== RoutesAlias.Layout) {
          return true
        }

        // nóanh ấytìnhqualọc
        return false
      })
  }

  /**
   * nghiệmtínhMenuDanh sáchlàphủcóhiệu
   */
  validateMenuList(menuList: AppRouteRecord[]): boolean {
    return Array.isArray(menuList) && menuList.length > 0
  }

  /**
   * quyphạmhóaMenuđường
   * tươngđốiđườngchuyểnđổivìĐầy đủđường，Đảm bảoMenunhảychuyểnđúngChính
   */
  private normalizeMenuPaths(menuList: AppRouteRecord[], parentPath = ''): AppRouteRecord[] {
    return menuList.map((item) => {
      // cấuxâyĐầy đủđường
      const fullPath = this.buildFullPath(item.path || '', parentPath)

      // chuyểnvềXuLytửMenu
      const children = item.children?.length
        ? this.normalizeMenuPaths(item.children, fullPath)
        : item.children

      const redirect = item.redirect || this.resolveDefaultRedirect(children)

      return {
        ...item,
        path: fullPath,
        redirect,
        children
      }
    })
  }

  /**
   * vìmụclụckiểuMenuđẩyXuấtMacDinhnhảychuyểnDiaChi
   */
  private resolveDefaultRedirect(children?: AppRouteRecord[]): string | undefined {
    if (!children?.length) {
      return undefined
    }

    for (const child of children) {
      if (this.isNavigableRoute(child)) {
        return child.path
      }

      const nestedRedirect = this.resolveDefaultRedirect(child.children)
      if (nestedRedirect) {
        return nestedRedirect
      }
    }

    return undefined
  }

  /**
   * đoántửRoutinglàphủCó thểlấylàmvìMacDinhrơiđiểm
   */
  private isNavigableRoute(route: AppRouteRecord): boolean {
    return Boolean(
      route.path &&
      route.path !== '/' &&
      !route.meta?.link &&
      route.meta?.isIframe !== true &&
      route.component &&
      route.component !== ''
    )
  }

  /**
   * nghiệmtínhMenuđườngCauHinh
   * đophimộtcấpMenulàphủLỗikhiếndùngrồi / mởđầucủađường
   */
  /**
   * nghiệmtínhMenuđườngCauHinh
   * đophimộtcấpMenulàphủLỗikhiếndùngrồi / mởđầucủađường
   */
  private validateMenuPaths(menuList: AppRouteRecord[], level = 1): void {
    menuList.forEach((route) => {
      if (!route.children?.length) return

      const parentName = String(route.name || route.path || 'ChưabáoRouting')

      route.children.forEach((child) => {
        const childPath = child.path || ''

        // nhảyquahợpphápcủatuyệtđốiđường：ngoàibộliêntiếpvà iframe Routing
        if (this.isValidAbsolutePath(childPath)) return

        // đophiphápcủatuyệtđốiđường
        if (childPath.startsWith('/')) {
          this.logPathError(child, childPath, parentName, level)
        }
      })

      // chuyểnvềTìmhơnthâmtầngcấpcủatửRouting
      this.validateMenuPaths(route.children, level + 1)
    })
  }

  /**
   * đoánlàphủvìhợpphápcủatuyệtđốiđường
   */
  private isValidAbsolutePath(path: string): boolean {
    return (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('/outside/iframe/')
    )
  }

  /**
   * nhậprađườngCauHinhLỗiNhatKy
   */
  private logPathError(
    route: AppRouteRecord,
    path: string,
    parentName: string,
    level: number
  ): void {
    const routeName = String(route.name || path || 'ChưabáoRouting')
    const menuTitle = route.meta?.title || routeName
    const suggestedPath = path.split('/').pop() || path.slice(1)

    console.error(
      `[RoutingCauHinhLỗi] Menu "${formatMenuTitle(menuTitle)}" (name: ${routeName}, path: ${path}) CauHinhLỗi\n` +
        `  ViTri: ${parentName} > ${routeName}\n` +
        `  hỏiđề: ${level + 1}cấpMenucủa path Khôngnănglấy / mởđầu\n` +
        `  khitrướcCauHinh: path: '${path}'\n` +
        `  ứngnênsửavì: path: '${suggestedPath}'`
    )
  }

  /**
   * cấuxâyĐầy đủđường
   */
  private buildFullPath(path: string, parentPath: string): string {
    if (!path) return ''

    // ngoàibộliêntiếpthẳngtiếpQuay lại
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    // nếuquảĐãqualàtuyệtđốiđường，thẳngtiếpQuay lại
    if (path.startsWith('/')) {
      return path
    }

    // ghéptiếpchađườngvàkhitrướcđường
    if (parentPath) {
      // Dichiachađườngcuốiđuôicủanghiêngthanh，Dichiatửđườngmởđầucủanghiêngthanh，nhiênsaughéptiếp
      const cleanParent = parentPath.replace(/\/$/, '')
      const cleanChild = path.replace(/^\//, '')
      return `${cleanParent}/${cleanChild}`
    }

    // khôngcóchađường，Thêm mớitrướcXuấtnghiêngthanh
    return `/${path}`
  }
}
