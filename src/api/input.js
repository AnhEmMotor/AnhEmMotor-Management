import { supabase } from '@/lib/supabaseClient'

export const getAllInputs = async () => {
  const { data, error } = await supabase.from('input').select(`
    *,
    supplier:supplier_id(*),
    input_status:status_id(*)
  `)
  if (error) throw error
  return data
}

export const getAllInputBySupplierID = async (
  supplierId,
  page = 1,
  itemsPerPage = 10,
  statusFilters = [],
  search = '',
) => {
  if (!supplierId) {
    throw new Error('supplierId là bắt buộc')
  }
  let query = supabase
    .from('input')
    .select('id, input_date , created_at, name_verify, status_id, input_info(count, input_price)', {
      count: 'exact',
    })
    .eq('supplier_id', supplierId)
  const statusParam =
    Array.isArray(statusFilters) && statusFilters.length > 0 ? statusFilters : null
  if (statusParam) {
    query = query.in('status_id', statusParam)
  }
  const searchParam = search ? String(search).trim() : null
  if (searchParam) {
    query = query.ilike('name_verify', `%${searchParam}%`)
  }
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1
  query = query.range(from, to).order('created_at', { ascending: false })
  const { data, error, count } = await query
  if (error) {
    throw error
  }
  const inputs = data || []
  const normalizedInputs = inputs.map((input) => {
    const total = (input.input_info || []).reduce((sum, detail) => {
      const lineTotal = (detail.count || 0) * (detail.input_price || 0)
      return sum + lineTotal
    }, 0)
    // eslint-disable-next-line no-unused-vars
    const { input_details, ...rest } = input
    return {
      ...rest,
      total: total,
    }
  })
  return { inputs: normalizedInputs, count: count || 0 }
}

export const getInputById = async (id) => {
  const { data, error } = await supabase
    .from('input')
    .select(
      `
    *,
    supplier:supplier_id(*),
    input_status:status_id(*)
  `,
    )
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const createInput = async (input) => {
  const { data, error } = await supabase.from('input').insert(input).select().single()
  if (error) throw error
  return data
}

export const updateInput = async (id, input) => {
  const { data, error } = await supabase.from('input').update(input).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const deleteInput = async (id) => {
  const { data, error } = await supabase.from('input').delete().eq('id', id)
  if (error) throw error
  return data
}
