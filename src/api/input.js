import { supabase } from '@/lib/supabaseClient'

export const fetchInputs = async ({ page, itemsPerPage, statusFilters, search }) => {
  const { data, error } = await supabase.rpc('get_input_receipts', {
    p_page: page,
    p_items_per_page: itemsPerPage,
    p_status_ids: statusFilters,
    p_search: search,
  })

  if (error) throw error
  return data
}

export const saveReceipt = async ({
  id,
  supplier,
  products,
  notes,
  status_id,
  user_name,
  import_date,
  paid,
}) => {
  const p_products = products.map((p) => ({
    code: p.code,
    name: p.name,
    quantity: Number(p.quantity) || 0,
    unitPrice: Number(p.unitPrice) || 0,
  }))

  const { data, error } = await supabase.rpc('save_input_receipt', {
    p_input_id: id || null,
    p_supplier_id: supplier.id,
    p_status_id: status_id,
    p_name_verify: user_name,
    p_import_date: import_date,
    p_notes: notes,
    p_paid: paid,
    p_products: p_products,
  })

  if (error) throw error
  return data
}

export const updateInputStatus = async (id, status_id) => {
  const { data, error } = await supabase
    .from('input')
    .update({ status_id: status_id })
    .eq('id', id)
    .select(
      `
      id,
      input_status:status_id(id, name)
    `,
    )
    .single()

  if (error) throw error
  return data
}

export const updateInput = async (id, updates) => {
  const { data, error } = await supabase
    .from('input')
    .update(updates)
    .eq('id', id)
    .select(
      `
      *,
      supplier:supplier_id(*),
      input_status:status_id(id, name)
    `,
    )
    .single()

  if (error) {
    console.error('Lỗi khi updateInput:', error)
    throw error
  }
  return data
}
