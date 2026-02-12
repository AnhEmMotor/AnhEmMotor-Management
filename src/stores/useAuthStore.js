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

  /*
   * fetchUser đã được loại bỏ để dùng SSE hoàn toàn
   * Chỉ giữ lại để dùng nếu cần re-fetch thủ công (nhưng SSE đã lo việc này)
   */
  const fetchUser = async () => {
    // Deprecated: Logic đã chuyển sang connectSSE
    return user.value
  }

  const login = async (credentials) => {
    isLoggingOut = false
    const { data } = await axiosInstance.post('/api/v1/auth/login/for-manager', credentials)
    setAccessToken(data.accessToken)
    localStorage.setItem('isLoggedIn', 'true')
    setAccessToken(data.accessToken)
    localStorage.setItem('isLoggedIn', 'true')
    
    // Đợi tối đa 2s cho SSE, nếu không có data -> Fallback gọi API
    try {
      await connectSSE()
    } catch {
      if (!user.value) {
        // Fallback: Nếu SSE timeout/error mà chưa có user -> Gọi API thường
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
    } catch {
      // Ignore logout error
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
      
      /*
       * Timeout thông minh:
       * 1. Chờ 2s để xem SSE có data không.
       * 2. Nếu sau 2s chưa có data -> Reject (để catch block bên ngoài gọi API fallback).
       * 3. Không close connection, vẫn để nó chạy ngầm để nhận update sau này.
       */
      const connectionTimeout = setTimeout(() => {
        if (!user.value) {
          // Không closeSSE() ở đây để cho nó retry ngầm
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
            if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
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
            
            // Fix: Check đúng key userName hoặc fullName (theo Swagger)
            if (data && (data.userName || data.fullName || data.username)) {
              user.value = { ...user.value, ...data }
              
              // Resolve promise khi nhận được data đầu tiên
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
                    // Recursive call cũng trả về promise
                    connectSSE(retryCount + 1).then(resolve).catch(reject)
                  })
                  .then((resp) => {
                    const newToken = resp.data.accessToken
                    setAccessToken(newToken)
                    // Recursive call cũng trả về promise
                    connectSSE(retryCount + 1).then(resolve).catch(reject)
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

    /*
     * Tối ưu: Nếu không có flag isLoggedIn trong localStorage, coi như chưa đăng nhập
     * Không cần gọi API để tránh lỗi 401/400 không cần thiết
     */
    if (!localStorage.getItem('isLoggedIn')) {
      isInitialized.value = true
      return
    }

    // Check Token: Nếu chưa có Access Token (do F5 reload), thử refresh
    if (!getAccessToken()) {
      try {
        const { data } = await axiosInstance.post('/api/v1/auth/refresh-token')
        setAccessToken(data.accessToken)
      } catch {
        // Refresh thất bại -> Session hết hạn -> Logout
        localStorage.removeItem('isLoggedIn')
        isInitialized.value = true
        return
      }
    }

    try {
      // Thay thế fetchUser bằng connectSSE
      await connectSSE()
    } catch {
      // Fallback: Nếu SSE fail, thử gọi API thường
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
