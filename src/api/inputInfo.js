import { supabase } from '@/lib/supabaseClient';

export const getAllInputInfos = async () => {
  const { data, error } = await supabase.from('input_info').select(`
    *,
    input:input_id(*),
    product_variants:product_code(*)
  `);
  if (error) throw error;
  return data;
};

export const getInputInfoById = async (id) => {
  const { data, error } = await supabase.from('input_info').select(`
    *,
    input:input_id(*),
    product_variants:product_code(*)
  `).eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createInputInfo = async (info) => {
  const { data, error } = await supabase.from('input_info').insert(info).select().single();
  if (error) throw error;
  return data;
};

export const updateInputInfo = async (id, info) => {
  const { data, error } = await supabase.from('input_info').update(info).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteInputInfo = async (id) => {
  const { data, error } = await supabase.from('input_info').delete().eq('id', id);
  if (error) throw error;
  return data;
};
