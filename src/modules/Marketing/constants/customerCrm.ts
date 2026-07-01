export const LEAD_STATUS_OPTIONS = [
  { value: "New", label: "Mới", type: "info" },
  { value: "Consulting", label: "Đang tư vấn", type: "primary" },
  { value: "TestDriving", label: "Lái thử", type: "warning" },
  { value: "Deposited", label: "Đã đặt cọc", type: "success" },
  { value: "Paperwork", label: "Đang làm hồ sơ", type: "warning" },
  { value: "Delivered", label: "Đã giao xe", type: "success" },
] as const;

export const OUTPUT_STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "waiting_deposit", label: "Chờ đặt cọc" },
  { value: "deposit_paid", label: "Đã đặt cọc" },
  { value: "waiting_installment", label: "Chờ trả góp" },
  { value: "installment_approved", label: "Đã duyệt trả góp" },
  { value: "confirmed_cod", label: "Xác nhận COD" },
  { value: "paid_processing", label: "Đang xử lý thanh toán" },
  { value: "delivering", label: "Đang giao" },
  { value: "waiting_pickup", label: "Chờ nhận xe" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "refunding", label: "Đang hoàn tiền" },
  { value: "refunded", label: "Đã hoàn tiền" },
] as const;

export type LeadStatus = (typeof LEAD_STATUS_OPTIONS)[number]["value"];
export type OutputStatus = (typeof OUTPUT_STATUS_OPTIONS)[number]["value"];

export function getLeadStatusLabel(status?: string) {
  return (
    LEAD_STATUS_OPTIONS.find((item) => item.value === status)?.label ??
    status ??
    "Chưa có"
  );
}

export function getLeadStatusType(status?: string) {
  return (
    LEAD_STATUS_OPTIONS.find((item) => item.value === status)?.type ?? "info"
  );
}

export function getOutputStatusLabel(status?: string) {
  return (
    OUTPUT_STATUS_OPTIONS.find((item) => item.value === status)?.label ??
    status ??
    "Chưa có"
  );
}

export function getOutputStatusIndex(status?: string) {
  return OUTPUT_STATUS_OPTIONS.findIndex((item) => item.value === status);
}

export function isHighIntentLeadStatus(status?: string) {
  return (
    status === "TestDriving" || status === "Deposited" || status === "Paperwork"
  );
}
