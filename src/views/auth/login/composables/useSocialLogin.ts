import { fetchExternalAuthConfig, fetchGoogleLogin, fetchFacebookLogin } from '@/infrastructure/api/auth'
import { useUserStore } from '@/application/store/user'
import { ElMessage } from 'element-plus'

export function useSocialLogin() {
  const userStore = useUserStore()
  const externalConfig = ref<Api.Auth.ExternalAuthConfigResponse | null>(null)

  const initSocial = async () => {
    try {
      const data = await fetchExternalAuthConfig()
      externalConfig.value = data

      // Initialize Facebook SDK
      if (data.facebookAppId) {
        const initFB = () => {
          if ((window as any).FB && data.facebookAppId && !(window as any).__fb_initialized) {
            ;(window as any).FB.init({
              appId: data.facebookAppId,
              cookie: true,
              xfbml: true,
              version: 'v22.0',
            })
            ;(window as any).__fb_initialized = true
          }
        }

        if ((window as any).FB) {
          initFB()
        } else {
          ;(window as any).fbAsyncInit = initFB
        }
      }
    } catch (error) {
      console.error('Failed to fetch external auth config:', error)
    }
  }

  const loginWithGoogleIdToken = () => {
    if (!externalConfig.value?.googleClientId) {
      ElMessage.error('Google Client ID not found')
      return Promise.resolve(false)
    }

    return new Promise((resolve) => {
      if (!(window as any).google) {
        ElMessage.error('Google SDK not loaded')
        return resolve(false)
      }

      ;(window as any).google.accounts.id.initialize({
        client_id: externalConfig.value!.googleClientId,
        callback: (response: any) => {
          ;(async () => {
            try {
              const { accessToken, refreshToken } = await fetchGoogleLogin({
                idToken: response.credential,
              })

              if (accessToken) {
                userStore.setToken(accessToken, refreshToken)
                userStore.setLoginStatus(true)
                resolve(true)
              }
            } catch (error) {
              console.error('Google login error:', error)
              resolve(false)
            }
          })()
        },
      })
      ;(window as any).google.accounts.id.prompt()
    })
  }

  const loginWithFacebook = () => {
    if (!externalConfig.value?.facebookAppId) {
      ElMessage.error('Facebook App ID not found')
      return Promise.resolve(false)
    }

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      ElMessage.error('Facebook Login yêu cầu kết nối HTTPS!')
      return Promise.resolve(false)
    }

    return new Promise((resolve) => {
      if (!(window as any).FB) {
        ElMessage.error('Facebook SDK not loaded')
        return resolve(false)
      }

      ;(window as any).FB.login(
        (response: any) => {
          if (response.authResponse) {
            ;(async () => {
              try {
                const { accessToken, refreshToken } = await fetchFacebookLogin({
                  accessToken: response.authResponse.accessToken,
                })

                if (accessToken) {
                  userStore.setToken(accessToken, refreshToken)
                  userStore.setLoginStatus(true)
                  resolve(true)
                }
              } catch (error) {
                console.error('Facebook login error:', error)
                resolve(false)
              }
            })()
          } else {
            ElMessage.warning('Facebook login cancelled')
            resolve(false)
          }
        },
        { scope: 'public_profile,email' },
      )
    })
  }

  return {
    initSocial,
    loginWithGoogle: loginWithGoogleIdToken,
    loginWithFacebook,
  }
}
