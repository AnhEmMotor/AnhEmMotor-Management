export const INPUT_ENDPOINTS = {
  BASE: '/api/v1/InventoryReceipts',
  BY_ID: (id) => `/api/v1/InventoryReceipts/${id}`,
  STATUS: (id) => `/api/v1/InventoryReceipts/${id}/status`,
  CLONE: (id) => `/api/v1/InventoryReceipts/${id}/clone`,
  NOTES: (id) => `/api/v1/InventoryReceipts/${id}/notes`,
  STATUS_OPTIONS: '/api/v1/InventoryReceipts/status',
}



