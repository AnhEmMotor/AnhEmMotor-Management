import { supabase } from '@/lib/supabaseClient';

export const getAllSuppliers = async () => {
  const { data, error } = await supabase.from('supplier').select('*');
  if (error) throw error;
  return data;
};

export const getSupplierById = async (id) => {
  const { data, error } = await supabase.from('supplier').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createSupplier = async (supplier) => {
  const { data, error } = await supabase.from('supplier').insert(supplier).select().single();
  if (error) throw error;
  return data;
};

export const updateSupplier = async (id, supplier) => {
  const { data, error } = await supabase.from('supplier').update(supplier).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteSupplier = async (id) => {
  const { data, error } = await supabase.from('supplier').delete().eq('id', id);
  if (error) throw error;
  return data;
};
