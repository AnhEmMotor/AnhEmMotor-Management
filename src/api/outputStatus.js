// import { supabase } from '@/lib/supabaseClient'
// TODO: Refactor to use VITE_API_URL

export const getAllOutputStatuses = async () => {
  const { data, error } = await supabase.from('output_status').select('*');
  if (error) throw error;
  return data;
};

export const getOutputStatusById = async (id) => {
  const { data, error } = await supabase.from('output_status').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createOutputStatus = async (status) => {
  const { data, error } = await supabase.from('output_status').insert(status).select().single();
  if (error) throw error;
  return data;
};

export const updateOutputStatus = async (id, status) => {
  const { data, error } = await supabase.from('output_status').update(status).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteOutputStatus = async (id) => {
  const { data, error } = await supabase.from('output_status').delete().eq('id', id);
  if (error) throw error;
  return data;
};
