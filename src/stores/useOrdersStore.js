import {
  fetchSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
  updateSalesOrderStatus,
  fetchOutputStatuses,
} from '@/api/order';
import { defineStore } from 'pinia';

export const useOrdersStore = defineStore('orders', {
  actions: {
    async fetchOrders(params) {
      return await fetchSalesOrders(params);
    },

    async getOrderById(id) {
      return await getSalesOrderById(id);
    },

    async createOrder(payload) {
      return await createSalesOrder(payload);
    },

    async updateOrder(id, payload) {
      return await updateSalesOrder(id, payload);
    },

    async deleteOrder(id) {
      return await deleteSalesOrder(id);
    },

    async updateOrderStatus(id, statusId) {
      return await updateSalesOrderStatus(id, statusId);
    },

    async fetchOutputStatuses() {
      return await fetchOutputStatuses();
    },
  },
});
