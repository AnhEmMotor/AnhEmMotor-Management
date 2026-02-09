export const getAllOptionValues = async () => {
  const { data, error } = await supabase
    .from('option_values')
    .select(
      `
    *,
    option:options ( name )
  `,
    )
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

export const getOptionValuesByOptionId = async (optionId) => {
  const { data, error } = await supabase
    .from('option_values')
    .select('*')
    .eq('option_id', optionId)
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

export const getOptionValueById = async (id) => {
  const { data, error } = await supabase.from('option_values').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export const createOptionValue = async (optionValue) => {
  const { data, error } = await supabase.from('option_values').insert(optionValue).select().single()
  if (error) throw error
  return data
}

export const updateOptionValue = async (id, optionValue) => {
  const { data, error } = await supabase
    .from('option_values')
    .update(optionValue)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteOptionValue = async (id) => {
  const { data, error } = await supabase.from('option_values').delete().eq('id', id)
  if (error) throw error
  return data
}
