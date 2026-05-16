/**
 * ChuDeHoatAnhCông cụmôkhối
 *
 * gợicungChuDeChuyển đổicủaTrực quanHoatAnhHiệu quả
 *
 * ## chủcầncôngnăng
 *
 * - ởChuộttiêuNhấnViTricủahìnhmởHoatAnh
 * - View Transition API chiếctrì（hiệnđạixemthiết bị）
 * - giảmcấpXuLy（KhôngchiếctrìHoatAnhcủaxemthiết bị）
 * - ámđenChuDeChuyển đổiquađộHiệu quả
 * - trangmặtLàm mớigiờcủaChuDequađộTốihóa
 *
 * ## khiếndùngtrườngcảnh
 *
 * - minhámChuDeChuyển đổi
 * - gợilênNguoiDungthểnghiệmcủaTrực quanngượchồi
 * - trangmặtLàm mớigiờcủatrượtquađộ
 *
 * ## kỹthuậtthựchiện
 *
 * - khiếndùng CSS biếnlượngtồntrữNhấnViTrivànửa
 * - lợidùng View Transition API thựchiệnchuyểnthôngHoatAnh
 * - thông qua CSS class khốngchếquađộHiệu quả
 * - từđộngkếnhấtđạimởnửa
 *
 * @module utils/theme/animation
 * @author Art Design Pro Team
 */
import { useCommon } from '@/hooks/core/useCommon'
import { useTheme } from '@/hooks/core/useTheme'
import { SystemThemeEnum } from '@/enums/appEnum'
import { useSettingStore } from '@/store/modules/setting'
const { LIGHT, DARK } = SystemThemeEnum

/**
 * ChuDeChuyển đổiHoatAnh
 * @param e ChuộttiêuNhấnSuKien
 */
export const themeAnimation = (e: any) => {
  const x = e.clientX
  const y = e.clientY
  // kếChuộttiêuNhấnViTriKhoảng cáchthịsổcủanhấtđạinửa
  const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

  // CaiDatCSSbiếnlượng
  document.documentElement.style.setProperty('--x', x + 'px')
  document.documentElement.style.setProperty('--y', y + 'px')
  document.documentElement.style.setProperty('--r', endRadius + 'px')

  if (document.startViewTransition) {
    document.startViewTransition(() => toggleTheme())
  } else {
    toggleTheme()
  }
}

/**
 * Chuyển đổiChuDe
 */
const toggleTheme = () => {
  useTheme().switchThemeStyles(useSettingStore().systemThemeType === LIGHT ? DARK : LIGHT)
  useCommon().refresh()
}

/**
 * Chuyển đổiChuDequađộHiệu quả
 * @param enable làphủBậtquađộHiệu quả
 */
export const toggleTransition = (enable: boolean) => {
  const body = document.body

  if (enable) {
    body.classList.add('theme-change')
  } else {
    setTimeout(() => {
      body.classList.remove('theme-change')
    }, 300)
  }
}
