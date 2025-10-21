import { supabase } from '@/lib/supabaseClient';

export const getAllProducts = async () => {
  const { data, error } = await supabase.from('product').select(`
    *,
    brand:brand_id(*),
    product_category:category_id(*),
    product_status:status_id(*)
  `);
  if (error) throw error;
  return data;
};

export const getProductById = async (id) => {
  const { data, error } = await supabase.from('product').select(`
    *,
    brand:brand_id(*),
    product_category:category_id(*),
    product_status:status_id(*)
  `).eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createProduct = async (product) => {
  const { data, error } = await supabase.from('product').insert(product).select().single();
  if (error) throw error;
  return data;
};

export const updateProduct = async (id, product) => {
  const { data, error } = await supabase.from('product').update(product).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id) => {
  const { data, error } = await supabase.from('product').delete().eq('id', id);
  if (error) throw error;
  return data;
};
