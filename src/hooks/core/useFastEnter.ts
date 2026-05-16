/**
 * useFastEnter - khoáivàodiệnQuản lý
 *
 * Quản lýPhía trênlancủakhoáivàodiệncôngnăng，gợicungỨng dụngDanh sáchvàkhoáiliêntiếpcủaCauHinhvàqualọc。
 * chiếctrìHoạt độngBật/Tắt、tựđịnhnghĩaxếpthứ、ứngthứcRộngđộkhốngchếđợicôngnăng。
 *
 * ## chủcầncôngnăng
 *
 * 1. Ứng dụngDanh sáchQuản lý - LấyBậtcủaỨng dụngDanh sách，từđộngxếpthứquyềntrùngxếpthứ
 * 2. khoáiliêntiếpQuản lý - LấyBậtcủakhoáiliêntiếp，chiếctrìTùy chỉnhxếpthứ
 * 3. ứngkiểuCauHinh - nêncóCauHinhtừđộngứngbiếnhóa，vôcầntayđộngCập nhật
 * 4. Chiều rộngkhốngchế - gợicungnhấttiểuHiển thịChiều rộngCauHinh，chiếctrìứngkiểuBố cục
 *
 * @module useFastEnter
 * @author Art Design Pro Team
 */

import { computed } from 'vue'
import appConfig from '@/config'
import type { FastEnterApplication, FastEnterQuickLink } from '@/types/config'

export function useFastEnter() {
  // LấykhoáivàodiệnCauHinh
  const fastEnterConfig = computed(() => appConfig.fastEnter)

  // LấyBậtcủaỨng dụngDanh sách（xếpthứquyềntrùngxếpthứ）
  const enabledApplications = computed<FastEnterApplication[]>(() => {
    if (!fastEnterConfig.value?.applications) return []

    return fastEnterConfig.value.applications
      .filter((app) => app.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  // LấyBậtcủakhoáiliêntiếp（xếpthứquyềntrùngxếpthứ）
  const enabledQuickLinks = computed<FastEnterQuickLink[]>(() => {
    if (!fastEnterConfig.value?.quickLinks) return []

    return fastEnterConfig.value.quickLinks
      .filter((link) => link.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  // LấynhấttiểuHiển thịChiều rộng
  const minWidth = computed(() => {
    return fastEnterConfig.value?.minWidth || 1200
  })

  return {
    fastEnterConfig,
    enabledApplications,
    enabledQuickLinks,
    minWidth
  }
}
