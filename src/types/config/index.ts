/**
 * CauHinhloạikiểuĐịnh nghĩamôkhối
 *
 * gợicungHeThongCauHinhđóngcủaloạikiểuĐịnh nghĩa
 *
 * ## chủcầncôngnăng
 *
 * - ChuDeCaiDatloạikiểu
 * - MenuBố cụcloạikiểu
 * - tiếtngàyCauHinhloạikiểu
 * - HeThongCơ bảnCauHinhloạikiểu
 * - khoáivàodiệnCauHinhloạikiểu
 * - Phía trênlancôngnăngCauHinhloạikiểu
 * - cảnhCauHinhloạikiểu
 * - Ứng dụngCauHinhloạikiểu
 *
 * ## khiếndùngtrườngcảnh
 *
 * - HeThongCauHinhvănphần tửloạikiểuhẹnthúc
 * - CauHinhmụcloạikiểuĐịnh nghĩa
 * - CauHinhDữ liệunghiệmtính
 *
 * @module types/config/index
 * @author Art Design Pro Team
 */

import { MenuTypeEnum, SystemThemeEnum } from '@/enums/appEnum'
import { MenuThemeType, SystemThemeTypes } from '@/types/store'

// ChuDeCaiDat
export interface ThemeSetting {
  /** ChuDedanhtên */
  name: string
  /** HeThongChuDeloạikiểu */
  theme: SystemThemeEnum
  /** ChuDeMàu sắcMảng */
  color: string[]
  /** Bên tráiđườngđiềuMàu sắc */
  leftLineColor: string
  /** Bên phảiđườngđiềuMàu sắc */
  rightLineColor: string
  /** ChuDeHình ảnh */
  img: string
}

// MenuBố cục
export interface MenuLayout {
  /** Bố cụcdanhtên */
  name: string
  /** Menuloạikiểugiá trị */
  value: MenuTypeEnum
  /** Bố cụcXem trướcảnh */
  img: string
  /** Bố cụcMô tả */
  description?: string
}

// tiếtngàyCauHinh
export interface FestivalConfig {
  /** tiếtngàyNgày（đơnngày）hoặcBắt đầuNgày（Ngàyphạmvi） */
  date: string
  /** tiếtngàyKếtthúcNgày（Có thểvị，dùngởvượtNgàytiếtngày） */
  endDate?: string
  /** tiếtngàydanhtên */
  name: string
  /** khóihoaHình ảnh */
  image: string
  /** Cuộnvănquyển */
  scrollText: string
  /** làphủkíchsống */
  isActive?: boolean
  /** khóihoaphátphónglầnsố（Có thểvị，MacDinhvì 3 lần） */
  count?: number
}

// HeThongCơ bảnCauHinh
export interface SystemBasicConfig {
  // HeThongdanhtên
  name: string
  // HeThongMô tả
  description?: string
  // HeThonglogo
  logo?: string
  // HeThongfavicon
  favicon?: string
  // Bản quyềnThongTin
  copyright?: string
}

// khoáivàodiệnCơ bảnmục
export interface FastEnterBaseItem {
  /** danhtên */
  name: string
  /** làphủBật */
  enabled?: boolean
  /** xếpthứquyềntrùng */
  order?: number
  /** Routingdanhtên */
  routeName?: string
  /** ngoàibộliêntiếp */
  link?: string
}

// khoáivàodiệnỨng dụngmục
export interface FastEnterApplication extends FastEnterBaseItem {
  /** Ứng dụngMô tả */
  description: string
  /** Iconđạimã */
  icon: string
  /** IconMàu sắc */
  iconColor: string
}

// khoáiliêntiếpmục
export type FastEnterQuickLink = FastEnterBaseItem

// khoáivàodiệnCauHinh
export interface FastEnterConfig {
  /** Ứng dụngDanh sách */
  applications: FastEnterApplication[]
  /** khoáiliêntiếp */
  quickLinks: FastEnterQuickLink[]
  /** Hiển thịđiềuphần tử（màn hìnhmànChiều rộng） */
  minWidth?: number
}

// HeThongCauHinh
export interface SystemConfig {
  // HeThongCơ bảnThongTin
  systemInfo: SystemBasicConfig
  // HeThongChuDeKiểu dáng
  systemThemeStyles: SystemThemeTypes
  // CaiDatChuDeDanh sách
  settingThemeList: ThemeSetting[]
  // MenuBố cụcDanh sách
  menuLayoutList: MenuLayout[]
  // ChuDeDanh sách
  themeList: MenuThemeType[]
  // ámmàuMenuKiểu dáng
  darkMenuStyles: MenuThemeType[]
  // HeThongchủmàuđiều
  systemMainColor: readonly string[]
  // khoáivàodiệnCauHinh
  fastEnter?: FastEnterConfig
  // Phía trênlancôngnăngCauHinh
  headerBar?: HeaderBarFeatureConfig
}

// cảnhCauHinh
export interface EnvConfig {
  // cảnhdanhtên
  NODE_ENV: string
  // Ứng dụngbảnquyển
  VITE_VERSION: string
  // Ứng dụngđầudiện
  VITE_PORT: string
  // Ứng dụngCơ bảnđường
  VITE_BASE_URL: string
  // API DiaChi cho Browser Client
  VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT: string
  // làphủmởbật Mock
  VITE_USE_MOCK?: string
  // làphủmởbậtépthụt
  VITE_USE_GZIP?: string
  // làphủmởbật CDN
  VITE_USE_CDN?: string
}

// Ứng dụngCauHinh
export interface AppConfig extends SystemConfig {
  // cảnhCauHinh
  env: EnvConfig
  // mởphátmôkiểu
  isDev: boolean
  // sinhsinhmôkiểu
  isProd: boolean
  // đothửmôkiểu
  isTest: boolean
}

// côngnăngCauHinhmụcCơ bảnGiao diện (Interface)
export interface FeatureConfigItem {
  enabled: boolean
  description: string
}

// Phía trênlancôngnăngCauHinhGiao diện (Interface)
export interface HeaderBarFeatureConfig {
  /** MenuNút */
  menuButton: FeatureConfigItem
  /** Làm mớiNút */
  refreshButton: FeatureConfigItem
  /** khoáivàodiện */
  fastEnter: FeatureConfigItem
  /** BreadcrumbĐiều hướng */
  breadcrumb: FeatureConfigItem
  /** toànbộTimKiem */
  globalSearch: FeatureConfigItem
  /** Toàn màn hìnhcôngnăng */
  fullscreen: FeatureConfigItem
  /** ThongBaocôngnăng */
  notification: FeatureConfigItem
  /** tròngàycôngnăng */
  chat: FeatureConfigItem
  /** đaNgôn ngữChuyển đổi */
  language: FeatureConfigItem
  /** CaiDatBảng (Panel) */
  settings: FeatureConfigItem
  /** ChuDeChuyển đổi */
  themeToggle: FeatureConfigItem
}
