import { useUserStore } from '@/store/modules/user'

export const usePermission = () => {
  const userStore = useUserStore()

  const getButtons = (): string[] => {
    return userStore.info?.buttons ?? []
  }

  const hasPermission = (permission: string): boolean => {
    return getButtons().includes(permission)
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    const buttons = getButtons()
    return permissions.every((p) => buttons.includes(p))
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    const buttons = getButtons()
    return permissions.some((p) => buttons.includes(p))
  }

  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission
  }
}
