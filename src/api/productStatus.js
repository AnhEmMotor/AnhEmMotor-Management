// import { supabase } from '@/lib/supabaseClient'
// TODO: Refactor to use VITE_API_URL

export const getAllProductStatuses = async () => {
  const { data, error } = await supabase.from('product_status').select('*');
  if (error) throw error;
  return data;
};

export const getProductStatusById = async (id) => {
  const { data, error } = await supabase.from('product_status').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createProductStatus = async (status) => {
  const { data, error } = await supabase.from('product_status').insert(status).select().single();
  if (error) throw error;
  return data;
};

export const updateProductStatus = async (id, status) => {
  const { data, error } = await supabase.from('product_status').update(status).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteProductStatus = async (id) => {
  const { data, error } = await supabase.from('product_status').delete().eq('id', id);
  if (error) throw error;
  return data;
};
