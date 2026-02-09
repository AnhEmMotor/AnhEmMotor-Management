export const getAllProductCategories = async () => {
  const { data, error } = await supabase.from('product_category').select('*')
  if (error) throw error
  return data
}

export const getProductCategoryById = async (id) => {
  const { data, error } = await supabase.from('product_category').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export const createProductCategory = async (category) => {
  const { data, error } = await supabase.from('product_category').insert(category).select().single()
  if (error) throw error
  return data
}

export const updateProductCategory = async (id, category) => {
  const { data, error } = await supabase
    .from('product_category')
    .update(category)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteProductCategory = async (id) => {
  const { data, error } = await supabase.from('product_category').delete().eq('id', id)
  if (error) throw error
  return data
}
