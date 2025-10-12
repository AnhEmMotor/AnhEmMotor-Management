export function formatNumber(num) {
  if (isNaN(num)) return '0';
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseNumber(str) {
  if (typeof str !== 'string') str = String(str);
  return parseFloat(str.replace(/\./g, '')) || 0;
}

export function handleNumericInput(event) {
  const input = event.target;
  let value = input.value.replace(/[^0-9]/g, '');
  input.value = value ? formatNumber(parseInt(value, 10)) : '';
}