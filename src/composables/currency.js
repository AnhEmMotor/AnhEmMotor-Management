export function formatCurrency(number) {
  const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
  })
  if (typeof number !== 'number') return '0'
  return currencyFormatter.format(number) + ''
}
