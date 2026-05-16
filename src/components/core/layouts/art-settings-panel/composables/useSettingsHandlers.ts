import { useSettingStore } from '@/store/modules/setting'
import { storeToRefs } from 'pinia'
import type { ContainerWidthEnum } from '@/enums/appEnum'

/**
 * CaiDatmụcthôngdùngXuLyLogic
 */
export function useSettingsHandlers() {
  const settingStore = useSettingStore()

  // DOM HanhDongđóng
  const domOperations = {
    // CaiDatHTMLloạidanh
    setHtmlClass: (className: string, add: boolean) => {
      const el = document.getElementsByTagName('html')[0]
      if (add) {
        el.classList.add(className)
      } else {
        el.classList.remove(className)
      }
    },

    // CaiDatnguyêntốThuocTinh
    setRootAttribute: (attribute: string, value: string) => {
      const el = document.documentElement
      el.setAttribute(attribute, value)
    },

    // CaiDatbodyloạidanh
    setBodyClass: (className: string, add: boolean) => {
      const el = document.getElementsByTagName('body')[0]
      if (add) {
        el.classList.add(className)
      } else {
        el.classList.remove(className)
      }
    }
  }

  // thôngdùngChuyển đổiXuLythiết bị
  const createToggleHandler = (storeMethod: () => void, callback?: () => void) => {
    return () => {
      storeMethod()
      callback?.()
    }
  }

  // thôngdùnggiá trịbiếnhơnXuLythiết bị
  const createValueHandler = <T>(
    storeMethod: (value: T) => void,
    callback?: (value: T) => void
  ) => {
    return (value: T) => {
      if (value !== undefined && value !== null) {
        storeMethod(value)
        callback?.(value)
      }
    }
  }

  // Cơ bảnCaiDatXuLythiết bị
  const basicHandlers = {
    // Bàn làm việcThẻ Tab
    workTab: createToggleHandler(() => settingStore.setWorkTab(!settingStore.showWorkTab)),

    // Menutayđàn
    uniqueOpened: createToggleHandler(() => settingStore.setUniqueOpened()),

    // Hiển thịMenuNút
    menuButton: createToggleHandler(() => settingStore.setButton()),

    // Hiển thịkhoáivàodiện
    fastEnter: createToggleHandler(() => settingStore.setFastEnter()),

    // Hiển thịLàm mớiNút
    refreshButton: createToggleHandler(() => settingStore.setShowRefreshButton()),

    // Hiển thịBreadcrumb
    crumbs: createToggleHandler(() => settingStore.setCrumbs()),

    // Hiển thịNgôn ngữChuyển đổi
    language: createToggleHandler(() => settingStore.setLanguage()),

    // Hiển thịThanh tiến trình
    nprogress: createToggleHandler(() => settingStore.setNprogress()),

    // màunhượcmôkiểu
    colorWeak: createToggleHandler(
      () => settingStore.setColorWeak(),
      () => {
        domOperations.setHtmlClass('color-weak', settingStore.colorWeak)
      }
    ),

    // WatermarkHiển thị
    watermark: createToggleHandler(() =>
      settingStore.setWatermarkVisible(!settingStore.watermarkVisible)
    ),

    // MenuMở rộngChiều rộng
    menuOpenWidth: createValueHandler<number>((width: number) =>
      settingStore.setMenuOpenWidth(width)
    ),

    // Thẻ TabPhong cách
    tabStyle: createValueHandler<string>((style: string) => settingStore.setTabStyle(style)),

    // trangmặtChuyển đổiHoatAnh
    pageTransition: createValueHandler<string>((transition: string) =>
      settingStore.setPageTransition(transition)
    ),

    // VaiKích thước
    customRadius: createValueHandler<string>((radius: string) =>
      settingStore.setCustomRadius(radius)
    )
  }

  // tửKiểu dángXuLythiết bị
  const boxStyleHandlers = {
    // CaiDattửmôkiểu
    setBoxMode: (type: 'border-mode' | 'shadow-mode') => {
      const { boxBorderMode } = storeToRefs(settingStore)

      // PhòngthúctrùngphụcCaiDat
      if (
        (type === 'shadow-mode' && boxBorderMode.value === false) ||
        (type === 'border-mode' && boxBorderMode.value === true)
      ) {
        return
      }

      setTimeout(() => {
        domOperations.setRootAttribute('data-box-mode', type)
        settingStore.setBorderMode()
      }, 50)
    }
  }

  // Màu sắcCaiDatXuLythiết bị
  const colorHandlers = {
    // ChọnChuDemàu
    selectColor: (theme: string) => {
      settingStore.setElementTheme(theme)
      settingStore.reload()
    }
  }

  // ContainerCaiDatXuLythiết bị
  const containerHandlers = {
    // CaiDatContainerChiều rộng
    setWidth: (type: ContainerWidthEnum) => {
      settingStore.setContainerWidth(type)
      settingStore.reload()
    }
  }

  return {
    domOperations,
    basicHandlers,
    boxStyleHandlers,
    colorHandlers,
    containerHandlers,
    createToggleHandler,
    createValueHandler
  }
}
