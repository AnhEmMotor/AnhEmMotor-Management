import { defineStore } from 'pinia'
import axios from '@infrastructure/api/axios'

export const useLoyaltyStore = defineStore('loyalty', {
  state: () => ({
    members: [],
    loading: false
  }),
  actions: {
    async fetchMembers(search = '') {
      this.loading = true
      try {
        const res = await axios.get('/api/v1/Loyalty/members', { params: { search } })
        this.members = res.data
        return res.data
      } finally {
        this.loading = false
      }
    }
  }
})

