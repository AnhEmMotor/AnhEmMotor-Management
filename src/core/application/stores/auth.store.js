import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  setAccessToken,
  registerAuthFailureCallback,
  getAccessToken,
  refreshAccessToken,
} from '@infrastructure/api/axios'
import { queryClient } from '@infrastructure/api/queryClient'
import authService from '@application/services/auth.service'
import authMapper from '@infrastructure/mappers/auth.mapper'

const INITIAL_RETRY_DELAY = 1000
const MAX_RETRY_DELAY = 30000

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isInitialized = ref(false)
  const sseStatus = ref('disconnected')
  const isAuthenticated = computed(() => !!user.value)

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
      await authService.logout()
    }

    cleanState()
    
    // The redirect will be handled by the caller or a global handler to avoid circular dependencies

    setTimeout(() => {
      queryClient.clear()
    }, 50)

    setTimeout(() => {
      isLoggingOut = false
    }, 500)
  }

  // Removed registerAuthFailureCallback from here to break circular dependency.
  // It should be registered in main.js or somewhere that has access to both store and router.

  watch(
    () => user.value?.permissions,
    async (newPermissions) => {
      if (user.value && (!newPermissions || newPermissions.length === 0)) {
        performLogout()
        return
      }

      // Permissions changed, we might need a redirect. 
      // But we avoid using router directly here to prevent circular loops.
      // A safer way is to let the layout or a higher-level component watch this.
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

  const loginWithGoogle = async (idToken) => {
    isLoggingOut = false
    const data = await authService.loginWithGoogle(idToken)
    setAccessToken(data.accessToken, data.expiresAt)
    closeSSE()
    connectSSE()
    await waitForUser()
  }

  const loginWithFacebook = async (accessToken) => {
    isLoggingOut = false
    const data = await authService.loginWithFacebook(accessToken)
    setAccessToken(data.accessToken, data.expiresAt)
    closeSSE()
    connectSSE()
    await waitForUser()
  }

  const logout = async () => {
    try {
      closeSSE()
      await authService.logout().catch(() => {})
    } finally {
      performLogout(true)
    }
  }

  const getExternalAuthConfig = async () => {
    return await authService.getExternalAuthConfig()
  }

  const updateProfile = async (model) => {
    const dto = authMapper.toUpdateProfileDTO(model)
    const data = await authService.updateProfile(dto)
    const mapped = authMapper.toModel(data)
    user.value = user.value ? { ...user.value, ...mapped } : mapped
    return user.value
  }

  const changePassword = async (payload) => {
    const dto = authMapper.toChangePasswordDTO(payload)
    return await authService.changePassword(dto)
  }

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
    const sseUrl = `${import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT || 'http://localhost:5000'}/api/v1/user/me`

    sseStatus.value = 'connecting'

    const data = await authService.fetchMe()
    if (data && (data.username || data.userName)) {
      const mappedUser = authMapper.toModel(data)
      user.value = user.value ? { ...user.value, ...mappedUser } : mappedUser
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
          const data = JSON.parse(msg.data)
          if (data && (data.username || data.userName)) {
            const mappedUser = authMapper.toModel(data)
            user.value = user.value ? { ...user.value, ...mappedUser } : mappedUser
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
    loginWithGoogle,
    loginWithFacebook,
    logout,
    updateProfile,
    changePassword,
    uploadAvatar,
    initAuth,
    performLogout,
    getExternalAuthConfig,
    reconnectSSE: () => {
      closeSSE()
      connectSSE()
    },
  }
})





