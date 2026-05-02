const translateMessage = (msg, field) => {
  if (typeof msg !== 'string') return msg

  if (msg.includes('could not be converted') || msg.includes('is not a valid')) {
    const cleanFieldName = field ? field.replace(/^\$\./, '') : 'trường này'
    const mainError = msg.split(' Path: ')[0]
    return `Lỗi định dạng [${cleanFieldName}]: ${mainError}`
  }

  return msg.split(' Path: ')[0].split(' | LineNumber:')[0]
}

export const normalizeBackendErrors = (err, options = {}) => {
  const backendErrors = err?.response?.data?.errors || err?.response?.data?.Errors || null

  const normalized = {
    _backend: {},
    variants: [],
  }

  if (!backendErrors) return normalized

  const fieldMappings = options.fieldMappings || {}

  const processError = (field, message) => {
    const rawField = field || ''
    let msg = Array.isArray(message) ? message[0] : message
    msg = translateMessage(msg, rawField)

    const cleanField = rawField.replace(/^\$\./, '')
    const lowerField = cleanField.toLowerCase()

    normalized._backend[lowerField] = msg

    const variantMatch = cleanField.match(/variants\[(\d+)\]\.(.+)/i)
    if (variantMatch) {
      const index = parseInt(variantMatch[1], 10)
      const vFieldRaw = variantMatch[2].toLowerCase()
      const vField = fieldMappings[vFieldRaw] || vFieldRaw

      if (!normalized.variants[index]) {
        normalized.variants[index] = {}
      }
      normalized.variants[index][vField] = msg
      return
    }

    const targetField = fieldMappings[lowerField] || lowerField
    normalized[targetField] = msg
  }

  if (Array.isArray(backendErrors)) {
    backendErrors.forEach((item) => {
      const field = item.field || item.Field
      const message = item.message || item.Message
      processError(field, message)
    })
  } else if (typeof backendErrors === 'object') {
    Object.entries(backendErrors).forEach(([field, messages]) => {
      processError(field, messages)
    })
  }

  return normalized
}
