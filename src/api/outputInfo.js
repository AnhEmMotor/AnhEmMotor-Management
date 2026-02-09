export const getAllOutputInfos = async () => {
  const { data, error } = await supabase.from('output_info').select(`
    *,
    output:output_id(*),
    product_variants:product_id(*),
    input:input_id(*)
  `);
  if (error) throw error;
  return data;
};

export const getOutputInfoById = async (id) => {
  const { data, error } = await supabase.from('output_info').select(`
    *,
    output:output_id(*),
    product_variants:product_id(*),
    input:input_id(*)
  `).eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createOutputInfo = async (info) => {
  const { data, error } = await supabase.from('output_info').insert(info).select().single();
  if (error) throw error;
  return data;
};

export const updateOutputInfo = async (id, info) => {
  const { data, error } = await supabase.from('output_info').update(info).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteOutputInfo = async (id) => {
  const { data, error } = await supabase.from('output_info').delete().eq('id', id);
  if (error) throw error;
  return data;
};
