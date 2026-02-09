import axios from 'axios'
import { queryClient } from './queryClient'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

let accessToken = null
let refreshTokenPromise = null
let onAuthFailure = null

export const setAccessToken = (token) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

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

const refreshAccessToken = async () => {
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

      setAccessToken(newAccessToken)
      return newAccessToken
    } catch (error) {
      if (attempts >= maxAttempts) throw error
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }
}

axiosInstance.interceptors.request.use(
  (config) => {
    const currentToken = getAccessToken()
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`
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
      if (originalRequest.url.includes('/refresh-token')) {
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

    return Promise.reject(error)
  },
)

export default axiosInstance
