import axiosInstance from '@/api/axios'
import { AUTH_ENDPOINTS } from '@/constants/endpoints/auth.endpoint'
import { USER_ENDPOINTS } from '@/constants/endpoints/user.endpoint'
import { fetchEventSource } from '@microsoft/fetch-event-source'

const authService = {
  /**
   * Đăng nhập hệ thống
   */
  async login(credentials) {
    const { data } = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, credentials)
    return data
  },

  /**
   * Đăng xuất hệ thống
   */
  async logout() {
    const { data } = await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT)
    return data
  },

  /**
   * Lấy thông tin tài khoản hiện tại
   */
  async fetchMe() {
    const { data } = await axiosInstance.get(USER_ENDPOINTS.MY_PROFILE)
    return data
  },

  /**
   * Làm mới access token bằng refresh token (cookie)
   */
  async refreshToken() {
    const { data } = await axiosInstance.post(AUTH_ENDPOINTS.REFRESH)
    return data
  },

  /**
   * Tự cập nhật hồ sơ cá nhân
   */
  async updateProfile(payload) {
    const { data } = await axiosInstance.put(USER_ENDPOINTS.MY_PROFILE, payload)
    return data
  },

  /**
   * Tự thay đổi mật khẩu (yêu cầu mật khẩu cũ)
   */
  async changePassword(payload) {
    const { data } = await axiosInstance.post(USER_ENDPOINTS.MY_PASSWORD, payload)
    return data
  },

  /**
   * Tải ảnh đại diện cá nhân
   */
  async uploadAvatar(payload) {
    const { data } = await axiosInstance.post(USER_ENDPOINTS.MY_AVATAR, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  /**
   * Kết nối Server-Sent Events để nhận cập nhật trạng thái người dùng real-time
   */
  async connectSSE({ sseUrl, token, onMessage, onOpen, onClose, onError, signal }) {
    return await fetchEventSource(sseUrl, {
      method: 'GET',
      signal,
      openWhenHidden: true,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
      },
      onopen: async (response) => {
        if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
          if (onOpen) await onOpen(response)
          return
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error('SSE_AUTH_ERROR')
        }

        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new Error(`Fatal SSE error: ${response.status}`)
        }

        throw new Error(`SSE Connection failed: ${response.status}`)
      },
      onmessage: onMessage,
      onclose: onClose,
      onerror: onError,
    })
  },
}

export default authService
