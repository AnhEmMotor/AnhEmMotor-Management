<template>
  <div class="flex w-full h-screen">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <p class="sub-title">{{ $t('login.subTitle') }}</p>
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="rules"
            :key="formKey"
            @keyup.enter="handleSubmit"
            style="margin-top: 40px"
            class="login-form-container"
          >
            <ElFormItem prop="username" class="mb-6">
              <ElInput
                class="custom-height"
                :placeholder="$t('login.placeholder.username')"
                v-model.trim="formData.username"
              />
            </ElFormItem>
            <ElFormItem prop="password" class="mb-8">
              <ElInput
                class="custom-height"
                :placeholder="$t('login.placeholder.password')"
                v-model.trim="formData.password"
                type="password"
                autocomplete="off"
                show-password
              />
            </ElFormItem>

            <div style="margin-top: 30px">
              <ElButton
                class="w-full custom-height"
                type="primary"
                @click="handleSubmit"
                :loading="loading"
                v-ripple
              >
                {{ $t('login.btnText') }}
              </ElButton>
            </div>

            <div class="social-login-wrap">
              <div class="divider">
                <span>Hoặc đăng nhập bằng</span>
              </div>
              <div class="social-btns">
                <ElButton class="social-btn google" @click="handleGoogleLogin">
                  <Icon icon="logos:google-icon" class="mr-2" />
                  Google
                </ElButton>
                <ElButton class="social-btn facebook" @click="handleFacebookLogin">
                  <Icon icon="logos:facebook" class="mr-2" />
                  Facebook
                </ElButton>
              </div>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import { useI18n } from 'vue-i18n'
  import { fetchLogin } from '@/api/auth.api'
  import { ElNotification, type FormInstance, type FormRules } from 'element-plus'
  import { Icon } from '@iconify/vue'

  defineOptions({ name: 'Login' })

  const { t, locale } = useI18n()
  const formKey = ref(0)

  watch(locale, () => {
    formKey.value++
  })

  import { useSocialLogin } from './composables/useSocialLogin'

  const userStore = useUserStore()
  const router = useRouter()
  const route = useRoute()

  const formRef = ref<FormInstance>()

  const formData = reactive({
    username: '',
    password: ''
  })

  const rules = computed<FormRules>(() => ({
    username: [{ required: true, message: t('login.rules.usernameRequired'), trigger: 'blur' }],
    password: [{ required: true, message: t('login.rules.passwordRequired'), trigger: 'blur' }]
  }))

  const loading = ref(false)
  const { initSocial, loginWithGoogle, loginWithFacebook } = useSocialLogin()

  onMounted(() => {
    initSocial()
  })

  const handleSocialLoginSuccess = () => {
    showLoginSuccessNotice()
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  }

  const handleGoogleLogin = () => {
    ;(async () => {
      try {
        loading.value = true
        const success = await loginWithGoogle()
        if (success) {
          handleSocialLoginSuccess()
        }
      } finally {
        loading.value = false
      }
    })()
  }

  const handleFacebookLogin = () => {
    ;(async () => {
      try {
        loading.value = true
        const success = await loginWithFacebook()
        if (success) {
          handleSocialLoginSuccess()
        }
      } finally {
        loading.value = false
      }
    })()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      const valid = await formRef.value.validate()
      if (!valid) return

      loading.value = true

      const { username, password } = formData

      const { accessToken, refreshToken } = await fetchLogin({
        usernameOrEmail: username,
        password
      })

      if (!accessToken) {
        throw new Error('Login failed - no token received')
      }

      userStore.setToken(accessToken, refreshToken)
      userStore.setLoginStatus(true)

      showLoginSuccessNotice()

      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    } catch {
      try {
        useUserStore().logOut()
      } catch {
        // Ignore error during logout
      }
    } finally {
      loading.value = false
    }
  }

  const showLoginSuccessNotice = () => {
    setTimeout(() => {
      const showNotice = (userName: string) => {
        ElNotification({
          title: t('login.success.title'),
          type: 'success',
          duration: 2500,
          zIndex: 10000,
          message: `${t('login.success.message')}, ${userName}!`,
          position: 'bottom-right'
        })
      }

      if (userStore.info.userName) {
        showNotice(userStore.info.userName)
      } else {
        const unwatch = watch(
          () => userStore.info.userName,
          (newVal) => {
            if (newVal) {
              showNotice(newVal)
              unwatch()
            }
          }
        )
        setTimeout(() => {
          unwatch()
          if (!userStore.info.userName) {
            showNotice(t('login.success.defaultUser'))
          }
        }, 4000)
      }
    }, 1000)
  }
</script>

<style scoped>
  @import './style.css';
</style>

<style lang="scss" scoped>
  .auth-right-wrap {
    .form {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .title {
      font-size: 2.25rem;
      font-weight: 700;
      color: #1f2937;
      letter-spacing: -0.025em;
    }

    .sub-title {
      margin-top: 12px;
      font-size: 1rem;
      color: #6b7280;
    }

    .custom-height {
      height: 50px !important;
      font-size: 1rem;

      :deep(.el-input__wrapper) {
        border-color: #f3f4f6;
        border-radius: 0.75rem;
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 5%);
      }
    }

    .login-form-container {
      :deep(.el-form-item__content) {
        margin-bottom: 8px;
      }
    }
  }

  .social-login-wrap {
    width: 100%;
    padding: 0 5px;
    margin-top: 40px;

    .divider {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 25px;
      font-size: 14px;
      font-weight: 500;
      color: #9ca3af;

      &::before,
      &::after {
        flex-grow: 1;
        height: 1px;
        content: '';
        background-color: #f3f4f6;
      }

      span {
        padding: 0 15px;
        white-space: nowrap;
      }
    }

    .social-btns {
      display: flex;
      gap: 16px;
      width: 100%;

      .social-btn {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
        height: 50px !important;
        margin: 0 !important;
        font-weight: 500;
        color: #374151;
        cursor: pointer;
        background-color: #fff;
        border: 1px solid #e5e7eb !important;
        border-radius: 12px !important;

        &:hover {
          background-color: #f9fafb;
        }

        .icon {
          margin-right: 10px;
          font-size: 20px;
        }

        &.google:hover {
          border-color: #60a5fa !important;
        }

        &.facebook:hover {
          border-color: #1d4ed8 !important;
        }
      }
    }
  }
</style>
