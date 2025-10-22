import { supabase } from '@/lib/supabaseClient'

// Helper: find status_id by name if a name is provided
const resolveStatusId = async (status) => {
  if (!status) return null
  if (typeof status === 'string' && status.match(/^[0-9a-fA-F-]{36,}$/)) return status
  const { data, error } = await supabase
    .from('supplier_status')
    .select('id')
    .eq('name', status)
    .maybeSingle()
  if (error) throw error
  return data?.id || null
}

export const getAllSuppliers = async () => {
  const { data, error } = await supabase
    .from('supplier')
    .select(
      `id, name, phone, email, address, notes, deleted_at, created_at, status:status_id(name)`,
    )
    .order('name', { ascending: true })
    .is('deleted_at', null)
  if (error) throw error
  return data
}

export const fetchSuppliers = async (
  page = 1,
  itemsPerPage = 10,
  statusFilters = [],
  search = '',
) => {
  console.log('Fetching suppliers with:', { page, itemsPerPage, statusFilters, search })
  const statusParam =
    Array.isArray(statusFilters) && statusFilters.length > 0 ? statusFilters : null
  const searchParam = search ? String(search).trim() : null
  const { data, error } = await supabase.rpc('get_suppliers_with_details', {
    p_page: page,
    p_items_per_page: itemsPerPage,
    p_status_ids: statusParam,
    p_search: searchParam,
  })
  if (error) {
    throw error
  }
  const suppliers = data || []
  const count = suppliers.length > 0 ? Number(suppliers[0].total_count) : 0
  const normalizedSuppliers = suppliers.map((s) => {
    // eslint-disable-next-line no-unused-vars
    const { total_count, ...rest } = s
    return rest
  })

  return { suppliers: normalizedSuppliers, count }
}

export const createSupplier = async (supplier) => {
  const payload = {
    name: supplier.name,
    phone: supplier.phone || null,
    email: supplier.email || null,
    address: supplier.address || null,
    notes: supplier.notes || null,
  }
  if (supplier.status) {
    const statusId = await resolveStatusId(supplier.status)
    if (statusId) payload.status_id = statusId
  }

  const { data, error } = await supabase
    .from('supplier')
    .insert(payload)
    .select(
      `id, name, phone, email, address, notes, deleted_at, created_at, status:status_id(name)`,
    )
    .single()
  if (error) throw error
  return data
}

export const updateSupplier = async (id, supplier) => {
  const payload = {
    name: supplier.name,
    phone: supplier.phone || null,
    email: supplier.email || null,
    address: supplier.address || null,
    notes: supplier.notes || null,
  }
  if (supplier.status) {
    const statusId = await resolveStatusId(supplier.status)
    if (statusId) payload.status_id = statusId
  }

  const { data, error } = await supabase
    .from('supplier')
    .update(payload)
    .eq('id', id)
    .select(
      `id, name, phone, email, address, notes, deleted_at, created_at, status:status_id(name)`,
    )
    .single()
  if (error) throw error
  return data
}

// Soft-delete: set deleted_at timestamp and return updated row
export const deleteSupplier = async (id) => {
  const payload = { deleted_at: new Date().toISOString() }
  const { data, error } = await supabase
    .from('supplier')
    .update(payload)
    .eq('id', id)
    .select(
      `id, name, phone, email, address, notes, deleted_at, created_at, status:status_id(name)`,
    )
    .single()
  if (error) throw error
  return data
}

export const restoreSupplier = async (id) => {
  const payload = { deleted_at: null }
  const { data, error } = await supabase
    .from('supplier')
    .update(payload)
    .eq('id', id)
    .select(
      `id, name, phone, email, address, notes, deleted_at, created_at, status:status_id(name)`,
    )
    .single()
  if (error) throw error
  return data
}
