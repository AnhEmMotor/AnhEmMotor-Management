import axiosInstance from '@/api/axios'
import { SALES_ORDER_ENDPOINTS } from '@/constants/endpoints/order'

const orderService = {
  async fetchOrders(params) {
    const { data } = await axiosInstance.get(SALES_ORDER_ENDPOINTS.BASE, { params })
    return data
  },

  async getOrderById(id) {
    const { data } = await axiosInstance.get(SALES_ORDER_ENDPOINTS.BY_ID(id))
    return data
  },

  async createOrder(payload) {
    const { data } = await axiosInstance.post(SALES_ORDER_ENDPOINTS.BY_MANAGER, payload)
    return data
  },

  async updateOrder(id, payload) {
    const { data } = await axiosInstance.put(SALES_ORDER_ENDPOINTS.FOR_MANAGER(id), payload)
    return data
  },

  async deleteOrder(id) {
    await axiosInstance.delete(SALES_ORDER_ENDPOINTS.BY_ID(id))
  },

  async updateStatus(id, statusId) {
    const { data } = await axiosInstance.patch(SALES_ORDER_ENDPOINTS.STATUS(id), { statusId })
    return data
  },

  async fetchStatuses() {
    const { data } = await axiosInstance.get(SALES_ORDER_ENDPOINTS.STATUS_LIST)
    return data
  },

  async fetchStatusMap() {
    const { data } = await axiosInstance.get(SALES_ORDER_ENDPOINTS.STATUS_MAP)
    return data
  },

  async fetchTransitionMap() {
    const { data } = await axiosInstance.get(SALES_ORDER_ENDPOINTS.TRANSITION_MAP)
    return data
  },

  async fetchLockedStatuses() {
    const { data } = await axiosInstance.get(SALES_ORDER_ENDPOINTS.LOCKED_STATUSES)
    return data
  },
}

export default orderService
