/**
 * BảngtoànbộCauHinhmôkhối
 *
 * gợicungBảngvớisauđầuGiao diện (Interface)củachữđoạnảnhxạCauHinh
 *
 * ## chủcầncôngnăng
 *
 * - ứngDữ liệuchữđoạntừđộngtínhvàảnhxạ
 * - chiếctrìđaloạilệthấycủasauđầuứngcáchkiểu
 * - Vui lòngcầuTham sốchữđoạnảnhxạCauHinh
 * - Có thểmởtriểncủachữđoạnCauHinhmáychế
 *
 * ## khiếndùngtrườngcảnh
 *
 * - thíchPhânKhôngcùngsauđầucủaPhân trangGiao diện (Interface)cáchkiểu
 * - thốngmộttrướcđầuBảngComponentcủaDữ liệuXuLy
 * - bớtthiểutrùngphụccủaDữ liệuchuyểnđổiđạimã
 * - chiếctrìđachiếcsauđầuphụcvụcủaGiao diện (Interface)đốitiếp
 *
 * ## CauHinhMô tả
 *
 * - recordFields: Danh sáchDữ liệuchữđoạndanh（TốicấpthuậnthứTimKiem）
 * - totalFields: tổngđiềuSốđoạndanh
 * - currentFields: khitrướctrangmãchữđoạndanh
 * - sizeFields: mỗitrangKích thướcchữđoạndanh
 * - paginationKey: trướcđầuphátgửiVui lòngcầugiờkhiếndùngcủaPhân trangTham sốdanh
 *
 * ## mởtriểnphươngkiểu
 *
 * nếuquảsauđầukhiếndùngnóanh ấychữđoạndanh，Có thểlấytạiđốiứngMảngtrongThêm mớimớicủachữđoạndanh
 * ví dụnếu：recordFields: ['list', 'data', 'records', 'items', 'yourCustomField']
 *
 * @module utils/table/tableConfig
 * @author Art Design Pro Team
 */
export const tableConfig = {
  // ứngDữ liệuchữđoạnảnhxạCauHinh，HeThongsẽtừGiao diện (Interface)Quay lạiDữ liệutrongthuậnthứTimKiemnàyvàichữđoạn
  // Danh sáchDữ liệu
  recordFields: ['list', 'data', 'records', 'items', 'result', 'rows'],
  // tổngđiềusố
  totalFields: ['total', 'count', 'totalCount'],
  // khitrướctrangmã
  currentFields: ['current', 'page', 'pageNum'],
  // mỗitrangKích thước
  sizeFields: ['size', 'pageSize', 'limit'],

  // Vui lòngcầuTham sốảnhxạCauHinh，trướcđầuphátgửiVui lòngcầugiờkhiếndùngcủaPhân trangTham sốdanh
  // useTable tổhợpkiểuHàmtruyềnchuyểnPhân trangTham sốcủagiờđợi dùng current theo size
  paginationKey: {
    // khitrướctrangmã
    current: 'current',
    // mỗitrangKích thước
    size: 'size'
  }
}
