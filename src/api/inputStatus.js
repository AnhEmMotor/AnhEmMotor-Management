import { supabase } from '@/lib/supabaseClient';

export const getAllInputStatuses = async () => {
  const { data, error } = await supabase.from('input_status').select('*');
  if (error) throw error;
  return data;
};

export const getInputStatusById = async (id) => {
  const { data, error } = await supabase.from('input_status').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createInputStatus = async (status) => {
  const { data, error } = await supabase.from('input_status').insert(status).select().single();
  if (error) throw error;
  return data;
};

export const updateInputStatus = async (id, status) => {
  const { data, error } = await supabase.from('input_status').update(status).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteInputStatus = async (id) => {
  const { data, error } = await supabase.from('input_status').delete().eq('id', id);
  if (error) throw error;
  return data;
};
