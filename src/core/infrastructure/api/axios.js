import axios from 'axios'
import { queryClient } from './queryClient'

const baseURL = import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT || 'http://localhost:5000'

let accessToken = null
let tokenExpiration = null
let refreshTokenPromise = null
let onAuthFailure = null

export const setAccessToken = (token, expiresAt) => {
  accessToken = token
  if (expiresAt) {
    tokenExpiration = new Date(expiresAt).getTime()
  } else {
    tokenExpiration = null
  }
}

export const getAccessToken = () => accessToken

export const isTokenExpired = () => {
  if (!tokenExpiration) return true
  return Date.now() >= tokenExpiration - 10000
}

export const registerAuthFailureCallback = (callback) => {
  onAuthFailure = callback
}

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

const handleAuthFailure = () => {
  refreshTokenPromise = null
  if (onAuthFailure) {
    onAuthFailure()
  } else {
    setAccessToken(null)
    queryClient.clear()
  }
}

export const refreshAccessToken = async () => {
  let attempts = 0
  const maxAttempts = getAccessToken() ? 3 : 1

  while (attempts < maxAttempts) {
    attempts++
    try {
      const response = await fetch(`${baseURL}/api/v1/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      if (!response.ok) throw new Error(`HTTP_ERROR_${response.status}`)

      const result = await response.json()
      const newAccessToken = result.accessToken
      const newExpiresAt = result.expiresAt

      setAccessToken(newAccessToken, newExpiresAt)
      return newAccessToken
    } catch (error) {
      if (attempts >= maxAttempts) throw error
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }
}

axiosInstance.interceptors.request.use(
  async (config) => {
    config.params = { ...config.params, t: Date.now() }

    const currentToken = getAccessToken()
    if (currentToken) {
      if (isTokenExpired()) {
        if (!refreshTokenPromise) {
          refreshTokenPromise = refreshAccessToken().finally(() => {
            refreshTokenPromise = null
          })
        }
        try {
          const freshToken = await refreshTokenPromise
          config.headers.Authorization = `Bearer ${freshToken}`
        } catch (error) {
          return Promise.reject(error)
        }
      } else {
        config.headers.Authorization = `Bearer ${currentToken}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url.includes('/refresh-token') ||
        originalRequest.url.includes('/login') ||
        !getAccessToken()
      ) {
        handleAuthFailure()
        return Promise.reject(error)
      }

      originalRequest._retry = true

      if (!refreshTokenPromise) {
        refreshTokenPromise = refreshAccessToken().finally(() => {
          refreshTokenPromise = null
        })
      }

      try {
        const newAccessToken = await refreshTokenPromise
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        handleAuthFailure()
        return Promise.reject(refreshError)
      }
    }

    if (error.response?.data?.message) {
      error.message = error.response.data.message
    } else if (error.response?.data?.title) {
      error.message = error.response.data.title
    }

    return Promise.reject(error)
  },
)

export default axiosInstance



