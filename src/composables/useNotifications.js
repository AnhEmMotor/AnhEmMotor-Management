import { onMounted, onUnmounted } from 'vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth.store'

export function useNotifications() {
  const toast = useToast()
  const authStore = useAuthStore()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  let controller = null

  const playPing = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
    audio.play().catch((e) => console.error('Audio play failed:', e))
  }

  const connect = async () => {
    if (!authStore.isLoggedIn) return

    controller = new AbortController()
    const token = authStore.token

    try {
      await fetchEventSource(`${apiUrl}/api/v1/Notification/stream`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        signal: controller.signal,
        onmessage(msg) {
          if (msg.data) {
            try {
              const data = JSON.parse(msg.data)
              if (data.type === 'NewBooking') {
                playPing()
                toast.info(data.message || 'Có yêu cầu lái thử mới!', {
                  timeout: 10000,
                  closeOnClick: true,
                  pauseOnHover: true,
                  icon: '🏍️',
                })
              }
            } catch (e) {
              console.error('Failed to parse SSE message', e)
            }
          }
        },
        onerror(err) {
          console.error('SSE connection error:', err)
          // It will automatically retry unless we throw
        },
      })
    } catch (err) {
      console.error('Failed to connect to SSE:', err)
    }
  }

  const disconnect = () => {
    if (controller) {
      controller.abort()
      controller = null
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    connect,
    disconnect,
  }
}
