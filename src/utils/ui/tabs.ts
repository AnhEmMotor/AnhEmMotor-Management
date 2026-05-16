/**
 * Thẻ TabBố cụcCauHinhmôkhối
 *
 * gợicungKhôngcùngThẻ TabKiểu dángcủaChiều caovàgianCauHinh
 *
 * ## chủcầncôngnăng
 *
 * - đaloạiThẻ TabKiểu dángCauHinh（MacDinh、Thẻ、thung lũngcaPhong cách）
 * - tiêunhãntrangđánhmở/quanđóngTrạng tháicủaChiều caoQuản lý
 * - Phía trêngiantừđộngkế
 * - CauHinhLấyvàMacDinhgiá trịXuLy
 *
 * ## khiếndùngtrườngcảnh
 *
 * - cônglàmThẻ Tab（Worktab）Bố cụckế
 * - trangmặtNoiDungđồngTênChiều caođiềuchỉnh
 * - tiêunhãntrangHiểnthị/ẩngiấuthờicủađộnghọa
 * - ứngkiểuBố cụcthíchPhân
 *
 * ## CauHinhmụcMô tả
 *
 * - openTop: Thẻ TabHiển thịgiờ，NoiDungđồngTênKhoảng cáchPhía trêncủaKhoảng cách
 * - closeTop: Thẻ TabẨngiờ，NoiDungđồngTênKhoảng cáchPhía trêncủaKhoảng cách
 * - openHeight: Thẻ TabHiển thịgiờcủatổngChiều cao（Bao gồmTaglan）
 * - closeHeight: Thẻ TabẨngiờcủatổngChiều cao（chỉđầubộ）
 *
 * ## chiếctrìcủaKiểu dáng
 *
 * - tab-default: MacDinhThẻ TabKiểu dáng
 * - tab-card: ThẻkiểuThẻ Tab
 * - tab-google: thung lũngcaxemthiết bịPhong cáchThẻ Tab
 *
 * @module utils/ui/tabs
 * @author Art Design Pro Team
 */
export const TAB_CONFIG = {
  'tab-default': {
    openTop: 106,
    closeTop: 60,
    openHeight: 121,
    closeHeight: 75
  },
  'tab-card': {
    openTop: 122,
    closeTop: 78,
    openHeight: 139,
    closeHeight: 95
  },
  'tab-google': {
    openTop: 122,
    closeTop: 78,
    openHeight: 139,
    closeHeight: 95
  }
}

// Lấykhitrước tab Kiểu dángCauHinh，CaiDatMacDinhgiá trị
export const getTabConfig = (style: string) => {
  return TAB_CONFIG[style as keyof typeof TAB_CONFIG] || TAB_CONFIG['tab-card'] // MacDinhkhiếndùng tab-card CauHinh
}
