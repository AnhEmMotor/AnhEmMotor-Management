import * as api from '@/api/input'

const state = {
  inputs: [],
  totalCount: 0,
  isLoading: false,
  error: null,
}

const mutations = {
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  SET_INPUTS(state, { data, totalCount }) {
    state.inputs = data
    state.totalCount = totalCount
  },
  ADD_INPUT(state, input) {
    state.inputs.unshift(input)
    state.totalCount++
  },
  UPDATE_INPUT(state, updatedInput) {
    const index = state.inputs.findIndex((i) => i.id === updatedInput.id)
    if (index !== -1) {
      state.inputs.splice(index, 1, updatedInput)
    }
  },
}

const actions = {
  async fetchInputs({ commit }, { page, itemsPerPage, statusFilters, search }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const result = await api.fetchInputs({
        page,
        itemsPerPage,
        statusFilters,
        search,
      })
      commit('SET_INPUTS', { data: result.data, totalCount: result.totalCount })
    } catch (error) {
      commit('SET_ERROR', error.message)
      console.error(error)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async saveReceipt({ commit }, { receiptData, isEditMode, status_id }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
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

      if (isEditMode) {
        commit('UPDATE_INPUT', savedReceipt)
      } else {
        commit('ADD_INPUT', savedReceipt)
      }
      return savedReceipt
    } catch (error) {
      commit('SET_ERROR', error.message)
      console.error(error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async cancelReceipt({ commit }, { id }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const data = await api.updateInputStatus(id, 'cancelled')
      const updatedInput = state.inputs.find((i) => i.id === data.id)
      if (updatedInput) {
        updatedInput.status = data.input_status.name
        commit('UPDATE_INPUT', { ...updatedInput })
      }
    } catch (error) {
      commit('SET_ERROR', error.message)
      console.error(error)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async saveNotes({ commit }, { id, notes }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const { data, error } = await api.updateInput(id, { notes: notes })
      if (error) throw error
      commit('UPDATE_INPUT', data)
    } catch (error) {
      commit('SET_ERROR', error.message)
      console.error(error)
    } finally {
      commit('SET_LOADING', false)
    }
  },
}

const getters = {
  allInputs: (state) => state.inputs,
  totalCount: (state) => state.totalCount,
  isLoading: (state) => state.isLoading,
  error: (state) => state.error,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
