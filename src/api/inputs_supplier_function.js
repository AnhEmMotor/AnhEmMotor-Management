export const fetchInputsBySupplier = async ({
  supplierId,
  page,
  itemsPerPage,
  statusFilters,
  search,
}) => {
  if (!supplierId) {
    throw new Error('supplierId là bắt buộc')
  }

  const { data, error } = await supabase.rpc('get_inputs_by_supplier', {
    p_supplier_id: supplierId,
    p_page: page,
    p_items_per_page: itemsPerPage,
    p_status_ids: statusFilters,
    p_search: search,
  })

  if (error) {
    console.error('Error fetching inputs by supplier:', error)
    throw error
  }

  return data
}
