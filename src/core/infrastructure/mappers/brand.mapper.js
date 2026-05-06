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
      name: item.name || item.brand_name || '',
      origin: item.origin || '',
      logoUrl: item.logoUrl || item.logo_url || '',
      description: item.description || item.brand_description || '',
    }
  },

  toDTO(model) {
    if (!model) return null
    return {
      id: model.id,
      name: model.name,
      origin: model.origin,
      logoUrl: model.logoUrl,
      description: model.description,
    }
  },

  toList(data) {
    const unwrapped = data?.data || data
    const items = unwrapped?.items || (Array.isArray(unwrapped) ? unwrapped : [])
    return items.map((item) => this.toModel(item))
  },
}

export default brandMapper



