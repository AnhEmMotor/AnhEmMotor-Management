export const inputMapper = {
  toModel(dto) {
    if (!dto) return null
    return {
      id: dto.id,
      supplierName: dto.supplierName || '',
      totalPayable: dto.totalPayable || 0,
      supplier: dto.supplierId
        ? {
            id: dto.supplierId,
            name: dto.supplierName || '',
            phone: dto.supplierPhone || '',
            email: dto.supplierEmail || '',
          }
        : null,
      products: (dto.products || dto.details || []).map((p) => ({
        id: p.id || Date.now() + Math.random(),
        variantId: p.productId || p.variantId,
        code: p.variantCode || p.code || '',
        name: p.productName || p.name || p.variantName || '',
        quantity: p.quantity || p.count || 0,
        unitPrice: p.unitPrice || p.inputPrice || 0,
        discount: p.discount || 0,
        importPrice: p.importPrice || 0,
        total: p.total || (p.quantity || p.count || 0) * (p.unitPrice || p.inputPrice || 0),
      })),
      notes: dto.notes || '',
      statusId: dto.statusId,
      createdAt: dto.createdAt || dto.created_at,
    }
  },

  toList(dtos) {
    if (!Array.isArray(dtos)) return []
    return dtos.map((item) => this.toModel(item))
  },

  toDTO(model, statusId) {
    if (!model) return null
    return {
      supplierId: model.supplier?.id,
      statusId: statusId || model.statusId,
      notes: model.notes,
      products: (model.products || []).map((p) => ({
        productId: p.variantId,
        count: Number(p.quantity),
        inputPrice: Number(p.unitPrice),
      })),
    }
  },

  toParams(query) {
    const params = {
      Page: query.page || 1,
      PageSize: query.limit || 15,
    }

    const filters = []
    if (query.search) {
      const s = query.search
      if (!isNaN(s) && !isNaN(parseFloat(s))) {
        filters.push(`(Id==${s}|SupplierName@=${s})`)
      } else {
        filters.push(`SupplierName@=${s}`)
      }
    }

    if (query.status) {
      filters.push(`StatusId==${query.status}`)
    }

    if (filters.length > 0) {
      params.filters = filters.join(',')
    }

    return params
  },
}
