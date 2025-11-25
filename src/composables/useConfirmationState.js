import { reactive, readonly } from 'vue'

const state = reactive({
  show: false,
  title: '',
  message: '',
  _resolve: null,
})

export function showConfirmation(title, message) {
  return new Promise((resolve) => {
    state.title = title || ''
    state.message = message || ''
    state.show = true
    state._resolve = resolve
  })
}

export function confirm() {
  if (typeof state._resolve === 'function') state._resolve(true)
  state._resolve = null
  state.show = false
}

export function cancel() {
  if (typeof state._resolve === 'function') state._resolve(false)
  state._resolve = null
  state.show = false
}

export function useConfirmationState() {
  return {
    state: readonly(state),
    confirm,
    cancel,
  }
}

export default {
  showConfirmation,
  confirm,
  cancel,
  useConfirmationState,
}
