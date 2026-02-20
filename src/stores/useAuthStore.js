import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import axiosInstance, {
  setAccessToken,
  registerAuthFailureCallback,
  getAccessToken,
  refreshAccessToken,
} from '../api/axios'
import { queryClient } from '../api/queryClient'

const INITIAL_RETRY_DELAY = 1000
const MAX_RETRY_DELAY = 30000

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isInitialized = ref(false)
  const isAuthenticated = computed(() => !!user.value)
  const router = useRouter()

  let abortController = null
  let retryTimeout = null
  let retryDelay = INITIAL_RETRY_DELAY
  const sseStatus = ref('disconnected')
  let isLoggingOut = false

  const cleanState = () => {
    user.value = null
    setAccessToken(null)
    queryClient.clear()
    closeSSE()
  }

  const performLogout = () => {
    if (isLoggingOut) return
    isLoggingOut = true

    cleanState()
    router.push({ name: 'login' })

    setTimeout(() => {
      queryClient.clear()
    }, 50)

    axiosInstance.post('/api/v1/auth/logout').catch(() => {})

    setTimeout(() => {
      isLoggingOut = false
    }, 500)
  }

  registerAuthFailureCallback(() => performLogout(false))

  watch(
    () => user.value?.permissions,
    (newPermissions) => {
      if (!newPermissions) return
      queryClient.invalidateQueries()

      const currentRoute = router.currentRoute.value
      const meta = currentRoute?.meta

      if (meta?.permission) {
        const hasAccess =
          newPermissions.includes('ADMIN') || newPermissions.includes(meta.permission)
        if (!hasAccess) router.push('/')
      } else if (meta?.permissions) {
        const hasAccess =
          newPermissions.includes('ADMIN') ||
          meta.permissions.some((p) => newPermissions.includes(p))
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
    const { data } = await axiosInstance.post('/v1/auth/login/for-manager', credentials)
    setAccessToken(data.accessToken)
    delete data.accessToken
    closeSSE()
    connectSSE()
    await waitForUser()
  }

  const logout = async () => {
    try {
      closeSSE()
      await axiosInstance.post('/api/v1/auth/logout')
    } finally {
      performLogout(true)
    }
  }

  const connectSSE = async (retryCount = 0) => {
    if (abortController || isLoggingOut) return

    let token = getAccessToken()
    if (!token) return

    abortController = new AbortController()
    const sseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/user/me`

    sseStatus.value = 'connecting'

    const { data } = await axiosInstance.get('/api/v1/user/me')
    if (data && data.username) {
      user.value = user.value ? { ...user.value, ...data } : data
    }

    try {
      await fetchEventSource(sseUrl, {
        method: 'GET',
        signal: abortController.signal,
        openWhenHidden: true,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        async onopen(response) {
          if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
            sseStatus.value = 'connected'
            retryDelay = INITIAL_RETRY_DELAY
            return
          }

          if (response.status === 401) {
            throw new Error('SSE_AUTH_ERROR')
          }

          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            sseStatus.value = 'error'
            throw new Error(`Fatal SSE error: ${response.status}`)
          }
          throw new Error(`SSE Connection failed: ${response.status}`)
        },
        onmessage(msg) {
          if (!msg.data || msg.data === 'heartbeat') return
          const data = JSON.parse(msg.data)
          if (data && data.username) {
            user.value = user.value ? { ...user.value, ...data } : data
          }
        },
        onclose() {
          sseStatus.value = 'disconnected'
          abortController = null
          if (!isLoggingOut) {
            const delay = Math.min(retryDelay, MAX_RETRY_DELAY)
            retryDelay = Math.min(delay * 2, MAX_RETRY_DELAY)
            retryTimeout = setTimeout(() => connectSSE(), delay)
          }
        },
        onerror(err) {
          if (err.message === 'SSE_AUTH_ERROR') {
            if (abortController) {
              abortController.abort()
              abortController = null
            }

            if (retryCount < 3) {
              axiosInstance
                .post('/api/v1/auth/refresh-token')
                .then((resp) => {
                  const newToken = resp.data.accessToken
                  setAccessToken(newToken)
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
    login,
    logout,
    initAuth,
    performLogout,
    sseStatus,
    reconnectSSE: () => {
      closeSSE()
      connectSSE()
    },
  }
})
