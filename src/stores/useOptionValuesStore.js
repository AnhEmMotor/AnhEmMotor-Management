import { defineStore } from 'pinia'
import * as optionValuesApi from '@/api/optionValues'

export const useOptionValuesStore = defineStore('optionValues', {
  state: () => ({
    optionValues: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    allOptionValues: (state) => state.optionValues,
    optionValuesByOptionId: (state) => (optionId) => {
      return state.optionValues.filter((v) => v.option_id === optionId)
    },
  },

  actions: {
    async fetchOptionValues() {
      this.isLoading = true
      this.error = null
      try {
        const values = await optionValuesApi.getAllOptionValues()
        this.optionValues = values
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async fetchValuesByOptionId(optionId) {
      this.isLoading = true
      this.error = null
      try {
        const values = await optionValuesApi.getOptionValuesByOptionId(optionId)
        this.optionValues = values
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async addOptionValue(value) {
      this.isLoading = true
      this.error = null
      try {
        const newValue = await optionValuesApi.createOptionValue(value)
        this.optionValues.push(newValue)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateOptionValue({ id, value }) {
      this.isLoading = true
      this.error = null
      try {
        const updatedValue = await optionValuesApi.updateOptionValue(id, value)
        const index = this.optionValues.findIndex((v) => v.id === updatedValue.id)
        if (index !== -1) {
          this.optionValues.splice(index, 1, updatedValue)
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteOptionValue(id) {
      this.isLoading = true
      this.error = null
      try {
        await optionValuesApi.deleteOptionValue(id)
        this.optionValues = this.optionValues.filter((v) => v.id !== id)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
})
