import { supabase } from '@/lib/supabaseClient'

// Helper: find status_id by name if a name is provided
const resolveStatusId = async (status) => {
  if (!status) return null
  // if already looks like an id (uuid) return as-is
  if (typeof status === 'string' && status.match(/^[0-9a-fA-F-]{36,}$/)) return status
  // otherwise assume it's a name and query supplier_status
  const { data, error } = await supabase
    .from('supplier_status')
    .select('id')
    .eq('name', status)
    .maybeSingle()
  if (error) throw error
  return data?.id || null
}

export const getAllSuppliers = async () => {
  // select core columns and join status name, include created_at
  const { data, error } = await supabase
    .from('supplier')
    .select(
      `id, name, phone, email, address, notes, deleted_at, created_at, status:status_id(name)`,
    )
    .is('deleted_at', null)
  if (error) throw error
  return data
}

export const getSupplierById = async (id) => {
  const { data, error } = await supabase
    .from('supplier')
    .select(
      `id, name, phone, email, address, notes, deleted_at, created_at, status:status_id(name)`,
    )
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  if (error) throw error
  return data
}

export const createSupplier = async (supplier) => {
  const payload = {
    name: supplier.name,
    phone: supplier.phone || null,
    email: supplier.email || null,
    address: supplier.address || null,
    notes: supplier.notes || null,
  }
  // resolve status name -> status_id if necessary
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
