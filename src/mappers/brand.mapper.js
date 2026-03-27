const brandMapper = {
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
    return {
      totalPages: data.totalPages || 1,
      totalCount: data.totalCount || 0,
    }
  },

  toModel(item) {
    if (!item) return null
    return {
      id: item.id,
      name: item.name || item.brand_name || '',
      description: item.description || item.brand_description || '',
    }
  },

  toDTO(model) {
    if (!model) return null
    return {
      id: model.id,
      name: model.name,
      description: model.description,
    }
  },

  toList(data) {
    const items = data.items || []
    return items.map((item) => this.toModel(item))
  },
}

export default brandMapper
