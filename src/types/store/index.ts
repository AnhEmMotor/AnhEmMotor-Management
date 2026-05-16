/**
 * Store Trạng tháiloạikiểuĐịnh nghĩamôkhối
 *
 * gợicung Pinia Store củaTrạng tháiloạikiểuĐịnh nghĩa
 *
 * ## chủcầncôngnăng
 *
 * - HeThongChuDeloạikiểu
 * - MenuChuDeloạikiểu
 * - CaiDatTrạng tháiloạikiểu
 * - cônglàmThẻ Tabloạikiểu
 * - NguoiDungTrạng tháiloạikiểu
 * - MenuTrạng tháiloạikiểu
 * - Trạng tháiloạikiểu
 *
 * ## khiếndùngtrườngcảnh
 *
 * - Store Trạng tháiloạikiểuhẹnthúc
 * - Trạng tháiDữ liệuKếtcấuĐịnh nghĩa
 * - loạikiểuGợi ývàtừđộngbùtoàn
 *
 * @module types/store/index
 * @author Art Design Pro Team
 */

import { MenuThemeEnum, SystemThemeEnum } from '@/enums/appEnum'
import { LocationQueryRaw } from 'vue-router'

// HeThongChuDeKiểu dáng（light | dark）
export interface SystemThemeType {
  /** ChuDeloạidanh */
  className: string
}

// Định nghĩaBao gồmđachiếcChuDecủaloạikiểu
export type SystemThemeTypes = {
  [key in Exclude<SystemThemeEnum, SystemThemeEnum.AUTO>]: SystemThemeType
}

// MenuChuDeKiểu dáng
export interface MenuThemeType {
  /** ChuDeloạikiểu */
  theme: MenuThemeEnum
  /** NềnMàu sắc */
  background: string
  /** HeThongdanhtênMàu sắc */
  systemNameColor: string
  /** vănquyểnMàu sắc */
  textColor: string
  /** IconMàu sắc */
  iconColor: string
  /** NềnHình ảnh */
  img?: string
}

// CaiDatTrung tâm
export interface SettingState {
  /** ChuDe */
  theme: string
  /** làphủchỉDuy trìmộtchiếctửMenucủaMở rộng */
  uniqueOpened: boolean
  /** làphủHiển thịMenuNút */
  menuButton: boolean
  /** làphủHiển thịLàm mớiNút */
  showRefreshButton: boolean
  /** làphủHiển thịBreadcrumb */
  showCrumbs: boolean
  /** làphủtừđộngđóngđóng */
  autoClose: boolean
  /** làphủHiển thịcônglàmThẻ Tab */
  showWorkTab: boolean
  /** làphủHiển thịNgôn ngữChuyển đổi */
  showLanguage: boolean
  /** làphủHiển thịThanh tiến trình */
  showNprogress: boolean
  /** ChuDemôkiểu */
  themeModel: string
}

// đaTag
export interface WorkTab {
  /** TagTieuDe */
  title: string
  /** Tùy chỉnhTieuDe */
  customTitle?: string
  /** Routingđường */
  path: string
  /** Routingdanhtên */
  name: string
  /** làphủCache */
  keepAlive: boolean
  /** làphủcốđịnhTag */
  fixedTab?: boolean
  /** RoutingTham số */
  params?: object
  /** RoutingTìmhỏiTham số */
  query?: LocationQueryRaw
  /** Icon */
  icon?: string
  /** làphủkíchsống */
  isActive?: boolean
}

// NguoiDungStoreTrạng thái
export interface UserState {
  /** NguoiDungThongTin */
  userInfo: Api.Auth.UserInfo | null
  /** danhtínhlệnhbảng */
  token: string | null
  /** NguoiDungVaiTroDanh sách */
  roles: string[]
  /** NguoiDungQuyenHanDanh sách */
  permissions: string[]
}

// CaiDatStoreTrạng thái
export interface SettingStoreState extends SettingState {
  // tránngoàicủaCaiDatTrạng thái
  /** Menulàphủ */
  collapsed: boolean
  /** thiếtđặtloạikiểu */
  device: 'desktop' | 'mobile'
  /** khitrướcNgôn ngữ */
  language: string
}

// cônglàmThẻ TabStoreTrạng thái
export interface WorkTabState {
  /** Thẻ TabDanh sách */
  tabs: WorkTab[]
  /** khitrướckíchsốngcủaThẻ Tab */
  activeTab: string
  /** CachecủaThẻ TabDanh sách */
  cachedTabs: string[]
}

// MenuStoreTrạng thái
export interface MenuState {
  /** MenuDanh sách */
  menuList: any[]
  /** MenulàphủĐãLoading */
  isLoaded: boolean
  /** Menulàphủ */
  collapsed: boolean
}

// StoreTrạng tháiloạikiểu
export interface RootState {
  /** NguoiDungTrạng thái */
  user: UserState
  /** CaiDatTrạng thái */
  setting: SettingStoreState
  /** cônglàmThẻ TabTrạng thái */
  workTab: WorkTabState
  /** MenuTrạng thái */
  menu: MenuState
}
