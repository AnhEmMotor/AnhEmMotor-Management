import axiosInstance from '@/api/axios'
import { SUPPLIER_ENDPOINTS } from '@/constants/endpoints/supplier'

const supplierService = {
  async fetchSuppliers(params) {
    const { data } = await axiosInstance.get(SUPPLIER_ENDPOINTS.BASE, { params })
    return data
  },

  async createSupplier(payload) {
    const { data } = await axiosInstance.post(SUPPLIER_ENDPOINTS.BASE, payload)
    return data
  },

  async updateSupplier(id, payload) {
    const { data } = await axiosInstance.put(SUPPLIER_ENDPOINTS.BY_ID(id), payload)
    return data
  },

  async deleteSupplier(id) {
    const { data } = await axiosInstance.delete(SUPPLIER_ENDPOINTS.BY_ID(id))
    return data
  },

  async updateSupplierStatus(id, statusId) {
    const { data } = await axiosInstance.patch(SUPPLIER_ENDPOINTS.STATUS(id), { statusId })
    return data
  },

  async getSupplierById(id) {
    const { data } = await axiosInstance.get(SUPPLIER_ENDPOINTS.BY_ID(id))
    return data
  },

  async fetchPurchaseHistory(id, params) {
    const { data } = await axiosInstance.get(SUPPLIER_ENDPOINTS.PURCHASE_HISTORY(id), { params })
    return data
  },
}

export default supplierService
