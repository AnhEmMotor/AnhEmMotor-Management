export const priceApi = {
  async getProducts({ page, itemsPerPage, search, statusIds }) {
    const { data, error } = await supabase.rpc('get_product_variant_prices', {
      p_page: page,
      p_items_per_page: itemsPerPage,
      p_search: search,
      p_status_ids: statusIds,
    })

    if (error) {
      console.error('Error fetching products:', error)
      throw error
    }

    return data
  },

  async updateVariantPrice(variantId, newPrice) {
    const { data, error } = await supabase
      .from('product_variants')
      .update({ price: newPrice })
      .eq('id', variantId)
      .select()
      .single()

    if (error) {
      console.error('Error updating variant price:', error)
      throw error
    }

    return data
  },
}
