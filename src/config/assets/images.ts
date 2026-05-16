/**
 * CauHinhHình ảnhtàinguồn
 *
 * thốngmộtQuản lýCaiDatTrung tâmkhiếndùngcủaXem trướcHình ảnhtàinguồn。
 * Bao gồmChuDeKiểu dáng、MenuBố cục、MenuPhong cáchcủaXem trướcảnh。
 *
 * ## Hình ảnhPhân loại
 *
 * - themeStyles: HeThongChuDetrướcxemđồ（sángtrò/ámtrò/tựđộng）
 * - menuLayouts: MenuBố cụctrướcxemđồ（tráicạnh/bộ/hỗnhợp/thanh）
 * - menuStyles: Menucáchtrướcxemđồ（thiếtkế/ámtrò/sángtrò）
 *
 * @module config/assets/images
 * @author Art Design Pro Team
 */

import lightTheme from '@imgs/settings/theme_styles/light.png'
import darkTheme from '@imgs/settings/theme_styles/dark.png'
import systemTheme from '@imgs/settings/theme_styles/system.png'
import verticalLayout from '@imgs/settings/menu_layouts/vertical.png'
import horizontalLayout from '@imgs/settings/menu_layouts/horizontal.png'
import mixedLayout from '@imgs/settings/menu_layouts/mixed.png'
import dualColumnLayout from '@imgs/settings/menu_layouts/dual_column.png'
import designStyle from '@imgs/settings/menu_styles/design.png'
import darkStyle from '@imgs/settings/menu_styles/dark.png'
import lightStyle from '@imgs/settings/menu_styles/light.png'

/**
 * CauHinhTrung tâmHình ảnhtàinguồnDoiTuong
 */
export const configImages = {
  /** HeThongChuDeXem trướcảnh */
  themeStyles: {
    /** sángmàuChuDe */
    light: lightTheme,
    /** ámmàuChuDe */
    dark: darkTheme,
    /** từđộngChuDe（theoHeThong） */
    system: systemTheme
  },
  /** MenuBố cụcXem trướcảnh */
  menuLayouts: {
    /** Bên tráiMenu */
    vertical: verticalLayout,
    /** Phía trênMenu */
    horizontal: horizontalLayout,
    /** hỗnhợpMenu */
    mixed: mixedLayout,
    /** đôilanMenu */
    dualColumn: dualColumnLayout
  },
  /** MenuPhong cáchXem trướcảnh */
  menuStyles: {
    /** thiếtkếPhong cách */
    design: designStyle,
    /** ámmàuPhong cách */
    dark: darkStyle,
    /** sángmàuPhong cách */
    light: lightStyle
  }
}
