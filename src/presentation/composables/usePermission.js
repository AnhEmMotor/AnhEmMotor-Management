import { computed } from 'vue'
import { useAuthStore } from '@stores/auth.store'

export function usePermission() {
  const authStore = useAuthStore()

  const permissions = computed(() => authStore.user?.permissions || [])
  const roles = computed(() => authStore.user?.roles || [])

  const hasPermission = (permission) => {
    return permissions.value.includes(permission)
  }

  const hasAnyPermission = (permissionList) => {
    return permissionList.some((p) => hasPermission(p))
  }

  const hasAllPermissions = (permissionList) => {
    return permissionList.every((p) => hasPermission(p))
  }

  const hasRole = (role) => {
    return roles.value.includes(role)
  }

  return {
    permissions,
    roles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  }
}



