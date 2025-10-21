import * as supplierApi from '@/api/supplier'
import * as inputApi from '@/api/input'
import * as inputInfoApi from '@/api/inputInfo'

const state = {
  suppliers: [],
  isLoading: false,
  error: null,
}

const mutations = {
  SET_SUPPLIERS(state, suppliers) {
    state.suppliers = suppliers
  },
  ADD_SUPPLIER(state, supplier) {
    state.suppliers.push(supplier)
  },
  UPDATE_SUPPLIER(state, updatedSupplier) {
    const index = state.suppliers.findIndex((s) => s.id === updatedSupplier.id)
    if (index !== -1) {
      state.suppliers.splice(index, 1, updatedSupplier)
    }
  },
  DELETE_SUPPLIER(state, id) {
    state.suppliers = state.suppliers.filter((s) => s.id !== id)
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
}

const actions = {
  async fetchSuppliers({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      // fetch suppliers and related inputs to calculate totalPurchase
      const [suppliers, inputs, inputInfos] = await Promise.all([
        supplierApi.getAllSuppliers(),
        inputApi.getAllInputs(),
        inputInfoApi.getAllInputInfos(),
      ])

      // build a map of input_info entries by input_id
      const inputInfoByInput = {}
      inputInfos.forEach((info) => {
        const inputId = info.input_id || info.input?.id
        if (!inputId) return
        if (!inputInfoByInput[inputId]) inputInfoByInput[inputId] = []
        inputInfoByInput[inputId].push(info)
      })

      // compute totalPurchase per supplier: for each input where input_status.name === 'Đã hoàn thành'
      const totalBySupplier = {}
      inputs.forEach((input) => {
        const supplierId = input.supplier_id || input.supplier?.id
        const statusName = input.input_status?.name || input['input_status']?.name
        if (!supplierId) return
        if (statusName !== 'Đã hoàn thành') return
        const infos = inputInfoByInput[input.id] || []
        // sum qty * input_price (fields from input_info: count, input_price)
        const sum = infos.reduce((acc, info) => {
          const count = Number(info.count || info['count'] || 0)
          const price = Number(info.input_price || info['input_price'] || 0)
          return acc + count * price
        }, 0)
        totalBySupplier[supplierId] = (totalBySupplier[supplierId] || 0) + sum
      })

      // attach totalPurchase and normalize status (status.name -> status)
      const normalized = suppliers.map((s) => ({
        id: s.id,
        name: s.name,
        phone: s.phone || null,
        email: s.email || null,
        address: s.address || null,
        notes: s.notes || null,
        // the supplier API returns status as nested object: status: { name }
        status: s.status?.name || s.status || 'active',
        deleted_at: s.deleted_at || null,
        creationDate: s.created_at || null,
        totalPurchase: totalBySupplier[s.id] || 0,
      }))

      commit('SET_SUPPLIERS', normalized)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async addSupplier({ commit }, supplier) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const newSupplier = await supplierApi.createSupplier(supplier)
      commit('ADD_SUPPLIER', newSupplier)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async updateSupplier({ commit }, { id, supplier }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const updatedSupplier = await supplierApi.updateSupplier(id, supplier)
      commit('UPDATE_SUPPLIER', updatedSupplier)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async deleteSupplier({ commit }, id) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      // supplierApi.deleteSupplier now performs a soft-delete (sets deleted_at)
      const updated = await supplierApi.deleteSupplier(id)
      // reflect change in state: replace the supplier entry with updated row
      commit('UPDATE_SUPPLIER', updated)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async restoreSupplier({ commit }, id) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const restored = await supplierApi.restoreSupplier(id)
      commit('UPDATE_SUPPLIER', restored)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
}

const getters = {
  allSuppliers: (state) => state.suppliers,
  supplierById: (state) => (id) => state.suppliers.find((s) => s.id === id),
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
