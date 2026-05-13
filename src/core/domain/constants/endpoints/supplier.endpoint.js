export const SUPPLIER_ENDPOINTS = {
  BASE: '/api/v1/supplier',
  BY_ID: (id) => `/api/v1/supplier/${id}`,
  STATUS: (id) => `/api/v1/supplier/${id}/status`,
  PURCHASE_HISTORY: (id) => `/api/v1/supplier/${id}/purchase-history`,
}



