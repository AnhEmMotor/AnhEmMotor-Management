/**
 * toànbộ Loading LoadingQuản lýmôkhối
 *
 * gợicungthốngmộtcủaToàn màn hìnhLoadingHoatAnhQuản lý
 *
 * ## chủcầncôngnăng
 *
 * - Toàn màn hình Loading Hiển thịvàẨn
 * - từđộngthíchPhânminhámChuDeNềnmàu
 * - Tùy chỉnh SVG LoadingHoatAnh
 * - đơnví dụmôkiểuPhòngthúctrùngphụcxây
 * - khóađịnhtrangmặtnộp
 *
 * ## khiếndùngtrườngcảnh
 *
 * - trangmặtban đầuđầuhóaLoading
 * - đạilượngDữ liệuVui lòngcầu
 * - RoutingChuyển đổiquađộ
 * - khácbướcHanhDongbằngđợi
 *
 * ## đặctính
 *
 * - từđộngđokhitrướcChuDeđồng thờiỨng dụngđốiứngNềnmàu
 * - khiếndùngTùy chỉnh SVG HoatAnh（bốnđiểmXoay）
 * - đơnví dụmôkiểuĐảm bảocùnggiờchỉcómộtchiếc Loading
 * - gợicungtiệnnhanhcủaHiểnthị/ẩngiấuphươngpháp
 *
 * @module utils/ui/loading
 * @author Art Design Pro Team
 */
import { fourDotsSpinnerSvg } from '@/assets/svg/loading'

/**
 * LấykhitrướcChuDeđốiứngcủaloadingNềnmàu
 * @returns NềnmàuChuỗi
 */
const getLoadingBackground = (): string => {
  const isDark = document.documentElement.classList.contains('dark')
  return isDark ? 'rgba(7, 7, 7, 0.85)' : '#fff'
}

const DEFAULT_LOADING_CONFIG = {
  lock: true,
  get background() {
    return getLoadingBackground()
  },
  svg: fourDotsSpinnerSvg,
  svgViewBox: '0 0 40 40',
  customClass: 'art-loading-fix'
} as const

interface LoadingInstance {
  close: () => void
}

let loadingInstance: LoadingInstance | null = null

export const loadingService = {
  /**
   * Hiển thị loading
   * @returns đóngđóng loading củaHàm
   */
  showLoading(): () => void {
    if (!loadingInstance) {
      // mỗilầnHiển thịgiờLấynhấtmớicủaCauHinh，Đảm bảoNềnmàuvớikhitrướcChuDecùngbước
      const config = {
        ...DEFAULT_LOADING_CONFIG,
        background: getLoadingBackground()
      }
      loadingInstance = ElLoading.service(config)
    }
    return () => this.hideLoading()
  },

  /**
   * Ẩn loading
   */
  hideLoading(): void {
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }
  }
}
