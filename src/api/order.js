export const fetchOrders = async (params) => {
  const { page, itemsPerPage, status_ids, search } = params

  const { data, error } = await supabase.rpc('get_all_orders', {
    p_page: page,
    p_items_per_page: itemsPerPage,
    p_status_ids: status_ids,
    p_search: search,
  })

  if (error) {
    console.error('[API Error] fetchOrders:', error)
    throw error
  }
  return data
}

export const saveOrder = async (payload) => {
  const { id, customerName, notes, status, products } = payload

  const formattedProducts = products.map((p) => ({
    product_id: p.product_id || p.id,
    count: p.quantity,
    price: p.unitPrice,
    cost_price: p.costPrice || 0,
  }))

  const { data, error } = await supabase.rpc('save_order', {
    p_order_id: id || null,
    p_customer_name: customerName,
    p_notes: notes,
    p_status_id: status.key,
    p_products: formattedProducts,
  })

  if (error) {
    console.error('[API Error] saveOrder:', error)
    throw error
  }
  return data
}

export const fetchProductVariants = async (params) => {
  const { data, error } = await supabase.rpc('get_all_variants_lite', params)

  if (error) {
    console.error('[API Error] fetchProductVariants:', error)
    throw error
  }
  return data
}

export const fetchOutputStatuses = async () => {
  const { data, error } = await supabase.from('output_status').select('*')
  if (error) {
    console.error('[API Error] fetchOutputStatuses:', error)
    throw error
  }
  return data
}
