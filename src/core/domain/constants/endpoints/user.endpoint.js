export const USER_ENDPOINTS = {
  BASE: '/api/v1/UserManager',
  FOR_OUTPUT: '/api/v1/UserManager/for-output',
  BY_ID: (id) => `/api/v1/UserManager/${id}`,
  STATUS: (id) => `/api/v1/UserManager/${id}/status`,
  STATUS_BATCH: '/api/v1/UserManager/status',
  AVATAR: (id) => `/api/v1/UserManager/${id}/avatar`,
  CHANGE_PASSWORD: (id) => `/api/v1/UserManager/${id}/change-password`,
  ASSIGN_ROLES: (id) => `/api/v1/UserManager/${id}/assign-roles`,
  MY_PROFILE: '/api/v1/user/me',
  MY_PASSWORD: '/api/v1/user/change-password',
  MY_AVATAR: '/api/v1/user/upload-avatar',
}



