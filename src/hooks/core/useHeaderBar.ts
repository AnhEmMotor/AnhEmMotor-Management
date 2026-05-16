/**
 * useHeaderBar - Phía trênlancôngnăngQuản lý
 *
 * thốngmộtQuản lýPhía trênlancácchiếccôngnăngmôkhốicủaHiển thịTrạng tháivàCauHinhThongTin。
 * gợicunglinhsốngcủacôngnăngCông tắckhốngchế，chiếctrìHoạt độngHiểnthị/ẩngiấubộthanhcủacáccáicôngnăng。
 *
 * ## chủcầncôngnăng
 *
 * 1. côngnăngCông tắckhốngchế - thốngmộtQuản lýMenuNút、Làm mớiNút、khoáivàodiệnbằngcôngnăngcủaHiển thịTrạng thái
 * 2. CauHinhThongTinLấy - LấycácchiếccôngnăngmôkhốicủaChiTietCauHinhThongTin
 * 3. côngnăngDanh sáchTìmhỏi - khoáiLấynêncóBậthoặcTắtcủacôngnăngDanh sách
 * 4. ứngkiểuTrạng thái - nêncóTrạng tháitừđộngứngCauHinhvà store biếnhóa
 *
 * @module useHeaderBar
 * @author Art Design Pro Team
 */

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingStore } from '@/store/modules/setting'
import { headerBarConfig } from '@/config/modules/headerBar'
import { HeaderBarFeatureConfig } from '@/types'

/**
 * Phía trênlancôngnăngQuản lý
 * @returns Phía trênlancôngnăngđóngcủaTrạng tháivàPhuongThuc
 */
export function useHeaderBar() {
  const settingStore = useSettingStore()

  // LấyPhía trênlanCauHinh
  const headerBarConfigRef = computed<HeaderBarFeatureConfig>(() => headerBarConfig)

  // từstoretrongLấyđóngTrạng thái
  const { showMenuButton, showFastEnter, showRefreshButton, showCrumbs, showLanguage } =
    storeToRefs(settingStore)

  /**
   * TìmđặcđịnhcôngnănglàphủBật
   * @param feature côngnăngdanhtên
   * @returns làphủBật
   */
  const isFeatureEnabled = (feature: keyof HeaderBarFeatureConfig): boolean => {
    return headerBarConfigRef.value[feature]?.enabled ?? false
  }

  /**
   * LấycôngnăngCauHinhThongTin
   * @param feature côngnăngdanhtên
   * @returns côngnăngCauHinhThongTin
   */
  const getFeatureConfig = (feature: keyof HeaderBarFeatureConfig) => {
    return headerBarConfigRef.value[feature]
  }

  // TìmMenuNútlàphủHiển thị
  const shouldShowMenuButton = computed(() => {
    return isFeatureEnabled('menuButton') && showMenuButton.value
  })

  // TìmLàm mớiNútlàphủHiển thị
  const shouldShowRefreshButton = computed(() => {
    return isFeatureEnabled('refreshButton') && showRefreshButton.value
  })

  // TìmkhoáivàodiệnlàphủHiển thị
  const shouldShowFastEnter = computed(() => {
    return isFeatureEnabled('fastEnter') && showFastEnter.value
  })

  // TìmBreadcrumblàphủHiển thị
  const shouldShowBreadcrumb = computed(() => {
    return isFeatureEnabled('breadcrumb') && showCrumbs.value
  })

  // TìmtoànbộTimKiemlàphủHiển thị
  const shouldShowGlobalSearch = computed(() => {
    return isFeatureEnabled('globalSearch')
  })

  // TìmToàn màn hìnhNútlàphủHiển thị
  const shouldShowFullscreen = computed(() => {
    return isFeatureEnabled('fullscreen')
  })

  // TìmThongBaoTrung tâmlàphủHiển thị
  const shouldShowNotification = computed(() => {
    return isFeatureEnabled('notification')
  })

  // TìmtròngàycôngnănglàphủHiển thị
  const shouldShowChat = computed(() => {
    return isFeatureEnabled('chat')
  })

  // TìmNgôn ngữChuyển đổilàphủHiển thị
  const shouldShowLanguage = computed(() => {
    return isFeatureEnabled('language') && showLanguage.value
  })

  // TìmCaiDatBảng (Panel)làphủHiển thị
  const shouldShowSettings = computed(() => {
    return isFeatureEnabled('settings')
  })

  // TìmChuDeChuyển đổilàphủHiển thị
  const shouldShowThemeToggle = computed(() => {
    return isFeatureEnabled('themeToggle')
  })

  // LấykhoáivàodiệncủanhấttiểuChiều rộng
  const fastEnterMinWidth = computed(() => {
    const config = getFeatureConfig('fastEnter')
    return (config as any)?.minWidth || 1200
  })

  /**
   * TìmcôngnănglàphủBật（tínhdanh）
   * @param feature côngnăngdanhtên
   * @returns làphủBật
   */
  const isFeatureActive = (feature: keyof HeaderBarFeatureConfig): boolean => {
    return isFeatureEnabled(feature)
  }

  /**
   * LấycôngnăngCauHinh（tínhdanh）
   * @param feature côngnăngdanhtên
   * @returns côngnăngCauHinh
   */
  const getFeatureInfo = (feature: keyof HeaderBarFeatureConfig) => {
    return getFeatureConfig(feature)
  }

  /**
   * LấynêncóBậtcủacôngnăngDanh sách
   * @returns BậtcủacôngnăngdanhtênMảng
   */
  const getEnabledFeatures = (): (keyof HeaderBarFeatureConfig)[] => {
    return Object.keys(headerBarConfigRef.value).filter(
      (key) => headerBarConfigRef.value[key as keyof HeaderBarFeatureConfig]?.enabled
    ) as (keyof HeaderBarFeatureConfig)[]
  }

  /**
   * LấynêncóTắtcủacôngnăngDanh sách
   * @returns TắtcủacôngnăngdanhtênMảng
   */
  const getDisabledFeatures = (): (keyof HeaderBarFeatureConfig)[] => {
    return Object.keys(headerBarConfigRef.value).filter(
      (key) => !headerBarConfigRef.value[key as keyof HeaderBarFeatureConfig]?.enabled
    ) as (keyof HeaderBarFeatureConfig)[]
  }

  /**
   * LấynêncóBậtcủacôngnăng（tínhdanh）
   * @returns BậtcủacôngnăngDanh sách
   */
  const getActiveFeatures = () => {
    return getEnabledFeatures()
  }

  /**
   * LấynêncóTắtcủacôngnăng（tínhdanh）
   * @returns TắtcủacôngnăngDanh sách
   */
  const getInactiveFeatures = () => {
    return getDisabledFeatures()
  }

  return {
    // CauHinh
    headerBarConfig: headerBarConfigRef,

    // Hiển thịTrạng tháikếThuocTinh
    shouldShowMenuButton, // làphủHiển thịMenuNút
    shouldShowRefreshButton, // làphủHiển thịLàm mớiNút
    shouldShowFastEnter, // làphủHiển thịkhoáivàodiện
    shouldShowBreadcrumb, // làphủHiển thịBreadcrumb
    shouldShowGlobalSearch, // làphủHiển thịtoànbộTimKiem
    shouldShowFullscreen, // làphủHiển thịToàn màn hìnhNút
    shouldShowNotification, // làphủHiển thịThongBaoTrung tâm
    shouldShowChat, // làphủHiển thịtròngàycôngnăng
    shouldShowLanguage, // làphủHiển thịNgôn ngữChuyển đổi
    shouldShowSettings, // làphủHiển thịCaiDatBảng (Panel)
    shouldShowThemeToggle, // làphủHiển thịChuDeChuyển đổi

    // CauHinhđóng
    fastEnterMinWidth, // khoáivàodiệnnhấttiểuChiều rộng

    // PhuongThuc
    isFeatureEnabled, // TìmcôngnănglàphủBật
    isFeatureActive, // TìmcôngnănglàphủBật（tínhdanh）
    getFeatureConfig, // LấycôngnăngCauHinh
    getFeatureInfo, // LấycôngnăngCauHinh（tínhdanh）
    getEnabledFeatures, // LấynêncóBậtcủacôngnăng
    getDisabledFeatures, // LấynêncóTắtcủacôngnăng
    getActiveFeatures, // LấynêncóBậtcủacôngnăng（tínhdanh）
    getInactiveFeatures // LấynêncóTắtcủacôngnăng（tínhdanh）
  }
}
