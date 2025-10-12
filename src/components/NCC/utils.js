// Hàm định dạng tiền tệ (hiển thị)
const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0
});

export function formatCurrency(number) {
    if (typeof number !== 'number') return '0';
    return currencyFormatter.format(number) + '';
}

// Hàm chuyển timestamp sang định dạng ngày tháng
export function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Hàm chuyển timestamp sang định dạng ngày tháng và giờ (dd/mm/yyyy hh:mm)
export function formatDateTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Hàm chuyển chuỗi đã format thành số nguyên (dùng cho logic lọc)
export function parseNumber(string) {
    if (!string) return 0;
    return parseFloat(String(string).replace(/[^0-9]/g, '')) || 0;
}

// Hàm định dạng input tự động khi gõ (masking)
export function formatNumberInput(event) {
    let value = event.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
        event.target.value = '';
        return;
    }
    const formattedValue = new Intl.NumberFormat('vi-VN').format(value);
    event.target.value = formattedValue;
}
