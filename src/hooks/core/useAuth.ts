import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/modules/user'
import { useAppMode } from '@/hooks/core/useAppMode'
import type { AppRouteRecord } from '@/types/router'

type AuthItem = NonNullable<AppRouteRecord['meta']['authList']>[number]

const userStore = useUserStore()

export const useAuth = () => {
  const route = useRoute()
  const { isFrontendMode } = useAppMode()
  const { info } = storeToRefs(userStore)

  const hasAuth = (auth: string): boolean => {
    if (isFrontendMode.value) {
      return (info.value?.buttons ?? []).includes(auth)
    }

    const backendAuthList: AuthItem[] = Array.isArray(route.meta.authList)
      ? (route.meta.authList as AuthItem[])
      : []

    return backendAuthList.some((item) => item?.authMark === auth)
  }

  return {
    hasAuth
  }
}
