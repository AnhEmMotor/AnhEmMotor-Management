export function debounce(fn, wait = 350) {
  let t = null
  const debounced = (...args) => {
    if (t) clearTimeout(t)
    t = setTimeout(() => {
      t = null
      fn(...args)
    }, wait)
  }
  debounced.cancel = () => {
    if (t) {
      clearTimeout(t)
      t = null
    }
  }
  return debounced
}

export function throttle(fn, wait = 600) {
  let last = 0
  let t = null
  const throttled = (...args) => {
    const now = Date.now()
    const remaining = wait - (now - last)
    if (remaining <= 0) {
      if (t) {
        clearTimeout(t)
        t = null
      }
      last = Date.now()
      fn(...args)
    } else if (!t) {
      t = setTimeout(() => {
        last = Date.now()
        t = null
        fn(...args)
      }, remaining)
    }
  }
  throttled.cancel = () => {
    if (t) {
      clearTimeout(t)
      t = null
    }
  }
  return throttled
}
