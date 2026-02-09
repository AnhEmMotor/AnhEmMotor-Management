// import { supabase } from '@/lib/supabaseClient'
// TODO: Refactor to use VITE_API_URL

export const getAllBrands = async () => {
  const { data, error } = await supabase.from('brand').select('*')
  if (error) throw error
  return data
}

export const getBrandById = async (id) => {
  const { data, error } = await supabase.from('brand').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export const createBrand = async (brand) => {
  const { data, error } = await supabase.from('brand').insert(brand).select().single()
  if (error) throw error
  return data
}

export const updateBrand = async (id, brand) => {
  const { data, error } = await supabase.from('brand').update(brand).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const deleteBrand = async (id) => {
  const { data, error } = await supabase.from('brand').delete().eq('id', id)
  if (error) throw error
  return data
}
