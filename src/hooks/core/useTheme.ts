/**
 * useTheme - HeThongChuDeQuản lý
 *
 * gợicungĐầy đủcủaChuDeChuyển đổivàQuản lýcôngnăng，chiếctrìsángmàu、ámmàuvàtừđộngmôkiểu。
 * từđộngXuLyChuDeChuyển đổigiờcủaquađộHiệu quả，Đảm bảoChuyển đổichuyểnthôngvôchớpsáng。
 *
 * ## chủcầncôngnăng
 *
 * 1. ChuDeChuyển đổi - chiếctrìsángmàu、ámmàu、từđộngbaloạiChuDemôkiểu
 * 2. từđộngmôkiểu - liệuHeThongthiênhảotừđộngChuyển đổiChuDe
 * 3. Màu sắcthíchPhân - từđộngđiềuchỉnhChuDemàucủaminhámbiếnthể（9 chiếctầngcấp）
 * 4. quađộTốihóa - Chuyển đổigiờlâmgiờTắtquađộHiệu quả，tránhmiễnchớpsáng
 * 5. Trạng tháitrìlâuhóa - ChuDeCaiDattừđộngLưutồnđến store
 *
 * ## Ví dụ sử dụng
 *
 * ```typescript
 * const { switchThemeStyles } = useTheme()
 *
 * // Chuyển đổiđếnámmàuChuDe
 * switchThemeStyles(SystemThemeEnum.DARK)
 *
 * // Chuyển đổiđếnsángmàuChuDe
 * switchThemeStyles(SystemThemeEnum.LIGHT)
 *
 * // Chuyển đổiđếntừđộngmôkiểu（theoHeThong）
 * switchThemeStyles(SystemThemeEnum.AUTO)
 * ```
 *
 * @module useTheme
 * @author Art Design Pro Team
 */

import { useSettingStore } from '@/store/modules/setting'
import { SystemThemeEnum } from '@/enums/appEnum'
import AppConfig from '@/config'
import { SystemThemeTypes } from '@/types/store'
import { getDarkColor, getLightColor, setElementThemeColor } from '@/utils/ui'
import { usePreferredDark } from '@vueuse/core'
import { watch } from 'vue'

export function useTheme() {
  const settingStore = useSettingStore()

  // TắtquađộHiệu quả
  const disableTransitions = () => {
    const style = document.createElement('style')
    style.setAttribute('id', 'disable-transitions')
    style.textContent = '* { transition: none !important; }'
    document.head.appendChild(style)
  }

  // BậtquađộHiệu quả
  const enableTransitions = () => {
    const style = document.getElementById('disable-transitions')
    if (style) {
      style.remove()
    }
  }

  // CaiDatHeThongChuDe
  const setSystemTheme = (theme: SystemThemeEnum, themeMode?: SystemThemeEnum) => {
    // lâmgiờTắtquađộHiệu quả
    disableTransitions()

    const el = document.getElementsByTagName('html')[0]
    const isDark = theme === SystemThemeEnum.DARK

    if (!themeMode) {
      themeMode = theme
    }

    const currentTheme = AppConfig.systemThemeStyles[theme as keyof SystemThemeTypes]

    if (currentTheme) {
      el.setAttribute('class', currentTheme.className)
    }

    // CaiDatNútMàu sắcthêmthâmhoặcbiếnthiển
    const primary = settingStore.systemThemeColor

    for (let i = 1; i <= 9; i++) {
      document.documentElement.style.setProperty(
        `--el-color-primary-light-${i}`,
        isDark ? `${getDarkColor(primary, i / 10)}` : `${getLightColor(primary, i / 10)}`
      )
    }

    // Cập nhậtstoretrongcủaChuDeCaiDat
    settingStore.setGlopTheme(theme, themeMode)

    // khiếndùng requestAnimationFrame Đảm bảotạidướimộtkhôiphụcquađộHiệu quả
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        enableTransitions()
      })
    })
  }

  // khiếndùng VueUse của usePreferredDark đoHeThongChuDethiênhảo
  const prefersDark = usePreferredDark()

  // từđộngCaiDatHeThongChuDe
  const setSystemAutoTheme = () => {
    const theme = prefersDark.value ? SystemThemeEnum.DARK : SystemThemeEnum.LIGHT
    setSystemTheme(theme, SystemThemeEnum.AUTO)
  }

  // Chuyển đổiChuDe
  const switchThemeStyles = (theme: SystemThemeEnum) => {
    if (theme === SystemThemeEnum.AUTO) {
      setSystemAutoTheme()
    } else {
      setSystemTheme(theme)
    }
  }

  return {
    setSystemTheme,
    setSystemAutoTheme,
    switchThemeStyles,
    prefersDark
  }
}

/**
 * ban đầuđầuhóaChuDeHeThong
 */
export function initializeTheme() {
  const settingStore = useSettingStore()
  const prefersDark = usePreferredDark()

  // liệuHeThongthiênhảoỨng dụngChuDe
  const applyThemeByMode = () => {
    const el = document.getElementsByTagName('html')[0]
    let actualTheme = settingStore.systemThemeType

    // nếuquảlà AUTO môkiểu，đoHeThongthiênhảo
    if (settingStore.systemThemeMode === SystemThemeEnum.AUTO) {
      actualTheme = prefersDark.value ? SystemThemeEnum.DARK : SystemThemeEnum.LIGHT
      // Cập nhậtthựctếỨng dụngcủaChuDeloạikiểu
      settingStore.systemThemeType = actualTheme
    }

    // CaiDatChuDe class
    const currentTheme = AppConfig.systemThemeStyles[actualTheme as keyof SystemThemeTypes]
    if (currentTheme) {
      el.setAttribute('class', currentTheme.className)
    }

    // CaiDatChuDeMàu sắc
    setElementThemeColor(settingStore.systemThemeColor)

    // CaiDatVai
    document.documentElement.style.setProperty('--custom-radius', `${settingStore.customRadius}rem`)
  }

  // Ứng dụngChuDe
  applyThemeByMode()

  // nếuquảlà AUTO môkiểu，Lắng ngheHeThongChuDebiếnhóa（khiếndùng VueUse củaứngkiểuđặctính）
  if (settingStore.systemThemeMode === SystemThemeEnum.AUTO) {
    watch(
      prefersDark,
      () => {
        // chỉcótại AUTO môkiểudướimớiứngHeThongChuDebiếnhóa
        if (settingStore.systemThemeMode === SystemThemeEnum.AUTO) {
          applyThemeByMode()
        }
      },
      { immediate: false }
    )
  }
}
