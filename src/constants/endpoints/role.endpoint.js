export const ROLE_ENDPOINTS = {
  BASE: '/api/v1/Permission',
  ROLES: '/api/v1/Permission/roles',
  ROLE_BY_ID: (id) => `/api/v1/Permission/roles/${encodeURIComponent(id)}`,
  ROLE_PERMISSIONS: (id) => `/api/v1/Permission/roles/${encodeURIComponent(id)}/permissions`,
  BATCH_DELETE: '/api/v1/Permission/roles/delete-multiple',
  STRUCTURE: '/api/v1/Permission/structure',
  USER_PERMISSIONS: (userId) => `/api/v1/Permission/users/${userId}/permissions`,
}


