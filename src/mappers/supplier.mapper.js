export const supplierMapper = {
  toModel(dto) {
    if (!dto) return null
    return {
      id: dto.id,
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      address: dto.address,
      ward: dto.ward,
      cityDistrict: dto.cityDistrict || dto.city_district,
      taxIdentificationNumber: dto.taxIdentificationNumber || dto.tax_identification_number,
      notes: dto.notes,
      statusId: dto.statusId || dto.status_id,
      totalInput: dto.totalInput || dto.total_input || 0,
      createdAt: dto.createdAt || dto.created_at,
      updatedAt: dto.updatedAt || dto.updated_at,
    }
  },

  toList(dtos) {
    if (!Array.isArray(dtos)) return []
    return dtos.map((item) => this.toModel(item))
  },

  toDTO(model) {
    if (!model) return null
    return {
      name: model.name,
      phone: model.phone,
      email: model.email,
      address: model.address,
      ward: model.ward,
      cityDistrict: model.cityDistrict,
      taxIdentificationNumber: model.taxIdentificationNumber,
      notes: model.notes,
      statusId: model.statusId,
    }
  },

  toParams(query) {
    const params = {
      Page: query.page || 1,
      PageSize: query.limit || 10,
    }

    const filters = []
    if (query.search) {
      filters.push(`Name@=${query.search}`)
    }
    if (query.status) {
      const statusArray = Array.isArray(query.status) ? query.status : [query.status]
      const validStatuses = statusArray.filter((s) => s && s !== 'all')
      if (validStatuses.length === 1) {
        filters.push(`StatusId==${validStatuses[0]}`)
      }
    }

    if (filters.length > 0) {
      params.filters = filters.join(',')
    }

    return params
  },
}
