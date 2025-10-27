import { supabase } from '@/lib/supabaseClient'

export const getAllOptions = async () => {
  const { data, error } = await supabase
    .from('options')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

export const getOptionById = async (id) => {
  const { data, error } = await supabase.from('options').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export const createOption = async (option) => {
  const { data, error } = await supabase.from('options').insert(option).select().single()
  if (error) throw error
  return data
}

export const updateOption = async (id, option) => {
  const { data, error } = await supabase
    .from('options')
    .update(option)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteOption = async (id) => {
  const { data, error } = await supabase.from('options').delete().eq('id', id)
  if (error) throw error
  return data
}
