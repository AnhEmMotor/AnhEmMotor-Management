export function formatCurrency(number) {
  const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
  })
  if (typeof number !== 'number') return '0'
  return currencyFormatter.format(number) + ''
}

export function parseCurrency(str) {
  if (!str) return 0
  const n = Number(String(str).replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}
export function formatVNDWithUnit(number) {
  return formatCurrency(number) + ' VNĐ'
}
