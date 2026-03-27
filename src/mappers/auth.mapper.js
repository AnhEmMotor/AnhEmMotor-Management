const authMapper = {
  /**
   * Chuyển đổi dữ liệu form đăng nhập sang DTO
   */
  toLoginDTO(form) {
    if (!form) return {}
    return {
      usernameOrEmail: form.usernameOrEmail?.trim() || '',
      password: form.password || '',
    }
  },

  /**
   * Chuyển đổi DTO từ server sang Model cho UI
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
      avatarUrl: dto.avatarUrl || '',
      permissions: dto.permissions || [],
      roles: dto.roles || [],
      isActive: dto.isActive ?? true,
    }
  },

  /**
   * Chuyển đổi Model chỉnh sửa sang DTO cập nhật profile
   */
  toUpdateProfileDTO(model) {
    if (!model) return {}
    return {
      fullName: model.fullName || '',
      gender: model.gender || '',
      phoneNumber: model.phoneNumber || '',
      dateOfBirth: model.dateOfBirth || null,
    }
  },

  /**
   * Đóng gói Avatar vào FormData
   */
  toAvatarPayload(file) {
    if (!file) return null
    const formData = new FormData()
    formData.append('file', file)
    return formData
  },

  /**
   * Đóng gói payload đổi mật khẩu (Self)
   */
  toChangePasswordDTO(form) {
    return {
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    }
  },
}

export default authMapper
