import * as api from '@/api/input'

const actions = {
  async fetchInputs(_, { page, itemsPerPage, statusFilters, search }) {
    try {
      const result = await api.fetchInputs({
        page,
        itemsPerPage,
        statusFilters,
        search,
      })

      return { inputs: result.data, count: result.totalCount }
    } catch (error) {
      console.error('Lỗi khi fetchInputs:', error)
      throw error
    }
  },

  async saveReceipt(_, { receiptData, isEditMode, status_id }) {
    try {
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
    } catch (error) {
      console.error('Lỗi khi saveReceipt:', error)
      throw error
    }
  },

  async cancelReceipt(_, { id }) {
    try {
      const data = await api.updateInputStatus(id, 'cancelled')
      return data
    } catch (error) {
      console.error('Lỗi khi cancelReceipt:', error)
      throw error
    }
  },

  async saveNotes(_, { id, notes }) {
    try {
      const { data, error } = await api.updateInput(id, { notes: notes })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Lỗi khi saveNotes:', error)
      throw error
    }
  },
}

export default {
  namespaced: true,
  actions,
}
