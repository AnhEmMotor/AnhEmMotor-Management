import { supabase } from '@/lib/supabaseClient';

export const getAllInputs = async () => {
  const { data, error } = await supabase.from('input').select(`
    *,
    supplier:supplier_id(*),
    input_status:status_id(*)
  `);
  if (error) throw error;
  return data;
};

export const getInputById = async (id) => {
  const { data, error } = await supabase.from('input').select(`
    *,
    supplier:supplier_id(*),
    input_status:status_id(*)
  `).eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createInput = async (input) => {
  const { data, error } = await supabase.from('input').insert(input).select().single();
  if (error) throw error;
  return data;
};

export const updateInput = async (id, input) => {
  const { data, error } = await supabase.from('input').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteInput = async (id) => {
  const { data, error } = await supabase.from('input').delete().eq('id', id);
  if (error) throw error;
  return data;
};
