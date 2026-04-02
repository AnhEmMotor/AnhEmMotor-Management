import { defineStore } from 'pinia'
import { ref } from 'vue'
import supplierService from '@/services/supplier.service'
import { supplierMapper } from '@/mappers/supplier.mapper'

export const useSupplierStore = defineStore('supplier', () => {
  const error = ref(null)

  const fetchSuppliers = async (query) => {
    error.value = null
    try {
      const params = supplierMapper.toParams(query)
      const data = await supplierService.fetchSuppliers(params)
      return {
        data: supplierMapper.toList(data.items),
        pagination: {
          totalPages: data.totalPages,
          totalCount: data.totalCount,
        },
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const getSupplierById = async (id) => {
    error.value = null
    try {
      const data = await supplierService.getSupplierById(id)
      return supplierMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const createSupplier = async (supplierData) => {
    error.value = null
    try {
      const dto = supplierMapper.toDTO(supplierData)
      const data = await supplierService.createSupplier(dto)
      return supplierMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateSupplier = async (id, supplierData) => {
    error.value = null
    try {
      const dto = supplierMapper.toDTO(supplierData)
      const data = await supplierService.updateSupplier(id, dto)
      return supplierMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const deleteSupplier = async (id) => {
    error.value = null
    try {
      await supplierService.deleteSupplier(id)
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const toggleSupplierStatus = async (id, currentStatus) => {
    error.value = null
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      const data = await supplierService.updateSupplierStatus(id, newStatus)
      return supplierMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const fetchPurchaseHistory = async (id, query) => {
    error.value = null
    try {
      const params = {
        Page: query.page || 1,
        PageSize: query.limit || 10,
      }
      const data = await supplierService.fetchPurchaseHistory(id, params)
      return {
        data: data.items || [],
        pagination: {
          totalPages: data.totalPages,
          totalCount: data.totalCount,
        },
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    error,
    fetchSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    toggleSupplierStatus,
    fetchPurchaseHistory,
  }
})
