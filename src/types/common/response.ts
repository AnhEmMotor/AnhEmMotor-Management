/**
 * API ứngloạikiểuĐịnh nghĩamôkhối
 *
 * gợicungthốngmộtcủa API ứngKếtcấuloạikiểuĐịnh nghĩa
 *
 * ## chủcầncôngnăng
 *
 * - Cơ bảnứngKếtcấuĐịnh nghĩa
 * - phẳngkiểuchiếctrì（thíchPhânKhôngcùngDữ liệuloạikiểu）
 * - thốngmộtcủaứngcáchkiểuhẹnthúc
 *
 * ## khiếndùngtrườngcảnh
 *
 * - API Vui lòngcầuứngloạikiểuhẹnthúc
 * - Giao diện (Interface)Dữ liệuloạikiểuĐịnh nghĩa
 * - ứngDữ liệugiảiphân
 *
 * @module types/common/response
 * @author Art Design Pro Team
 */

/** Cơ bản API ứngKếtcấu */
export interface BaseResponse<T = unknown> {
  /** Trạng tháimã */
  code: number
  /** TinNhan */
  msg: string
  /** Dữ liệu */
  data: T
}
