export const getAllProductVariants = async () => {
  const { data, error } = await supabase.from('product_variants').select(`
    *,
    product:product_id(*)
  `);
  if (error) throw error;
  return data;
};

export const getProductVariantById = async (id) => {
  const { data, error } = await supabase.from('product_variants').select(`
    *,
    product:product_id(*)
  `).eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createProductVariant = async (variant) => {
  const { data, error } = await supabase.from('product_variants').insert(variant).select().single();
  if (error) throw error;
  return data;
};

export const updateProductVariant = async (id, variant) => {
  const { data, error } = await supabase.from('product_variants').update(variant).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteProductVariant = async (id) => {
  const { data, error } = await supabase.from('product_variants').delete().eq('id', id);
  if (error) throw error;
  return data;
};
