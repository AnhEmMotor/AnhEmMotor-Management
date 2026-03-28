import axiosInstance from '@/api/axios'
import { AUTH_ENDPOINTS } from '@/constants/endpoints/auth.endpoint'
import { USER_ENDPOINTS } from '@/constants/endpoints/user.endpoint'
import { fetchEventSource } from '@microsoft/fetch-event-source'

const authService = {
  async login(credentials) {
    const { data } = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, credentials)
    return data
  },

  async logout() {
    const { data } = await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT)
    return data
  },

  async fetchMe() {
    const { data } = await axiosInstance.get(USER_ENDPOINTS.MY_PROFILE)
    return data
  },

  async refreshToken() {
    const { data } = await axiosInstance.post(AUTH_ENDPOINTS.REFRESH)
    return data
  },

  async updateProfile(payload) {
    const { data } = await axiosInstance.put(USER_ENDPOINTS.MY_PROFILE, payload)
    return data
  },

  async changePassword(payload) {
    const { data } = await axiosInstance.post(USER_ENDPOINTS.MY_PASSWORD, payload)
    return data
  },

  async uploadAvatar(payload) {
    const { data } = await axiosInstance.post(USER_ENDPOINTS.MY_AVATAR, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

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
