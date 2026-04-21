const productMapper = {
  toParams(query) {
    const { page, limit, search, inventoryStatus, sort, brand_id, category_id, optionValueIds } = query || {}
    const params = {
      Page: page,
      PageSize: limit,
    }

    let filterParts = []
    if (search) filterParts.push(`search@=*${search}`)
    if (inventoryStatus) filterParts.push(`inventoryStatus==${inventoryStatus}`)
    if (brand_id) filterParts.push(`BrandId==${brand_id}`)
    if (category_id) filterParts.push(`CategoryId==${category_id}`)
    if (optionValueIds) filterParts.push(`optionValueIds==${optionValueIds}`)

    if (filterParts.length > 0) {
      params.Filters = filterParts.join(',')
    }

    if (sort) {
      params.Sorts = sort
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

  getFirstImageUrl(urls) {
    if (!urls) return null
    return urls.split(',')[0].trim()
  },

  toVariantModel(v) {
    if (!v) return null
    return {
      id: v.id,
      price: v.price || v.unitPrice || 0,
      url: v.url || v.urlSlug || '',
      cover_image_url: this.getFirstImageUrl(v.coverImageUrl || v.cover_image_url) || null,
      photo_collection: v.photoCollection || v.photo_collection || [],
      optionValues: v.optionValues || {},
      stock: v.stock ?? v.stockQuantity ?? 0,
      has_been_booked: v.has_been_booked ?? v.hasBeenBooked ?? 0,
      inventory_status: v.inventoryStatus || v.inventory_status || 'OutOfStock',
      name: v.name || v.variantName || '',
      version_name: v.versionName || v.version_name || '',
      color_name: v.colorName || v.color_name || '',
      color_code: v.colorCode || v.color_code || '',
      colors: this.parseColors(v.colorName || v.color_name, v.colorCode || v.color_code, v.coverImageUrl || v.cover_image_url),
      sku: v.sku || '',
    }
  },

  parseColors(names, codes, images) {
    if (!names) return [{ name: '', code: '#000000', image: '' }]
    const nameList = names.split(',')
    const codeList = (codes || '').split(',')
    const imageList = (images || '').split(',')
    return nameList.map((name, i) => ({
      name: name.trim(),
      code: codeList[i]?.trim() || '#000000',
      image: imageList[i]?.trim() || '',
    }))
  },

  formatColors(colors) {
    if (!colors || colors.length === 0) return { name: '', code: '', image: '' }
    return {
      name: colors.map((c) => c.name.trim()).join(','),
      code: colors.map((c) => c.code.trim()).join(','),
      image: colors.map((c) => c.image?.trim() || '').join(','),
    }
  },

  toModel(item) {
    if (!item) return null
    return {
      id: item.id,
      name: item.name || '',
      category: item.category || item.categoryName || '',
      category_id: item.categoryId || item.category_id || null,
      brand: item.brand || item.brandName || '',
      brand_id: item.brandId || item.brand_id || null,
      description: item.description || '',
      short_description: item.shortDescription || item.short_description || '',
      meta_title: item.metaTitle || item.meta_title || '',
      meta_description: item.metaDescription || item.meta_description || '',
      weight: item.weight ?? null,
      dimensions: item.dimensions || '',
      wheelbase: item.wheelbase ?? null,
      seat_height: item.seatHeight ?? item.seat_height ?? null,
      ground_clearance: item.groundClearance ?? item.ground_clearance ?? null,
      fuel_capacity: item.fuelCapacity ?? item.fuel_capacity ?? null,
      tire_size: item.tireSize || item.tire_size || '',
      front_suspension: item.frontSuspension || item.front_suspension || '',
      rear_suspension: item.rearSuspension || item.rear_suspension || '',
      engine_type: item.engineType || item.engine_type || '',
      max_power: item.maxPower || item.max_power || '',
      oil_capacity: item.oilCapacity ?? item.oil_capacity ?? null,
      fuel_consumption: item.fuelConsumption || item.fuel_consumption || '',
      transmission_type: item.transmissionType || item.transmission_type || '',
      starter_system: item.starterSystem || item.starter_system || '',
      max_torque: item.maxTorque || item.max_torque || '',
      displacement: item.displacement ?? null,
      bore_stroke: item.boreStroke || item.bore_stroke || '',
      compression_ratio: item.compressionRatio || item.compression_ratio || '',
      inventory_status: item.inventoryStatus || item.inventory_status || 'OutOfStock',
      cover_image_url: this.getFirstImageUrl(item.coverImageUrl || item.cover_image_url) || null,
      highlights: item.highlights || null,
      variants: (item.variants || []).map((v) => this.toVariantModel(v)),
    }
  },

  toDTO(model) {
    if (!model) return null

    // Helper to convert empty strings or invalid numbers to null
    const toNumOrNull = (val) => (val === '' || val === null || val === undefined ? null : Number(val))

    return {
      id: model.id || 0,
      name: model.name || '',
      category_id: toNumOrNull(model.category_id),
      brand_id: toNumOrNull(model.brand_id),
      description: model.description || '',
      short_description: model.short_description || '',
      meta_title: model.meta_title || '',
      meta_description: model.meta_description || '',
      weight: toNumOrNull(model.weight),
      dimensions: model.dimensions || '',
      wheelbase: toNumOrNull(model.wheelbase),
      seat_height: toNumOrNull(model.seat_height),
      ground_clearance: toNumOrNull(model.ground_clearance),
      fuel_capacity: toNumOrNull(model.fuel_capacity),
      tire_size: model.tire_size || '',
      front_suspension: model.front_suspension || '',
      rear_suspension: model.rear_suspension || '',
      engine_type: model.engine_type || '',
      max_power: model.max_power || '',
      oil_capacity: toNumOrNull(model.oil_capacity),
      fuel_consumption: model.fuel_consumption || '',
      transmission_type: model.transmission_type || '',
      starter_system: model.starter_system || '',
      max_torque: model.max_torque || '',
      displacement: toNumOrNull(model.displacement),
      bore_stroke: model.bore_stroke || '',
      compression_ratio: model.compression_ratio || '',
      statusId: model.status_id || 'for-sale',
      highlights: model.highlights || null,

      variants: (model.variants || []).map((v) => ({
        id: v.id || null,
        price: toNumOrNull(v.price),
        url: v.url || '',
        cover_image_url: this.formatColors(v.colors).image || null,
        photo_collection: v.photo_collection || [],
        optionValues: v.optionValues || {},
        version_name: v.version_name || '',
        color_name: this.formatColors(v.colors).name,
        color_code: this.formatColors(v.colors).code,
        sku: v.sku || '',
      })),
    }
  },

  toList(data) {
    const unwrapped = data?.data || data
    const items = unwrapped?.items || (Array.isArray(unwrapped) ? unwrapped : [])
    return items.map((item) => this.toModel(item))
  },
}

export default productMapper


