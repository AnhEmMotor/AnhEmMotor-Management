/**
 * RoutingCông cụmôkhối
 *
 * gợicungRoutingXuLyvàMenuđườngđóngcủaCông cụHàm
 *
 * ## chủcầncôngnăng
 *
 * - iframe Routingđo，đoánlàphủvìngoàibộnhúngvàotrangmặt
 * - Menumụccóhiệutínhnghiệmtính，qualọcẨnvàvôhiệuMenu
 * - đườngtiêuthuậnhóaXuLy，thốngmộtđườngcáchkiểu
 * - chuyểnvềTimKiemMenucâytrongthứmộtchiếccóhiệuđường
 * - chiếctrìđacấpnhúngbộMenucủađườnggiảiphân
 *
 * ## khiếndùngtrườngcảnh
 *
 * - HeThongban đầuđầuhóagiờLấyMacDinhnhảychuyểnđường
 * - MenuQuyenHanqualọcsauLấyđầuchiếcCó thểTruy cậptrangmặt
 * - RoutingtrùngđịnhhướngLogicXuLy
 * - iframe trangmặtđặcthùXuLy
 *
 * @module utils/navigation/route
 * @author Art Design Pro Team
 */

import { AppRouteRecord } from '@/types'

// Tìmlàphủvì iframe Routing
export function isIframe(url: string): boolean {
  return url.startsWith('/outside/iframe/')
}

/**
 * đoánMenumụclàphủCó thểlàmvìMacDinhĐiều hướngrơiđiểm
 * ẨncủaToàn màn hìnhtrangmặttuynhiênKhôngtriểnthịtạiMenutrong，nhưngvẫnnhiênCó thểnănglàhợpphápTrangChu。
 */
export const isNavigableMenuItem = (menuItem: AppRouteRecord): boolean => {
  if (!menuItem.path || !menuItem.path.trim()) {
    return false
  }

  if (!menuItem.meta?.isHide) {
    return true
  }

  return menuItem.meta?.isFullPage === true
}

/**
 * tiêuthuậnhóađườngcáchkiểu
 * @param path đường
 * @returns tiêuthuậnhóasaucủađường
 */
const normalizePath = (path: string): string => {
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * chuyểnvềLấyMenucủathứmộtchiếccóhiệuđường
 * @param menuList MenuDanh sách
 * @returns thứmộtchiếccóhiệuđường，nếuquảkhôngcótìmđếnQuay lạikhôngChuỗi
 */
export const getFirstMenuPath = (menuList: AppRouteRecord[]): string => {
  if (!Array.isArray(menuList) || menuList.length === 0) {
    return ''
  }

  for (const menuItem of menuList) {
    if (!isNavigableMenuItem(menuItem)) {
      continue
    }

    // nếuquảcótửMenu，TốiTimKiemtửMenu
    if (menuItem.children?.length) {
      const childPath = getFirstMenuPath(menuItem.children)
      if (childPath) {
        return childPath
      }
    }

    // Quay lạikhitrướcMenumụccủatiêuthuậnhóađường
    return normalizePath(menuItem.path!)
  }

  return ''
}
