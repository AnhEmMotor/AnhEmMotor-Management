// import { supabase } from '@/lib/supabaseClient'
// TODO: Refactor to use VITE_API_URL

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
    const { _total_count, ...rest } = s
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
    status_id: supplier.status || null,
  }
  const { data, error } = await supabase
    .from('supplier')
    .insert(payload)
    .select(`id, name, phone, email, address, notes, deleted_at, created_at`)
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
    status_id: supplier.status || null,
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

export const getSupplierById = async (id) => {
  if (!id) throw new Error('id is required')
  const { data, error } = await supabase
    .from('supplier')
    .select(`id, name, phone, email, address, notes`)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export const searchActiveSuppliers = async (search = '') => {
  const { data, error } = await supabase.rpc('search_active_suppliers', {
    p_search: search,
  })

  if (error) {
    console.error('Error fetching suppliers:', error)
    throw error
  }

  return data.map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
  }))
}
