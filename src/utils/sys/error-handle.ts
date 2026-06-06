import type { App } from 'vue'

const IGNORABLE_SCRIPT_ERRORS = [
  'ResizeObserver loop completed with undelivered notifications.',
  'ResizeObserver loop limit exceeded',
]

const CHROME_EXTENSION_ERROR_PATTERNS = [
  /chrome runtime error/i,
  /a listener indicated an asynchronous response by returning true/i,
  /the message channel closed before a response was received/i,
  /could not establish connection.*receiving end does not exist/i,
  /unchecked runtime\.lasterror/i,
  /cleanup timeout/i,
]

function normalizeErrorMessage(message: Event | string): string {
  if (typeof message === 'string') {
    return message
  }

  if ('message' in message && typeof message.message === 'string') {
    return message.message
  }

  return ''
}

function isIgnorableScriptError(message: Event | string, source?: string): boolean {
  const normalizedMessage = normalizeErrorMessage(message)

  if (!normalizedMessage) {
    return false
  }

  if (IGNORABLE_SCRIPT_ERRORS.some((item) => normalizedMessage.includes(item))) {
    return true
  }

  if (normalizedMessage === 'Script error.' && source === '') {
    return true
  }

  if (CHROME_EXTENSION_ERROR_PATTERNS.some((pattern) => pattern.test(normalizedMessage))) {
    return true
  }

  return false
}

export function vueErrorHandler(err: unknown, instance: any, info: string) {
  console.error('[VueError]', err, info, instance)
}

export function scriptErrorHandler(
  message: Event | string,
  source?: string,
  lineno?: number,
  colno?: number,
  error?: Error,
): boolean {
  if (isIgnorableScriptError(message, source)) {
    return true
  }

  console.error('[ScriptError]', { message, source, lineno, colno, error })

  return true
}

export function registerPromiseErrorHandler() {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    const message = typeof reason === 'string' ? reason : reason?.message || ''
    if (CHROME_EXTENSION_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
      return
    }
    console.error('[PromiseError]', event.reason)
  })
}

export function registerResourceErrorHandler() {
  window.addEventListener(
    'error',
    (event: Event) => {
      const target = event.target as HTMLElement
      if (
        target &&
        (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')
      ) {
        console.error('[ResourceError]', {
          tagName: target.tagName,
          src:
            (target as HTMLImageElement).src ||
            (target as HTMLScriptElement).src ||
            (target as HTMLLinkElement).href,
        })
      }
    },
    true,
  )
}

export function setupErrorHandle(app: App) {
  app.config.errorHandler = vueErrorHandler
  window.onerror = scriptErrorHandler
  registerPromiseErrorHandler()
  registerResourceErrorHandler()
}
