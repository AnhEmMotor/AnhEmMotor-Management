/**
 * RoutingloạikiểuĐịnh nghĩamôkhối
 *
 * gợicungRoutingđóngcủaloạikiểuĐịnh nghĩa
 *
 * ## chủcầncôngnăng
 *
 * - RoutingnguyênDữ liệuloạikiểu（TieuDe、Icon、QuyenHanbằng）
 * - Ứng dụngRoutingGhi chéploạikiểu
 * - RoutingCauHinhmởtriển
 *
 * ## khiếndùngtrườngcảnh
 *
 * - RoutingCauHinhloạikiểuhẹnthúc
 * - RoutingnguyênDữ liệuĐịnh nghĩa
 * - Menusinhthành
 * - QuyenHankhốngchế
 *
 * @module types/router/index
 * @author Art Design Pro Team
 */

import { RouteRecordRaw } from 'vue-router'

/**
 * RoutingnguyênDữ liệuGiao diện (Interface)
 * Định nghĩaRoutingcủacácloạiCauHinhThuocTinh
 */
export interface RouteMeta extends Record<string | number | symbol, unknown> {
  /** RoutingTieuDe */
  title: string
  /** RoutingIcon */
  icon?: string
  /** làphủHiển thịhuychương */
  showBadge?: boolean
  /** vănquyểnhuychương */
  showTextBadge?: string
  /** làphủtạiMenutrongẨn */
  isHide?: boolean
  /** làphủtạiThẻ TabtrongẨn */
  isHideTab?: boolean
  /** ngoàibộliêntiếp */
  link?: string
  /** làphủvìiframe */
  isIframe?: boolean
  /** làphủCache */
  keepAlive?: boolean
  /** HanhDongQuyenHan */
  authList?: Array<{
    title: string
    authMark: string
  }>
  /** làphủvìmộtcấpMenu */
  isFirstLevel?: boolean
  /** VaiTroQuyenHan */
  roles?: string[]
  /** làphủcốđịnhThẻ Tab */
  fixedTab?: boolean
  /** kíchsốngMenuđường */
  activePath?: string
  /** làphủvìToàn màn hìnhtrangmặt */
  isFullPage?: boolean
  /** làphủvìQuyenHanNútdòng */
  isAuthButton?: boolean
  /** QuyenHantiêu */
  authMark?: string
  /** chacấpđường */
  parentPath?: string
}

/**
 * Ứng dụngRoutingGhi chépGiao diện (Interface)
 * mởtriển Vue Router củaRoutingGhi chéploạikiểu
 */
export interface AppRouteRecord extends Omit<RouteRecordRaw, 'meta' | 'children' | 'component'> {
  id?: number
  meta: RouteMeta
  children?: AppRouteRecord[]
  component?: string | (() => Promise<any>)
}
