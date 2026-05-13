import { defineStore } from 'pinia'
import axios from '@infrastructure/api/axios'

export const useLeadStore = defineStore('lead', {
  state: () => ({
    pipeline: [],
    loading: false
  }),
  actions: {
    async fetchLeads() {
      const res = await axios.get('/api/v1/Lead')
      return res.data
    },
    async fetchPipeline() {
      this.loading = true
      try {
        const res = await axios.get('/api/v1/Lead/pipeline')
        this.pipeline = res.data
        return res.data
      } finally {
        this.loading = false
      }
    },
    async fetchLeadById(id) {
      const res = await axios.get(`/api/v1/Lead/${id}`)
      return res.data
    },
    async updateLead(lead) {
      const res = await axios.put(`/api/v1/Lead/${lead.id}`, lead)
      return res.data
    },
    async addActivity(leadId, activityData) {
      const res = await axios.post(`/api/v1/Lead/${leadId}/activities`, activityData)
      return res.data
    },
    async assignLead(leadId, userId) {
      const res = await axios.post(`/api/v1/Lead/${leadId}/assign`, userId, {
        headers: { 'Content-Type': 'application/json' }
      })
      return res.data
    },
    async resetLeads() {
      const res = await axios.delete('/api/v1/Lead/reset')
      return res.data
    }
  },
})
