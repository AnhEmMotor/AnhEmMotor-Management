const roleMapper = {
  /**
   * Ánh xạ Role từ DTO sang Model
   */
  toModel(dto) {
    if (!dto) return null
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description || '',
      permissionCount: dto.permissionCount || 0,
      permissions: dto.permissions || [],
    }
  },

  /**
   * Ánh xạ danh sách Role
   */
  toList(data) {
    if (!data || !data.items) return []
    return data.items.map((item) => this.toModel(item))
  },

  /**
   * Ánh xạ phân trang
   */
  toPagination(data) {
    return {
      totalPages: data.totalPages || 0,
      totalCount: data.totalCount || 0,
    }
  },

  /**
   * Ánh xạ tham số tìm kiếm
   */
  toParams(query) {
    const params = {
      Page: query.page || 1,
      PageSize: query.limit || 10,
    }

    if (query.search) {
      params.filters = `Name@=${query.search},Description@=${query.search}`
    }

    return params
  },

  /**
   * Ánh xạ cấu trúc quyền hạn
   */
  toPermissionStructure(data) {
    if (!data) return null
    const { groups, metadata, dependencies, conflicts } = data
    const list = []

    for (const [groupName, permIds] of Object.entries(groups || {})) {
      for (const permId of permIds) {
        const meta = (metadata || []).find((m) => m.id === permId)
        if (meta) {
          list.push({
            id: meta.id,
            name: meta.name,
            description: meta.description,
            category: groupName,
          })
        }
      }
    }

    return {
      list,
      groups: groups || {},
      dependencies: dependencies || {},
      conflicts: conflicts || {},
    }
  },

  /**
   * Logic xử lý chọn quyền với Dependency & Conflict
   */
  resolveTogglePermission(currentPermissions, permissionId, structure) {
    let permissions = [...currentPermissions]
    const isSelected = permissions.includes(permissionId)

    if (isSelected) {
      // 1. Nếu bỏ chọn: Bỏ luôn các quyền phụ thuộc vào nó
      permissions = this._uncheckWithDependents(permissions, permissionId, structure.dependencies)
    } else {
      // 2. Nếu chọn mới: Chọn luôn các quyền mà nó phụ thuộc vào & Bỏ các quyền xung đột
      permissions = this._checkWithRules(permissions, permissionId, structure)
    }

    return permissions
  },

  /**
   * Logic xử lý chọn tất cả quyền trong một Category
   */
  resolveSelectAllInCategory(currentPermissions, categoryPermissions, structure) {
    let permissions = [...currentPermissions]
    const allSelected = categoryPermissions.every((p) => permissions.includes(p.id))

    if (allSelected) {
      // Bỏ chọn tất cả
      categoryPermissions.forEach((p) => {
        permissions = this._uncheckWithDependents(permissions, p.id, structure.dependencies)
      })
    } else {
      // Chọn tất cả
      categoryPermissions.forEach((p) => {
        permissions = this._checkWithRules(permissions, p.id, structure)
      })
    }

    return permissions
  },

  _checkWithRules(permissions, permissionId, structure) {
    if (!permissions.includes(permissionId)) {
      permissions.push(permissionId)
    }

    // Xử lý Dependencies (những thứ mình cần)
    const deps = structure.dependencies[permissionId] || []
    deps.forEach((depId) => {
      permissions = this._checkWithRules(permissions, depId, structure)
    })

    // Xử lý Conflicts (những thứ cấm đi cùng mình)
    const conflicts = structure.conflicts[permissionId] || []
    conflicts.forEach((conflictId) => {
      permissions = this._uncheckWithDependents(permissions, conflictId, structure.dependencies)
    })

    return permissions
  },

  _uncheckWithDependents(permissions, permissionId, dependenciesMap) {
    const index = permissions.indexOf(permissionId)
    if (index > -1) {
      permissions.splice(index, 1)
    }

    // Tìm những quyền khác mà đang phụ thuộc vào quyền vừa bỏ
    permissions.forEach((selectedId) => {
      const deps = dependenciesMap[selectedId] || []
      if (deps.includes(permissionId)) {
        permissions = this._uncheckWithDependents(permissions, selectedId, dependenciesMap)
      }
    })

    return permissions
  },

  /**
   * Payload tạo mới
   */
  toCreatePayload(roleData) {
    return {
      roleName: roleData.name,
      permissions: roleData.permissions,
    }
  },

  /**
   * Payload cập nhật
   */
  toUpdatePayload(roleData) {
    return {
      roleName: roleData.name,
      permissions: roleData.permissions,
    }
  },
}

export default roleMapper
