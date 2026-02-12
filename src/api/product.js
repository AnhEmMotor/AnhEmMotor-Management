export const getProducts = async ({
  page = 1,
  itemsPerPage = 1000,
  search = '',
  statusIds = [],
}) => {
  const { data, error } = await supabase.rpc('get_all_products_with_details', {
    p_page: page,
    p_items_per_page: itemsPerPage,
    p_search: search,
    p_status_ids: statusIds,
  })

  if (error) {
    throw error
  }

  return data || []
}

export const upsertProduct = async (productData) => {
  const { data, error } = await supabase.rpc('upsert_product_with_variants', {
    p_product_data: productData,
  })

  if (error) {
    throw error
  }

  return data
}

export const deleteProduct = async (productId) => {
  const { error } = await supabase.rpc('delete_product_cascade', {
    p_product_id: productId,
  })

  if (error) {
    throw error
  }

  return true
}

export const searchProductsFlatType = async (search) => {
  const { data, error } = await supabase.rpc('get_all_variants_lite', {
    p_page: 1,
    p_items_per_page: 20,
    p_search: search,
    p_status_ids: null,
  })

  if (error) {
    throw error
  }

  if (data && data.products) {
    return data.products
  }
  return []
}
