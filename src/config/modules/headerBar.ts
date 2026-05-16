/**
 * Phía trênlancôngnăngCauHinh
 *
 * thốngmộtQuản lýPhía trênlancácchiếccôngnăngmôkhốicủaBậtTrạng thái。
 * thông quasửasửanàyCauHinhvănphần tửCó thểlấykhoáiBậthoặcTắtPhía trênlancủacôngnăngNút。
 *
 * @module config/headerBar
 * @author Art Design Pro Team
 */

import { HeaderBarFeatureConfig } from '@/types'

/**
 * Phía trênlancôngnăngCauHinhDoiTuong
 */
export const headerBarConfig: HeaderBarFeatureConfig = {
  menuButton: {
    enabled: true,
    description: 'khốngchếBên tráiMenucủaMở rộng/Thu gọnNút'
  },
  refreshButton: {
    enabled: true,
    description: 'trangmặtLàm mớiNút'
  },
  fastEnter: {
    enabled: true,
    description: 'khoáivàodiệncôngnăng，gợicunglệdùngỨng dụngvàliêntiếpcủakhoáiTruy cập'
  },
  breadcrumb: {
    enabled: true,
    description: 'BreadcrumbĐiều hướng，Hiển thịkhitrướctrangmặtđường'
  },
  globalSearch: {
    enabled: true,
    description: 'toànbộTimKiemcôngnăng，chiếctrìkhoáinhanhphím Ctrl+K hoặc Cmd+K'
  },
  fullscreen: {
    enabled: true,
    description: 'Toàn màn hìnhChuyển đổicôngnăng'
  },
  notification: {
    enabled: true,
    description: 'ThongBaoTrung tâm，Hiển thịHeThongThongBaovàTinNhan'
  },
  chat: {
    enabled: true,
    description: 'tròngàycôngnăng，gợicungthựcgiờgiaothông'
  },
  language: {
    enabled: true,
    description: 'đaNgôn ngữChuyển đổicôngnăng'
  },
  settings: {
    enabled: true,
    description: 'HeThongCaiDatBảng (Panel)'
  },
  themeToggle: {
    enabled: true,
    description: 'ChuDeChuyển đổicôngnăng（minhámChuDe）'
  }
}

export default headerBarConfig
