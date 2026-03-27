import axiosInstance from '@/api/axios'
import { INPUT_ENDPOINTS } from '@/constants/endpoints/input.endpoint'

const inputService = {
  async fetchInventoryReceipts(params) {
    const { data } = await axiosInstance.get(INPUT_ENDPOINTS.BASE, { params })
    return data
  },

  async getInventoryReceiptById(id) {
    const { data } = await axiosInstance.get(INPUT_ENDPOINTS.BY_ID(id))
    return data
  },

  async createInventoryReceipt(payload) {
    const { data } = await axiosInstance.post(INPUT_ENDPOINTS.BASE, payload)
    return data
  },

  async updateInventoryReceipt(id, payload) {
    const { data } = await axiosInstance.put(INPUT_ENDPOINTS.BY_ID(id), payload)
    return data
  },

  async deleteInventoryReceipt(id) {
    await axiosInstance.delete(INPUT_ENDPOINTS.BY_ID(id))
  },

  async updateInventoryReceiptStatus(id, statusId) {
    const { data } = await axiosInstance.patch(INPUT_ENDPOINTS.STATUS(id), { statusId })
    return data
  },

  async cloneInventoryReceipt(id) {
    const { data } = await axiosInstance.post(INPUT_ENDPOINTS.CLONE(id))
    return data
  },

  async updateInventoryReceiptNotes(id, notes) {
    const { data } = await axiosInstance.patch(INPUT_ENDPOINTS.NOTES(id), { notes })
    return data
  },

  async fetchInputStatuses() {
    const { data } = await axiosInstance.get(INPUT_ENDPOINTS.STATUS_OPTIONS)
    return data
  },
}

export default inputService
