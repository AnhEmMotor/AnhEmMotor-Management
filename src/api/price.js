import { supabase } from '@/lib/supabaseClient';

export const getAllPrices = async () => {
  const { data, error } = await supabase.from('price').select(`
    *,
    product_variants:product_id(*)
  `);
  if (error) throw error;
  return data;
};

export const getPriceById = async (id) => {
  const { data, error } = await supabase.from('price').select(`
    *,
    product_variants:product_id(*)
  `).eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createPrice = async (price) => {
  const { data, error } = await supabase.from('price').insert(price).select().single();
  if (error) throw error;
  return data;
};

export const updatePrice = async (id, price) => {
  const { data, error } = await supabase.from('price').update(price).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deletePrice = async (id) => {
  const { data, error } = await supabase.from('price').delete().eq('id', id);
  if (error) throw error;
  return data;
};
