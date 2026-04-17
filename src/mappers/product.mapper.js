const productMapper = {
  toParams(query) {
    const { page, limit, search, inventoryStatus, sort } = query || {}
    const params = {
      Page: page,
      PageSize: limit,
    }

    let filterParts = []
    if (search) filterParts.push(`name@=*${search}`)
    if (inventoryStatus) filterParts.push(`inventoryStatus==${inventoryStatus}`)

    if (filterParts.length > 0) {
      params.Filters = filterParts.join(',')
    }

    if (sort) {
      params.Sorts = sort
    }

    return params
  },

  toPagination(data) {
    return {
      totalPages: data.totalPages || 1,
      totalCount: data.totalCount || 0,
    }
  },

  toVariantModel(v) {
    if (!v) return null
    return {
      id: v.id,
      price: v.price || v.unitPrice || 0,
      url: v.url || v.urlSlug || '',
      cover_image_url: v.coverImageUrl || v.cover_image_url || null,
      photo_collection: v.photoCollection || v.photo_collection || [],
      optionValues: v.optionValues || {},
      stock: v.stock ?? v.stockQuantity ?? 0,
      has_been_booked: v.has_been_booked ?? v.hasBeenBooked ?? 0,
      inventory_status: v.inventoryStatus || v.inventory_status || 'OutOfStock',
      name: v.name || v.variantName || '',
      version_name: v.versionName || v.version_name || '',
      color_name: v.colorName || v.color_name || '',
      color_code: v.colorCode || v.color_code || '',
      sku: v.sku || '',
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
      cover_image_url: item.coverImageUrl || item.cover_image_url || null,
      variants: (item.variants || []).map((v) => this.toVariantModel(v)),
    }
  },

  toDTO(model) {
    if (!model) return null
    return {
      id: model.id,
      name: model.name,
      category_id: model.category_id,
      brand_id: model.brand_id,
      description: model.description,
      short_description: model.short_description,
      meta_title: model.meta_title,
      meta_description: model.meta_description,
      weight: model.weight,
      dimensions: model.dimensions,
      wheelbase: model.wheelbase,
      seat_height: model.seat_height,
      ground_clearance: model.ground_clearance,
      fuel_capacity: model.fuel_capacity,
      tire_size: model.tire_size,
      front_suspension: model.front_suspension,
      rear_suspension: model.rear_suspension,
      engine_type: model.engine_type,
      max_power: model.max_power,
      oil_capacity: model.oil_capacity,
      fuel_consumption: model.fuel_consumption,
      transmission_type: model.transmission_type,
      starter_system: model.starter_system,
      max_torque: model.max_torque,
      displacement: model.displacement,
      bore_stroke: model.bore_stroke,
      compression_ratio: model.compression_ratio,
      status_id: model.status_id,

      variants: (model.variants || []).map((v) => ({
        id: v.id || null,
        price: v.price,
        url: v.url,
        cover_image_url: v.cover_image_url,
        photo_collection: v.photo_collection || [],
        optionValues: v.optionValues || {},
        version_name: v.version_name,
        color_name: v.color_name,
        color_code: v.color_code,
        sku: v.sku,
      })),

    }
  },

  toList(data) {
    const items = data.items || []
    return items.map((item) => this.toModel(item))
  },
}

export default productMapper
