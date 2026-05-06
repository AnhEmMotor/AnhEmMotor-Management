const categoryMapper = {
  toParams(query) {
    const { page, limit, search } = query || {}
    const params = {
      Page: page,
      PageSize: limit,
    }

    if (search) {
      params.Filters = `name@=*${search}`
    }

    return params
  },

  toPagination(data) {
    const unwrapped = data?.data || data
    return {
      totalPages: unwrapped.totalPages || 1,
      totalCount: unwrapped.totalCount || 0,
    }
  },

  toModel(item) {
    if (!item) return null
    return {
      id: item.id,
      name: item.name || '',
      slug: item.slug || '',
      imageUrl: item.imageUrl || '',
      isActive: item.isActive ?? true,
      sortOrder: item.sortOrder || 0,
      parentId: item.parentId || null,
      productCount: item.productCount || 0,
      description: item.description || '',
    }
  },

  toDTO(model) {
    if (!model) return null
    return {
      id: model.id,
      name: model.name,
      slug: model.slug,
      imageUrl: model.imageUrl,
      isActive: model.isActive,
      sortOrder: model.sortOrder,
      parentId: model.parentId,
      description: model.description,
    }
  },

  toList(data) {
    const unwrapped = data?.data || data
    const items = unwrapped?.items || (Array.isArray(unwrapped) ? unwrapped : [])
    return items.map((item) => this.toModel(item))
  },
}

export default categoryMapper



