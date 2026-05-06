import { defineStore } from 'pinia'
import axios from '@infrastructure/api/axios'

export const useVehicleStore = defineStore('vehicle', {
  state: () => ({
    vehicles: [],
    loading: false
  }),
  actions: {
    async fetchVehicles(search = '') {
      this.loading = true
      try {
        const res = await axios.get('/api/v1/Vehicle', { params: { search } })
        this.vehicles = res.data
        return res.data
      } finally {
        this.loading = false
      }
    }
  }
})

