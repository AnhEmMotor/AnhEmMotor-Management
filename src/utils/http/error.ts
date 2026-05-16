/**
 * HTTP XuLy lỗimôkhối
 *
 * gợicungthốngmộtcủa HTTP Vui lòngcầuXuLy lỗimáychế
 *
 * ## chủcầncôngnăng
 *
 * - Tùy chỉnh HttpError Lỗiloại，phongLỗiThongTin、Trạng tháimã、ThoiGiandấubằng
 * - Lỗichặncắtvàchuyểnđổi，tương Axios Lỗichuyểnđổivìtiêuthuậncủa HttpError
 * - LỗiTinNhanquốctếhóaXuLy，liệuTrạng tháimãQuay lạiđốiứngcủađaNgôn ngữLỗiGợi ý
 * - LỗiNhatKyGhi chép，tiệnởhỏiđềtruyvếtvàđiềuthử
 * - LỗivàThanhCongTinNhancủathốngmộttriểnthị
 * - loạikiểugiữvệHàm，dùngởđoánLỗiloạikiểu
 *
 * ## khiếndùngtrườngcảnh
 *
 * - HTTP Vui lòngcầuchặncắtthiết bịtrongthốngmộtXuLyLỗi
 * - nghiệpvụđạimãtrongbắtvàXuLyđặcđịnhLỗi
 * - LỗiNhatKyBộtậpvàtrênbáo
 *
 * @module utils/http/error
 * @author Art Design Pro Team
 */
import { AxiosError } from 'axios'
import { ApiStatus } from './status'
import { $t } from '@/i18n'

// LỗiứngGiao diện (Interface)
export interface ErrorResponse {
  /** LỗiTrạng tháimã */
  code: number
  /** LỗiTinNhan */
  msg: string
  /** LỗiđínhthêmDữ liệu */
  data?: unknown
}

// LỗiNhatKyDữ liệuGiao diện (Interface)
export interface ErrorLogData {
  /** LỗiTrạng tháimã */
  code: number
  /** LỗiTinNhan */
  message: string
  /** LỗiđínhthêmDữ liệu */
  data?: unknown
  /** LỗiphátsinhThoiGiandấu */
  timestamp: string
  /** Vui lòngcầu URL */
  url?: string
  /** Vui lòngcầuPhuongThuc */
  method?: string
  /** Lỗingăn xếpThongTin */
  stack?: string
}

// Tùy chỉnh HttpError loại
export class HttpError extends Error {
  public readonly code: number
  public readonly data?: unknown
  public readonly timestamp: string
  public readonly url?: string
  public readonly method?: string

  constructor(
    message: string,
    code: number,
    options?: {
      data?: unknown
      url?: string
      method?: string
    }
  ) {
    super(message)
    this.name = 'HttpError'
    this.code = code
    this.data = options?.data
    this.timestamp = new Date().toISOString()
    this.url = options?.url
    this.method = options?.method
  }

  public toLogData(): ErrorLogData {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
      url: this.url,
      method: this.method,
      stack: this.stack
    }
  }
}

/**
 * LấyLỗiTinNhan
 * @param status LỗiTrạng tháimã
 * @returns LỗiTinNhan
 */
const getErrorMessage = (status: number): string => {
  const errorMap: Record<number, string> = {
    [ApiStatus.unauthorized]: 'httpMsg.unauthorized',
    [ApiStatus.forbidden]: 'httpMsg.forbidden',
    [ApiStatus.notFound]: 'httpMsg.notFound',
    [ApiStatus.methodNotAllowed]: 'httpMsg.methodNotAllowed',
    [ApiStatus.requestTimeout]: 'httpMsg.requestTimeout',
    [ApiStatus.internalServerError]: 'httpMsg.internalServerError',
    [ApiStatus.badGateway]: 'httpMsg.badGateway',
    [ApiStatus.serviceUnavailable]: 'httpMsg.serviceUnavailable',
    [ApiStatus.gatewayTimeout]: 'httpMsg.gatewayTimeout'
  }

  return $t(errorMap[status] || 'httpMsg.internalServerError')
}

/**
 * XuLyLỗi
 * @param error LỗiDoiTuong
 * @returns LỗiDoiTuong
 */
export function handleError(error: AxiosError<ErrorResponse>): never {
  // XuLyHủycủaVui lòngcầu
  if (error.code === 'ERR_CANCELED') {
    console.warn('Request cancelled:', error.message)
    throw new HttpError($t('httpMsg.requestCancelled'), ApiStatus.error)
  }

  const statusCode = error.response?.status
  const errorMessage = error.response?.data?.msg || error.message
  const requestConfig = error.config

  // XuLymạnglạcLỗi
  if (!error.response) {
    throw new HttpError($t('httpMsg.networkError'), ApiStatus.error, {
      url: requestConfig?.url,
      method: requestConfig?.method?.toUpperCase()
    })
  }

  // XuLy HTTP Trạng tháimãLỗi
  const message = statusCode
    ? getErrorMessage(statusCode)
    : errorMessage || $t('httpMsg.requestFailed')
  throw new HttpError(message, statusCode || ApiStatus.error, {
    data: error.response.data,
    url: requestConfig?.url,
    method: requestConfig?.method?.toUpperCase()
  })
}

/**
 * Hiển thịLỗiTinNhan
 * @param error LỗiDoiTuong
 * @param showMessage làphủHiển thịLỗiTinNhan
 */
export function showError(error: HttpError, showMessage: boolean = true): void {
  if (showMessage) {
    ElMessage.error(error.message)
  }
  // Ghi chépLỗiNhatKy
  console.error('[HTTP Error]', error.toLogData())
}

/**
 * Hiển thịThanhCongTinNhan
 * @param message ThanhCongTinNhan
 * @param showMessage làphủHiển thịTinNhan
 */
export function showSuccess(message: string, showMessage: boolean = true): void {
  if (showMessage) {
    ElMessage.success(message)
  }
}

/**
 * đoánlàphủvì HttpError loạikiểu
 * @param error LỗiDoiTuong
 * @returns làphủvì HttpError loạikiểu
 */
export const isHttpError = (error: unknown): error is HttpError => {
  return error instanceof HttpError
}
