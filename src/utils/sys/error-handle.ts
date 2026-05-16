/**
 * toànbộXuLy lỗimôkhối
 *
 * gợicungthốngmộtcủaLỗibắtvàXuLymáychế
 *
 * ## chủcầncôngnăng
 *
 * - Vue vậndònggiờLỗibắt（ComponentLỗi、sinhmệnhtuầnkỳLỗibằng）
 * - toànbộchânquyểnLỗibắt（ngônphápLỗi、vậndònggiờLỗibằng）
 * - Promise ChưabắtXuLy lỗi（unhandledrejection）
 * - tĩnhtháitàinguồnLoadingLỗiGiámkhống（Hình ảnh、chânquyển、Kiểu dángbằng）
 * - LỗiNhatKyGhi chépvàtrênbáo
 * - thốngmộtcủaXuLy lỗivàodiện
 *
 * ## khiếndùngtrườngcảnh
 * - Ứng dụngbậtđộnggiờantoànbộXuLy lỗithiết bị
 * - bắtvàGhi chépnêncóloạikiểucủaLỗi
 * - LỗitrênbáođếnGiámkhốngchiếc
 * - gợilênỨng dụngổnđịnhtínhvàCó thểduyhộtính
 * - hỏiđềxếpTìmvàđiềuthử
 *
 * ## Lỗiloạikiểu
 *
 * - VueError: Vue ComponentđóngLỗi
 * - ScriptError: JavaScript chânquyểnLỗi
 * - PromiseError: Promise Chưabắtcủa rejection
 * - ResourceError: tĩnhtháitàinguồnLoadingThatBai
 *
 * @module utils/sys/error-handle
 * @author Art Design Pro Team
 */
import type { App } from 'vue'

const IGNORABLE_SCRIPT_ERRORS = [
  'ResizeObserver loop completed with undelivered notifications.',
  'ResizeObserver loop limit exceeded'
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
    // xemthiết bị/mởtriểntạiBố cụcrungđộnggiờlệthấycủa ResizeObserver ồnâm，KhônglàmvìthậtthựcBất thườngXuLy
    return true
  }

  // xemthiết bịmởtriểntâmvàochânquyểnngẫuphátcủavượtTên Script error cũngkhôngcóxếpTìmgiágiá trị
  if (normalizedMessage === 'Script error.' && source === '') {
    return true
  }

  return false
}

/**
 * Vue vậndònggiờXuLy lỗi
 */
export function vueErrorHandler(err: unknown, instance: any, info: string) {
  console.error('[VueError]', err, info, instance)
  // nàytrongCó thểlấytrênbáođếnphụcvụđầu，so sánhnếu：
  // reportError({ type: 'vue', err, info })
}

/**
 * toànbộchânquyểnXuLy lỗi
 */
export function scriptErrorHandler(
  message: Event | string,
  source?: string,
  lineno?: number,
  colno?: number,
  error?: Error
): boolean {
  if (isIgnorableScriptError(message, source)) {
    return true
  }

  console.error('[ScriptError]', { message, source, lineno, colno, error })
  // reportError({ type: 'script', message, source, lineno, colno, error })
  return true // trởthúcMacDinhBangDieuKhienbáoLỗi，Có thểliệucầncầusửa
}

/**
 * Promise ChưabắtXuLy lỗi
 */
export function registerPromiseErrorHandler() {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[PromiseError]', event.reason)
    // reportError({ type: 'promise', reason: event.reason })
  })
}

/**
 * tàinguồnLoadingXuLy lỗi (img, script, css...)
 */
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
            (target as HTMLLinkElement).href
        })
        // reportError({ type: 'resource', target })
      }
    },
    true // bắtđoạnmớinăngLắng ngheđếntàinguồnLỗi
  )
}

/**
 * anthốngmộtXuLy lỗi
 */
export function setupErrorHandle(app: App) {
  app.config.errorHandler = vueErrorHandler
  window.onerror = scriptErrorHandler
  registerPromiseErrorHandler()
  registerResourceErrorHandler()
}
