export const SALES_ORDER_ENDPOINTS = {
  BASE: '/api/v1/SalesOrders',
  BY_ID: (id) => `/api/v1/SalesOrders/${id}`,
  BY_MANAGER: '/api/v1/SalesOrders/by-manager',
  FOR_MANAGER: (id) => `/api/v1/SalesOrders/for-manager/${id}`,
  STATUS: (id) => `/api/v1/SalesOrders/${id}/status`,
  STATUS_LIST: '/api/v1/SalesOrders/status',
  STATUS_MAP: '/api/v1/SalesOrders/status-map',
  TRANSITION_MAP: '/api/v1/SalesOrders/transition-map',
  LOCKED_STATUSES: '/api/v1/SalesOrders/locked-statuses',
}


