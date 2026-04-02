const roleMapper = {
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

  toList(data) {
    if (!data || !data.items) return []
    return data.items.map((item) => this.toModel(item))
  },

  toPagination(data) {
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

    if (query.search) {
      params.filters = `Name@=${query.search},Description@=${query.search}`
    }

    return params
  },

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

  resolveTogglePermission(currentPermissions, permissionId, structure) {
    let permissions = [...currentPermissions]
    const isSelected = permissions.includes(permissionId)

    if (isSelected) {
      permissions = this._uncheckWithDependents(permissions, permissionId, structure.dependencies)
    } else {
      permissions = this._checkWithRules(permissions, permissionId, structure)
    }

    return permissions
  },

  resolveSelectAllInCategory(currentPermissions, categoryPermissions, structure) {
    let permissions = [...currentPermissions]
    const allSelected = categoryPermissions.every((p) => permissions.includes(p.id))

    if (allSelected) {
      categoryPermissions.forEach((p) => {
        permissions = this._uncheckWithDependents(permissions, p.id, structure.dependencies)
      })
    } else {
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

    const deps = structure.dependencies[permissionId] || []
    deps.forEach((depId) => {
      permissions = this._checkWithRules(permissions, depId, structure)
    })

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

    permissions.forEach((selectedId) => {
      const deps = dependenciesMap[selectedId] || []
      if (deps.includes(permissionId)) {
        permissions = this._uncheckWithDependents(permissions, selectedId, dependenciesMap)
      }
    })

    return permissions
  },

  toCreatePayload(roleData) {
    return {
      roleName: roleData.name,
      permissions: roleData.permissions,
    }
  },

  toUpdatePayload(roleData) {
    return {
      roleName: roleData.name,
      permissions: roleData.permissions,
    }
  },
}

export default roleMapper
