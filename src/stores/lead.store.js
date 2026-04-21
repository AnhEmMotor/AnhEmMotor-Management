import { defineStore } from 'pinia'
import axios from '@infrastructure/api/axios'

export const useLeadStore = defineStore('lead', {
  actions: {
    async fetchLeads() {
      const res = await axios.get('/api/v1/Lead')
      return res.data
    },
  },
})
