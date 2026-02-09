import { defineStore } from 'pinia'
import * as supplierApi from '@/api/supplier'

export const useSuppliersStore = defineStore('suppliers', {
  state: () => ({
    suppliers: [],
    isLoading: false,
    error: null,
    totalCount: 0,
  }),

  getters: {
    allSuppliers: (state) => state.suppliers,
    supplierById: (state) => (id) => state.suppliers.find((s) => s.id === id),
  },

  actions: {
    async fetchSuppliers(payload) {
      const { page, itemsPerPage, statusFilters, search } = payload || {}
      this.isLoading = true
      this.error = null
      try {
        const { suppliers, count } = await supplierApi.fetchSuppliers(
          page,
          itemsPerPage,
          statusFilters,
          search,
        )
        this.suppliers = suppliers
        this.totalCount = count
        return { suppliers, count }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async addSupplier(supplier) {
      this.isLoading = true
      this.error = null
      try {
        supplier = { ...supplier, status: 'active' }
        const newSupplier = await supplierApi.createSupplier(supplier)
        this.suppliers.push(newSupplier)
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async updateSupplier({ id, supplier }) {
      this.isLoading = true
      this.error = null
      try {
        const updatedSupplier = await supplierApi.updateSupplier(id, supplier)
        const index = this.suppliers.findIndex((s) => s.id === updatedSupplier.id)
        if (index !== -1) {
          this.suppliers.splice(index, 1, updatedSupplier)
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async updateSupplierStatus({ id, status }) {
      this.isLoading = true
      this.error = null
      try {
        const updatedSupplier = await supplierApi.updateSupplier(id, { status })
        const index = this.suppliers.findIndex((s) => s.id === updatedSupplier.id)
        if (index !== -1) {
          this.suppliers.splice(index, 1, updatedSupplier)
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async deleteSupplier(id) {
      this.isLoading = true
      this.error = null
      try {
        const updated = await supplierApi.deleteSupplier(id)
        const index = this.suppliers.findIndex((s) => s.id === updated.id)
        if (index !== -1) {
          this.suppliers.splice(index, 1, updated)
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async restoreSupplier(id) {
      this.isLoading = true
      this.error = null
      try {
        const restored = await supplierApi.restoreSupplier(id)
        const index = this.suppliers.findIndex((s) => s.id === restored.id)
        if (index !== -1) {
          this.suppliers.splice(index, 1, restored)
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },
  },
})
