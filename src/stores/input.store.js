import { defineStore } from 'pinia'
import { ref } from 'vue'
import inputService from '@/services/input.service'
import supplierService from '@/services/supplier.service'
import productService from '@/services/product.service'
import { inputMapper } from '@/mappers/input.mapper'
import { supplierMapper } from '@/mappers/supplier.mapper'

export const useInputStore = defineStore('input', () => {
  const error = ref(null)

  const fetchInputs = async (query) => {
    error.value = null
    try {
      const params = inputMapper.toParams(query)
      const data = await inputService.fetchInventoryReceipts(params)
      return {
        data: inputMapper.toList(data.items),
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

  const getInputById = async (id) => {
    error.value = null
    try {
      const data = await inputService.getInventoryReceiptById(id)
      return inputMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const validateInput = (data) => {
    const errors = { supplier: '', products: {} }
    if (!data.supplier || !data.supplier.id) {
      errors.supplier = 'Vui lòng chọn nhà cung cấp'
    }
    if (!data.products || data.products.length === 0) {
      errors.products.__global = 'Vui lòng thêm ít nhất một sản phẩm'
      return errors
    }
    data.products.forEach((p) => {
      const per = {}
      if (Number(p.quantity) <= 0) per.quantity = 'Số lượng phải lớn hơn 0'
      if (Number(p.unitPrice) < 0) per.unitPrice = 'Đơn giá không được nhỏ hơn 0'
      if (Object.keys(per).length > 0) errors.products[p.id] = per
    })
    return errors
  }

  const saveInput = async (data, statusId, isEdit = false) => {
    error.value = null
    try {
      const payload = inputMapper.toDTO(data, statusId)
      let result
      if (isEdit && data.id) {
        result = await inputService.updateInventoryReceipt(data.id, payload)
      } else {
        result = await inputService.createInventoryReceipt(payload)
      }
      return inputMapper.toModel(result)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const deleteInput = async (id) => {
    error.value = null
    try {
      await inputService.deleteInventoryReceipt(id)
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateStatus = async (id, statusId) => {
    error.value = null
    try {
      const data = await inputService.updateInventoryReceiptStatus(id, statusId)
      return inputMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const cloneInput = async (id) => {
    error.value = null
    try {
      const data = await inputService.cloneInventoryReceipt(id)
      return inputMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateNotes = async (id, notes) => {
    error.value = null
    try {
      const data = await inputService.updateInventoryReceiptNotes(id, notes)
      return inputMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const fetchInputStatuses = async () => {
    error.value = null
    try {
      return await inputService.fetchInputStatuses()
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const searchSuppliers = async (params) => {
    return await supplierService.fetchSuppliers(
      supplierMapper.toParams({ ...params, status: 'active' }),
    )
  }

  const searchProducts = async (params) => {
    return await productService.fetchVariantsLiteForInput(params)
  }

  return {
    error,
    fetchInputs,
    getInputById,
    validateInput,
    saveInput,
    deleteInput,
    updateStatus,
    cloneInput,
    updateNotes,
    fetchInputStatuses,
    searchSuppliers,
    searchProducts,
  }
})
