/**
 * useLayoutHeight - trangmặtBố cụcChiều caoQuản lý
 *
 * từđộngkếvàQuản lýtrangmặtNoiDungđồngTêncủaChiều cao，Đảm bảoNoiDungđồngTênnăngđủđúngChínhĐiền vàothừathừakhônggian。
 * Lắng ngheđầubộnguyêntốChiều caobiếnhóa，Hoạt độngđiềuchỉnhNoiDungđồngTênChiều cao，tránhmiễnrahiệnCuộnđiềuhoặcBố cụcLỗiloạn。
 *
 * ## chủcầncôngnăng
 *
 * 1. Hoạt độngChiều caokế - liệuđầubộnguyêntốChiều caotừđộngkếNoiDungđồngTênChiều cao
 * 2. ứngkiểuLắng nghe - từđộngLắng nghenguyêntốthướctấcbiếnhóađồng thờiCập nhậtChiều cao
 * 3. CSS biếnlượngcùngbước - từđộngCập nhật CSS biếnlượng，phươngtiệntoànbộkhiếndùng
 * 4. linhsốngCauHinh - chiếctrìTùy chỉnhgian、CSS biếnlượngdanhbằng
 * 5. từđộngTimKiemmôkiểu - gợicungthông qua ID từđộngTimKiemnguyêntốcủatiệnnhanhphươngkiểu
 *
 * @module useLayoutHeight
 * @author Art Design Pro Team
 */

import { ref, computed, watch, onMounted } from 'vue'
import { useElementSize } from '@vueuse/core'

/**
 * trangmặtContainerChiều caoCauHinh
 */
interface LayoutHeightOptions {
  /** tránngoàicủagian（MacDinh 15px） */
  extraSpacing?: number
  /** làphủtừđộngCập nhật CSS biếnlượng（MacDinh true） */
  updateCssVar?: boolean
  /** CSS biếnlượngdanhtên（MacDinh '--art-full-height'） */
  cssVarName?: string
}

export function useLayoutHeight(options: LayoutHeightOptions = {}) {
  const { extraSpacing = 15, updateCssVar = true, cssVarName = '--art-full-height' } = options

  // nguyêntốtríchdùng
  const headerRef = ref<HTMLElement>()
  const contentHeaderRef = ref<HTMLElement>()

  // khiếndùng VueUse từđộngLắng nghenguyêntốthướctấcbiếnhóa
  const { height: headerHeight } = useElementSize(headerRef)
  const { height: contentHeaderHeight } = useElementSize(contentHeaderRef)

  // kếContainernhấttiểuChiều cao（ứngkiểu）
  const containerMinHeight = computed(() => {
    const totalHeight = headerHeight.value + contentHeaderHeight.value + extraSpacing
    return `calc(100vh - ${totalHeight}px)`
  })

  if (updateCssVar) {
    watch(
      containerMinHeight,
      (newHeight) => {
        requestAnimationFrame(() => {
          document.documentElement.style.setProperty(cssVarName, newHeight)
        })
      },
      { immediate: true }
    )
  }

  return {
    /** ContainernhấttiểuChiều cao（ứngkiểu） */
    containerMinHeight,
    /** đầubộnguyêntốtríchdùng */
    headerRef,
    /** NoiDungđầubộnguyêntốtríchdùng */
    contentHeaderRef,
    /** đầubộChiều cao（ứngkiểu） */
    headerHeight,
    /** NoiDungđầubộChiều cao（ứngkiểu） */
    contentHeaderHeight
  }
}

/**
 * thông qua ID từđộngTimKiemnguyêntốcủaBố cụcChiều caoQuản lý
 * thíchdùngởvôphápthẳngtiếpLấynguyêntốtríchdùngcủatrườngcảnh
 *
 * @param headerIds đầubộnguyêntốcủa ID Mảng
 * @param options CauHinhvịmục
 *
 * ```
 */
export function useAutoLayoutHeight(
  headerIds: string[] = ['app-header', 'app-content-header'],
  options: LayoutHeightOptions = {}
) {
  const { extraSpacing = 15, updateCssVar = true, cssVarName = '--art-full-height' } = options

  // xâynguyêntốtríchdùng
  const headerRef = ref<HTMLElement>()
  const contentHeaderRef = ref<HTMLElement>()

  // khiếndùng VueUse từđộngLắng nghenguyêntốthướctấcbiếnhóa
  const { height: headerHeight } = useElementSize(headerRef)
  const { height: contentHeaderHeight } = useElementSize(contentHeaderRef)

  // kếContainernhấttiểuChiều cao（ứngkiểu）
  const containerMinHeight = computed(() => {
    const totalHeight = headerHeight.value + contentHeaderHeight.value + extraSpacing
    return `calc(100vh - ${totalHeight}px)`
  })

  if (updateCssVar) {
    watch(
      containerMinHeight,
      (newHeight) => {
        requestAnimationFrame(() => {
          document.documentElement.style.setProperty(cssVarName, newHeight)
        })
      },
      { immediate: true }
    )
  }

  // tại DOM MountsauTimKiemnguyêntố
  onMounted(() => {
    if (typeof document !== 'undefined') {
      // khiếndùng nextTick Đảm bảo DOM hoàntoànRender
      requestAnimationFrame(() => {
        const header = document.getElementById(headerIds[0])
        const contentHeader = document.getElementById(headerIds[1])

        if (header) {
          headerRef.value = header
        }
        if (contentHeader) {
          contentHeaderRef.value = contentHeader
        }
      })
    }
  })

  return {
    /** ContainernhấttiểuChiều cao（ứngkiểu） */
    containerMinHeight,
    /** đầubộnguyêntốtríchdùng */
    headerRef,
    /** NoiDungđầubộnguyêntốtríchdùng */
    contentHeaderRef,
    /** đầubộChiều cao（ứngkiểu） */
    headerHeight,
    /** NoiDungđầubộChiều cao（ứngkiểu） */
    contentHeaderHeight
  }
}
