import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingStore } from '@/store/modules/setting'
import { headerBarConfig } from '@/config/modules/headerBar'
import { HeaderBarFeatureConfig } from '@/types'

export function useHeaderBar() {
  const settingStore = useSettingStore()

  const headerBarConfigRef = computed<HeaderBarFeatureConfig>(() => headerBarConfig)

  const { showMenuButton, showFastEnter, showRefreshButton, showCrumbs, showLanguage } =
    storeToRefs(settingStore)

  const isFeatureEnabled = (feature: keyof HeaderBarFeatureConfig): boolean => {
    return headerBarConfigRef.value[feature]?.enabled ?? false
  }

  const getFeatureConfig = (feature: keyof HeaderBarFeatureConfig) => {
    return headerBarConfigRef.value[feature]
  }

  const shouldShowMenuButton = computed(() => {
    return isFeatureEnabled('menuButton') && showMenuButton.value
  })

  const shouldShowRefreshButton = computed(() => {
    return isFeatureEnabled('refreshButton') && showRefreshButton.value
  })

  const shouldShowFastEnter = computed(() => {
    return isFeatureEnabled('fastEnter') && showFastEnter.value
  })

  const shouldShowBreadcrumb = computed(() => {
    return isFeatureEnabled('breadcrumb') && showCrumbs.value
  })

  const shouldShowGlobalSearch = computed(() => {
    return isFeatureEnabled('globalSearch')
  })

  const shouldShowFullscreen = computed(() => {
    return isFeatureEnabled('fullscreen')
  })

  const shouldShowNotification = computed(() => {
    return isFeatureEnabled('notification')
  })

  const shouldShowChat = computed(() => {
    return isFeatureEnabled('chat')
  })

  const shouldShowLanguage = computed(() => {
    return isFeatureEnabled('language') && showLanguage.value
  })

  const shouldShowSettings = computed(() => {
    return isFeatureEnabled('settings')
  })

  const shouldShowThemeToggle = computed(() => {
    return isFeatureEnabled('themeToggle')
  })

  const fastEnterMinWidth = computed(() => {
    const config = getFeatureConfig('fastEnter')
    return (config as any)?.minWidth || 1200
  })

  const isFeatureActive = (feature: keyof HeaderBarFeatureConfig): boolean => {
    return isFeatureEnabled(feature)
  }

  const getFeatureInfo = (feature: keyof HeaderBarFeatureConfig) => {
    return getFeatureConfig(feature)
  }

  const getEnabledFeatures = (): (keyof HeaderBarFeatureConfig)[] => {
    return Object.keys(headerBarConfigRef.value).filter(
      (key) => headerBarConfigRef.value[key as keyof HeaderBarFeatureConfig]?.enabled
    ) as (keyof HeaderBarFeatureConfig)[]
  }

  const getDisabledFeatures = (): (keyof HeaderBarFeatureConfig)[] => {
    return Object.keys(headerBarConfigRef.value).filter(
      (key) => !headerBarConfigRef.value[key as keyof HeaderBarFeatureConfig]?.enabled
    ) as (keyof HeaderBarFeatureConfig)[]
  }

  const getActiveFeatures = () => {
    return getEnabledFeatures()
  }

  const getInactiveFeatures = () => {
    return getDisabledFeatures()
  }

  return {
    headerBarConfig: headerBarConfigRef,

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

    fastEnterMinWidth, // khoáivàodiệnnhấttiểuChiều rộng

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
