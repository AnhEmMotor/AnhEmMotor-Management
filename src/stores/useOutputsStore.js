import { defineStore } from 'pinia'
import * as outputApi from '@/api/output'

export const useOutputsStore = defineStore('outputs', {
  state: () => ({
    outputs: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    allOutputs: (state) => state.outputs,
    outputById: (state) => (id) => state.outputs.find((o) => o.id === id),
  },

  actions: {
    async fetchOutputs() {
      this.isLoading = true
      this.error = null
      try {
        const outputs = await outputApi.getAllOutputs()
        this.outputs = outputs
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async addOutput(output) {
      this.isLoading = true
      this.error = null
      try {
        const newOutput = await outputApi.createOutput(output)
        this.outputs.push(newOutput)
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async updateOutput({ id, output }) {
      this.isLoading = true
      this.error = null
      try {
        const updatedOutput = await outputApi.updateOutput(id, output)
        const index = this.outputs.findIndex((o) => o.id === updatedOutput.id)
        if (index !== -1) {
          this.outputs.splice(index, 1, updatedOutput)
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async deleteOutput(id) {
      this.isLoading = true
      this.error = null
      try {
        await outputApi.deleteOutput(id)
        this.outputs = this.outputs.filter((o) => o.id !== id)
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },
  },
})
