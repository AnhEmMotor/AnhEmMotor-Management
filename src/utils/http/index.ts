/**
 * HTTP Vui lòngcầuphongmôkhối
 * ở Axios phongcủa HTTP Yêucầucôngcụ，gợicungthốngmộtcủaYêucầu/ứnglý
 *
 * ## chủcầncôngnăng
 *
 * - Yêucầu/ứngchặncắtcụ（tựđộngThêm mới Token、thốngmộtXuLy lỗi）
 * - 401 Chưatraoquyềntừđộngđăngra（mangPhòngrungmáychế）
 * - Vui lòngcầuThatBaitừđộngtrùngthử（Có thểCauHinh）
 * - thốngmộtcủaThanhCong/LỗisaiTinNhanGợi ý
 * - chiếctrì GET/POST/PUT/DELETE bằnglệdùngPhuongThuc
 *
 * @module utils/http
 * @author Art Design Pro Team
 */

import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, handleError, showError, showSuccess } from './error'
import { $t } from '@/i18n'
import { BaseResponse } from '@/types'

/** Vui lòngcầuCauHinhlệlượng */
const REQUEST_TIMEOUT = 15000
const LOGOUT_DELAY = 500
const MAX_RETRIES = 0
const RETRY_DELAY = 1000
const UNAUTHORIZED_DEBOUNCE_TIME = 3000

/** 401PhòngrungTrạng thái */
let isUnauthorizedErrorShown = false
let unauthorizedTimer: NodeJS.Timeout | null = null

/** mởtriển AxiosRequestConfig */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean
  showSuccessMessage?: boolean
}

const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

/** Axiosthựcví dụ */
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL,
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    (data, headers) => {
      const contentType = headers['content-type']
      if (contentType?.includes('application/json')) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

/** Vui lòngcầuchặncắtthiết bị */
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    if (userStore.accessToken) request.headers.set('Authorization', `Bearer ${userStore.accessToken}`)

    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      request.headers.set('Content-Type', 'application/json')
      request.data = JSON.stringify(request.data)
    }

    return request
  },
  (error) => {
    showError(createHttpError($t('httpMsg.requestConfigError'), ApiStatus.error))
    return Promise.reject(error)
  }
)

/** ứngchặncắtthiết bị */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { status, data } = response
    // Nếu dữ liệu đã có code (từ mock hoặc api khác), dùng nó
    if (data && typeof data.code === 'number') {
      if (data.code === ApiStatus.success) return response
      if (data.code === ApiStatus.unauthorized) handleUnauthorizedError(data.msg)
      throw createHttpError(data.msg || $t('httpMsg.requestFailed'), data.code)
    }

    // Nếu backend trả về dữ liệu thô (raw object), bọc lại để tương thích với template
    if (status >= 200 && status < 300) {
      response.data = {
        code: ApiStatus.success,
        msg: 'success',
        data: data
      }
      return response
    }

    return response
  },
  (error) => {
    const { response } = error
    if (response) {
      const { status, data } = response
      if (status === ApiStatus.unauthorized) handleUnauthorizedError()

      // Lấy message từ backend (ưu tiên Message hoặc msg)
      const backendMsg = data?.Message || data?.msg || data?.message
      if (backendMsg) {
        return Promise.reject(createHttpError(backendMsg, status))
      }
    }
    return Promise.reject(handleError(error))
  }
)

/** thốngmộtxâyHttpError */
function createHttpError(message: string, code: number) {
  return new HttpError(message, code)
}

/** XuLy401Lỗi（mangPhòngrung） */
function handleUnauthorizedError(message?: string): never {
  const error = createHttpError(message || $t('httpMsg.unauthorized'), ApiStatus.unauthorized)

  if (!isUnauthorizedErrorShown) {
    isUnauthorizedErrorShown = true
    logOut()

    unauthorizedTimer = setTimeout(resetUnauthorizedError, UNAUTHORIZED_DEBOUNCE_TIME)

    showError(error, true)
    throw error
  }

  throw error
}

/** Đặt lại401PhòngrungTrạng thái */
function resetUnauthorizedError() {
  isUnauthorizedErrorShown = false
  if (unauthorizedTimer) clearTimeout(unauthorizedTimer)
  unauthorizedTimer = null
}

/** Đăng xuấtHàm */
function logOut() {
  setTimeout(() => {
    useUserStore().logOut()
  }, LOGOUT_DELAY)
}

/** làphủcầncầntrùngthử */
function shouldRetry(statusCode: number) {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode)
}

/** Vui lòngcầutrùngthửLogic */
async function retryRequest<T>(
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await request<T>(config)
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await delay(RETRY_DELAY)
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

/** Hàm */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Vui lòngcầuHàm */
async function request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  // POST | PUT Tham sốtừđộngĐiền vào
  if (
    ['POST', 'PUT'].includes(config.method?.toUpperCase() || '') &&
    config.params &&
    !config.data
  ) {
    config.data = config.params
    config.params = undefined
  }

  try {
    const res = await axiosInstance.request<BaseResponse<T>>(config)

    // Hiển thịThanhCongTinNhan
    if (config.showSuccessMessage && res.data.msg) {
      showSuccess(res.data.msg)
    }

    return res.data.data as T
  } catch (error) {
    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

/** APIPhuongThuctậphợp */
const api = {
  get<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'GET' })
  },
  post<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'POST' })
  },
  put<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'PUT' })
  },
  del<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'DELETE' })
  },
  request<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>(config)
  }
}

export default api
