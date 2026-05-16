/**
 * HeThongCaiDatTrạng tháiQuản lýmôkhối
 *
 * gợicungĐầy đủcủaHeThongCaiDatTrạng tháiQuản lý
 *
 * ## chủcầncôngnăng
 *
 * - MenuBố cụcCauHinh（Bên trái、Phía trên、hỗnhợp、đôilan）
 * - ChuDeQuản lý（sángmàu、ámmàu、từđộng）
 * - MenuChuDeKiểu dángCauHinh
 * - giaomặtHiển thịCông tắc（Breadcrumb、Thẻ Tab、Ngôn ngữChuyển đổibằng）
 * - côngnăngCông tắc（tayđànmôkiểu、màunhượcmôkiểu、Watermarkbằng）
 * - Kiểu dángCauHinh（Viền、Vai、ContainerChiều rộng、trangmặtquađộ）
 * - tiếtngàycôngnăngCauHinh
 * - Element Plus ChuDemàuHoạt độngCaiDat
 *
 * ## khiếndùngtrườngcảnh
 *
 * - CaiDatBảng (Panel)CauHinhQuản lý
 * - ChuDeChuyển đổivàKiểu dángđịnhchế
 * - giaomặtcôngnăngCông tắckhốngchế
 * - NguoiDungthiênhảoCaiDattrìlâuhóa
 *
 * ## trìlâuhóa
 *
 * - khiếndùng localStorage tồntrữ
 * - tồntrữphím：sys-v{version}-setting
 * - chiếctrìvượtbảnquyểnDữ liệudờiDi
 *
 * @module store/modules/setting
 * @author Art Design Pro Team
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { MenuThemeType } from '@/types/store'
import AppConfig from '@/config'
import { SystemThemeEnum, MenuThemeEnum, MenuTypeEnum, ContainerWidthEnum } from '@/enums/appEnum'
import { setElementThemeColor } from '@/utils/ui'
import { useCeremony } from '@/hooks/core/useCeremony'
import { StorageConfig } from '@/utils'
import { SETTING_DEFAULT_CONFIG } from '@/config/setting'

/**
 * HeThongCaiDatTrạng tháiQuản lý
 * Quản lýỨng dụngcủaMenu、ChuDe、giaomặtHiển thịbằngcácmụcCaiDat
 */
export const useSettingStore = defineStore(
  'settingStore',
  () => {
    // MenuđóngCaiDat
    /** Menuloạikiểu */
    const menuType = ref(SETTING_DEFAULT_CONFIG.menuType)
    /** MenuMở rộngChiều rộng */
    const menuOpenWidth = ref(SETTING_DEFAULT_CONFIG.menuOpenWidth)
    /** MenulàphủMở rộng */
    const menuOpen = ref(SETTING_DEFAULT_CONFIG.menuOpen)
    /** đôiMenulàphủHiển thịvănquyển */
    const dualMenuShowText = ref(SETTING_DEFAULT_CONFIG.dualMenuShowText)

    // ChuDeđóngCaiDat
    /** HeThongChuDeloạikiểu */
    const systemThemeType = ref(SETTING_DEFAULT_CONFIG.systemThemeType)
    /** HeThongChuDemôkiểu */
    const systemThemeMode = ref(SETTING_DEFAULT_CONFIG.systemThemeMode)
    /** MenuChuDeloạikiểu */
    const menuThemeType = ref(SETTING_DEFAULT_CONFIG.menuThemeType)
    /** HeThongChuDeMàu sắc */
    const systemThemeColor = ref(SETTING_DEFAULT_CONFIG.systemThemeColor)

    // giaomặtHiển thịCaiDat
    /** làphủHiển thịMenuNút */
    const showMenuButton = ref(SETTING_DEFAULT_CONFIG.showMenuButton)
    /** làphủHiển thịkhoáivàodiện */
    const showFastEnter = ref(SETTING_DEFAULT_CONFIG.showFastEnter)
    /** làphủHiển thịLàm mớiNút */
    const showRefreshButton = ref(SETTING_DEFAULT_CONFIG.showRefreshButton)
    /** làphủHiển thịBreadcrumb */
    const showCrumbs = ref(SETTING_DEFAULT_CONFIG.showCrumbs)
    /** làphủHiển thịBàn làm việcTag */
    const showWorkTab = ref(SETTING_DEFAULT_CONFIG.showWorkTab)
    /** làphủHiển thịNgôn ngữChuyển đổi */
    const showLanguage = ref(SETTING_DEFAULT_CONFIG.showLanguage)
    /** làphủHiển thịThanh tiến trình */
    const showNprogress = ref(SETTING_DEFAULT_CONFIG.showNprogress)
    /** làphủHiển thịCaiDattríchXuất */
    const showSettingGuide = ref(SETTING_DEFAULT_CONFIG.showSettingGuide)
    /** làphủHiển thịtiếtngàyvănquyển */
    const showFestivalText = ref(SETTING_DEFAULT_CONFIG.showFestivalText)
    /** làphủHiển thịWatermark */
    const watermarkVisible = ref(SETTING_DEFAULT_CONFIG.watermarkVisible)

    // côngnăngCaiDat
    /** làphủtừđộngđóngđóng */
    const autoClose = ref(SETTING_DEFAULT_CONFIG.autoClose)
    /** làphủduymộtMở rộng */
    const uniqueOpened = ref(SETTING_DEFAULT_CONFIG.uniqueOpened)
    /** làphủmàunhượcmôkiểu */
    const colorWeak = ref(SETTING_DEFAULT_CONFIG.colorWeak)
    /** làphủLàm mới */
    const refresh = ref(SETTING_DEFAULT_CONFIG.refresh)
    /** làphủLoadingtiếtngàykhóihoa */
    const holidayFireworksLoaded = ref(SETTING_DEFAULT_CONFIG.holidayFireworksLoaded)

    // Kiểu dángCaiDat
    /** Viềnmôkiểu */
    const boxBorderMode = ref(SETTING_DEFAULT_CONFIG.boxBorderMode)
    /** trangmặtquađộHiệu quả */
    const pageTransition = ref(SETTING_DEFAULT_CONFIG.pageTransition)
    /** Thẻ TabKiểu dáng */
    const tabStyle = ref(SETTING_DEFAULT_CONFIG.tabStyle)
    /** Tùy chỉnhVai */
    const customRadius = ref(SETTING_DEFAULT_CONFIG.customRadius)
    /** ContainerChiều rộng */
    const containerWidth = ref(SETTING_DEFAULT_CONFIG.containerWidth)

    // tiếtngàyđóng
    /** tiếtngàyNgày */
    const festivalDate = ref('')

    /**
     * LấyMenuChuDe
     * liệukhitrướcChuDeloạikiểuvàámmàumôkiểuQuay lạiđốiứngcủaChuDeCauHinh
     */
    const getMenuTheme = computed((): MenuThemeType => {
      const list = AppConfig.themeList.filter((item) => item.theme === menuThemeType.value)
      if (isDark.value) {
        return AppConfig.darkMenuStyles[0]
      } else {
        return list[0]
      }
    })

    /**
     * đoánlàphủvìámmàumôkiểu
     */
    const isDark = computed((): boolean => {
      return systemThemeType.value === SystemThemeEnum.DARK
    })

    /**
     * LấyMenuMở rộngChiều rộng
     */
    const getMenuOpenWidth = computed((): string => {
      return menuOpenWidth.value + 'px' || SETTING_DEFAULT_CONFIG.menuOpenWidth + 'px'
    })

    /**
     * LấyTùy chỉnhVai
     */
    const getCustomRadius = computed((): string => {
      return customRadius.value + 'rem' || SETTING_DEFAULT_CONFIG.customRadius + 'rem'
    })

    /**
     * làphủHiển thịkhóihoa
     * liệukhitrướcNgàyvàtiếtngàyNgàyđoánlàphủHiển thịkhóihoaHiệu quả
     */
    const isShowFireworks = computed((): boolean => {
      return festivalDate.value === useCeremony().currentFestivalData.value?.date ? false : true
    })

    /**
     * Chuyển đổiMenuBố cục
     * @param type Menuloạikiểu
     */
    const switchMenuLayouts = (type: MenuTypeEnum) => {
      menuType.value = type
    }

    /**
     * CaiDatMenuMở rộngChiều rộng
     * @param width Chiều rộnggiá trị
     */
    const setMenuOpenWidth = (width: number) => {
      menuOpenWidth.value = width
    }

    /**
     * CaiDattoànbộChuDe
     * @param theme ChuDeloạikiểu
     * @param themeMode ChuDemôkiểu
     */
    const setGlopTheme = (theme: SystemThemeEnum, themeMode: SystemThemeEnum) => {
      systemThemeType.value = theme
      systemThemeMode.value = themeMode
      localStorage.setItem(StorageConfig.THEME_KEY, theme)
    }

    /**
     * Chuyển đổiMenuKiểu dáng
     * @param theme MenuChuDe
     */
    const switchMenuStyles = (theme: MenuThemeEnum) => {
      menuThemeType.value = theme
    }

    /**
     * CaiDatElement PlusChuDeMàu sắc
     * @param theme ChuDeMàu sắc
     */
    const setElementTheme = (theme: string) => {
      systemThemeColor.value = theme
      setElementThemeColor(theme)
    }

    /**
     * Chuyển đổiViềnmôkiểu
     */
    const setBorderMode = () => {
      boxBorderMode.value = !boxBorderMode.value
    }

    /**
     * CaiDatContainerChiều rộng
     * @param width ContainerChiều rộngchiếcBáogiá trị
     */
    const setContainerWidth = (width: ContainerWidthEnum) => {
      containerWidth.value = width
    }

    /**
     * Chuyển đổiduymộtMở rộngmôkiểu
     */
    const setUniqueOpened = () => {
      uniqueOpened.value = !uniqueOpened.value
    }

    /**
     * Chuyển đổiMenuNútHiển thị
     */
    const setButton = () => {
      showMenuButton.value = !showMenuButton.value
    }

    /**
     * Chuyển đổikhoáivàodiệnHiển thị
     */
    const setFastEnter = () => {
      showFastEnter.value = !showFastEnter.value
    }

    /**
     * Chuyển đổitừđộngđóngđóng
     */
    const setAutoClose = () => {
      autoClose.value = !autoClose.value
    }

    /**
     * Chuyển đổiLàm mớiNútHiển thị
     */
    const setShowRefreshButton = () => {
      showRefreshButton.value = !showRefreshButton.value
    }

    /**
     * Chuyển đổiBreadcrumbHiển thị
     */
    const setCrumbs = () => {
      showCrumbs.value = !showCrumbs.value
    }

    /**
     * CaiDatBàn làm việcTagHiển thị
     * @param show làphủHiển thị
     */
    const setWorkTab = (show: boolean) => {
      showWorkTab.value = show
    }

    /**
     * Chuyển đổiNgôn ngữChuyển đổiHiển thị
     */
    const setLanguage = () => {
      showLanguage.value = !showLanguage.value
    }

    /**
     * Chuyển đổiThanh tiến trìnhHiển thị
     */
    const setNprogress = () => {
      showNprogress.value = !showNprogress.value
    }

    /**
     * Chuyển đổimàunhượcmôkiểu
     */
    const setColorWeak = () => {
      colorWeak.value = !colorWeak.value
    }

    /**
     * ẨnCaiDattríchXuất
     */
    const hideSettingGuide = () => {
      showSettingGuide.value = false
    }

    /**
     * Hiển thịCaiDattríchXuất
     */
    const openSettingGuide = () => {
      showSettingGuide.value = true
    }

    /**
     * CaiDattrangmặtquađộHiệu quả
     * @param transition quađộHiệu quảdanhtên
     */
    const setPageTransition = (transition: string) => {
      pageTransition.value = transition
    }

    /**
     * CaiDatThẻ TabKiểu dáng
     * @param style Kiểu dángdanhtên
     */
    const setTabStyle = (style: string) => {
      tabStyle.value = style
    }

    /**
     * CaiDatMenuMở rộngTrạng thái
     * @param open làphủMở rộng
     */
    const setMenuOpen = (open: boolean) => {
      menuOpen.value = open
    }

    /**
     * Làm mớitrangmặt
     */
    const reload = () => {
      refresh.value = !refresh.value
    }

    /**
     * CaiDatWatermarkHiển thị
     * @param visible làphủHiển thị
     */
    const setWatermarkVisible = (visible: boolean) => {
      watermarkVisible.value = visible
    }

    /**
     * CaiDatTùy chỉnhVai
     * @param radius Vaigiá trị
     */
    const setCustomRadius = (radius: string) => {
      customRadius.value = radius
      document.documentElement.style.setProperty('--custom-radius', `${radius}rem`)
    }

    /**
     * CaiDattiếtngàykhóihoaLoadingTrạng thái
     * @param isLoad làphủĐãLoading
     */
    const setholidayFireworksLoaded = (isLoad: boolean) => {
      holidayFireworksLoaded.value = isLoad
    }

    /**
     * CaiDattiếtngàyvănquyểnHiển thị
     * @param show làphủHiển thị
     */
    const setShowFestivalText = (show: boolean) => {
      showFestivalText.value = show
    }

    const setFestivalDate = (date: string) => {
      festivalDate.value = date
    }

    const setDualMenuShowText = (show: boolean) => {
      dualMenuShowText.value = show
    }

    return {
      menuType,
      menuOpenWidth,
      systemThemeType,
      systemThemeMode,
      menuThemeType,
      systemThemeColor,
      boxBorderMode,
      uniqueOpened,
      showMenuButton,
      showFastEnter,
      showRefreshButton,
      showCrumbs,
      autoClose,
      showWorkTab,
      showLanguage,
      showNprogress,
      colorWeak,
      showSettingGuide,
      pageTransition,
      tabStyle,
      menuOpen,
      refresh,
      watermarkVisible,
      customRadius,
      holidayFireworksLoaded,
      showFestivalText,
      festivalDate,
      dualMenuShowText,
      containerWidth,
      getMenuTheme,
      isDark,
      getMenuOpenWidth,
      getCustomRadius,
      isShowFireworks,
      switchMenuLayouts,
      setMenuOpenWidth,
      setGlopTheme,
      switchMenuStyles,
      setElementTheme,
      setBorderMode,
      setContainerWidth,
      setUniqueOpened,
      setButton,
      setFastEnter,
      setAutoClose,
      setShowRefreshButton,
      setCrumbs,
      setWorkTab,
      setLanguage,
      setNprogress,
      setColorWeak,
      hideSettingGuide,
      openSettingGuide,
      setPageTransition,
      setTabStyle,
      setMenuOpen,
      reload,
      setWatermarkVisible,
      setCustomRadius,
      setholidayFireworksLoaded,
      setShowFestivalText,
      setFestivalDate,
      setDualMenuShowText
    }
  },
  {
    persist: {
      key: 'setting',
      storage: localStorage
    }
  }
)
