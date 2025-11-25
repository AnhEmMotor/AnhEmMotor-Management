import { supabase } from '@/lib/supabaseClient';

export const getAllOutputs = async () => {
  const { data, error } = await supabase.from('output').select(`
    *,
    output_status:status_id(*)
  `);
  if (error) throw error;
  return data;
};

export const getOutputById = async (id) => {
  const { data, error } = await supabase.from('output').select(`
    *,
    output_status:status_id(*)
  `).eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createOutput = async (output) => {
  const { data, error } = await supabase.from('output').insert(output).select().single();
  if (error) throw error;
  return data;
};

export const updateOutput = async (id, output) => {
  const { data, error } = await supabase.from('output').update(output).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteOutput = async (id) => {
  const { data, error } = await supabase.from('output').delete().eq('id', id);
  if (error) throw error;
  return data;
};
