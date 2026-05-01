/**
 * Dịch các thông báo lỗi kỹ thuật của .NET sang tiếng Việt thân thiện hơn
 */
const translateMessage = (msg, field) => {
  if (typeof msg !== 'string') return msg

  // Chỉ dịch các lỗi kỹ thuật hệ thống (JSON deserialization, conversion)
  if (msg.includes('could not be converted') || msg.includes('is not a valid')) {
    const cleanFieldName = field ? field.replace(/^\$\./, '') : 'trường này'
    // Lấy phần thông báo chính trước khi có " Path:"
    const mainError = msg.split(' Path: ')[0]
    return `Lỗi định dạng [${cleanFieldName}]: ${mainError}`
  }
  
  // Trả về nguyên bản thông báo từ backend nếu là lỗi validation nghiệp vụ (FluentValidation)
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

    // Loại bỏ tiền tố $. thường gặp trong lỗi JSON deserialization của .NET
    const cleanField = rawField.replace(/^\$\./, '')
    const lowerField = cleanField.toLowerCase()

    // Lưu vào _backend để debug hoặc dùng fallback
    normalized._backend[lowerField] = msg

    // Xử lý lỗi biến thể (ví dụ: Variants[0].Price hoặc $.variants[0].Price)
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

    // Xử lý lỗi cấp cao nhất
    const targetField = fieldMappings[lowerField] || lowerField
    normalized[targetField] = msg
  }

  if (Array.isArray(backendErrors)) {
    // Trường hợp mảng: [{ field: "Name", message: "..." }]
    backendErrors.forEach((item) => {
      const field = item.field || item.Field
      const message = item.message || item.Message
      processError(field, message)
    })
  } else if (typeof backendErrors === 'object') {
    // Trường hợp object: { Name: ["..."], CategoryId: ["..."] }
    Object.entries(backendErrors).forEach(([field, messages]) => {
      processError(field, messages)
    })
  }

  return normalized
}
