import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  setAccessToken,
  registerAuthFailureCallback,
  getAccessToken,
  refreshAccessToken,
} from '@/api/axios'
import { queryClient } from '@/api/queryClient'
import authService from '@/services/authService'
import authMapper from '@/mappers/authMapper'

const INITIAL_RETRY_DELAY = 1000
const MAX_RETRY_DELAY = 30000

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isInitialized = ref(false)
  const sseStatus = ref('disconnected')
  const isAuthenticated = computed(() => !!user.value)
  const router = useRouter()

  let abortController = null
  let retryTimeout = null
  let retryDelay = INITIAL_RETRY_DELAY
  let isLoggingOut = false

  const cleanState = () => {
    user.value = null
    setAccessToken(null)
    queryClient.clear()
    closeSSE()
  }

  const performLogout = async (skipApiCall = false) => {
    if (isLoggingOut) return
    isLoggingOut = true

    const token = getAccessToken()
    if (!skipApiCall && token) {
      try {
        await authService.logout()
      } catch {
        // Silently fail logout API call
      }
    }

    cleanState()
    router.push({ name: 'login' })

    // Đảm bảo cache được xóa sạch sau khi logout
    setTimeout(() => {
      queryClient.clear()
    }, 50)

    setTimeout(() => {
      isLoggingOut = false
    }, 500)
  }

  // Đăng ký callback xử lý lỗi 401/403 toàn cục từ axios
  registerAuthFailureCallback(() => performLogout(false))

  // Theo dõi quyền hạn để tự động logout hoặc điều hướng nếu bị thu hồi quyền
  watch(
    () => user.value?.permissions,
    (newPermissions) => {
      if (user.value && (!newPermissions || newPermissions.length === 0)) {
        performLogout()
        return
      }

      queryClient.invalidateQueries()

      const currentRoute = router.currentRoute.value
      const meta = currentRoute?.meta

      if (meta?.permission) {
        const hasAccess = newPermissions.includes(meta.permission)
        if (!hasAccess) router.push('/')
      } else if (meta?.permissions) {
        const hasAccess = meta.permissions.some((p) => newPermissions.includes(p))
        if (!hasAccess) router.push('/')
      }
    },
  )

  const waitForUser = () => {
    return new Promise((resolve) => {
      if (user.value) return resolve()
      const timeout = setTimeout(() => {
        unwatch()
        resolve()
      }, 10000)
      const unwatch = watch(user, (val) => {
        if (val) {
          clearTimeout(timeout)
          unwatch()
          resolve()
        }
      })
    })
  }

  const login = async (credentials) => {
    isLoggingOut = false
    const dto = authMapper.toLoginDTO(credentials)
    const data = await authService.login(dto)
    setAccessToken(data.accessToken, data.expiresAt)
    closeSSE()
    connectSSE()
    await waitForUser()
  }

  const logout = async () => {
    try {
      closeSSE()
      await authService.logout()
    } finally {
      performLogout(true)
    }
  }

  /**
   * Cập nhật hồ sơ cá nhân (Self-service)
   */
  const updateProfile = async (model) => {
    const dto = authMapper.toUpdateProfileDTO(model)
    const data = await authService.updateProfile(dto)
    // Cập nhật state local ngay lập tức nếu cần (mặc dù SSE sẽ sync lại sau)
    const mapped = authMapper.toModel(data)
    user.value = user.value ? { ...user.value, ...mapped } : mapped
    return user.value
  }

  /**
   * Thay đổi mật khẩu cá nhân
   */
  const changePassword = async (payload) => {
    const dto = authMapper.toChangePasswordDTO(payload)
    return await authService.changePassword(dto)
  }

  /**
   * Tải lên ảnh đại diện cá nhân
   */
  const uploadAvatar = async (file) => {
    const payload = authMapper.toAvatarPayload(file)
    const data = await authService.uploadAvatar(payload)
    const mapped = authMapper.toModel(data)
    user.value = user.value ? { ...user.value, ...mapped } : mapped
    return user.value
  }

  const connectSSE = async (retryCount = 0) => {
    if (abortController || isLoggingOut) return

    const token = getAccessToken()
    if (!token) return

    abortController = new AbortController()
    const sseUrl = `${import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT || 'http://localhost:3000'}/api/v1/user/me`

    sseStatus.value = 'connecting'

    try {
      const data = await authService.fetchMe()
      if (data && (data.username || data.userName)) {
        const mappedUser = authMapper.toModel(data)
        user.value = user.value ? { ...user.value, ...mappedUser } : mappedUser
      }
    } catch {
      // Bỏ qua lỗi fetch me
    }

    try {
      await authService.connectSSE({
        sseUrl,
        token,
        signal: abortController.signal,
        onOpen: async () => {
          sseStatus.value = 'connected'
          retryDelay = INITIAL_RETRY_DELAY
        },
        onMessage: (msg) => {
          if (!msg.data || msg.data === 'heartbeat') return
          try {
            const data = JSON.parse(msg.data)
            if (data && (data.username || data.userName)) {
              const mappedUser = authMapper.toModel(data)
              user.value = user.value ? { ...user.value, ...mappedUser } : mappedUser
            }
          } catch {
            // Lỗi parse SSE
          }
        },
        onClose: () => {
          sseStatus.value = 'disconnected'
          abortController = null
          if (!isLoggingOut) {
            const delay = Math.min(retryDelay, MAX_RETRY_DELAY)
            retryDelay = Math.min(delay * 2, MAX_RETRY_DELAY)
            retryTimeout = setTimeout(() => connectSSE(), delay)
          }
        },
        onError: (err) => {
          if (err.message === 'SSE_AUTH_ERROR') {
            if (abortController) {
              abortController.abort()
              abortController = null
            }

            if (retryCount < 3) {
              authService
                .refreshToken()
                .then((data) => {
                  setAccessToken(data.accessToken)
                  connectSSE(retryCount + 1)
                })
                .catch(() => {
                  performLogout(true)
                })
              throw err
            } else {
              performLogout(true)
              throw err
            }
          }

          sseStatus.value = 'error'
          if (err.message.includes('Fatal')) {
            if (abortController) {
              abortController.abort()
              abortController = null
            }
            throw err
          }
        },
      })
    } catch (err) {
      if (err.message !== 'SSE_AUTH_ERROR') {
        sseStatus.value = 'error'
        abortController = null
        if (!isLoggingOut && !err.message.includes('Fatal')) {
          const delay = Math.min(retryDelay, MAX_RETRY_DELAY)
          retryDelay = Math.min(delay * 2, MAX_RETRY_DELAY)
          retryTimeout = setTimeout(() => connectSSE(), delay)
        }
      }
    }
  }

  const closeSSE = () => {
    if (retryTimeout) {
      clearTimeout(retryTimeout)
      retryTimeout = null
    }
    if (abortController) {
      abortController.abort()
      abortController = null
      sseStatus.value = 'disconnected'
    }
    retryDelay = INITIAL_RETRY_DELAY
  }

  const initAuth = async () => {
    if (isInitialized.value) return

    try {
      if (!getAccessToken()) {
        await refreshAccessToken()
      }
      if (getAccessToken()) {
        connectSSE()
        await waitForUser()
      }
    } catch {
      await logout().catch(() => {})
    } finally {
      isInitialized.value = true
    }
  }

  return {
    user,
    isInitialized,
    isAuthenticated,
    sseStatus,
    login,
    logout,
    updateProfile,
    changePassword,
    uploadAvatar,
    initAuth,
    performLogout,
    reconnectSSE: () => {
      closeSSE()
      connectSSE()
    },
  }
})
