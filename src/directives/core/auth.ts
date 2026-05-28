import { router } from '@/router'
import { App, Directive, DirectiveBinding, watch } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { useAppMode } from '@/hooks/core/useAppMode'

export type AuthDirective = Directive<HTMLElement, string>

interface CustomHTMLElement extends HTMLElement {
  __authWatcher__?: () => void
}

function updateElementAuth(el: CustomHTMLElement, binding: DirectiveBinding<string>): void {
  const userStore = useUserStore()
  const { isFrontendMode } = useAppMode()

  let hasPermission = false

  if (isFrontendMode.value) {
    const frontendAuthList = userStore.info?.buttons ?? []
    hasPermission = frontendAuthList.includes(binding.value)
  } else {
    const authList = (router.currentRoute.value.meta.authList as Array<{ authMark: string }>) || []
    hasPermission = authList.some((item) => item.authMark === binding.value)
  }

  if (!hasPermission) {
    el.style.display = 'none'
  } else {
    el.style.display = ''
  }
}

const authDirective: AuthDirective = {
  mounted(el: CustomHTMLElement, binding) {
    const userStore = useUserStore()

    updateElementAuth(el, binding)

    el.__authWatcher__ = watch(
      () => userStore.info?.buttons,
      () => {
        updateElementAuth(el, binding)
      },
      { deep: true }
    )
  },
  unmounted(el: CustomHTMLElement) {
    if (el.__authWatcher__) {
      el.__authWatcher__()
      delete el.__authWatcher__
    }
  }
}

export function setupAuthDirective(app: App): void {
  app.directive('auth', authDirective)
}
