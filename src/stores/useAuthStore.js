import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import axiosInstance, {
  setAccessToken,
  registerAuthFailureCallback,
  getAccessToken,
} from '../api/axios'
import { queryClient } from '../api/queryClient'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isInitialized = ref(false)
  const isAuthenticated = computed(() => !!user.value)
  const router = useRouter()

  let abortController = null
  const sseStatus = ref('disconnected')
  let isLoggingOut = false

  const cleanState = () => {
    user.value = null
    setAccessToken(null)
    localStorage.removeItem('isLoggedIn')
    queryClient.clear()
    closeSSE()
  }

  const resetState = () => {
    isLoggingOut = true
    cleanState()
    setTimeout(() => {
      isLoggingOut = false
    }, 500)
  }

  registerAuthFailureCallback(() => resetState())

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

  const fetchUser = async () => {
    return user.value
  }

  const login = async (credentials) => {
    isLoggingOut = false
    const { data } = await axiosInstance.post('/api/v1/auth/login/for-manager', credentials)
    setAccessToken(data.accessToken)
    localStorage.setItem('isLoggedIn', 'true')
    setAccessToken(data.accessToken)
    localStorage.setItem('isLoggedIn', 'true')

    try {
      await connectSSE()
    } catch {
      if (!user.value) {
        const { data } = await axiosInstance.get('/api/v1/user/me', { skipRedirect: true })
        user.value = data
      }
    }
  }

  const register = async (userData) => {
    await axiosInstance.post('/api/register', userData)
  }

  const logout = async () => {
    try {
      closeSSE()
      await axiosInstance.post('/api/v1/auth/logout')
    } finally {
      resetState()
    }
  }

  const connectSSE = (retryCount = 0) => {
    if (abortController || isLoggingOut) return Promise.resolve()

    return new Promise((resolve, reject) => {
      let token = getAccessToken()
      if (!token) {
        resolve()
        return
      }

      abortController = new AbortController()
      const sseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/user/me`

      sseStatus.value = 'connecting'

      sseStatus.value = 'connecting'

      const connectionTimeout = setTimeout(() => {
        if (!user.value) {
          reject(new Error('SSE_TIMEOUT'))
        }
      }, 2000)

      try {
        fetchEventSource(sseUrl, {
          method: 'GET',
          signal: abortController.signal,
          openWhenHidden: true,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/event-stream',
          },
          async onopen(response) {
            if (
              response.ok &&
              response.headers.get('content-type')?.includes('text/event-stream')
            ) {
              sseStatus.value = 'connected'
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

            if (data && (data.userName || data.fullName || data.username)) {
              user.value = { ...user.value, ...data }

              clearTimeout(connectionTimeout)
              resolve(user.value)
            }
          },
          onclose() {
            sseStatus.value = 'disconnected'
            abortController = null
          },
          onerror(err) {
            clearTimeout(connectionTimeout)
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
                      .then(resolve)
                      .catch(reject)
                  })
                  .then((resp) => {
                    const newToken = resp.data.accessToken
                    setAccessToken(newToken)
                    connectSSE(retryCount + 1)
                      .then(resolve)
                      .catch(reject)
                  })
                  .catch(() => {
                    resetState()
                    reject(err)
                  })
                return
              } else {
                resetState()
                reject(err)
                throw err
              }
            }

            sseStatus.value = 'error'
            if (err.message.includes('Fatal')) {
              if (abortController) {
                abortController.abort()
                abortController = null
              }
              reject(err)
              throw err
            }
          },
        })
      } catch (err) {
        clearTimeout(connectionTimeout)
        if (err.message !== 'SSE_AUTH_ERROR') {
          sseStatus.value = 'error'
          abortController = null
          reject(err)
        }
      }
    })
  }

  const closeSSE = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
      sseStatus.value = 'disconnected'
    }
  }

  const initAuth = async () => {
    if (isInitialized.value) return

    if (!getAccessToken()) {
      try {
        const { data } = await axiosInstance.post('/api/v1/auth/refresh-token')
        setAccessToken(data.accessToken)
      } catch {
        localStorage.removeItem('isLoggedIn')
        isInitialized.value = true
        return
      }
    }

    try {
      await connectSSE()
    } catch {
      if (!user.value) {
        try {
          const { data } = await axiosInstance.get('/api/v1/user/me', { skipRedirect: true })
          user.value = data
        } catch {
          localStorage.removeItem('isLoggedIn')
        }
      }
    } finally {
      isInitialized.value = true
    }
  }

  return {
    user,
    isInitialized,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    initAuth,
    resetState,
    sseStatus,
    reconnectSSE: () => {
      closeSSE()
      connectSSE()
    },
  }
})
