/**
 * HeThongCaiDatMacDinhgiá trịCauHinh
 *
 * thốngmộtQuản lýHeThongCaiDatcủanêncóMacDinhgiá trị
 *
 * ## chủcầncôngnăng
 *
 * - MenuđóngMacDinhCauHinh
 * - ChuDeđóngMacDinhCauHinh
 * - giaomặtHiển thịMacDinhCauHinh
 * - côngnăngCông tắcMacDinhCauHinh
 * - Kiểu dángđóngMacDinhCauHinh
 *
 * ## tâmýviệcmục
 *
 * 1. sửasửanàyvănphần tửcủaCauHinhmụcgiờ，cầncầncùngbướcCập nhậtlấydướivănphần tử：
 *    - src/components/core/layouts/art-settings-panel/widget/SettingActions.vue（lờichếCauHinhvàĐặt lạiCauHinhLogic）
 *    - src/store/modules/setting.ts（Store Trạng tháiĐịnh nghĩa）
 * 2. Có thểlấythông quaCaiDatBảng (Panel)của"phụcchếCauHinh"NútkhoáisinhthànhCauHinhđạimã
 * 3. chiếcBáoloạikiểucủagiá trịcầncầnvới src/enums/appEnum.ts trongcủaĐịnh nghĩaDuy trìmộtđến
 */

import AppConfig from '@/config'
import { SystemThemeEnum, MenuThemeEnum, MenuTypeEnum, ContainerWidthEnum } from '@/enums/appEnum'

/**
 * HeThongCaiDatMacDinhgiá trịCauHinh
 */
export const SETTING_DEFAULT_CONFIG = {
  /** Menuloạikiểu */
  menuType: MenuTypeEnum.LEFT,
  /** MenuMở rộngChiều rộng */
  menuOpenWidth: 230,
  /** MenulàphủMở rộng */
  menuOpen: true,
  /** đôiMenulàphủHiển thịvănquyển */
  dualMenuShowText: false,
  /** HeThongChuDeloạikiểu */
  systemThemeType: SystemThemeEnum.AUTO,
  /** HeThongChuDemôkiểu */
  systemThemeMode: SystemThemeEnum.AUTO,
  /** MenuPhong cách */
  menuThemeType: MenuThemeEnum.DESIGN,
  /** HeThongChuDeMàu sắc */
  systemThemeColor: AppConfig.systemMainColor[0],
  /** làphủHiển thịMenuNút */
  showMenuButton: true,
  /** làphủHiển thịkhoáivàodiện */
  showFastEnter: true,
  /** làphủHiển thịLàm mớiNút */
  showRefreshButton: true,
  /** làphủHiển thịBreadcrumb */
  showCrumbs: true,
  /** làphủHiển thịBàn làm việcTag */
  showWorkTab: true,
  /** làphủHiển thịNgôn ngữChuyển đổi */
  showLanguage: true,
  /** làphủHiển thịThanh tiến trình */
  showNprogress: false,
  /** làphủHiển thịCaiDattríchXuất */
  showSettingGuide: true,
  /** làphủHiển thịtiếtngàyvănquyển */
  showFestivalText: false,
  /** làphủHiển thịWatermark */
  watermarkVisible: false,
  /** làphủtừđộngđóngđóng */
  autoClose: false,
  /** làphủduymộtMở rộng */
  uniqueOpened: true,
  /** làphủmàunhượcmôkiểu */
  colorWeak: false,
  /** làphủLàm mới */
  refresh: false,
  /** làphủLoadingtiếtngàykhóihoa */
  holidayFireworksLoaded: false,
  /** Viềnmôkiểu */
  boxBorderMode: true,
  /** trangmặtquađộHiệu quả */
  pageTransition: 'slide-left',
  /** Thẻ TabKiểu dáng */
  tabStyle: 'tab-default',
  /** Tùy chỉnhVai */
  customRadius: '0.75',
  /** ContainerChiều rộng */
  containerWidth: ContainerWidthEnum.FULL,
  /** tiếtngàyNgày */
  festivalDate: ''
}

/**
 * LấyCaiDatMacDinhgiá trị
 * @returns CaiDatMacDinhgiá trịDoiTuong
 */
export function getSettingDefaults() {
  return { ...SETTING_DEFAULT_CONFIG }
}

/**
 * Đặt lạivìMacDinhCaiDat
 * @param currentSettings khitrướcCaiDatDoiTuong
 */
export function resetToDefaults(currentSettings: Record<string, any>) {
  const defaults = getSettingDefaults()
  Object.keys(defaults).forEach((key) => {
    if (key in currentSettings) {
      currentSettings[key] = defaults[key as keyof typeof defaults]
    }
  })
}
