import { defineStore } from 'pinia'
import * as optionsApi from '@/api/options'

export const useOptionsStore = defineStore('options', {
  state: () => ({
    options: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    allOptions: (state) => state.options,
    optionById: (state) => (id) => state.options.find((o) => o.id === id),
  },

  actions: {
    async fetchOptions() {
      this.isLoading = true
      this.error = null
      try {
        const options = await optionsApi.getAllOptions()
        this.options = options
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async addOption(option) {
      this.isLoading = true
      this.error = null
      try {
        const newOption = await optionsApi.createOption(option)
        this.options.push(newOption)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateOption({ id, option }) {
      this.isLoading = true
      this.error = null
      try {
        const updatedOption = await optionsApi.updateOption(id, option)
        const index = this.options.findIndex((o) => o.id === updatedOption.id)
        if (index !== -1) {
          this.options.splice(index, 1, updatedOption)
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteOption(id) {
      this.isLoading = true
      this.error = null
      try {
        await optionsApi.deleteOption(id)
        this.options = this.options.filter((o) => o.id !== id)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
})
