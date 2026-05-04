const userMapper = {
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
      roles: (dto.roles || []).map((r) => {
        if (typeof r === 'string') return { id: r, name: '' }
        return { id: r.id, name: r.name }
      }),
      permissions: dto.permissions || [],
    }
  },

  toDTO(model) {
    if (!model) return {}
    return {
      fullName: model.fullName || '',
      gender: model.gender || '',
      phoneNumber: model.phoneNumber || '',
      dateOfBirth: model.dateOfBirth || null,
    }
  },

  toList(data) {
    if (!data || !data.items) return []
    return data.items.map((item) => this.toModel(item))
  },

  toPagination(data) {
    if (!data) return { totalPages: 0, totalCount: 0 }
    return {
      totalPages: data.totalPages || 0,
      totalCount: data.totalCount || 0,
    }
  },

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

  toStatusPayload(status) {
    return { status }
  },

  toRolesPayload(roleIds) {
    return { roleIds }
  },

  toAvatarPayload(file) {
    if (!file) return null
    const formData = new FormData()
    formData.append('file', file)
    return formData
  },

  toResetPasswordPayload(payload) {
    return {
      newPassword: payload.newPassword || '',
    }
  },

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
