<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth.store'
import IconFacebook from '@/assets/icons/facebook.svg'
import IconGoogle from '@/assets/icons/google.svg'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const isLoading = ref(false)

const emit = defineEmits(['loading'])

const handleGoogleLogin = (response) => {
  ;(async () => {
    try {
      isLoading.value = true
      emit('loading', true)
      await authStore.loginWithGoogle(response.credential)
      const redirectPath = router.currentRoute.value.query.redirect || '/'
      router.push(redirectPath)
      toast.success('Đăng nhập Google thành công!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập Google thất bại')
    } finally {
      isLoading.value = false
      emit('loading', false)
    }
  })()
}

const checkAndTriggerGoogle = () => {
  if (window.google) {
    window.google.accounts.id.prompt()
  } else {
    isLoading.value = true
    let checkCount = 0
    const timer = setInterval(() => {
      if (window.google) {
        clearInterval(timer)
        isLoading.value = false
        window.google.accounts.id.prompt()
      }
      if (++checkCount > 10) {
        clearInterval(timer)
        isLoading.value = false
        toast.error('Google SDK chưa sẵn sàng. Vui lòng thử lại sau vài giây!')
      }
    }, 500)
  }
}

const triggerGoogleLogin = () => {
  const googleBtn = document.querySelector("#google-login-hidden [role='button']")
  if (googleBtn) {
    googleBtn.click()
  } else {
    checkAndTriggerGoogle()
  }
}

const handleFacebookLogin = () => {
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    return toast.error('Facebook Login yêu cầu kết nối HTTPS!')
  }

  isLoading.value = true
  emit('loading', true)
  window.FB.login(
    (response) => {
      if (response.authResponse) {
        ;(async () => {
          try {
            await authStore.loginWithFacebook(response.authResponse.accessToken)
            const redirectPath = router.currentRoute.value.query.redirect || '/'
            router.push(redirectPath)
            toast.success('Đăng nhập Facebook thành công!')
          } catch (err) {
            toast.error(err.response?.data?.message || 'Đăng nhập Facebook thất bại')
          } finally {
            isLoading.value = false
            emit('loading', false)
          }
        })()
      } else {
        isLoading.value = false
        emit('loading', false)
        toast.info('Đã hủy đăng nhập Facebook')
      }
    },
    { scope: 'email,public_profile' },
  )
}

onMounted(() => {
  let retryCount = 0
  const maxRetries = 30

  const initSocials = async () => {
    try {
      const configData = await authStore.getExternalAuthConfig()
      if (!configData) return

      const googleClientId = configData.googleClientId || configData.GoogleClientId
      const facebookAppId = configData.facebookAppId || configData.FacebookAppId

      const initFB = () => {
        if (window.FB && facebookAppId && !window.__fb_initialized) {
          window.FB.init({
            appId: facebookAppId,
            cookie: true,
            xfbml: true,
            version: 'v22.0',
          })
          window.__fb_initialized = true
        }
      }

      const checkSocials = setInterval(() => {
        if (window.google && googleClientId) {
          if (!window.__google_initialized) {
            window.google.accounts.id.initialize({
              client_id: googleClientId,
              callback: handleGoogleLogin,
              auto_select: false,
              itp_support: true,
            })
            window.__google_initialized = true
          }

          const targetElem = document.getElementById('google-login-hidden')
          if (targetElem && targetElem.children.length === 0) {
            window.google.accounts.id.renderButton(targetElem, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              type: 'standard',
            })
          }
        }

        initFB()

        const isGoogleReady =
          window.__google_initialized &&
          (!document.getElementById('google-login-hidden') ||
            document.getElementById('google-login-hidden').children.length > 0)

        if ((isGoogleReady || !googleClientId) && (window.__fb_initialized || !facebookAppId)) {
          clearInterval(checkSocials)
        }

        if (++retryCount >= maxRetries) {
          clearInterval(checkSocials)
        }
      }, 500)
    } catch (error) {
      console.error('Failed to load social config:', error)
    }
  }

  initSocials()
})
</script>

<template>
  <div class="space-y-4">
    <div class="relative flex items-center justify-center py-2">
      <div class="flex-grow border-t border-gray-100"></div>
      <span class="mx-4 text-xs text-gray-400 font-medium uppercase tracking-wider bg-white px-2"
        >Hoặc tiếp tục với</span
      >
      <div class="flex-grow border-t border-gray-100"></div>
    </div>

    <div class="flex flex-col gap-3">
      <button
        @click="triggerGoogleLogin"
        :disabled="isLoading"
        type="button"
        class="social-btn google-btn"
      >
        <IconGoogle class="w-5 h-5" />
        <span>Đăng nhập qua Google</span>
      </button>

      <div id="google-login-hidden" class="hidden"></div>

      <button
        @click="handleFacebookLogin"
        :disabled="isLoading"
        type="button"
        class="social-btn facebook-btn"
      >
        <IconFacebook class="w-5 h-5 fill-current" />
        <span>Đăng nhập qua Facebook</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "../../assets/main.css";

.social-btn {
  @apply flex h-[46px] w-full items-center justify-center gap-3 rounded-xl px-4 font-semibold shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 text-sm;
}

.google-btn {
  @apply bg-white text-slate-700 border border-slate-200 hover:bg-slate-50;
}

.facebook-btn {
  @apply bg-[#1877F2] text-white hover:bg-[#166fe5];
}
</style>


