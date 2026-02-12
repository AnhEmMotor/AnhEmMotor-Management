import { defineStore } from 'pinia'
import * as api from '@/api/input'

export const useInputsStore = defineStore('inputs', {
  actions: {
    async fetchInputs({ page, itemsPerPage, statusFilters, search }) {
      const result = await api.fetchInputs({
        page,
        itemsPerPage,
        statusFilters,
        search,
      })

      return { inputs: result.data, count: result.totalCount }
    },

    async saveReceipt({ receiptData, isEditMode, status_id }) {
      const now = new Date().toISOString()
      const payload = {
        id: isEditMode ? receiptData.id : null,
        supplier: receiptData.supplier,
        products: receiptData.products,
        notes: receiptData.notes,
        status_id: status_id,
        user_name: 'Người dùng Hiện tại',
        import_date: status_id === 'finished' ? now : receiptData.importDate || now,
        paid:
          status_id === 'finished'
            ? receiptData.products.reduce(
                (sum, p) => sum + (Number(p.quantity) || 0) * (Number(p.unitPrice) || 0),
                0,
              )
            : 0,
      }

      const savedReceipt = await api.saveReceipt(payload)
      return savedReceipt
    },

    async cancelReceipt({ id }) {
      const data = await api.updateInputStatus(id, 'cancelled')
      return data
    },

    async saveNotes({ id, notes }) {
      const { data, error } = await api.updateInput(id, { notes: notes })
      if (error) throw error
      return data
    },

    async fetchInputsBySupplier(supplierId, { page, limit, statusFilters, search }) {
      return { inputs: [], count: 0 }
    },
  },
})
