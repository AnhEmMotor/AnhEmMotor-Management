export enum ApiStatus {
  success = 200, // ThanhCong
  error = 400, // Lỗi
  unauthorized = 401, // Chưatraoquyền
  forbidden = 403, // cấmthúcTruy cập
  notFound = 404, // Chưatìmđến
  methodNotAllowed = 405, // PhuongThucKhôngcho phéphứa
  requestTimeout = 408, // Vui lòngcầusiêugiờ
  internalServerError = 500, // Lỗi máy chủ
  notImplemented = 501, // Chưathựchiện
  badGateway = 502, // mạngđóngLỗi
  serviceUnavailable = 503, // phụcvụKhôngCó thểdùng
  gatewayTimeout = 504, // mạngđóngsiêugiờ
  httpVersionNotSupported = 505 // HTTPbảnquyểnKhôngchiếctrì
}
