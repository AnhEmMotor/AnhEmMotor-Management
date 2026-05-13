export const PRODUCT_ENDPOINTS = {
  BASE: '/api/v1/product',
  FOR_MANAGER: '/api/v1/product/for-manager',
  FOR_PRICE_MANAGEMENT: '/api/v1/product/for-price-management',
  DELETED: '/api/v1/product/deleted',
  BY_ID: (id) => `/api/v1/product/${id}/for-manager`,
  UPDATE_BY_ID: (id) => `/api/v1/product/${id}`,
  RESTORE: (id) => `/api/v1/product/restore/${id}`,
  STATUS: (id) => `/api/v1/product/${id}/status`,
  PRICE: (id) => `/api/v1/product/${id}/price`,
  VARIANT_PRICE: (id) => `/api/v1/product/variant/${id}/price`,
  CHECK_SLUG: '/api/v1/product/check-slug',
  VARIANTS_LITE: {
    FOR_MANAGER: '/api/v1/product/variants-lite/for-manager',
    FOR_INPUT: '/api/v1/product/variants-lite/for-input',
    FOR_OUTPUT: '/api/v1/product/variants-lite/for-output',
    BY_PRODUCT_ID: (id) => `/api/v1/product/${id}/variants-lite`,
  },
  DELETE_MANY: '/api/v1/product/delete-many',
}



