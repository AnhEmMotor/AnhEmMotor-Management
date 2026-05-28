import { computed } from 'vue'

export function useAppMode() {
  const accessMode = import.meta.env.VITE_ACCESS_MODE || 'frontend'

  const isFrontendMode = computed(() => accessMode === 'frontend')

  const isBackendMode = computed(() => accessMode === 'backend')

  const currentMode = computed(() => accessMode)

  return {
    isFrontendMode,
    isBackendMode,
    currentMode
  }
}
