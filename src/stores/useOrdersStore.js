import { defineStore } from 'pinia'
import * as orderApi from '@/api/order'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    statuses: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    allStatuses: (state) => state.statuses,
    statusById: (state) => (id) => state.statuses.find((s) => s.id === id),
  },

  actions: {
    async fetchOrders(params) {
      this.isLoading = true
      this.error = null
      try {
        const data = await orderApi.fetchOrders(params)
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async saveOrder(payload) {
      this.isLoading = true
      this.error = null
      try {
        const savedOrder = await orderApi.saveOrder(payload)
        return savedOrder
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchProductVariants(params) {
      this.isLoading = true
      this.error = null
      try {
        const data = await orderApi.fetchProductVariants(params)
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchStatuses() {
      if (this.statuses.length > 0) return

      this.isLoading = true
      this.error = null
      try {
        const statuses = await orderApi.fetchOutputStatuses()
        this.statuses = statuses
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },
  },
})
