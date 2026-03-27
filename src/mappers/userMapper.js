const userMapper = {
  /**
   * Ánh xạ danh sách từ DTO sang Model dùng cho UI
   * Hỗ trợ fallbacks cho các trường tên và quyền hạn tương tự AuthMapper
   */
  toModel(dto) {
    if (!dto) return null
    return {
      id: dto.id || '',
      userName: dto.userName || dto.username || '—',
      fullName: dto.fullName || dto.name || 'Người dùng',
      email: dto.email || '',
      phoneNumber: dto.phoneNumber || '',
      gender: dto.gender || '',
      dateOfBirth: dto.dateOfBirth || null,
      status: dto.status || 'Active',
      avatarUrl: dto.avatarUrl || '',
      roles: (dto.roles || []).map((r) => ({
        id: r.id,
        name: r.name,
      })),
      permissions: dto.permissions || [],
    }
  },

  /**
   * Ánh xạ Model sang DTO để gửi lên Server (Create/Update)
   */
  toDTO(model) {
    if (!model) return {}
    return {
      fullName: model.fullName || '',
      gender: model.gender || '',
      phoneNumber: model.phoneNumber || '',
      dateOfBirth: model.dateOfBirth || null,
    }
  },

  /**
   * Ánh xạ danh sách phân trang
   */
  toList(data) {
    if (!data || !data.items) return []
    return data.items.map((item) => this.toModel(item))
  },

  /**
   * Ánh xạ thông tin phân trang
   */
  toPagination(data) {
    if (!data) return { totalPages: 0, totalCount: 0 }
    return {
      totalPages: data.totalPages || 0,
      totalCount: data.totalCount || 0,
    }
  },

  /**
   * Ánh xạ tham số tìm kiếm/lọc sang Query Params (Sieve format)
   */
  toParams(query) {
    const params = {
      Page: query.page || 1,
      PageSize: query.limit || 10,
    }

    const filters = []
    if (query.status) {
      filters.push(`Status==${query.status}`)
    }

    if (query.search) {
      const s = query.search.trim()
      if (s.includes('@')) {
        filters.push(`Email@=${s}`)
      } else {
        filters.push(`FullName@=${s}|Email@=${s}|PhoneNumber@=${s}`)
      }
    }

    if (filters.length > 0) {
      params.filters = filters.join(',')
    }

    return params
  },

  /**
   * Đóng gói payload cho việc cập nhật trạng thái
   */
  toStatusPayload(status) {
    return { status }
  },

  /**
   * Đóng gói payload cho việc gán vai trò
   */
  toRolesPayload(roles) {
    return { roles }
  },

  /**
   * Đóng gói FormData cho việc tải lên ảnh đại diện
   */
  toAvatarPayload(file) {
    if (!file) return null
    const formData = new FormData()
    formData.append('file', file)
    return formData
  },

  /**
   * Đóng gói payload cho việc đặt lại mật khẩu bởi Admin
   */
  toResetPasswordPayload(payload) {
    return {
      newPassword: payload.newPassword || '',
    }
  },

  /**
   * Ánh xạ danh sách vai trò sang định dạng tùy chọn cho UI
   */
  toRoleOptions(roles) {
    if (!roles) return []
    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
    }))
  },
}

export default userMapper
