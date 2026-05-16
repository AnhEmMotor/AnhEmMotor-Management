/**
 * ComponentloạikiểuĐịnh nghĩamôkhối
 *
 * gợicungmụcmụcComponentcủaloạikiểuĐịnh nghĩa
 *
 * ## chủcầncôngnăng
 *
 * - TimKiemComponentloạikiểuĐịnh nghĩa
 * - BảngcộtCauHinhloạikiểu
 * - Phân trangCauHinhloạikiểu
 * - Formquyloạikiểu
 * - Hộp thoạiCauHinhloạikiểu
 *
 * ## khiếndùngtrườngcảnh
 *
 * - Component Props loạikiểuhẹnthúc
 * - ComponentCauHinhloạikiểuĐịnh nghĩa
 * - ComponentSuKienTham sốloạikiểu
 *
 * @module types/component/index
 * @author Art Design Pro Team
 */

// TimKiemComponentloạikiểu
export type SearchComponentType =
  | 'input'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'datetime'
  | 'daterange'
  | 'datetimerange'
  | 'month'
  | 'monthrange'
  | 'year'
  | 'yearrange'
  | 'week'
  | 'time'
  | 'timerange'

// TimKiemKhunggiá trịbiếnhóaTham số
export interface SearchChangeParams {
  prop: string
  val: unknown
}

// BảngcộtCauHinhGiao diện (Interface)
export interface ColumnOption<T = any> {
  // cộtloạikiểu
  type?: 'selection' | 'expand' | 'index' | 'globalIndex'
  // cộtThuocTinhdanh
  prop?: string
  // cộtTieuDe
  label?: string
  // cộtChiều rộng
  width?: string | number
  // nhấttiểucộtChiều rộng
  minWidth?: string | number
  // cốđịnhcột
  fixed?: boolean | 'left' | 'right'
  // làphủCó thểxếpthứ
  sortable?: boolean | 'custom'
  // qualọcthiết bịvịmục
  filters?: any[]
  // qualọcPhuongThuc
  filterMethod?: (value: any, row: any) => boolean
  // qualọcthiết bịViTri
  filterPlacement?: string
  // làphủTắt
  disabled?: boolean
  // làphủHiển thịcột
  visible?: boolean
  // làphủvịtrongHiển thị
  checked?: boolean
  // Tùy chỉnhRenderHàm
  formatter?: (row: T) => any
  // chènkheđóngCauHinh
  // làphủkhiếndùngchènkheRenderNoiDung
  useSlot?: boolean
  // chènkhedanhtên（MacDinhvì prop giá trị）
  slotName?: string
  // làphủkhiếndùngbảngđầuchènkhe
  useHeaderSlot?: boolean
  // bảngđầuchènkhedanhtên（MacDinhvì `${prop}-header`）
  headerSlotName?: string
  // nóanh ấyThuocTinh
  [key: string]: any
}

// Phân trangCauHinh
export interface PaginationConfig {
  // khitrướctrang
  currentPage: number
  // mỗitrangđiềusố
  pageSize: number
  // tổngđiềusố
  total: number
  // mỗitrangHiển thịchiếcsốBộ chọncủavịmục
  pageSizes?: number[]
  // ComponentBố cục
  layout?: string
  // làphủvìtiểukiểuPhân trang
  small?: boolean
}

// Formquy
export interface FormRule {
  // làphủtất
  required?: boolean
  // LỗiGợi ýThongTin
  message?: string
  // Kích hoạtphươngkiểu
  trigger?: string | string[]
  // nhấttiểutrườngđộ
  min?: number
  // nhấtđạitrườngđộ
  max?: number
  // đúngbảngkiểu
  pattern?: RegExp
  // Tùy chỉnhnghiệmtínhHàm
  validator?: (rule: any, value: any, callback: any) => void
}

// Hộp thoạiCauHinh
export interface DialogConfig {
  // TieuDe
  title: string
  // làphủHiển thị
  visible: boolean
  // Chiều rộng
  width?: string | number
  // làphủCó thểlấythông quaNhấn modal đóngđóng
  closeOnClickModal?: boolean
  // làphủCó thểlấythông quadưới ESC đóngđóng
  closeOnPressEscape?: boolean
  // làphủHiển thịđóngđóngNút
  showClose?: boolean
  // làphủtại Dialog rahiệngiờtương body Cuộnkhóađịnh
  lockScroll?: boolean
  // làphủHiển thịMask/Overlay
  modal?: boolean
  // Tùy chỉnhloạidanh
  customClass?: string
}
